import{s as p,x as c,i as h}from"./lit-element-e618a7a4.js";import{b as d,n as g,t as m}from"./mdi-eac7c7d4.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const u=a=>o=>typeof o=="function"?((s,e)=>(customElements.define(s,e),e))(a,o):((s,e)=>{const{kind:t,elements:i}=e;return{kind:t,elements:i,finisher(r){customElements.define(s,r)}}})(a,o);var f=Object.defineProperty,v=Object.getOwnPropertyDescriptor,n=(a,o,s,e)=>{for(var t=e>1?void 0:e?v(o,s):o,i=a.length-1,r;i>=0;i--)(r=a[i])&&(t=(e?r(o,s,t):r(t))||t);return e&&t&&f(o,s,t),t};let l=class extends p{async showDialog(a){this._params=a,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?c`
      <ha-dialog open .heading=${!0} @closed=${this.closeDialog} @close-dialog=${this.closeDialog}>
        <ha-dialog-header slot="heading">
          <ha-icon-button slot="navigationIcon" dialogAction="cancel" .path=${d}>
          </ha-icon-button>
            <span slot="title">
              ${this.hass.localize("state_badge.default.error")}
            </span>
        </ha-dialog-header>
        <div class="wrapper">
          ${this._params.error||""}
        </div>

        <mwc-button slot="primaryAction" style="float: left" @click=${this.closeDialog} dialogAction="close">
          ${this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    `:c``}static get styles(){return h`
      div.wrapper {
        color: var(--primary-text-color);
      }
    `}};n([g({attribute:!1})],l.prototype,"hass",2);n([m()],l.prototype,"_params",2);l=n([u("error-dialog")],l);export{l as ErrorDialog};
