/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$4=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$3,defineProperty:e$1,getOwnPropertyDescriptor:h$2,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$3(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$2(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$2=t.trustedTypes,s$1=i$2?i$2.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h$1=`lit$${Math.random().toFixed(9).slice(2)}$`,o$1="?"+h$1,n=`<${o$1}>`,r$1=document,l=()=>r$1.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$1.createTreeWalker(r$1,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h$1+x):s+h$1+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h$1)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h$1),s=t.length-1;if(s>0){r.textContent=i$2?i$2.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$1)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h$1,t+1));)d.push({type:7,index:c}),t+=h$1.length-1;}c++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$1).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t.litHtmlPolyfillSupport;j?.(N,R),(t.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$1 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}};i$1._$litElement$=true,i$1["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$1});const o=s.litElementPolyfillSupport;o?.({LitElement:i$1});(s.litElementVersions??=[]).push("4.2.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const i=Symbol();class h{get taskComplete(){return this.t||(1===this.i?this.t=new Promise(((t,s)=>{this.o=t,this.h=s;})):3===this.i?this.t=Promise.reject(this.l):this.t=Promise.resolve(this.u)),this.t}constructor(t,s,i){this.p=0,this.i=0,(this._=t).addController(this);const h="object"==typeof s?s:{task:s,args:i};this.v=h.task,this.j=h.args,this.m=h.argsEqual??r,this.k=h.onComplete,this.A=h.onError,this.autoRun=h.autoRun??true,"initialValue"in h&&(this.u=h.initialValue,this.i=2,this.O=this.T?.());}hostUpdate(){ true===this.autoRun&&this.S();}hostUpdated(){"afterUpdate"===this.autoRun&&this.S();}T(){if(void 0===this.j)return;const t=this.j();if(!Array.isArray(t))throw Error("The args function must return an array");return t}async S(){const t=this.T(),s=this.O;this.O=t,t===s||void 0===t||void 0!==s&&this.m(s,t)||await this.run(t);}async run(t){let s,h;t??=this.T(),this.O=t,1===this.i?this.q?.abort():(this.t=void 0,this.o=void 0,this.h=void 0),this.i=1,"afterUpdate"===this.autoRun?queueMicrotask((()=>this._.requestUpdate())):this._.requestUpdate();const r=++this.p;this.q=new AbortController;let e=false;try{s=await this.v(t,{signal:this.q.signal});}catch(t){e=true,h=t;}if(this.p===r){if(s===i)this.i=0;else {if(false===e){try{this.k?.(s);}catch{}this.i=2,this.o?.(s);}else {try{this.A?.(h);}catch{}this.i=3,this.h?.(h);}this.u=s,this.l=h;}this._.requestUpdate();}}abort(t){1===this.i&&this.q?.abort(t);}get value(){return this.u}get error(){return this.l}get status(){return this.i}render(t){switch(this.i){case 0:return t.initial?.();case 1:return t.pending?.();case 2:return t.complete?.(this.value);case 3:return t.error?.(this.error);default:throw Error("Unexpected status: "+this.i)}}}const r=(s,i)=>s===i||s.length===i.length&&s.every(((s,h)=>!f$1(s,i[h])));

// Copyright baseline-status contributors
// Licensed under the Apache License, Version 2.0
// See the LICENSE-APACHE file in the project root for details.


const icons = {
    limited: x`
        <svg viewBox="0 0 36 20">
            <path
                fill="var(--baseline-icon-limited-front)"
                d="M10 0L16 6L14 8L8 2L10 0Z"
            />
            <path
                fill="var(--baseline-icon-limited-front)"
                d="M22 12L20 14L26 20L28 18L22 12Z"
            />
            <path
                fill="var(--baseline-icon-limited-front)"
                d="M26 0L28 2L10 20L8 18L26 0Z"
            />
            <path
                fill="var(--baseline-icon-limited-back)"
                d="M8 2L10 4L4 10L10 16L8 18L0 10L8 2Z"
            />
            <path
                fill="var(--baseline-icon-limited-back)"
                d="M28 2L36 10L28 18L26 16L32 10L26 4L28 2Z"
            />
        </svg>
    `,
    widely: x`
        <svg viewBox="0 0 36 20">
            <path
                fill="var(--baseline-icon-widely-front)"
                d="M18 8L20 10L18 12L16 10L18 8Z"
            />
            <path
                fill="var(--baseline-icon-widely-front)"
                d="M26 0L28 2L10 20L0 10L2 8L10 16L26 0Z"
            />
            <path
                fill="var(--baseline-icon-widely-back)"
                d="M28 2L26 4L32 10L26 16L22 12L20 14L26 20L36 10L28 2Z"
            />
            <path
                fill="var(--baseline-icon-widely-back)"
                d="M10 0L2 8L4 10L10 4L14 8L16 6L10 0Z"
            />
        </svg>
    `,
    newly: x`
        <svg viewBox="0 0 36 20">
            <path
                fill="var(--baseline-icon-newly-back)"
                d="m10 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm16 0 2 2-2 2-2-2 2-2Zm4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4 4 2 2-2 2-2-2 2-2Zm-4-4 2 2-2 2-2-2 2-2ZM6 4l2 2-2 2-2-2 2-2Z"
            />
            <path
                fill="var(--baseline-icon-newly-front)"
                d="m26 0 2 2-18 18L0 10l2-2 8 8L26 0Z"
            />
        </svg>
    `,
    no_data: x`
        <svg viewBox="0 0 36 20">
            <path
                fill="var(--baseline-icon-no_data)"
                d="M18 8L20 10L18 12L16 10L18 8Z"
            />
            <path
                fill="var(--baseline-icon-no_data)"
                d="M28 2L26 4L32 10L26 16L22 12L20 14L26 20L36 10L28 2Z"
            />
            <path
                fill="var(--baseline-icon-no_data)"
                d="M10 0L2 8L4 10L10 4L14 8L16 6L10 0Z"
            />
            <path
                fill="var(--baseline-icon-no_data)"
                d="M26 0L28 2L10 20L0 10L2 8L10 16L26 0Z"
            />
        </svg>
    `,
};

/**
 * Web component rendering baseline support icon.
 * @see https://web.dev/baseline
 */
class BaselineIcon extends i$1 {
    static get styles() {
        return i$4`
            :host {
                --baseline-icon-limited-front: light-dark(#f09409, #f09409);
                --baseline-icon-limited-back: light-dark(#c6c6c6, #565656);
                --baseline-icon-widely-front: light-dark(#1ea446, #1ea446);
                --baseline-icon-widely-back: light-dark(#c4eed0, #125225);
                --baseline-icon-newly-front: light-dark(#1b6ef3, #4185ff);
                --baseline-icon-newly-back: light-dark(#a8c7fa, #2d509e);
                --baseline-icon-no_data: light-dark(#909090, #666666);
            }

            :host {
                height: 20px;
            }

            svg {
                width: 36px;
                height: 20px;
                display: inline-block;
            }
        `;
    }

    static get properties() {
        return {
            /**
             * Level of support (widely, newly, limited, no_data)
             * @type {string}
             */
            support: { type: String },
        };
    }

    render() {
        return icons[this.support];
    }
}

window.customElements.define('baseline-icon', BaselineIcon);

// Copyright baseline-status contributors
// Licensed under the Apache License, Version 2.0
// See the LICENSE-APACHE file in the project root for details.


const ICONS = {
    chrome: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        viewBox="0 0 260 260"
    >
        <linearGradient
            id="a"
            x1="145"
            x2="34"
            y1="253"
            y2="61"
            gradientUnits="userSpaceOnUse"
        >
            <stop offset="0" stop-color="#1e8e3e" />
            <stop offset="1" stop-color="#34a853" />
        </linearGradient>
        <linearGradient
            id="b"
            x1="111"
            x2="222"
            y1="254"
            y2="62"
            gradientUnits="userSpaceOnUse"
        >
            <stop offset="0" stop-color="#fcc934" />
            <stop offset="1" stop-color="#fbbc04" />
        </linearGradient>
        <linearGradient
            id="c"
            x1="17"
            x2="239"
            y1="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
        >
            <stop offset="0" stop-color="#d93025" />
            <stop offset="1" stop-color="#ea4335" />
        </linearGradient>
        <circle cx="128" cy="128" r="64" fill="#fff" />
        <path
            fill="url(#a)"
            d="M96 183.4A63.7 63.7 0 0 1 72.6 160L17.2 64A128 128 0 0 0 128 256l55.4-96A64 64 0 0 1 96 183.4Z"
        />
        <path
            fill="url(#b)"
            d="M192 128a63.7 63.7 0 0 1-8.6 32L128 256A128 128 0 0 0 238.9 64h-111a64 64 0 0 1 64 64Z"
        />
        <circle cx="128" cy="128" r="52" fill="#1a73e8" />
        <path
            fill="url(#c)"
            d="M96 72.6a63.7 63.7 0 0 1 32-8.6h110.8a128 128 0 0 0-221.7 0l55.5 96A64 64 0 0 1 96 72.6Z"
        />
    </svg>`,
    edge: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        fill="none"
    >
        <defs>
            <radialGradient
                id="e"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="rotate(-81.384 12.03 4.657) scale(11.4261 9.23112)"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset=".8" stop-opacity="0" />
                <stop offset=".9" stop-opacity=".5" />
                <stop offset="1" />
            </radialGradient>
            <radialGradient
                id="f"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="rotate(92.291 -.78 2.876) scale(16.1416 34.3784)"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#35C1F1" />
                <stop offset=".1" stop-color="#34C1ED" />
                <stop offset=".2" stop-color="#2FC2DF" />
                <stop offset=".3" stop-color="#2BC3D2" />
                <stop offset=".7" stop-color="#36C752" />
            </radialGradient>
            <radialGradient
                id="g"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="matrix(2.171 7.44345 -6.05301 1.76546 19.13 6.16)"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#66EB6E" />
                <stop offset="1" stop-color="#66EB6E" stop-opacity="0" />
            </radialGradient>
            <linearGradient
                id="q"
                x1="4.678"
                x2="18.894"
                y1="14.105"
                y2="14.105"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0" stop-color="#0C59A4" />
                <stop offset="1" stop-color="#114A8B" />
            </linearGradient>
            <linearGradient
                id="d"
                x1="12.168"
                x2="3.299"
                y1="7.937"
                y2="17.603"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#1B9DE2" />
                <stop offset=".2" stop-color="#1595DF" />
                <stop offset=".7" stop-color="#0680D7" />
                <stop offset="1" stop-color="#0078D4" />
            </linearGradient>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h20.4v20.4H0z" />
            </clipPath>
        </defs>
        <g clip-path="url(#a)">
            <path
                fill="url(#q)"
                d="M18.416 15.18a7.485 7.485 0 0 1-.845.375 8.121 8.121 0 0 1-2.86.51c-3.77 0-7.053-2.59-7.053-5.92a2.51 2.51 0 0 1 1.307-2.176c-3.41.143-4.287 3.697-4.287 5.777 0 5.897 5.427 6.487 6.598 6.487.63 0 1.578-.184 2.152-.367l.103-.032a10.224 10.224 0 0 0 5.307-4.207.319.319 0 0 0-.422-.447Z"
            />
            <path
                fill="url(#d)"
                d="M8.423 19.229a6.31 6.31 0 0 1-1.809-1.698A6.43 6.43 0 0 1 8.965 7.97c.255-.12.677-.327 1.243-.319a2.582 2.582 0 0 1 2.048 1.036c.32.431.497.953.502 1.49 0-.016 1.953-6.343-6.375-6.343-3.498 0-6.375 3.315-6.375 6.232-.014 1.54.316 3.065.964 4.462a10.2 10.2 0 0 0 12.464 5.34 6.015 6.015 0 0 1-5.005-.638h-.008Z"
            />
            <path
                fill="url(#e)"
                d="M8.423 19.229a6.31 6.31 0 0 1-1.809-1.698A6.43 6.43 0 0 1 8.965 7.97c.255-.12.677-.327 1.243-.319a2.582 2.582 0 0 1 2.048 1.036c.32.431.497.953.502 1.49 0-.016 1.953-6.343-6.375-6.343-3.498 0-6.375 3.315-6.375 6.232-.014 1.54.316 3.065.964 4.462a10.2 10.2 0 0 0 12.464 5.34 6.015 6.015 0 0 1-5.005-.638h-.008Z"
                opacity=".41"
            />
            <path
                fill="url(#f)"
                d="M12.145 11.857c-.072.08-.271.2-.271.447 0 .207.135.414.382.582 1.14.796 3.3.685 3.307.685a4.75 4.75 0 0 0 2.415-.662A4.893 4.893 0 0 0 20.4 8.694c.024-1.785-.637-2.972-.9-3.498C17.802 1.896 14.16 0 10.2 0A10.2 10.2 0 0 0 0 10.057c.04-2.909 2.933-5.26 6.375-5.26.28 0 1.873.024 3.347.797a5.786 5.786 0 0 1 2.463 2.335c.486.845.573 1.92.573 2.35 0 .431-.215 1.06-.621 1.587l.008-.008Z"
            />
            <path
                fill="url(#g)"
                d="M12.145 11.857c-.072.08-.271.2-.271.447 0 .207.135.414.382.582 1.14.796 3.3.685 3.307.685a4.75 4.75 0 0 0 2.415-.662A4.893 4.893 0 0 0 20.4 8.694c.024-1.785-.637-2.972-.9-3.498C17.802 1.896 14.16 0 10.2 0A10.2 10.2 0 0 0 0 10.057c.04-2.909 2.933-5.26 6.375-5.26.28 0 1.873.024 3.347.797a5.786 5.786 0 0 1 2.463 2.335c.486.845.573 1.92.573 2.35 0 .431-.215 1.06-.621 1.587l.008-.008Z"
            />
        </g>
    </svg>`,
    firefox: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        fill="none"
    >
        <g clip-path="url(#M)">
            <path
                d="M19.661 6.85c-.444-1.034-1.344-2.15-2.049-2.503.503.942.851 1.955 1.034 3l.002.017c-1.155-2.786-3.112-3.911-4.711-6.358l-.241-.379-.113-.204a1.76 1.76 0 0 1-.152-.392c-.011-.022-.017-.025-.023-.026-.021 0-.023.002-.024.003l-.003-.003C10.816 1.46 9.945 4.152 9.866 5.499c-1.025.068-2.004.434-2.811 1.049a3.05 3.05 0 0 0-.263-.193c-.233-.789-.243-1.623-.029-2.417-.942.442-1.779 1.068-2.458 1.84H4.3c-.405-.497-.376-2.135-.353-2.477-.12.047-.234.105-.341.175-.357.247-.691.524-.998.828-.35.343-.669.714-.955 1.109v.002-.002a8.22 8.22 0 0 0-1.37 2.995l-.014.065c-.019.087-.089.523-.1.617 0 .007-.002.014-.002.022A9.14 9.14 0 0 0 0 10.475v.051c.005 2.474.967 4.857 2.697 6.678s4.103 2.948 6.649 3.158a10.45 10.45 0 0 0 7.105-2.023c2.023-1.511 3.388-3.702 3.825-6.14l.046-.383c.21-1.683-.017-3.391-.662-4.967l.001.002zm-11.77 7.741l.141.067.007.004-.149-.072zm10.758-7.224v-.009l.002.01-.002-.001z"
                fill="url(#A)"
            />
            <use href="#N" fill="url(#B)" />
            <use href="#N" fill="url(#C)" />
            <path
                d="M14.697 8.011l.064.045c-.257-.44-.576-.844-.949-1.198C10.637 3.784 12.98.194 13.375.01l.004-.006c-2.565 1.454-3.436 4.146-3.515 5.493l.359-.018c.91.002 1.803.237 2.589.681a5.07 5.07 0 0 1 1.885 1.849v.001z"
                fill="url(#D)"
            />
            <use href="#O" fill="url(#E)" />
            <use href="#O" fill="url(#F)" />
            <path
                d="M6.576 6.22l.211.135c-.233-.789-.243-1.623-.029-2.417-.942.442-1.779 1.068-2.458 1.84.05-.001 1.531-.027 2.276.442z"
                fill="url(#G)"
            />
            <path
                d="M.093 10.761c.788 4.508 5.009 7.952 9.799 8.083 4.434.121 7.267-2.371 8.437-4.802.991-2.102 1.105-4.493.318-6.674v-.009l.002.007c.362 2.29-.841 4.508-2.722 6.011l-.006.013c-3.665 2.891-7.172 1.744-7.881 1.276l-.149-.072c-2.137-.989-3.02-2.873-2.83-4.49-.507.007-1.006-.128-1.435-.39s-.771-.638-.984-1.084c.561-.333 1.2-.521 1.858-.546a3.96 3.96 0 0 1 1.897.4 5.24 5.24 0 0 0 3.834.146c-.004-.08-1.781-.765-2.474-1.426-.37-.353-.546-.524-.702-.651-.084-.069-.172-.134-.263-.193l-.211-.135c-.745-.469-2.226-.443-2.275-.442h-.005c-.405-.497-.376-2.135-.353-2.477-.12.047-.234.105-.341.175-.357.247-.691.524-.998.828-.351.342-.672.712-.959 1.107A8.22 8.22 0 0 0 .28 8.409c-.005.02-.368 1.556-.189 2.353h.002z"
                fill="url(#H)"
            />
            <path
                d="M13.812 6.858c.373.355.692.758.948 1.199l.153.121c2.315 2.067 1.102 4.988 1.012 5.195 1.881-1.5 3.083-3.72 2.722-6.011-1.155-2.789-3.114-3.914-4.711-6.361l-.241-.379-.113-.204a1.76 1.76 0 0 1-.152-.392c-.011-.022-.017-.025-.023-.026-.021 0-.023.002-.024.003-.402.185-2.745 3.777.43 6.849l-.001.004z"
                fill="url(#I)"
            />
            <path
                d="M14.913 8.179c-.045-.04-.097-.08-.153-.121l-.063-.045c-.718-.482-1.596-.688-2.462-.579 3.673 1.778 2.688 7.902-2.403 7.672-.453-.018-.901-.102-1.329-.248l-.3-.119-.172-.08.007.004c.71.469 4.216 1.616 7.881-1.276l.006-.013c.091-.207 1.305-3.128-1.012-5.195l.001-.001z"
                fill="url(#J)"
            />
            <path
                d="M5.625 11.419S6.096 9.718 9 9.718c.314 0 1.212-.848 1.228-1.094a5.24 5.24 0 0 1-3.834-.146 3.96 3.96 0 0 0-1.897-.4c-.657.026-1.297.214-1.858.546.213.446.555.822.984 1.084s.928.397 1.435.39c-.189 1.617.694 3.5 2.83 4.49l.141.067c-1.247-.624-2.277-1.804-2.405-3.235v-.001z"
                fill="url(#K)"
            />
            <path
                d="M19.661 6.845c-.444-1.034-1.344-2.15-2.049-2.503a10.05 10.05 0 0 1 1.034 3l.002.017c-1.155-2.786-3.112-3.911-4.711-6.358l-.241-.379-.112-.204c-.066-.124-.117-.256-.152-.392-.011-.022-.017-.025-.023-.026-.02 0-.023.002-.024.003l-.003-.003c-2.565 1.454-3.436 4.146-3.515 5.493l.359-.018c.91.002 1.803.237 2.589.681a5.07 5.07 0 0 1 1.885 1.849c-.718-.482-1.596-.688-2.462-.579 3.673 1.778 2.688 7.902-2.403 7.672-.453-.018-.901-.102-1.329-.248l-.3-.119-.172-.08.007.004-.149-.072.141.067c-1.247-.624-2.277-1.804-2.405-3.235 0 0 .471-1.701 3.375-1.701.314 0 1.212-.848 1.228-1.094-.004-.08-1.781-.765-2.474-1.426l-.702-.651a3.05 3.05 0 0 0-.263-.193c-.233-.789-.243-1.623-.029-2.417-.942.442-1.779 1.068-2.458 1.84H4.3c-.405-.497-.376-2.135-.353-2.477-.12.047-.234.105-.341.175-.357.247-.691.524-.998.828-.35.343-.669.714-.955 1.109a8.22 8.22 0 0 0-1.37 2.995l-.014.065-.118.624A11.15 11.15 0 0 0 0 10.473v.051c.005 2.474.967 4.857 2.697 6.678S6.8 20.15 9.347 20.36a10.45 10.45 0 0 0 7.105-2.023c2.023-1.511 3.388-3.702 3.825-6.14l.046-.383c.21-1.683-.017-3.391-.662-4.967l.001-.001z"
                fill="url(#L)"
            />
        </g>
        <defs>
            <linearGradient
                id="A"
                x1="18.309"
                y1="3.165"
                x2="1.883"
                y2="19.533"
                href="#P"
            >
                <stop offset=".048" stop-color="#fff44f" />
                <stop offset=".111" stop-color="#ffe847" />
                <stop offset=".225" stop-color="#ffc830" />
                <stop offset=".368" stop-color="#ff980e" />
                <stop offset=".401" stop-color="#ff8b16" />
                <stop offset=".462" stop-color="#ff672a" />
                <stop offset=".534" stop-color="#ff3647" />
                <stop offset=".705" stop-color="#e31587" />
            </linearGradient>
            <radialGradient
                id="B"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(17.6533 2.30078) scale(21.2899 20.6149)"
                href="#P"
            >
                <stop offset=".129" stop-color="#ffbd4f" />
                <stop offset=".186" stop-color="#ffac31" />
                <stop offset=".247" stop-color="#ff9d17" />
                <stop offset=".283" stop-color="#ff980e" />
                <stop offset=".403" stop-color="#ff563b" />
                <stop offset=".467" stop-color="#ff3750" />
                <stop offset=".71" stop-color="#f5156c" />
                <stop offset=".782" stop-color="#eb0878" />
                <stop offset=".86" stop-color="#e50080" />
            </radialGradient>
            <radialGradient
                id="C"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="matrix(21.2899,0,0,20.6149,9.74862,10.7203)"
                href="#P"
            >
                <stop offset=".3" stop-color="#960e18" />
                <stop offset=".351" stop-color="#b11927" stop-opacity=".74" />
                <stop offset=".435" stop-color="#db293d" stop-opacity=".343" />
                <stop offset=".497" stop-color="#f5334b" stop-opacity=".094" />
                <stop offset=".53" stop-color="#ff3750" stop-opacity="0" />
            </radialGradient>
            <radialGradient
                id="D"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(12.3835 -2.29164) scale(15.422 14.9331)"
                href="#P"
            >
                <stop offset=".132" stop-color="#fff44f" />
                <stop offset=".252" stop-color="#ffdc3e" />
                <stop offset=".506" stop-color="#ff9d12" />
                <stop offset=".526" stop-color="#ff980e" />
            </radialGradient>
            <radialGradient
                id="E"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(7.37722 16.0781) scale(10.1364 9.81506)"
                href="#P"
            >
                <stop offset=".353" stop-color="#3a8ee6" />
                <stop offset=".472" stop-color="#5c79f0" />
                <stop offset=".669" stop-color="#9059ff" />
                <stop offset="1" stop-color="#c139e6" />
            </radialGradient>
            <radialGradient
                id="F"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="matrix(5.224671177371898,-1.223117268801049,1.391360771064786,5.943340596469464,10.7783,8.95064)"
                href="#P"
            >
                <stop offset=".206" stop-color="#9059ff" stop-opacity="0" />
                <stop offset=".278" stop-color="#8c4ff3" stop-opacity=".064" />
                <stop offset=".747" stop-color="#7716a8" stop-opacity=".45" />
                <stop offset=".975" stop-color="#6e008b" stop-opacity=".6" />
            </radialGradient>
            <radialGradient
                id="G"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(9.48499 1.53538) scale(7.29338 7.06215)"
                href="#P"
            >
                <stop stop-color="#ffe226" />
                <stop offset=".121" stop-color="#ffdb27" />
                <stop offset=".295" stop-color="#ffc82a" />
                <stop offset=".502" stop-color="#ffa930" />
                <stop offset=".732" stop-color="#ff7e37" />
                <stop offset=".792" stop-color="#ff7139" />
            </radialGradient>
            <radialGradient
                id="H"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(15.2817 -3.05706) scale(31.1181 30.1315)"
                href="#P"
            >
                <stop offset=".113" stop-color="#fff44f" />
                <stop offset=".456" stop-color="#ff980e" />
                <stop offset=".622" stop-color="#ff5634" />
                <stop offset=".716" stop-color="#ff3647" />
                <stop offset=".904" stop-color="#e31587" />
            </radialGradient>
            <radialGradient
                id="I"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(12.6953 -1.38643) rotate(83.7803) scale(22.0889 14.9604)"
                href="#P"
            >
                <stop stop-color="#fff44f" />
                <stop offset=".06" stop-color="#ffe847" />
                <stop offset=".168" stop-color="#ffc830" />
                <stop offset=".304" stop-color="#ff980e" />
                <stop offset=".356" stop-color="#ff8b16" />
                <stop offset=".455" stop-color="#ff672a" />
                <stop offset=".57" stop-color="#ff3647" />
                <stop offset=".737" stop-color="#e31587" />
            </radialGradient>
            <radialGradient
                id="J"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(9.485 4.08674) scale(19.4244 18.8086)"
                href="#P"
            >
                <stop offset=".137" stop-color="#fff44f" />
                <stop offset=".48" stop-color="#ff980e" />
                <stop offset=".592" stop-color="#ff5634" />
                <stop offset=".655" stop-color="#ff3647" />
                <stop offset=".904" stop-color="#e31587" />
            </radialGradient>
            <radialGradient
                id="K"
                cx="0"
                cy="0"
                r="1"
                gradientTransform="translate(14.4914 5.10728) scale(21.2609 20.5869)"
                href="#P"
            >
                <stop offset=".094" stop-color="#fff44f" />
                <stop offset=".231" stop-color="#ffe141" />
                <stop offset=".509" stop-color="#ffaf1e" />
                <stop offset=".626" stop-color="#ff980e" />
            </radialGradient>
            <linearGradient
                id="L"
                x1="18.103"
                y1="3.076"
                x2="4.144"
                y2="17.494"
                href="#P"
            >
                <stop offset=".167" stop-color="#fff44f" stop-opacity=".8" />
                <stop offset=".266" stop-color="#fff44f" stop-opacity=".634" />
                <stop offset=".489" stop-color="#fff44f" stop-opacity=".217" />
                <stop offset=".6" stop-color="#fff44f" stop-opacity="0" />
            </linearGradient>
            <clipPath id="M">
                <path fill="#fff" d="M0 0h20.4v20.4H0z" />
            </clipPath>
            <path
                id="N"
                d="M19.661 6.85c-.444-1.034-1.344-2.15-2.049-2.503.503.942.851 1.955 1.034 3v.009l.002.01c.787 2.181.673 4.573-.318 6.674-1.17 2.432-4.002 4.924-8.437 4.802-4.79-.131-9.011-3.574-9.799-8.083-.144-.711 0-1.072.072-1.649-.098.449-.153.906-.164 1.364v.051c.005 2.474.967 4.857 2.697 6.678s4.103 2.948 6.649 3.158a10.45 10.45 0 0 0 7.105-2.023c2.023-1.511 3.388-3.702 3.825-6.14l.046-.383c.21-1.684-.017-3.391-.663-4.968l-.001.001z"
            />
            <path
                id="O"
                d="M10.228 8.626C10.211 8.872 9.314 9.72 9 9.72c-2.904 0-3.375 1.701-3.375 1.701.129 1.432 1.159 2.613 2.405 3.235l.172.08.3.119c.428.146.876.23 1.329.248 5.091.231 6.076-5.894 2.403-7.672.867-.109 1.744.097 2.462.579-.449-.767-1.099-1.405-1.885-1.849s-1.679-.679-2.589-.681l-.359.018c-1.025.068-2.004.434-2.811 1.049.156.128.331.298.702.651.693.661 2.47 1.346 2.474 1.426v.002z"
            />
            <linearGradient id="P" gradientUnits="userSpaceOnUse" />
        </defs>
    </svg>`,
    safari: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
    >
        <g clip-path="url(#clip0_1510_9490)">
            <path
                opacity="0.53"
                d="M19.5049 10.5241C19.5049 11.7071 19.2643 12.8785 18.7967 13.9715C18.3292 15.0644 17.6438 16.0575 16.7799 16.894C15.9159 17.7305 14.8903 18.394 13.7615 18.8467C12.6327 19.2995 11.4229 19.5325 10.2011 19.5325C8.97927 19.5325 7.76944 19.2995 6.64064 18.8467C5.51184 18.394 4.4862 17.7305 3.62225 16.894C2.75831 16.0575 2.07299 15.0644 1.60543 13.9715C1.13787 12.8785 0.897217 11.7071 0.897217 10.5241C0.897217 8.13494 1.87744 5.84363 3.62225 4.15423C5.36706 2.46484 7.73354 1.51575 10.2011 1.51575C11.4229 1.51575 12.6327 1.74875 13.7615 2.20147C14.8903 2.65418 15.9159 3.31773 16.7799 4.15423C17.6438 4.99074 18.3292 5.98381 18.7967 7.07675C19.2643 8.1697 19.5049 9.34111 19.5049 10.5241Z"
                fill="black"
            />
            <path
                d="M19.8586 9.72878C19.8586 11.0041 19.6088 12.2669 19.1234 13.4451C18.6381 14.6233 17.9267 15.6939 17.0298 16.5956C16.133 17.4974 15.0683 18.2127 13.8965 18.7008C12.7248 19.1888 11.4689 19.44 10.2005 19.44C7.63906 19.44 5.1825 18.4168 3.37126 16.5956C1.56002 14.7744 0.54248 12.3043 0.54248 9.72878C0.54248 7.15321 1.56002 4.68313 3.37126 2.86192C5.1825 1.04072 7.63906 0.0175788 10.2005 0.0175781C11.4689 0.017578 12.7248 0.268767 13.8965 0.7568C15.0683 1.24483 16.133 1.96016 17.0298 2.86192C17.9267 3.76369 18.6381 4.83424 19.1234 6.01246C19.6088 7.19068 19.8586 8.45349 19.8586 9.72878Z"
                fill="url(#paint0_linear_1510_9490)"
                stroke="#CDCDCD"
                stroke-width="0.351543"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M19.1018 9.72868C19.1018 12.1024 18.164 14.379 16.4947 16.0575C14.8254 17.7359 12.5613 18.6789 10.2006 18.6789C7.83982 18.6789 5.57575 17.7359 3.90644 16.0575C2.23713 14.379 1.29932 12.1024 1.29932 9.72868C1.29932 7.35493 2.23713 5.0784 3.90644 3.39991C5.57575 1.72141 7.83982 0.778442 10.2006 0.778442C12.5613 0.778442 14.8254 1.72141 16.4947 3.39991C18.164 5.0784 19.1018 7.35493 19.1018 9.72868Z"
                fill="url(#paint1_radial_1510_9490)"
            />
            <path
                d="M10.2004 1.24524C10.1285 1.24524 10.0706 1.30343 10.0706 1.37573V2.88089C10.0706 2.95319 10.1285 3.01138 10.2004 3.01138C10.2723 3.01138 10.3302 2.95319 10.3302 2.88089V1.37573C10.3302 1.30343 10.2723 1.24524 10.2004 1.24524ZM9.3514 1.29919C9.3428 1.29826 9.33395 1.29826 9.32501 1.2993C9.2535 1.3068 9.20194 1.37073 9.2094 1.44263L9.27482 2.07233C9.28228 2.14423 9.34586 2.19608 9.41737 2.18857C9.48888 2.18107 9.54044 2.11714 9.53297 2.04524L9.46761 1.41555C9.46107 1.35263 9.41157 1.30507 9.3514 1.29919ZM11.0553 1.29981C10.9952 1.30564 10.9456 1.3532 10.9391 1.41611L10.8732 2.04575C10.8657 2.11765 10.9172 2.18163 10.9887 2.18919C11.0602 2.19676 11.1238 2.14496 11.1313 2.07306L11.1972 1.44337C11.2047 1.37147 11.1532 1.30754 11.0817 1.29998C11.0727 1.29905 11.0639 1.29905 11.0553 1.29981ZM8.47926 1.42636C8.47063 1.42643 8.46184 1.42729 8.45306 1.42915C8.38272 1.44412 8.33807 1.51313 8.35297 1.58386L8.66298 3.05636C8.67788 3.12708 8.7465 3.17197 8.81684 3.157C8.88718 3.14203 8.93182 3.07307 8.91693 3.00235L8.60692 1.52979C8.59387 1.46791 8.53972 1.42589 8.47926 1.42636ZM11.9274 1.4276C11.867 1.42698 11.8128 1.46912 11.7997 1.531L11.4886 3.00333C11.4737 3.07404 11.5183 3.14307 11.5886 3.15809C11.6589 3.17313 11.7276 3.12827 11.7425 3.05756L12.0536 1.58523C12.0686 1.51452 12.0239 1.44549 11.9536 1.43047C11.9448 1.42861 11.936 1.4276 11.9274 1.4276ZM7.64695 1.66233C7.63015 1.66078 7.6128 1.66264 7.5957 1.66835C7.52732 1.6907 7.49014 1.76399 7.51236 1.83274L7.70694 2.4349C7.72917 2.50365 7.80211 2.54104 7.87049 2.5187C7.93887 2.49635 7.97599 2.423 7.95377 2.35425L7.7592 1.75209C7.74255 1.70053 7.69735 1.66664 7.64695 1.66233ZM12.755 1.66264C12.7046 1.66695 12.6594 1.70085 12.6428 1.75241L12.4481 2.35451C12.4259 2.42327 12.463 2.49661 12.5314 2.51896C12.5998 2.54131 12.6727 2.50396 12.6949 2.43522L12.8896 1.83306C12.9118 1.76431 12.8747 1.69096 12.8063 1.66861C12.7892 1.66303 12.7718 1.66122 12.755 1.66264ZM6.82388 1.96518C6.80701 1.96549 6.78995 1.96921 6.77353 1.97656C6.70786 2.00592 6.67846 2.08272 6.70766 2.14878L7.31565 3.52419C7.34485 3.59025 7.42123 3.61979 7.48693 3.59042C7.55259 3.56106 7.58206 3.48426 7.55285 3.4182L6.94481 2.04279C6.92291 1.99324 6.87446 1.9642 6.82388 1.96518ZM13.5874 1.9698C13.5368 1.96887 13.4883 1.99774 13.4664 2.04724L12.8565 3.42181C12.8272 3.48783 12.8565 3.56468 12.9222 3.59414C12.9878 3.62359 13.0643 3.59415 13.0936 3.52813L13.7034 2.15357C13.7327 2.08755 13.7034 2.01069 13.6377 1.98124C13.6213 1.97389 13.6042 1.97018 13.5874 1.9698ZM6.0599 2.37164C6.03499 2.36978 6.00932 2.37536 5.98597 2.38893C5.9237 2.42508 5.90252 2.50458 5.93847 2.56718L6.25331 3.1155C6.28926 3.17811 6.36831 3.1994 6.43058 3.16326C6.49284 3.12711 6.51402 3.04762 6.47808 2.98501L6.16324 2.43669C6.14076 2.39756 6.10143 2.37456 6.0599 2.37164ZM14.3409 2.37164C14.2994 2.37443 14.2601 2.39755 14.2376 2.43669L13.9227 2.985C13.8868 3.04761 13.908 3.1271 13.9703 3.16325C14.0325 3.19939 14.1116 3.1781 14.1475 3.11549L14.4624 2.56717C14.4983 2.50457 14.4772 2.42507 14.4149 2.38893C14.3915 2.37538 14.3658 2.3699 14.3409 2.37164ZM5.31805 2.83688C5.29308 2.83781 5.26807 2.84587 5.24624 2.86177C5.18805 2.90422 5.17518 2.9855 5.21741 3.04402L6.09638 4.26236C6.1386 4.32087 6.21949 4.33381 6.27769 4.29137C6.33588 4.24892 6.34875 4.16764 6.30651 4.10913L5.42749 2.89079C5.4011 2.85422 5.35965 2.83545 5.31805 2.83688ZM15.092 2.84351C15.0504 2.84196 15.009 2.86072 14.9825 2.89724L14.1019 4.1144C14.0596 4.17285 14.0724 4.25417 14.1305 4.2967C14.1887 4.33923 14.2695 4.32643 14.3118 4.26799L15.1924 3.05084C15.2347 2.99238 15.2219 2.91107 15.1638 2.86854C15.142 2.8526 15.117 2.84441 15.092 2.84351ZM4.65494 3.39605C4.62182 3.39419 4.58801 3.40532 4.56129 3.42951C4.50786 3.47787 4.50356 3.56005 4.55167 3.61378L4.97298 4.08438C5.02108 4.13811 5.10281 4.14243 5.15625 4.09405C5.20969 4.04568 5.21398 3.96345 5.16587 3.90972L4.74461 3.43918C4.72057 3.4123 4.68807 3.3978 4.65494 3.39605ZM15.7468 3.39698C15.7137 3.39884 15.6812 3.41326 15.6571 3.44012L15.2358 3.91061C15.1877 3.96433 15.192 4.04656 15.2454 4.09494C15.2988 4.14331 15.3806 4.13897 15.4287 4.08526L15.85 3.61478C15.8982 3.56105 15.8938 3.47882 15.8404 3.43045C15.8137 3.40627 15.7799 3.39524 15.7468 3.39698ZM4.0194 4.00989C3.98627 4.01175 3.95383 4.02617 3.92978 4.05303C3.88167 4.10677 3.88598 4.18894 3.9394 4.23731L5.05193 5.24434C5.10537 5.29271 5.18709 5.28838 5.23519 5.23466C5.2833 5.18093 5.27905 5.09876 5.2256 5.05039L4.11302 4.04336C4.08629 4.01918 4.05253 4.00814 4.0194 4.00989ZM16.3854 4.0143C16.3523 4.01244 16.3185 4.02353 16.2917 4.04769L15.1785 5.05393C15.1251 5.10226 15.1207 5.18444 15.1687 5.23821C15.2168 5.29197 15.2986 5.29634 15.352 5.248L16.4653 4.24176C16.5188 4.19343 16.5231 4.11126 16.475 4.05749C16.451 4.03061 16.4186 4.01607 16.3854 4.0143ZM3.49088 4.69322C3.44928 4.69167 3.4078 4.71052 3.38139 4.74706C3.33912 4.80554 3.35194 4.88681 3.41012 4.9293L3.91953 5.30146C3.9777 5.34395 4.05852 5.33112 4.10078 5.27262C4.14304 5.21414 4.13025 5.13281 4.07211 5.09032L3.56269 4.71817C3.5409 4.70224 3.51585 4.69412 3.49088 4.69322ZM16.9134 4.69796C16.8885 4.69889 16.8635 4.70692 16.8416 4.72285L16.332 5.09467C16.2738 5.13712 16.2609 5.21846 16.3031 5.27697C16.3454 5.33549 16.4262 5.34837 16.4844 5.30593L16.9941 4.93412C17.0523 4.89166 17.0651 4.81038 17.0229 4.75187C16.9965 4.7153 16.955 4.69653 16.9134 4.69796ZM2.99699 5.4221C2.95546 5.42489 2.91617 5.44802 2.8937 5.48715C2.85775 5.54976 2.87893 5.62925 2.9412 5.6654L4.23755 6.41798C4.29982 6.45412 4.37888 6.43283 4.41483 6.37022C4.45078 6.30761 4.4296 6.22812 4.36733 6.19197L3.07098 5.43939C3.04764 5.42584 3.0219 5.42037 2.99699 5.4221ZM17.4038 5.4221C17.3789 5.42024 17.3532 5.42582 17.3298 5.4394L16.0335 6.19198C15.9712 6.22813 15.95 6.30763 15.986 6.37023C16.0219 6.43284 16.101 6.45414 16.1632 6.41799L17.4597 5.66541C17.5219 5.62926 17.5431 5.54977 17.5072 5.48716C17.4847 5.44803 17.4453 5.42502 17.4038 5.4221ZM2.62357 6.19901C2.57299 6.19777 2.52449 6.22688 2.50253 6.27639C2.47324 6.34242 2.50251 6.41928 2.56817 6.44873L3.14328 6.70666C3.20895 6.73611 3.28539 6.70669 3.31467 6.64066C3.34396 6.57464 3.31464 6.49777 3.24898 6.46833L2.67392 6.21039C2.65752 6.20301 2.64042 6.19935 2.62357 6.19901ZM17.7798 6.20438C17.7629 6.20469 17.7458 6.20841 17.7293 6.21575L17.1541 6.47324C17.0884 6.50266 17.0591 6.57947 17.0883 6.64552C17.1176 6.71156 17.194 6.74109 17.2597 6.71169L17.8349 6.45415C17.9006 6.42476 17.9299 6.34791 17.9007 6.28187C17.8788 6.23234 17.8303 6.20337 17.7798 6.20438ZM2.29075 7.01103C2.24035 7.01527 2.19516 7.04913 2.17845 7.10068C2.15619 7.16942 2.19325 7.24279 2.26163 7.26519L3.6849 7.7315C3.75326 7.75389 3.82623 7.71659 3.84851 7.64787C3.87077 7.57914 3.83371 7.50576 3.76533 7.48337L2.34206 7.01705C2.32498 7.01144 2.30755 7.0096 2.29075 7.01103ZM18.1119 7.01661C18.0951 7.01506 18.0778 7.01692 18.0607 7.02262L16.6371 7.48792C16.5687 7.51028 16.5316 7.58362 16.5538 7.65237C16.576 7.72112 16.649 7.75847 16.7174 7.73612L18.1409 7.27082C18.2093 7.24846 18.2465 7.17512 18.2243 7.10637C18.2076 7.0548 18.1623 7.02091 18.1119 7.01661ZM2.0834 7.86341C2.02294 7.86279 1.96872 7.90499 1.95564 7.96686C1.94069 8.03758 1.9853 8.1066 2.05562 8.12163L2.67157 8.25325C2.74189 8.26828 2.81053 8.22342 2.82548 8.15272C2.84044 8.082 2.79582 8.01298 2.7255 7.99795L2.10961 7.86634C2.10083 7.86448 2.09204 7.86341 2.0834 7.86341ZM18.3177 7.86465C18.309 7.86472 18.3003 7.86589 18.2915 7.86744L17.6756 7.999C17.6053 8.01404 17.5607 8.08299 17.5756 8.15371C17.5906 8.22442 17.6592 8.26931 17.7295 8.25429L18.3454 8.12273C18.4157 8.1077 18.4604 8.03869 18.4454 7.96797C18.4324 7.90609 18.3781 7.86414 18.3177 7.86465ZM1.92646 8.7208C1.86628 8.7266 1.81674 8.77408 1.81013 8.83699C1.80258 8.90888 1.85401 8.97289 1.92551 8.98048L3.41415 9.13874C3.48565 9.14634 3.54931 9.09456 3.55686 9.02267C3.56442 8.95078 3.51293 8.88677 3.44143 8.87917L1.95279 8.72091C1.94385 8.71998 1.93506 8.71998 1.92646 8.7208ZM18.4757 8.73206C18.4671 8.73113 18.4583 8.73113 18.4493 8.73216L16.9605 8.88839C16.889 8.89589 16.8375 8.95982 16.8449 9.03172C16.8524 9.10363 16.916 9.15547 16.9875 9.14796L18.4763 8.99174C18.5478 8.98423 18.5993 8.92031 18.5919 8.8484C18.5854 8.78549 18.5359 8.73794 18.4757 8.73206ZM1.90126 9.59846C1.82936 9.59846 1.77148 9.65665 1.77148 9.72895C1.77148 9.80124 1.82936 9.85944 1.90126 9.85944H2.53093C2.60282 9.85944 2.66076 9.80124 2.66076 9.72895C2.66076 9.65665 2.60282 9.59846 2.53093 9.59846H1.90126ZM17.8699 9.59846C17.798 9.59846 17.7401 9.65665 17.7401 9.72895C17.7401 9.80124 17.798 9.85944 17.8699 9.85944H18.4995C18.5714 9.85944 18.6293 9.80124 18.6293 9.72895C18.6293 9.65665 18.5714 9.59846 18.4995 9.59846H17.8699ZM3.43969 10.3098C3.43109 10.3089 3.4223 10.3089 3.41336 10.3099L1.9245 10.4662C1.85298 10.4737 1.80144 10.5376 1.80889 10.6095C1.81635 10.6814 1.87993 10.7332 1.95144 10.7257L3.4403 10.5695C3.51181 10.562 3.56336 10.4981 3.5559 10.4262C3.54937 10.3632 3.49987 10.3157 3.43969 10.3098ZM16.9603 10.3191C16.9001 10.3249 16.8506 10.3723 16.844 10.4352C16.8364 10.5071 16.8879 10.5711 16.9594 10.5787L18.448 10.737C18.5195 10.7446 18.5832 10.6928 18.5907 10.6209C18.5983 10.549 18.5468 10.485 18.4753 10.4774L16.9867 10.3192C16.9778 10.3182 16.9689 10.3182 16.9603 10.3191ZM2.69756 11.2006C2.68892 11.2007 2.68014 11.2015 2.67135 11.2034L2.0554 11.335C1.98507 11.35 1.94049 11.419 1.95543 11.4897C1.97038 11.5604 2.03901 11.6053 2.10934 11.5902L2.72529 11.4587C2.79562 11.4437 2.8402 11.3747 2.82526 11.304C2.81219 11.2421 2.75801 11.2001 2.69756 11.2006ZM17.7031 11.2018C17.6426 11.2012 17.5885 11.2434 17.5754 11.3052C17.5604 11.376 17.605 11.445 17.6753 11.46L18.2912 11.5916C18.3616 11.6067 18.4302 11.5619 18.4452 11.4912C18.4601 11.4204 18.4155 11.3514 18.3452 11.3363L17.7293 11.2047C17.7205 11.2029 17.7117 11.2018 17.7031 11.2018ZM3.73475 11.7158C3.71795 11.7143 3.7006 11.7161 3.6835 11.7218L2.25989 12.1871C2.19152 12.2095 2.15438 12.2828 2.17661 12.3516C2.19884 12.4203 2.27178 12.4577 2.34016 12.4353L3.76371 11.97C3.83209 11.9477 3.86928 11.8743 3.84705 11.8056C3.83037 11.754 3.78515 11.7201 3.73475 11.7158ZM16.6646 11.7204C16.6142 11.7247 16.5691 11.7585 16.5523 11.8101C16.5301 11.8788 16.5671 11.9522 16.6355 11.9746L18.0588 12.4409C18.1272 12.4633 18.2001 12.426 18.2224 12.3573C18.2447 12.2885 18.2076 12.2152 18.1392 12.1928L16.716 11.7265C16.6989 11.7208 16.6814 11.719 16.6646 11.7204ZM3.19151 12.7349C3.17464 12.7353 3.15758 12.7389 3.14115 12.7463L2.56588 13.0038C2.50019 13.0332 2.47088 13.11 2.50012 13.1761C2.52938 13.2421 2.60577 13.2716 2.67145 13.2422L3.24674 12.9847C3.31242 12.9553 3.34173 12.8785 3.31249 12.8124C3.29057 12.7629 3.24208 12.7339 3.19151 12.7349ZM17.2072 12.7399C17.1566 12.7387 17.1081 12.7678 17.0862 12.8173C17.0569 12.8833 17.0862 12.9602 17.1518 12.9896L17.7269 13.2476C17.7925 13.277 17.869 13.2476 17.8983 13.1816C17.9276 13.1155 17.8983 13.0387 17.8326 13.0092L17.2576 12.7513C17.2412 12.7439 17.2241 12.7402 17.2072 12.7399ZM4.31154 13.0227C4.28663 13.0208 4.26091 13.0264 4.23755 13.04L2.9412 13.7926C2.87893 13.8287 2.85775 13.9082 2.8937 13.9708C2.92965 14.0334 3.00871 14.0547 3.07098 14.0186L4.36733 13.266C4.4296 13.2299 4.45077 13.1503 4.41483 13.0877C4.39235 13.0486 4.35307 13.0256 4.31154 13.0227ZM16.0893 13.0227C16.0478 13.0255 16.0084 13.0486 15.986 13.0877C15.95 13.1503 15.9712 13.2299 16.0335 13.266L17.3298 14.0186C17.3921 14.0547 17.4712 14.0334 17.5072 13.9708C17.5431 13.9082 17.5219 13.8287 17.4597 13.7925L16.1632 13.04C16.1399 13.0264 16.1142 13.0209 16.0893 13.0227ZM3.9882 14.1271C3.96322 14.128 3.93822 14.1361 3.91639 14.152L3.40676 14.5238C3.34856 14.5663 3.33569 14.6476 3.3779 14.7061C3.42012 14.7646 3.50095 14.7776 3.55915 14.7351L4.06884 14.3633C4.12704 14.3208 4.13991 14.2395 4.0977 14.181C4.0713 14.1445 4.0298 14.1256 3.9882 14.1271ZM16.4095 14.1315C16.3679 14.1299 16.3264 14.1488 16.3 14.1853C16.2578 14.2438 16.2706 14.3251 16.3288 14.3676L16.8382 14.7398C16.8963 14.7823 16.9772 14.7694 17.0194 14.7109C17.0617 14.6524 17.0489 14.5711 16.9907 14.5286L16.4813 14.1565C16.4595 14.1406 16.4345 14.1324 16.4095 14.1315ZM5.14245 14.1765C5.10933 14.1747 5.07554 14.1858 5.04881 14.2099L3.93555 15.2162C3.88208 15.2645 3.87774 15.3467 3.92581 15.4004C3.97387 15.4542 4.0556 15.4586 4.10907 15.4102L5.22233 14.404C5.2758 14.3557 5.28014 14.2735 5.23207 14.2197C5.20805 14.1929 5.17558 14.1783 5.14245 14.1765ZM15.2553 14.1801C15.2221 14.182 15.1896 14.1964 15.1656 14.2233C15.1175 14.277 15.1218 14.3592 15.1752 14.4075L16.2877 15.4146C16.3412 15.4629 16.423 15.4586 16.4711 15.4049C16.5192 15.3512 16.5149 15.269 16.4614 15.2206L15.3489 14.2136C15.3221 14.1894 15.2884 14.1784 15.2553 14.1801ZM6.19858 15.1361C6.15698 15.1345 6.11546 15.1533 6.08903 15.1898L5.20844 16.407C5.16614 16.4654 5.17887 16.5467 5.23699 16.5893C5.29513 16.6318 5.376 16.619 5.41829 16.5605L6.29888 15.3434C6.34118 15.2849 6.32845 15.2036 6.27033 15.1611C6.24853 15.1451 6.22355 15.1369 6.19858 15.1361ZM14.195 15.1415C14.17 15.1425 14.145 15.1505 14.1232 15.1664C14.065 15.2089 14.0521 15.2902 14.0943 15.3487L14.9733 16.567C15.0155 16.6255 15.0963 16.6385 15.1545 16.596C15.2127 16.5536 15.2256 16.4723 15.1834 16.4138L14.3044 15.1954C14.278 15.1589 14.2366 15.1401 14.195 15.1415ZM5.0618 15.3295C5.02867 15.3314 4.99618 15.3458 4.97213 15.3727L4.55082 15.8432C4.50271 15.8969 4.50697 15.9791 4.56041 16.0275C4.61384 16.0759 4.69556 16.0715 4.74367 16.0178L5.16503 15.5473C5.21315 15.4936 5.20883 15.4113 5.15542 15.363C5.12868 15.3388 5.09493 15.3278 5.0618 15.3295ZM15.3382 15.3301C15.3051 15.3283 15.2713 15.3394 15.2446 15.3636C15.1912 15.412 15.1869 15.4941 15.235 15.5479L15.6562 16.0185C15.7043 16.0722 15.7861 16.0765 15.8395 16.0281C15.8929 15.9798 15.8972 15.8975 15.8491 15.8438L15.4279 15.3733C15.4038 15.3464 15.3713 15.3319 15.3382 15.3301ZM7.42829 15.8521C7.37771 15.8509 7.32928 15.88 7.30731 15.9295L6.69741 17.304C6.66812 17.3701 6.69739 17.4469 6.76306 17.4764C6.82872 17.5058 6.90516 17.4764 6.93445 17.4104L7.54434 16.0358C7.57363 15.9698 7.54436 15.8929 7.47869 15.8635C7.46229 15.8561 7.44515 15.8524 7.42829 15.8521ZM12.9643 15.8559C12.9474 15.8562 12.9303 15.8599 12.9139 15.8672C12.8482 15.8966 12.8188 15.9734 12.848 16.0394L13.456 17.4148C13.4852 17.4809 13.5616 17.5104 13.6273 17.4811C13.693 17.4517 13.7224 17.3749 13.6932 17.3088L13.0852 15.9334C13.0633 15.8839 13.0149 15.8549 12.9643 15.8559ZM6.35659 16.2771C6.31506 16.2799 6.27577 16.303 6.25331 16.3421L5.93847 16.8905C5.90252 16.9531 5.9237 17.0326 5.98597 17.0687C6.04823 17.1048 6.12729 17.0836 6.16324 17.0209L6.47808 16.4726C6.51402 16.41 6.49284 16.3305 6.43058 16.2944C6.40724 16.2808 6.38151 16.2754 6.35659 16.2771ZM14.0442 16.2771C14.0193 16.2752 13.9936 16.2808 13.9703 16.2944C13.908 16.3305 13.8868 16.41 13.9228 16.4726L14.2376 17.021C14.2736 17.0836 14.3526 17.1049 14.4149 17.0687C14.4772 17.0326 14.4983 16.9531 14.4624 16.8905L14.1475 16.3421C14.1251 16.303 14.0857 16.28 14.0442 16.2771ZM8.78603 16.2967C8.72557 16.2961 8.6714 16.3383 8.65833 16.4001L8.34725 17.8725C8.33229 17.9432 8.37691 18.0122 8.44722 18.0272C8.51755 18.0423 8.5862 17.9974 8.60114 17.9267L8.91222 16.4544C8.92717 16.3837 8.88256 16.3146 8.81224 16.2996C8.80345 16.2978 8.79466 16.2967 8.78603 16.2967ZM11.6102 16.2977C11.6015 16.2977 11.5928 16.2986 11.584 16.3005C11.5137 16.3154 11.469 16.3844 11.4839 16.4551L11.794 17.9277C11.8088 17.9984 11.8775 18.0433 11.9478 18.0283C12.0182 18.0133 12.0628 17.9443 12.0479 17.8736L11.7378 16.4012C11.7248 16.3393 11.6706 16.2972 11.6102 16.2977ZM10.2004 16.4462C10.1285 16.4462 10.0706 16.5044 10.0706 16.5767V18.0818C10.0706 18.1541 10.1285 18.2123 10.2004 18.2123C10.2723 18.2123 10.3302 18.1541 10.3302 18.0818V16.5767C10.3302 16.5044 10.2723 16.4462 10.2004 16.4462ZM7.81817 16.9326C7.76777 16.9369 7.72254 16.9708 7.70587 17.0223L7.51124 17.6245C7.48901 17.6932 7.52616 17.7666 7.59453 17.7889C7.6629 17.8113 7.73585 17.7739 7.75808 17.7051L7.95271 17.103C7.97494 17.0343 7.93779 16.9609 7.86942 16.9386C7.85234 16.933 7.83498 16.9311 7.81817 16.9326ZM12.5816 16.9329C12.5648 16.9313 12.5475 16.9332 12.5304 16.9388C12.462 16.9612 12.4248 17.0345 12.447 17.1033L12.6416 17.7055C12.6638 17.7742 12.7368 17.8115 12.8052 17.7892C12.8735 17.7668 12.9107 17.6936 12.8885 17.6248L12.6939 17.0226C12.6772 16.9711 12.632 16.9372 12.5816 16.9329ZM9.38579 17.2682C9.3256 17.2741 9.27603 17.3216 9.26945 17.3845L9.20364 18.0142C9.19612 18.0861 9.24763 18.15 9.31914 18.1576C9.39064 18.1651 9.45427 18.1133 9.46179 18.0414L9.5276 17.4118C9.53513 17.3399 9.48361 17.2759 9.41211 17.2684C9.40317 17.2674 9.39439 17.2674 9.38579 17.2682ZM11.0098 17.2689C11.0012 17.2679 10.9923 17.2679 10.9834 17.269C10.9119 17.2765 10.8603 17.3404 10.8678 17.4123L10.9332 18.042C10.9407 18.1139 11.0043 18.1657 11.0758 18.1582C11.1473 18.1507 11.1988 18.0868 11.1914 18.0149L11.126 17.3852C11.1195 17.3223 11.07 17.2747 11.0098 17.2689Z"
                fill="#F4F2F3"
            />
            <g opacity="0.409" filter="url(#filter0_f_1510_9490)">
                <path
                    d="M16.2829 4.50916L9.18266 8.65714L4.69336 15.7635L11.2608 10.8722L16.2829 4.50916Z"
                    fill="black"
                />
            </g>
            <path
                d="M11.218 10.8003L9.18286 8.65724L16.4024 3.77393L11.218 10.8003Z"
                fill="#FF5150"
            />
            <path
                d="M11.2181 10.8003L9.18291 8.65723L3.99854 15.6836L11.2181 10.8003Z"
                fill="#F1F1F1"
            />
            <path
                opacity="0.243"
                d="M3.99854 15.6836L11.2181 10.8003L16.4025 3.77393L3.99854 15.6836Z"
                fill="black"
            />
        </g>
        <defs>
            <filter
                id="filter0_f_1510_9490"
                x="2.14852"
                y="1.96432"
                width="16.6793"
                height="16.3439"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                />
                <feGaussianBlur
                    stdDeviation="1.27242"
                    result="effect1_foregroundBlur_1510_9490"
                />
            </filter>
            <linearGradient
                id="paint0_linear_1510_9490"
                x1="10.2002"
                y1="19.4398"
                x2="10.2002"
                y2="0.0175272"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#BDBDBD" />
                <stop offset="1" stop-color="white" />
            </linearGradient>
            <radialGradient
                id="paint1_radial_1510_9490"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(10.2407 8.42362) scale(9.65803 9.71116)"
            >
                <stop stop-color="#06C2E7" />
                <stop offset="0.25" stop-color="#0DB8EC" />
                <stop offset="0.5" stop-color="#12AEF1" />
                <stop offset="0.75" stop-color="#1F86F9" />
                <stop offset="1" stop-color="#107DDD" />
            </radialGradient>
            <clipPath id="clip0_1510_9490">
                <rect
                    width="20.4"
                    height="20.4"
                    fill="white"
                    transform="translate(0.000488281)"
                />
            </clipPath>
        </defs>
    </svg>`,
};

// Copyright baseline-status contributors
// Licensed under the Apache License, Version 2.0
// See the LICENSE-APACHE file in the project root for details.


const SUPPORT_ICONS = {
    available: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="21"
        fill="none"
    >
        <path
            fill="currentColor"
            d="M1.253 3.31a8.843 8.843 0 0 1 5.47-1.882c4.882 0 8.838 3.927 8.838 8.772 0 4.845-3.956 8.772-8.837 8.772a8.842 8.842 0 0 1-5.47-1.882c-.237.335-.49.657-.758.966a10.074 10.074 0 0 0 6.228 2.14c5.562 0 10.07-4.475 10.07-9.996 0-5.52-4.508-9.996-10.07-9.996-2.352 0-4.514.8-6.228 2.14.268.309.521.631.757.966Z"
        />
        <path
            fill="currentColor"
            d="M11.348 8.125 6.34 13.056l-3.006-2.954 1.002-.985 1.999 1.965 4.012-3.942 1.002.985Z"
        />
    </svg>`,
    unavailable: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="21"
        fill="none"
    >
        <path
            fill="currentColor"
            d="M1.254 3.31a8.843 8.843 0 0 1 5.47-1.882c4.881 0 8.838 3.927 8.838 8.772 0 4.845-3.957 8.772-8.838 8.772a8.842 8.842 0 0 1-5.47-1.882c-.236.335-.49.657-.757.966a10.074 10.074 0 0 0 6.227 2.14c5.562 0 10.071-4.475 10.071-9.996 0-5.52-4.509-9.996-10.07-9.996-2.352 0-4.515.8-6.228 2.14.268.309.52.631.757.966Z"
        />
        <path
            fill="currentColor"
            d="m10.321 8.126-1.987 1.972 1.987 1.972-.993.986-1.987-1.972-1.987 1.972-.993-.986 1.986-1.972-1.986-1.972.993-.986 1.987 1.972L9.328 7.14l.993.986Z"
        />
    </svg>`,
    no_data: x`<svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="21"
        viewBox="0 0 17 21"
        fill="none"
    >
        <path
            d="M7.18169 12.2783H5.98706C5.99134 11.8703 6.02774 11.5367 6.09625 11.2775C6.16904 11.014 6.28679 10.7738 6.4495 10.5571C6.61221 10.3404 6.82844 10.0939 7.0982 9.8176C7.29516 9.61785 7.475 9.43085 7.63771 9.2566C7.8047 9.0781 7.93958 8.88685 8.04235 8.68285C8.14511 8.4746 8.19649 8.22598 8.19649 7.93698C8.19649 7.64373 8.14297 7.39085 8.03592 7.17835C7.93316 6.96585 7.77901 6.80223 7.57348 6.68748C7.37224 6.57273 7.12175 6.51535 6.82202 6.51535C6.57367 6.51535 6.33817 6.55998 6.11552 6.64923C5.89286 6.73848 5.71302 6.8766 5.576 7.0636C5.43898 7.24635 5.36833 7.48648 5.36405 7.78398H4.17584C4.18441 7.30373 4.3043 6.89148 4.53552 6.54723C4.77102 6.20298 5.08787 5.93948 5.48609 5.75673C5.8843 5.57398 6.32961 5.4826 6.82202 5.4826C7.36581 5.4826 7.82825 5.58035 8.20934 5.77585C8.5947 5.97135 8.88801 6.25185 9.08926 6.61735C9.2905 6.9786 9.39113 7.40785 9.39113 7.9051C9.39113 8.2876 9.31191 8.64035 9.15348 8.96335C8.99934 9.2821 8.80023 9.58173 8.55617 9.86222C8.3121 10.1427 8.05305 10.4105 7.77901 10.6655C7.54351 10.8822 7.38508 11.1266 7.30373 11.3986C7.22237 11.6706 7.18169 11.9639 7.18169 12.2783ZM5.93568 14.2992C5.93568 14.108 5.99562 13.9465 6.11552 13.8147C6.23541 13.683 6.40882 13.6171 6.63576 13.6171C6.86698 13.6171 7.04253 13.683 7.16243 13.8147C7.28232 13.9465 7.34226 14.108 7.34226 14.2992C7.34226 14.482 7.28232 14.6392 7.16243 14.771C7.04253 14.9027 6.86698 14.9686 6.63576 14.9686C6.40882 14.9686 6.23541 14.9027 6.11552 14.771C5.99562 14.6392 5.93568 14.482 5.93568 14.2992Z"
            fill="currentColor"
        />
        <path
            d="M1.25317 3.31021C2.75786 2.13162 4.65827 1.4281 6.72373 1.4281C11.6047 1.4281 15.5615 5.35546 15.5615 10.2001C15.5615 15.0447 11.6047 18.9721 6.72373 18.9721C4.65827 18.9721 2.75786 18.2686 1.25317 17.09C1.01715 17.425 0.764387 17.7475 0.496094 18.0563C2.20987 19.3966 4.37247 20.1961 6.72373 20.1961C12.2857 20.1961 16.7946 15.7207 16.7946 10.2001C16.7946 4.67946 12.2857 0.204102 6.72373 0.204102C4.37247 0.204102 2.20987 1.00363 0.496094 2.34391C0.764386 2.65272 1.01715 2.97522 1.25317 3.31021Z"
            fill="currentColor"
        />
    </svg>`,
};

const statusTypes = {
    NEWLY: 'newly',
    NO_DATA: 'no_data'};

const implementationStatusTypes = {
    NO: 'unavailable',
    UNKNOWN: 'no_data',
};

const implementationTypes = {
    NOT_SUPPORTED: { status: implementationStatusTypes.NO },
    UNKNOWN: { status: implementationStatusTypes.UNKNOWN },
};

const browserNameList = ['chrome', 'edge', 'firefox', 'safari'];

const messages = {
    limited: {
        badge: 'Ограниченная поддержка',
        description:
            'Эта функциональность не является базовой, поскольку она пока не работает в некоторых наиболее распространённых браузерах',
    },
    newly: {
        badge: 'Недавно доступно',
        description:
            'Эта функциональность работает в новейших версиях наиболее распространённых браузеров',
    },
    widely: {
        badge: 'Широко распростанено',
        description:
            'Эта функциональность работает во многих версиях наиболее распространённых браузеров',
    },
    no_data: {
        badge: 'Неизвестно',
        description:
            'Информации о поддержке этой функциональности браузерами не найдена',
    },
    loading: {
        badge: 'Загрузка',
        description: '',
    },
    supported: {
        chrome: 'Поддерживается в Chrome',
        edge: 'Поддерживается в Edge',
        firefox: 'Поддерживается в Firefox',
        safari: 'Поддерживается в Safari',
    },

    supportedStatus: {
        available: 'да',
        unavailable: 'нет',
        no_data: 'неизвестно',
    },
    unknownName: 'Неизвестное свойство',
    date: 'начиная с',
    featureLinkText: 'Подробнее',
    specLinkText: 'Спецификация',
};

const DEFAULT = {
    implementation: implementationTypes.NOT_SUPPORTED,
};

const getBrowserImplementationList = (
    implementations,
    defaultData = DEFAULT.implementation,
) => {
    return browserNameList.map(browserName => ({
        id: browserName,
        data: implementations?.[browserName] ?? defaultData,
    }));
};

const EMPTY_BASELINE_OBJ = {
    name: messages.unknownName,
    badge: messages.no_data.badge,
    supportStatus: statusTypes.NO_DATA,
    implementations: getBrowserImplementationList(
        null,
        implementationTypes.UNKNOWN,
    ),
    specification: null,
};

const LOADING_BASELINE_OBJ = {
    name: '',
    badge: messages.loading.badge,
    loading: true,
};

const getAriaLabel = obj => {
    const { badge, supportStatus, implementations, dates, loading } = obj;

    const labelPar1 = [badge, dates?.year].filter(Boolean).join(' ');

    if (loading) {
        return labelPar1;
    }

    const statuses = implementations.map(browser => browser.data.status);

    if (supportStatus === statusTypes.NO_DATA) {
        statuses.fill(implementationStatusTypes.UNKNOWN);
    }

    const labelPart2 = implementations
        .map((browser, index) => {
            const id = browser.id;
            return `${messages.supported[id]}: ${messages.supportedStatus[statuses[index]]}.`;
        })
        .join(' ');

    return `${labelPar1 ? `${labelPar1}. ` : ''}${labelPart2}`;
};

const getDescription = obj => {
    const { supportStatus, dates = {}, id, specification, loading } = obj;

    if (loading) return {};

    const { fullDate } = dates;

    const result = {
        text: `${messages[supportStatus].description}${fullDate ? ` ${messages.date} ${fullDate}` : '.'}`,
        ...(supportStatus !== statusTypes.NO_DATA && {
            featureLink: `https://web-platform-dx.github.io/web-features-explorer/features/${id}/`,
            featureLinkText: messages.featureLinkText,
        }),
        ...(specification && {
            specLinks: specification.links.map(item => item.link),
            specLinkText: messages.specLinkText,
        }),
    };

    return result;
};

const getBaselineDates = baseline => {
    const { low_date: lowDateStr, high_date: highDateStr } = baseline;

    const dateStr = highDateStr ?? lowDateStr;

    const year = dateStr ? dateStr.split('-')[0] : '';
    const fullDate = dateStr
        ? new Intl.DateTimeFormat('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          }).format(new Date(dateStr))
        : '';

    return {
        fullDate,
        year,
    };
};

const getEmptyBaselineObject = sourceData => {
    const data = {
        ...EMPTY_BASELINE_OBJ,
        ...(sourceData?.loading && { ...LOADING_BASELINE_OBJ }),
        ...(sourceData?.feature_id && { name: sourceData.feature_id }),
    };

    return {
        ...data,
        description: getDescription(data),
        ariaLabel: getAriaLabel(data),
    };
};

const transformToBaselineObject = responseData => {
    if (!responseData || !responseData.baseline) {
        return getEmptyBaselineObject(responseData);
    }

    const {
        name,
        baseline,
        browser_implementations: implementations = {},
        feature_id: id,
        spec: specification = {},
    } = responseData;

    const supportStatus = baseline.status || statusTypes.NO_DATA;
    const badge = messages[supportStatus].badge;
    const dates = getBaselineDates(baseline);

    const data = {
        name,
        badge,
        id,
        supportStatus,
        implementations: getBrowserImplementationList(implementations),
        dates,
        showYear: supportStatus === statusTypes.NEWLY && dates.year !== '',
        specification,
    };

    return {
        ...data,
        description: getDescription(data),
        ariaLabel: getAriaLabel(data),
    };
};

class DokaBaseline extends i$1 {
    static get styles() {
        return i$4`
            :host {
                --limited: 34 100% 46%;
                --newly: 214 82% 51%;
                --widely: 137 65% 34%;
                --no_data: 0 0% 44%;

                --limited-dark: 34 88% 52%;
                --newly-dark: 217 90% 53%;
                --widely-dark: 138 69% 38%;
                --no_data-dark: 0 0% 44%;

                --doka-baseline-limited-color: light-dark(
                    hsl(var(--limited)),
                    hsl(var(--limited-dark))
                );
                --doka-baseline-newly-color: light-dark(
                    hsl(var(--newly)),
                    hsl(var(--newly-dark))
                );
                --doka-baseline-widely-color: light-dark(
                    hsl(var(--widely)),
                    hsl(var(--widely-dark))
                );
                --doka-baseline-no_data-color: light-dark(
                    hsl(var(--no_data)),
                    hsl(var(--no_data-dark))
                );

                --doka-baseline-bgcolor-limited: light-dark(
                    hsl(var(--limited) / 0.14),
                    hsl(var(--limited-dark) / 0.07)
                );
                --doka-baseline-bgcolor-newly: light-dark(
                    hsl(var(--newly) / 0.14),
                    hsl(var(--newly-dark) / 0.07)
                );
                --doka-baseline-bgcolor-widely: light-dark(
                    hsl(var(--widely) / 0.14),
                    hsl(var(--widely-dark) / 0.07)
                );

                --doka-baseline-color-border: light-dark(
                    hsl(0, 0%, 85%),
                    hsl(0, 0%, 50%)
                );

                --doka-baseline-badge-color: hsl(0, 0%, 100%);
                --doka-baseline-font-size: var(--font-size-m, 14px);
                --doka-baseline-link-color: var(--text-color, inherit);
                --doka-baseline-stroke-color: var(
                    --stroke-color,
                    var(--doka-baseline-color-border)
                );
                --doka-baseline-max-width: 1440px;

                display: block;
                max-width: var(--doka-baseline-max-width);
            }

            .doka-baseline {
                padding: 0 1rem;
                font-size: var(--doka-baseline-font-size);
                font-style: normal;
                border-radius: 8px;

                details:open {
                    padding-bottom: 1px;

                    .browser-version {
                        visibility: visible;
                    }
                }
            }

            .doka-baseline.with-name {
                padding-top: 2px;
            }

            .doka-baseline.limited {
                background: var(--doka-baseline-bgcolor-limited);

                .badge {
                    background: var(--doka-baseline-limited-color);
                }
            }

            .doka-baseline.newly {
                background: var(--doka-baseline-bgcolor-newly);

                .badge {
                    background: var(--doka-baseline-newly-color);
                }
            }

            .doka-baseline.widely {
                background: var(--doka-baseline-bgcolor-widely);

                .badge {
                    background: var(--doka-baseline-widely-color);
                }
            }

            .doka-baseline.no_data {
                .badge {
                    background: var(--doka-baseline-no_data-color);
                }
                border: solid 1px var(--doka-baseline-color-border);
            }

            .doka-baseline.loading {
                border: none;
                pointer-events: none;
            }

            .name {
                font-weight: normal;
                font-size: 20px;
                margin: 0;
                padding-top: 8px;
            }

            .status-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                gap: 1rem;
            }

            .status-title {
                display: flex;
                align-items: center;
                white-space: nowrap;
                gap: 0.5rem;
                line-height: 2;
                font-weight: bold;
            }

            .badge {
                padding: 0 0.5rem;
                text-transform: uppercase;
                font-size: 12px;
                border-radius: 4px;
                color: var(--doka-baseline-badge-color);
            }

            .browsers {
                display: flex;
                gap: 16px;
                max-width: 200px;
                font-size: 0;
            }

            .browsers .browser-support {
                white-space: nowrap;
                position: relative;
                line-height: normal;
            }

            .support-widely,
            .support-available {
                color: var(--doka-baseline-widely-color);
            }

            .browsers.newly {
                .support-available {
                    color: var(--doka-baseline-newly-color);
                }
            }

            .support-unavailable {
                color: var(--doka-baseline-limited-color);
            }

            .support-no_data {
                color: var(--doka-baseline-no_data-color);
            }

            .browser-version {
                visibility: hidden;
                position: absolute;
                width: 50%;
                text-align: center;
                font-size: 14px;
                font-weight: normal;
            }

            summary {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 16px 0;
                cursor: pointer;
                font-size: 16px;
            }

            details > summary .open-icon {
                width: 10px;
                height: 20px;
                line-height: normal;
                margin-left: auto;
                color: inherit;
            }

            details > summary .open-icon svg {
                transition: transform 0.3s;
            }

            details[open] summary .open-icon svg {
                transform: rotate(180deg);
            }

            details {
                p + p {
                    margin-top: 12px;
                    margin-bottom: 16px;
                }

                p.link-list a {
                    margin-right: 1rem;
                }

                a,
                a:active,
                a:visited {
                    text-decoration-color: var(--doka-baseline-stroke-color);
                    color: var(--doka-baseline-link-color);
                    text-underline-offset: 0.125em;
                }
            }
        `;
    }

    static properties = {
        groupId: { type: String },
        showName: { type: String },
        showFeatLink: { type: String },
        showSpecLinks: { type: String },
    };

    constructor() {
        super();
        this.groupId = '';
        this.showFeatLink = 'false';
        this.showName = 'false';
        this.showSpecLinks = 'false';
    }

    fetchData = new h(this, {
        task: async ([id], { signal }) => {
            const url = `https://api.webstatus.dev/v1/features/${id}`;
            const response = await fetch(url, { signal, cache: 'force-cache' });

            if (!response.ok) {
                throw new Error(response.status);
            }

            return response.json();
        },
        args: () => [this.groupId],
    });

    renderStatusTitle(baselineObj) {
        const { badge, dates, showYear } = baselineObj;
        return x`
            <div class="status-title">
                <span class="badge">${badge}</span>${showYear
                    ? `${dates.year}`
                    : ''}
            </div>
        `;
    }

    renderBrowserSupport(browser) {
        const { id, data } = browser;
        const { status = 'unavailable', version } = data;

        return x`
            <span class="browser-support">
                ${ICONS[id]}
                <browser-support-icon class="support-${status}">
                    ${SUPPORT_ICONS[status]}
                </browser-support-icon>
                ${version
                    ? x`<div class="browser-version">${version}</div>`
                    : ''}
            </span>
        `;
    }

    renderImplementationsInfo(baselineObj) {
        const { implementations, supportStatus } = baselineObj;

        return x`
            <div class="browsers ${supportStatus}">
                ${implementations.map(browser =>
                    this.renderBrowserSupport(browser),
                )}
            </div>
        `;
    }

    renderSpecLinks(description) {
        if (this.showSpecLinks !== 'true') return '';

        const { specLinks, specLinkText } = description;

        if (specLinks) {
            return x`
                <p class="link-list">
                    ${specLinks.map(
                        link =>
                            x`<a
                                href=${link}
                                target="_blank"
                                rel="noopener noreferrer"
                                >${specLinkText}
                            </a>`,
                    )}
                </p>
            `;
        }
    }

    renderDescription(baselineObj) {
        const { description } = baselineObj;
        const { text, featureLink, featureLinkText } = description;
        const showFeatLink =
            this.showFeatLink === 'true' && Boolean(featureLink);

        return x`
            <p>${text}</p>
            ${showFeatLink
                ? x`
                      <p>
                          <a
                              href=${featureLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              >${featureLinkText}</a
                          >
                      </p>
                  `
                : ''}
            ${this.renderSpecLinks(description)}
        `;
    }

    renderName(name) {
        if (this.showName === 'true') {
            return x`<div class="name">${name}</div>`;
        }
        return null;
    }

    renderBaseline(baselineObj) {
        if (baselineObj === null) {
            return null;
        }

        const { name, ariaLabel, supportStatus } = baselineObj;

        const mainClass = `doka-baseline ${supportStatus}${this.showName === 'true' ? ' with-name' : ''}${baselineObj.loading ? ' loading' : ''}`;

        return x`
            <div class=${mainClass}>
                ${this.renderName(name)}
                <details>
                    <summary aria-label="${ariaLabel}">
                        <baseline-icon
                            support="${supportStatus}"
                            aria-hidden="true"
                        ></baseline-icon>
                        <div class="status-container" aria-hidden="true">
                            ${this.renderStatusTitle(baselineObj)}
                            ${this.renderImplementationsInfo(baselineObj)}
                        </div>

                        <div>
                            <span class="open-icon" aria-hidden="true">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="11"
                                    height="7"
                                    viewBox="0 0 11 7"
                                    fill="none"
                                >
                                    <path
                                        d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </span>
                        </div>
                    </summary>
                    ${this.renderDescription(baselineObj)}
                </details>
            </div>
        `;
    }

    render() {
        if (!this.groupId) {
            return null;
        }

        return this.fetchData.render({
            pending: () => {
                const loadingBaselineObj = transformToBaselineObject({
                    loading: true,
                    feature_id: this.groupId,
                });
                return this.renderBaseline(loadingBaselineObj);
            },
            complete: responseData => {
                const baselineObj = transformToBaselineObject(responseData);

                return this.renderBaseline(baselineObj);
            },
            error: () => {
                const emptyBaselineObj = transformToBaselineObject();
                return this.renderBaseline(emptyBaselineObj);
            },
        });
    }
}

export { DokaBaseline };
