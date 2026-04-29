/**
 * auth.js – Login & Signup form logic
 * Maaskom Logistics
 */

(function () {
  'use strict';

  /* ─── Utility helpers ─────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isPhone = (v) => v.trim() === '' || /^[+]?[\d\s\-().]{7,15}$/.test(v.trim());

  function showError(id, msg) {
    const el = $(id);
    if (el) el.textContent = msg;
  }

  function clearError(id) {
    const el = $(id);
    if (el) el.textContent = '';
  }

  function markValid(inputEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
  }

  function markInvalid(inputEl) {
    inputEl.classList.remove('is-valid');
    inputEl.classList.add('is-invalid');
  }

  function clearState(inputEl) {
    inputEl.classList.remove('is-valid', 'is-invalid');
  }

  function setLoading(btn, state) {
    const text = btn.querySelector('.btn-text');
    const spin = btn.querySelector('.btn-spinner');
    if (state) {
      btn.disabled = true;
      text?.classList.add('hidden');
      spin?.classList.remove('hidden');
    } else {
      btn.disabled = false;
      text?.classList.remove('hidden');
      spin?.classList.add('hidden');
    }
  }

  function showFeedback(id, msg, type) {
    const el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `form-feedback ${type}`;
    setTimeout(() => {
      el.className = 'form-feedback hidden';
    }, 5000);
  }

  /* ─── Toggle password visibility ─────────────── */
  function bindTogglePw(btnId, inputId) {
    const btn = $(btnId);
    const inp = $(inputId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const isHidden = inp.type === 'password';
      inp.type = isHidden ? 'text' : 'password';
      btn.querySelector('i').className = isHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  /* ─── Password strength meter ─────────────────── */
  function checkStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    return 'strong';
  }

  function bindStrengthMeter(inputId, barId, labelId) {
    const inp = $(inputId);
    const bar = $(barId);
    const label = $(labelId);
    if (!inp || !bar || !label) return;

    inp.addEventListener('input', () => {
      const val = inp.value;
      if (!val) {
        bar.className = 'pw-bar';
        bar.style.width = '0';
        label.textContent = '';
        label.className = 'pw-strength-label';
        return;
      }
      const strength = checkStrength(val);
      bar.className = `pw-bar ${strength}`;
      const labels = { weak: 'Weak', fair: 'Fair', strong: 'Strong' };
      label.textContent = labels[strength];
      label.className = `pw-strength-label ${strength}`;
    });
  }

  /* ─── LOGIN PAGE ───────────────────────────────── */
  const loginForm = $('loginForm');
  if (loginForm) {
    bindTogglePw('toggleLoginPw', 'loginPassword');

    const emailInp = $('loginEmail');
    const pwInp = $('loginPassword');

    // Live validation
    emailInp?.addEventListener('blur', () => {
      if (!emailInp.value.trim()) {
        showError('loginEmailError', 'Email is required.');
        markInvalid(emailInp);
      } else if (!isEmail(emailInp.value)) {
        showError('loginEmailError', 'Enter a valid email address.');
        markInvalid(emailInp);
      } else {
        clearError('loginEmailError');
        markValid(emailInp);
      }
    });

    pwInp?.addEventListener('blur', () => {
      if (!pwInp.value) {
        showError('loginPasswordError', 'Password is required.');
        markInvalid(pwInp);
      } else {
        clearError('loginPasswordError');
        markValid(pwInp);
      }
    });

    emailInp?.addEventListener('input', () => clearState(emailInp));
    pwInp?.addEventListener('input', () => clearState(pwInp));

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      if (!emailInp.value.trim() || !isEmail(emailInp.value)) {
        showError('loginEmailError', 'Enter a valid email address.');
        markInvalid(emailInp);
        valid = false;
      }
      if (!pwInp.value) {
        showError('loginPasswordError', 'Password is required.');
        markInvalid(pwInp);
        valid = false;
      }

      if (!valid) return;

      const btn = $('loginBtn');
      setLoading(btn, true);

      // Simulate API call (replace with real endpoint)
      await new Promise((r) => setTimeout(r, 1800));

      setLoading(btn, false);

      // Demo: always show success (replace with real auth logic)
      showFeedback('loginFeedback', '✓ Logged in successfully! Redirecting…', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    });

    // Social login stubs
    $('googleLoginBtn')?.addEventListener('click', () => {
      showFeedback('loginFeedback', 'Google login coming soon!', 'error');
    });
    $('linkedinLoginBtn')?.addEventListener('click', () => {
      showFeedback('loginFeedback', 'LinkedIn login coming soon!', 'error');
    });
  }

  /* ─── SIGNUP PAGE ──────────────────────────────── */
  const signupForm = $('signupForm');
  if (signupForm) {
    bindTogglePw('toggleSignupPw', 'signupPassword');
    bindTogglePw('toggleConfirmPw', 'signupConfirm');
    bindStrengthMeter('signupPassword', 'pwBar', 'pwStrengthLabel');

    const fields = {
      firstName: $('signupFirstName'),
      lastName:  $('signupLastName'),
      email:     $('signupEmail'),
      phone:     $('signupPhone'),
      password:  $('signupPassword'),
      confirm:   $('signupConfirm'),
      terms:     $('agreeTerms'),
    };

    // Clear state on input
    Object.values(fields).forEach((f) => {
      if (f && f.type !== 'checkbox') {
        f.addEventListener('input', () => clearState(f));
      }
    });

    // Live blur validation
    fields.firstName?.addEventListener('blur', () => {
      if (!fields.firstName.value.trim()) { showError('firstNameError', 'First name is required.'); markInvalid(fields.firstName); }
      else { clearError('firstNameError'); markValid(fields.firstName); }
    });
    fields.lastName?.addEventListener('blur', () => {
      if (!fields.lastName.value.trim()) { showError('lastNameError', 'Last name is required.'); markInvalid(fields.lastName); }
      else { clearError('lastNameError'); markValid(fields.lastName); }
    });
    fields.email?.addEventListener('blur', () => {
      if (!isEmail(fields.email.value)) { showError('signupEmailError', 'Enter a valid email address.'); markInvalid(fields.email); }
      else { clearError('signupEmailError'); markValid(fields.email); }
    });
    fields.phone?.addEventListener('blur', () => {
      if (!isPhone(fields.phone.value)) { showError('signupPhoneError', 'Enter a valid phone number.'); markInvalid(fields.phone); }
      else { clearError('signupPhoneError'); if (fields.phone.value.trim()) markValid(fields.phone); }
    });
    fields.password?.addEventListener('blur', () => {
      if (fields.password.value.length < 8) { showError('signupPasswordError', 'Password must be at least 8 characters.'); markInvalid(fields.password); }
      else { clearError('signupPasswordError'); markValid(fields.password); }
    });
    fields.confirm?.addEventListener('blur', () => {
      if (fields.confirm.value !== fields.password.value) { showError('signupConfirmError', 'Passwords do not match.'); markInvalid(fields.confirm); }
      else if (!fields.confirm.value) { showError('signupConfirmError', 'Please confirm your password.'); markInvalid(fields.confirm); }
      else { clearError('signupConfirmError'); markValid(fields.confirm); }
    });

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      if (!fields.firstName.value.trim()) { showError('firstNameError', 'First name is required.'); markInvalid(fields.firstName); valid = false; }
      if (!fields.lastName.value.trim())  { showError('lastNameError', 'Last name is required.');  markInvalid(fields.lastName);  valid = false; }
      if (!isEmail(fields.email.value))   { showError('signupEmailError', 'Enter a valid email address.'); markInvalid(fields.email); valid = false; }
      if (!isPhone(fields.phone.value))   { showError('signupPhoneError', 'Enter a valid phone number.'); markInvalid(fields.phone); valid = false; }
      if (fields.password.value.length < 8) { showError('signupPasswordError', 'Password must be at least 8 characters.'); markInvalid(fields.password); valid = false; }
      if (!fields.confirm.value || fields.confirm.value !== fields.password.value) { showError('signupConfirmError', 'Passwords do not match.'); markInvalid(fields.confirm); valid = false; }
      if (!fields.terms.checked) { showError('termsError', 'You must agree to the Terms of Service.'); valid = false; }
      else { clearError('termsError'); }

      if (!valid) return;

      const btn = $('signupBtn');
      setLoading(btn, true);

      // Simulate API call
      await new Promise((r) => setTimeout(r, 2000));

      setLoading(btn, false);

      showFeedback('signupFeedback', '🎉 Account created! Redirecting to login…', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2500);
    });

    // Social signup stubs
    $('googleSignupBtn')?.addEventListener('click', () => {
      showFeedback('signupFeedback', 'Google sign-up coming soon!', 'error');
    });
    $('linkedinSignupBtn')?.addEventListener('click', () => {
      showFeedback('signupFeedback', 'LinkedIn sign-up coming soon!', 'error');
    });
  }

})();
