import { TemplateResult,html } from 'lit';
import { fireEvent } from './fire_event';

export function handleError(err: any, ev: Event | HTMLElement) {
  const errorMessage = html`
    <b>Something went wrong!</b>
    <br />
    ${err.body.message
      ? html`
          ${err.body.message}
          <br />
          <br />
        `
      : ''}
    ${err.error}
    <br />
    <br />
    Please
    <a href="https://github.com/nielsfaber/alarmo/issues">report</a>
    the bug.
  `;
  showErrorDialog(ev, errorMessage);
}
export function showErrorDialog(ev: Event | HTMLElement, error: string | TemplateResult) {
  const elem = ev.hasOwnProperty('tagName') ? (ev as HTMLElement) : ((ev as Event).target as HTMLElement);
  fireEvent(elem, 'show-dialog', {
    dialogTag: 'error-dialog',
    dialogImport: () => import('./components/error-dialog'),
    dialogParams: { error: error },
  });
}

/**
 * 根据 climate 实体的 supported_features 返回支持的功能名数组123
 * 判断条件supported_features 包含该特征位，或 stateObj.attributes.xxx_modes 实际存在并是数组
 */
export function getAvailableClimateActionsFull(stateObj: any): { key: string; label: string; options?: string[]; }[] {
  const features = stateObj.attributes.supported_features || 0;
  const actions: { key: string; label: string; options?: string[]; }[] = [];

  // ✅ 温度
  if ((features & 1) === 1) {
    actions.push({ key: "temperature", label: "设置温度" });
  }

  // ✅ 温度范围
  if ((features & 2) === 2) {
    actions.push({ key: "target_temp_range", label: "设置温度范围" });
  }

  // ✅ 风速 fan_mode：只要 features 或 fan_modes 存在
  const fan_modes = Array.isArray(stateObj.attributes.fan_modes) ? stateObj.attributes.fan_modes : [];
  if ((features & 4) === 4 || fan_modes.length > 0) {
    actions.push({ key: "fan_mode", label: "风速控制", options: fan_modes.length ? fan_modes : undefined });
  }

  // ✅ 预设 preset_mode
  const preset_modes = Array.isArray(stateObj.attributes.preset_modes) ? stateObj.attributes.preset_modes : [];
  if ((features & 8) === 8 || preset_modes.length > 0) {
    actions.push({ key: "preset_mode", label: "预设模式", options: preset_modes.length ? preset_modes : undefined });
  }

  // ✅ 扫风模式
  const swing_modes = Array.isArray(stateObj.attributes.swing_modes) ? stateObj.attributes.swing_modes : [];
  if ((features & 16) === 16 || swing_modes.length > 0) {
    actions.push({ key: "swing_mode", label: "扫风模式", options: swing_modes.length ? swing_modes : undefined });
  }

  // ✅ 辅助加热
  if ((features & 32) === 32) {
    actions.push({ key: "aux_heat", label: "辅助加热开关" });
  }

  // ✅ 开关控制
  if ((features & 64) === 64 || (features & 128) === 128 || (features & 256) === 256) {
    actions.push({ key: "on_off", label: "开关控制" });
  }

  // ✅ hvac_mode（运行模式） 只要属性存在就算
  const hvac_modes = Array.isArray(stateObj.attributes.hvac_modes) ? stateObj.attributes.hvac_modes : [];
  if (hvac_modes.length > 0) {
    actions.push({ key: "hvac_mode", label: "运行模式", options: hvac_modes });
  }

  return actions;
}
