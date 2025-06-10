import{L as p,h as c,c as h}from"./lit-element-7f78e8e7.js";import{b as d,p as m,s as u}from"./mdi-c73c1f46.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const g=(e,t)=>(customElements.define(e,t),t),f=(e,t)=>{const{kind:a,elements:s}=t;return{kind:a,elements:s,finisher(o){customElements.define(e,o)}}},v=e=>t=>typeof t=="function"?g(e,t):f(e,t);var _=Object.defineProperty,y=Object.getOwnPropertyDescriptor,n=(e,t,a,s)=>{for(var o=s>1?void 0:s?y(t,a):t,i=e.length-1,l;i>=0;i--)(l=e[i])&&(o=(s?l(t,a,o):l(o))||o);return s&&o&&_(t,a,o),o};let r=class extends p{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?c`
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
    `}};n([m({attribute:!1})],r.prototype,"hass",2);n([u()],r.prototype,"_params",2);r=n([v("error-dialog")],r);export{r as ErrorDialog};
