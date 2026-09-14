(function(){
"use strict";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// === ОРИГИНАЛЬНЫЙ ФУНКЦИОНАЛ САЙТА ===
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

$$('.cinema').forEach(cinema => {
 const chapters = $$('.cinema-chapter', cinema),
 track = $('.cinema-track', cinema),
 dotsWrap = $$('.cinema-dots', cinema)[0] || $('.cinema-dots', cinema);
 if (!track || !dotsWrap || !chapters.length) return;

 const layer = document.createElement('div');
 layer.className = 'cinema-photo';
 const imgs = chapters.map((ch, i) => {
 const img = document.createElement('img');
 img.src = ch.dataset.photo;
 img.alt = ch.dataset.title || '';
 img.loading = i === 0 ? 'eager' : 'lazy';
 layer.appendChild(img);
 ch.style.backgroundImage = 'url("' + ch.dataset.photo + '")';
 const b = document.createElement('button');
 b.setAttribute('aria-label', ch.dataset.title || '');
 b.innerHTML = '<span>' + (ch.dataset.title || '') + '</span>';
 b.addEventListener('click', () => ch.scrollIntoView({ behavior: 'smooth', block: 'start' }));
 dotsWrap.appendChild(b);
 return img;
 });
 track.prepend(layer);

 const dbtns = $$('button', dotsWrap);
 let cur = -1;
 function set(i) {
 if (i === cur || i < 0 || i >= imgs.length) return;
 cur = i;
 imgs.forEach((im, k) => im.classList.toggle('on', k === i));
 dbtns.forEach((d, k) => {
 d.classList.toggle('on', k === i);
 d.classList.toggle('next', k === i + 1);
 });
 }

 const cio = new IntersectionObserver(es => {
 es.forEach(e => {
 if (e.isIntersecting) set(chapters.indexOf(e.target));
 });
 }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
 chapters.forEach(ch => cio.observe(ch));
 set(0);

 let sheet = $('.cinema-sheet');
 if (!sheet) {
 sheet = document.createElement('div');
 sheet.className = 'cinema-sheet';
 sheet.innerHTML = '<div class="sheet-inner"><button class="close-sheet">×</button><div class="sheet-body"></div></div>';
 document.body.appendChild(sheet);
 $('.close-sheet', sheet).addEventListener('click', () => sheet.classList.remove('open'));
 sheet.addEventListener('click', e => {
 if (e.target === sheet) sheet.classList.remove('open');
 });
 document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && sheet.classList.contains('open')) sheet.classList.remove('open');
 });
 }

 const body = $('.sheet-body', sheet);
 $$('.cinema-readmore', cinema).forEach((btn, i) => btn.addEventListener('click', () => {
 const ch = chapters[i], t = ch.dataset.title || '';
 body.innerHTML = (t ? '<h3>' + t + '</h3>' : '') + $('.cinema-full', ch).innerHTML;
 sheet.classList.add('open');
 }));
});

(function(){
 const groups = $$('.highlights');
 if (!groups.length) return;
 const sv = document.createElement('div');
 sv.className = 'sv';
 sv.innerHTML = '<div class="sv-inner"><button class="sv-close">×</button><div class="sv-zone prev"></div><div class="sv-zone next"></div><video></video><div class="sv-progress"></div><div class="sv-info"><img class="sv-ava"><div class="sv-name"></div></div></div>';
 document.body.appendChild(sv);

 const video = $('video', sv),
 prog = $('.sv-progress', sv),
 ava = $('.sv-ava', sv),
 nameEl = $('.sv-name', sv);
 let list = [], idx = 0;

 function show() {
 $$('i', prog).forEach((s, k) => {
 $('b', s).style.width = k < idx ? '100%' : '0';
 });
 ava.src = list[idx].cover;
 video.src = list[idx].src;
 video.play().catch(() => {
 video.muted = true;
 video.play();
 });
 }

 function open(g, st) {
 list = $$('.hl', g).map(b => ({ src: b.dataset.video, cover: $('img', b).src }));
 idx = st;
 nameEl.textContent = g.dataset.name || '';
 prog.innerHTML = list.map(() => '<i><b></b></i>').join('');
 sv.classList.add('open');
 document.body.style.overflow = 'hidden';
 show();
 }

 function next() {
 if (idx < list.length - 1) { idx++; show(); } else { close(); }
 }
 function prev() {
 if (idx > 0) { idx--; show(); }
 }
 function close() {
 sv.classList.remove('open');
 document.body.style.overflow = '';
 video.pause();
 video.removeAttribute('src');
 video.load();
 }

 video.addEventListener('ended', next);
 video.addEventListener('timeupdate', () => {
 const seg = $$('i', prog)[idx];
 if (seg && video.duration) {
 $('b', seg).style.width = ((video.currentTime / video.duration) * 100) + '%';
 }
 });

 $('.sv-close', sv).addEventListener('click', close);
 $('.sv-zone.next', sv).addEventListener('click', next);
 $('.sv-zone.prev', sv).addEventListener('click', prev);
 document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && sv.classList.contains('open')) close();
 });

 groups.forEach(g => {
 $$('.hl', g).forEach((b, i) => b.addEventListener('click', () => open(g, i)));
 });
})();

(function(){
 const root = document.getElementById('heroSlider') || document.querySelector('.hero-media');
 if (!root) return;
 let tr = root.querySelector('.hero-slides');
 if (!tr) {
 const im0 = root.querySelectorAll('img');
 if (im0.length < 2) return;
 tr = document.createElement('div');
 tr.className = 'hero-slides';
 im0.forEach(im => tr.appendChild(im));
 root.prepend(tr);
 }
 const imgs = tr.querySelectorAll('img');
 if (imgs.length < 2) return;

 let dw = root.querySelector('.hero-dots');
 if (!dw) {
 dw = document.createElement('div');
 dw.className = 'hero-dots';
 root.appendChild(dw);
 }

 let i = 0;
 imgs.forEach((_, k) => {
 const b = document.createElement('button');
 b.type = 'button';
 b.setAttribute('aria-label', 'Фото ' + (k + 1));
 if (k === 0) b.classList.add('on');
 b.addEventListener('click', () => go(k));
 dw.appendChild(b);
 });

 const db = dw.querySelectorAll('button');
 function go(k) {
 i = Math.max(0, Math.min(imgs.length - 1, k));
 tr.style.transform = 'translateX(-' + (i * 100) + '%)';
 db.forEach((d, m) => d.classList.toggle('on', m === i));
 }

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

(function(){
 const heads = Array.from(document.querySelectorAll('h1, h2'));
 if (!heads.length) return;
 const bar = document.createElement('div');
 bar.className = 'section-dots';
 document.body.appendChild(bar);
 const btns = heads.map(h => {
 const b = document.createElement('button');
 const lb = (h.textContent || '').trim().slice(0, 60);
 b.setAttribute('aria-label', lb);
 b.innerHTML = '<span>' + lb + '</span>';
 b.addEventListener('click', () => h.scrollIntoView({ behavior: 'smooth', block: 'start' }));
 bar.appendChild(b);
 return b;
 });

 const io2 = new IntersectionObserver(es => {
 es.forEach(e => {
 if (e.isIntersecting) {
 const idx = heads.indexOf(e.target);
 btns.forEach((b, k) => b.classList.toggle('on', k === idx));
 }
 });
 }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
 heads.forEach(h => io2.observe(h));
 btns[0].classList.add('on');
})();

$$('.marquee span').forEach(sp => { sp.innerHTML += sp.innerHTML; });

$$('section').forEach(sec => {
 const l = $$('details', sec);
 if (l.length < 2) return;
 l.forEach(d => {
 d.addEventListener('toggle', () => {
 if (d.open) l.forEach(o => { if (o !== d) o.open = false; });
 });
 });
});

$$('iframe, video').forEach(el => { el.setAttribute('loading', 'lazy'); });

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

(function(){
 const tabs = $$('.tab-btn'), contents = $$('.interview-content');
 if (!tabs.length) return;
 tabs.forEach(tab => tab.addEventListener('click', () => {
 tabs.forEach(t => t.classList.remove('active'));
 contents.forEach(c => c.classList.remove('active'));
 tab.classList.add('active');
 const tc = $('.interview-content.' + tab.dataset.tab);
 if (tc) tc.classList.add('active');
 }));
})();

(function(){
 const section = $('#new-models');
 if (!section) return;
 const tabs = $$('.insta-tab', section),
 gallery = $('.insta-gallery', section),
 locFilters = $('.location-filters', section),
 locBtns = $$('.loc-btn', section),
 cards = $$('.insta-model-card', section);
 if (!gallery || !tabs.length) return;

 tabs.forEach(tab => tab.addEventListener('click', () => {
 tabs.forEach(t => t.classList.remove('active'));
 tab.classList.add('active');
 const view = tab.dataset.view;
 gallery.dataset.view = view;
 if (view === 'location') {
 if (locFilters) locFilters.hidden = false;
 } else {
 if (locFilters) locFilters.hidden = true;
 cards.forEach(c => c.style.display = '');
 if (locBtns.length) {
 locBtns.forEach(b => b.classList.remove('active'));
 locBtns[0].classList.add('active');
 }
 }
 }));

 if (locBtns.length) {
 locBtns.forEach(btn => btn.addEventListener('click', () => {
 locBtns.forEach(b => b.classList.remove('active'));
 btn.classList.add('active');
 const city = btn.dataset.city;
 cards.forEach(card => {
 card.style.display = (city === 'all' || card.dataset.city === city) ? '' : 'none';
 });
 }));
 }
})();

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

document.querySelectorAll('a[href^="https://t.me"]').forEach(a => {
 a.setAttribute('target', '_blank');
 a.setAttribute('rel', 'noopener');
});

// === ОБНОВЛЕННЫЙ КОД ДЛЯ РАЗДЕЛА "ИНТЕРВЬЮ" ===
(function(){
 const interviewSection = $('#interview');
 if (!interviewSection) return;

 const switchBtns = $$('.interview-switch-btn', interviewSection);
 const questionsMode = $('#interviewQuestions', interviewSection);
 const modelsMode = $('#interviewModels', interviewSection);
 const modelCards = $$('.model-card', interviewSection);
 const modal = $('#interviewModal', interviewSection);
 const modalBody = $('#modalBody', interviewSection);
 const modalClose = $('.modal-close', modal);

 const interviewsData = {
  anya: {
   name: 'Аня', age: '20 лет', info: 'Два мероприятия',
   answers: [
    'Аня, 20 лет, два мероприятия.',
    'Нашла сайт в яндексе',
    'Высокий гонорар, чувствуется серьезный подход, это резко контрастировало со следующими агентствами, а дальше не искала.',
    'Первое мероприятие - это был романтический вечер. Там просто заработала. Потом сразу тебе сказала, что меня интересуют только люди из моего круга. потому что я хочу расти в своей сфере.',
    'Перед первым ничего не боялась. Всё прошло хорошо. так как и обговаривали. А вот перед вторым - боялась. Это было мероприятия, на котором были много влиятельных людей , с которыми мне нужно было познакомиться и наладить отношения. Я очень боялась, что не знала как они отнесуться к тому, что я из эскорта. Ну ничего, как выяснилось, это нормальная ситуация. Я сопровождала человека на форуме, потом мы продолжили общение',
    'Да не запомнилось особо. Провела время и все. Второе мероприятие - оно важное. Оно запомнилось',
    'На втором мероприятии я сидела за одним столом с деканом своего факультета.',
    'То, что мне нравился мой спутник. Он был интересен. И я поняла, что поступила правильно',
    'Я получила заявку. Отправила анкету. Мне ответили. Всё',
    'Я написала. Мы созвонились. Поговорили. Потом, встретились. Я показала, что умею. Всё чудесно',
    'ДЛя меня карьера -это всё. Я очень люблю международное право и буду в нем развиваться. Это главное',
    'Нет не знают. Да мне и всё равно',
    'Не распыляйся на ненужных людей. Выбирай заказы. Ты молодец',
    'Поскольку я свободно говорю на английском и на немецком, меня интересуют зарубежное сопровождение. В идеале - деловое и романтическое. Про гонорар - ну не знаю. В Зависимости от продолжительности. От 5.000.000.. Так же готова к мероприятиям здесь в Москве с иностранными гостями'
   ]
  },
  maria: {
   name: 'Мария', age: '22 года', info: 'Пять мероприятий',
   answers: [
    'Мария. 22 года, студентка актерского факультета',
    'Познакомила общая знакомая. Не из эскорта',
    'Я про другие не знаю. не интересовалась',
    'у меня было пять мероприятий: 4 встречи, 5-е сначала тоже была встреча, потом предложил мне составить компанию в совместном путешествии. Теперь я с ним же на постоянной основе',
    'Мне было 19 лет. Я боялась всего.',
    'Мужчина понимал, что я очень волновалась. Мы поужинали в ресторане и на этом решили разойтись. Мужчина подарил мне просто так 100.000 за беспокойство. Для меня это тогда были серьезные деньги.',
    'Интересные все. Но самое сильное впечатление, это на мероприятие мы летали на вертолете. туда и обратно. Я не могу рассказать деталей. Но было круто',
    'То, что ты меня всему научил. Я всегда была открыта к людям, но не к мужчинам. ты во мне это исправил.',
    'Я к анкете приложила визитку. Только вся в белом.помоему сработало))',
    'я пришла. разделась. и мы просто начали разговаривать. А дальше я набрала обороты и поговорили обо всём))',
    'Я кайфую от того, что мной восхищаются. А выражается это в гонорарах',
    'Нет, никто не знает',
    'ничего такого. ты делаешь всё правильно',
    'Пока что я сосредоточена на карьере. Поэтому токо встречи в москве от 1000000'
   ]
  },
  sonya: {
   name: 'Соня', age: '19 лет', info: 'Одно мероприятие',
   answers: [
    'Соня. 19 лет. На одном и оно продолжается, но я не исключаю вариант, что найду что-то повыгоднее',
    'Погуглила дорогой эскорт',
    'Я хотела стать эскортницей по вызову. Ты меня переубедил этим не заниматься. Я решила попробовать с тобой, если что, думала, что в любой момент могу уйти туда',
    'Одна встреча. Мужчина сразу сказал, что ищет постоянную основу. А эту встречу он оплатил , чтобы со мной познакомиться, потому что понравилась по анкете',
    'Не было страхов. Я была готова ко всему, но оказалось все проще',
    'Мы встретились. Поужинали в ресторане, покатались по городу. Получила много всего, первый подарок - мне оплатили обучение на права. Сняли квартиру. В которой живу одна. Хожу в зал, пробую разные курсы, но пока ничего не нравиться',
    'Однажды мы с мужчиной ехали. На светофоре остановились и я в окне автобуса который тоже остановился, увидела своего бывшего одноклассника, а он увидел меня. Он в автобусе, я - в лендровере. Пока мальчик',
    'То, что я богиня',
    'Я отвечала на все заявки. На эту получила ок. Я не знала к кому я иду. Пришла и все получилось',
    'Я научилась общаться. Думала, что умею.. Что там уметь? А нет. Ты научил меня до уровня "богиня общения"',
    'Это значит тусить. Кайфовать.',
    'Нет не знают. Я не хочу чтобы мои будущие мужчины знали.Я хочу чтобы они думали что я на их мероприятии в первый раз в качестве эскорт модели',
    'Молодец, девочка, что попробовала',
    'Хочу долгосрочный контракт, который больше чем сейчас. на 2-3 миллиона в месяц и больше'
   ]
  },
  victoria: {
   name: 'Виктория', age: '21 год', info: 'Одно мероприятие',
   answers: [
    'Виктория. 21 год. медсестра',
    'через поиск',
    'Мне важна конфиденциальность. Мне понравилось что у тебя нет каталогов с моделями.',
    'одно мероприятие. заработала 500.000',
    'Я очень долго ждала первый заказ. больше двух лет. Я очень нервничала. То, что мужчина оплатил мне перелет до москвы и гостиницу - заставляло нервничать еще сильнее',
    'Мужчина приехал ко мне в гостиницу. Мы поговорили.Потом поехали покататься по городу. Он мне показал Москву. Поужинали. Вернулись в номер. Получила подарочек',
    'Я впервые увидела Москва-Сити. Меня это впечатлило. Потом мы поднялись в ресторан на верхнем этаже.',
    'То, что ты меня подготовил',
    'Я не особо верила в то, что меня выберут, при условии, что мне лететь через пол страны. Поэтому отвечала не на все заказы',
    'Когда я прилетела в Москву, ты меня встретил и привез в гостиницу. Мы с тобой поговорили, ты показал, как это делать лучше. Я перестала волноваться. Через четыре дня мы встретились уже с заказчиком',
    'Я знаю, что это ненадолго. Поэтому, пока красивая, хочу накопить денег',
    'Нет конечно',
    'Надо было раньше начинать',
    'К интересным романтическим'
   ]
  },
  katya: {
   name: 'Катя', age: '23 года', info: 'Три мероприятия',
   answers: [
    'Катя 23 года, была на 3 мероприятиях.',
    'Подруга посоветовала',
    'Другие не искала. просто доверилась',
    'Сначала отдала кредиты. Потом согласилась еще на одно. Потом еще одно. Трачу деньги на себя',
    'Страха не было. Немного волновалась. Успокоило то, что ты мне всё рассказал и четко проинструктировал, всему научил. К тому же, видела пример подруги, так что всё прошло нормально.',
    'Первое мероприятие - это было свидание. Я хотела блеснуть эрудицией, но мужчина оказался опытнее меня, поэтому я молчала и слушала. Хотя мужчина оценил мою увлеченность. ПОтом, как ты советовал, взяла инициативу в свои руки. Показала заранее заготовленные ролики и сказала что хочу так же. Поехали и воплотили. Оказалось, это проще, чем я сама себе накручивала',
    'Все по-своему интересны. Мне самой интересно было экспериментировать. Подготовила ролики и интересные цены, которая предложила воплотить.',
    'Мне нравится контролировать мужчин, и спасибо тебе, что ты только с такими меня и знакомишь. Еще мне нравиться то, что все трое мужчина пытались пригасить меня повторно.',
    'На первой встрече ты мне сказал: "Задавай любые вопросы". Я задавала по моему сотни две вопросов что как и ты на все ответил. Потом мы приехали к тебе и ты сказал "командуй" И я сделала все что хотела и даже то, всегда где то глубоко во мне.',
    'Мы катались катались. Я чувствовала себя королевой и красивой и в тоже время властной. Я научилась разговаривать с мужчинами. Понимать что хочу и не боятся говорить про это. Я рассталась с парнем и нашла себе нового. Хорошего и классного.',
    'Я считаю себя богиней кекса. Мне нравиться подтверждение этого денежным эквивалентом.',
    'Нет. Мой парень сделал мне предложение. Думаю, всё этим сказано',
    'Катя, ты лучшая! Не сомневайся в этом и действуй!',
    'Посмотрим. Я готова к достойным предложениям'
   ]
  },
  alisa: {
   name: 'Алиса', age: '24 года', info: 'Одно путешествие',
   answers: [
    'Алиса, 24 года. Я была в одном путешествии',
    'Меня привела подруга. Она сказала , что есть мужчина, которому нужны две девушки для сопровождение в Китай. Отдохнуть и поработать. Подруга предложила подать заявку от нас двоих',
    'Я другие не смотрела',
    'У меня это одно мероприятие. До этого я работала в парфюмерном лакшери бутике. После мероприятия, решила начать работать в недвижимости.',
    'Перед мероприятием, мужчина дал нам с подружкой деньги, чтобы мы купили что нам понадобиться в поездке. Поэтому было доверие',
    'Я ожидала что мы с девочками просидим в гостинице, потому что сопровождение по рабочим вопросам не требовалось, А получилось так, что мы только один день погуляли с девочками по гуанчжоу,а потом уже с мужчиной покатались по городу. езде побывали, покатались на катере, а потом он предложил полететь в Тайланд и мы тусили еще два дня там.',
    'Мы ели много всего экзотического и в Китае и в Тае. От шашлыка из крокодила, до еще что даже не запомнила',
    'То, что была рядом подруга',
    'Это было удивительно. Мы с подругой приехали к тебе, потому что первое знакомство с мужчиной было по скайпу. Когда мы приехали, у тебя была другая девочка блогер. Первое что я ей сказала.. оо. я на тебя подписана. Потом мы долго ждали, когда мужчина сможет выйти на связь, у него были какие-то внезапные дела. До этого мы катались вчетвером. Потом позвонил мужчина. Мы уже готовые. Хотели даже покататься при включенном скайпе. Я думала что мужчина выберет двоих из нас троих. Думала , что меня не выберет. А мужчина взял всех троих.',
    'Сначала мы созвонились. Потом встретились уже втроем: я , ты и моя подруга. Ни я ни моя подруга никогда не пробовали кататься втроем, но все прошло лучше и интереснее , чем можно было представить.',
    'Возможности. Больше всего не люблю упускать возможности.',
    'Только подруга и всё',
    'Не тормози. Пока молодая - всё получиться',
    'Люблю путешествовать и в моем приоритете - поездки от 3000000'
   ]
  },
  dasha: {
   name: 'Даша', age: '19 лет', info: 'Одно мероприятие',
   answers: [
    'Меня зовут Даша. Я была на одном мероприятии',
    'Через поиск. Я давно про тебя знала, но долго решалась',
    'Я общалась с представителями других агентств. Но у них какие-то маленькие суммы, что даже как-то не интересно.',
    'У меня было только одно мероприятие. Надо было составить компани мужчине. Мы разговаривали наверное часов пять. Заказывали еду и напитки аж три раза.У меня менялись вкусы. На самом деле, мне просто очень нравилось заказывать.',
    'Да не боялась. Просто пришла, зная, что если что уйду в любой момент',
    'Я ожидала то, что и все ожидают. Но, мы просто веселились и разговаривали о его проблемах с женой и детьми.',
    'Я объелась',
    'Ты. Твои советы и то, чему ты меня научил',
    'Я написала. Отправила фотки. ПОтом созвонились . Мужчина просто так мне денег на хорошее настроение.',
    'Я приехала. Пы покатались. ты всё рассказал. Или надо поподробнее?',
    'Это интересно',
    'Нет. И я думаю не узнают.',
    'Никогда никуда не опаздывай. Уважай чужое время. Я опоздала к тебе тогда, но ты простил',
    'На любые. Встречи от полумиллиона, все остальное -обсуждаемо'
   ]
  }
 };

 const questions = [
  'Представься, сколько тебе лет и на скольких мероприятиях ты была?',
  'Как ты про меня узнала?',
  'Чем я отличаюсь от других агентств или предложений, которые ты видела?',
  'Сколько у тебя всего было мероприятий? Что тебе это дало?',
  'Расскажи о своих страхах перед первым твоим мероприятием?',
  'Расскажи о первом мероприятии. Чего ты ожидала? Как всё прошло? Что ты получила?',
  'Расскажи о самом интересном мероприятии или случае, который с тобой произошёл?',
  'Что помогает тебе чувствовать себя свободно на мероприятии?',
  'Расскажи про кастинг на мероприятие, о котором ты рассказала?',
  'Расскажи, как прошло наше с тобой собеседование? Что ты чувствовала? Чему научилась? Как тебе это помогло?',
  'Что для тебя значит быть моделью в элитном сопровождении? Не работа, а именно смысл?',
  'Твои знакомые знают про то, что ты в элитном эскорте?',
  'Какие бы ты дала советы самой себе, если бы только начинала?',
  'К каким новым мероприятиям ты готова и на какой гонорар рассчитываешь?'
 ];

 // 1. Переключение табов
 switchBtns.forEach(btn => {
  btn.addEventListener('click', () => {
   switchBtns.forEach(b => b.classList.remove('active'));
   btn.classList.add('active');
   const mode = btn.dataset.mode;
   if (mode === 'questions') {
    questionsMode.style.display = '';
    modelsMode.style.display = 'none';
   } else {
    questionsMode.style.display = 'none';
    modelsMode.style.display = '';
   }
  });
 });

 // 2. Генерация панелек вопросов
 if (questionsMode) {
  const qList = document.createElement('div');
  qList.className = 'questions-list';
  
  questions.forEach((q, index) => {
   const panel = document.createElement('div');
   panel.className = 'question-panel';
   panel.dataset.qIndex = index;
   panel.innerHTML = '<div class="qp-info"><h3>Вопрос ' + (index + 1) + '</h3><p>' + q + '</p></div>';
   qList.appendChild(panel);
  });
  questionsMode.appendChild(qList);

  // 3. Клик по панельке вопроса
  $$('.question-panel', questionsMode).forEach(panel => {
   panel.addEventListener('click', () => {
    const qIndex = parseInt(panel.dataset.qIndex);
    const qText = questions[qIndex];
    
    let html = '<div class="modal-q-header"><div class="modal-q-num">Вопрос ' + (qIndex + 1) + '</div><h3 class="modal-q-text">' + qText + '</h3></div><div class="modal-answers-list">';
    
    Object.keys(interviewsData).forEach(key => {
     const model = interviewsData[key];
     const answer = model.answers[qIndex] || 'Ответ отсутствует';
     html += '<div class="modal-answer-item"><div class="mai-name">' + model.name + ', ' + model.age + '</div><p class="mai-text">' + answer + '</p></div>';
    });
    html += '</div>';
    
    if (modalBody) modalBody.innerHTML = html;
    if (modal) {
     modal.classList.add('open');
     document.body.style.overflow = 'hidden';
    }
   });
  });
 }

 // 4. Клик по карточке модели
 modelCards.forEach(card => {
  card.addEventListener('click', () => {
   const modelKey = card.dataset.model;
   const data = interviewsData[modelKey];
   if (!data || !modalBody) return;

   let html = '<div class="modal-model-header"><h3>' + data.name + ', ' + data.age + '</h3><p>' + data.info + '</p></div>';
   questions.forEach((q, i) => {
    const answer = data.answers[i] || '';
    html += '<div class="modal-question"><div class="modal-question-num">Вопрос ' + (i + 1) + '</div><div class="modal-question-text">' + q + '</div><p class="modal-answer">' + answer + '</p></div>';
   });

   modalBody.innerHTML = html;
   modal.classList.add('open');
   document.body.style.overflow = 'hidden';
  });
 });

 // 5. Закрытие модалки
 function closeModal() {
  if (modal) {
   modal.classList.remove('open');
   document.body.style.overflow = '';
  }
 }

 if (modalClose) modalClose.addEventListener('click', closeModal);
 if (modal) {
  modal.addEventListener('click', e => {
   if (e.target === modal) closeModal();
  });
 }
 document.addEventListener('keydown', e => {
  if (modal && modal.classList.contains('open') && e.key === 'Escape') closeModal();
 });
})();

// === ПЛЕЕР ДЛЯ ИНТЕРВЬЮ ===
document.querySelectorAll('.video-play-btn').forEach(btn => {
 btn.addEventListener('click', () => {
  const container = btn.closest('.video-container');
  const video = container.querySelector('video');
  if (video) {
   video.muted = false;
   video.play();
   container.classList.add('playing');
  }
 });
});
})();
// === КАРТОЧКИ МОДЕЛЕЙ СО СТОРИС ===
(function(){
const photoModal = document.createElement('div');
photoModal.className = 'model-stories-modal';
photoModal.innerHTML = '<button class="msm-close"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="msm-content"><div class="msm-progress"><div class="msm-progress-bar"></div></div><div class="msm-slider"></div><button class="msm-nav msm-prev"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><button class="msm-nav msm-next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button><div class="msm-counter"></div></div>';
document.body.appendChild(photoModal);

const videoModal = document.createElement('div');
videoModal.className = 'model-stories-modal';
videoModal.innerHTML = '<button class="msm-close"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="msm-content"><div class="msm-progress"><div class="msm-progress-bar"></div></div><div class="msm-slider"></div><button class="msm-nav msm-prev"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><button class="msm-nav msm-next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button><div class="msm-counter"></div></div>';
document.body.appendChild(videoModal);

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

// Клик по аватарке (фото)
$$('.story-trigger[data-type="photos"]').forEach(trigger => {
trigger.addEventListener('click', () => {
const model = trigger.dataset.model;
items = [
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-1-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-2-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-3-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-4-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-5-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-6-compressed.webp',
'storage.yandexcloud.net/modeli/media/models/lizz/lizz-7-compressed.webp'
];
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
})();