import{L as m,h as r,c as h}from"./lit-element-7f78e8e7.js";import{b as d,p as g,s as f}from"./mdi-c73c1f46.js";import{c as u}from"../styles.js";var _=Object.defineProperty,v=Object.getOwnPropertyDescriptor,p=(i,t,o,s)=>{for(var a=s>1?void 0:s?v(t,o):t,e=i.length-1,l;e>=0;e--)(l=i[e])&&(a=(s?l(t,o,a):l(a))||a);return s&&a&&_(t,o,a),a};class c extends m{async showDialog(t){this._params=t,await this.updateComplete}async closeDialog(){this._params&&this._params.cancel(),this._params=void 0}render(){return this._params?r`
      <ha-dialog open .heading=${!0} @closed=${this.closeDialog} @close-dialog=${this.closeDialog}>
        <ha-dialog-header slot="heading">
          <ha-icon-button slot="navigationIcon" dialogAction="cancel" .path=${d}>
          </ha-icon-button>
          <span slot="title">${this._params.title}</span>
        </ha-dialog-header>
        <div class="wrapper">
          ${this._params.description}
        </div>
        <mwc-button slot="primaryAction" @click=${this.cancelClick} dialogAction="close">
          ${this.hass.localize("ui.dialogs.generic.cancel")}
        </mwc-button>
        <mwc-button slot="secondaryAction" style="float: left" @click=${this.confirmClick} aria-label dialogAction="close">
          ${this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    `:r``}confirmClick(){this._params.confirm()}cancelClick(){this._params.cancel()}static get styles(){return h`
      ${u}
      div.wrapper {
        color: var(--primary-text-color);
      }
    `}}p([g({attribute:!1})],c.prototype,"hass",2);p([f()],c.prototype,"_params",2);const n="confirm-delete-dialog";customElements.get(n)||customElements.define(n,c);export{c as ConfirmDeleteDialog};
