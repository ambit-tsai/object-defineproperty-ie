/**
 * Object.defineProperty Sham For IE
 * @version 2.0.0
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
(function (window, Object) {
    // Constant variables
    var UNDEFINED;  // => undefined
    var DEFINE_PROPERTY = 'defineProperty';
    var DEFINE_PROPERTIES = 'defineProperties';
    var GET_OWN_PROPERTY_DESCRIPTOR = 'getOwnPropertyDescriptor';
    var GET_OWN_PROPERTY_DESCRIPTORS = GET_OWN_PROPERTY_DESCRIPTOR + 's';   // => "getOwnPropertyDescriptors"
    var DESCRIPTOR_NOT_OBJECT = 'Property description must be an object: ';
    var VB_PROTOTYPE = '__VB_PROTOTYPE__';
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
            var _defineProperty = Object[DEFINE_PROPERTY];
            Object[DEFINE_PROPERTIES] = function (obj, props) {
                // Use the native method for `Element` object, `document` and `window`
                if (obj instanceof Element || obj === document || obj === window) {
                    if (!isObject(props)) {
                        throwTypeError(DESCRIPTOR_NOT_OBJECT + props);
                    }
                    forEach(props, function (key, desc) {
                        _defineProperty(obj, key, desc);
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
                if (!isObject(props)) {
                    throwTypeError(DESCRIPTOR_NOT_OBJECT + props);
                }
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
        var _getOwnPropertyDescriptor = Object[GET_OWN_PROPERTY_DESCRIPTOR];
        Object[GET_OWN_PROPERTY_DESCRIPTOR] = function (obj, key) {
            if (obj instanceof Element || obj === document || obj === window) {
                return hasOwnProperty(obj, key) ? _getOwnPropertyDescriptor(obj, key) : UNDEFINED;
            } else {
                return implementGetOwnPropertyDescriptor(obj, key);
            }
        };
    }


    // Shim for `getOwnPropertyDescriptors`
    if (!Object[GET_OWN_PROPERTY_DESCRIPTORS]) {
        Object[GET_OWN_PROPERTY_DESCRIPTORS] = function (obj) {
            var descriptors = {}, key, desc;
            for (key in obj) {
                desc = Object[GET_OWN_PROPERTY_DESCRIPTOR](obj, key);
                if (desc) descriptors[key] = desc;
            }
            return descriptors;
        };
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
     * Check if key is an own property of object
     * @param {object} obj 
     * @param {string} key 
     * @returns {boolean}
     */
    function hasOwnProperty(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }


    /**
     * The internal implementation of `Object.defineProperties`
     * @param {object} obj 
     * @param {object} props descriptor map
     * @returns {object}
     */
    function implementDefineProperties(obj, props) {
        if (!isObject(obj)) {
            throwTypeError('Method called on non-object');
        }
        if (!isObject(props)) {
            throwTypeError(DESCRIPTOR_NOT_OBJECT + props);
        }

        var isReactive, hasNewProperty, descMap = {};
        forEach(props, function (key, obj) {
            var desc = toPropertyDescriptor(obj);
            descMap[key] = desc;
            if (!isReactive && (
                GET in desc || SET in desc || !desc[WRITABLE] || !desc[CONFIGURABLE]
            )) {
                isReactive = true;
            }
            if (!hasOwnProperty(obj, key)) {
                hasNewProperty = true;
            }
        });

        if (isVbObject(obj)) {
            if (!hasNewProperty) {
                mergePropertyDescriptors(getVbPrototypeOf(obj).props, descMap);
                return obj;
            }
        } else if (!isReactive) {
            forEach(descMap, function (key, desc) {
                if (VALUE in desc) {
                    obj[key] = desc[VALUE];
                }
            });
            return obj;
        }
        
        props = Object[GET_OWN_PROPERTY_DESCRIPTORS](obj);
        mergePropertyDescriptors(props, descMap);
        return createVbObject(props);
    }


    /**
     * Convert to a standard descriptor
     * @param {object} obj
     * @returns {object}
     */
    function toPropertyDescriptor(obj) {
        if (!isObject(obj)) {
            throwTypeError(DESCRIPTOR_NOT_OBJECT + obj);
        }

        var desc = {};
        if (ENUMERABLE in obj) desc[ENUMERABLE] = !!obj[ENUMERABLE];
        if (CONFIGURABLE in obj) desc[CONFIGURABLE] = !!obj[CONFIGURABLE];
        if (VALUE in obj) desc[VALUE] = obj[VALUE];
        if (WRITABLE in obj) desc[WRITABLE] = !!obj[WRITABLE];
        if (GET in obj) {
            if (typeof obj[GET] !== 'function' && obj[GET] !== UNDEFINED) {
                throwTypeError('Getter must be a function: ' + obj[GET]);
            } else {
                desc[GET] = obj[GET];
            }
        }
        if (SET in obj) {
            if (typeof obj[SET] !== 'function' && obj[SET] !== UNDEFINED) {
                throwTypeError('Setter must be a function: ' + obj[SET]);
            } else {
                desc[SET] = obj[SET];
            }
        }
        if ((GET in desc || SET in desc) && (VALUE in desc || WRITABLE in desc)) {
            throwTypeError('Cannot both specify accessors and a value or writable attribute');
        }
        return desc;
    }


    /**
     * Check if object is the type of custom VB Object
     * @param {object} obj
     * @returns {boolean}
     */
    function isVbObject(obj) {
        if (!(VB_PROTOTYPE in obj)) {
            try {
                obj[VB_PROTOTYPE] = 0;  // private VB property can't be assigned
                delete obj[VB_PROTOTYPE];
            } catch(err) {
                return true;
            }
        }
        return false;
    }


    /**
     * Get the prototype of VB object
     * @param {object} vbObj 
     * @returns {object}
     */
    function getVbPrototypeOf(vbObj) {
        for (var key in vbObj) {
            vbObj[key] = VbPrototype;
            return vbObj[key];
        }
    }


    window._getVbPrototypeOf = getVbPrototypeOf;    // exposed to global


    /**
     * An internal slot
     * @constructor
     * @param {object} descriptors
     */
    function VbPrototype(descriptors) {
        this.props = descriptors;
        this.keyMap = {};
        this.canGetProto = UNDEFINED;   // a flag used to judge whether return prototype
        this.getterReturn = UNDEFINED;  // a variable that cache the getter return value
    }


    /**
     * @param {number} index
     * @returns {boolean}
     */
    VbPrototype.prototype.getter = function (index, ctx) {
        if (this.canGetProto === index) {
            this.getterReturn = this;
            this.canGetProto = UNDEFINED;
            return true;
        }
        var key = this.keyMap[index];
        var desc = this.props[key];
        this.getterReturn = desc[GET] 
            ? desc[GET].call(ctx)
            : desc[VALUE];
        return isObject(this.getterReturn);
    };


    /**
     * @param {number} index
     * @param {any} val
     */
    VbPrototype.prototype.setter = function (index, ctx, val) {
        // `VbPrototype` is used as a key to get prototype
        if (val === VbPrototype) {
            this.canGetProto = index;
            return;
        }
        var key = this.keyMap[index];
        var desc = this.props[key];
        if (desc[WRITABLE]) {
            desc[VALUE] = val;
        } else if (desc[SET]) {
            desc[SET].call(ctx, val);
        }
    };


    /**
     * Merge every descriptor of source into target
     * @param {object} target descriptor map
     * @param {object} source descriptor map
     */
    function mergePropertyDescriptors(target, source) {
        forEach(source, function (key, sDesc) {
            var tDesc = target[key];
            if (tDesc) {
                // Validate
                if (tDesc[CONFIGURABLE] === false && ((
                    VALUE in tDesc && (
                        sDesc[CONFIGURABLE] || GET in sDesc || SET in sDesc 
                        || (!tDesc[WRITABLE] && VALUE in sDesc && sDesc[VALUE] !== tDesc[VALUE])
                        || (!tDesc[WRITABLE] && sDesc[WRITABLE])
                        || (ENUMERABLE in sDesc && sDesc[ENUMERABLE] !== tDesc[ENUMERABLE]) 
                    )
                ) || (
                    GET in tDesc && (
                        sDesc[CONFIGURABLE] || VALUE in sDesc || WRITABLE in sDesc 
                        || (ENUMERABLE in sDesc && sDesc[ENUMERABLE] !== tDesc[ENUMERABLE])
                    )
                ))) {
                    throwTypeError('Cannot redefine property: ' + key);
                }
            } else {
                // Set default value
                tDesc = {};
                tDesc[VALUE] = UNDEFINED;
                tDesc[WRITABLE] = false;
                tDesc[ENUMERABLE] = false;
                tDesc[CONFIGURABLE] = false;
            }

            // Merge
            target[key] = sDesc;
            if (VALUE in sDesc || WRITABLE in sDesc) {
                if (!(VALUE in sDesc)) sDesc[VALUE] = tDesc[VALUE];
                if (!(WRITABLE in sDesc)) sDesc[WRITABLE] = tDesc[WRITABLE];
            } else if (GET in sDesc || SET in sDesc) {
                if (!(GET in sDesc)) sDesc[GET] = tDesc[GET];
                if (!(SET in sDesc)) sDesc[SET] = tDesc[SET];
            } else if (VALUE in tDesc) {
                sDesc[VALUE] = tDesc[VALUE];
                sDesc[WRITABLE] = tDesc[WRITABLE];
            } else {
                sDesc[GET] = tDesc[GET];
                sDesc[SET] = tDesc[SET];
            }
            if (!(ENUMERABLE in sDesc)) sDesc[ENUMERABLE] = tDesc[ENUMERABLE];
            if (!(CONFIGURABLE in sDesc)) sDesc[CONFIGURABLE] = tDesc[CONFIGURABLE];
        });
    }


    /**
     * VB object factory
     * @param {object} descriptors 
     * @returns {object} VB object 
     */
    function createVbObject(descriptors) {
        // Generate VB script
        var UID = window.setTimeout(Object);    // generate an unique id
        var PROTO = '[' + VB_PROTOTYPE + ']';   // => "[__VB_PROTOTYPE__]"
        var buffer = [
            'Class VbClass' + UID,
            '  Private ' + PROTO
        ];
        var i = 0;
        var proto = new VbPrototype(descriptors);
        forEach(descriptors, function (key) {
            var prop = '[' + key + ']';
            var arg = key === 'val' ? 'v' : 'val';
            buffer.push(
                '  Public Property Get ' + prop,
                '    If ' + PROTO + '.getter(' + i + ', ME) Then',
                '      Set ' + prop + ' = ' + PROTO + '.getterReturn',
                '    Else',
                '      ' + prop + ' = ' + PROTO + '.getterReturn',
                '    End If',
                '  End Property',
                '  Public Property Let ' + prop + '(' + arg + ')',
                '    ' + PROTO + '.setter ' + i + ', ME, ' + arg,
                '  End Property',
                '  Public Property Set ' + prop + '(' + arg + ')'
            );
            if (i) {
                buffer.push(
                    '    ' + PROTO + '.setter ' + i + ', ME, ' + arg
                );
            } else {
                // Initialize prototype at index 0
                buffer.push(
                    '    If isEmpty(' + PROTO + ') Then',
                    '      Set ' + PROTO + ' = ' + arg,
                    '    Else',
                    '      ' + PROTO + '.setter ' + i + ', ME, ' + arg,
                    '    End If'
                );
            }
            buffer.push('  End Property');
            proto.keyMap[i++] = key;
        });
        buffer.push(
            'End Class',
            'Function VbFactory' + UID + '()',
            '  Set VbFactory' + UID + ' = New VbClass' + UID,
            'End Function'
        );
        
        window.execScript(buffer.join('\r\n'), 'VBS');  // execute the VB script
        var vbObj = window['VbFactory' + UID]();        // use the factory to create an object
        vbObj[ proto.keyMap[0] ] = proto;               // initialize prototype
        return vbObj;
    }


    /**
     * The internal implementation of `Object.getOwnPropertyDescriptor`
     * @param {object} obj 
     * @param {string} key 
     * @returns {object}
     */
    function implementGetOwnPropertyDescriptor(obj, key) {
        if (!hasOwnProperty(obj, key)) {
            return;
        }
        
        // Custom VB object
        if (isVbObject(obj)) {
            return assign({}, getVbPrototypeOf(obj).props[key]);
        }
        
        // Others
        var desc = {};
        desc[VALUE] = obj[key];
        desc[WRITABLE] = true;
        desc[CONFIGURABLE] = true;
        desc[ENUMERABLE] = false;
        for (var prop in obj) {
            if (prop === key) {
                desc[ENUMERABLE] = true;
                break;
            }
        }
        return desc;
    }
    
    
    /**
     * Merge evary own property of source into target
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
