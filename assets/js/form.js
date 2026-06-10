/* ===================================================================
 * form.js — 询盘表单验证 + 提交（Netlify Forms / mailto fallback）
 * =================================================================== */

(function (global) {
  'use strict';

  function t(key) {
    return global.i18n ? global.i18n.t(key) : key;
  }

  function toast(msg, type) {
    if (global.GF && global.GF.toast) {
      global.GF.toast(msg, type);
    } else {
      console.log('[toast]', msg);
    }
  }

  // 邮箱正则
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 国际电话 (允许 +, 数字, 空格, -, ())
  const PHONE_RE = /^[+]?[\d\s\-()]{7,}$/;

  function validateField(field) {
    const value = (field.value || '').trim();
    const required = field.hasAttribute('required');
    const type = field.type;

    field.closest('.form-field')?.classList.remove('is-invalid');

    if (required && !value) {
      field.closest('.form-field')?.classList.add('is-invalid');
      return false;
    }
    if (type === 'email' && value && !EMAIL_RE.test(value)) {
      field.closest('.form-field')?.classList.add('is-invalid');
      return false;
    }
    if (type === 'tel' && value && !PHONE_RE.test(value)) {
      field.closest('.form-field')?.classList.add('is-invalid');
      return false;
    }
    return true;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    let firstInvalid = null;
    let allValid = true;
    fields.forEach(field => {
      if (field.name === 'bot-field') return; // honeypot
      if (field.type === 'hidden') return;
      const ok = validateField(field);
      if (!ok) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  // Netlify Forms submission
  async function submitToNetlify(form) {
    const formData = new FormData(form);
    // Netlify 期望 urlencoded 格式
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (key === 'attachment') continue; // 文件单独处理
      params.append(key, value);
    }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      return res.ok;
    } catch (e) {
      console.warn('Netlify submit failed', e);
      return false;
    }
  }

  // mailto fallback
  function submitViaMailto(form) {
    const data = new FormData(form);
    const subject = encodeURIComponent('[FOSHAN GarmentMaster] ' + (data.get('inquiryType') || 'inquiry') + ' — ' + (data.get('name') || ''));
    const body = [];
    for (const [key, value] of data.entries()) {
      if (key === 'bot-field' || key === 'attachment' || !value) continue;
      body.push(`${key}: ${value}`);
    }
    const mailto = `mailto:hello@garmentforge.com?subject=${subject}&body=${encodeURIComponent(body.join('\n'))}`;
    window.location.href = mailto;
  }

  function showSuccess() {
    const formCard = document.querySelector('[data-form-card]');
    const successCard = document.querySelector('[data-form-success-card]');
    const channelsCard = document.querySelector('[data-channels-card]');
    if (formCard) formCard.hidden = true;
    if (successCard) successCard.hidden = false;
    if (channelsCard) channelsCard.hidden = true;
    // Scroll to top of form area
    const target = successCard || formCard;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function bindForm() {
    const form = document.querySelector('form[name="inquiry"]');
    if (!form) return;

    // 实时清除错误
    form.addEventListener('input', e => {
      if (e.target.matches('input, select, textarea')) {
        e.target.closest('.form-field')?.classList.remove('is-invalid');
      }
    });

    // 提交
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm(form)) {
        toast(t('contact.validation.required') || 'Please fix the errors', 'error');
        return;
      }

      const submitBtn = form.querySelector('[data-form-submit]');
      const status = form.querySelector('[data-form-status]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> <span>${t('contact.form.submitting')}</span>`;
      }
      if (status) status.textContent = t('contact.form.submitting');

      // 优先 Netlify，失败则 mailto
      let success = false;
      if (form.hasAttribute('data-netlify')) {
        success = await submitToNetlify(form);
      }
      if (!success) {
        // fallback: mailto
        submitViaMailto(form);
        success = true; // 假定用户完成了邮件发送
      }

      if (success) {
        if (status) status.textContent = '✓';
        showSuccess();
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>${t('contact.form.submit')}</span> <span class="arrow">→</span>`;
        }
        if (status) status.textContent = '';
        toast('Submission failed, please try again', 'error');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindForm);
  } else {
    bindForm();
  }

})(window);
