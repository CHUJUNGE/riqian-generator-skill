# riqian-generator-skill

面向微信公众号日签的 Codex skill：先生成带双来源核验的内容候选，人工确认后输出可编辑 PowerPoint（`.pptx`）文件和来源记录。

## 使用

将本仓库中的 `riqian/` 目录复制到本机 Codex skills 目录后，在对话中使用 `$riqian`。skill 默认分为两步：

1. 生成 10 条具有两个独立权威来源的候选，等待人工选择。
2. 确认后基于随附品牌素材与固定网格生成新的可编辑 `.pptx` 文件。

模板与详细约束在 [`riqian/`](riqian/) 内。编辑前须核验 Bell MT Bold、仿宋、微软雅黑 Light；缺少字体时，经员工授权后在 macOS 运行 `riqian/scripts/install_fonts_macos.sh`，在 Windows 运行 `riqian/scripts/install_fonts_windows.ps1`。两者都只安装到当前用户目录，不会覆盖已有字体。安装后重启 PowerPoint；不得接受字体自动替换。

## 一键生成

确认文案后，按 `riqian/references/render-input.example.json` 填写字段。Codex 运行 `riqian/scripts/generate_pptx.mjs`，即可直接生成新的可编辑 `.pptx`，并在交付前自动执行字体、字号、字距、行距和固定网格的包级校验。不需要 Photoshop、Photopea 或 Keynote。

## 包含内容

- `riqian/assets/riqian-template-10.15.psd`：日签视觉参照模板
- `riqian/assets/riqian-template-10.15.psd`：视觉参照母版，不参与日常生产
- `riqian/assets/fonts/`：Bell MT Bold、仿宋、微软雅黑 Light 的公司提供字体
- `riqian/assets/brand/`：logo、背景和二维码
- `riqian/references/`：品牌、内容核验、字体、版式网格规范
- `riqian/scripts/generate_pptx.mjs`：从已批准 JSON 直接生成并校验 PPTX
- `riqian/scripts/install_fonts_macos.sh`、`install_fonts_windows.ps1`：当前用户字体安装器
