/* ============================================================
   KompozitPro — Main JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   NAVBAR: scroll effect + mobile menu
   ============================================================ */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
  let menuOpen = false;

  if (!navbar) return;

  // Scroll → glassmorphism
  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      menuOpen = !menuOpen;
      if (menuOpen) {
        mobileNav.classList.add('open');
        hamburger.querySelector('span:nth-child(1)').style.transform = 'translateY(7px) rotate(45deg)';
        hamburger.querySelector('span:nth-child(2)').style.opacity = '0';
        hamburger.querySelector('span:nth-child(3)').style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        mobileNav.classList.remove('open');
        hamburger.querySelector('span:nth-child(1)').style.transform = '';
        hamburger.querySelector('span:nth-child(2)').style.opacity = '';
        hamburger.querySelector('span:nth-child(3)').style.transform = '';
      }
    });

    // Close on link click
    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        menuOpen = false;
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (menuOpen && !navbar.contains(e.target) && !mobileNav.contains(e.target)) {
        menuOpen = false;
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // Active link highlighting
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ============================================================
   SCROLL ANIMATIONS — IntersectionObserver
   ============================================================ */
(function initScrollAnimations() {
  var animatedEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!animatedEls.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 1800;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutQuart(progress);
      var current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString('tr-TR') + suffix;
      if (progress < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
(function initCarousel() {
  var track = document.querySelector('.testimonials-track');
  if (!track) return;

  var cards = track.querySelectorAll('.testimonial-card');
  var dots  = document.querySelectorAll('.carousel-dot');
  var btnPrev = document.querySelector('.carousel-btn-prev');
  var btnNext = document.querySelector('.carousel-btn-next');
  var current = 0;
  var autoInterval = null;

  function getVisible() {
    var w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  function goto(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    var cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
  }

  if (btnPrev) btnPrev.addEventListener('click', function () { goto(current - 1); resetAuto(); });
  if (btnNext) btnNext.addEventListener('click', function () { goto(current + 1); resetAuto(); });
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goto(i); resetAuto(); });
  });

  function resetAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(function () {
      goto(current >= maxIndex() ? 0 : current + 1);
    }, 5000);
  }
  resetAuto();

  window.addEventListener('resize', function () { goto(Math.min(current, maxIndex())); });

  // Touch swipe
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goto(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });
})();

/* ============================================================
   PRODUCT FILTER (Products page)
   ============================================================ */
(function initFilter() {
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.product-card[data-category]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.getAttribute('data-filter');

      // Update active tab
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      // Filter cards with animation
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = 'filterIn 0.35s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Inject filterIn keyframe
  var styleEl = document.createElement('style');
  styleEl.textContent = '@keyframes filterIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }';
  document.head.appendChild(styleEl);
})();

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  function showError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    var err   = document.getElementById(fieldId + 'Error');
    if (field) field.classList.add('error');
    if (err)   { err.textContent = msg; err.classList.add('visible'); }
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var err   = document.getElementById(fieldId + 'Error');
    if (field) field.classList.remove('error');
    if (err)   err.classList.remove('visible');
  }

  // Real-time clearing
  form.querySelectorAll('.form-control').forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(input.id);
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidPhone(phone) {
    return /^[\+\d\s\(\)\-]{7,20}$/.test(phone);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = true;

    var adSoyad = document.getElementById('adSoyad');
    var firma   = document.getElementById('firma');
    var email   = document.getElementById('email');
    var telefon = document.getElementById('telefon');
    var urun    = document.getElementById('urun');
    var mesaj   = document.getElementById('mesaj');

    ['adSoyad','firma','email','telefon','urun','mesaj'].forEach(clearError);

    if (!adSoyad.value.trim() || adSoyad.value.trim().length < 3) {
      showError('adSoyad', 'Lütfen adınızı ve soyadınızı girin (en az 3 karakter).');
      isValid = false;
    }
    if (!firma.value.trim()) {
      showError('firma', 'Firma adını girin.');
      isValid = false;
    }
    if (!email.value.trim() || !isValidEmail(email.value.trim())) {
      showError('email', 'Geçerli bir e-posta adresi girin.');
      isValid = false;
    }
    if (telefon.value.trim() && !isValidPhone(telefon.value.trim())) {
      showError('telefon', 'Geçerli bir telefon numarası girin.');
      isValid = false;
    }
    if (!urun.value) {
      showError('urun', 'Lütfen ilgilendiğiniz ürünü seçin.');
      isValid = false;
    }
    if (!mesaj.value.trim() || mesaj.value.trim().length < 20) {
      showError('mesaj', 'Mesajınız en az 20 karakter olmalıdır.');
      isValid = false;
    }

    if (!isValid) return;

    // Simulate submission
    var submitBtn = form.querySelector('[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor...';

    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      var successEl = document.getElementById('formSuccess');
      if (successEl) {
        successEl.classList.add('visible');
        setTimeout(function () { successEl.classList.remove('visible'); }, 6000);
      }
    }, 1500);
  });
})();

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var offset = 80; // nav height
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   PRELOADER
   ============================================================ */
(function initPreloader() {
  var preloader = document.querySelector('.preloader');
  if (!preloader) return;

  function hide() {
    preloader.classList.add('hidden');
    setTimeout(function () { preloader.remove(); }, 600);
  }

  if (document.readyState === 'complete') {
    setTimeout(hide, 800);
  } else {
    window.addEventListener('load', function () { setTimeout(hide, 600); });
  }
})();

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   KVKK / COOKIE CONSENT BANNER
   ============================================================ */
(function initCookieBanner() {
  var banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  var STORAGE_KEY = 'kp_cookie_consent';

  if (localStorage.getItem(STORAGE_KEY)) return;

  setTimeout(function () { banner.classList.add('visible'); }, 1800);

  var btnAccept = banner.querySelector('.cookie-btn-accept');
  var btnReject = banner.querySelector('.cookie-btn-reject');

  function dismiss(accepted) {
    localStorage.setItem(STORAGE_KEY, accepted ? 'accepted' : 'rejected');
    banner.classList.remove('visible');
    setTimeout(function () { banner.style.display = 'none'; }, 500);
    if (accepted) showToast('✓', 'Tercihleriniz kaydedildi. Teşekkürler!', 'success');
  }

  if (btnAccept) btnAccept.addEventListener('click', function () { dismiss(true); });
  if (btnReject) btnReject.addEventListener('click', function () { dismiss(false); });
})();

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(icon, msg, type) {
  var container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.innerHTML =
    '<span class="toast-icon">' + icon + '</span>' +
    '<span class="toast-msg">' + msg + '</span>';
  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('leaving');
    setTimeout(function () { toast.remove(); }, 350);
  }, 4000);
}

/* ============================================================
   PRODUCT SEARCH MODAL
   ============================================================ */
(function initSearch() {
  var overlay  = document.querySelector('.search-overlay');
  var input    = document.querySelector('.search-input');
  var results  = document.querySelector('.search-results');
  var closeBtn = document.querySelector('.search-close');
  var triggerBtns = document.querySelectorAll('.navbar-search-btn, [data-search-open]');

  if (!overlay) return;

  var products = [
    { name: 'Genel Amaçlı Polyester Reçine',     cat: 'Polyester Reçineler',  icon: '🧪', href: 'urunler.html' },
    { name: 'Izopothalik Polyester Reçine',       cat: 'Polyester Reçineler',  icon: '🧪', href: 'urunler.html' },
    { name: 'Vinilester Reçine',                  cat: 'Polyester Reçineler',  icon: '🧪', href: 'urunler.html' },
    { name: 'Cam Elyaf Doku (Woven Roving)',       cat: 'Cam Elyaflar',         icon: '🕸️', href: 'urunler.html' },
    { name: 'Cam Elyaf Mat (Chopped Strand Mat)',  cat: 'Cam Elyaflar',         icon: '🕸️', href: 'urunler.html' },
    { name: 'Cam Elyaf Kumaş (E-Glass Fabric)',   cat: 'Cam Elyaflar',         icon: '🕸️', href: 'urunler.html' },
    { name: 'Standart Epoksi Reçine',             cat: 'Epoksi Sistemler',     icon: '⚗️', href: 'urunler.html' },
    { name: 'Epoksi İnfüzyon Sistemi',            cat: 'Epoksi Sistemler',     icon: '⚗️', href: 'urunler.html' },
    { name: 'Epoksi Yapıştırıcı Pasta',           cat: 'Epoksi Sistemler',     icon: '⚗️', href: 'urunler.html' },
    { name: 'Beyaz Jelkot',                       cat: 'Jelkot & Topkot',      icon: '🎨', href: 'urunler.html' },
    { name: 'Renkli Jelkot (RAL)',                cat: 'Jelkot & Topkot',      icon: '🎨', href: 'urunler.html' },
    { name: 'Topkot (Finishing Coat)',            cat: 'Jelkot & Topkot',      icon: '🎨', href: 'urunler.html' },
    { name: 'MEKP Sertleştirici',                 cat: 'Sertleştiriciler',     icon: '🔬', href: 'urunler.html' },
    { name: 'Epoksi Amin Sertleştirici',          cat: 'Sertleştiriciler',     icon: '🔬', href: 'urunler.html' },
    { name: 'Kalıp Ayırma Macunu',                cat: 'Yardımcı Malzemeler',  icon: '🛠️', href: 'urunler.html' },
    { name: 'Stiren Monomer',                     cat: 'Yardımcı Malzemeler',  icon: '🛠️', href: 'urunler.html' },
  ];

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { input && input.focus(); }, 100);
    renderResults('');
  }

  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    renderResults('');
  }

  function renderResults(query) {
    if (!results) return;
    var q = query.toLowerCase().trim();

    if (!q) {
      results.innerHTML = '';
      return;
    }

    var filtered = products.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
             p.cat.toLowerCase().indexOf(q) !== -1;
    });

    if (!filtered.length) {
      results.innerHTML = '<div class="search-empty">🔍 "<strong>' + query + '</strong>" için sonuç bulunamadı. <br><a href="iletisim.html" style="color:var(--color-accent-blue);">Teknik ekibimize sorun →</a></div>';
      return;
    }

    results.innerHTML = filtered.map(function (p) {
      return '<a href="' + p.href + '" class="search-result-item">' +
        '<div class="search-result-icon">' + p.icon + '</div>' +
        '<div><div class="search-result-name">' + p.name + '</div>' +
        '<div class="search-result-cat">' + p.cat + '</div></div>' +
        '<span class="search-result-arrow">→</span>' +
        '</a>';
    }).join('');
  }

  triggerBtns.forEach(function (btn) {
    btn.addEventListener('click', openSearch);
  });
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSearch();
  });

  if (input) {
    input.addEventListener('input', function () { renderResults(input.value); });
  }

  // Hint tags
  document.querySelectorAll('.search-hint-tag').forEach(function (tag) {
    tag.addEventListener('click', function () {
      if (input) { input.value = tag.textContent; renderResults(tag.textContent); input.focus(); }
    });
  });

  // Keyboard shortcut Ctrl+K / Cmd+K
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });
})();

/* ============================================================
   ENQUIRY BAR (Products page — shows after scrolling)
   ============================================================ */
(function initEnquiryBar() {
  var bar = document.querySelector('.enquiry-bar');
  if (!bar) return;

  var shown = false;
  window.addEventListener('scroll', function () {
    var shouldShow = window.scrollY > 600;
    if (shouldShow !== shown) {
      shown = shouldShow;
      bar.classList.toggle('visible', shown);
    }
  }, { passive: true });
})();
