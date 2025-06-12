# 聆思中控大脑 HA 插件

## 安装步骤
### HACS 添加自定义存储库  
在 Home Assistant 的 HACS 中，点击右上角的三个点，选择"自定义存储库"，并添加以下 URL:
```bash
https://github.com/LISTENAI/listenai_brain
```

### 添加聆思中控大脑集成  
进入 Home Assistant 的"集成"页面，搜索并添加"聆思中控大脑"。
请按照以下步骤操作：  

### 操作步骤  
1. 打开HACS（Home Assistant社区商店）。  
2. 点击右上角的三个点图标。  
3. 选择“自定义仓库”（Custom repositories）。  
4. 在“仓库”（Repository）字段中输入：`https://github.com/LISTENAI/listenai_brain`。  
5. 在“类别”（Category）字段中选择“集成”（Integration）。  
6. 点击“添加”（Add）。  
7. 在集成列表中搜索“聆思中控大脑”。  
8. 点击“下载“（Download）安装该集成。  
9. 重启Home Assistant。  
10. 进入“设置”（Settings）→“设备与服务”→“集成”（Integrations）→“添加集成”（Add integration），搜索“聆思中控大脑”。  
11. 按照提示完成集成配置。  


### 说明  
- 若安装或配置过程中出现问题，可检查仓库URL是否正确，或通过Home Assistant日志排查错误。


### 版本兼容性 📅  
请确保 Home Assistant 的版本不低于 11.0，因为聆思中控大脑主要针对最新版本开发。如果遇到无法识别的实体问题，建议重启系统或更新至最新版本。

## 配置说明

### API设置
- **API密钥**：从聆思平台(LSPlatform)获取，用于访问API服务
