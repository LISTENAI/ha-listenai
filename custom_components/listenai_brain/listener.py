import asyncio
import logging
import asyncio
from homeassistant.helpers.event import async_track_state_change_event
from .storage_api import load_apps
from .device_handler import trigger_ai_for_device

_LOGGER = logging.getLogger(__name__)

_device_listeners = {}


async def setup_listener(hass):
    """初始化监听器"""
    _LOGGER.info("🔔 setup_listener: 加载初始监听设备")
    await _refresh_listener(hass)
    hass.bus.async_listen_once("homeassistant_stop", _handle_homeassistant_stop)

async def reload_listener(hass):
    """重新加载监听器"""
    _LOGGER.info("🔄 reload_listener: 重新刷新设备监听")
    await _refresh_listener(hass)

async def _handle_homeassistant_stop(event):
    """HA停止时清理所有监听"""
    global _device_listeners
    _LOGGER.info("🛑 Home Assistant 停止，清理监听")
    for listener in _device_listeners.values():
        listener["unsub"]()
        listener["task"].cancel()
    _device_listeners.clear()

async def _refresh_listener(hass):
    """根据最新apps精细刷新设备监听"""
    global _device_listeners

    apps = await load_apps(hass)

    new_devices = {}
    for app in apps:
        if app.get("enable_listen") and app.get("entity_id"):
            entity_id = app["entity_id"]
            interval = _parse_interval(app.get("interval", 600))
            new_devices[entity_id] = {
                "app": app,
                "interval": interval
            }

    # 删除不存在的设备监听
    remove_entities = set(_device_listeners.keys()) - set(new_devices.keys())
    for entity_id in remove_entities:
        listener = _device_listeners.pop(entity_id)
        listener["unsub"]()
        listener["task"].cancel()
        _LOGGER.info(f"❌ 移除监听: {entity_id}")

    # 添加或更新设备监听
    for entity_id, data in new_devices.items():
        if entity_id not in _device_listeners:
            _device_listeners[entity_id] = await _start_device_listener(hass, data["app"], data["interval"])
            _LOGGER.info(f"✅ 新增监听: {data["app"]["name"]},{entity_id},大脑运行间隔:{ data["interval"]}s")
        else:
            # interval变化，重建
            old_interval = _device_listeners[entity_id]["interval"]
            if old_interval != data["interval"]:
                listener = _device_listeners.pop(entity_id)
                listener["unsub"]()
                listener["task"].cancel()
                _device_listeners[entity_id] = await _start_device_listener(hass, data["app"], data["interval"])
                _LOGGER.info(f"🔄 更新监听(interval变化): {entity_id}")

    _LOGGER.info(f"🎯 当前活跃监听数: {len(_device_listeners)}")

async def _start_device_listener(hass, app, interval):
    """为设备绑定状态监听 + 定时器"""
    entity_id = app["entity_id"]

    unsub = async_track_state_change_event(
        hass,
        entity_id,
        lambda event, app=app: hass.loop.call_soon_threadsafe(
            lambda: hass.async_create_task(_safe_handle_device_state(hass, event, app))
        )
    )

    task = hass.loop.create_task(_start_interval_trigger(hass, app, interval))

    # 🔥新增：首次启动时判断当前状态（增加容错）
    for _ in range(3):  # 最多等3次（每次1秒）
        current_state = hass.states.get(entity_id)
        # _LOGGER.info(f"[{entity_id}] 设备设备状态是，{current_state}")
        if current_state:
            if current_state.state not in ("off", "unavailable", "unknown", None):
                await trigger_ai_for_device(hass, app)
            else:
                _LOGGER.info(f"[{entity_id}] 设备当前未开启，等待开机时触发")
            break
        else:
            _LOGGER.warning(f"[{entity_id}] 当前无法获取到设备状态，1秒后重试...")
            await asyncio.sleep(1)

    return {
        "unsub": unsub,
        "task": task,
        "interval": interval
    }

async def _safe_handle_device_state(hass, event, app):
    """包装状态变化处理，异常保护"""
    try:
        await handle_device_state(hass, event.data, app)
    except Exception as e:
        _LOGGER.exception(f"[{app['entity_id']}] 处理设备状态异常: {e}")

async def refresh_device_listener(hass, app):
    """精确刷新单台设备监听"""
    global _device_listeners

    entity_id = app.get("entity_id")
    if not entity_id:
        _LOGGER.warning("刷新设备监听失败: app缺少entity_id")
        return

    interval = _parse_interval(app.get("interval", 600))

    # 先移除原有的
    if entity_id in _device_listeners:
        listener = _device_listeners.pop(entity_id)
        listener["unsub"]()
        listener["task"].cancel()
        _LOGGER.info(f"🔄 移除旧监听: {entity_id}")

    # 新增最新的监听
    _device_listeners[entity_id] = await _start_device_listener(hass, app, interval)
    _LOGGER.info(f"✅ 刷新单台监听: {app.get('name')},{entity_id},间隔{interval}s")


async def handle_device_state(hass, event_data, app):
    """设备状态变化处理"""
    entity_id = app["entity_id"]
    old_state = event_data.get("old_state")
    new_state = event_data.get("new_state")

    if not old_state or not new_state:
        _LOGGER.warning(f"[{ app["name"]},{entity_id},{old_state},{new_state}] 状态数据无效，跳过")
        return

    _LOGGER.info(f"[{entity_id}] 状态变化: {old_state.state} ➔ {new_state.state}")

    # 关机 ➔ 开机修正逻辑
    if old_state.state == "off" and new_state.state not in ("off", "unavailable", "unknown", None):
        _LOGGER.info(f"✅ [{entity_id}] 检测到开机瞬间，立即触发AI")
        await trigger_ai_for_device(hass, app)
    # else:
    #     _LOGGER.debug(f"[{entity_id}] 状态变化非开机瞬间，忽略")

async def _start_interval_trigger(hass, app, interval):
    """定时器周期触发 AI"""
    entity_id = app["entity_id"]
    while True:
        try:
            await asyncio.sleep(interval)
            _LOGGER.info(f"✅ [{entity_id}] 定时触发AI，每{interval}秒")
            await trigger_ai_for_device(hass, app)
        except asyncio.CancelledError:
            _LOGGER.info(f"[{entity_id}] 定时任务取消")
            break
        except Exception as e:
            _LOGGER.exception(f"[{entity_id}] 定时任务异常: {e}")


def _parse_interval(interval_raw):
    """安全解析 interval 字段 (小时 ➔ 秒)"""
    try:
        interval_hours = float(interval_raw)
        return int(interval_hours * 3600)
    except (TypeError, ValueError):
        _LOGGER.warning(f"非法 interval 值: {interval_raw}，使用默认600秒")
        return 600
