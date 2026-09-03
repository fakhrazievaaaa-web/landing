// ==========================================================
// ДАРЬЯ ШУГАРЬЯ × ПАРТНЁР — рендер контента, партнёр, трекинг
// ==========================================================

(function () {

  // ---------- Безопасное получение параметров партнёра из URL ----------
  // Значения вставляются только через textContent — HTML/JS-инъекции невозможны.
  function getPartnerInfo() {
    const params = new URLSearchParams(window.location.search);
    let partnerId = params.get('partner_id') || params.get('partner') || '';
    let partnerName = params.get('partner_name') || params.get('partner') || '';
    const clean = (s) => (s || '').toString().slice(0, 80).replace(/[<>]/g, '').trim();
    return { partnerId: clean(partnerId), partnerName: clean(partnerName) };
  }

  function persistAttribution() {
    const params = new URLSearchParams(window.location.search);
    const { partnerId } = getPartnerInfo();
    try {
      if (partnerId) sessionStorage.setItem('partner_id', partnerId);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
        const val = params.get(key);
        if (val) sessionStorage.setItem(key, val.slice(0, 100));
      });
    } catch (e) { /* sessionStorage недоступен — не критично */ }
  }

  function getStoredPartnerId() {
    try { return sessionStorage.getItem('partner_id') || ''; } catch (e) { return ''; }
  }

  // TODO: подключить GTM/аналитику, чтобы события booking_click доходили до отчётов.
  function trackBookingClick(offerId, location) {
    const partnerId = getStoredPartnerId();
    const eventData = {
      event: 'booking_click',
      partner_id: partnerId || null,
      offer: offerId || 'general',
      button_location: location || 'unknown'
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
    console.log('[tracking] booking_click', eventData);
  }

  function buildBookingUrl(baseUrl) {
    try {
      const url = new URL(baseUrl);
      const partnerId = getStoredPartnerId();
      if (partnerId) url.searchParams.set('utm_content', partnerId);
      const params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
        const val = params.get(key) || (function () {
          try { return sessionStorage.getItem(key); } catch (e) { return null; }
        })();
        if (val) url.searchParams.set(key, val);
      });
      return url.toString();
    } catch (e) { return baseUrl; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const d = SITE_DATA;
    const { partnerName } = getPartnerInfo();
    persistAttribution();

    const hasPartner = !!partnerName;
    const bookingUrl = buildBookingUrl(d.booking.yclientsUrl);

    // ---------- Партнёрские тексты (textContent — безопасно от XSS) ----------
    document.getElementById('partner-pill').textContent = hasPartner
      ? `Для клиентов ${partnerName}`
      : 'Специальное предложение';

    document.getElementById('hero-partner-name').textContent = hasPartner ? partnerName : 'нашего партнёра';

    document.getElementById('exclusive-pill').textContent = hasPartner
      ? `Эксклюзивно для клиентов ${partnerName}`
      : 'Эксклюзивно для наших партнёров';

    document.getElementById('offers-note').textContent =
      `Предложение действует для новых гостей студии по рекомендации ${hasPartner ? partnerName : 'нашего партнёра'}. Подробности уточняйте у администратора.`;

    // ---------- Кнопки записи (общие CTA) ----------
    document.querySelectorAll('a[data-offer]').forEach(el => {
      el.href = bookingUrl;
      el.addEventListener('click', () => trackBookingClick(el.dataset.offer, el.dataset.location));
    });

    // ---------- "Связаться" в hero — ведёт в Telegram ----------
    document.getElementById('hero-contact').href = d.contacts.telegramHref;

    // ---------- Офферы ----------
    const offersGrid = document.getElementById('offers-grid');
    offersGrid.innerHTML = d.offers.map(o => `
      <div class="offer-card">
        <span class="offer-tag">${o.tag}</span>
        <div class="offer-title">${o.title}</div>
        <div class="offer-price">${o.price}</div>
        <div class="offer-gift"><span class="offer-gift-icon">🎁</span><span>${o.gift}</span></div>
        <a class="btn btn-pink" href="${bookingUrl}" target="_blank" rel="noopener" data-offer="${o.offerId}" data-location="offers">Записаться</a>
      </div>
    `).join('');
    offersGrid.querySelectorAll('a[data-offer]').forEach(el => {
      el.addEventListener('click', () => trackBookingClick(el.dataset.offer, el.dataset.location));
    });

    // ---------- Преимущества ----------
    const icons = { leaf: '🌿', shield: '🛡', sparkle: '✨', heart: '♡' };
    document.getElementById('advantages-grid').innerHTML = d.advantages.map(a => `
      <div>
        <div class="advantage-icon">${icons[a.icon] || '•'}</div>
        <div class="advantage-title">${a.title}</div>
        <div class="advantage-text">${a.text}</div>
      </div>
    `).join('');

    // ---------- Локация ----------
    document.getElementById('loc-metro').textContent = d.contacts.metro;
    document.getElementById('loc-metro-walk').textContent = d.contacts.metroWalk;
    document.getElementById('loc-address').textContent = d.contacts.address;
    document.getElementById('loc-hours').textContent = d.contacts.hours;
    document.getElementById('loc-route').href = d.contacts.mapUrl;
    document.getElementById('map-iframe').src = d.contacts.mapEmbedUrl;

    document.getElementById('top-metro').textContent = d.contacts.metro;
    document.getElementById('top-metro-walk').textContent = d.contacts.metroWalk;
    document.getElementById('top-phone').textContent = d.contacts.phone;

    // ---------- Отзывы ----------
    document.getElementById('reviews-grid').innerHTML = d.trust.reviews.map(r => `
      <div class="review-card">
        <div class="review-quote-icon">“</div>
        <div class="review-text">${r.text}</div>
        <div class="review-stars">★★★★★</div>
        <div class="review-author">${r.author}</div>
      </div>
    `).join('');

    // ---------- Футер ----------
    document.getElementById('link-max').href = d.contacts.maxHref;
    document.getElementById('link-tg').href = d.contacts.telegramHref;
    document.getElementById('link-wa').href = d.contacts.whatsappHref;
    document.getElementById('link-call').href = d.contacts.phoneHref;
    document.getElementById('year').textContent = new Date().getFullYear();

    // ---------- Sticky CTA: появляется после начала скролла ----------
    const stickyNav = document.getElementById('sticky-nav');
    let ticking = false;
    function updateStickyVisibility() {
      stickyNav.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateStickyVisibility); ticking = true; }
    }, { passive: true });
    updateStickyVisibility();
  });

})();
