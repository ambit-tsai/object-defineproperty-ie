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


    var cacheMap = {};  // Cache the VB objects


    // Sham for `defineProperty`
    if (Object[DEFINE_PROPERTY]) {
        // In IE 8, `Object.defineProperty` 只对`Element`对象有效
        window.VbCache = cacheMap;
        try {
            Object[DEFINE_PROPERTY]({}, '', {});
        } catch(err) {
            (function () {
                var defineProperty = Object[DEFINE_PROPERTY];
                Object[DEFINE_PROPERTIES] = function (obj, props) {
                    if (obj instanceof Element || obj === document || obj === window) {
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
        window.VbCache = cacheMap;
        Object[DEFINE_PROPERTY] = function (obj, key, desc) {
            var props = {};
            props[key] = desc;
            return implementDefineProperties(obj, props);
        };
    }


    // Sham for `defineProperties`
    if (!Object[DEFINE_PROPERTIES]) {
        if (/\[native code\]/.test(Object[DEFINE_PROPERTY].toString())) {
            Object[DEFINE_PROPERTIES] = function (obj, props) {
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
        // In IE 8, 获取不存在的属性，不会返回undefined
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
     * implement `Object.defineProperties`
     * @param {object} obj 
     * @param {object} props 
     * @returns {object}
     */
    function implementDefineProperties(obj, props) {
        if (!isObject(obj)) {
            throwTypeError('Method called on non-object');
        }

        var descriptors = mergeDescriptors(Object[GET_OWN_PROPERTY_DESCRIPTOR](obj), props);
        if (canAssignDirectly(descriptors)) {
            forEach(descriptors, function (key, desc) {
                obj[key] = desc[VALUE];
            });
            return obj;
        }

        //
        var uid = window.setTimeout(Object);    // generate an unique id
        var script = generateVbScript(descriptors, uid);
        window.execScript(script, 'VBS');
        obj = window['VbFactory' + uid]();    // call factory function to create object
        cacheMap[uid] = {                // cache
            obj: obj,
            props: descriptors
        };
        return obj;
    }


    /**
     * 判断是否可以直接赋值
     * @param {object} descriptors 
     * @returns {boolean}
     */
    function canAssignDirectly(descriptors) {
        // 判断描述符，存在get set，writable configurable不为真
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
     * 合并描述符
     * @param {object} target 
     * @param {object} source 
     * @returns {object}
     */
    function mergeDescriptors(target, source) {
        forEach(source, function (key, sDesc) {
            if (!isObject(sDesc)) {
                throwTypeError('Property description must be an object');
            }

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
                    throwTypeError('Getter must be a function');
                }
                if (sDesc[SET] !== UNDEFINED && typeof sDesc[SET] !== 'function') {
                    throwTypeError('Setter must be a function');
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
     * Generate VB script
     * @param {object} descriptors 
     * @param {number} uid
     * @returns {string} VB script 
     */
    function generateVbScript(descriptors, uid) {
        var PUBLIC_PROPERTY = '  Public Property ';
        var END_PROPERTY = '  End Property';
        var buffer = [
            'Class VbClass' + uid
        ];

        for (var key in descriptors) {
            var prop = '[' + key + ']';
            var DECLARATION_GET = PUBLIC_PROPERTY + 'Get ' + prop;
            var DECLARATION_LET = PUBLIC_PROPERTY + 'Let ' + prop + '(val)';
            var DECLARATION_SET = PUBLIC_PROPERTY + 'Set ' + prop + '(val)';
            var DESCRIPTOR = 'Window.VbCache.[' + uid + '].props.' + prop;
            var desc = descriptors[key];
            if (VALUE in desc) {
                if (desc[WRITABLE]) {
                    buffer.push(
                        DECLARATION_GET,
                        '    If isObject(' + DESCRIPTOR + '.value) Then',
                        '      Set ' + prop + ' = ' + DESCRIPTOR + '.value',
                        '    Else',
                        '      ' + prop + ' = ' + DESCRIPTOR + '.value',
                        '    End If',
                        END_PROPERTY,
                        DECLARATION_LET,
                        '    ' + DESCRIPTOR + '.value = val',
                        END_PROPERTY,
                        DECLARATION_SET,
                        '    Set ' + DESCRIPTOR + '.value = val',
                        END_PROPERTY
                    );
                } else {
                    buffer.push(
                        DECLARATION_GET,
                        '    ' + (
                            isObject(desc[VALUE]) ? 'Set ' : ''     // use `Set` for object
                        ) + prop + ' = ' + DESCRIPTOR + '.value',
                        END_PROPERTY,
                        DECLARATION_LET,
                        END_PROPERTY,
                        DECLARATION_SET,
                        END_PROPERTY
                    );
                }
            } else {
                if (desc[GET]) {
                    buffer.push(
                        DECLARATION_GET,
                        '    On Error Resume Next',
                        '    Set ' + prop + ' = ' + DESCRIPTOR + '.get.call(ME)',
                        '    If Err.Number <> 0 Then',
                        '      ' + prop + ' = ' + DESCRIPTOR + '.get.call(ME)',
                        '    End If',
                        '    On Error Goto 0',
                        END_PROPERTY
                    );
                } else {
                    buffer.push(
                        DECLARATION_GET,
                        END_PROPERTY
                    );
                }
                if (desc[SET]) {
                    buffer.push(
                        DECLARATION_LET,
                        '    Call ' + DESCRIPTOR + '.set.call(ME, val)',
                        END_PROPERTY,
                        DECLARATION_SET,
                        '    Call ' + DESCRIPTOR + '.set.call(ME, val)',
                        END_PROPERTY
                    );
                } else {
                    buffer.push(
                        DECLARATION_LET,    // define empty `setter` for avoiding errors
                        END_PROPERTY,
                        DECLARATION_SET,
                        END_PROPERTY
                    );
                }
            }
        }

        buffer.push(
            'End Class',
            'Function VbFactory' + uid + '()',
            '  Set VbFactory' + uid + ' = New VbClass' + uid,
            'End Function'
        );
        return buffer.join('\r\n');
    }


    /**
     * implement `Object.getOwnPropertyDescriptor`
     * @param {object} obj 
     * @param {string} key 
     * @returns {object}
     */
    function implementGetOwnPropertyDescriptor(obj, key) {
        if (!hasOwnProperty(obj, key)) return;
        
        // for the cached VB object
        var desc;
        for (var uid in cacheMap) {
            if (hasOwnProperty(cacheMap, uid) && cacheMap[uid].obj === obj) {
                desc = cacheMap[uid].props[key];
                return desc && assign({}, desc);
            }
        }
        
        // in other case
        desc = {};
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
