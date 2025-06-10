// create-app-dialog.ts

import { LitElement, html, css, property, customElement, state } from 'lit-element';
import './my-textarea';
import { showErrorDialog, getAvailableClimateActionsFull } from '../helpers';
const APP = {
  name: "",
  entity_id: "",
  temperatureSensor: "",
  humiditySensor: "",
  co2_sensor: "",
  pm25Sensor: "",
  hchoSensor: "",
  mode: [] as string[],
  gearSettings: {},
  interval: 0.5,
  enable_listen: true,
  preference: "",
  healthy_cards: [] as string[],
};

export class CreateAppDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) type = 'new';
  @property({ attribute: false }) hass!: any;
  @property({ type: Array }) acEntities: any[] = []; // 传入空调列表
  @property() app: any = {}; // 


  @state() private availableActions: any[] = [];
  @state() private selectedMode: any[] = [];
  @state() private selectedOptions: any[] = [];
  @state() private formData = { ...APP };


  // 固定挡位数组
  private gearLevels: string[] = ['1档', '2档', '3档', '4档', '5档'];
  // 固定模式数组
  private modeLevels: string[] = ['制冷', '制热', '抽湿', '送风'];
  private ObjLevels: any = {
    "fan_mode": this.gearLevels,
    "hvac_mode": this.modeLevels
  };

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("app")) {
      if (this.app && this.type === 'edit') {
        console.log('app---', this.app, this.type);
        this.formData = { ...this.app };
        this.availableActions = this._getAvailableActions();
        this.selectedMode = this.app.mode;
        if (this.app.gearSettings && this.app.mode?.length) {
          this.formData.gearSettings = {};
          for (const key of this.app.mode) {
            if (this.app.gearSettings[key]) {
              this.formData.gearSettings[key] = [...this.app.gearSettings[key]];
            }
          }
        }

      } else {
        this.formData = { ...APP };
        this.availableActions = [];
      }
    }
  }

  static styles = css`
   .create-app-dialog .container{width:500px!important;}
    ha-textfield{width:100%}
    .my-2{margin:20px 0 10px 0;font-weight:500;}
    .attribute-con{padding-left:10px;}
    .health-title{display: flex;align-items: center;}
    .health-card{width:450px}
    .error-text {
      padding-right: 16px;
      padding-left: 16px;
      color: #b00020;
      color: var(--mdc-theme-error, #b00020);
      font-size: var(--mdc-typography-caption-font-size, .75rem);
    }
    .tips{font-size: var(--mdc-typography-caption-font-size, .85rem); color: #333;}
  `;
  render() {
    return html`
      <ha-dialog .open=${this.open}  :heading="${this.type === 'new' ? '新建应用' : '编辑应用'}" @closed=${this._handleDialogClosed} class="create-app-dialog">
        <div class="container">
       <ha-textfield
            label="应用名称"
             id="name"
            .value=${this.formData.name}
            .errorMessage=${"请填写内容"}
            helperPersistent=${true}
            required
            @input=${(e: Event) => this._updateForm("name", (e.target as HTMLInputElement).value)}></ha-textfield>
          </ha-textfield>
          <div class='my-2'>设备类型：空调</div>
            <ha-selector
            .hass=${this.hass}
            .value=${this.formData.entity_id}
            .required=${true}
            id="entity_id"
            @value-changed=${(event) => this._onEntityChange(event.detail.value)}
            .selector=${{
        entity: {
          domain: 'climate',   // 只显示 climate 域
          multiple: false      // 单选；改成 true 即多选
        }
      }}
            ></ha-selector>

        <!-- 支持的动作 -->
        ${this.formData.entity_id && html`<div class='my-2'>支持的动作</div>`}
        ${this.availableActions.map(action => html`
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>
              <input
                type="checkbox"
                .checked=${this.selectedMode.includes(action.key)}
                @change=${(e: Event) => this._onActionChange(e, action.key)}
              />
              ${action.label}
            </label>
            ${this.selectedMode.includes(action.key) && action.options?.length ? html`
              ${action.options.length > 0 && html`
                <div style="margin-left: 24px;width:370px; ">
                  <div  style="display: flex; align-items: center; gap: 8px;flex-wrap:wrap;">
                  ${this.formData.gearSettings[action.key].map((cfg, i) => html`
                    <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                      <span style="margin-right: 5px;width:50px"> ${cfg.label}：</span>
                      <select
                        style="width:100px;height:30px;line-height:30px"
                        @change=${(e: Event) => this._onGearOptionChange(e, action.key, i)}
                      >
                        ${action.options.map(opt => html`<option value="${String(opt)}" ?selected=${String(opt) === String(cfg.option)}>${String(opt)}</option>`)}
                      </select>
                    </div>
                  `)}
                   </div>
                </div>
              ` }
            ` : ''}
          </div>
        `)}
        ${this.formData.entity_id && this.selectedMode.length === 0
        ? html`<div id="helper-text" class="error-text">请选择支持的动作</div>`
        : ''}
        <div class='my-2'>设备关联属性配置</div>
        <div class="attribute-con">
          <!-- 选择温湿度来源 -->
          <div class='my-2'>温度传感器 (必选)</div>
            <ha-selector
                required
                id="temperatureSensor"
                .hass=${this.hass}
                .required=${true}
                .value=${this.formData.temperatureSensor}
                .selector=${{
        entity: {
          domain: 'sensor',                           // 只显示传感器
          filter: [                                    // 再筛 device_class
            { device_class: 'temperature' }
          ]
        }
      }}
                @value-changed=${(e: any) => this._updateForm("temperatureSensor", e.detail.value)}>
            ></ha-selector>
          <div class='my-2'>湿度传感器 (必选)</div>
            <ha-selector
            .errorMessage=${"请选择内容"}
                required
                id="humiditySensor"
                .hass=${this.hass}
                .value=${this.formData.humiditySensor}
                .selector=${{
        entity: {
          domain: 'sensor',                           // 只显示传感器
          filter: [                                    // 再筛 device_class
            { device_class: 'humidity' }
          ]
        }
      }}
               @value-changed=${(e: any) => this._updateForm("humiditySensor", e.detail.value)}>
            ></ha-selector>
        <div class='my-2'>co2传感器</div>
          <ha-selector
            .hass=${this.hass}
            .value=${this.formData.co2_sensor}
            .selector=${{
        entity: {
          domain: 'sensor',
          filter: [
            { device_class: 'carbon_dioxide' }
          ]
        }
      }}
        @value-changed=${(e: any) => this._updateForm("co2_sensor", e.detail.value)}>
      ></ha-selector>
      <div class='my-2'>PM2.5传感器</div>
      <!-- PM2.5 传感器 -->
      <ha-selector
        .hass=${this.hass}
        .value=${this.formData.pm25Sensor}
        .selector=${{
        entity: {
          domain: 'sensor',
          filter: [
            { device_class: 'pm25' }
          ]
        }
      }}
        @value-changed=${(e: any) => this._updateForm("pm25Sensor", e.detail.value)}>
      ></ha-selector>
      <div class='my-2'>甲醛传感器</div>
      <!-- 甲醛（VOC）传感器 -->
      <ha-selector
        .hass=${this.hass}
        .value=${this.formData.hchoSensor}
        .selector=${{
        entity: {
          domain: 'sensor',
          filter: [
            { device_class: 'volatile_organic_compounds' }
          ]
        }
      }}
         @value-changed=${(e: any) => this._updateForm("hchoSensor", e.detail.value)}>
      ></ha-selector>
        </div>
        </div>
          <div class="my-2">是否开启大脑：
              <ha-switch
                label="开启大脑"
                .checked=${this.formData.enable_listen}
                @change=${(e: any) => this._updateForm("enable_listen", e.target.checked)}>
              >
              </ha-switch>
            </div>
            <div class="my-2">个人喜好：</div>
             <my-textarea  .value=${this.formData.preference} 
              @input=${(e: Event) => this._updateForm("preference", (e.target as HTMLInputElement).value)}></my-textarea>
            <div class="my-2 health-title">健康信息卡片： <ha-button  @click=${this._addHealthyCard}>增加</ha-button></div>
            ${this.formData?.healthy_cards?.map((card: string, index: number) => html`
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <my-textarea
                  .value=${card}
                  class="health-card"
                  @input=${(e: Event) => this._updateHealthyCard(index, (e.target as HTMLInputElement).value)}
                ></my-textarea>
                <ha-button
                  @click=${() => this._removeHealthyCard(index)}
                >删除</ha-button>
              </div>
            `)}
            <div class="my-2">当前间隔：
              <ha-slider
                  .value=${this.formData.interval}
                  labeled
                  min=${0.5}
                  max=${12}
                  step=${0.5}
                  @change=${e => this._updateForm("interval", e.target.value)}>
                ></ha-slider>${this.formData.interval}小时
                <p class='tips'>(设备启动时将自动运行一次深度思考，随后以固定间隔运行)</p>
                </div>
                
        <ha-button
          slot="primaryAction"
          @click=${this._onConfirm}
          unelevated
        >确认</ha-button>
        <ha-button
          slot="secondaryAction"
          dialogAction="close"
          @click=${() => this.open = false}
        >取消</ha-button>
              </ha-dialog>
    `;
  }

  private _onActionChange(e: Event, key: string) {
    const checked = (e.target as HTMLInputElement).checked;
    console.log(checked, key);
    if (checked) {
      this.selectedMode = [...this.selectedMode, key];
      const act = this.availableActions.find(a => a.key === key);
      if (act?.options?.length) {

        this.formData.gearSettings = {
          ... this.formData.gearSettings,
          [key]: this.ObjLevels[key].map(g => ({ label: g, option: act.options![0] }))
        };
        // 勾选时默认填第一个 option
        this.selectedOptions = {
          ...this.selectedOptions,
          [key]: act.options[0]
        };
      }
    } else {
      this.selectedMode = this.selectedMode.filter(k => k !== key);
      const { [key]: _, ...restG } = this.formData.gearSettings;
      this.formData.gearSettings = restG;
    }
    this._updateForm("mode", this.selectedMode);

  }

  private _onOptionChange(e: Event, key: string) {
    const val = (e.target as HTMLSelectElement).value;
    this.selectedOptions = {
      ...this.selectedOptions,
      [key]: val
    };
  }

  private _onGearOptionChange(e: Event, key: string, idx: number) {
    const opt = (e.target as HTMLSelectElement).value;
    const arr = [...(this.formData.gearSettings[key] || [])];
    arr[idx] = { ...arr[idx], option: opt };
    this.formData.gearSettings = { ...this.formData.gearSettings, [key]: arr };
  }

  private _updateHealthyCard(index: number, value: string) {
    const updated = [...this.formData.healthy_cards];
    updated[index] = value;
    this._updateForm("healthy_cards", updated);
  }

  private _addHealthyCard() {
    const updated = [...this.formData.healthy_cards, ""];
    this._updateForm("healthy_cards", updated);
  }

  private _removeHealthyCard(index: number) {
    const updated = [...this.formData.healthy_cards];
    updated.splice(index, 1);
    this._updateForm("healthy_cards", updated);
  }
  private _updateForm(field: keyof typeof this.formData, value: any) {
    this.formData = { ...this.formData, [field]: value };
    console.log(!!value, field);
    if (field === 'name') {
      const el: any = this.shadowRoot!.querySelector(`#${field}`);
      el.invalid = !value;
    } else {
      !!value && this.clearHaSelectorInvalid(field);
    }

  }
  private _getAvailableActions() {
    console.log(this.formData);
    if (!this.formData.entity_id) return [];
    let availableActions: any = [];
    const stateObj = this.hass.states[this.formData.entity_id];
    if (!stateObj) {
      console.error('实体未找到:', this.formData.entity_id);
      return availableActions;
    }
    const attrs = stateObj.attributes;
    let allActions = getAvailableClimateActionsFull(stateObj);
    const allowedKeys = ["temperature", "target_temp_range", "fan_mode", "hvac_mode"];
    //  如果 temperature 存在，则去除 target_temp_range
    const hasSingleTemp = allActions.some((a) => a.key === "temperature");
    if (hasSingleTemp) {
      allActions = allActions.filter((a) => a.key !== "target_temp_range");
    }
    availableActions = allActions.filter((action) =>
      allowedKeys.includes(action.key)
    ).map((action) => {
      if (action.options && action.options.length > 0) {
        return { ...action };
      }
      return action;
    });;
    console.log('attributes--->', attrs);
    console.log('allActions---->', allActions);
    console.log('availableActions---->', availableActions);
    return availableActions;
  }
  private async _onEntityChange(id) {
    this.formData.entity_id = id;
    this.availableActions = this._getAvailableActions();
    this.selectedMode = [];
    !!id && this.clearHaSelectorInvalid('entity_id');
  }




  private _handleDialogClosed() {
    this.open = false;
    // 恢复初始状态，避免下次弹窗保留临时修改
    this.formData = this.type === 'edit' ? { ...this.app } : { ...APP };
    this.availableActions = [];
    this.selectedMode = this.app?.mode || [];
    this.selectedOptions = [];
    this.dispatchEvent(new CustomEvent('dialog-closed',
      { bubbles: true, composed: true }
    ));
  }

  private markHaSelectorInvalid(selectorId: string, message: string): void {
    const selectorEl = this.shadowRoot!.querySelector(`#${selectorId}`) as HTMLElement;
    const selectorWrapper = selectorEl?.shadowRoot?.querySelector("#selector");
    const entityPicker = selectorWrapper?.shadowRoot?.querySelector("ha-entity-picker");
    const comboBox = entityPicker?.shadowRoot?.querySelector("ha-combo-box");
    const comboBoxLight = comboBox?.shadowRoot?.querySelector("vaadin-combo-box-light");
    const textfield = comboBoxLight?.querySelector("ha-textfield") as any;
    console.log(textfield, 123);
    if (textfield) {
      textfield.invalid = true;
      textfield.errorMessage = message;
    } else {
      console.log(`ha-textfield not found in selector #${selectorId}`);
    }
  }

  private clearHaSelectorInvalid(selectorId: string): void {
    const selectorEl = this.shadowRoot!.querySelector(`#${selectorId}`) as HTMLElement;
    const selectorWrapper = selectorEl?.shadowRoot?.querySelector("#selector");
    const entityPicker = selectorWrapper?.shadowRoot?.querySelector("ha-entity-picker");
    const comboBox = entityPicker?.shadowRoot?.querySelector("ha-combo-box");
    const comboBoxLight = comboBox?.shadowRoot?.querySelector("vaadin-combo-box-light");
    const textfield = comboBoxLight?.querySelector("ha-textfield") as any;
    if (textfield) {
      textfield.invalid = false;
      textfield.errorMessage = "";
    }
  }


  private async _onConfirm(ev: Event) {
    const fields = [
      { id: "name", message: "应用名称不能为空", type: "text" },
      { id: "entity_id", message: "实体不能为空", type: "selector" },
      { id: "temperatureSensor", message: "请选择温度传感器", type: "selector" },
      { id: "humiditySensor", message: "请选择湿度传感器", type: "selector" },
    ];

    let hasError = false;
    for (const field of fields) {
      const el: any = this.shadowRoot!.querySelector(`#${field.id}`);
      const value = this.formData[field.id];
      console.log(field, value, field.type);
      if (!!value) {
        if (field.type === "selector") {
          this.clearHaSelectorInvalid(field.id);
        } else {
          el.invalid = false;
        }
      } else {
        hasError = true;
        if (field.type === "selector") {
          this.markHaSelectorInvalid(field.id, field.message);
        } else {
          el.invalid = true;
          el.errorMessage = field.message;
        }
      }
    }
    if (hasError) return;
    if (this.formData.mode.length === 0) {
      return;
    }

    console.log(this.formData);
    this.dispatchEvent(new CustomEvent('app-created', {
      detail: {
        data: this.formData,
      },
      bubbles: true,
      composed: true
    }));
  }
}
const tag = 'create-app-dialog';
if (!customElements.get(tag)) {
  customElements.define(tag, CreateAppDialog);
}