简体中文 | [English](README.md)


# Object.defineProperty Sham For IE&nbsp;&nbsp;![Version](https://img.shields.io/npm/v/object-defineproperty-ie.svg)

一个 `Object.defineProperty` 的 IE 补丁，基于 VBScript 实现。它还提供了`Object.defineProperties`、 `Object.getOwnPropertyDescriptor`、 `Object.getOwnPropertyDescriptors`。


#### 注意
1. 在 IE8 中，对于 `Element` 对象、`doucment` 与 `window` 将调用原生的 `defineProperty` 和 `getOwnPropertyDescriptor` 方法；
1. 其他情况下，`defineProperty` 将会返回一个新的 VB 对象；
1. 对于 VB 对象，修改现有属性的描述符不会生成新的 VB 对象；
1. VB 对象不能随意增删属性
1. VB 对象没有 `[[Prototype]]` 或 `__proto__`；
1. VB 对象的属性名不能包含特殊字符 `]`；
1. VB 对象的属性是可枚举的，不受描述符 `enumerable` 的影响；


#### 安装
1. 使用NPM: `npm install -S object-defineproperty-ie`
1. 直接下载: <a href="src/object-defineproperty-ie.js" target="_blank">开发版本</a>, <a href="dist/object-defineproperty-ie.js" target="_blank">生产版本</a>


#### 用法
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


#### 测试
1. 在线访问 <a href="https://ambit-tsai.github.io/object-defineproperty-ie/" target="_blank">GitHub Page</a>
1. 本地访问 `docs/index.html`
1. 已在IE6、IE7、IE8中进行测试


#### 联系
1. *微信*: ambit_tsai
1. *QQ群*: 663286147
1. *邮箱*: ambit_tsai@qq.com


#### 参考
1. <a href="https://www.cnblogs.com/rubylouvre/p/3598133.html" target="_blank">迷你MVVM框架avalon在兼容旧式IE做的努力</a>
