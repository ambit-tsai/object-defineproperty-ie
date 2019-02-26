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

/********** Divider **********/

// defineProperty# basic support
describe('defineProperty# basic support', function () {
	var people = {name: 'Ambit-Tsai'};
    people = Object.defineProperty(people, 'sex', {
        enumerable: true,
        value: 'male'
    });
    expect(people).to.be.eql({
		name: 'Ambit-Tsai',
		sex: 'male'
	});
});


// defineProperties# common types of data
describe('defineProperties# common types of data', function () {
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
        array: []
    });
    
    obj = Object.defineProperties({}, {
        fn: {
            value: function () {}
        }
    });
    expect(obj.fn).to.be.a('function');
});


// Descriptor# configurable
describe('Descriptor# configurable', function () {
    var people = Object.defineProperty({}, 'name', {
        configurable: true
    });
    people = Object.defineProperty(people, 'name', {
        configurable: false,
        enumerable: true,
        value: 'Ambit-Tsai'
    });
    expect(people).to.be.eql({name: 'Ambit-Tsai'});
    
    expect(function () {
        Object.defineProperty(people, 'name', {value: ''});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


// Descriptor# value & writable
describe('Descriptor# value & writable', function () {
    var people = Object.defineProperty({}, 'name', {
        configurable: true,
        value: 'Ambit-Tsai',
        writable: true
    });
    people.name = '';
    expect(people.name).to.be('');
    
    people = Object.defineProperty(people, 'name', {
        writable: false
    });
    people.name = 123;
    expect(people.name).to.be('');
});


// Descriptor# get & set
describe('Descriptor# get & set', function () {
    var people = Object.defineProperty({
        _temp: null
    }, 'name', {
        get: function () {
            return this._temp;
        },
        set: function (val) {
            this._temp = val;
        }
    });
    people.name = 'Ambit-Tsai';
    expect(people.name).to.be('Ambit-Tsai');
    
    expect(function () {
        Object.defineProperty({}, 'prop', {get: null});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
    
    expect(function () {
        Object.defineProperty({}, 'prop', {set: 123});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


// Descriptor# specify both accessor and data descriptor
describe('Descriptor# specify both accessor and data descriptor', function () {
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
			writable: true,
			set: function () {}
		});
    }).to.throwException(function (ex) {
        expect(ex).to.be.a(TypeError);
    });
});


// getOwnPropertyDescriptor# basic support
describe('getOwnPropertyDescriptor# basic support', function () {
    var desc = Object.getOwnPropertyDescriptor({}, 'a');
    expect(desc).to.be(undefined);
    
    var people = {name: 'Ambit-Tsai'};
    desc = Object.getOwnPropertyDescriptor(people, 'name');
    expect(desc).to.be.eql({
        configurable: true,
        enumerable: true,
        value: 'Ambit-Tsai',
        writable: true
    });
});


// getOwnPropertyDescriptors# basic support
describe('getOwnPropertyDescriptors# basic support', function () {
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
