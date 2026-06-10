/* ===================================================================
 * counter.js — 数字滚动动画
 * --------------------------------------------------------------------
 * - IntersectionObserver 触发
 * - requestAnimationFrame + easeOut
 * - 千分位 + 单位
 * =================================================================== */

(function (global) {
  'use strict';

  const DURATION = 1800; // ms

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatNumber(n, decimals = 0) {
    if (decimals > 0) {
      return n.toFixed(decimals);
    }
    return Math.floor(n).toLocaleString('en-US');
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter-target') || '0');
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';

    if (isNaN(target)) return;

    const start = performance.now();
    const startVal = 0;

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(t);
      const current = startVal + (target - startVal) * eased;

      el.firstChild && (el.firstChild.nodeValue = prefix + formatNumber(current, decimals) + suffix);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // 到位微闪
        el.textContent = prefix + formatNumber(target, decimals) + suffix;
        el.classList.add('is-done');
      }
    }

    requestAnimationFrame(frame);
  }

  function init() {
    const els = document.querySelectorAll('[data-counter-target]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(animateCounter);
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    els.forEach(el => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init after dynamic content added
  document.addEventListener('i18n:applied', () => {
    // 延迟一帧执行，避免重复触发
    requestAnimationFrame(init);
  });

})(window);
