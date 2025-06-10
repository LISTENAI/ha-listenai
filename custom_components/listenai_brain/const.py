
DOMAIN = "listenai_brain"

MAX_LOG_ENTRIES = 100

# HVAC 模式中英文对应
HVAC_MODE_MAP = {
    "关闭": "off",
    "打开": "on",
    "制冷": "cool",
    "制热": "heat",
    "送风": "fan_only",
    "除湿": "dry",
    "自动": "auto",
    "off": "关闭",
    "on": "打开",
    "cool": "制冷",
    "heat": "制热",
    "fan_only": "送风",
    "dry": "除湿",
    "auto": "自动",
}

# 预设模式 preset_mode 中英文对应
PRESET_MODE_MAP = {
    # 中文到英文
    "新风": "fresh_air",
    "净化": "purify",
    "除菌": "sterilize",
    "无预设": "none",
    "舒适": "comfort",
    "节能": "eco",
    "强力": "boost",
    "睡眠": "sleep",
    "离家": "away",

    # 英文到中文（反向）
    "fresh_air": "新风",
    "purify": "净化",
    "sterilize": "除菌",
    "none": "无预设",
    "comfort": "舒适",
    "eco": "节能",
    "boost": "强力",
    "sleep": "睡眠",
    "away": "离家",
}


# 风速 fan_modes 数字到英文映射
FAN_MODE_MAP = {
    0: "off",
    1: "on_low",
    2: "on_high",
    3: "auto_low",
    4: "auto_high",
}

