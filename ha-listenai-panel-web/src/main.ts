import { LitElement, html, css } from 'lit';
import { fireEvent } from './fire_event';
import './components/create-app-dialog';
import './components/http-log-dialog';

import { mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import { showErrorDialog } from './helpers';
// 自定义面板
export class ListenAiPanel extends LitElement {
  static properties = {
    hass: { type: Object },
    acEntities: { type: Array },
    listening: { type: Boolean },
    debugLog: { type: String },
    panelConfig: { type: Object },
    panel: { type: Object },
    showModal: { type: Boolean },
    addEntities: { type: Array },
    dialogType: { type: String },
    showLogModal: { type: Boolean },
  };

  // 声明字段，避免 TS 报未定义1
  hass!: any;
  panelConfig!: any;
  acEntities: any[] = [];
  listening = false;
  debugLog = '';
  panel!: any;
  showModal = false;
  showLogModal = false;
  addEntities: any[] = [];
  dialogType = 'new';
  editingApp: any = null;
  editingAppLog: any = null;
  constructor() {
    super();
  }

  // 初始化时先按需加载 HA 组件
  async firstUpdated(): Promise<void> {
    await this._loadAppListFromServer();
    this.panelConfig = this.panel?.config || (window as any)?.panelConfig || {};
    await this._loadAcDevices();

    // ✅ 捕获订阅失败等未处理异常
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      if (reason?.code === "not_found") {
        console.warn("🧨 订阅失效，将重新加载数据");
        location.reload();
      } else {
        console.error("未处理Promise异常", reason);
      }
    });

  }

  static styles = css`
    listenai-panel { flex: 1 1 100%; max-width: 100%; padding: 0; }
    .header { background-color: var(--app-header-background-color); color: var(--app-header-text-color, #fff); border-bottom: var(--app-header-border-bottom, none); position: fixed; top: 0px; width: var(--mdc-top-app-bar-width, 100%); backdrop-filter: var(--app-header-backdrop-filter, none); padding-top: env(safe-area-inset-top); z-index: 4; transition: box-shadow 0.2s linear; }
    .toolbar {
      height: var(--header-height);
      display: flex;
      align-items: center;
      font-size: 20px;
      padding: 0px 12px;
      font-weight: 400;
      width: 100%;
      box-sizing: border-box;
      justify-content: space-between;
     }
    ha-card { padding: 16px; margin-bottom: 20px; width:100%;display:flex;}
    select, input { margin-top: 16px; padding: 6px; width: 100%; box-sizing: border-box; }
    .debug { background: #f6f6f6; border: 1px dashed #ccc; padding: 8px; font-size: 12px; margin-top: 16px; white-space: pre-wrap; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom:  0; background: rgba(0, 0, 0, 0.5); z-index: 10; width:200px; height:200px; }
    .modal {width:80%; height:80%;overflow-y:auto; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px; z-index: 11; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); border-radius: 8px; }
    .del-modal{width:200px; height:200px;}
    .card-container {
      padding:70px 30px;
      display: flex;
      flex-wrap: wrap; /* 允许换行 */
      gap: 10px; /* 每个card之间左右间隔10px，同时上下也是10px */
      overflow-x: hidden;
      overflow-y: auto;
      height:calc(100vh - 56px);
    }
    .add-btn{
      font-size:14px;
      color:#fff;
      width:100px;
      height:30px;
      line-height:30px;
      text-align:center;
      cursor:pointer;
    }
    .card-container ha-card {
      width: 200px;
      height: 210px;
      box-sizing: border-box;
    }
    .app-card{
      display:flex;
      flex-direction:column;
    }
    .app-tittle{font-weight:bold;}
    .app-con{
      height:180px;
    }
    .warning {
      color: var(--error-color);
    }
    .ellipsis{
      width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .app-footer{
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      justify-content: flex-end;
    }
    ha-icon-button{font-size:16px; --mdc-icon-button-size: 16px;margin:0 10px;--mdc-icon-size: 16px;}
    .mdc-icon-button {font-size:16px; }
    .empty{
      width: 100%;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
  `;
  render() {

    return html`
      <div>
       <div class="header">
          <div class="toolbar">
            <div> 聆思中控大脑</div>
            <div   @click=${() => this._showModal()} class="add-btn">添加应用</div></div>
        </div>
        <div class="card-container">
            ${this.addEntities?.length > 0 ? html`
                ${this.addEntities?.map((app, index) => html`
                    <ha-card class="app-card">
                        <div class="app-con">
                            <p class="app-tittle ellipsis">${app.name}</p>
                            <p class="ellipsis">实体:${app.entity_id}</p>
                            <p>是否开启大脑:${app.enable_listen}</p>
                            <p>运行间隔:${app.interval}小时</p>
                        </div>
                        <div class="app-footer">
                            <ha-button  @click=${() => this._showLogModal(app)}>
                              日志
                            </ha-button>
                            <ha-icon-button .path=${mdiPencil} @click=${() => this._editApp(app)}>
                            </ha-icon-button>
                            <ha-icon-button class="warning" .path=${mdiTrashCanOutline} @click=${(e) => this.deleteClick(e, app.name)}>
                            </ha-icon-button>
                        </div>
                    </ha-card>
                `)}
            `: html`
            <div class="empty">
              <p>暂无应用，请先创建应用</p>
              <ha-button  @click=${() => this._showModal()} class="add-btn">添加应用</ha-button>
            </div>
            `}
        </div>
         <create-app-dialog
          .type=${this.dialogType}
          .hass=${this.hass}
          .acEntities=${this.acEntities}
          .open=${this.showModal}
          .app=${this.editingApp}
          @app-created=${this._addApp}
          @dialog-closed=${() => this.showModal = false}
        ></create-app-dialog>
        <http-log-dialog
            .data=${this.editingAppLog || []}
            .open=${this.showLogModal}
             @dialog-closed=${() => this.showLogModal = false}
        ></http-log-dialog>
      </div>
    `;
  }
  private async deleteClick(ev: Event, name: string) {
    const result: boolean = await new Promise(resolve => {
      fireEvent(ev.target as HTMLElement, 'show-dialog', {
        dialogTag: 'confirm-delete-dialog',
        dialogImport: () => import('./components/confirm-delete-dialog'),
        dialogParams: {
          title: `删除应用`,
          description: `确认删除应用 "${name}"？注意这个操作是不可逆的。`,
          cancel: () => resolve(false),
          confirm: () => resolve(true),
        },
      });
    });

    if (result) {
      this._confirmDelete();
    }
  }

  _showModal() {
    this.showModal = true;
    this.dialogType = 'new';
    this.editingApp = null;
  }

  async _showLogModal(app) {
    console.log(app);
    const entityId = app.entity_id;

    try {
      const logs = await this.hass.callWS({
        type: "listenai/get_logs_for_entity",
        entity_id: entityId
      });
      this.editingAppLog = logs;
      this.showLogModal = true;
      console.log(logs);
    } catch (e) {
      console.error("📛 获取日志失败：", e);
    }

  }
  private _editApp(app: any) {
    this.editingApp = JSON.parse(JSON.stringify(app));
    this.dialogType = 'edit';
    this.showModal = true;
  }
  _closeModal() {
    this.showModal = false;
  }


  async _confirmDelete() {
    this.addEntities.splice(-1, 1);
    this.addEntities = [...this.addEntities];
    await this._saveAppListToServer();
    this.requestUpdate();
  }

  async _saveAppListToServer() {
    try {
      console.log('保存的apps', this.addEntities);
      await this.hass.callWS({ type: "listenai/save_apps", apps: this.addEntities });
    } catch (err) {
      console.error('保存应用失败1:', err);
    }
  }

  async _loadAppListFromServer() {
    try {
      const result = await this.hass.callWS({ type: "listenai/list_apps" });
      console.log('[前端加载] apps:', result);
      this.addEntities = [...result];
      this.requestUpdate();
    } catch (err) {
      console.error('加载应用失败:', err);
      this.addEntities = [];
    }
  }

  async _loadAcDevices() {
    try {
      // 从 HA 获取所有的空调设备
      const devices = Object.values(this.hass.states).filter((state: any) => state?.entity_id?.startsWith('climate.'));
      console.log('[空调设备]->', this.hass.states);
      this.acEntities = devices;
    } catch (err) {
      console.error('加载设备失败:', err);
    }
  }



  async _addApp(e) {
    const { data } = e.detail;

    if (this.dialogType === 'new') {
      // 检查 name 是否重复
      const existsName = this.addEntities.find(app => app.name === data.name);
      if (existsName) {
        showErrorDialog(e, "已经存在相同名称的应用");
        return;
      }

      // 检查 entity_id 是否重复
      const exists = this.addEntities.find(app => app.entity_id === data.entity_id);
      if (exists) {
        showErrorDialog(e, "已经存在相同实体ID的应用");
        return;
      }

      console.log('_addApp new', data);
      this.addEntities = [...this.addEntities, data];

    } else if (this.dialogType === 'edit') {
      console.log('_addApp edit', data);

      const oldEntityId = this.editingApp.entity_id;
      const oldName = this.editingApp.name;

      if (data.name !== oldName) {
        const existsName = this.addEntities.find(app => app.name === data.name && app.entity_id !== oldEntityId);
        if (existsName) {
          showErrorDialog(e, "已经存在相同名称的应用");
          return;
        }
      }

      if (data.entity_id !== oldEntityId) {
        const exists = this.addEntities.find(app => app.entity_id === data.entity_id);
        if (exists) {
          showErrorDialog(e, "已经存在相同实体ID的应用");
          return;
        }
      }

      this.addEntities = this.addEntities.map(app =>
        app.entity_id === oldEntityId ? data : app
      );
    }

    await this._saveAppListToServer();
    this._closeModal();
  }



}

const tag = 'listenai-panel';
if (!customElements.get(tag)) {
  customElements.define(tag, ListenAiPanel);
}