# riqian-generator-skill

面向微信公众号日签的 Codex skill：先生成带双来源核验的内容候选，人工确认后输出可编辑 PSD、PNG 和来源 manifest。

## 使用

将本仓库中的 `riqian/` 目录复制到本机 Codex skills 目录后，在对话中使用 `$riqian`。skill 默认分为两步：

1. 生成 10 条具有两个独立权威来源的候选，等待人工选择。
2. 确认后使用随附的浏览器渲染器生成 PSD、PNG 和 manifest。

模板与详细约束在 [`riqian/`](riqian/) 内。浏览器渲染器基于 Photopea；PSD 会发送到其网页应用处理，因此机密模板应改用内部渲染服务。

## 包含内容

- `riqian/assets/riqian-template-10.15.psd`：可编辑日签母版
- `riqian/assets/photopea-runner.html`：免安装浏览器渲染器
- `riqian/references/`：品牌配置、图层映射和 payload 示例
- `riqian/scripts/`：只读预检与可选 Photoshop 渲染脚本
