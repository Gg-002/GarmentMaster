/* ===================================================================
 * factory-detail.js — 工厂详情页单模板渲染
 * 解析 ?id=fz-XXX，从 factories.json 取数据，渲染所有区块
 * =================================================================== */

(function (global) {
  'use strict';

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

  function t(key) {
    return global.i18n ? global.i18n.t(key) : key;
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function formatNum(n) {
    return Number(n).toLocaleString('en-US');
  }

  function renderHero(f) {
    const idEl = document.querySelector('[data-fd-id]');
    const nameEl = document.querySelector('[data-fd-name]');
    const locEl = document.querySelector('[data-fd-loc]');
    const introEl = document.querySelector('[data-fd-intro]');
    const intro2El = document.querySelector('[data-fd-intro2]');
    const heroEl = document.querySelector('.fd-hero');
    if (idEl) idEl.textContent = `// ${f.id.toUpperCase()}`;
    if (nameEl) nameEl.textContent = pickLocalized(f.name);
    if (locEl) {
      locEl.innerHTML = `<span>${pickLocalized(f.city)}</span> · <span>${f.established}</span> · <span>${formatNum(f.factoryArea)} m²</span>`;
    }
    if (introEl) introEl.textContent = pickLocalized(f.intro);
    if (intro2El) intro2El.textContent = pickLocalized(f.intro);

    // Inject image gallery into fd-hero (after .container, before .fd-hero__back at the end)
    if (heroEl && f.images && f.images.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'fd-hero__gallery';
      gallery.innerHTML = f.images.map((img, i) => `
<img src="assets/images/factories/${img}" alt="${pickLocalized(f.name)} - Photo ${i+1}" loading="lazy" class="fd-hero__gallery-img">`).join('');
      // Insert as the first child of hero (background)
      heroEl.insertBefore(gallery, heroEl.firstChild);
    }

    // Update title
    document.title = `${pickLocalized(f.name)} — FOSHAN GarmentMaster`;
  }

  function renderStats(f) {
    const container = document.querySelector('[data-fd-stats]');
    if (!container) return;

    const stats = [
      { label: t('factoryDetail.stats.established'),     value: f.established },
      { label: t('factoryDetail.stats.factoryArea'),     value: formatNum(f.factoryArea), unit: 'm²' },
      { label: t('factoryDetail.stats.employees'),       value: formatNum(f.employees) },
      { label: t('factoryDetail.stats.monthlyCapacity'), value: (f.monthlyCapacity / 10000).toFixed(0), unit: '万件' },
      { label: t('factoryDetail.stats.moq'),             value: formatNum(f.moq), unit: 'pcs' },
      { label: t('factoryDetail.stats.leadTime'),        value: f.leadTimeDays, unit: 'd' }
    ];

    container.innerHTML = stats.map(s => `
<div class="fd-stat">
  <span class="fd-stat__label">${s.label}</span>
  <span class="fd-stat__value mono">
    ${s.value}${s.unit ? `<span class="fd-stat__unit">${s.unit}</span>` : ''}
  </span>
</div>`).join('');
  }

  function renderSpecialties(f) {
    const container = document.querySelector('[data-fd-specialties]');
    if (!container) return;
    const specs = f.specialties;
    const items = pickLocalized(specs);
    container.innerHTML = items.map(s => `<span class="tag tag--accent">${s}</span>`).join('');
  }

  function renderEquipment(f) {
    const tbody = document.querySelector('[data-fd-equipment] tbody');
    if (!tbody) return;
    const eq = f.equipment || {};
    const labels = {
      sewingMachines: t('factoryDetail.equipmentLabels.sewingMachines'),
      cuttingLines: t('factoryDetail.equipmentLabels.cuttingLines'),
      embroideryMachines: t('factoryDetail.equipmentLabels.embroideryMachines'),
      printingLines: t('factoryDetail.equipmentLabels.printingLines'),
      washingMachines: 'Washing Machines',
      fillingMachines: 'Filling Machines',
      weldingMachines: 'Welding Machines',
      seamlessKnitting: 'Seamless Knitting',
      sublimationPrinters: 'Sublimation Printers',
      handcraftLines: 'Handcraft Lines',
      knittingMachines: 'Knitting Machines'
    };

    const rows = Object.keys(eq).map(k => `
<tr>
  <td>${labels[k] || k}</td>
  <td>${formatNum(eq[k])}</td>
</tr>`).join('');

    tbody.innerHTML = rows;
  }

  function renderCerts(f) {
    const container = document.querySelector('[data-fd-certs]');
    if (!container || !global.GF_DATA) return;
    container.innerHTML = f.certifications.map(cId => {
      const def = global.GF_DATA.certifications.find(x => x.id === cId);
      if (!def) return '';
      return `
<div class="cert-item">
  <div class="cert-item__label">${def.label}</div>
  <div class="cert-item__desc">${pickLocalized(def)}</div>
</div>`;
    }).join('');
  }

  function renderCases(f) {
    const container = document.querySelector('[data-fd-cases]');
    if (!container) return;
    container.innerHTML = f.cases.map(c => `
<div class="case-mini">
  <div class="case-mini__brand">${c.brand}</div>
  <div class="case-mini__country mono">${c.country}</div>
  <div class="case-mini__product">${c.product}</div>
  <div class="case-mini__qty mono">${formatNum(c.quantity)} pcs</div>
  <div class="case-mini__year mono">${c.year}</div>
</div>`).join('');
  }

  function renderContact(f) {
    const container = document.querySelector('[data-fd-contact]');
    if (!container) return;
    const c = f.contact || {};
    const items = [
      { label: 'Manager',    value: c.manager || '—' },
      { label: 'Phone',      value: c.phone ? `<a href="tel:${c.phone}">${c.phone}</a>` : '—' },
      { label: 'Email',      value: c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : '—' },
      { label: 'WhatsApp',   value: c.whatsapp ? `<a href="https://wa.me/${c.whatsapp.replace(/[^\d]/g, '')}" target="_blank" rel="noopener">+${c.whatsapp.replace(/[^\d]/g, '')}</a>` : '—' }
    ];

    container.innerHTML = items.map(i => `
<div class="contact-info">
  <div class="contact-info__label">${i.label}</div>
  <div class="contact-info__value">${i.value}</div>
</div>`).join('');
  }

  function renderNotFound() {
    document.querySelector('[data-fd-name]').textContent = t('factoryDetail.notFound');
    document.querySelector('[data-fd-intro]').textContent = '';
  }

  // ===========================================================
  // Init
  // ===========================================================
  async function init() {
    if (!global.GF_DATA) {
      await new Promise(resolve => {
        document.addEventListener('gf:data-ready', resolve, { once: true });
        setTimeout(resolve, 2000);
      });
    }

    const id = getQueryParam('id');
    if (!id || !global.GF_DATA) {
      renderNotFound();
      return;
    }
    const f = global.GF_DATA.factories.find(x => x.id === id);
    if (!f) {
      renderNotFound();
      return;
    }

    renderHero(f);
    renderStats(f);
    renderSpecialties(f);
    renderEquipment(f);
    renderCerts(f);
    renderCases(f);
    renderContact(f);

    // Share button
    const shareBtn = document.querySelector('[data-fd-share]');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: pickLocalized(f.name),
            text: pickLocalized(f.intro).slice(0, 120),
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(window.location.href);
          if (global.GF && global.GF.toast) {
            global.GF.toast('Link copied!');
          }
        }
      });
    }

    // Update inquire link with factory id
    const inquireBtn = document.querySelector('[data-fd-inquire]');
    if (inquireBtn) {
      inquireBtn.href = `contact.html?factory=${encodeURIComponent(id)}`;
    }

    // Re-apply i18n
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: getLang() } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
