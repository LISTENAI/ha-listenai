import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";


export class MyTextarea extends LitElement {
    @property({ type: String }) label = "";
    @property({ type: String }) value = "";

    static styles = css`
    :host {
      display: block;
      margin: 8px 0;
      width: 100%;
    }
    label {
      font-size: 14px;
      color: var(--primary-text-color);
      margin-bottom: 4px;
      display: block;
    }
    .my-textarea {
    width: 100%;
        box-sizing:border-box;
      min-height: 80px;
      padding: 8px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      resize: vertical;
    }
  `;

    render() {
        return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}
      <textarea
        class="my-textarea"
        .value=${this.value}
        @input=${(e: Event) => {
                this.value = (e.target as HTMLTextAreaElement).value;
                this.dispatchEvent(new CustomEvent("value-changed", { detail: this.value }));
            }}
      ></textarea>
    `;
    }
}
const tag = 'my-textarea';
if (!customElements.get(tag)) {
    customElements.define(tag, MyTextarea);
}