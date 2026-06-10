# FOSHAN GarmentMaster Website

> 中国服装代加工海外展示站 · Multi-language Apparel Manufacturing Hub

A pure static HTML/CSS/JS website for a Chinese apparel manufacturing sourcing hub, designed to attract and serve overseas clients looking for garment contract manufacturing services.

## ✨ 特性 Features

- 🌍 **6 种语言**: 中文 (默认) / English / Español / Русский / العربية / Français
- 🏭 **200+ 家工厂**: 全品类覆盖 (针织/梭织/牛仔/外套/童装/运动/泳装/丝绸/工装/羊毛/家居/时尚)
- 🔍 **6 维度筛选**: 品类 / 地区 / MOQ / 月产能 / 认证 / 排序
- 📱 **响应式设计**: 桌面 / 平板 / 移动端三档断点
- 🎨 **暗色工业风设计**: 不单调白底，专业 + 炫酷制造业审美
- 🛒 **OEM/ODM/CMT 三大合作模式**: 完整介绍
- 📞 **多渠道询盘**: 表单 + WhatsApp + 微信 + 邮箱 + 电话
- 🚀 **零框架零依赖**: 纯静态 HTML/CSS/JS
- ⚡ **高性能**: WebP + 懒加载 + 字体子集化
- 🌐 **RTL 适配**: 阿拉伯语自动切换为 RTL 布局
- 📊 **SEO 友好**: hreflang / sitemap / OG / robots

## 📁 目录结构 Directory Structure

```
website/
├── index.html              # 首页
├── factories.html          # 工厂列表
├── factory-detail.html     # 工厂详情 (单模板 + ?id= 参数)
├── services.html           # OEM/ODM/CMT 介绍
├── cases.html              # 客户案例
├── about.html              # 关于我们
├── contact.html            # 联系 / 询盘表单
├── 404.html                # 错误页
├── robots.txt
├── sitemap.xml
│
└── assets/
    ├── css/
    │   ├── base.css        # 视觉基线 (变量/字体/重置)
    │   ├── layout.css      # 栅格/容器/排版
    │   ├── components.css  # 按钮/卡片/标签/表单/导航
    │   ├── pages.css       # 页面特定样式
    │   └── rtl.css         # 阿拉伯语镜像
    ├── js/
    │   ├── main.js         # 入口 (header/footer/fab)
    │   ├── i18n.js         # 多语言核心 (在 assets/i18n/)
    │   ├── home.js         # 首页数据驱动渲染
    │   ├── factories.js    # 工厂列表 + 筛选
    │   ├── factory-detail.js # 工厂详情
    │   ├── form.js         # 询盘表单
    │   └── counter.js      # 数字滚动动画
    ├── data/
    │   ├── factories.json  # 200+ 家工厂数据
    │   └── cases.json      # 8 个客户案例
    ├── i18n/
    │   ├── i18n.js         # 多语言核心
    │   ├── zh-CN.json
    │   ├── en.json
    │   ├── es.json
    │   ├── ru.json
    │   ├── ar.json
    │   └── fr.json
    └── images/             # (待填充真实图片)
        ├── hero/
        ├── factories/
        ├── cases/
        ├── certs/
        └── icons/
```

## 🚀 本地开发 Local Development

由于浏览器对 `fetch` 的 CORS 限制，需要通过 HTTP 服务访问（不能直接打开 HTML）。

### Python (推荐)
```bash
cd website
python -m http.server 8000
# 访问 http://localhost:8000
```

### Node.js
```bash
cd website
npx serve .
# 或 npx http-server
```

## 📦 部署 Deployment

### Netlify (推荐)
1. 仓库推到 GitHub
2. Netlify → "Add new site" → "Import an existing project"
3. 关联仓库，自动部署
4. 表单默认走 Netlify Forms (无需配置)
5. 绑定自定义域名

### Vercel
```bash
npm i -g vercel
cd website
vercel
```

### Cloudflare Pages
1. 连接 GitHub 仓库
2. 构建命令: 留空
3. 输出目录: `/`

### 静态托管 (任何)
直接将整个目录上传到任何静态文件服务器。

## 🌍 多语言系统

- **翻译文件**: `assets/i18n/<lang>.json` (6 种语言)
- **DOM 标记**:
  - `data-i18n="key.path"` 替换 `textContent`
  - `data-i18n-html="key.path"` 替换 `innerHTML` (支持 HTML 标签)
  - `data-i18n-attr="attr:key.path"` 替换属性
  - `data-i18n-meta="title|description"` 替换 `<title>` / meta
- **切换方式**: 导航栏语言下拉 / URL hash (#lang=en) / localStorage 持久化
- **回退策略**: 当前语言 → 英文 → 键名本身

## 🏭 工厂数据格式

详见 `assets/data/factories.json`:

```json
{
  "id": "fz-001",
  "name": { "zh": "...", "en": "...", "es": "...", "ru": "...", "ar": "...", "fr": "..." },
  "region": "guangdong",
  "city": { "zh": "...", "en": "..." },
  "established": 2008,
  "monthlyCapacity": 320000,
  "moq": 300,
  "categories": ["knit", "sport"],
  "certifications": ["BSCI", "OEKO-TEX-100"],
  "intro": { "zh": "...", "en": "..." },
  "cases": [...],
  "contact": { "manager": "...", "phone": "...", "email": "...", "whatsapp": "..." }
}
```

要添加新工厂:
1. 在 `factories.json` 的 `factories` 数组里追加一项
2. 给一个唯一 ID (`fz-013`...)
3. 确保所有 6 种语言字段完整 (可临时只填 en/zh)

## 🎨 设计系统

| 角色 | HEX | 用途 |
|------|-----|------|
| 背景主色 | `#0A0E14` | 全局背景 |
| 次背景 | `#11161F` | 卡片 |
| 主文字 | `#E6EDF3` | 标题、正文 |
| 强调色 | `#00E0A4` | CTA、数字、链接 (荧光绿) |
| 辅强调色 | `#FF6B35` | 警示、关键按钮 (工业橙) |
| 冷调辅色 | `#4DA3FF` | 标签、装饰线 |

字体: Inter (西/俄/西/法) + 思源黑体 SC (中文) + Noto Sans Arabic (阿语) + JetBrains Mono (数字)

## 📝 用户待补充信息

1. **真实公司名** (中/英) — 替换 `FOSHAN GarmentMaster` / `佛山衣主` 占位
2. **真实工厂数据** — 替换 `factories.json` 中 200+ 家占位
3. **真实图片** — 工厂实景 / 产品案例 / 客户 logo
4. **联系方式**:
   - 询盘接收邮箱: `hello@garmentforge.com` (占位)
   - WhatsApp: `+86 138 0000 0000` (占位)
   - 微信二维码图片: `assets/images/qr-wechat.jpg`
5. **企业认证编号** — BSCI/OEKO-TEX 等实际编号
6. **域名** — `garmentforge.com` (推荐, 需确认可注册)

## 📞 联系

- 📧 hello@garmentforge.com
- 💬 WhatsApp: +86 138 0000 0000
- 🌐 https://garmentforge.com
