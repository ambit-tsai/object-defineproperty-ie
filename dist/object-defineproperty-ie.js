/**
 * Object.defineProperty Sham For IE
 * @version 3.0.0
 * @author Ambit Tsai <ambit_tsai@qq.com>
 * @license Apache-2.0
 * @see {@link https://github.com/ambit-tsai/object-defineproperty-ie}
 */
!function(f,s){var p,r="defineProperty",i="defineProperties",o="getOwnPropertyDescriptor",n=o+"s",l="Property description must be an object: ",y="__INTERNAL_DATA__",h="enumerable",v="configurable",b="value",d="writable",E="get",P="set";if(s[r])try{s[r]({},"",{})}catch(_){var u=s[r];s[i]=function(e,t){return e instanceof Element||e===document||e===f?(g(t)||m(l+t),w(t,function(t,n){u(e,t,n)}),e):a(e,t)},s[r]=function(t,n,e){var r={};return r[n]=e,s[i](t,r)}}else s[r]=function(t,n,e){var r={};return r[n]=e,a(t,r)};if(s[i]||(/\[native code\]/.test(s[r].toString())?s[i]=function(e,t){return g(t)||m(l+t),w(t,function(t,n){s[r](e,t,n)}),e}:s[i]=a),s[o]){if(s[o](f,v+v)){var e=s[o];s[o]=function(t,n){return t instanceof Element||t===document||t===f?M(t,n)?e(t,n):p:c(t,n)}}}else s[o]=c;function g(t){return t&&("object"==typeof t||"function"==typeof t)}function m(t){throw new TypeError(t)}function w(t,n){for(var e in t)M(t,e)&&n(e,t[e])}function M(t,n){return s.prototype.hasOwnProperty.call(t,n)}function a(i,t){g(i)||m("Method called on non-object"),g(t)||m(l+t);var o,u,a={};if(w(t,function(t,n){var e=function r(t){g(t)||m(l+t);var n={};h in t&&(n[h]=!!t[h]);v in t&&(n[v]=!!t[v]);b in t&&(n[b]=t[b]);d in t&&(n[d]=!!t[d]);E in t&&("function"!=typeof t[E]&&t[E]!==p?m("Getter must be a function: "+t[E]):n[E]=t[E]);P in t&&("function"!=typeof t[P]&&t[P]!==p?m("Setter must be a function: "+t[P]):n[P]=t[P]);(E in n||P in n)&&(b in n||d in n)&&m("Cannot both specify accessors and a value or writable attribute");return n}(n);a[t]=e,o||!(E in e||P in e)&&e[d]&&e[v]||(o=!0),M(i,t)||(u=!0)}),S(i)){if(!u)return V(D(i).props,a),i}else if(!o)return w(a,function(t,n){i[t]=b in n?n[b]:i[t]}),i;return V(t=s[n](i),a),function c(t){var n=f.setTimeout(s),r="["+y+"]",i=["Class VbClass"+n,"  Private "+r],o=0,u=new R(t);w(t,function(t){var n="["+t+"]",e="val"===t?"v":"val";i.push("  Public Property Get "+n,"    If "+r+".getter("+o+", ME) Then","      Set "+n+" = "+r+".getterReturn","    Else","      "+n+" = "+r+".getterReturn","    End If","  End Property","  Public Property Let "+n+"("+e+")","    "+r+".setter "+o+", ME, "+e,"  End Property","  Public Property Set "+n+"("+e+")"),o?i.push("    "+r+".setter "+o+", ME, "+e):i.push("    If isEmpty("+r+") Then","      Set "+r+" = "+e,"    Else","      "+r+".setter "+o+", ME, "+e,"    End If"),i.push("  End Property"),u.keyMap[o++]=t}),i.push("End Class","Function VbFactory"+n+"()","  Set VbFactory"+n+" = New VbClass"+n,"End Function"),f.execScript(i.join("\r\n"),"VBS");var e=f["VbFactory"+n]();return e[u.keyMap[0]]=u,e}(t)}function S(t){if(!(y in t))try{t[y]=0,delete t[y]}catch(_){return!0}return!1}function D(t){for(var n in t)return t[n]=R,t[n]}function R(t){this.props=t,this.keyMap={},this.canGetData=p,this.getterReturn=p}function V(r,t){w(t,function(t,n){var e=r[t];e?!1===e[v]&&(b in e&&(n[v]||E in n||P in n||!e[d]&&b in n&&n[b]!==e[b]||!e[d]&&n[d]||h in n&&n[h]!==e[h])||E in e&&(n[v]||b in n||d in n||h in n&&n[h]!==e[h]))&&m("Cannot redefine property: "+t):((e={})[b]=p,e[d]=!1,e[h]=!1,e[v]=!1),r[t]=n,b in n||d in n?(b in n||(n[b]=e[b]),d in n||(n[d]=e[d])):E in n||P in n?(E in n||(n[E]=e[E]),P in n||(n[P]=e[P])):b in e?(n[b]=e[b],n[d]=e[d]):(n[E]=e[E],n[P]=e[P]),h in n||(n[h]=e[h]),v in n||(n[v]=e[v])})}function c(t,n){if(M(t,n)){if(S(t))return function i(e,t){return w(t,function(t,n){e[t]=n}),e}({},D(t).props[n]);var e={};for(var r in e[b]=t[n],e[d]=!0,e[v]=!0,e[h]=!1,t)if(r===n){e[h]=!0;break}return e}}s[n]||(s[n]=function(t){var n,e,r={};for(n in t)(e=s[o](t,n))&&(r[n]=e);return r}),f._isVbObject=S,f._getInternalDataOf=D,R.prototype.getter=function(t,n){if(this.canGetData===t)return(this.getterReturn=this).canGetData=p,!0;var e=this.keyMap[t],r=this.props[e];return this.getterReturn=r[E]?r[E].call(n):r[b],g(this.getterReturn)},R.prototype.setter=function(t,n,e){if(e!==R){var r=this.keyMap[t],i=this.props[r];i[d]?i[b]=e:i[P]&&i[P].call(n,e)}else this.canGetData=t}}(window,Object);