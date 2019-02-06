<a href="README.zh-CN.md">简体中文</a> | English

# `Object.defineProperty` Sham For IE
A `Object.defineProperty` sham based on **VBScript** for IE.


#### Notice
1. Use native `Object.defineProperty` for `Element` object in IE8;
1. In other case, the method will return a new VB object;
1. VB object can not add and delete properties;


#### Installation
1. Use NPM: `npm install -S object-defineproperty-ie`
1. Download directly: <a href="src/object-defineproperty-ie.js" target="_blank">Development Version</a>, <a href="dist/object-defineproperty-ie.js" target="_blank">Production Version</a>


#### Usage
```html
<script src="path/to/object-defineproperty-ie.js" type="text/javascript"></script>
<script type="text/javascript">
    var oldObj = {
        number: 123
    };
    var newObj = Object.defineProperties(oldObj, {
        getter: {
            get: function () {
                return 'trigger `getter`';
            }
        },
        setter: {
            set: function () {
                alert('trigger `setter`');
            }
        },
        string: {
            value: 'Ambit Tsai',
            writable: false
        }
    });
</script>
```


#### Reference
1. <a href="https://www.cnblogs.com/rubylouvre/p/3598133.html" target="_blank">迷你MVVM框架avalon在兼容旧式IE做的努力</a>
