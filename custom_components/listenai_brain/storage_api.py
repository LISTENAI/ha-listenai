import logging
from datetime import datetime
import os
from pathlib import Path
from homeassistant.components import websocket_api
from homeassistant.helpers.storage import Store
from .const import DOMAIN,MAX_LOG_ENTRIES

_LOGGER = logging.getLogger(__name__)


def _get_log_store_by_entity(hass, entity_id):
    """使用 entity_id 命名日志文件"""
    filename = f"{DOMAIN}_{entity_id}_log.json"
    return Store(hass, 1, filename)

async def delete_log_store_by_entity(hass, entity_id: str):
    """删除指定 entity_id 对应的日志文件"""
    filename = f"{DOMAIN}_{entity_id}_log.json"
    storage_dir = hass.config.path(".storage")
    path = hass.config.path(storage_dir, filename)

    if os.path.exists(path):
        try:
            os.remove(path)
            _LOGGER.info(f"🧹 已删除日志文件: {filename}")
        except Exception as e:
            _LOGGER.error(f"⚠️ 删除日志文件失败: {filename} -> {e}")
    else:
        _LOGGER.debug(f"📁 日志文件不存在: {filename}（跳过删除）")


async def append_log_entry(hass, entity_id: str, app_name: str, request_body: dict, response_body: str):
    """追加日志记录（按实体 ID 记录）"""
    _LOGGER.info("✅追加日志记录")
    store = _get_log_store_by_entity(hass, entity_id)
    logs = await store.async_load() or []

    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "app_name": app_name,
        "request": request_body,
        "response": response_body
    }
   
    logs.insert(0, log_entry)
    logs = logs[:MAX_LOG_ENTRIES]
    await store.async_save(logs)

async def load_logs_for_entity(hass, entity_id: str):
    """读取指定实体的日志"""
    _LOGGER.info("✅读取日志记录")
    store = _get_log_store_by_entity(hass, entity_id)
    return await store.async_load() or []

async def delete_logs_for_entity(hass, entity_id: str):
    """删除指定实体的日志"""
    _LOGGER.info(f"✅删除日志记录: {entity_id}")
    await delete_log_store_by_entity(hass, entity_id)

async def delete_all_logs(hass):
    _LOGGER.info("✅ 准备删除所有 listenai_brain_*.json 日志文件")

    storage_dir = Path(hass.config.path(".storage"))
    count = 0

    for file in storage_dir.glob("listenai_brain_*.json"):
        try:
            file.unlink()
            _LOGGER.info(f"🗑️ 删除日志文件: {file.name}")
            count += 1
        except Exception as e:
            _LOGGER.warning(f"删除日志文件失败: {file.name}, 原因: {e}")

    if count == 0:
        _LOGGER.info("📁 没有找到匹配的日志文件")


def _get_store(hass):
    return Store(hass, 1, f"{DOMAIN}_apps.json")

async def load_apps(hass):
    """加载最新apps列表"""
    if "apps" in hass.data[DOMAIN]:
        return hass.data[DOMAIN]["apps"]

    store = _get_store(hass)
    apps = await store.async_load() or []
    hass.data[DOMAIN]["apps"] = apps  # 同步缓存
    return apps

@websocket_api.websocket_command({ "type": "listenai/list_apps" })
@websocket_api.require_admin
@websocket_api.async_response
async def handle_list_apps(hass, connection, msg):
    store = _get_store(hass)
    data = await store.async_load() or []
    connection.send_result(msg["id"], data)

@websocket_api.websocket_command({ "type": "listenai/save_apps", "apps": list })
@websocket_api.require_admin
@websocket_api.async_response
async def handle_save_apps(hass, connection, msg):
    _LOGGER.info("✅save_apps start")
    store = _get_store(hass)

    new_apps = msg["apps"]
    old_apps = await store.async_load() or []

    # 保存新 apps
    await store.async_save(new_apps)
    hass.data[DOMAIN]["apps"] = new_apps

    # 🔍 比较 entity_id 找出被删除的
    old_ids = {app.get("entity_id") for app in old_apps}
    new_ids = {app.get("entity_id") for app in new_apps}
    removed_ids = old_ids - new_ids

    from .storage_api import delete_logs_for_entity
    for entity_id in removed_ids:
        if entity_id:
            _LOGGER.info(f"🗑️ 删除被移除实体的日志: {entity_id}")
            await delete_logs_for_entity(hass, entity_id)

    connection.send_result(msg["id"], True)
    hass.bus.async_fire(f"{DOMAIN}_reload_listener")


@websocket_api.websocket_command({
    "type": "listenai/get_logs_for_entity",
    "entity_id": str
})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_get_logs_for_entity(hass, connection, msg):
    entity_id = msg.get("entity_id")
    if not entity_id:
        connection.send_error(msg["id"], "missing_entity_id", "缺少 entity_id 参数")
        return

    from .storage_api import load_logs_for_entity
    logs = await load_logs_for_entity(hass, entity_id)
    connection.send_result(msg["id"], logs)




def setup_storage_ws_api(hass):
    hass.components.websocket_api.async_register_command(handle_list_apps)
    hass.components.websocket_api.async_register_command(handle_save_apps)
    hass.components.websocket_api.async_register_command(handle_get_logs_for_entity)

    _LOGGER.info("✅ WebSocket API 已注册：list_apps, save_apps,get_logs_for_entity")
