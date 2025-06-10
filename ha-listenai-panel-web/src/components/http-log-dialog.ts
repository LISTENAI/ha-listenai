import { LitElement, html, css, property } from 'lit-element';

export class HttpLogDialog extends LitElement {
    @property({ type: Boolean }) open = false;
    @property({ type: Array }) data: any[] = [];

    static styles = css`
    .log-dialog .container{width:500px!important;max-height: 70vh; overflow-y: auto;}
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 6px;
      overflow: auto;
    }
    .log-item {
      margin-bottom: 20px;
    }
    button {
      margin-top: 20px;
      padding: 8px 16px;
      border: none;
      background: #007bff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
    details{width:100%;}
     .log-entry {
      margin-bottom: 1.5em;
    }
    pre {
      background-color: #f7f7f7;
      padding: 8px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.9em;
    }
    .meta {
      margin-bottom: 4px;
    }
    `;

    render() {
        return html`
        <ha-dialog .open=${this.open} heading="日志记录" hideActions class='log-dialog' @closed=${this._handleDialogClosed}>
           <div  class='container'>
          ${this?.data?.length === 0
                ? html`<p>暂无日志记录。</p>`
            : this?.data?.map(
                    (log) => html`
                  <details>
                    <summary>
                      🕒 ${log.timestamp} |  ${log.app_name}
                    </summary>
                    <div>
                      <b>📤 请求体：</b>
                      <pre>${JSON.stringify(log.request, null, 2)}</pre>
                    </div>
                    <div>
                      <b>📥 响应体：</b>
                      <pre>${log.response}</pre>
                    </div>
                  </details>
                `
                )}
        </div>
        <mwc-button slot="primaryAction" dialogAction="close">关闭</mwc-button>
        </ha-dialog>
    `;
    }

    private _handleDialogClosed() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('dialog-closed',
            { bubbles: true, composed: true }
        ));
    }
}

const tag = 'http-log-dialog';
if (!customElements.get(tag)) {
    customElements.define(tag, HttpLogDialog);
}