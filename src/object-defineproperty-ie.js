/**
 * Object.defineProperty Sham For IE
 * @version 1.1.2
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
(function (window, Object) {
    // Constant variables
    var UNDEFINED;
    var DEFINE_PROPERTY = 'defineProperty';
    var DEFINE_PROPERTIES = 'defineProperties';
    var GET_OWN_PROPERTY_DESCRIPTOR = 'getOwnPropertyDescriptor';
    var GET_OWN_PROPERTY_DESCRIPTORS = 'getOwnPropertyDescriptors';
    var CONFIGURABLE = 'configurable';
    var ENUMERABLE = 'enumerable';
    var VALUE = 'value';
    var WRITABLE = 'writable';
    var GET = 'get';
    var SET = 'set';


    if (!Object[DEFINE_PROPERTIES]) {
        // Global variable
        window.VB_cache = {};

        // Sham for `defineProperty` and `defineProperties`
        var defineProperty = Object[DEFINE_PROPERTY];
        Object[DEFINE_PROPERTIES] = function (obj, props) {
            if (defineProperty && obj instanceof Element) {
                // Use native method for `Element` object
                for (var prop in props) {
                    if (has(props, prop)) {
                        defineProperty(obj, prop, props[prop]);
                    }
                }
                return obj;
            } else {
                return createVbObject(obj, props);
            }
        };
        Object[DEFINE_PROPERTY] = function (obj, prop, desc) {
            var props = {};
            props[prop] = desc;
            return Object[DEFINE_PROPERTIES](obj, props);
        };

        // Sham for `getOwnPropertyDescriptor`
        var getOwnPropertyDescriptor = Object[GET_OWN_PROPERTY_DESCRIPTOR];
        Object[GET_OWN_PROPERTY_DESCRIPTOR] = function (obj, prop) {
            // Use native method for `Element` object
            if (getOwnPropertyDescriptor && obj instanceof Element) {
                return getOwnPropertyDescriptor(obj, prop);
            }
            // The cached VB object
            for (var uid in window.VB_cache) {
                if (window.VB_cache[uid].obj === obj) {
                    var desc = window.VB_cache[uid].desc[prop];
                    return desc && assign({}, desc);
                }
            }
            // Others
            return has(obj, prop) ? {
                configurable: true,
                enumerable: true,
                value: obj[prop],
                writable: true
            } : UNDEFINED;
        };
    }


    // Sham for `getOwnPropertyDescriptors`
    if (!Object[GET_OWN_PROPERTY_DESCRIPTORS]) {
        Object[GET_OWN_PROPERTY_DESCRIPTORS] = function (obj) {
            var descMap = {};
            for (var prop in obj) {
                var desc = Object[GET_OWN_PROPERTY_DESCRIPTOR](obj, prop);
                if (desc) descMap[prop] = desc;
            }
            return descMap;
        };
    }


    /**
     * Create a VB Object
     * @param {object} obj 
     * @param {object} props 
     * @returns {object} VB object
     */
    function createVbObject(obj, props) {
        // Collect descriptors
        var descMap = Object[GET_OWN_PROPERTY_DESCRIPTORS](obj);
        for (var prop in props) {
            if (has(props, prop)) {
                checkDescriptor(props[prop]);
                if (descMap[prop] && !descMap[prop][CONFIGURABLE]) {
                    throwTypeError('Cannot redefine property: ' + prop);
                }
                descMap[prop] = generateDescriptor(descMap[prop], props[prop]);
            }
        }

        var uid = window.setTimeout(function () {});    // generate an unique id
        var script = generateVbScript(descMap, uid);
        window.execScript(script, 'VBS');
        obj = window['VB_factory_' + uid]();            // call factory function to create object
        window.VB_cache[uid] = {                        // cache
            obj: obj,
            desc: descMap
        };
        return obj;
    }


    /**
     * Determine whether an object has a specified own property
     * @param {object} obj 
     * @param {string} prop 
     * @returns {boolean}
     */
    function has(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    /**
     * Check descriptor
     * @param {object} desc 
     */
    function checkDescriptor(desc) {
        if (!(desc instanceof Object)) {
            throwTypeError('Property description must be an object');
        }
        if ((VALUE in desc || WRITABLE in desc) && (GET in desc || SET in desc)) {
            throwTypeError('Cannot both specify accessors and a value or writable attribute');
        }
        if (GET in desc && typeof desc[GET] !== 'function' && desc[GET] !== UNDEFINED) {
            throwTypeError('Getter must be a function');
        }
        if (SET in desc && typeof desc[SET] !== 'function' && desc[SET] !== UNDEFINED) {
            throwTypeError('Setter must be a function');
        }
    }


    /**
     * Throw a type error
     * @param {string} message 
     */
    function throwTypeError(message) {
        throw new TypeError(message);
    }


    /**
     * Generate descriptor
     * @param {object} oldDesc 
     * @param {object} newDesc 
     * @returns {object} 
     */
    function generateDescriptor(oldDesc, newDesc) {
        var temp = {};
        if (oldDesc) {
            assign(temp, oldDesc);
            if (VALUE in newDesc || WRITABLE in newDesc) {
                delete temp[GET];
                delete temp[SET];
            } else if (GET in newDesc || SET in newDesc) {
                delete temp[VALUE];
                delete temp[WRITABLE];
            }
        }
        assign(temp, newDesc);

        var desc = {};
        desc[CONFIGURABLE] = !!temp[CONFIGURABLE];
        desc[ENUMERABLE] = !!temp[ENUMERABLE];
        if (GET in temp || SET in temp) {
            desc[GET] = temp[GET];
            desc[SET] = temp[SET];
        } else {
            desc[VALUE] = temp[VALUE];
            desc[WRITABLE] = !!temp[WRITABLE];
        }
        return desc;
    }


    /**
     * Merge object properties
     * @param {object} target 
     * @param {object} source 
     * @returns {object}
     */
    function assign(target, source) {
        for (var prop in source) {
            if (has(source, prop)) {
                target[prop] = source[prop];
            }
        }
        return target;
    }


    /**
     * Generate VB script
     * @param {object} descMap 
     * @param {number} uid
     * @returns {string} VB script 
     */
    function generateVbScript(descMap, uid) {
        var buffer = [
            'Class VB_Class_' + uid
        ];
        for (var prop in descMap) {
            var desc = descMap[prop];
            if (VALUE in desc) {
                if (desc[WRITABLE]) {
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        '    Dim [_' + prop + ']',
                        '    Set [_' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + ']',
                        '    On Error Resume Next',
                        '    Set [' + prop + '] = [_' + prop + '].value',
                        '    If Err.Number <> 0 Then',
                        '      [' + prop + '] = [_' + prop + '].value',
                        '    End If',
                        '    On Error Goto 0',
                        '  End Property',
                        '  Public Property Let [' + prop + '](val)',
                        '    Window.VB_cache.[' + uid + '].desc.[' + prop + '].value = val',
                        '  End Property',
                        '  Public Property Set [' + prop + '](val)',
                        '    Set Window.VB_cache.[' + uid + '].desc.[' + prop + '].value = val',
                        '  End Property'
                    );
                } else {
                    var str = '    ';
                    if (desc[VALUE] && (typeof desc[VALUE] === 'object' || typeof desc[VALUE] === 'function')) {
                        str += 'Set '; // use `Set` for object
                    }
                    str += '[' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + '].value';
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        str,
                        '  End Property',
                        '  Public Property Let [' + prop + '](v)', // define empty `setter` for avoiding errors
                        '  End Property',
                        '  Public Property Set [' + prop + '](v)',
                        '  End Property'
                    );
                }
            } else {
                if (desc[GET]) {
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        '    Dim [_' + prop + ']',
                        '    Set [_' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + '].get',
                        '    On Error Resume Next',
                        '    Set [' + prop + '] = [_' + prop + '].call(ME)',
                        '    If Err.Number <> 0 Then',
                        '      [' + prop + '] = [_' + prop + '].call(ME)',
                        '    End If',
                        '    On Error Goto 0',
                        '  End Property'
                    );
                } else {
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        '  End Property'
                    );
                }
                if (desc[SET]) {
                    buffer.push(
                        '  Public Property Let [' + prop + '](val)',
                        '    Call Window.VB_cache.[' + uid + '].desc.[' + prop + '].set.call(ME, val)',
                        '  End Property',
                        '  Public Property Set [' + prop + '](val)',
                        '    Call Window.VB_cache.[' + uid + '].desc.[' + prop + '].set.call(ME, val)',
                        '  End Property'
                    );
                } else {
                    buffer.push(
                        '  Public Property Let [' + prop + '](v)',
                        '  End Property',
                        '  Public Property Set [' + prop + '](v)',
                        '  End Property'
                    );
                }
            }
        }
        buffer.push(
            'End Class',
            'Function VB_factory_' + uid + '()',
            '  Set VB_factory_' + uid + ' = New VB_Class_' + uid,
            'End Function'
        );
        return buffer.join('\r\n');
    }
})(window, Object);
