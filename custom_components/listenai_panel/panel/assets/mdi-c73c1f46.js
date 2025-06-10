/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const a=(i,r)=>r.kind==="method"&&r.descriptor&&!("value"in r.descriptor)?{...r,finisher(e){e.createProperty(r.key,i)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:r.key,initializer(){typeof r.initializer=="function"&&(this[r.key]=r.initializer.call(this))},finisher(e){e.createProperty(r.key,i)}},n=(i,r,e)=>{r.constructor.createProperty(e,i)};function s(i){return(r,e)=>e!==void 0?n(i,r,e):a(i,r)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function d(i){return s({...i,state:!0})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var t;const o=window;((t=o.HTMLSlotElement)===null||t===void 0?void 0:t.prototype.assignedElements)!=null;var L="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",c="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",l="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z";export{l as a,L as b,c as m,s as p,d as s};
