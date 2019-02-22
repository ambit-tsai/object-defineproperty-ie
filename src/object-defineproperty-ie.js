/**
 * Object.defineProperty Sham For IE
 * @version 1.1.2
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
(function (window, Object, undefined) {
    if (!Object.defineProperties) {
        // Global variable
        window.VB_cache = {};

        // Sham for `defineProperty` and `defineProperties`
        var defineProperty = Object.defineProperty;
        Object.defineProperties = function (obj, props) {
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
        Object.defineProperty = function (obj, prop, desc) {
            var props = {};
            props[prop] = desc;
            return Object.defineProperties(obj, props);
        };

        // Sham for `getOwnPropertyDescriptor`
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        Object.getOwnPropertyDescriptor = function (obj, prop) {
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
            } : undefined;
        };
    }


    // Sham for `getOwnPropertyDescriptors`
    if (!Object.getOwnPropertyDescriptors) {
        Object.getOwnPropertyDescriptors = function (obj) {
            var descMap = {};
            for (var prop in obj) {
                var desc = Object.getOwnPropertyDescriptor(obj, prop);
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
        var descMap = Object.getOwnPropertyDescriptors(obj);
        for (var prop in props) {
            if (has(props, prop)) {
                var desc = props[prop];
                checkDescriptor(desc);
                if (has(descMap, prop)) {
                    assign(descMap[prop], desc);
                } else {
                    descMap[prop] = desc;
                }
                setDefaultDescriptor(descMap[prop]);
            }
        }

        var uid = window.setTimeout(function () {}); // generate an unique id
        var script = generateVbScript(descMap, uid);
        window.execScript(script, 'VBS');
        obj = window['VB_factory_' + uid](); // call factory function
        setInitialValue(obj, descMap);
        window.VB_cache[uid] = {    // cache
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
            throw new TypeError('Property description must be an object');
        }
        if (('value' in desc || 'writable' in desc) && ('get' in desc || 'set' in desc)) {
            throw new TypeError('Invalid property descriptor');
        }
        if ('get' in desc && typeof desc.get !== 'function' && desc.get !== undefined) {
            throw new TypeError('Getter must be a function');
        }
        if ('set' in desc && typeof desc.set !== 'function' && desc.set !== undefined) {
            throw new TypeError('Setter must be a function');
        }
    }


    /**
     * Set default descriptor
     * @param {object} desc
     */
    function setDefaultDescriptor(desc) {
        if ('value' in desc || 'writable' in desc) {
            if (!('value' in desc)) {
                desc.value = undefined;
            }
            desc.writable = !!desc.writable;
        } else if ('get' in desc || 'set' in desc) {
            desc.get = desc.get || undefined;
            desc.set = desc.set || undefined;
        } else {
            desc.value = undefined;
            desc.writable = false;
        }
        desc.configurable = !!desc.configurable;
        desc.enumerable = !!desc.enumerable;
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
            if ('value' in desc || 'writable' in desc) {
                if (desc.writable) {
                    buffer.push('  Public [' + prop + ']');
                } else {
                    var str = '    ';
                    if (desc.value && (typeof desc.value === 'object' || typeof desc.value === 'function')) {
                        str += 'Set '; // use `Set` for object
                    }
                    str += '[' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + '].value';
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        str,
                        '  End Property',
                        '  Public Property Let [' + prop + '](val)', // define empty `setter` for avoiding errors
                        '  End Property',
                        '  Public Property Set [' + prop + '](val)',
                        '  End Property'
                    );
                }
            } else if ('get' in desc || 'set' in desc) {
                if (desc.get) {
                    buffer.push(
                        '  Public Property Get [' + prop + ']',
                        '    On Error Resume Next',
                        '    Set [' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + '].get.call(ME)',
                        '    If Err.Number <> 0 Then',
                        '      [' + prop + '] = Window.VB_cache.[' + uid + '].desc.[' + prop + '].get.call(ME)',
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
                if (desc.set) {
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
                        '  Public Property Let [' + prop + '](val)',
                        '  End Property',
                        '  Public Property Set [' + prop + '](val)',
                        '  End Property'
                    );
                }
            } else {
                buffer.push('  Public [' + prop + ']');
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

    
    /**
     * Set initial value
     * @param {object} obj 
     * @param {object} props 
     */
    function setInitialValue(obj, props) {
        for (var prop in props) {
            if (props[prop].writable) {
                obj[prop] = props[prop].value;
            }
        }
    }
})(window, Object);
