import json
import re
import asyncio
import logging
from datetime import datetime
import aiohttp
from .storage_api import load_apps
from .const import DOMAIN
from .const import HVAC_MODE_MAP, FAN_MODE_MAP

_LOGGER = logging.getLogger(__name__)
_active_trigger_tasks = {}
async def trigger_ai_for_device(hass, app):
    """发起设备AI请求，管理并发"""
    entity_id = app["entity_id"]

     # 判断设备是否关机，关机则跳过
    stateObj = hass.states.get(entity_id)
    if not stateObj or stateObj.state in ("off", "unavailable", "unknown", None):
        _LOGGER.warning(f"[{entity_id}] 当前设备状态为 {stateObj.state if stateObj else '未知'}，跳过AI请求")
        return

    # 先取消之前的
    old_task = _active_trigger_tasks.get(entity_id)
    if old_task and not old_task.done():
        _LOGGER.info(f" ⏹️ [{entity_id}] 取消上一次未完成的AI请求")
        old_task.cancel()

    # 建立新的请求任务
    task = hass.loop.create_task(_real_trigger_ai_for_device(hass, app))
    _active_trigger_tasks[entity_id] = task

async def _real_trigger_ai_for_device(hass, app):
    """实际执行AI请求"""
    entity_id = app["entity_id"]
    try:
        apps = await load_apps(hass)
        app = next((a for a in apps if a.get("entity_id") == entity_id), app)
        _LOGGER.info(f"🚀 [{entity_id}] 开始调用 ListenAI")

        content = await request_listenai(hass, app)

        if not content:
            _LOGGER.warning(f"[{entity_id}] 未收到有效AI返回，跳过处理")
            return

        _LOGGER.info(f"[{entity_id}] 拼接完整AI内容：{content}")
        await process_ai_response(hass, app, content)

    except asyncio.CancelledError:
        _LOGGER.info(f" 🛑 [{entity_id}]AI请求被取消")
    except Exception as e:
        _LOGGER.exception(f"[{entity_id}] AI请求异常: {e}")

async def request_listenai(hass, app) -> str:
    from .storage_api import append_log_entry
    content = ""
    reasoning_content = ""
    health_content = ""
    health_reasoning_content = ""
    error_msg = None
    body = {}

    try:
        entry = next(iter(hass.config_entries.async_entries(DOMAIN)))
        api_key = entry.options.get("api_key", entry.data.get("api_key", ""))
        province = entry.options.get("province", entry.data.get("province", ""))
        city = entry.options.get("city", entry.data.get("city", ""))
        district = entry.options.get("district", entry.data.get("district", ""))
        if not api_key:
            _LOGGER.error("ListenAI请求失败: 缺少API KEY")
            return ""

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        def get_entity_value(entity_id):
            if not entity_id:
                return ""
            state = hass.states.get(entity_id)
            return state.state if state else ""

        temperature = get_entity_value(app.get("temperatureSensor"))
        humidity = get_entity_value(app.get("humiditySensor"))
        co2 = get_entity_value(app.get("co2_sensor"))
        hcho = get_entity_value(app.get("hchoSensor"))
        pm25 = get_entity_value(app.get("pm25Sensor"))

        healthy_cards = []
        for card_str in app.get("healthy_cards", []):
            try:
                card = json.loads(card_str)
                healthy_cards.append(card)
            except Exception as e:
                _LOGGER.warning(f"解析healthy_card失败: {e}")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        inputs = {
            "plan_type": "air_status",
            "params": {
                "客观环境": {
                    "城市与时间": {"时间": now, "城市": province+city+district},
                    "室外天气": None,
                    "室内描述": None,
                    "室内空气": {
                        "温度": temperature,
                        "湿度": humidity,
                        "二氧化碳浓度": co2,
                        "甲醛浓度": hcho,
                        "PM2.5浓度": pm25
                    }
                },
                "健康卡片": healthy_cards,
                "用户操作记录": []
            }
        }

        body = {
            "stream": True,
            "model": "spark-x1-home",
            "messages": [{"role": "user", "content": ""}],
            "inputs": inputs
        }
        _LOGGER.info(f"ListenAI请求参数--->'{json.dumps(inputs, ensure_ascii=False, indent=2)}")
        # 这里超时时间写死成1500
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=1500)) as session:
            async with session.post(
                "https://api.listenai.com/v1/chat/completions",
                headers=headers,
                json=body
            ) as resp:
                if resp.status != 200:
                    error_msg = f"ListenAI请求失败，状态码: {resp.status}"
                    _LOGGER.error(error_msg)
                    return ""

                try:
                    async for line in resp.content:
                        if not line:
                            continue
                        decoded = line.decode("utf-8").strip()
                        if decoded.startswith("data:"):
                            payload = decoded.replace("data:", "").strip()
                            if payload == "[DONE]":
                                break
                            try:
                                data = json.loads(payload)
                                delta = data.get("choices", [{}])[0].get("delta", {})

                                if (chunk := delta.get("content")):
                                    content += chunk
                                if (chunk := delta.get("reasoning_content")):
                                    reasoning_content += chunk
                                if (chunk := delta.get("health_content")):
                                    health_content += chunk
                                if (chunk := delta.get("health_reasoning_content")):
                                    health_reasoning_content += chunk

                            except json.JSONDecodeError:
                                _LOGGER.warning("ListenAI返回非标准JSON，跳过该段")
                except (asyncio.TimeoutError, asyncio.CancelledError):
                    error_msg = "ListenAI流式读取超时或取消"
                    _LOGGER.warning(error_msg)

        return content

    except Exception as e:
        error_msg = f"请求异常: {e}"
        _LOGGER.exception("ListenAI请求异常")
        return ""

    finally:
        try:
            response_log = "\n".join(filter(None, [
                reasoning_content,
                health_reasoning_content,
                health_content,
                content
            ])) or (error_msg or "无返回")

            await append_log_entry(
                hass,
                app["entity_id"],
                app.get("name", "未知应用"),
                body,
                response_log
            )
        except Exception as log_err:
            _LOGGER.warning(f"⚠️ 日志记录失败: {log_err}")

async def process_ai_response(hass, app, content):
    """处理 ListenAI 返回的指令，仅支持 temperature、fan_mode、hvac_mode 控制"""
    entity_id = app["entity_id"]
    supported_modes = app.get("mode", [])
    # _LOGGER.info(f" 🎯 [{entity_id}] 支持的动作: {supported_modes} ")
    actions = parse_command(content)

    if not actions:
        _LOGGER.warning(f"[{entity_id}] ❌ 无有效指令解析")
        return

    stateObj = hass.states.get(entity_id)
    if not stateObj or stateObj.state in ("off", "unavailable", "unknown", None):
        _LOGGER.warning(f"[{entity_id}] 当前设备状态为 {stateObj.state if stateObj else '未知'}，跳过控制")
        return

    # 获取 gearSettings 映射表
    entry = next(iter(hass.config_entries.async_entries(DOMAIN)))
    gear_settings = app.get("gearSettings", {})
    hvac_map = {item["label"]: item["option"] for item in gear_settings.get("hvac_mode", [])}
    fan_map = {item["label"]: item["option"] for item in gear_settings.get("fan_mode", [])}
    # _LOGGER.info(f"[{entity_id}] hvac_mode映射: {hvac_map}")
    # _LOGGER.info(f"[{entity_id}] fan_mode映射: {fan_map}")

    for action in actions:
        action_type = action["type"]
        value = action["value"]
        

        try:
            if action_type == "set_temperature":
                if "temperature" in supported_modes or "target_temp_range" in supported_modes:
                    _LOGGER.info(f" 🎯 [{entity_id}] 准备处理动作: {action_type} -> {value}")
                    await control_climate_feature(hass, entity_id, "temperature", value)
                else:
                    _LOGGER.info(f"🚫 [{entity_id}] 动作 {action_type} 不支持或未配置，忽略")

            elif action_type == "set_fan_mode":
                if "fan_mode" in supported_modes:
                    label = f"{int(value)}档" if str(value).isdigit() else value
                    mapped_value = fan_map.get(label, value)
                    _LOGGER.info(f" 🎯 [{entity_id}] 准备处理动作: {action_type} -> {value} -> {mapped_value}")
                    await control_climate_feature(hass, entity_id, "fan_mode", mapped_value)
                else:
                    _LOGGER.info(f"🚫 [{entity_id}] 动作 {action_type} 不支持或未配置，忽略")

            elif action_type == "set_mode":
                if "hvac_mode" in supported_modes:
                    mapped_value = hvac_map.get(value, value)
                    _LOGGER.info(f" 🎯 [{entity_id}] 准备处理动作: {action_type} -> {value} -> {mapped_value}")
                    await control_climate_feature(hass, entity_id, "hvac_mode", mapped_value)
                else:
                    _LOGGER.info(f"🚫 [{entity_id}] 动作 {action_type} 不支持或未配置，忽略")

        except Exception as e:
            _LOGGER.exception(f"💥 [{entity_id}] 执行动作 {action_type} 失败: {e}")

async def control_climate_feature(hass, entity_id: str, feature_key: str, value):
    """
    通用 climate 控制逻辑：检查支持 + 动态字段映射 + 封装服务调用
    """
    state = hass.states.get(entity_id)
    if not state:
        _LOGGER.warning(f"[{entity_id}] 无法获取实体状态")
        return

    attrs = state.attributes
    features = attrs.get("supported_features", 0)

    service_map = {
        "temperature": "set_temperature",
        "fan_mode": "set_fan_mode",
        "hvac_mode": "set_hvac_mode",
    }

    service = service_map.get(feature_key)
    if not service:
        _LOGGER.warning(f"[{entity_id}] 不支持的控制类型: {feature_key}")
        return

    services = await hass.helpers.service.async_get_all_descriptions()
    if service not in services.get("climate", {}):
        _LOGGER.warning(f"[{entity_id}] 服务 climate.{service} 未注册，跳过")
        return

    fields = services["climate"][service].get("fields", {})
    data = {"entity_id": entity_id}

    if feature_key == "temperature":
        if (features & 1):
            if "temperature" in fields:
                data["temperature"] = value
        elif (features & 2):
            if "target_temp_low" in fields and "target_temp_high" in fields:
                data["target_temp_low"] = value - 1
                data["target_temp_high"] = value 
            else:
                _LOGGER.warning(f"[{entity_id}] 不支持温度区间字段，跳过")
                return
        else:
            _LOGGER.warning(f"[{entity_id}] 不支持温度控制，跳过")
            return
    else:
        if feature_key not in fields:
            _LOGGER.warning(f"[{entity_id}] 服务 {service} 缺少字段: {feature_key}，跳过")
            return

        options = attrs.get(feature_key + "s")
        # if options:
            # _LOGGER.info(f"[{entity_id}] {feature_key} 可选项: {options}")

        if options and hasattr(options[0], "value"):
            options = [o.value for o in options]

        if options and value not in options:
            _LOGGER.warning(f"[{entity_id}] 参数 {value} 不在支持范围 {options} 中，跳过")
            return

        data[feature_key] = value

    await safe_call_climate_service(hass, entity_id, service, data)

def parse_command(text):
    """解析 ListenAI 返回的 <cmd-json> 指令，仅处理温度/风速/运行模式"""
    try:
        match = re.search(r"<cmd-json>(.*?)</cmd-json>", text, re.DOTALL)
        if not match:
            _LOGGER.warning("未找到<cmd-json>格式内容")
            return None

        cmd_json_str = match.group(1)
        cmd_data = json.loads(cmd_json_str)
        _LOGGER.info(f"解析到指令JSON: {cmd_data}")

        actions = []

        if "temperature" in cmd_data:
            actions.append({"type": "set_temperature", "value": float(cmd_data["temperature"])})
        if "wind_speed" in cmd_data:
            actions.append({"type": "set_fan_mode", "value": cmd_data["wind_speed"]})
        if "mode" in cmd_data:
            actions.append({"type": "set_mode", "value": cmd_data["mode"]})

        return actions if actions else None

    except Exception as e:
        _LOGGER.exception(f"解析<cmd-json>失败: {e}")
        return None

async def safe_call_climate_service(
    hass,
    entity_id: str,
    service: str,
    data: dict,
    check_service: bool = True,
    blocking: bool = False,
):
    """封装 climate 服务调用，带服务校验和异常捕获"""
    try:
        if check_service:
            services = await hass.helpers.service.async_get_all_descriptions()
            if service not in services.get("climate", {}):
                _LOGGER.warning(f"[{entity_id}] ❌ 服务 climate.{service} 未注册，跳过调用")
                return

        await hass.services.async_call("climate", service, data, blocking=blocking)
        _LOGGER.info(f"✅ [{entity_id}] 成功调用 climate.{service} {data}")
    except Exception as e:
        _LOGGER.exception(f"💥 [{entity_id}] 执行 climate.{service} 失败: {e}")
