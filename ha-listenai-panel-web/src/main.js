// 问题 ha-xx 首次进入不会加载 ，解决方法自己打包ha前短裤

import { LitElement, html, css } from 'lit';
class ListenAiPanel extends LitElement {
  static properties = {
    hass: { type: Object },
    acEntities: { type: Array },
    selectedEntity: { type: String },
    selectedMode: { type: Array },
    listening: { type: Boolean },
    debugLog: { type: String },
    panelConfig: { type: Object },
    panel: { type: Object },
    showModal: { type: Boolean },
    appName: { type: String },
    interval: { type: String },
    confirmDeleteIndex: { type: Number },
    addEntities: { type: Array },
    selectedAttributes: { type: Array },
    attributeSources: { type: Object },
    personalPreference: { type: String },
    healthyCards: { type: Array },
    healthyCardDraft: { type: String },
    isEnabled: { type: Boolean }
  };

  constructor() {
    super();
    this.hass = {};
    this.acEntities = [];
    this.selectedEntity = '';
    this.selectedMode = [];
    this.appName = '';
    this.listening = false;
    this._lastState = null;
    this.debugLog = '';
    this.panelConfig = {};
    this.showModal = false;
    this.isEnabled = false;
    this.confirmDeleteIndex = -1;
    this.addEntities = [];
    this.interval = 30;
    this.selectedAttributes = ['湿度', '温度'];
    this.attributeSources = {};
    this.personalPreference = '';
    this.healthyCards = [];
    this.healthyCardDraft = '';
  }

  async firstUpdated() {
    this.panelConfig = this.panel?.config || window.panelConfig || {};
    await this._loadAppListFromServer();
    await this._loadAcDevices();
    const helpers = await window.loadCardHelpers?.();
    console.log('ha-device-picker registered:', helpers);
  }

  static styles = css`
    listenai-panel { flex: 1 1 100%; max-width: 100%; padding: 0; }
    .header { background-color: var(--app-header-background-color); color: var(--app-header-text-color, #fff); border-bottom: var(--app-header-border-bottom, none); position: fixed; top: 0px; width: var(--mdc-top-app-bar-width, 100%); backdrop-filter: var(--app-header-backdrop-filter, none); padding-top: env(safe-area-inset-top); z-index: 4; transition: box-shadow 0.2s linear; }
    .toolbar { height: var(--header-height); display: flex; align-items: center; font-size: 20px; padding: 0px 12px; font-weight: 400; box-sizing: border-box; }
    ha-card { padding: 16px; margin-bottom: 20px; padding-top: var(--header-height); }
    ha-button { margin-top: 16px; margin-right: 8px; }
    select, input { margin-top: 16px; padding: 6px; width: 100%; box-sizing: border-box; }
    .debug { background: #f6f6f6; border: 1px dashed #ccc; padding: 8px; font-size: 12px; margin-top: 16px; white-space: pre-wrap; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom:  0; background: rgba(0, 0, 0, 0.5); z-index: 10; width:200px; height:200px; }
    .modal {width:80%; height:80%;overflow-y:auto; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px; z-index: 11; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); border-radius: 8px; }
    .del-modal{width:200px; height:200px;}
    .app-card { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #ccc; margin-top: 8px; }
  `;

  render() {

    return html`
      <div>
       <div class="header">
          <div class="toolbar">聆思中控大脑</div>
        </div>
       <ha-card>
          <div>
            <ha-button unelevated @click=${this._showModal}>添加应用</ha-button>
            <div>当前绑定数量：${this.addEntities.length}</div>
            ${this.addEntities.length > 0 ? html`
              <div>
                ${this.addEntities.map((app, index) => html`
                  <div class="app-card  ">
                    <div><strong>${app.name}</strong> (${app.entity_id}) - ${app.mode} - ${app.interval}</div>
                    <ha-button unelevated  @click=${this._showModal}>编辑</ha-button>
                    <ha-button unelevated @click=${() => this.confirmDeleteIndex = index}>删除</ha-button>

                  </div>
                `)}
              </div>
            ` : html`<div>暂无已添加应用</div>`}
          </div>
        </ha-card>

        ${this.showModal ? html`
          <div class="modal" @click=${e => e.stopPropagation()}>
            <h3>添加应用</h3>
            <ha-textfield
              label=" 应用名称"
              .value=${this.appName}
              @input=${(e) => this.appName = e.target.value}
            ></ha-textfield>
            <div>设备类型：空调</div>
           <select @change=${this._onEntityChange}>
           ${Object.keys(this.hass.states)
        .filter(eid => eid.startsWith("climate."))
        .map(entity_id => {
          const stateObj = this.hass.states[entity_id];
          const name = stateObj?.attributes?.friendly_name || entity_id;
          return html`
                <option value="${entity_id}" ?selected=${this.selectedEntity === entity_id}>
                  ${name} (${entity_id})
                </option>
              `;
        })}
            </select>
            <!-- 支持的动作 -->
        <div>支持的动作（根据设备动态生成）</div>
        ${this?.availableActions?.map(action => html`
          <label>
            <input
              type="checkbox"
              .checked=${this.selectedMode.includes(action.key)}
              @change=${e => this._onActionChange(e, action.key)}
            >
            ${action.label}
          </label>
        `)}

        <!-- 选择温湿度来源 -->
        <div>温度传感器 (可选)</div>
        <select @change=${e => this.temperatureSensor = e.target.value}>
          <option value="">不选择</option>
             ${Object.keys(this.hass.states)
        .filter(eid => eid.startsWith("sensor."))
        .filter(eid => {
          const unit = this.hass.states[eid]?.attributes?.unit_of_measurement || "";
          return unit.includes("°C") || unit.includes("°F");
        })
        .map(entity_id => {
          const name = this.hass.states[entity_id]?.attributes?.friendly_name || entity_id;
          return html`
        <option value="${entity_id}" ?selected=${this.temperatureSensor === entity_id}>
          ${name} (${entity_id})
        </option>
      `;
        })}
        </select>

        <div>湿度传感器 (可选)</div>
        <select @change=${e => this.humiditySensor = e.target.value}>
          <option value="">不选择</option>
          ${Object.keys(this.hass.states)
        .filter(eid => eid.startsWith("sensor."))
        .filter(eid => {
          const unit = this.hass.states[eid]?.attributes?.unit_of_measurement || "";
          return unit.includes("%");
        })
        .map(entity_id => {
          const name = this.hass.states[entity_id]?.attributes?.friendly_name || entity_id;
          return html`
        <option value="${entity_id}" ?selected=${this.humiditySensor === entity_id}>
          ${name} (${entity_id})
        </option>
      `;
        })}
        </select>

            <div>是否开启大脑：
              <ha-switch
                label="开启大脑"
                .checked=${this.isEnabled}
                @change=${e => this.isEnabled = e.target.checked}
              >
              </ha-switch>
            </div>
            <div>个人喜好：</div>
            <textarea .value=${this.personalPreference} @input=${e => this.personalPreference = e.target.value}></textarea>

            <div>信息卡片：</div>
            <textarea .value=${this.healthyCardDraft} @input=${e => this.healthyCardDraft = e.target.value}></textarea>
            <ha-button unelevated  @click=${this._addHealthyCard}>添加卡片</ha-button>
            <ul>
              ${this.healthyCards.map(c => html`<li>${c}</li>`)}
            </ul>

            <div>运行间隔：<input type="range" min="30" max="720" step="30" @input=${e => this.interval = e.target.value}></div>
            <div>当前间隔：${this.interval}min</div>

            <ha-button unelevated @click=${this._addApp}>确认添加</ha-button>
            <ha-button unelevated @click=${this._closeModal}>取消</ha-button>
          </div>
        ` : ''}

        ${this.confirmDeleteIndex !== -1 ? html`
          <div class="modal del-modal">
            <p>确认删除应用 "${this.addEntities[this.confirmDeleteIndex]?.name}"？</p>
            <ha-button destructive @click=${this._confirmDelete}>确认</ha-button>
            <ha-button  dialoginitialfocus @click=${this._cancelDelete}>取消</ha-button>
          </div>
        ` : ''}
        
      </div>
    `;
  }


  _showModal() {
    this.showModal = true;
  }

  _closeModal() {
    this.showModal = false;
  }


  async _onEntityChange(event) {
    this.selectedEntity = event.target.value;
    this.availableActions = [];
    this.selectedMode = [];

    if (!this.selectedEntity) return;

    const stateObj = this.hass.states[this.selectedEntity];
    if (!stateObj) {
      console.error('实体未找到:', this.selectedEntity);
      return;
    }

    const attrs = stateObj.attributes;
    console.log('attrs--->', attrs);
    // 判断支持的动作
    this.availableActions.push({ key: 'temperature', label: '控制温度' });

    if (attrs.hvac_modes && attrs.hvac_modes.length > 0) {
      this.availableActions.push({ key: 'mode', label: '控制模式' });
    }

    if (attrs.fan_modes && attrs.fan_modes.length > 0) {
      this.availableActions.push({ key: 'wind_speed', label: '控制风速' });
    }

    if (attrs.preset_modes && attrs.preset_modes.some(m => m.includes('净化') || m.includes('健康'))) {
      this.availableActions.push({ key: 'health', label: '健康净化' });
    }
  }

  _onActionChange(e, actionKey) {
    if (e.target.checked) {
      this.selectedMode = [...this.selectedMode, actionKey];
    } else {
      this.selectedMode = this.selectedMode.filter(a => a !== actionKey);
    }
  }

  _addHealthyCard() {
    if (this.healthyCardDraft.trim()) {
      this.healthyCards = [...this.healthyCards, this.healthyCardDraft.trim()];
      this.healthyCardDraft = '';
    }
  }

  _cancelDelete() {
    this.confirmDeleteIndex = -1;
  }

  async _confirmDelete() {
    if (this.confirmDeleteIndex < 0) return;
    this.addEntities.splice(this.confirmDeleteIndex, 1);
    this.addEntities = [...this.addEntities];
    await this._saveAppListToServer();
    this.confirmDeleteIndex = -1;
    this.requestUpdate();
  }

  async _saveAppListToServer() {
    try {
      await this.hass.callWS({ type: "listenai/save_apps", apps: this.addEntities });
    } catch (err) {
      console.error('保存应用失败1:', err);
    }
  }

  async _loadAppListFromServer() {
    try {
      console.log('[前端加载] apps:');
      const result = await this.hass.callWS({ type: "listenai/list_apps" });
      console.log('[前端加载] apps:', result);
      this.addEntities = [...result];
      this.requestUpdate();
    } catch (err) {
      console.error('加载应用失败:', err);
    }
  }

  async _loadAcDevices() {
    try {
      // 从 HA 获取所有的空调设备
      const devices = Object.values(this.hass.states).filter(state => state.entity_id.startsWith('climate.'));
      console.log(111, this.hass.states);
      this.acEntities = devices;
    } catch (err) {
      console.error('加载设备失败:', err);
    }
  }



  async _addApp() {
    const newApp = {
      entity_id: this.selectedEntity,
      name: this.appName,
      mode: this.selectedMode.join(', '),
      interval: parseInt(this.interval),
      attributes: this.selectedAttributes,
      sources: this.attributeSources,
      preference: this.personalPreference,
      healthycards: this.healthyCards,
      enable_listen: this.isEnabled,
      temperatureSensor: this.temperatureSensor,
      humiditySensor: this.humiditySensor
    };
    console.log([...this.addEntities, newApp]);
    return;
    this.addEntities = [...this.addEntities, newApp];
    await this._saveAppListToServer();
    this._closeModal();
  }

}

customElements.define('listenai-panel', ListenAiPanel);
