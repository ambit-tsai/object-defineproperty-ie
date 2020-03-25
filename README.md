[简体中文](README.zh-CN.md) | English


# Object.defineProperty Sham For IE&nbsp;&nbsp;![Version](https://img.shields.io/npm/v/object-defineproperty-ie.svg)

A `Object.defineProperty` sham based on **VBScript** for IE. It also provides `Object.defineProperties`, `Object.getOwnPropertyDescriptor`, `Object.getOwnPropertyDescriptors`.


#### Notice
1. In IE8, program will use native method `defineProperty` or `getOwnPropertyDescriptor` for `Element` object, `doucment` and `window`
1. In other case, `defineProperty` will return a new VB object
1. For VB object, it will not create new VB object when modifying the existing descriptor
1. VB object can't add or delete properties freely
1. VB object doesn't have `[[Prototype]]` or `__proto__`
1. The property name of VB object can't contain special character `]`
1. The properties of VB object are enumerable, it's unaffected by descriptor `enumerable`


#### Installation
1. Use NPM: `npm install -S object-defineproperty-ie`
1. Download directly: <a href="src/object-defineproperty-ie.js" target="_blank">Development Version</a>, <a href="dist/object-defineproperty-ie.js" target="_blank">Production Version</a>


#### Usage
```html
<script src="path/to/object-defineproperty-ie.js" type="text/javascript"></script>
<script type="text/javascript">
    var temp;
    var obj = Object.defineProperties({}, {
        prop1: {
            enumerable: true,
            get: function () {
                return temp;
            },
            set: function (value) {
                temp = value;
            }
        },
        prop2: {
            enumerable: true,
            configurable: true,
            value: 'Hello World'
        },
    });
    obj.prop = 123;
    // obj => {
    //     prop1: 123,
    //     prop2: 'Hello World'
    // }

    Object.defineProperty(obj, 'prop2', {
        value: 'Ambit-Tsai'
    });
    // obj => {
    //     prop1: 123,
    //     prop2: 'Ambit-Tsai'
    // }

    var desc = Object.getOwnPropertyDescriptor(obj, 'prop2');
    // desc => {
    //     enumerable: true,
    //     configurable: true,
    //     writable: false,
    //     value: "Ambit-Tsai"
    // }
</script>
```


#### Testing
1. Access <a href="https://ambit-tsai.github.io/object-defineproperty-ie/" target="_blank">GitHub Page</a> online
1. Access `docs/index.html` locally
1. Tested in IE6, IE7, IE8


#### Contact Us
1. *WeChat*: ambit_tsai
1. *QQ Group*: 663286147
1. *E-mail*: ambit_tsai@qq.com


#### Reference
1. <a href="https://www.cnblogs.com/rubylouvre/p/3598133.html" target="_blank">迷你MVVM框架avalon在兼容旧式IE做的努力</a>
