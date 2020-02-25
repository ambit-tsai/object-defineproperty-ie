/**
 * Object.defineProperty Sham For IE
 * @version 2.0.0
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
(function (window, Object) {
    // Constant variables
    var UNDEFINED;      // => undefined
    var DEFINE_PROPERTY = 'defineProperty';
    var DEFINE_PROPERTIES = 'defineProperties';
    var GET_OWN_PROPERTY_DESCRIPTOR = 'getOwnPropertyDescriptor';
    var GET_OWN_PROPERTY_DESCRIPTORS = GET_OWN_PROPERTY_DESCRIPTOR + 's';   // => getOwnPropertyDescriptors
    var ENUMERABLE = 'enumerable';
    var CONFIGURABLE = 'configurable';
    var VALUE = 'value';
    var WRITABLE = 'writable';
    var GET = 'get';
    var SET = 'set';


    // Sham for `defineProperty`
    if (Object[DEFINE_PROPERTY]) {
        try {
            // In IE 8, `Object.defineProperty` is only effective on `Element` object, 
            // `document` and `window`. The program will throw an exception when 
            // `Object.defineProperty` works with other objects.
            Object[DEFINE_PROPERTY]({}, '', {});
        } catch(err) {
            (function () {
                var defineProperty = Object[DEFINE_PROPERTY];
                Object[DEFINE_PROPERTIES] = function (obj, props) {
                    if (obj instanceof Element || obj === document || obj === window) {
                        // Use the native method for `Element` object, `document` and `window`
                        assertDescriptors(props);
                        forEach(props, function (key, desc) {
                            defineProperty(obj, key, desc);
                        });
                        return obj;
                    } else {
                        return implementDefineProperties(obj, props);
                    }
                };
                Object[DEFINE_PROPERTY] = function (obj, key, desc) {
                    var props = {};
                    props[key] = desc;
                    return Object[DEFINE_PROPERTIES](obj, props);
                };
            }());
        }
    } else {
        Object[DEFINE_PROPERTY] = function (obj, key, desc) {
            var props = {};
            props[key] = desc;
            return implementDefineProperties(obj, props);
        };
    }


    // Sham for `defineProperties`
    if (!Object[DEFINE_PROPERTIES]) {
        if (/\[native code\]/.test(Object[DEFINE_PROPERTY].toString())) {
            // Use the native method `Object.defineProperty`
            Object[DEFINE_PROPERTIES] = function (obj, props) {
                assertDescriptors(props);
                forEach(props, function (key, desc) {
                    Object[DEFINE_PROPERTY](obj, key, desc);
                });
                return obj;
            };
        } else {
            Object[DEFINE_PROPERTIES] = implementDefineProperties;
        }
    }


    // Sham for `getOwnPropertyDescriptor`
    if (!Object[GET_OWN_PROPERTY_DESCRIPTOR]) {
        Object[GET_OWN_PROPERTY_DESCRIPTOR] = implementGetOwnPropertyDescriptor;
    } else if (Object[GET_OWN_PROPERTY_DESCRIPTOR](window, CONFIGURABLE + CONFIGURABLE)) {
        // In IE 8, `Object.getOwnPropertyDescriptor` will not return an `undefined` when 
        // using it to get the descriptor of a property that do not exist, and it's only 
        // effective on `Element` object, `document` and `window`.
        (function () {
            var getOwnPropertyDescriptor = Object[GET_OWN_PROPERTY_DESCRIPTOR];
            Object[GET_OWN_PROPERTY_DESCRIPTOR] = function (obj, key) {
                if (obj instanceof Element || obj === document || obj === window) {
                    return hasOwnProperty(obj, key) ? getOwnPropertyDescriptor(obj, key) : UNDEFINED;
                } else {
                    return implementGetOwnPropertyDescriptor(obj, key);
                }
            };
        }());
    }


    // Shim for `getOwnPropertyDescriptors`
    if (!Object[GET_OWN_PROPERTY_DESCRIPTORS]) {
        Object[GET_OWN_PROPERTY_DESCRIPTORS] = function (obj) {
            var descriptors = {}, key, descriptor;
            for (key in obj) {
                descriptor = Object[GET_OWN_PROPERTY_DESCRIPTOR](obj, key);
                if (descriptor) descriptors[key] = descriptor;
            }
            return descriptors;
        };
    }





    /**
     * The internal storage space for VB object
     * @constructor
     * @param {object} obj 
     * @param {object} props 
     */
    function VbStorage(obj, props) {
        this.obj = obj;                 // original object
        this.props = props;             // descriptors
        this.keys = {};                 // the key map
        this.canGetStorage = false;     // a flag used to judge whether can get the storage object
        this.getterReturn = UNDEFINED;  // a variable that cache the getter return value
    }


    window._$VbStorage = VbStorage;      // exposed to global


    /**
     * @param {number} index
     * @returns {boolean}
     */
    VbStorage.prototype.getter = function (index) {
        if (this.canGetStorage) {
            this.getterReturn = this;
            this.canGetStorage = false;
            return true;
        }
        var key = this.keys[index];
        var desc = this.props[key];
        this.getterReturn = desc[GET] 
            ? desc[GET].call(this.obj)
            : desc[VALUE];
        return isObject(this.getterReturn);
    };


    /**
     * @param {number} index
     * @param {any} val
     */
    VbStorage.prototype.setter = function (index, val) {
        if (val === VbStorage) {
            this.canGetStorage = true;
            return;
        }
        var key = this.keys[index];
        var desc = this.props[key];
        if (desc[WRITABLE]) {
            desc[VALUE] = val;
        } else if (desc[SET]) {
            desc[SET].call(this.obj, val);
        }
    };


    /**
     * Check whether the `descriptors` is valid
     * @param {object.<string, object>} descriptors
     */
    function assertDescriptors(descriptors) {
        var ERROR_MESSAGE = 'Property description must be an object: ';
        if (!isObject(descriptors)) {
            throwTypeError(ERROR_MESSAGE + descriptors);
        }
        forEach(descriptors, function (key, desc) {
            if (!isObject(desc)) {
                throwTypeError(ERROR_MESSAGE + desc);
            }
        });
    }


    /**
     * Execute a provided function once for each property
     * @param {object} obj 
     * @param {function} fn 
     */
    function forEach(obj, fn) {
        for (var key in obj) {
            if (hasOwnProperty(obj, key)) {
                fn(key, obj[key]);
            }
        }
    }


    /**
     * Determine whether an object has a specified own property
     * @param {object} obj 
     * @param {string} key 
     * @returns {boolean}
     */
    function hasOwnProperty(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }


    /**
     * Check if value is the language type of Object
     * @param {any} value 
     * @returns {boolean}
     */
    function isObject(value) {
        return value && (typeof value === 'object' || typeof value === 'function');
    }


    /**
     * Throw a type error
     * @param {string} message 
     */
    function throwTypeError(message) {
        throw new TypeError(message);
    }


    /**
     * The internal implementation of `Object.defineProperties`
     * @param {object} obj 
     * @param {object} props 
     * @returns {object}
     */
    function implementDefineProperties(obj, props) {
        if (!isObject(obj)) {
            throwTypeError('Method called on non-object');
        }
        
        assertDescriptors(props);

        // Assign directly
        var descriptors = mergeDescriptors(Object[GET_OWN_PROPERTY_DESCRIPTORS](obj), props);
        if (canAssignDirectlyByJudgingDescriptors(descriptors)) {
            forEach(descriptors, function (key, desc) {
                obj[key] = desc[VALUE];
            });
            return obj;
        }

        return createVbObject(obj, descriptors);
    }


    /**
     * Check if the properties can be assign directly by judging descriptors
     * @param {object} descriptors 
     * @returns {boolean}
     */
    function canAssignDirectlyByJudgingDescriptors(descriptors) {
        for (var key in descriptors) {
            if (hasOwnProperty(descriptors, key)) {
                var desc = descriptors[key];
                if (GET in desc || SET in desc || !desc[WRITABLE] || !desc[CONFIGURABLE]) {
                    return false;
                }
            }
        }
        return true;
    }


    /**
     * Merge descriptors from source to target
     * @param {object} target 
     * @param {object} source 
     * @returns {object}
     */
    function mergeDescriptors(target, source) {
        forEach(source, function (key, sDesc) {
            var tDesc = target[key];
            if (!tDesc) {
                tDesc = target[key] = {};
            } else if (!tDesc[CONFIGURABLE]) {
                throwTypeError('Cannot redefine property: ' + key);
            }

            if (VALUE in sDesc || WRITABLE in sDesc) {
                if (GET in sDesc || SET in sDesc) {
                    throwTypeError('Cannot both specify accessors and a value or writable attribute');
                }
                tDesc[VALUE] = VALUE in sDesc ? sDesc[VALUE] : tDesc[VALUE];
                tDesc[WRITABLE] = !!(WRITABLE in sDesc ? sDesc[WRITABLE] : tDesc[WRITABLE]);
                delete tDesc[GET];
                delete tDesc[SET];
            } else if (GET in sDesc || SET in sDesc) {
                if (sDesc[GET] !== UNDEFINED && typeof sDesc[GET] !== 'function') {
                    throwTypeError('Getter must be a function: ' + sDesc[GET]);
                }
                if (sDesc[SET] !== UNDEFINED && typeof sDesc[SET] !== 'function') {
                    throwTypeError('Setter must be a function: ' + sDesc[SET]);
                }
                tDesc[GET] = GET in sDesc ? sDesc[GET] : tDesc[GET];
                tDesc[SET] = SET in sDesc ? sDesc[SET] : tDesc[SET];
                delete tDesc[VALUE];
                delete tDesc[WRITABLE];
            } else if (!(GET in tDesc)) {
                tDesc[VALUE] = UNDEFINED;
                tDesc[WRITABLE] = false;
            }
            tDesc[ENUMERABLE] = !!(ENUMERABLE in sDesc ? sDesc[ENUMERABLE] : tDesc[ENUMERABLE]);
            tDesc[CONFIGURABLE] = !!(CONFIGURABLE in sDesc ? sDesc[CONFIGURABLE] : tDesc[CONFIGURABLE]);
        });
        return target;
    }


    /**
     * VB object factory
     * @param {object} obj original object
     * @param {object} descriptors 
     * @returns {object} VB object 
     */
    function createVbObject(obj, descriptors) {
        // Generate VB script
        var uid = window.setTimeout(Object);    // generate an unique id
        var buffer = [
            'Class VbClass' + uid,
            '  Private [__vb__]'                // private property to cache internal data
        ];
        var i = 0;
        var storage = new VbStorage(obj, descriptors);
        forEach(descriptors, function (key) {
            var prop = '[' + key + ']';
            var arg = key === 'val' ? 'v' : 'val';
            buffer.push(
                '  Public Property Get ' + prop,
                '    If [__vb__].getter(' + i + ') Then',
                '      Set ' + prop + ' = [__vb__].getterReturn',
                '    Else',
                '      ' + prop + ' = [__vb__].getterReturn',
                '    End If',
                '  End Property',
                '  Public Property Let ' + prop + '(' + arg + ')',
                '    [__vb__].setter ' + i + ', ' + arg,
                '  End Property',
                '  Public Property Set ' + prop + '(' + arg + ')'
            );
            if (i) {
                buffer.push(
                    '    [__vb__].setter ' + i + ', ' + arg
                );
            } else {
                // Initialize `__vb__` at index 0
                buffer.push(
                    '    If isEmpty([__vb__]) Then',
                    '      Set [__vb__] = ' + arg,
                    '    Else',
                    '      [__vb__].setter ' + i + ', ' + arg,
                    '    End If'
                );
            }
            buffer.push('  End Property');
            storage.keys[i++] = key;
        });
        buffer.push(
            'End Class',
            'Function VbFactory' + uid + '()',
            '  Set VbFactory' + uid + ' = New VbClass' + uid,
            'End Function'
        );
        
        window.execScript(buffer.join('\r\n'), 'VBS');  // execute the VB script
        var vbObj = window['VbFactory' + uid]();        // use the factory to create an object
        vbObj[ storage.keys[0] ] = storage;             // initialize property `__vb__`
        return vbObj;
    }


    /**
     * The internal implementation of `Object.getOwnPropertyDescriptor`
     * @param {object} obj 
     * @param {string} key 
     * @returns {object}
     */
    function implementGetOwnPropertyDescriptor(obj, key) {
        if (!hasOwnProperty(obj, key)) return;
        
        // VB object
        if (!('__vb__' in obj)) {
            try {
                obj.__vb__ = 0; // private VB property can't be assigned
                delete obj.__vb__;
            } catch(err) {
                obj[key] = VbStorage;
                var storage = obj[key];
                return assign({}, storage.props[key]);
            }
        }
        
        // In other case
        var desc = {};
        desc[ENUMERABLE] = true;
        desc[CONFIGURABLE] = true;
        desc[VALUE] = obj[key];
        desc[WRITABLE] = true;
        return desc;
    }
    
    
    /**
     * Merge properties from source to target
     * @param {object} target 
     * @param {object} source 
     * @returns {object}
     */
    function assign(target, source) {
        forEach(source, function (key, value) {
            target[key] = value;
        });
        return target;
    }
}(window, Object));
