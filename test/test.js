/**
 * Creates a test block
 * @param {string} name
 * @param {function} fn
 */
function describe(name, fn) {
    var container = document.getElementById('result');
    var el = document.createElement('li');
    el.className = 'result__item';
    var content = '<b>' + name + '</b>: ';
    try {
        fn();
        content += '<i>pass</i>';
    } catch(err) {
        if ('console' in window) {
            console.error(err);
        }
        el.className += ' unexpected';
        content += err.message;
    }
    el.innerHTML = content;
    container.appendChild(el);
}





describe('defineProperty - `value`', function () {
    var obj = Object.defineProperty({}, 'prop', {value: undefined});
    expect(obj.prop).to.be(undefined);

    var obj = Object.defineProperty({}, 'prop', {value: null});
    expect(obj.prop).to.be(null);

    var obj = Object.defineProperty({}, 'prop', {value: true});
    expect(obj.prop).to.be(true);

    var obj = Object.defineProperty({}, 'prop', {value: 123});
    expect(obj.prop).to.be(123);

    var obj = Object.defineProperty({}, 'prop', {value: 'Ambit-Tsai'});
    expect(obj.prop).to.be('Ambit-Tsai');

    var obj = Object.defineProperty({}, 'prop', {value: window});
    expect(obj.prop).to.be(window);

    var arr = [];
    var obj = Object.defineProperty({}, 'prop', {value: arr});
    expect(obj.prop).to.be(arr);

    var obj = Object.defineProperty({}, 'prop', {value: Function});
    expect(obj.prop).to.be(Function);
});


describe('defineProperty - `writable`', function () {
    var obj = Object.defineProperty({}, 'prop', {
        value: 123,
        writable: true
    });
    obj.prop = 456;
    expect(obj.prop).to.be(456);

    var obj = Object.defineProperty({}, 'prop', {
        value: 123,
        writable: false
    });
    obj.prop = 456;
    expect(obj.prop).to.be(123);

    var obj = Object.defineProperty({}, 'prop', {
        value: 123,
        writable: 'abc'
    });
    obj.prop = 456;
    expect(obj.prop).to.be(456);
});


describe('defineProperty - `get`', function () {
    var obj = Object.defineProperty({}, 'prop', {
        get: function () {
            return 123;
        }
    });
    expect(obj.prop).to.be(123);

    var obj = Object.defineProperty({}, 'prop', {
        get: undefined
    });
    expect(obj.prop).to.be(undefined);

    expect(function () {
        Object.defineProperty({}, 'prop', {get: 'non-object'});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('defineProperty - `set`', function () {
    var obj = Object.defineProperty({_val: 0}, 'prop', {
        get: function () {
            return this._val;
        },
        set: function (val) {
            this._val = val;
        }
    });
    obj.prop = 123;
    expect(obj.prop).to.be(123);

    var obj = Object.defineProperty({}, 'prop', {
        set: undefined
    });
    obj.prop = 123;
    expect(obj.prop).to.be(undefined);

    expect(function () {
        Object.defineProperty({}, 'prop', {set: 'non-object'});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('defineProperty - `configurable`', function () {
    var obj = Object.defineProperty({}, 'prop', {
        value: 123,
        configurable: true
    });
    obj = Object.defineProperty(obj, 'prop', {value: 456});
    expect(obj.prop).to.be(456);

    expect(function () {
        var obj = Object.defineProperty({}, 'prop', {
            value: 123,
            configurable: false
        });
        Object.defineProperty(obj, 'prop', {value: 456});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });

    var obj = Object.defineProperty({}, 'prop', {
        value: 123,
        configurable: 'abc'
    });
    obj = Object.defineProperty(obj, 'prop', {value: 456});
    expect(obj.prop).to.be(456);
});


describe('defineProperty - abnormal input', function () {
    expect(function () {
        Object.defineProperty('non-object', 'prop', {});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });

    expect(function () {
        Object.defineProperty({}, 'prop', 'non-object');
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });

    expect(function () {
        Object.defineProperty({}, 'prop', {
            value: 123,
            get: function () {}
        });
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });

    expect(function () {
        Object.defineProperty({}, 'prop', {
            value: 123,
            set: function () {}
        });
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('defineProperties - basic functions', function () {
    var obj = Object.defineProperties({}, {
        writable: {
            value: undefined,
            writable: true
        },
        unwritable: {
            value: null,
            writable: false
        },
        val: {
            get: function () {
                return this.writable;
            },
            set: function (val) {
                this.writable = val;
            }
        },
        configurable: {
            value: true,
            configurable: true
        },
        unconfigurable: {
            value: 123,
            configurable: false
        }
    });
    expect(obj.writable).to.be(undefined);
    expect(obj.unwritable).to.be(null);
    expect(obj.val).to.be(undefined);
    expect(obj.configurable).to.be(true);
    expect(obj.unconfigurable).to.be(123);

    obj.unwritable = 123;
    expect(obj.unwritable).to.be(null);

    obj.val = 'Ambit-Tsai';
    expect(obj.val).to.be('Ambit-Tsai');

    var obj = Object.defineProperty(obj, 'configurable', {value: window});
    expect(obj.configurable).to.be(window);

    expect(function () {
        Object.defineProperty(obj, 'unconfigurable', {value: 456});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('defineProperties - abnormal input', function () {
    expect(function () {
        Object.defineProperties('non-object', {});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });

    expect(function () {
        Object.defineProperties({}, 'non-object');
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
    
    expect(function () {
        Object.defineProperties({}, {prop: 'non-object'});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('getOwnPropertyDescriptor - basic functions', function () {
    var desc = Object.getOwnPropertyDescriptor({}, 'a');
    expect(desc).to.be(undefined);

    var obj = {prop: 123};
    desc = Object.getOwnPropertyDescriptor(obj, 'prop');
    expect(desc).to.be.eql({
        configurable: true,
        enumerable: true,
        value: 123,
        writable: true
    });

    var obj = Object.defineProperty({}, 'prop', {value: 456});
    desc = Object.getOwnPropertyDescriptor(obj, 'prop');
    expect(desc).to.be.eql({
        configurable: false,
        enumerable: false,
        value: 456,
        writable: false
    });

    var obj = Object.defineProperty({}, 'prop', {
        configurable: true,
        enumerable: true,
        value: 789
    });
    desc = Object.getOwnPropertyDescriptor(obj, 'prop');
    expect(desc).to.be.eql({
        configurable: true,
        enumerable: true,
        value: 789,
        writable: false
    });
});


describe('getOwnPropertyDescriptors - basic functions', function () {
    var desc = Object.getOwnPropertyDescriptors({});
    expect(desc).to.be.empty();

    var obj = {prop: 123};
    desc = Object.getOwnPropertyDescriptors(obj);
    expect(desc).to.be.eql({
        prop: {
            configurable: true,
            enumerable: true,
            value: 123,
            writable: true
        }
    });

    var obj = Object.defineProperty({}, 'prop', {value: 456});
    desc = Object.getOwnPropertyDescriptors(obj);
    expect(desc).to.be.eql({
        prop: {
            configurable: false,
            enumerable: false,
            value: 456,
            writable: false
        }
    });

    var obj = Object.defineProperty({}, 'prop', {
        configurable: true,
        enumerable: true,
        value: 789
    });
    desc = Object.getOwnPropertyDescriptors(obj);
    expect(desc).to.be.eql({
        prop: {
            configurable: true,
            enumerable: true,
            value: 789,
            writable: false
        }
    });
});
