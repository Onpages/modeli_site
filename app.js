// BUILD 10: книжки — новый дизайн
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// === INTERSECTION OBSERVER ДЛЯ АНИМАЦИЙ ===
const io = new IntersectionObserver(es => {
 es.forEach(e => {
 if (e.isIntersecting) {
 e.target.classList.add('on');
 io.unobserve(e.target);
 }
 });
}, { threshold: .12 });

$$('.reveal').forEach(el => io.observe(el));
$$('nav').forEach(n => n.classList.add('nav'));
document.body.classList.toggle('has-dock', !!$('.stories'));
$$('section > span:first-child, header section > span:first-child').forEach(s => {
 if (!s.className) s.classList.add('kicker');
});

// === СЛАЙДЕР HERO ===
(function(){
 const root = document.getElementById('heroSlider') || document.querySelector('.hero-media');
 if (!root) return;
 let tr = root.querySelector('.hero-slides');
 if (!tr) {
 const im0 = root.querySelectorAll('.hero-slide');
 if (im0.length < 2) return;
 tr = document.createElement('div');
 tr.className = 'hero-slides';
 im0.forEach(im => tr.appendChild(im));
 root.prepend(tr);
 }
 const slides = tr.querySelectorAll('.hero-slide');
 if (slides.length < 2) return;

 let dw = root.querySelector('.hero-dots');
 if (!dw) {
 dw = document.createElement('div');
 dw.className = 'hero-dots';
 root.appendChild(dw);
 }

 let i = 0;
 slides.forEach((_, k) => {
 const b = document.createElement('button');
 b.type = 'button';
 b.setAttribute('aria-label', 'Слайд ' + (k + 1));
 if (k === 0) b.classList.add('on');
 b.addEventListener('click', () => go(k));
 dw.appendChild(b);
 });

 const db = dw.querySelectorAll('button');
 function go(k) {
 i = Math.max(0, Math.min(slides.length - 1, k));
 tr.style.transform = 'translateX(-' + (i * 100) + '%)';
 db.forEach((d, m) => d.classList.toggle('on', m === i));
 }

 // Обработчик клика по имени модели
 slides.forEach(slide => {
 const nameLink = slide.querySelector('.hero-slide-name');
 if (nameLink) {
 nameLink.addEventListener('click', (e) => {
 e.preventDefault();
 const target = slide.getAttribute('data-target');
 if (target) {
 const targetEl = document.querySelector(target);
 if (targetEl) {
 targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }
 }
 });
 }
 });

 let x0 = null, y0 = null, hz = null;
 root.addEventListener('touchstart', e => {
 x0 = e.touches[0].clientX;
 y0 = e.touches[0].clientY;
 hz = null;
 }, { passive: true });

 root.addEventListener('touchmove', e => {
 if (x0 === null) return;
 const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
 if (hz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) hz = Math.abs(dx) > Math.abs(dy);
 if (hz) e.preventDefault();
 }, { passive: false });

 root.addEventListener('touchend', e => {
 if (x0 === null) return;
 const dx = e.changedTouches[0].clientX - x0;
 if (hz && Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
 x0 = null; y0 = null; hz = null;
 }, { passive: true });

 let mx = null, dr = false;
 root.addEventListener('mousedown', e => {
 mx = e.clientX;
 dr = true;
 e.preventDefault();
 });
 window.addEventListener('mouseup', e => {
 if (!dr || mx === null) return;
 const dx = e.clientX - mx;
 if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
 mx = null; dr = false;
 });
 go(0);
})();

// === ТОЧКИ-НАВИГАЦИЯ (СКРОЛЛСПАЙ) ===
(function(){
 // Собираем все целевые блоки: h1, h2 (не внутри .alert-card), .alert-card
 const targets = [];
 const disclaimerH2s = new Set();
 
 // Сначала собираем h2 внутри дисклеймеров
 $$('.alert-card').forEach(card => {
 const h2 = card.querySelector('h2');
 if (h2) {
 disclaimerH2s.add(h2);
 targets.push({ el: card, type: 'disclaimer', label: h2.textContent.trim() });
 }
 });
 
 // h1
 $$('h1').forEach(h => {
 targets.push({ el: h, type: 'heading', label: h.textContent.trim() });
 });
 
 // h2 (исключая те, что внутри .alert-card)
 $$('h2').forEach(h => {
 if (!disclaimerH2s.has(h)) {
 targets.push({ el: h, type: 'heading', label: h.textContent.trim() });
 }
 });
 
 if (!targets.length) return;
 
 // Сортируем по порядку в DOM
 targets.sort((a, b) => {
 const posA = a.el.compareDocumentPosition(b.el);
 return posA & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
 });
 
 // Создаём контейнеры
 const mobileNav = document.createElement('nav');
 mobileNav.className = 'scroll-dots-mobile';
 
 const desktopNav = document.createElement('nav');
 desktopNav.className = 'scroll-dots-desktop';
 
 const desktopList = document.createElement('ul');
 desktopList.className = 'scroll-dots-list';
 desktopNav.appendChild(desktopList);
 
 // Создаём точки и пункты списка
 const buttons = [];
 targets.forEach((target, idx) => {
 // Мобильная точка
 const mobileBtn = document.createElement('button');
 mobileBtn.type = 'button';
 mobileBtn.className = 'scroll-dot' + (target.type === 'disclaimer' ? ' disclaimer' : '');
 mobileBtn.setAttribute('aria-label', target.label);
 mobileBtn.addEventListener('click', () => {
 target.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
 });
 mobileNav.appendChild(mobileBtn);
 
 // Десктопный пункт
 const desktopItem = document.createElement('li');
 const desktopBtn = document.createElement('button');
 desktopBtn.type = 'button';
 desktopBtn.className = 'scroll-dot-desktop' + (target.type === 'disclaimer' ? ' disclaimer' : '');
 desktopBtn.setAttribute('aria-label', target.label);
 
 const labelSpan = document.createElement('span');
 labelSpan.className = 'scroll-dot-label';
 labelSpan.textContent = target.label;
 desktopBtn.appendChild(labelSpan);
 
 desktopBtn.addEventListener('click', () => {
 target.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
 });
 
 desktopItem.appendChild(desktopBtn);
 desktopList.appendChild(desktopItem);
 
 buttons.push({ mobile: mobileBtn, desktop: desktopBtn, target });
 });
 
  document.body.appendChild(mobileNav);
  document.body.appendChild(desktopNav);
  
  // Функция прокрутки десктопного списка
  function scrollDesktopList(activeIdx) {
    const itemHeight = 50; // высота одного пункта
    const containerHeight = 350; // высота контейнера
    const visibleItems = 7; // количество видимых пунктов
    const halfVisible = Math.floor(visibleItems / 2); // 3
    
    // Вычисляем смещение так, чтобы активный пункт был в центре
    let offset = activeIdx - halfVisible;
    
    // Ограничиваем диапазон прокрутки
    const maxOffset = Math.max(0, buttons.length - visibleItems);
    offset = Math.max(0, Math.min(offset, maxOffset));
    
    // Применяем смещение
    desktopList.style.transform = `translateY(-${offset * itemHeight}px)`;
  }
  
  // Скроллспай
  const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
  if (entry.isIntersecting) {
  const idx = targets.findIndex(t => t.el === entry.target);
  if (idx !== -1) {
  buttons.forEach((b, i) => {
  const isActive = i === idx;
  b.mobile.classList.toggle('active', isActive);
  b.desktop.classList.toggle('active', isActive);
  });
  // Прокручиваем десктопный список
  scrollDesktopList(idx);
  }
  }
  });
  }, {
  rootMargin: '-30% 0px -60% 0px',
  threshold: 0
  });
  
  targets.forEach(t => observer.observe(t.el));
  
  // Активируем первую точку
  if (buttons.length) {
  buttons[0].mobile.classList.add('active');
  buttons[0].desktop.classList.add('active');
  scrollDesktopList(0);
  }})();

// === MARQUEE ===
$$('.marquee span').forEach(sp => { sp.innerHTML += sp.innerHTML; });

// === FAQ ACCORDION ===
$$('section').forEach(sec => {
 const l = $$('details', sec);
 if (l.length < 2) return;
 l.forEach(d => {
 d.addEventListener('toggle', () => {
 if (d.open) l.forEach(o => { if (o !== d) o.open = false; });
 });
 });
});

// === LAZY LOADING ===
$$('iframe, video').forEach(el => { el.setAttribute('loading', 'lazy'); });

// === PARALLAX ===
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const hero = document.querySelector('.hero-media'),
 cta = document.querySelector('.final-cta');
 function tick() {
 const y = window.scrollY;
 if (hero && y < window.innerHeight) {
 hero.style.transform = 'translateY(' + (y * 0.05) + 'px)';
 }
 if (cta) {
 const r = cta.getBoundingClientRect();
 const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
 cta.style.setProperty('--shift', ((p - 0.5) * 30) + 'px');
 }
 }
 window.addEventListener('scroll', tick, { passive: true });
 tick();
}

// === STORIES SCROLL ===
document.querySelectorAll('.stories a.story[href^="#"]').forEach(a => {
 a.addEventListener('click', e => {
 const id = a.getAttribute('href').slice(1);
 let target = document.getElementById(id);
 if (!target) {
 const name = ((a.querySelector('b') || {}).textContent || '').trim().toLowerCase();
 if (name) {
 const h = Array.from(document.querySelectorAll('.ig-card h3')).find(x => x.textContent.trim().toLowerCase().indexOf(name) === 0);
 if (h) target = h.closest('.ig-card');
 }
 }
 if (!target) return;
 e.preventDefault();
 const y = target.getBoundingClientRect().top + window.scrollY - 70;
 window.scrollTo({ top: y, behavior: 'smooth' });
 setTimeout(() => {
 target.classList.remove('arrive');
 void target.offsetWidth;
 target.classList.add('arrive');
 }, 500);
 history.replaceState(null, '', '#' + id);
 });
});

// === TELEGRAM LINKS ===
document.querySelectorAll('a[href^="https://t.me"]').forEach(a => {
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener');
});

// === MEDIA MODEL VIDEO TRACKS ===
(function(){
  $$('.model-videos .mv-track').forEach(track => {
    track.addEventListener('click', () => {
      const videoUrl = track.getAttribute('data-video');
      if (!videoUrl) return;
      
      // Создаём модалку для видео
      let modal = document.querySelector('.model-video-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'model-video-modal';
        modal.innerHTML = `
          <div class="model-video-modal-content">
            <button class="model-video-modal-close">
              <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <video controls playsinline>
              <source src="" type="video/mp4">
            </video>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Закрытие модалки
        const closeBtn = modal.querySelector('.model-video-modal-close');
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('open');
          const video = modal.querySelector('video');
          video.pause();
        });
        
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('open');
            const video = modal.querySelector('video');
            video.pause();
          }
        });
      }
      
      // Открываем модалку с видео
      const video = modal.querySelector('video');
      const source = modal.querySelector('source');
      source.src = videoUrl;
      video.load();
      modal.classList.add('open');
      video.play().catch(() => {});
    });
  });
})();
// === MODEL STORIES MODAL ===
(function(){
// Создаём модальное окно
function createModal() {
 const modal = document.createElement('div');
 modal.className = 'model-stories-modal';
 modal.innerHTML = '<button class="msm-close"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="msm-content"><div class="msm-progress"><div class="msm-progress-bar"></div></div><div class="msm-slider"></div><button class="msm-nav msm-prev"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><button class="msm-nav msm-next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button><div class="msm-counter"></div></div>';
 document.body.appendChild(modal);
 return modal;
}

const photoModal = createModal();
const videoModal = createModal();

let currentModal = null;
let items = [];
let idx = 0;
let progressInterval = null;
let videoEl = null;

function openModal(modal, type) {
currentModal = modal;
const slider = $('.msm-slider', modal);
slider.innerHTML = '';
items.forEach((item, i) => {
const track = document.createElement('div');
track.className = 'msm-track' + (i === 0 ? ' active' : '');
if (type === 'photo') {
const img = document.createElement('img');
img.src = item;
img.alt = '';
track.appendChild(img);
} else {
const video = document.createElement('video');
video.src = item;
video.muted = false;
video.playsInline = true;
if (i === 0) video.play().catch(() => {});
videoEl = video;
track.appendChild(video);
}
slider.appendChild(track);
});
updateCounter();
modal.classList.add('open');
document.body.style.overflow = 'hidden';
startProgress();
}

function closeModal() {
if (!currentModal) return;
currentModal.classList.remove('open');
document.body.style.overflow = '';
if (videoEl) {
videoEl.pause();
videoEl = null;
}
stopProgress();
currentModal = null;
items = [];
idx = 0;
}

function next() {
if (idx < items.length - 1) {
idx++;
showItem();
} else {
closeModal();
}
}

function prev() {
if (idx > 0) {
idx--;
showItem();
}
}

function showItem() {
$$('.msm-track', currentModal).forEach((t, i) => {
t.classList.toggle('active', i === idx);
});
if (videoEl) {
videoEl.pause();
const activeTrack = $('.msm-track.active', currentModal);
videoEl = $('video', activeTrack);
if (videoEl) videoEl.play().catch(() => {});
}
updateCounter();
resetProgress();
}

function updateCounter() {
const counter = $('.msm-counter', currentModal);
if (counter) counter.textContent = (idx + 1) + ' / ' + items.length;
}

function startProgress() {
const bar = $('.msm-progress-bar', currentModal);
if (!bar) return;
if (videoEl) {
progressInterval = setInterval(() => {
if (videoEl && videoEl.duration) {
const pct = (videoEl.currentTime / videoEl.duration) * 100;
bar.style.width = pct + '%';
}
}, 100);
} else {
bar.style.width = '100%';
setTimeout(() => {
if (currentModal) next();
}, 3000);
}
}

function resetProgress() {
stopProgress();
const bar = $('.msm-progress-bar', currentModal);
if (bar) bar.style.width = '0%';
startProgress();
}

function stopProgress() {
if (progressInterval) {
clearInterval(progressInterval);
progressInterval = null;
}
}

// Фото моделей для модалки
const modelPhotos = {
 katya: [
 'https://storage.yandexcloud.net/modeli/media/models/kate/kate-1-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/kate/kate-2-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/kate/kate-3-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/kate/kate-4-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/kate/kate-5-compressed.webp'
 ],
 lizz: [
 'https://storage.yandexcloud.net/modeli/media/models/lizz/lizz-1-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lizz/lizz-2-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lizz/lizz-3-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lizz/lizz-4-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lizz/lizz-5-compressed.webp'
 ],
 alina: [
 'https://storage.yandexcloud.net/modeli/media/models/alina/alina-1-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/alina/alina-2-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/alina/alina-3-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/alina/alina-4-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/alina/alina-5-compressed.webp'
 ],
 lena: [
 'https://storage.yandexcloud.net/modeli/media/models/lena/lena-1-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lena/lena-2-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lena/lena-3-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lena/lena-4-compressed.webp',
 'https://storage.yandexcloud.net/modeli/media/models/lena/lena-5-compressed.webp'
 ],
 tanya: [
 'https://storage.yandexcloud.net/modeli/media/models/tanya/tanya-1.webp',
 'https://storage.yandexcloud.net/modeli/media/models/tanya/tanya-2.webp',
 'https://storage.yandexcloud.net/modeli/media/models/tanya/tanya-3.webp',
 'https://storage.yandexcloud.net/modeli/media/models/tanya/tanya-4.webp',
 'https://storage.yandexcloud.net/modeli/media/models/tanya/tanya-5.webp'
 ],
  zhenya: [
  'https://storage.yandexcloud.net/modeli/media/models/zenya/zenya-1-compressed.webp',
  'https://storage.yandexcloud.net/modeli/media/models/zenya/zenya-2-compressed.webp',
  'https://storage.yandexcloud.net/modeli/media/models/zenya/zenya-3-compressed.webp',
  'https://storage.yandexcloud.net/modeli/media/models/zenya/zenya-4-compressed.webp',
  'https://storage.yandexcloud.net/modeli/media/models/zenya/zenya-5-compressed.webp'
  ],
  kristina: [
  'https://storage.yandexcloud.net/modeli/media/constant.webp',
  'https://storage.yandexcloud.net/modeli/media/b2-nikolay.webp',
  'https://storage.yandexcloud.net/modeli/media/b2-referral.webp',
  'https://storage.yandexcloud.net/modeli/media/b2-theatre.webp',
  'https://storage.yandexcloud.net/modeli/media/b2-restaurant.webp'
  ],
  olya: [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop'
  ]
 };
// Клик по аватарке (фото)
$$('.story-trigger[data-type="photos"]').forEach(trigger => {
trigger.addEventListener('click', () => {
const model = trigger.dataset.model;
items = modelPhotos[model] || [];
idx = 0;
openModal(photoModal, 'photo');
});
});

// Клик по видео
$$('.mv-track[data-video]').forEach(track => {
track.addEventListener('click', () => {
const container = track.closest('.model-videos');
const videos = $$('.mv-track[data-video]', container).map(t => t.dataset.video);
idx = $$('.mv-track[data-video]', container).indexOf(track);
items = videos;
openModal(videoModal, 'video');
});
});

// Закрытие
$$('.msm-close').forEach(btn => btn.addEventListener('click', closeModal));
$$('.msm-prev').forEach(btn => btn.addEventListener('click', prev));
$$('.msm-next').forEach(btn => btn.addEventListener('click', next));
document.addEventListener('keydown', e => {
if (e.key === 'Escape' && currentModal) closeModal();
if (e.key === 'ArrowLeft' && currentModal) prev();
if (e.key === 'ArrowRight' && currentModal) next();
});

// Свайпы
let touchStartX = 0;
$$('.msm-content').forEach(content => {
content.addEventListener('touchstart', e => {
touchStartX = e.touches[0].clientX;
}, {passive: true});
content.addEventListener('touchend', e => {
const diff = touchStartX - e.changedTouches[0].clientX;
if (Math.abs(diff) > 50) {
if (diff > 0) next();
else prev();
}
}, {passive: true});
});

// === BOOKS DESIGN — НОВЫЙ ДИЗАЙН БЛОКОВ-КНИЖЕК ===
(function() {
  const books = $$('.cinema.reveal');
  if (!books.length) return;

  const ioBook = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        // Не удаляем наблюдение, чтобы панельки тоже анимировались
      }
    });
  }, { threshold: 0.1 });

  books.forEach(book => {
    // Добавляем data-атрибуты по умолчанию (photo)
    const chapters = book.querySelectorAll('.cinema-chapter');
    chapters.forEach(chapter => {
      if (!chapter.dataset.bookMedia) {
        chapter.dataset.bookMedia = 'photo';
      }
      if (!chapter.dataset.bookSrc && chapter.dataset.photo) {
        chapter.dataset.bookSrc = chapter.dataset.photo;
      }
    });

    // Наблюдаем за панельками для reveal анимации
    const panels = book.querySelectorAll('.cinema-text');
    panels.forEach(panel => {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(30px)';
      panel.style.transition = 'opacity 0.6s cubic-bezier(.22,.61,.2,.1), transform 0.6s cubic-bezier(.22,.61,.2,.1)';
      
      const panelIo = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('on');
          }
        });
      }, { threshold: 0.1 });
      panelIo.observe(panel);
    });

    // Обработка видео с кнопками Play/mute
    const videoContainers = book.querySelectorAll('[data-book-media="video"]');
    videoContainers.forEach(container => {
      const src = container.dataset.bookSrc;
      if (!src) return;

      container.innerHTML = `
        <div class="book-media-container video-container">
          <video src="${src}" playsinline muted loop></video>
          <button class="play-btn" aria-label="Play">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="mute-btn" aria-label="Mute">
            <svg class="icon-mute" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            <svg class="icon-unmute" viewBox="0 0 24 24" style="display:none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>
      `;

      const video = container.querySelector('video');
      const playBtn = container.querySelector('.play-btn');
      const muteBtn = container.querySelector('.mute-btn');
      const iconMute = container.querySelector('.icon-mute');
      const iconUnmute = container.querySelector('.icon-unmute');

      let isMuted = true;

      playBtn.addEventListener('click', () => {
        video.play();
        playBtn.style.opacity = '0';
        setTimeout(() => playBtn.style.display = 'none', 300);
      });

      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        video.muted = isMuted;
        iconMute.style.display = isMuted ? 'block' : 'none';
        iconUnmute.style.display = isMuted ? 'none' : 'block';
      });
    });

    // Обработка iframe
    const iframeContainers = book.querySelectorAll('[data-book-media="iframe"]');
    iframeContainers.forEach(container => {
      const src = container.dataset.bookSrc;
      if (!src) return;
      container.innerHTML = `<iframe src="${src}" frameborder="0" allowfullscreen class="book-media-frame"></iframe>`;
    });

    // Обработка слайдера фото
    const sliderContainers = book.querySelectorAll('[data-book-media="slider"]');
    sliderContainers.forEach(container => {
      const srcs = (container.dataset.bookSrc || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!srcs.length) return;

      let slidesHtml = '';
      srcs.forEach(src => {
        slidesHtml += `<div class="slider-slide"><img src="${src}" alt=""></div>`;
      });

      container.innerHTML = `
        <div class="book-slider">
          <div class="slider-track">${slidesHtml}</div>
          <div class="slider-dots"></div>
        </div>
      `;

      const track = container.querySelector('.slider-track');
      const dotsContainer = container.querySelector('.slider-dots');

      srcs.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
        dot.addEventListener('click', () => {
          track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
      });

      track.addEventListener('scroll', () => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        container.querySelectorAll('.slider-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      });
    });

    // Обработка одиночного фото (по умолчанию)
    const photoContainers = book.querySelectorAll('[data-book-media="photo"]');
    photoContainers.forEach(container => {
      const src = container.dataset.bookSrc;
      if (!src) return;
      container.innerHTML = `<img src="${src}" alt="" class="book-media-img">`;
    });

    // Обработка кнопки "Читать дальше"
    const readMoreBtns = book.querySelectorAll('.cinema-readmore');
    readMoreBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const fullContent = btn.previousElementSibling;
        if (fullContent && fullContent.classList.contains('cinema-full')) {
          fullContent.classList.toggle('on');
          btn.textContent = fullContent.classList.contains('on') ? 'Свернуть' : 'Читать дальше';
        }
      });
    });

    ioBook.observe(book);
  });
})();

