(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    menuToggle?.classList.remove('is-active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    navLinks?.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.classList.toggle('is-active', !isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks?.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 1050) closeMenu(); });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item?.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('is-open');
        faq.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item?.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const pricingSwitch = document.querySelector('.switch');
  const priceValues = document.querySelectorAll('[data-monthly][data-yearly]');
  const billingLabels = document.querySelectorAll('[data-billing-label]');
  pricingSwitch?.addEventListener('click', () => {
    const yearly = pricingSwitch.getAttribute('aria-checked') !== 'true';
    pricingSwitch.setAttribute('aria-checked', String(yearly));
    priceValues.forEach(value => {
      value.textContent = yearly ? value.dataset.yearly : value.dataset.monthly;
    });
    billingLabels.forEach(label => {
      label.textContent = yearly ? '/mois, facturé annuellement' : '/mois';
    });
  });

  document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement?.querySelector('input');
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      button.setAttribute('aria-pressed', String(show));
    });
  });

  const passwordInput = document.querySelector('[data-password-strength]');
  const strengthBars = document.querySelectorAll('.password-strength span');
  if (passwordInput && strengthBars.length) {
    passwordInput.addEventListener('input', () => {
      const value = passwordInput.value;
      let score = 0;
      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
      if (/\d/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      strengthBars.forEach((bar, index) => {
        bar.style.background = index < score
          ? score < 3 ? 'var(--warning)' : 'var(--accent)'
          : 'rgba(255,255,255,0.1)';
      });
    });
  }

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (title, message) => {
    if (!toast) return;
    toast.querySelector('[data-toast-title]').textContent = title;
    toast.querySelector('[data-toast-message]').textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4800);
  };
  toast?.querySelector('button')?.addEventListener('click', () => toast.classList.remove('is-visible'));

  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const type = form.dataset.demoForm;
      const messages = {
        login: ['Connexion simulée', 'Le formulaire est prêt à être relié à votre système d’authentification.'],
        signup: ['Compte prêt à être créé', 'Le formulaire est validé. Il reste à le connecter à votre back-end.'],
        contact: ['Message préparé', 'Le formulaire est validé. Il reste à le relier à votre service de messagerie.']
      };
      const [title, message] = messages[type] || ['Formulaire validé', 'Votre saisie a bien été prise en compte.'];
      showToast(title, message);
      form.querySelector('.form-status')?.classList.add('is-visible');
    });
  });

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
