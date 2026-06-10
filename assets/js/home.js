/* ===================================================================
 * home.js — 首页数据驱动渲染
 * --------------------------------------------------------------------
 * 负责: 精选工厂、精选案例、认证墙、能力图标
 * =================================================================== */

(function (global) {
  'use strict';

  const ICONS_CAP = {
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    pen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    scissors: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    truck: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
  };

  function getLang() {
    return (global.i18n && global.i18n.getLanguage()) || 'zh-CN';
  }

  function pickLocalized(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = getLang();
    if (obj[lang] !== undefined) return obj[lang];
    const base = lang.split('-')[0];
    if (obj[base] !== undefined) return obj[base];
    if (obj['en'] !== undefined) return obj['en'];
    return Object.values(obj)[0] || '';
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('en-US');
  }

  function renderFeaturedFactories() {
    const container = document.querySelector('[data-featured-factories]');
    if (!container || !global.GF_DATA) return;

    // 选 6 家代表: 1-6 (FOSHAN GarmentMaster 自营车间) — 全部有真实图片
    const featured = global.GF_DATA.factories.filter(f =>
      ['fz-001', 'fz-002', 'fz-003', 'fz-004', 'fz-005', 'fz-006'].includes(f.id)
    );

    container.innerHTML = featured.map(f => {
      const cats = f.categories.map(c => {
        const cDef = global.GF_DATA.categories.find(x => x.id === c);
        return cDef ? pickLocalized(cDef) : c;
      });
      const city = pickLocalized(f.city);
      const hasImage = f.images && f.images.length > 0;
      const imagePath = hasImage ? `assets/images/factories/${f.images[0]}` : '';
      const mediaHTML = hasImage
        ? `<img src="${imagePath}" alt="${pickLocalized(f.name)}" loading="lazy" class="f-card__media-img">
           <div class="f-card__media-overlay"></div>
           <span class="f-card__media-num">// ${f.id.toUpperCase()}</span>
           <span class="f-card__media-label">${city.toUpperCase()} · ${cats[0] || ''}</span>`
        : `<span class="f-card__media-num">// ${f.id.toUpperCase()}</span>
           <span class="f-card__media-label">${city.toUpperCase()} · ${cats[0] || ''}</span>`;
      return `
<a class="f-card col-4 col-sm-6" href="factory-detail.html?id=${f.id}">
  <div class="f-card__media">
    ${mediaHTML}
  </div>
  <div class="f-card__body">
    <div class="f-card__head">
      <div>
        <div class="f-card__title">${pickLocalized(f.name)}</div>
        <div class="f-card__region">${city}</div>
      </div>
    </div>
    <div class="f-card__specialties">
      ${cats.slice(0, 3).map(c => `<span class="tag">${c}</span>`).join('')}
    </div>
    <div class="f-card__stats">
      <div class="f-card__stat">
        <span class="f-card__stat-label">Capacity</span>
        <span class="f-card__stat-value">${(f.monthlyCapacity / 10000).toFixed(0)} 万件/月</span>
      </div>
      <div class="f-card__stat">
        <span class="f-card__stat-label">MOQ</span>
        <span class="f-card__stat-value">${f.moq}</span>
      </div>
    </div>
    <div class="f-card__cta">
      <span>View Detail</span>
      <span class="f-card__cta-arrow">→</span>
    </div>
  </div>
</a>`;
    }).join('');

    // 触发 i18n
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: getLang() } }));
  }

  async function renderFeaturedCases() {
    const container = document.querySelector('[data-featured-cases]');
    if (!container) return;

    try {
      const res = await fetch('assets/data/cases.json');
      const data = await res.json();
      const featured = data.cases.slice(0, 3);

      container.innerHTML = featured.map((c, i) => `
<a class="case-card col-4 col-sm-12" href="cases.html#${c.id}">
  <div class="case-card__media">
    <img src="assets/images/cases/${c.image}" alt="${pickLocalized(c.title)}" loading="lazy" class="case-card__media-img">
    <div class="case-card__media-overlay"></div>
    <span class="case-card__media-num">// ${String(i + 1).padStart(2, '0')}</span>
  </div>
  <div class="case-card__body">
    <div class="case-card__meta">
      <span>${c.country}</span>
      <span class="case-card__meta-dot"></span>
      <span>${c.year}</span>
    </div>
    <div class="case-card__title">${pickLocalized(c.title)}</div>
    <div class="case-card__summary">${pickLocalized(c.summary)}</div>
    <div class="case-card__stats">
      <div class="case-card__stat">
        <span class="case-card__stat-label">${global.i18n ? global.i18n.t('cases.labels.quantity') : 'Qty'}</span>
        <span class="case-card__stat-value">${formatNumber(c.quantity)}</span>
      </div>
      <div class="case-card__stat">
        <span class="case-card__stat-label">${global.i18n ? global.i18n.t('cases.labels.leadTime') : 'Lead'}</span>
        <span class="case-card__stat-value">${c.leadTime}d</span>
      </div>
    </div>
  </div>
</a>`).join('');

      document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: getLang() } }));
    } catch (e) {
      console.warn('Failed to load cases.json', e);
    }
  }

  function renderCertWall() {
    const container = document.querySelector('[data-cert-wall]');
    if (!container || !global.GF_DATA) return;

    container.innerHTML = global.GF_DATA.certifications.slice(0, 8).map(c => `
<div class="cert-item">
  <div class="cert-item__label">${c.label}</div>
  <div class="cert-item__desc">${pickLocalized(c)}</div>
</div>`).join('');
  }

  function renderCapIcons() {
    document.querySelectorAll('[data-cap-grid] [data-svg]').forEach(el => {
      const key = el.getAttribute('data-svg');
      if (ICONS_CAP[key]) el.innerHTML = ICONS_CAP[key];
    });
  }

  async function renderProducts() {
    const container = document.querySelector('[data-product-grid]');
    if (!container) return;

    try {
      const res = await fetch('assets/data/products.json');
      const data = await res.json();

      container.innerHTML = data.products.map(p => {
        const colorLabel = pickLocalized(p.color);
        return `
<a class="product-card" href="contact.html?product=${encodeURIComponent(p.code)}">
  <div class="product-card__media">
    <img src="assets/images/products/${p.image}" alt="${pickLocalized(p.name)}" loading="lazy" class="product-card__img">
    <div class="product-card__media-overlay"></div>
    <span class="product-card__code mono">${p.code}</span>
  </div>
  <div class="product-card__body">
    <h3 class="product-card__name">${pickLocalized(p.name)}</h3>
    <div class="product-card__meta">
      <span class="product-card__meta-item">
        <span class="product-card__meta-label" data-i18n="products.card.color">Color</span>
        <span class="product-card__meta-value">${colorLabel}</span>
      </span>
      <span class="product-card__meta-item">
        <span class="product-card__meta-label" data-i18n="products.card.size">Size</span>
        <span class="product-card__meta-value mono">${p.size}</span>
      </span>
    </div>
    <div class="product-card__row">
      <div>
        <span class="product-card__meta-label" data-i18n="products.card.fabric">Fabric</span>
        <span class="product-card__meta-value">${p.fabric}</span>
      </div>
    </div>
    <div class="product-card__stats">
      <div class="product-card__stat">
        <span class="product-card__meta-label" data-i18n="products.card.moq">MOQ</span>
        <span class="product-card__stat-value mono">${p.moq}</span>
      </div>
      <div class="product-card__stat">
        <span class="product-card__meta-label" data-i18n="products.card.leadTime">Sample</span>
        <span class="product-card__stat-value mono">${p.leadTime}d</span>
      </div>
      <a href="contact.html?product=${encodeURIComponent(p.code)}" class="product-card__cta" data-i18n="products.card.inquire">Inquire</a>
    </div>
  </div>
</a>`;
      }).join('');

      // Re-apply i18n
      document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: getLang() } }));
    } catch (e) {
      console.warn('Failed to load products.json', e);
    }
  }

  // ===========================================================
  // Boot
  // ===========================================================
  let initialized = false;
  async function init() {
    if (initialized) return;
    initialized = true;

    // 等待数据
    if (!global.GF_DATA) {
      await new Promise(resolve => {
        document.addEventListener('gf:data-ready', resolve, { once: true });
        // 兜底：2s 后强制
        setTimeout(resolve, 2000);
      });
    }

    if (global.GF_DATA) {
      renderFeaturedFactories();
      renderCertWall();
      renderCapIcons();
    }
    await renderFeaturedCases();
    await renderProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
