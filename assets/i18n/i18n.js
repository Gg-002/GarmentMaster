/* ===================================================================
 * i18n.js — FOSHAN GarmentMaster 多语言核心
 * --------------------------------------------------------------------
 * - 支持 6 种语言: zh-CN / en / es / ru / ar / fr
 * - 阿拉伯语 (ar) 自动切换为 RTL
 * - 通过 data-i18n="key.path" 属性标记需翻译的 DOM
 * - 通过 data-i18n-attr="attr:key.path" 翻译属性
 * - 通过 data-i18n-html="key.path" 翻译 innerHTML
 * - 翻译回退: 当前语言 → en → 原始内容
 * - 持久化到 localStorage
 * - 暴露 window.i18n.t(key), setLanguage(), getLanguage()
 * =================================================================== */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'garmentforge.lang';
  const RTL_LANGS = ['ar', 'he', 'fa', 'ur'];
  const SUPPORTED = ['zh-CN', 'en', 'es', 'ru', 'ar', 'fr'];
  const FALLBACK = 'en';
  const DEFAULT = 'zh-CN';

  // 语言显示名（用于切换器）
  const LANG_META = {
    'zh-CN': { name: '简体中文',  code: 'CN', flag: '🇨🇳' },
    'en':    { name: 'English',   code: 'EN', flag: '🇬🇧' },
    'es':    { name: 'Español',   code: 'ES', flag: '🇪🇸' },
    'ru':    { name: 'Русский',   code: 'RU', flag: '🇷🇺' },
    'ar':    { name: 'العربية',   code: 'AR', flag: '🇸🇦' },
    'fr':    { name: 'Français',  code: 'FR', flag: '🇫🇷' }
  };

  // 当前语言
  let currentLang = DEFAULT;

  // 已加载字典 { lang: dict }
  const dictionaries = {};

  // 翻译缓存
  const tCache = new Map();

  // 待翻译节点（MutationObserver 处理动态内容）
  let pendingObserver = null;

  /**
   * 路径解析: "a.b.c" -> {a:{b:{c:"v"}}}
   */
  function lookup(dict, path) {
    if (!dict || !path) return undefined;
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  /**
   * 加载单个语言字典
   */
  async function loadLanguage(lang) {
    if (dictionaries[lang]) return dictionaries[lang];
    try {
      const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`Failed to load ${lang}: ${res.status}`);
      const dict = await res.json();
      dictionaries[lang] = dict;
      return dict;
    } catch (err) {
      console.warn(`[i18n] load ${lang} failed:`, err);
      if (lang !== FALLBACK) {
        return loadLanguage(FALLBACK);
      }
      return {};
    }
  }

  /**
   * 预加载核心语言（避免切换时白屏）
   */
  async function preload() {
    // 至少加载默认 + 回退 + 当前
    const toLoad = new Set([DEFAULT, FALLBACK, currentLang]);
    await Promise.all([...toLoad].map(loadLanguage));
  }

  /**
   * 翻译函数 t(key, params?)
   * - 支持 {var} 插值
   * - 多语言回退: 当前 → en → key 本身
   */
  function t(key, params) {
    if (!key) return '';

    // 缓存
    const cacheKey = `${currentLang}::${key}`;
    if (tCache.has(cacheKey)) {
      return interpolate(tCache.get(cacheKey), params);
    }

    const dict = dictionaries[currentLang] || {};
    let val = lookup(dict, key);

    // 回退到英文
    if (val === undefined && currentLang !== FALLBACK) {
      const enDict = dictionaries[FALLBACK] || {};
      val = lookup(enDict, key);
    }

    if (val === undefined) {
      console.warn(`[i18n] missing key: ${key}`);
      return key;
    }

    tCache.set(cacheKey, val);
    return interpolate(val, params);
  }

  /**
   * 简单插值: "Hello {name}" + {name:"World"} -> "Hello World"
   */
  function interpolate(str, params) {
    if (!params || typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => {
      return params[k] !== undefined ? params[k] : `{${k}}`;
    });
  }

  /**
   * 应用翻译到 DOM
   */
  function applyToDOM() {
    const root = document.documentElement;

    // 切换 lang 与 dir
    root.lang = currentLang;
    root.dir = RTL_LANGS.includes(currentLang.split('-')[0]) ? 'rtl' : 'ltr';

    // 翻译所有标记节点
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== undefined && val !== null) {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val !== undefined && val !== null) {
        el.innerHTML = val;
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      // 格式: "attr1:key1;attr2:key2"
      spec.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s && s.trim());
        if (attr && key) {
          const val = t(key);
          if (val !== undefined && val !== null) {
            el.setAttribute(attr, val);
          }
        }
      });
    });

    // 触发自定义事件
    document.dispatchEvent(new CustomEvent('i18n:applied', {
      detail: { lang: currentLang }
    }));
  }

  /**
   * 切换语言
   */
  async function setLanguage(lang, opts = {}) {
    if (!SUPPORTED.includes(lang)) {
      console.warn(`[i18n] unsupported language: ${lang}`);
      return;
    }
    if (lang === currentLang && !opts.force) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    await loadLanguage(lang);
    tCache.clear();
    applyToDOM();

    // 更新 URL 哈希（用于 SEO/分享）
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (lang === DEFAULT) {
        url.hash = url.hash.replace(/^#lang=\w+/, '');
      } else {
        url.hash = `#lang=${lang}`;
      }
      try {
        window.history.replaceState({}, '', url);
      } catch (e) { /* ignore */ }
    }

    // 更新语言切换器 UI
    updateSwitcherUI();

    // 更新 <title> 与 meta description（如有 data-i18n-meta 属性）
    document.querySelectorAll('[data-i18n-meta]').forEach(el => {
      const type = el.getAttribute('data-i18n-meta');
      const key = el.getAttribute('data-i18n');
      if (type === 'title' && key) {
        document.title = t(key);
      } else if (type === 'description' && key) {
        el.setAttribute('content', t(key));
      }
    });
  }

  /**
   * 更新语言切换器 UI
   */
  function updateSwitcherUI() {
    const switchers = document.querySelectorAll('[data-lang-switcher]');
    switchers.forEach(sw => {
      const current = sw.querySelector('[data-lang-current]');
      if (current) {
        const meta = LANG_META[currentLang];
        current.textContent = meta.flag + ' ' + meta.name;
      }

      // 高亮当前语言
      sw.querySelectorAll('[data-lang-option]').forEach(opt => {
        const optLang = opt.getAttribute('data-lang-option');
        opt.classList.toggle('is-active', optLang === currentLang);
        opt.setAttribute('aria-current', optLang === currentLang ? 'true' : 'false');
      });
    });
  }

  /**
   * 初始化（DOM Ready 后）
   */
  async function init() {
    // 1. 确定初始语言：URL hash > localStorage > 浏览器语言 > 默认
    const hashMatch = window.location.hash.match(/lang=([\w-]+)/);
    if (hashMatch && SUPPORTED.includes(hashMatch[1])) {
      currentLang = hashMatch[1];
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) {
        currentLang = saved;
      } else {
        const browserLang = (navigator.language || '').toLowerCase();
        const match = SUPPORTED.find(l => browserLang.startsWith(l.toLowerCase().split('-')[0]));
        if (match) currentLang = match;
      }
    }

    // 2. 预加载并应用
    await preload();
    tCache.clear();
    applyToDOM();

    // 3. 绑定语言切换器事件
    document.addEventListener('click', e => {
      const target = e.target.closest('[data-lang-option]');
      if (target) {
        e.preventDefault();
        const lang = target.getAttribute('data-lang-option');
        setLanguage(lang);
        // 关闭下拉
        const sw = target.closest('[data-lang-switcher]');
        if (sw) sw.classList.remove('is-open');
      }
      // 切换下拉展开
      const swBtn = e.target.closest('[data-lang-toggle]');
      if (swBtn) {
        const sw = swBtn.closest('[data-lang-switcher]');
        if (sw) {
          e.preventDefault();
          sw.classList.toggle('is-open');
        }
      }
    });

    // 点击外部关闭
    document.addEventListener('click', e => {
      if (!e.target.closest('[data-lang-switcher]')) {
        document.querySelectorAll('[data-lang-switcher].is-open').forEach(sw => {
          sw.classList.remove('is-open');
        });
      }
    });

    // 4. 处理动态内容（factories 渲染、详情页等）
    setupMutationObserver();
  }

  function setupMutationObserver() {
    if (pendingObserver) pendingObserver.disconnect();

    pendingObserver = new MutationObserver(muts => {
      let shouldApply = false;
      for (const m of muts) {
        if (m.addedNodes.length) {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) {
              if (n.hasAttribute && (n.hasAttribute('data-i18n') || n.hasAttribute('data-i18n-html') || n.hasAttribute('data-i18n-attr'))) {
                shouldApply = true;
              } else if (n.querySelectorAll) {
                if (n.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]').length) {
                  shouldApply = true;
                }
              }
            }
          });
        }
      }
      if (shouldApply) applyToDOM();
    });

    pendingObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 暴露 API
  global.i18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    getLanguages: () => SUPPORTED.map(code => ({ code, ...LANG_META[code] })),
    getMeta: () => LANG_META[currentLang],
    init,
    isRTL: () => RTL_LANGS.includes(currentLang.split('-')[0])
  };

  // DOM Ready 时自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
