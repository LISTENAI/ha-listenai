"""ListenAI 中控大脑 – 插件入口"""

import time
import logging
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.components.frontend import async_remove_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

from .listener import setup_listener  # 新增

from .const import DOMAIN
from .storage_api import setup_storage_ws_api,delete_all_logs
from .listener import setup_listener, reload_listener
# 路径常量
PANEL_PATH = "listenai_brain"
STATIC_URL = "/listenai_static"
STATIC_DIR = "custom_components/listenai_brain/panel"

VERSION = f"v={int(time.time())}"

async def async_setup(hass: HomeAssistant, _):
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "api_key": entry.options.get("api_key") or entry.data.get("api_key"),
        "city": entry.options.get("city") or entry.data.get("city"),
    }


    # 存储设备信息
    setup_storage_ws_api(hass)

    # 注册静态资源路径
    hass.http.register_static_path(STATIC_URL, hass.config.path(STATIC_DIR), True)

    # 注册面板
    panel_config = {
        "api_key": entry.options.get("api_key") or entry.data.get("api_key", "")
    }
    print("[DEBUG] 注入面板 config:", panel_config)

    await async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="listenai-panel",
        module_url=f"{STATIC_URL}/main.js?{VERSION}",
        sidebar_title="聆思中控大脑",
        sidebar_icon="mdi:robot",
        require_admin=False,
        embed_iframe=False,
        config=panel_config
    )


    # 启动监听器
    await setup_listener(hass)

    # 新增监听 bus 事件
    async def _handle_reload_listener_event(event):
        _LOGGER.info("🔄 收到 reload_listener 事件，刷新监听...")
        await reload_listener(hass)
        
    hass.bus.async_listen(f"{DOMAIN}_reload_listener", _handle_reload_listener_event)

    return True

async def async_unload_entry(hass, entry):
    try:
        _LOGGER.info(f"⚠️ 禁用面板")
        async_remove_panel(hass, PANEL_PATH)
    except Exception as e:
        _LOGGER.warning(f"⚠️ 禁用面板失败: {e}")
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True

async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry):
    """真正卸载（remove）时才删除所有日志/实体等持久化数据。"""
    _LOGGER.info(f"⚠️ 卸载面板")
    await delete_all_logs(hass)
    return True
