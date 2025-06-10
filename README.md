# 聆思中控大脑 HA 插件

## 安装步骤
### HACS 添加自定义存储库  
在 Home Assistant 的 HACS 中，点击右上角的三个点，选择"自定义存储库"，并添加以下 URL:
```bash
https://github.com/LISTENAI/ha-listenai.git
```

### 添加聆思中控大脑集成  
进入 Home Assistant 的"集成"页面，搜索并添加"聆思中控大脑"。


### 版本兼容性 📅  
请确保 Home Assistant 的版本不低于 11.0，因为聆思中控大脑主要针对最新版本开发。如果遇到无法识别的实体问题，建议重启系统或更新至最新版本。

## 配置说明

### API设置
- **API密钥**：从聆思平台(LSPlatform)获取，用于访问API服务
