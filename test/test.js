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
    var obj = Object.defineProperty({}, 'prop', {configurable: true});
    expect(obj).to.has.property('prop');
    
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
            value: 123,
            writable: true
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
        },
        getter: {
            enumerable: true,
            get: function () {
                return this.number;
            }
        },
        setter: {
            enumerable: true,
            set: function (val) {
                this.number = val;
            }
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
        getter: 123,
        setter: undefined
    });

    // Setter and writable
    obj.setter = 321;
    expect(obj.number).to.be(321);

    // Unwritable
    obj.boolean = true;
    expect(obj.boolean).to.be(false);
});
// expect(fn).to.throwException(function (e) { // get the exception object
//     expect(e).to.be.a(SyntaxError);
// });


// Test `getOwnPropertyDescriptor`
describe('getOwnPropertyDescriptor', function () {
    var people = {
        name: 'Ambit-Tsai'
    };
    var desc = Object.getOwnPropertyDescriptor({}, 'name');
    // Element
    // VB 
    // JS 

    var desc = Object.getOwnPropertyDescriptor(people, 'name');
    expect(desc).to.be.eql({
        configurable: true,
        enumerable: true,
        value: 'Ambit-Tsai',
        writable: true
    });

    
    var desc = Object.getOwnPropertyDescriptor({}, 'a');
    expect(desc).to.be(undefined);
});


// Test `getOwnPropertyDescriptors`
describe('getOwnPropertyDescriptors', function () {
    var people = {
        name: 'Ambit-Tsai'
    };
    var desc = Object.getOwnPropertyDescriptors(people);
    expect(desc).to.be.eql({
        name: {
            configurable: true,
            enumerable: true,
            value: 'Ambit-Tsai',
            writable: true
        }
    });

    
    var desc = Object.getOwnPropertyDescriptors({});
    expect(desc).to.be.empty();
});
