// ==========================================================
// ДАРЬЯ ШУГАРЬЯ — рендер контента из data.js
// Верстку/стили не трогает — только вставляет данные.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const d = SITE_DATA;

  // ---------- Кнопки записи ----------
  document.querySelectorAll('#hero-book, #c-book, #nav-book').forEach(el => {
    el.href = d.booking.yclientsUrl;
  });

  // ---------- Звонок ----------
  document.querySelectorAll('#nav-call, #c-call').forEach(el => {
    el.href = d.contacts.phoneHref;
  });

  // ---------- Спецпредложения ----------
  const offersList = document.getElementById('offers-list');
  offersList.innerHTML = d.offers.map(o => `
    <div class="offer-card">
      <div class="offer-top">
        <div class="offer-title">${o.title}</div>
        <div class="offer-badge">${o.benefit}</div>
      </div>
      <div class="offer-zones">${o.zones}</div>
      <div class="offer-prices">
        ${o.oldPrice ? `<span class="price-old">${o.oldPrice}</span>` : ''}
        <span class="price-new">${o.newPrice}</span>
      </div>
      <div class="offer-note">${o.note}</div>
      <a class="btn btn-primary" href="${d.booking.yclientsUrl}" target="_blank" rel="noopener">${o.cta || 'Записаться'}</a>
    </div>
  `).join('');

  // ---------- Иконки для преимуществ ----------
  const icons = {
    sparkle: '✨',
    compass: '🧭',
    heart: '♥',
    pin: '📍'
  };

  const advList = document.getElementById('advantages-list');
  advList.innerHTML = d.advantages.map(a => `
    <div class="advantage-item">
      <div class="advantage-icon">${icons[a.icon] || '•'}</div>
      <span class="text">${a.text}</span>
    </div>
  `).join('');

  // ---------- Доверие ----------
  const trustBlock = document.getElementById('trust-block');
  const t = d.trust;
  let trustHtml = '';

  if (t.rating) {
    trustHtml += `
      <div class="trust-rating">
        <span class="stars">★★★★★</span>
        <span>${t.rating} · ${t.reviewsCount || ''}</span>
      </div>`;
  }

  if (t.reviews && t.reviews.length) {
    trustHtml += t.reviews.map(r => `
      <div class="review-card">
        «${r.text}»
        <span class="author">${r.author}</span>
      </div>
    `).join('');
  }

  if (!t.rating && (!t.reviews || !t.reviews.length)) {
    trustHtml += `<div class="trust-placeholder">Здесь скоро появятся реальные отзывы и рейтинг студии.</div>`;
  }

  if (t.photos && t.photos.length) {
    trustHtml += `<div class="photo-strip">${t.photos.map(p => `<img src="${p}" alt="Фото студии">`).join('')}</div>`;
  }

  trustBlock.innerHTML = trustHtml;

  // ---------- Контакты ----------
  document.getElementById('c-address').textContent = d.contacts.address.split('/')[0].trim();
  document.getElementById('c-metro').textContent = d.contacts.addressShort;
  document.getElementById('c-phone').textContent = d.contacts.phone;
  document.getElementById('c-hours').textContent = d.contacts.hours;

  document.getElementById('link-tg').href = d.contacts.telegramHref;
  document.getElementById('link-wa').href = d.contacts.whatsappHref;
  document.getElementById('link-max').href = d.contacts.maxHref;
  document.getElementById('c-route').href = d.contacts.mapUrl;

  // ---------- Год в футере ----------
  document.getElementById('year').textContent = new Date().getFullYear();
});
