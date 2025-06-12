import os
import json
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.const import CONF_API_KEY
import voluptuous as vol

DOMAIN = "listenai_panel"
# 加载与当前文件同级目录下的 pca-code.json
HERE = os.path.dirname(__file__)
PCA_PATH = os.path.join(HERE, "pca-code.json")
with open(PCA_PATH, encoding="utf-8") as f:
    PCA_DATA = json.load(f)

class ListenAiConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """
    配置流程：
    1. 输入 API Key
    2. 选择省份
    3. 选择城市（基于省份）
    4. 选择区/县（基于城市）
    """
    VERSION = 1

    def __init__(self):
        self._data = {}

    async def async_step_user(self, user_input=None):
         # 检查是否已存在配置条目
        if self.hass.config_entries.async_entries(DOMAIN):
            return self.async_abort(reason="Only a single configuration of Listenai panel is allowed.")
        if user_input is not None and CONF_API_KEY in user_input:
            self._data[CONF_API_KEY] = user_input[CONF_API_KEY]
            return await self.async_step_province()
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str})
        )

    async def async_step_province(self, user_input=None):
        provinces = [p["name"] for p in PCA_DATA]
        if user_input is not None and "province" in user_input:
            self._data["province"] = user_input["province"]
            return await self.async_step_city()
        return self.async_show_form(
            step_id="province",
            data_schema=vol.Schema({vol.Required("province"): vol.In(provinces)})
        )

    async def async_step_city(self, user_input=None):
        province = self._data.get("province")
        cities = []
        for p in PCA_DATA:
            if p.get("name") == province:
                cities = [c["name"] for c in p.get("children", [])]
                break
        if user_input is not None and "city" in user_input:
            self._data["city"] = user_input["city"]
            return await self.async_step_district()
        return self.async_show_form(
            step_id="city",
            data_schema=vol.Schema({vol.Required("city"): vol.In(cities)})
        )

    async def async_step_district(self, user_input=None):
        province = self._data.get("province")
        city = self._data.get("city")
        districts = []
        for p in PCA_DATA:
            if p.get("name") == province:
                for c in p.get("children", []):
                    if c.get("name") == city:
                        districts = [d["name"] for d in c.get("children", [])]
                        break
                break
        if user_input is not None and "district" in user_input:
            self._data["district"] = user_input["district"]
            return self.async_create_entry(title="聆思中控大脑", data=self._data)
        return self.async_show_form(
            step_id="district",
            data_schema=vol.Schema({vol.Required("district"): vol.In(districts)})
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return ListenAiOptionsFlow(config_entry)

class ListenAiOptionsFlow(config_entries.OptionsFlow):
    """选项流程：允许编辑 API Key 和省市区"""
    def __init__(self, config_entry):
        self.config_entry = config_entry
        # 初始化已有配置
        self._data = dict(config_entry.data)

    async def async_step_init(self, user_input=None):
        # 开始于 API Key 步骤
        return await self.async_step_user_api(user_input)

    async def async_step_user_api(self, user_input=None):
        """步骤1：编辑 API Key"""
        errors = {}
        if user_input is not None and CONF_API_KEY in user_input:
            self._data[CONF_API_KEY] = user_input[CONF_API_KEY]
            return await self.async_step_province(user_input=None)
        return self.async_show_form(
            step_id="user_api",
            data_schema=vol.Schema({
                vol.Required(CONF_API_KEY, default=self._data.get(CONF_API_KEY)): str
            }),
            errors=errors
        )

    async def async_step_province(self, user_input=None):
        """步骤2：编辑省份"""
        provinces = [p["name"] for p in PCA_DATA]
        if user_input is not None and "province" in user_input:
            self._data["province"] = user_input["province"]
            return await self.async_step_city(user_input=None)
        return self.async_show_form(
            step_id="province",
            data_schema=vol.Schema({
                vol.Required("province", default=self._data.get("province")): vol.In(provinces)
            })
        )

    async def async_step_city(self, user_input=None):
        """步骤3：编辑城市（联动）"""
        province = self._data.get("province")
        cities = []
        for p in PCA_DATA:
            if p.get("name") == province:
                cities = [c["name"] for c in p.get("children", [])]
                break
        if user_input is not None and "city" in user_input:
            self._data["city"] = user_input["city"]
            return await self.async_step_district(user_input=None)
        return self.async_show_form(
            step_id="city",
            data_schema=vol.Schema({
                vol.Required("city", default=self._data.get("city")): vol.In(cities)
            })
        )

    async def async_step_district(self, user_input=None):
        """步骤4：编辑区/县（联动）"""
        province = self._data.get("province")
        city = self._data.get("city")
        districts = []
        for p in PCA_DATA:
            if p.get("name") == province:
                for c in p.get("children", []):
                    if c.get("name") == city:
                        districts = [d["name"] for d in c.get("children", [])]
                        break
                break
        if user_input is not None and "district" in user_input:
            self._data["district"] = user_input["district"]
            return self.async_create_entry(title="", data=self._data)
        return self.async_show_form(
            step_id="district",
            data_schema=vol.Schema({
                vol.Required("district", default=self._data.get("district")): vol.In(districts)
            })
        )
