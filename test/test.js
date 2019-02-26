/**
 * Creates a test block
 */
function describe(name, func) {
    var container = document.createElement('div');
    container.className = 'result';
    var el = document.createElement('span');
    el.className = 'name';
    el.innerText = name;
    container.appendChild(el);
    try {
        func();
    } catch(err) {
        console.error(err);
        el = document.createElement('span');
        el.innerText = err.message;
        container.appendChild(el);
        container.className += ' unexpected';
    }
    document.body.appendChild(container);
}


//
describe('Descriptor# configurable', function () {
    var obj = Object.defineProperty({}, 'prop', {
        configurable: true
    });
    obj = Object.defineProperty(obj, 'prop', {
        configurable: false,
        enumerable: true,
        value: 'Ambit-Tsai'
    });
    expect(obj).to.be.eql({prop: 'Ambit-Tsai'});
    
    expect(function () {
        Object.defineProperty(obj, 'prop', {value: ''});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


describe('Descriptor# value&writable', function () {
    var obj = Object.defineProperty({}, 'prop', {
        value: 'Ambit-Tsai',
        writable: true
    });
    obj.prop = '';
    expect(obj.prop).to.be('');
    
    obj = Object.defineProperty(obj, 'prop', {
        writable: false
    });
    obj.prop = 123;
    expect(obj.prop).to.be('');
});


describe('Descriptor# get&set', function () {
    var obj = Object.defineProperty({
        temp: null,
    }, 'prop', {
        get: function () {
            return this.temp;
        },
        set: function (val) {
            this.temp = val;
        }
    });
    obj.prop = '';
    expect(obj.prop).to.be('');
});


// Test `defineProperty# Basic support`
describe('defineProperty# Basic support', function () {
    var people = Object.defineProperty({
        name: 'Ambit-Tsai'
    }, 'walk', {
        enumerable: true,
        value: function () {}
    });
    expect(people.name).to.be('Ambit-Tsai');
    expect(people.walk).to.be.a('function');
});


// Test `defineProperty# Error`
describe('defineProperty# Error', function () {
    var people = Object.defineProperty({
        name: 'Ambit-Tsai'
    }, 'walk', {
        enumerable: true,
        value: function () {}
    });
    expect(people.name).to.be('Ambit-Tsai');
    expect(people.walk).to.be.a('function');
});


// Test `defineProperties# Basic support`
describe('defineProperties# Basic support', function () {
    var obj = Object.defineProperties({}, {
        number: {
            enumerable: true,
            value: 123
        },
        string: {
            enumerable: true,
            value: 'Ambit-Tsai'
        },
        boolean: {
            enumerable: true,
            value: false
        },
        undefined: {
            enumerable: true,
            value: undefined
        },
        'null': {
            enumerable: true,
            value: null
        },
        object: {
            enumerable: true,
            value: {}
        },
        array: {
            enumerable: true,
            value: []
        }
    });
    expect(obj).to.be.eql({
        number: 123,
        string: 'Ambit-Tsai',
        boolean: false,
        undefined: undefined,
        'null': null,
        object: {},
        array: [],
    });
    
    obj = Object.defineProperties(obj, {
        fn: {
            value: function () {}
        }
    });
    except(obj.fn).to.be.a('function');
});


// Test `getOwnPropertyDescriptor`
describe('getOwnPropertyDescriptor', function () {
    var desc = Object.getOwnPropertyDescriptor({}, 'a');
    expect(desc).to.be(undefined)
    
    var people = {name: 'Ambit-Tsai'};
    desc = Object.getOwnPropertyDescriptor(people, 'name');
    expect(desc).to.be.eql({
        configurable: true,
        enumerable: true,
        value: 'Ambit-Tsai',
        writable: true
    });
});


// Test `getOwnPropertyDescriptors`
describe('getOwnPropertyDescriptors', function () {
    var desc = Object.getOwnPropertyDescriptors({});
    expect(desc).to.be.empty();
    
    var people = {name: 'Ambit-Tsai'};
    desc = Object.getOwnPropertyDescriptors(people);
    expect(desc).to.be.eql({
        name: {
            configurable: true,
            enumerable: true,
            value: 'Ambit-Tsai',
            writable: true
        }
    });
});
