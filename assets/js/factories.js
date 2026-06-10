/* ===================================================================
 * factories.js — 工厂列表 + 筛选 + 排序 + URL hash 同步
 * =================================================================== */

(function (global) {
  'use strict';

  const FILTER_DEFS = {
    categories: {
      type: 'checkbox',
      values: null // 动态从 data.categories
    },
    moq: {
      type: 'radio',
      values: [
        { id: '0-300',    min: 0,    max: 300,   label: '< 300' },
        { id: '300-1000', min: 300,  max: 1000,  label: '300 - 1,000' },
        { id: '1000-5000',min: 1000, max: 5000,  label: '1,000 - 5,000' },
        { id: '5000+',    min: 5000, max: 99999, label: '> 5,000' }
      ]
    },
    capacity: {
      type: 'radio',
      values: [
        { id: '0-100000',    min: 0,      max: 100000,  label: '< 10 万' },
        { id: '100000-200000', min: 100000, max: 200000, label: '10 - 20 万' },
        { id: '200000-300000', min: 200000, max: 300000, label: '20 - 30 万' },
        { id: '300000+',     min: 300000, max: 9999999, label: '> 30 万' }
      ]
    },
    certifications: {
      type: 'checkbox',
      values: null
    }
  };

  // Active filter state
  const state = {
    categories: new Set(),
    moq: null,
    capacity: null,
    certifications: new Set(),
    sort: 'capacity:desc'
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

  function t(key) {
    return global.i18n ? global.i18n.t(key) : key;
  }

  function formatNum(n) {
    return Number(n).toLocaleString('en-US');
  }

  // ===========================================================
  // Build filter UI
  // ===========================================================
  function buildFilterUI() {
    if (!global.GF_DATA) return;

    // categories
    FILTER_DEFS.categories.values = global.GF_DATA.categories;
    FILTER_DEFS.certifications.values = global.GF_DATA.certifications;

    Object.keys(FILTER_DEFS).forEach(key => {
      const def = FILTER_DEFS[key];
      const containers = document.querySelectorAll(`[data-filter-group="${key}"]`);
      if (!containers.length) return;

      const html = def.values.map(v => {
        const id = v.id;
        const label = def.type === 'checkbox' ? pickLocalized(v) : v.label;
        const inputId = `f-${key}-${id}`;
        return `
<label class="checkbox" for="${inputId}">
  <input type="${def.type}" id="${inputId}" name="${key}" data-filter-input="${key}" data-filter-value="${id}">
  <span>${label}</span>
  <span class="checkbox__count" data-filter-count="${key}:${id}"></span>
</label>`;
      }).join('');

      containers.forEach(c => c.innerHTML = html);
    });
  }

  // ===========================================================
  // Render factory cards
  // ===========================================================
  function renderCard(f) {
    const cats = f.categories.map(c => {
      const def = global.GF_DATA.categories.find(x => x.id === c);
      return def ? pickLocalized(def) : c;
    });
    const city = pickLocalized(f.city);
    const certs = f.certifications.map(c => {
      const def = global.GF_DATA.certifications.find(x => x.id === c);
      return def ? def.label : c;
    });
    const hasImage = f.images && f.images.length > 0;
    const mediaHTML = hasImage
      ? `<img src="assets/images/factories/${f.images[0]}" alt="${pickLocalized(f.name)}" loading="lazy" class="f-card__media-img">
         <div class="f-card__media-overlay"></div>
         <span class="f-card__media-num">// ${f.id.toUpperCase()}</span>
         <span class="f-card__media-label">${city.toUpperCase()} · ${cats[0] || ''}</span>`
      : `<span class="f-card__media-num">// ${f.id.toUpperCase()}</span>
         <span class="f-card__media-label">${city.toUpperCase()} · ${cats[0] || ''}</span>`;

    return `
<a class="f-card" href="factory-detail.html?id=${f.id}">
  <div class="f-card__media">
    ${mediaHTML}
  </div>
  <div class="f-card__body">
    <div class="f-card__head">
      <div>
        <div class="f-card__title">${pickLocalized(f.name)}</div>
        <div class="f-card__region">${city} · ${f.established}</div>
      </div>
    </div>
    <div class="f-card__specialties">
      ${cats.slice(0, 3).map(c => `<span class="tag">${c}</span>`).join('')}
    </div>
    <div class="f-card__stats">
      <div class="f-card__stat">
        <span class="f-card__stat-label">${t('factories.card.capacity')}</span>
        <span class="f-card__stat-value">${(f.monthlyCapacity / 10000).toFixed(0)} 万件</span>
      </div>
      <div class="f-card__stat">
        <span class="f-card__stat-label">${t('factories.card.moq')}</span>
        <span class="f-card__stat-value">${f.moq}</span>
      </div>
      <div class="f-card__stat">
        <span class="f-card__stat-label">${t('factories.card.leadTime')}</span>
        <span class="f-card__stat-value">${f.leadTimeDays}d</span>
      </div>
      <div class="f-card__stat">
        <span class="f-card__stat-label">Cert.</span>
        <span class="f-card__stat-value">${certs[0] || '—'}</span>
      </div>
    </div>
    <div class="f-card__cta">
      <span>${t('factories.card.viewDetail')}</span>
      <span class="f-card__cta-arrow">→</span>
    </div>
  </div>
</a>`;
  }

  // ===========================================================
  // Apply filters
  // ===========================================================
  function applyFilters(list) {
    return list.filter(f => {
      // categories: 命中任一即通过 (OR within)
      if (state.categories.size) {
        if (!f.categories.some(c => state.categories.has(c))) return false;
      }
      // moq
      if (state.moq) {
        const def = FILTER_DEFS.moq.values.find(v => v.id === state.moq);
        if (def && (f.moq < def.min || f.moq > def.max)) return false;
      }
      // capacity
      if (state.capacity) {
        const def = FILTER_DEFS.capacity.values.find(v => v.id === state.capacity);
        if (def && (f.monthlyCapacity < def.min || f.monthlyCapacity > def.max)) return false;
      }
      // certifications: 命中任一
      if (state.certifications.size) {
        if (!f.certifications.some(c => state.certifications.has(c))) return false;
      }
      return true;
    });
  }

  function applySort(list) {
    const [field, order] = state.sort.split(':');
    const sign = order === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      let av, bv;
      if (field === 'name') {
        av = pickLocalized(a.name);
        bv = pickLocalized(b.name);
        return av.localeCompare(bv) * sign;
      }
      av = a[field];
      bv = b[field];
      if (typeof av === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv)) * sign;
    });
  }

  function render() {
    const grid = document.querySelector('[data-factory-grid]');
    const empty = document.querySelector('[data-factory-empty]');
    const numEl = document.querySelector('[data-result-num]');
    if (!grid || !global.GF_DATA) return;

    const filtered = applyFilters(global.GF_DATA.factories);
    const sorted = applySort(filtered);

    if (sorted.length === 0) {
      grid.innerHTML = '';
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = sorted.map(renderCard).join('');
    }

    numEl.textContent = sorted.length;
    updateFilterCounts();
    syncToHash();
  }

  function updateFilterCounts() {
    if (!global.GF_DATA) return;
    // For each filter, calculate counts that would appear if we applied
    // all OTHER filters (but not itself) to help users see impact
    const filterKey = ['categories', 'moq', 'capacity', 'certifications'];

    filterKey.forEach(key => {
      const def = FILTER_DEFS[key];
      if (!def || !def.values) return;
      def.values.forEach(v => {
        const el = document.querySelector(`[data-filter-count="${key}:${v.id}"]`);
        if (!el) return;

        // 临时把该值放进去计算
        const original = (key === 'moq' || key === 'capacity') ? state[key] : new Set(state[key]);
        if (key === 'moq' || key === 'capacity') {
          state[key] = v.id;
        } else {
          state[key].add(v.id);
        }
        const count = applyFilters(global.GF_DATA.factories).length;
        // 恢复
        if (key === 'moq' || key === 'capacity') {
          state[key] = original;
        } else {
          state[key].delete(v.id);
        }

        el.textContent = count;
      });
    });
  }

  // ===========================================================
  // Filter input bindings
  // ===========================================================
  function bindInputs() {
    document.addEventListener('change', e => {
      const t = e.target;
      if (!t.matches('[data-filter-input]')) return;

      const key = t.getAttribute('data-filter-input');
      const val = t.getAttribute('data-filter-value');
      const def = FILTER_DEFS[key];

      if (def.type === 'radio') {
        // single
        if (t.checked) {
          state[key] = val;
        } else {
          state[key] = null;
        }
      } else {
        // checkbox (Set)
        if (t.checked) {
          state[key].add(val);
        } else {
          state[key].delete(val);
        }
      }
      render();
    });

    // Reset
    document.addEventListener('click', e => {
      if (e.target.closest('[data-filter-reset]') || e.target.closest('[data-filters-reset-mb]')) {
        Object.keys(state).forEach(k => {
          if (state[k] instanceof Set) state[k].clear();
          else if (k !== 'sort') state[k] = null;
        });
        document.querySelectorAll('[data-filter-input]').forEach(i => i.checked = false);
        render();
        // close mobile drawer
        closeMobileDrawer();
      }
      if (e.target.closest('[data-filters-apply-mb]')) {
        closeMobileDrawer();
      }
    });

    // Sort
    document.addEventListener('change', e => {
      const sel = e.target.closest('[data-sort-select]');
      if (sel) {
        state.sort = sel.value;
        render();
      }
    });
  }

  // ===========================================================
  // Mobile filter drawer
  // ===========================================================
  function bindMobileDrawer() {
    const toggle = document.querySelector('[data-filters-toggle]');
    const overlay = document.querySelector('[data-filters-overlay]');
    const drawer = document.querySelector('[data-filters-drawer]');
    const close = document.querySelector('[data-filters-close]');
    const body = document.querySelector('[data-filters-drawer-body]');

    if (!toggle || !drawer) return;

    // Clone sidebar filters into drawer
    const sidebar = document.querySelector('[data-filters-sidebar]');
    if (sidebar && body) {
      body.innerHTML = sidebar.innerHTML;
    }

    const open = () => {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const closeFn = () => {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', open);
    close && close.addEventListener('click', closeFn);
    overlay && overlay.addEventListener('click', closeFn);

    window.closeMobileDrawer = closeFn;
  }

  // ===========================================================
  // URL hash sync
  // ===========================================================
  function readFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const params = new URLSearchParams(hash);
    params.forEach((val, key) => {
      if (key === 'sort') { state.sort = val; return; }
      if (key === 'moq' || key === 'capacity') {
        state[key] = val || null;
      } else {
        val.split(',').filter(Boolean).forEach(v => state[key].add(v));
      }
    });

    // Sync UI
    document.querySelectorAll('[data-filter-input]').forEach(i => {
      const k = i.getAttribute('data-filter-input');
      const v = i.getAttribute('data-filter-value');
      if (k === 'moq' || k === 'capacity') {
        i.checked = state[k] === v;
      } else {
        i.checked = state[k].has(v);
      }
    });
    const sortSel = document.querySelector('[data-sort-select]');
    if (sortSel) sortSel.value = state.sort;
  }

  function syncToHash() {
    if (!history.replaceState) return;
    const params = new URLSearchParams();
    if (state.categories.size) params.set('categories', [...state.categories].join(','));
    if (state.moq) params.set('moq', state.moq);
    if (state.capacity) params.set('capacity', state.capacity);
    if (state.certifications.size) params.set('certifications', [...state.certifications].join(','));
    if (state.sort && state.sort !== 'capacity:desc') params.set('sort', state.sort);

    const newHash = params.toString();
    const newUrl = newHash ? `#${newHash}` : window.location.pathname;
    try {
      history.replaceState(null, '', newUrl);
    } catch (e) { /* ignore */ }
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

    buildFilterUI();
    bindInputs();
    bindMobileDrawer();
    readFromHash();
    render();

    // Inject filter icon
    const filterBtn = document.querySelector('[data-filters-toggle] [data-svg]');
    if (filterBtn) {
      filterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>';
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
