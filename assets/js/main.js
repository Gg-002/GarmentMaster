/* ===================================================================
 * main.js — FOSHAN GarmentMaster 站点入口
 * --------------------------------------------------------------------
 * 职责:
 * - 注入共享 Header / Footer
 * - 滚动效果 (header 状态、reveal 动画)
 * - 移动端导航
 * - 全局工具函数
 * =================================================================== */

(function (global) {
  'use strict';

  // ===========================================================
  // Brand & Contact Configuration
  // ===========================================================
  const BRAND = {
    name: 'FOSHAN GarmentMaster',
    nameZh: '佛山衣主',
    domain: 'foshan-garmentmaster.com',
    email: 'info@foshan-garmentmaster.com',
    phone: '+86-757-8888-0000',
    whatsapp: '8613800000000',
    wechat: 'foshangarmentmaster',
    skype: 'foshan.garmentmaster',
    address: 'Chancheng District, Foshan, Guangdong, China',
    addressZh: '中国广东省佛山市禅城区'
  };

  // ===========================================================
  // Header HTML (injected into [data-site-header])
  // ===========================================================
  function headerHTML() {
    return `
<header class="site-header" data-site-header>
  <div class="container">
    <nav class="nav" aria-label="Primary">
      <a href="index.html" class="nav__logo" aria-label="FOSHAN GarmentMaster Home">
        <span class="nav__logo-mark">FG</span>
        <span class="nav__logo-text">FOSHAN GarmentMaster<span class="nav__logo-text--dim">.cn</span></span>
      </a>
      <ul class="nav__menu" data-nav-menu>
        <li><a class="nav__link" data-nav-link="home"     href="index.html"          data-i18n="nav.home">Home</a></li>
        <li><a class="nav__link" data-nav-link="factories" href="factories.html"     data-i18n="nav.factories">Factories</a></li>
        <li><a class="nav__link" data-nav-link="products"  href="products.html"      data-i18n="nav.products">Products</a></li>
        <li><a class="nav__link" data-nav-link="services"  href="services.html"      data-i18n="nav.services">Services</a></li>
        <li><a class="nav__link" data-nav-link="cases"     href="cases.html"         data-i18n="nav.cases">Cases</a></li>
        <li><a class="nav__link" data-nav-link="about"     href="about.html"         data-i18n="nav.about">About</a></li>
        <li><a class="nav__link" data-nav-link="contact"   href="contact.html"       data-i18n="nav.contact">Contact</a></li>
      </ul>
      <div class="nav__actions">
        ${languageSwitcherHTML()}
        <a href="contact.html" class="nav__cta nav__cta--desktop" data-i18n="common.inquireNow">Inquire Now</a>
        <button class="nav__toggle" data-nav-toggle aria-label="Toggle menu">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
      </div>
    </nav>
  </div>
</header>`;
  }

  // ===========================================================
  // Language Switcher
  // ===========================================================
  function languageSwitcherHTML() {
    const langs = (global.i18n ? global.i18n.getLanguages() : [{ code: 'en', name: 'English', flag: '🇬🇧' }]);
    const current = (global.i18n ? global.i18n.getLanguage() : 'en');
    const cur = langs.find(l => l.code === current) || langs[0];
    return `
<div class="lang-switcher" data-lang-switcher>
  <button class="lang-switcher__btn" data-lang-toggle aria-haspopup="true" aria-expanded="false">
    <span data-lang-current>${cur.flag} ${cur.name}</span>
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
  <div class="lang-switcher__menu" role="menu">
    ${langs.map(l => `
      <button class="lang-switcher__option${l.code === current ? ' is-active' : ''}" data-lang-option="${l.code}" role="menuitem">
        <span>${l.flag} ${l.name}</span>
        <span class="lang-switcher__option-code">${l.code.toUpperCase()}</span>
      </button>
    `).join('')}
  </div>
</div>`;
  }

  // ===========================================================
  // Footer HTML
  // ===========================================================
  function footerHTML() {
    const year = new Date().getFullYear();
    return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-brand__logo">
          <span class="nav__logo-mark">FG</span>
          <span>FOSHAN GarmentMaster</span>
        </div>
        <p class="footer-brand__desc" data-i18n="footer.brandDesc">
          China's premier apparel manufacturing hub. 200+ audited factories serving global brands from sample to shipment.
        </p>
        <div class="footer-socials">
          <a href="#" aria-label="LinkedIn" data-svg="linkedin"></a>
          <a href="#" aria-label="Instagram" data-svg="instagram"></a>
          <a href="#" aria-label="YouTube" data-svg="youtube"></a>
          <a href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp" data-svg="whatsapp"></a>
        </div>
      </div>

      <div class="footer-col">
        <div class="footer-col__title" data-i18n="footer.quickLinks">Quick Links</div>
        <ul>
          <li><a href="factories.html" data-i18n="nav.factories">Factories</a></li>
          <li><a href="products.html" data-i18n="nav.products">Products</a></li>
          <li><a href="services.html" data-i18n="nav.services">Services</a></li>
          <li><a href="cases.html" data-i18n="nav.cases">Case Studies</a></li>
          <li><a href="about.html" data-i18n="nav.about">About</a></li>
          <li><a href="contact.html" data-i18n="nav.contact">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col__title" data-i18n="footer.services">Services</div>
        <ul>
          <li><a href="services.html#oem">OEM Manufacturing</a></li>
          <li><a href="services.html#odm">ODM Design</a></li>
          <li><a href="services.html#cmt">CMT Processing</a></li>
          <li><a href="services.html#logistics">Logistics Integration</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col__title" data-i18n="footer.contactTitle">Get in Touch</div>
        <ul>
          <li><a href="mailto:${BRAND.email}">${BRAND.email}</a></li>
          <li><a href="tel:${BRAND.phone}">${BRAND.phone}</a></li>
          <li><a href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener">WhatsApp: +${BRAND.whatsapp}</a></li>
          <li><span data-i18n="footer.wechat">WeChat</span>: ${BRAND.wechat}</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div>© ${year} FOSHAN GarmentMaster. <span data-i18n="footer.copyright">All rights reserved.</span></div>
      <div><span data-i18n="footer.icp">ICP No. 00000000</span></div>
    </div>
  </div>
</footer>`;
  }

  // ===========================================================
  // Floating Contact Button
  // ===========================================================
  function contactFabHTML() {
    return `
<div class="contact-fab" data-contact-fab>
  <button class="contact-fab__trigger" data-contact-fab-toggle aria-label="Contact us">
    <span class="contact-fab__icon" data-svg="chat"></span>
    <span class="contact-fab__pulse"></span>
  </button>
  <div class="contact-fab__panel" data-contact-fab-panel>
    <div class="contact-fab__panel-head">
      <div class="contact-fab__panel-title" data-i18n="contact.channels.title">Other Contact Channels</div>
      <button class="contact-fab__close" data-contact-fab-close aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>
    <div class="contact-fab__panel-body">
      <a class="contact-fab__item contact-fab__item--wa" href="https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent('Hello FOSHAN GarmentMaster, I am interested in your apparel manufacturing services.')}" target="_blank" rel="noopener">
        <span class="contact-fab__item-icon" data-svg="whatsapp"></span>
        <span class="contact-fab__item-text">
          <strong data-i18n="contact.channels.whatsapp">WhatsApp Business</strong>
          <small>+${BRAND.whatsapp}</small>
        </span>
        <span class="contact-fab__item-arrow">→</span>
      </a>
      <a class="contact-fab__item" href="mailto:${BRAND.email}">
        <span class="contact-fab__item-icon" data-svg="mail"></span>
        <span class="contact-fab__item-text">
          <strong data-i18n="contact.channels.email">Business Email</strong>
          <small>${BRAND.email}</small>
        </span>
        <span class="contact-fab__item-arrow">→</span>
      </a>
      <a class="contact-fab__item" href="tel:${BRAND.phone}">
        <span class="contact-fab__item-icon" data-svg="phone"></span>
        <span class="contact-fab__item-text">
          <strong data-i18n="contact.channels.phone">Phone Line</strong>
          <small>${BRAND.phone}</small>
        </span>
        <span class="contact-fab__item-arrow">→</span>
      </a>
      <div class="contact-fab__qr">
        <div class="contact-fab__qr-img">
          <span class="contact-fab__qr-placeholder" data-i18n="contact.channels.wechatHint">Scan QR to add WeChat</span>
        </div>
        <div class="contact-fab__qr-label" data-i18n="contact.channels.wechat">WeChat</div>
      </div>
    </div>
  </div>
</div>`;
  }

  // ===========================================================
  // Inline SVG icon library
  // ===========================================================
  const ICONS = {
    chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    whatsapp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.523 5.273l-.999 3.648 3.865-.62zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>',
    mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 7H13M8 2L13 7L8 12"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  function injectIcons(root = document) {
    root.querySelectorAll('[data-svg]').forEach(el => {
      const key = el.getAttribute('data-svg');
      if (ICONS[key]) el.innerHTML = ICONS[key];
    });
  }

  // ===========================================================
  // Header behavior (scroll, mobile menu, active link)
  // ===========================================================
  function bindHeader() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    // Sticky shadow on scroll
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    const toggle = header.querySelector('[data-nav-toggle]');
    const menu = header.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
      // Close on link click (mobile)
      menu.querySelectorAll('.nav__link').forEach(a => {
        a.addEventListener('click', () => {
          if (window.innerWidth < 992) {
            menu.classList.remove('is-open');
            document.body.style.overflow = '';
          }
        });
      });
    }

    // Active link by data-nav-link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const linkKey = ({
      'index.html': 'home',
      'factories.html': 'factories',
      'products.html': 'products',
      'services.html': 'services',
      'cases.html': 'cases',
      'about.html': 'about',
      'contact.html': 'contact'
    })[path] || 'home';
    header.querySelectorAll(`[data-nav-link]`).forEach(l => {
      if (l.getAttribute('data-nav-link') === linkKey) l.classList.add('is-active');
    });
  }

  // ===========================================================
  // Reveal on scroll
  // ===========================================================
  function bindReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(e => io.observe(e));
  }

  // ===========================================================
  // Contact FAB behavior
  // ===========================================================
  function bindContactFab() {
    const fab = document.querySelector('[data-contact-fab]');
    if (!fab) return;
    const trigger = fab.querySelector('[data-contact-fab-toggle]');
    const panel = fab.querySelector('[data-contact-fab-panel]');
    const close = fab.querySelector('[data-contact-fab-close]');

    const open = () => {
      fab.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const closePanel = () => {
      fab.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
      fab.classList.contains('is-open') ? closePanel() : open();
    });
    close.addEventListener('click', closePanel);
    document.addEventListener('click', e => {
      if (!fab.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });

    // Hide when at bottom of contact page (avoid overlap)
    if (document.body.dataset.page === 'contact') {
      window.addEventListener('scroll', () => {
        const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        fab.classList.toggle('is-hidden', atBottom);
      }, { passive: true });
    }
  }

  // ===========================================================
  // Toast helper
  // ===========================================================
  function toast(msg, type = 'info') {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.classList.remove('toast--error');
    if (type === 'error') el.classList.add('toast--error');
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add('is-shown'));
    clearTimeout(el._tid);
    el._tid = setTimeout(() => el.classList.remove('is-shown'), 3500);
  }

  // ===========================================================
  // Global data loader (factories.json → window.GF_DATA)
  // ===========================================================
  async function loadGlobalData() {
    if (global.GF_DATA) return global.GF_DATA;
    try {
      const res = await fetch('assets/data/factories.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      global.GF_DATA = await res.json();
      return global.GF_DATA;
    } catch (err) {
      console.warn('[main] load factories.json failed', err);
      global.GF_DATA = { factories: [], categories: [], regions: [], certifications: [] };
      return global.GF_DATA;
    }
  }

  // ===========================================================
  // Mount: inject header/footer/fab
  // ===========================================================
  async function mount() {
    // 先加载数据
    await loadGlobalData();

    const headerSlot = document.querySelector('[data-site-header-slot]');
    if (headerSlot) {
      headerSlot.outerHTML = headerHTML();
    }
    const footerSlot = document.querySelector('[data-site-footer-slot]');
    if (footerSlot) {
      footerSlot.outerHTML = footerHTML();
    }
    const fabSlot = document.querySelector('[data-site-fab-slot]');
    if (fabSlot) {
      fabSlot.outerHTML = contactFabHTML();
    } else {
      // 默认挂到 body 末尾
      const wrap = document.createElement('div');
      wrap.innerHTML = contactFabHTML();
      document.body.appendChild(wrap.firstElementChild);
    }

    // 注入图标
    injectIcons();

    // 绑定交互
    bindHeader();
    bindReveal();
    bindContactFab();

    // 触发 i18n 重新应用（注入的 HTML 也需要翻译）
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: global.i18n ? global.i18n.getLanguage() : 'zh-CN' }}));

    // 通知页面级脚本数据已就绪
    document.dispatchEvent(new CustomEvent('gf:data-ready', { detail: { data: global.GF_DATA }}));
  }

  // ===========================================================
  // Boot
  // ===========================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Expose utilities
  global.GF = {
    BRAND,
    toast,
    injectIcons
  };

})(window);
