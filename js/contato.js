/* ============================================================
   ISABELLY LIMA — PORTFOLIO
   contato.js — Contact form handling (Formspree)
   ============================================================ */

'use strict';

(function () {

  const form      = document.getElementById('contato-form');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText   = btnSubmit && btnSubmit.querySelector('.btn__text');
  const btnSpinner= btnSubmit && btnSubmit.querySelector('.btn__spinner');
  const elSuccess = document.getElementById('form-success');
  const elError   = document.getElementById('form-error');

  if (!form) return;

  /* ── Validation helpers ─────────────────────────────────── */

  const isEn = typeof isEnPage === 'function' && isEnPage();

  const ERRORS = isEn
    ? { required: 'This field is required', email: 'Invalid email' }
    : { required: 'Preencha este campo',    email: 'E-mail inválido' };

  function showFieldError(groupId, erroId, msg) {
    const group = document.getElementById(groupId);
    const erro  = document.getElementById(erroId);
    if (group)  group.classList.add('form-group--error');
    if (erro)   erro.textContent = msg;
  }

  function clearFieldError(groupId, erroId) {
    const group = document.getElementById(groupId);
    const erro  = document.getElementById(erroId);
    if (group)  group.classList.remove('form-group--error');
    if (erro)   erro.textContent = '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let valid = true;

    const nome     = form.nome.value.trim();
    const email    = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();

    // Nome
    if (!nome) {
      showFieldError('group-nome', 'erro-nome', ERRORS.required);
      valid = false;
    } else {
      clearFieldError('group-nome', 'erro-nome');
    }

    // E-mail
    if (!email) {
      showFieldError('group-email', 'erro-email', ERRORS.required);
      valid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('group-email', 'erro-email', ERRORS.email);
      valid = false;
    } else {
      clearFieldError('group-email', 'erro-email');
    }

    // Mensagem
    if (!mensagem) {
      showFieldError('group-mensagem', 'erro-mensagem', ERRORS.required);
      valid = false;
    } else {
      clearFieldError('group-mensagem', 'erro-mensagem');
    }

    return valid;
  }

  /* ── Inline validation on blur ──────────────────────────── */

  form.nome.addEventListener('blur', () => {
    if (!form.nome.value.trim()) {
      showFieldError('group-nome', 'erro-nome', ERRORS.required);
    } else {
      clearFieldError('group-nome', 'erro-nome');
    }
  });

  form.email.addEventListener('blur', () => {
    const v = form.email.value.trim();
    if (!v) {
      showFieldError('group-email', 'erro-email', ERRORS.required);
    } else if (!isValidEmail(v)) {
      showFieldError('group-email', 'erro-email', ERRORS.email);
    } else {
      clearFieldError('group-email', 'erro-email');
    }
  });

  form.mensagem.addEventListener('blur', () => {
    if (!form.mensagem.value.trim()) {
      showFieldError('group-mensagem', 'erro-mensagem', ERRORS.required);
    } else {
      clearFieldError('group-mensagem', 'erro-mensagem');
    }
  });

  /* ── Submit ─────────────────────────────────────────────── */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous feedback
    if (elSuccess) elSuccess.hidden = true;
    if (elError)   elError.hidden   = true;

    if (!validateForm()) {
      // Focus on first invalid field
      const firstInvalid = form.querySelector('.form-group--error input, .form-group--error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Loading state
    setLoading(true);

    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        // Success: hide form, show success message
        form.hidden = true;
        if (elSuccess) {
          elSuccess.hidden = false;
          elSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        throw new Error('server_error');
      }
    } catch (_) {
      // Error: show error message, keep form visible
      if (elError) {
        elError.hidden = false;
        elError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setLoading(false);
    }
  });

  /* ── Loading state helpers ──────────────────────────────── */

  function setLoading(isLoading) {
    if (!btnSubmit) return;
    btnSubmit.disabled = isLoading;
    if (btnText)    btnText.hidden    = isLoading;
    if (btnSpinner) btnSpinner.hidden = !isLoading;
  }

})();
