简体中文 | [English](README.md)


# Object.defineProperty Sham For IE&nbsp;&nbsp;![Version](https://img.shields.io/npm/v/object-defineproperty-ie.svg)

一个 `Object.defineProperty` 的 IE 补丁，基于 VBScript 实现。它还提供了`Object.defineProperties`、 `Object.getOwnPropertyDescriptor`、 `Object.getOwnPropertyDescriptors`。


#### 注意
1. 在 IE8 中，对于 `Element` 对象将调用原生的方法；
1. 其他情况下，`Object.defineProperty` 将会返回一个新的 VB 对象；
1. VB 对象不能随意增删属性；
1. VB 对象没有 `[[Prototype]]` 或 `__proto__`；


#### 安装
1. 使用NPM: `npm install -S object-defineproperty-ie`
1. 直接下载: <a href="src/object-defineproperty-ie.js" target="_blank">开发版本</a>, <a href="dist/object-defineproperty-ie.js" target="_blank">生产版本</a>


#### 用法
```html
<script src="path/to/object-defineproperty-ie.js" type="text/javascript"></script>
<script type="text/javascript">
    var oldObj = Object.defineProperty({}, 'string', {
        value: 'Ambit Tsai',
        enumerable: true
    });
    // oldObj => {string: "Ambit Tsai"}

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
        }
    });
    // newObj => {
    //     getter: "trigger `getter`",
    //     setter: undefined,
    //     string: "Ambit Tsai"
    // }

    var desc = Object.getOwnPropertyDescriptor(newObj, 'string');
    // desc => {
    //     configurable: false,
    //     enumerable: true,
    //     value: "Ambit Tsai",
    //     writable: false
    // }
</script>
```


#### 参考
1. <a href="https://www.cnblogs.com/rubylouvre/p/3598133.html" target="_blank">迷你MVVM框架avalon在兼容旧式IE做的努力</a>
