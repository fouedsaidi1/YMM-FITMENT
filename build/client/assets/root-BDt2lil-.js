import{t as m,v as x,w as S,x as w,r as n,_ as f,y as a,j as e,M as j,L as g,O as k,S as M}from"./components-BNdW9vrW.js";/**
 * @remix-run/react v2.17.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let l="positions";function L({getKey:r,...c}){let{isSpaMode:u}=m(),o=x(),d=S();w({getKey:r,storageKey:l});let p=n.useMemo(()=>{if(!r)return null;let t=r(o,d);return t!==o.key?t:null},[]);if(u)return null;let y=((t,h)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let i=JSON.parse(sessionStorage.getItem(t)||"{}")[h||window.history.state.key];typeof i=="number"&&window.scrollTo(0,i)}catch(s){console.error(s),sessionStorage.removeItem(t)}}).toString();return n.createElement("script",f({},c,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${y})(${a(JSON.stringify(l))}, ${a(JSON.stringify(p))})`}}))}const O="/assets/styles-BeiPL2RV.css",v=()=>[{rel:"stylesheet",href:O}];function _(){return e.jsxs("html",{lang:"en",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),e.jsx(j,{}),e.jsx(g,{})]}),e.jsxs("body",{children:[e.jsx(k,{}),e.jsx(L,{}),e.jsx(M,{})]})]})}export{_ as default,v as links};
