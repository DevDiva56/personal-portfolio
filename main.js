'use strict';

/* ── EmailJS Configuration ────────────────────────────────── */
const EMAILJS_SERVICE_ID  = 'service_asr8vz6';
const EMAILJS_TEMPLATE_ID = 'template_sg9y54x';
const EMAILJS_PUBLIC_KEY  = 'd3UEPbd3e4yA9Yw1C';

/* ── 1. CUSTOM CURSOR ─────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let rx = 0, ry = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth lagging ring via lerp
  (function lerp() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();


/* ── 2. COUNT-UP ANIMATION ────────────────────────────────── */
(function initCountUp() {
  const elements = document.querySelectorAll('.count-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const DURATION = 1800;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / DURATION, 1);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  elements.forEach(el => observer.observe(el));
})();


/* ── 3. SCROLL REVEAL ─────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  elements.forEach(el => observer.observe(el));
})();


/* ── 4. SKILL BAR ANIMATION ───────────────────────────────── */
(function initSkillBars() {
  const containers = document.querySelectorAll('.skills-visual-layout');
  if (!containers.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.classList.add('animate');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  containers.forEach(el => observer.observe(el));
})();


/* ── 5. SECURITY UTILITIES ────────────────────────────────── */

/**
 * sanitize()
 * Strips all HTML tags and dangerous characters from user input.
 * Prevents XSS injection in form data.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * isValidEmail()
 * RFC 5322-inspired email validation (simplified but robust).
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email);
}


/* ── 6. SECURE CONTACT FORM ───────────────────────────────── */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  // Rate limiting: prevent rapid resubmissions
  let lastSubmitTime = 0;
  const RATE_LIMIT_MS = 10000; // 10 seconds

  /**
   * showError()
   * Toggles visibility of inline error messages.
   * @param {string} id - Error element ID
   * @param {boolean} show
   */
  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('visible', show);
  }

  /**
   * validateForm()
   * Client-side validation with inline error feedback.
   * @returns {boolean}
   */
  function validateForm(name, email, subject, message) {
    let isValid = true;

    if (name.length < 2 || name.length > 100) {
      showError('fnameErr', true); isValid = false;
    } else { showError('fnameErr', false); }

    if (!isValidEmail(email)) {
      showError('femailErr', true); isValid = false;
    } else { showError('femailErr', false); }

    if (subject.length < 2 || subject.length > 150) {
      showError('fsubjectErr', true); isValid = false;
    } else { showError('fsubjectErr', false); }

    if (message.length < 10 || message.length > 2000) {
      showError('fmessageErr', true); isValid = false;
    } else { showError('fmessageErr', false); }

    return isValid;
  }

  // Form submission handler
  form.addEventListener('submit', e => {
    e.preventDefault();

    // ── Honeypot check (bot detection) ──────────────
    // Real users never see or fill this field.
    // Bots that auto-fill all fields will trigger this.
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value !== '') {
      // Silently reject — do not alert the bot
      return;
    }

    // ── Rate limiting ────────────────────────────────
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      return;
    }

    // ── Sanitize all inputs before use ───────────────
    const name    = sanitize(document.getElementById('fname').value);
    const email   = sanitize(document.getElementById('femail').value);
    const subject = sanitize(document.getElementById('fsubject').value);
    const message = sanitize(document.getElementById('fmessage').value);

    // ── Validate ─────────────────────────────────────
    if (!validateForm(name, email, subject, message)) return;

    // ── Submit via EmailJS ───────────────────────────
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    lastSubmitTime = now;

    // Build the template parameters — these must match
    // the variable names in your EmailJS template exactly:
    // {{from_name}}, {{from_email}}, {{subject}}, {{message}}
    const templateParams = {
      from_name:  name,
      from_email: email,
      subject:    subject,
      message:    message
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        // ✅ Success — email delivered to inbox
        form.reset();
        submitBtn.style.display = 'none';
        successMsg.classList.add('visible');
      })
      .catch(err => {
        // ❌ Failed — re-enable button so user can retry
        console.error('EmailJS error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message →';
        lastSubmitTime = 0; // reset rate limit so they can retry immediately

        // Show a friendly error without exposing technical details
        const errDiv = document.getElementById('formSuccess');
        if (errDiv) {
          errDiv.textContent = '⚠ Something went wrong. Please try again or email directly.';
          errDiv.style.borderColor = '#ff6b6b';
          errDiv.style.color = '#ff6b6b';
          errDiv.style.background = 'rgba(255,107,107,0.08)';
          errDiv.classList.add('visible');
        }
      });
  });

  // Clear errors on input
  ['fname', 'femail', 'fsubject', 'fmessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => showError(id + 'Err', false));
  });
})();
