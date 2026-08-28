// ==========================================================
// ДАРЬЯ ШУГАРЬЯ × ПАРТНЁР — editorial-лендинг
// Рендер контента, определение партнёра, трекинг
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

  // ---------- Сохраняем partner_id и UTM-метки на время сессии ----------
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

  // ---------- Трекинг клика по кнопке записи ----------
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

  // ---------- Добавляем метку источника к ссылке записи (best-effort) ----------
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
    const { partnerId, partnerName } = getPartnerInfo();
    persistAttribution();

    const hasPartner = !!partnerName;
    const displayName = hasPartner ? partnerName : 'нашего партнёра';
    const bookingUrl = buildBookingUrl(d.booking.yclientsUrl);

    // ---------- Партнёрские тексты (textContent — безопасно от XSS) ----------
    document.getElementById('partner-name-hero').textContent = hasPartner ? partnerName : 'партнёром';
    document.getElementById('hero-subtitle').textContent =
      `Для клиентов ${displayName} — специальные условия на первое знакомство со студией «Дарья Шугарья» на Таганской.`;
    document.getElementById('bonus-line').textContent = `После визита — ${d.bonus.amount} бонусами на услуги у ${hasPartner ? partnerName : 'партнёра'}.`;
    document.getElementById('bonus-title').textContent = `на следующий визит у ${hasPartner ? partnerName : 'партнёра'}`;
    document.getElementById('bonus-text').textContent = d.bonus.text;
    document.getElementById('bonus-amount').textContent = d.bonus.amount;
    document.getElementById('final-text').textContent = `Выберите удобное время — специальные условия закреплены за клиентами ${displayName}.`;
    document.getElementById('final-note').textContent = `После визита начислим ${d.bonus.amount} бонусами у ${hasPartner ? partnerName : 'партнёра'}.`;

    // ---------- Цепочка бонуса ----------
    const chainEl = document.getElementById('bonus-chain');
    chainEl.innerHTML = '';
    const chainParts = [hasPartner ? partnerName : 'Партнёр', 'Дарья Шугарья', `+${d.bonus.amount} у ${hasPartner ? partnerName : 'партнёра'}`];
    chainParts.forEach((part, i) => {
      const span = document.createElement('span');
      span.textContent = part;
      chainEl.appendChild(span);
      if (i < chainParts.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'chain-arrow';
        arrow.textContent = '→';
        chainEl.appendChild(arrow);
      }
    });

    // ---------- Кнопки записи (общие CTA) ----------
    document.querySelectorAll('a[data-offer]').forEach(el => {
      if (el.id !== 'hero-cta') el.href = bookingUrl; // hero-cta ведёт к прайс-листу на странице
      el.addEventListener('click', () => trackBookingClick(el.dataset.offer, el.dataset.location));
    });

    // ---------- Прайс-лист ----------
    const priceListEl = document.getElementById('price-list');
    const renderGroup = (group) => `
      <div class="price-group">
        <div class="price-group-title">${group.title}</div>
        ${group.items.map(item => `
          <div class="price-row">
            <span class="price-row-label">${item.label}</span>
            <span class="price-row-value">
              <span class="price-row-price">${item.price}</span>
              <a class="price-row-cta" href="${bookingUrl}" target="_blank" rel="noopener" data-offer="${item.offerId}" data-location="price_list">Записаться</a>
            </span>
          </div>
        `).join('')}
      </div>
    `;
    priceListEl.innerHTML = renderGroup(d.priceList.laser) + renderGroup(d.priceList.sugaring);
    priceListEl.querySelectorAll('a[data-offer]').forEach(el => {
      el.addEventListener('click', () => trackBookingClick(el.dataset.offer, el.dataset.location));
    });
    document.getElementById('price-note').textContent = d.priceList.note;

    // ---------- Как это работает ----------
    document.getElementById('steps-list').innerHTML = d.steps.map((s, i) => `
      <div class="step-row">
        <div class="step-number">0${i + 1}</div>
        <div>
          <div class="step-title">${s.title}</div>
          <div class="step-text">${s.text}</div>
        </div>
      </div>
    `).join('');

    // ---------- О студии ----------
    document.getElementById('studio-text').textContent = d.studio.text;
    const statsEl = document.getElementById('studio-stats');
    let statsHtml = '';
    if (d.studio.yearsExperience) {
      statsHtml += `<div class="stat-item"><div class="stat-value">${d.studio.yearsExperience}</div><div class="stat-label">опыта</div></div>`;
    }
    if (d.trust.rating) {
      statsHtml += `<div class="stat-item"><div class="stat-value">${d.trust.rating}</div><div class="stat-label">на Яндекс Картах</div></div>`;
    }
    if (d.studio.minutesFromMetro) {
      statsHtml += `<div class="stat-item"><div class="stat-value">${d.studio.minutesFromMetro}</div><div class="stat-label">от метро</div></div>`;
    }
    statsEl.innerHTML = statsHtml;

    // ---------- Отзывы (editorial quotes) ----------
    const reviewsEl = document.getElementById('reviews-list');
    if (d.trust.reviews && d.trust.reviews.length) {
      reviewsEl.innerHTML = d.trust.reviews.map(r => `
        <div class="review-quote">
          <div class="review-quote-text">«${r.text}»</div>
          <div class="review-quote-meta">
            <span class="review-stars">★★★★★</span>
            <span>${r.author}${d.trust.reviewsCount ? ' · Яндекс Карты' : ''}</span>
          </div>
        </div>
      `).join('');
    } else {
      reviewsEl.innerHTML = `<p class="studio-text">TODO: добавить реальные отзывы гостей.</p>`;
    }

    // ---------- Локация ----------
    document.getElementById('loc-address').textContent = d.contacts.address;
    document.getElementById('loc-metro').textContent = d.contacts.addressShort;
    document.getElementById('loc-hours').textContent = d.contacts.hours;
    document.getElementById('loc-route').href = d.contacts.mapUrl;

    // ---------- Финальные контакты ----------
    const phoneLink = document.getElementById('link-phone');
    phoneLink.textContent = d.contacts.phone;
    phoneLink.href = d.contacts.phoneHref;
    document.getElementById('link-tg').href = d.contacts.telegramHref;
    document.getElementById('link-wa').href = d.contacts.whatsappHref;
    document.getElementById('link-max').href = d.contacts.maxHref;

    // ---------- Год в футере ----------
    document.getElementById('year').textContent = new Date().getFullYear();

    // ---------- Sticky CTA: появляется после начала скролла ----------
    const stickyNav = document.getElementById('sticky-nav');
    let ticking = false;
    function updateStickyVisibility() {
      stickyNav.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateStickyVisibility); ticking = true; }
    }, { passive: true });
    updateStickyVisibility();
  });

})();
