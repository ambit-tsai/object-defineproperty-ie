/**
 * Object.defineProperty Sham For IE
 * @version 1.0.0
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
(function (Object) {
    if (Object.defineProperties) return;

    /**
     * Create a VB Object
     * @param {Object} obj 
     * @param {Object} props 
     * @returns {Object} VB object
     */
    function createVbObject(obj, props) {
        // Collect descriptors
        var descMap = {};
        for (var prop in props) {
            if (has(props, prop)) {
                checkDescriptor(props[prop]);
                descMap[prop] = props[prop];
            }
        }
        for (var prop in obj) {
            if (!(prop in descMap)) {
                descMap[prop] = {
                    configurable: true,
                    enumerable: true,
                    value: obj[prop],
                    writable: true
                };
            }
        }
        
        var uid = setTimeout(noop);   // generate an unique id
        var script = generateVbScript(descMap, uid);
        execScript(script, 'VBS');
        obj = window['VB_factory_'+uid](descMap);   // call factory function
        setInitialValue(obj, descMap);
        return obj;
    }

    /**
     * Determine whether an object has a specified own property
     * @param {Object} obj 
     * @param {String} prop 
     * @returns {Boolean}
     */
    function has(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    /**
     * Check descriptor
     * @param {Object} desc  
     */
    function checkDescriptor(desc) {
        if (!(desc instanceof Object)) {
            throw new TypeError('Property description must be an object');
        }
        if ((has(desc, 'value') || has(desc, 'writable')) && (has(desc, 'get') || has(desc, 'set'))) {
            throw new TypeError('Invalid property descriptor');
        }
        if (has(desc, 'get') && typeof desc.get !== 'function' && desc.get !== undefined) {
            throw new TypeError('Getter must be a function');
        }
        if (has(desc, 'set') && typeof desc.set !== 'function' && desc.set !== undefined) {
            throw new TypeError('Setter must be a function');
        }
    }

    /**
     * No operation
     */
    function noop() {}

    /**
     * Generate VB script
     * @param {Object} descMap 
     * @param {Number} uid
     * @returns {String} VB script 
     */
    function generateVbScript(descMap, uid) {
        var buffer = [
            'Dim VB_descMap_'+uid,
            'Class VB_Class_'+uid
        ];
        for (var prop in descMap) {
            var desc = descMap[prop];
            if (has(desc, 'value') || has(desc, 'writable')) {
                if (desc.writable) {
                    buffer.push('  Public ['+prop+']');
                } else {
                    var str = '    ';
                    if (desc.value instanceof Object) {
                        str += 'Set ';  // use `Set` for object
                    }
                    str += '['+prop+'] = Parent.VB_descMap_'+uid+'.['+prop+'].value';
                    buffer.push(
                        '  Public Property Get ['+prop+']',
                        str,
                        '  End Property',
                        '  Public Property Let ['+prop+'](val)',    // define empty `setter` for avoiding errors
                        '  End Property',
                        '  Public Property Set ['+prop+'](val)',
                        '  End Property'
                    );
                }
            } else if (has(desc, 'get') || has(desc, 'set')) {
                if (desc.get) {
                    buffer.push(
                        '  Public Property Get ['+prop+']',
                        '    On Error Resume Next',
                        '    Set ['+prop+'] = Parent.VB_descMap_'+uid+'.['+prop+'].get.call(ME)',
                        '    If Err.Number <> 0 Then',
                        '      ['+prop+'] = Parent.VB_descMap_'+uid+'.['+prop+'].get.call(ME)',
                        '    End If',
                        '    On Error Goto 0',
                        '  End Property'
                    );
                }
                if (desc.set) {
                    buffer.push(
                        '  Public Property Let ['+prop+'](val)',
                        '    Call Parent.VB_descMap_'+uid+'.['+prop+'].set.call(ME, val)',
                        '  End Property',
                        '  Public Property Set ['+prop+'](val)',
                        '    Call Parent.VB_descMap_'+uid+'.['+prop+'].set.call(ME, val)',
                        '  End Property'
                    );
                } else {
                    buffer.push(
                        '  Public Property Let ['+prop+'](val)',
                        '  End Property',
                        '  Public Property Set ['+prop+'](val)',
                        '  End Property'
                    );
                }
            } else {
                buffer.push('  Public ['+prop+']');
            }
        }
        buffer.push(
            'End Class',
            'Function VB_factory_'+uid+'(descMap)',
            '  Set VB_descMap_'+uid+' = descMap',
            '  Set VB_factory_'+uid+' = New VB_Class_'+uid,
            'End Function'
        );
        return buffer.join('\r\n');
    }

    /**
     * Set initial value
     * @param {Object} obj 
     * @param {Object} props 
     */
    function setInitialValue(obj, props) {
        for (var prop in props) {
            var desc = props[prop];
            if (desc.writable) {
                obj[prop] = desc.value;
            }
        }
    }

    // Compatibility
    var defineProperty = Object.defineProperty;
    Object.defineProperties = function (obj, props) {
        if (defineProperty && obj instanceof Element) {
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
})(Object);
