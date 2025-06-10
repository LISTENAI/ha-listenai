import{g as L,s as f,_ as P}from"./helpers.js";import{c as v,L as y,h as l}from"./assets/lit-element-7f78e8e7.js";import{f as k}from"./fire_event.js";import{p as h,s as b,m as q,a as z}from"./assets/mdi-c73c1f46.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");var j=Object.defineProperty,F=Object.getOwnPropertyDescriptor,C=(n,t,i,e)=>{for(var a=e>1?void 0:e?F(t,i):t,s=n.length-1,o;s>=0;s--)(o=n[s])&&(a=(e?o(t,i,a):o(a))||a);return e&&a&&j(t,i,a),a};class x extends y{constructor(){super(...arguments),this.label="",this.value=""}render(){return l`
      ${this.label?l`<label>${this.label}</label>`:""}
      <textarea
        class="my-textarea"
        .value=${this.value}
        @input=${t=>{this.value=t.target.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:this.value}))}}
      ></textarea>
    `}}x.styles=v`
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
  `;C([h({type:String})],x.prototype,"label",2);C([h({type:String})],x.prototype,"value",2);const D="my-textarea";customElements.get(D)||customElements.define(D,x);var T=Object.defineProperty,H=Object.getOwnPropertyDescriptor,p=(n,t,i,e)=>{for(var a=e>1?void 0:e?H(t,i):t,s=n.length-1,o;s>=0;s--)(o=n[s])&&(a=(e?o(t,i,a):o(a))||a);return e&&a&&T(t,i,a),a};const w={name:"",entity_id:"",temperatureSensor:"",humiditySensor:"",co2_sensor:"",pm25Sensor:"",hchoSensor:"",mode:[],gearSettings:{},interval:.5,enable_listen:!0,preference:"",healthy_cards:[]};class d extends y{constructor(){super(...arguments),this.open=!1,this.type="new",this.acEntities=[],this.app={},this.availableActions=[],this.selectedMode=[],this.selectedOptions=[],this.formData={...w},this.gearLevels=["1档","2档","3档","4档","5档"],this.modeLevels=["制冷","制热","抽湿","送风"],this.ObjLevels={fan_mode:this.gearLevels,hvac_mode:this.modeLevels}}updated(t){var i;if(t.has("app"))if(this.app&&this.type==="edit"){if(console.log("app---",this.app,this.type),this.formData={...this.app},this.availableActions=this._getAvailableActions(),this.selectedMode=this.app.mode,this.app.gearSettings&&((i=this.app.mode)!=null&&i.length)){this.formData.gearSettings={};for(const e of this.app.mode)this.app.gearSettings[e]&&(this.formData.gearSettings[e]=[...this.app.gearSettings[e]])}}else this.formData={...w},this.availableActions=[]}render(){var t,i;return l`
      <ha-dialog .open=${this.open}  :heading="${this.type==="new"?"新建应用":"编辑应用"}" @closed=${this._handleDialogClosed} class="create-app-dialog">
        <div class="container">
       <ha-textfield
            label="应用名称"
             id="name"
            .value=${this.formData.name}
            .errorMessage=${"请填写内容"}
            helperPersistent=${!0}
            required
            @input=${e=>this._updateForm("name",e.target.value)}></ha-textfield>
          </ha-textfield>
          <div class='my-2'>设备类型：空调</div>
            <ha-selector
            .hass=${this.hass}
            .value=${this.formData.entity_id}
            .required=${!0}
            id="entity_id"
            @value-changed=${e=>this._onEntityChange(e.detail.value)}
            .selector=${{entity:{domain:"climate",multiple:!1}}}
            ></ha-selector>

        <!-- 支持的动作 -->
        ${this.formData.entity_id&&l`<div class='my-2'>支持的动作</div>`}
        ${this.availableActions.map(e=>{var a;return l`
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>
              <input
                type="checkbox"
                .checked=${this.selectedMode.includes(e.key)}
                @change=${s=>this._onActionChange(s,e.key)}
              />
              ${e.label}
            </label>
            ${this.selectedMode.includes(e.key)&&((a=e.options)!=null&&a.length)?l`
              ${e.options.length>0&&l`
                <div style="margin-left: 24px;width:370px; ">
                  <div  style="display: flex; align-items: center; gap: 8px;flex-wrap:wrap;">
                  ${this.formData.gearSettings[e.key].map((s,o)=>l`
                    <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                      <span style="margin-right: 5px;width:50px"> ${s.label}：</span>
                      <select
                        style="width:100px;height:30px;line-height:30px"
                        @change=${r=>this._onGearOptionChange(r,e.key,o)}
                      >
                        ${e.options.map(r=>l`<option value="${String(r)}" ?selected=${String(r)===String(s.option)}>${String(r)}</option>`)}
                      </select>
                    </div>
                  `)}
                   </div>
                </div>
              `}
            `:""}
          </div>
        `})}
        ${this.formData.entity_id&&this.selectedMode.length===0?l`<div id="helper-text" class="error-text">请选择支持的动作</div>`:""}
        <div class='my-2'>设备关联属性配置</div>
        <div class="attribute-con">
          <!-- 选择温湿度来源 -->
          <div class='my-2'>温度传感器 (必选)</div>
            <ha-selector
                required
                id="temperatureSensor"
                .hass=${this.hass}
                .required=${!0}
                .value=${this.formData.temperatureSensor}
                .selector=${{entity:{domain:"sensor",filter:[{device_class:"temperature"}]}}}
                @value-changed=${e=>this._updateForm("temperatureSensor",e.detail.value)}>
            ></ha-selector>
          <div class='my-2'>湿度传感器 (必选)</div>
            <ha-selector
            .errorMessage=${"请选择内容"}
                required
                id="humiditySensor"
                .hass=${this.hass}
                .value=${this.formData.humiditySensor}
                .selector=${{entity:{domain:"sensor",filter:[{device_class:"humidity"}]}}}
               @value-changed=${e=>this._updateForm("humiditySensor",e.detail.value)}>
            ></ha-selector>
        <div class='my-2'>co2传感器</div>
          <ha-selector
            .hass=${this.hass}
            .value=${this.formData.co2_sensor}
            .selector=${{entity:{domain:"sensor",filter:[{device_class:"carbon_dioxide"}]}}}
        @value-changed=${e=>this._updateForm("co2_sensor",e.detail.value)}>
      ></ha-selector>
      <div class='my-2'>PM2.5传感器</div>
      <!-- PM2.5 传感器 -->
      <ha-selector
        .hass=${this.hass}
        .value=${this.formData.pm25Sensor}
        .selector=${{entity:{domain:"sensor",filter:[{device_class:"pm25"}]}}}
        @value-changed=${e=>this._updateForm("pm25Sensor",e.detail.value)}>
      ></ha-selector>
      <div class='my-2'>甲醛传感器</div>
      <!-- 甲醛（VOC）传感器 -->
      <ha-selector
        .hass=${this.hass}
        .value=${this.formData.hchoSensor}
        .selector=${{entity:{domain:"sensor",filter:[{device_class:"volatile_organic_compounds"}]}}}
         @value-changed=${e=>this._updateForm("hchoSensor",e.detail.value)}>
      ></ha-selector>
        </div>
        </div>
          <div class="my-2">是否开启大脑：
              <ha-switch
                label="开启大脑"
                .checked=${this.formData.enable_listen}
                @change=${e=>this._updateForm("enable_listen",e.target.checked)}>
              >
              </ha-switch>
            </div>
            <div class="my-2">个人喜好：</div>
             <my-textarea  .value=${this.formData.preference} 
              @input=${e=>this._updateForm("preference",e.target.value)}></my-textarea>
            <div class="my-2 health-title">健康信息卡片： <ha-button  @click=${this._addHealthyCard}>增加</ha-button></div>
            ${(i=(t=this.formData)==null?void 0:t.healthy_cards)==null?void 0:i.map((e,a)=>l`
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <my-textarea
                  .value=${e}
                  class="health-card"
                  @input=${s=>this._updateHealthyCard(a,s.target.value)}
                ></my-textarea>
                <ha-button
                  @click=${()=>this._removeHealthyCard(a)}
                >删除</ha-button>
              </div>
            `)}
            <div class="my-2">当前间隔：
              <ha-slider
                  .value=${this.formData.interval}
                  labeled
                  min=${.5}
                  max=${12}
                  step=${.5}
                  @change=${e=>this._updateForm("interval",e.target.value)}>
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
          @click=${()=>this.open=!1}
        >取消</ha-button>
              </ha-dialog>
    `}_onActionChange(t,i){var a;const e=t.target.checked;if(console.log(e,i),e){this.selectedMode=[...this.selectedMode,i];const s=this.availableActions.find(o=>o.key===i);(a=s==null?void 0:s.options)!=null&&a.length&&(this.formData.gearSettings={...this.formData.gearSettings,[i]:this.ObjLevels[i].map(o=>({label:o,option:s.options[0]}))},this.selectedOptions={...this.selectedOptions,[i]:s.options[0]})}else{this.selectedMode=this.selectedMode.filter(r=>r!==i);const{[i]:s,...o}=this.formData.gearSettings;this.formData.gearSettings=o}this._updateForm("mode",this.selectedMode)}_onOptionChange(t,i){const e=t.target.value;this.selectedOptions={...this.selectedOptions,[i]:e}}_onGearOptionChange(t,i,e){const a=t.target.value,s=[...this.formData.gearSettings[i]||[]];s[e]={...s[e],option:a},this.formData.gearSettings={...this.formData.gearSettings,[i]:s}}_updateHealthyCard(t,i){const e=[...this.formData.healthy_cards];e[t]=i,this._updateForm("healthy_cards",e)}_addHealthyCard(){const t=[...this.formData.healthy_cards,""];this._updateForm("healthy_cards",t)}_removeHealthyCard(t){const i=[...this.formData.healthy_cards];i.splice(t,1),this._updateForm("healthy_cards",i)}_updateForm(t,i){if(this.formData={...this.formData,[t]:i},console.log(!!i,t),t==="name"){const e=this.shadowRoot.querySelector(`#${t}`);e.invalid=!i}else i&&this.clearHaSelectorInvalid(t)}_getAvailableActions(){if(console.log(this.formData),!this.formData.entity_id)return[];let t=[];const i=this.hass.states[this.formData.entity_id];if(!i)return console.error("实体未找到:",this.formData.entity_id),t;const e=i.attributes;let a=L(i);const s=["temperature","target_temp_range","fan_mode","hvac_mode"];return a.some(r=>r.key==="temperature")&&(a=a.filter(r=>r.key!=="target_temp_range")),t=a.filter(r=>s.includes(r.key)).map(r=>r.options&&r.options.length>0?{...r}:r),console.log("attributes--->",e),console.log("allActions---->",a),console.log("availableActions---->",t),t}async _onEntityChange(t){this.formData.entity_id=t,this.availableActions=this._getAvailableActions(),this.selectedMode=[],t&&this.clearHaSelectorInvalid("entity_id")}_handleDialogClosed(){var t;this.open=!1,this.formData=this.type==="edit"?{...this.app}:{...w},this.availableActions=[],this.selectedMode=((t=this.app)==null?void 0:t.mode)||[],this.selectedOptions=[],this.dispatchEvent(new CustomEvent("dialog-closed",{bubbles:!0,composed:!0}))}markHaSelectorInvalid(t,i){var m,g,u,S;const e=this.shadowRoot.querySelector(`#${t}`),a=(m=e==null?void 0:e.shadowRoot)==null?void 0:m.querySelector("#selector"),s=(g=a==null?void 0:a.shadowRoot)==null?void 0:g.querySelector("ha-entity-picker"),o=(u=s==null?void 0:s.shadowRoot)==null?void 0:u.querySelector("ha-combo-box"),r=(S=o==null?void 0:o.shadowRoot)==null?void 0:S.querySelector("vaadin-combo-box-light"),c=r==null?void 0:r.querySelector("ha-textfield");console.log(c,123),c?(c.invalid=!0,c.errorMessage=i):console.log(`ha-textfield not found in selector #${t}`)}clearHaSelectorInvalid(t){var c,m,g,u;const i=this.shadowRoot.querySelector(`#${t}`),e=(c=i==null?void 0:i.shadowRoot)==null?void 0:c.querySelector("#selector"),a=(m=e==null?void 0:e.shadowRoot)==null?void 0:m.querySelector("ha-entity-picker"),s=(g=a==null?void 0:a.shadowRoot)==null?void 0:g.querySelector("ha-combo-box"),o=(u=s==null?void 0:s.shadowRoot)==null?void 0:u.querySelector("vaadin-combo-box-light"),r=o==null?void 0:o.querySelector("ha-textfield");r&&(r.invalid=!1,r.errorMessage="")}async _onConfirm(t){const i=[{id:"name",message:"应用名称不能为空",type:"text"},{id:"entity_id",message:"实体不能为空",type:"selector"},{id:"temperatureSensor",message:"请选择温度传感器",type:"selector"},{id:"humiditySensor",message:"请选择湿度传感器",type:"selector"}];let e=!1;for(const a of i){const s=this.shadowRoot.querySelector(`#${a.id}`),o=this.formData[a.id];console.log(a,o,a.type),o?a.type==="selector"?this.clearHaSelectorInvalid(a.id):s.invalid=!1:(e=!0,a.type==="selector"?this.markHaSelectorInvalid(a.id,a.message):(s.invalid=!0,s.errorMessage=a.message))}e||this.formData.mode.length!==0&&(console.log(this.formData),this.dispatchEvent(new CustomEvent("app-created",{detail:{data:this.formData},bubbles:!0,composed:!0})))}}d.styles=v`
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
  `;p([h({type:Boolean})],d.prototype,"open",2);p([h({type:String})],d.prototype,"type",2);p([h({attribute:!1})],d.prototype,"hass",2);p([h({type:Array})],d.prototype,"acEntities",2);p([h()],d.prototype,"app",2);p([b()],d.prototype,"availableActions",2);p([b()],d.prototype,"selectedMode",2);p([b()],d.prototype,"selectedOptions",2);p([b()],d.prototype,"formData",2);const A="create-app-dialog";customElements.get(A)||customElements.define(A,d);var R=Object.defineProperty,I=Object.getOwnPropertyDescriptor,O=(n,t,i,e)=>{for(var a=e>1?void 0:e?I(t,i):t,s=n.length-1,o;s>=0;s--)(o=n[s])&&(a=(e?o(t,i,a):o(a))||a);return e&&a&&R(t,i,a),a};class _ extends y{constructor(){super(...arguments),this.open=!1,this.data=[]}render(){var t,i;return l`
        <ha-dialog .open=${this.open} heading="日志记录" hideActions class='log-dialog' @closed=${this._handleDialogClosed}>
           <div  class='container'>
          ${((t=this==null?void 0:this.data)==null?void 0:t.length)===0?l`<p>暂无日志记录。</p>`:(i=this==null?void 0:this.data)==null?void 0:i.map(e=>l`
                  <details>
                    <summary>
                      🕒 ${e.timestamp} |  ${e.app_name}
                    </summary>
                    <div>
                      <b>📤 请求体：</b>
                      <pre>${JSON.stringify(e.request,null,2)}</pre>
                    </div>
                    <div>
                      <b>📥 响应体：</b>
                      <pre>${e.response}</pre>
                    </div>
                  </details>
                `)}
        </div>
        <mwc-button slot="primaryAction" dialogAction="close">关闭</mwc-button>
        </ha-dialog>
    `}_handleDialogClosed(){this.open=!1,this.dispatchEvent(new CustomEvent("dialog-closed",{bubbles:!0,composed:!0}))}}_.styles=v`
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
    `;O([h({type:Boolean})],_.prototype,"open",2);O([h({type:Array})],_.prototype,"data",2);const E="http-log-dialog";customElements.get(E)||customElements.define(E,_);class $ extends y{constructor(){super(),this.acEntities=[],this.listening=!1,this.debugLog="",this.showModal=!1,this.showLogModal=!1,this.addEntities=[],this.dialogType="new",this.editingApp=null,this.editingAppLog=null}async firstUpdated(){var t;await this._loadAppListFromServer(),this.panelConfig=((t=this.panel)==null?void 0:t.config)||(window==null?void 0:window.panelConfig)||{},await this._loadAcDevices(),window.addEventListener("unhandledrejection",i=>{const e=i.reason;(e==null?void 0:e.code)==="not_found"?(console.warn("🧨 订阅失效，将重新加载数据"),location.reload()):console.error("未处理Promise异常",e)})}render(){var t,i;return l`
      <div>
       <div class="header">
          <div class="toolbar">
            <div> 聆思中控大脑</div>
            <div   @click=${()=>this._showModal()} class="add-btn">添加应用</div></div>
        </div>
        <div class="card-container">
            ${((t=this.addEntities)==null?void 0:t.length)>0?l`
                ${(i=this.addEntities)==null?void 0:i.map((e,a)=>l`
                    <ha-card class="app-card">
                        <div class="app-con">
                            <p class="app-tittle ellipsis">${e.name}</p>
                            <p class="ellipsis">实体:${e.entity_id}</p>
                            <p>是否开启大脑:${e.enable_listen}</p>
                            <p>运行间隔:${e.interval}小时</p>
                        </div>
                        <div class="app-footer">
                            <ha-button  @click=${()=>this._showLogModal(e)}>
                              日志
                            </ha-button>
                            <ha-icon-button .path=${q} @click=${()=>this._editApp(e)}>
                            </ha-icon-button>
                            <ha-icon-button class="warning" .path=${z} @click=${s=>this.deleteClick(s,e.name)}>
                            </ha-icon-button>
                        </div>
                    </ha-card>
                `)}
            `:l`
            <div class="empty">
              <p>暂无应用，请先创建应用</p>
              <ha-button  @click=${()=>this._showModal()} class="add-btn">添加应用</ha-button>
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
          @dialog-closed=${()=>this.showModal=!1}
        ></create-app-dialog>
        <http-log-dialog
            .data=${this.editingAppLog||[]}
            .open=${this.showLogModal}
             @dialog-closed=${()=>this.showLogModal=!1}
        ></http-log-dialog>
      </div>
    `}async deleteClick(t,i){await new Promise(a=>{k(t.target,"show-dialog",{dialogTag:"confirm-delete-dialog",dialogImport:()=>P(()=>import("./assets/confirm-delete-dialog-679fd62a.js"),["./assets\\confirm-delete-dialog-679fd62a.js","./assets\\lit-element-7f78e8e7.js","./assets\\mdi-c73c1f46.js","./styles.js"],import.meta.url),dialogParams:{title:"删除应用",description:`确认删除应用 "${i}"？注意这个操作是不可逆的。`,cancel:()=>a(!1),confirm:()=>a(!0)}})})&&this._confirmDelete()}_showModal(){this.showModal=!0,this.dialogType="new",this.editingApp=null}async _showLogModal(t){console.log(t);const i=t.entity_id;try{const e=await this.hass.callWS({type:"listenai/get_logs_for_entity",entity_id:i});this.editingAppLog=e,this.showLogModal=!0,console.log(e)}catch(e){console.error("📛 获取日志失败：",e)}}_editApp(t){this.editingApp=JSON.parse(JSON.stringify(t)),this.dialogType="edit",this.showModal=!0}_closeModal(){this.showModal=!1}async _confirmDelete(){this.addEntities.splice(-1,1),this.addEntities=[...this.addEntities],await this._saveAppListToServer(),this.requestUpdate()}async _saveAppListToServer(){try{console.log("保存的apps",this.addEntities),await this.hass.callWS({type:"listenai/save_apps",apps:this.addEntities})}catch(t){console.error("保存应用失败1:",t)}}async _loadAppListFromServer(){try{const t=await this.hass.callWS({type:"listenai/list_apps"});console.log("[前端加载] apps:",t),this.addEntities=[...t],this.requestUpdate()}catch(t){console.error("加载应用失败:",t),this.addEntities=[]}}async _loadAcDevices(){try{const t=Object.values(this.hass.states).filter(i=>{var e;return(e=i==null?void 0:i.entity_id)==null?void 0:e.startsWith("climate.")});console.log("[空调设备]->",this.hass.states),this.acEntities=t}catch(t){console.error("加载设备失败:",t)}}async _addApp(t){const{data:i}=t.detail;if(this.dialogType==="new"){if(this.addEntities.find(s=>s.name===i.name)){f(t,"已经存在相同名称的应用");return}if(this.addEntities.find(s=>s.entity_id===i.entity_id)){f(t,"已经存在相同实体ID的应用");return}console.log("_addApp new",i),this.addEntities=[...this.addEntities,i]}else if(this.dialogType==="edit"){console.log("_addApp edit",i);const e=this.editingApp.entity_id,a=this.editingApp.name;if(i.name!==a&&this.addEntities.find(o=>o.name===i.name&&o.entity_id!==e)){f(t,"已经存在相同名称的应用");return}if(i.entity_id!==e&&this.addEntities.find(o=>o.entity_id===i.entity_id)){f(t,"已经存在相同实体ID的应用");return}this.addEntities=this.addEntities.map(s=>s.entity_id===e?i:s)}await this._saveAppListToServer(),this._closeModal()}}$.properties={hass:{type:Object},acEntities:{type:Array},listening:{type:Boolean},debugLog:{type:String},panelConfig:{type:Object},panel:{type:Object},showModal:{type:Boolean},addEntities:{type:Array},dialogType:{type:String},showLogModal:{type:Boolean}};$.styles=v`
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
  `;const M="listenai-panel";customElements.get(M)||customElements.define(M,$);
