/*
 * Электронный семейный альбом: данные людей и перелистывание.
 *
 * Что здесь главное:
 *  1. Данные лежат одним списком внизу файла — это макет, поэтому людей придумано несколько,
 *     а страницы собираются из данных, а не нарисованы руками. Заменить содержимое можно,
 *     не трогая вёрстку.
 *  2. Портреты рисуются кодом (SVG-градиент с инициалами), а не файлами картинок: фотографии
 *     семьи не выкладываются в открытый хостинг, а для макета важна форма кадра, а не лицо.
 *  3. Перелистывание — настоящий поворот листа: правая страница поворачивается вокруг корешка,
 *     на обороте видна следующая левая. На телефоне тот же приём работает на одной странице.
 */

const PEOPLE = [
  {
    id: 'nikolay',
    name: 'Николай Иванович',
    surname: 'Иванов',
    years: '1902 — 1978',
    role: 'дед по отцу',
    place: 'Тверь',
    occupation: 'машинист паровоза',
    portrait: { initials: 'НИ', from: '#3f6ea8', to: '#7fa9d4' },
    summary:
      'Начинал кочегаром, к сорока годам водил пассажирские составы. Всю жизнь прожил у железной дороги — дом стоял в двухстах метрах от путей, и он уверял, что без стука колёс не засыпает.',
    facts: [
      ['Родился', 'Тверь, 15 апреля 1902'],
      ['Работа', 'паровозное депо, 41 год стажа'],
      ['Семья', 'жена Мария, сын Сергей'],
      ['Умер', 'Москва, 20 января 1978'],
    ],
    tastes: ['Гармонь', 'Рыбалка на Волге', 'Крепкий чай в подстаканнике', 'Не любил шумных застолий'],
    quote: '«Поезд не торопится — он просто не останавливается».',
  },
  {
    id: 'maria',
    name: 'Мария Петровна',
    surname: 'Иванова',
    maiden: 'Смирнова',
    years: '1906 — 1985',
    role: 'бабушка по отцу',
    place: 'Торжок',
    occupation: 'учительница начальных классов',
    portrait: { initials: 'МИ', from: '#a2527a', to: '#d79bbb' },
    summary:
      'Сорок лет вела первый класс. Помнила имена всех своих учеников и в семьдесят лет могла перечислить, кто в каком году сидел за второй партой. Пекла пироги по воскресеньям и никому не позволяла помогать.',
    facts: [
      ['Родилась', 'Торжок, около 1906'],
      ['Работа', 'школа № 3, начальные классы'],
      ['Семья', 'сын Сергей, двое внуков'],
      ['Умерла', 'Москва, 3 июня 1985'],
    ],
    tastes: ['Пироги с яблоками', 'Романы Толстого', 'Георгины в палисаднике', 'Тишина после восьми вечера'],
    quote: '«Читать научится каждый, а слушать — не всякий».',
  },
  {
    id: 'sergey',
    name: 'Сергей Николаевич',
    surname: 'Иванов',
    years: '1935 — 2011',
    role: 'отец',
    place: 'Москва',
    occupation: 'инженер-конструктор',
    portrait: { initials: 'СИ', from: '#2f6f63', to: '#7fb3a6' },
    summary:
      'Приехал в Москву в восемнадцать лет с одним чемоданом. Тридцать лет на одном заводе, восемь патентов на крепления, которые до сих пор стоят в серийных машинах. Любил объяснять устройство вещей внукам.',
    facts: [
      ['Родился', 'Москва, 2 июля 1935'],
      ['Работа', 'конструкторское бюро, 34 года'],
      ['Семья', 'жена Ольга, дочь Анна, сын Дмитрий'],
      ['Умер', 'Москва, 10 марта 2011'],
    ],
    tastes: ['Рыбалка', 'Радиоэлектроника', 'Яблочный пирог', 'Футбол по субботам'],
    quote: '«Сначала пойми, как оно устроено, потом ломай».',
  },
  {
    id: 'olga',
    name: 'Ольга Дмитриевна',
    surname: 'Иванова',
    maiden: 'Кузнецова',
    years: 'род. 1940',
    role: 'мама',
    place: 'Ленинград',
    occupation: 'врач-терапевт',
    portrait: { initials: 'ОИ', from: '#8a6a2f', to: '#d3b478' },
    summary:
      'Пережила блокаду ребёнком, об этом рассказывать не любит. Сорок два года в поликлинике, участковый врач, знавший во дворе всех по именам. До сих пор печёт тот же пирог, что и её свекровь.',
    facts: [
      ['Родилась', 'Ленинград, 11 февраля 1940'],
      ['Работа', 'поликлиника № 14, участковый врач'],
      ['Семья', 'муж Сергей, дочь Анна, сын Дмитрий'],
      ['Сейчас', 'Москва, на пенсии'],
    ],
    tastes: ['Опера', 'Белые лилии', 'Крепкий кофе по утрам', 'Не любит громких телефонных разговоров'],
    quote: '«Сначала покорми, потом расспрашивай».',
  },
  {
    id: 'anna',
    name: 'Анна Сергеевна',
    surname: 'Иванова',
    years: 'род. 1968',
    role: 'сестра',
    place: 'Москва',
    occupation: 'врач-кардиолог',
    portrait: { initials: 'АИ', from: '#4a5aa8', to: '#9aa6da' },
    summary:
      'Пошла в медицину за мамой. Двадцать лет в кардиологии, любит повторять, что семейная история болезней — половина диагноза. Собирает истории рода и завела этот альбом.',
    facts: [
      ['Родилась', 'Москва, 19 мая 1968'],
      ['Работа', 'кардиологическое отделение, 22 года'],
      ['Семья', 'сын Пётр'],
      ['Сейчас', 'Москва, ведёт семейный архив'],
    ],
    tastes: ['Плавание дважды в неделю', 'Детективы', 'Горький шоколад', 'Не любит спешку'],
    quote: '«Род — это не список имён, а привычки и болезни, которые мы разносим дальше».',
  },
];

/** Разложить содержимое на страницы: обложка, содержание, люди, вкусы, конец. */
function buildPages(people) {
  const pages = [];

  pages.push({
    kind: 'cover',
    title: 'Род Ивановых',
    subtitle: 'Семейный альбом',
    note: 'Пять историй, собранных внуками · 2026 год',
  });

  pages.push({
    kind: 'contents',
    title: 'В этом альбоме',
    items: [
      ...people.map((person) => ({
        label: `${person.name} ${person.surname}`,
        meta: `${person.years} · ${person.role}`,
        anchor: person.id,
      })),
      { label: 'Род в цифрах', meta: 'сколько людей и какие годы', anchor: 'stats' },
      { label: 'Что любили и не любили', meta: 'вкусы и привычки рода', anchor: 'tastes' },
    ],
  });

  for (const person of people) {
    pages.push({ kind: 'person', person });
  }

  // «Род в цифрах» — короткая страница с числами: она и полезна, и выравнивает счёт страниц,
  // чтобы разворот вкусов начинался с левой страницы, как в настоящей книге.
  const years = people
    .map((person) => Number((person.years.match(/\d{4}/) || [])[0]))
    .filter((year) => !Number.isNaN(year));
  pages.push({
    kind: 'stats',
    title: 'Род в цифрах',
    items: [
      ['людей в альбоме', String(people.length)],
      ['самый ранний год рождения', String(Math.min(...years))],
      ['самый поздний год рождения', String(Math.max(...years))],
      ['поколений', '3'],
      ['чаще всего в вкусах', 'пироги и рыбалка'],
    ],
  });

  // Вкусы разложены на две страницы: пять карточек не помещаются на одну страницу альбома.
  const half = Math.ceil(people.length / 2);
  pages.push({
    kind: 'tastes',
    title: 'Что любили и не любили',
    note: '',
    people: people.slice(0, half),
  });
  pages.push({
    kind: 'tastes',
    title: 'Вкусы рода — продолжение',
    note: 'Общее у всех: пироги, рыбалка и тишина по вечерам',
    people: people.slice(half),
  });

  pages.push({
    kind: 'back',
    title: 'Продолжение следует',
    note: 'Страницы добавляются по мере рассказов родных',
  });

  return pages;
}

/** Портрет: рисуем кодом — градиент и инициалы в рамке, как у старой фотокарточки. */
function portrait(person, size = 'large') {
  const { initials, from, to } = person.portrait;
  return `
    <figure class="portrait portrait--${size}">
      <svg viewBox="0 0 120 150" role="img" aria-label="Портрет: ${person.name} ${person.surname}">
        <defs>
          <linearGradient id="grad-${person.id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${from}" />
            <stop offset="100%" stop-color="${to}" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="120" height="150" fill="url(#grad-${person.id})" />
        <circle cx="60" cy="58" r="26" fill="rgba(255,255,255,0.22)" />
        <path d="M12 150c6-30 24-44 48-44s42 14 48 44z" fill="rgba(255,255,255,0.18)" />
        <text x="60" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="rgba(255,255,255,0.92)">
          ${initials}
        </text>
      </svg>
      <figcaption>${person.years}</figcaption>
    </figure>
  `;
}

function chips(list) {
  return `<ul class="chips">${list.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function factsTable(facts) {
  return `
    <dl class="facts">
      ${facts.map(([term, value]) => `<dt>${term}</dt><dd>${value}</dd>`).join('')}
    </dl>
  `;
}

/** Вёрстка одной страницы. Число страницы подставляем всегда — по нему видно, где ты в альбоме. */
function renderPage(page, index, total) {
  const number = `<span class="page-number">${index + 1} / ${total}</span>`;

  if (page.kind === 'cover') {
    return `
      <article class="page page--cover" id="page-${index + 1}">
        <div class="cover">
          <p class="cover__kicker">${page.subtitle}</p>
          <h1 class="cover__title">${page.title}</h1>
          <div class="cover__rule" aria-hidden="true"></div>
          <p class="cover__note">${page.note}</p>
        </div>
        ${number}
      </article>
    `;
  }

  if (page.kind === 'contents') {
    return `
      <article class="page page--contents" id="page-${index + 1}">
        <h2 class="page__title">${page.title}</h2>
        <ol class="contents">
          ${page.items
            .map(
              (item) => `
            <li>
              <a href="#${item.anchor}"><span class="contents__label">${item.label}</span>
              <span class="contents__meta">${item.meta}</span></a>
            </li>`,
            )
            .join('')}
        </ol>
        ${number}
      </article>
    `;
  }

  if (page.kind === 'person') {
    const { person } = page;
    return `
      <article class="page page--person" id="${person.id}">
        <header class="person__head">
          <div>
            <h2 class="person__name">${person.name}</h2>
            <p class="person__surname">${person.surname}${
              person.maiden ? ` <span class="person__maiden">(в девичестве ${person.maiden})</span>` : ''
            }</p>
            <p class="person__meta">${person.years} · ${person.role} · ${person.place}</p>
          </div>
          ${portrait(person)}
        </header>
        <p class="person__summary">${person.summary}</p>
        ${factsTable(person.facts)}
        <h3 class="page__subtitle">Любил(а) и не любил(а)</h3>
        ${chips(person.tastes)}
        <blockquote class="quote">${person.quote}</blockquote>
        ${number}
      </article>
    `;
  }

  if (page.kind === 'stats') {
    return `
      <article class="page page--stats" id="stats">
        <h2 class="page__title">${page.title}</h2>
        <ul class="numbers">
          ${page.items
            .map(
              ([label, value]) => `
            <li class="numbers__item">
              <span class="numbers__value">${value}</span>
              <span class="numbers__label">${label}</span>
            </li>`,
            )
            .join('')}
        </ul>
        ${number}
      </article>
    `;
  }

  if (page.kind === 'tastes') {
    return `
      <article class="page page--tastes" id="tastes">
        <h2 class="page__title">${page.title}</h2>
        ${page.note ? `<p class="page__note">${page.note}</p>` : ''}
        <ul class="taste-grid">
          ${page.people
            .map(
              (person) => `
            <li class="taste-card" style="--from:${person.portrait.from}; --to:${person.portrait.to}">
              <div class="taste-card__head">
                <span class="taste-card__initials">${person.portrait.initials}</span>
                <span>
                  <strong>${person.name} ${person.surname}</strong>
                  <em>${person.years}</em>
                </span>
              </div>
              ${chips(person.tastes)}
            </li>`,
            )
            .join('')}
        </ul>
        ${number}
      </article>
    `;
  }

  return `
    <article class="page page--back" id="page-${index + 1}">
      <div class="back-cover">
        <h2>${page.title}</h2>
        <p>${page.note}</p>
      </div>
      ${number}
    </article>
  `;
}

const PAGES = buildPages(PEOPLE);

const book = {
  index: 0,
  spread: true,
  animating: false,
  pages: PAGES,
};

const els = {
  left: document.getElementById('spread-left'),
  right: document.getElementById('spread-right'),
  leaf: document.getElementById('leaf'),
  leafFront: document.getElementById('leaf-front'),
  leafBack: document.getElementById('leaf-back'),
  label: document.getElementById('page-label'),
  book: document.getElementById('book'),
};

/** На широком экране показываем разворот, на телефоне — одну страницу. */
function applyViewport() {
  const wide = window.innerWidth >= 900;
  book.spread = wide;
  els.book.classList.toggle('book--single', !wide);
  document.getElementById('view-toggle').setAttribute('aria-pressed', String(!wide));
  const text = document.querySelector('#view-toggle .tool__text');
  if (text) text.textContent = wide ? 'Разворот' : 'Страница';
  render();
}

function pageAt(index) {
  return PAGES[index];
}

function renderStatic() {
  const leftIndex = book.spread ? book.index : book.index;
  const rightIndex = book.spread ? book.index + 1 : book.index;

  if (book.spread) {
    els.left.hidden = false;
    els.right.hidden = false;
    els.left.innerHTML = pageAt(leftIndex) ? renderPage(pageAt(leftIndex), leftIndex, PAGES.length) : '';
    els.right.innerHTML = pageAt(rightIndex) ? renderPage(pageAt(rightIndex), rightIndex, PAGES.length) : '';
  } else {
    // На телефоне левая половина скрыта, вся страница — справа: так перелистывание
    // выглядит одинаково и на большом экране, и на маленьком.
    els.left.hidden = true;
    els.right.hidden = false;
    els.right.innerHTML = pageAt(book.index) ? renderPage(pageAt(book.index), book.index, PAGES.length) : '';
  }

  const shown = book.spread ? [leftIndex, rightIndex] : [book.index];
  const first = pageAt(shown[0]);
  const label = first
    ? first.kind === 'cover'
      ? 'Обложка'
      : first.kind === 'contents'
        ? 'Содержание'
        : first.kind === 'person'
          ? `${first.person.name} ${first.person.surname}`
          : first.kind === 'tastes'
            ? 'Вкусы рода'
            : 'Окончание'
    : 'Обложка';
  els.label.textContent = `${label} · ${shown.filter((i) => pageAt(i)).length === 2 ? 'разворот' : 'страница'}`;
}

function render() {
  renderStatic();
  document.getElementById('prev').disabled = book.index === 0;
  document.getElementById('prev-bottom').disabled = book.index === 0;
  const last = book.spread ? book.index + 1 >= PAGES.length : book.index >= PAGES.length - 1;
  document.getElementById('next').disabled = last;
  document.getElementById('next-bottom').disabled = last;
}

/** Перелистывание вперёд: лист летит влево, на обороте — следующая левая страница. */
async function turnForward() {
  if (book.animating) return;
  const step = book.spread ? 2 : 1;
  const nextIndex = book.index + step;
  if (nextIndex >= PAGES.length) return;

  // На телефоне страница длиннее экрана, поэтому лист не поворачиваем — показываем переход.
  if (!book.spread) {
    book.index = nextIndex;
    render();
    flashPage();
    return;
  }

  const frontPage = pageAt(book.index + (book.spread ? 1 : 0));
  const backPage = pageAt(book.spread ? nextIndex : nextIndex);

  els.leafFront.innerHTML = frontPage ? renderPage(frontPage, book.index + (book.spread ? 1 : 0), PAGES.length) : '';
  els.leafBack.innerHTML = backPage ? renderPage(backPage, book.spread ? nextIndex : nextIndex, PAGES.length) : '';

  book.animating = true;
  els.leaf.hidden = false;
  els.leaf.classList.remove('leaf--back-turn');
  // Сначала рисуем лист в исходном положении, потом запускаем поворот: иначе браузер
  // пропустит анимацию и лист просто перепрыгнет.
  void els.leaf.offsetWidth;
  els.leaf.classList.add('leaf--turning');

  await wait(700);
  book.index = nextIndex;
  els.leaf.classList.remove('leaf--turning');
  els.leaf.hidden = true;
  // Чистим лист после переворота: иначе в разметке остаётся вторая копия страницы
  // с теми же id и ссылками — это путает программы чтения с экрана и поиск по странице.
  els.leafFront.innerHTML = '';
  els.leafBack.innerHTML = '';
  book.animating = false;
  render();
}

/** Перелистывание назад: тот же приём в обратную сторону. */
async function turnBack() {
  if (book.animating) return;
  const step = book.spread ? 2 : 1;
  const prevIndex = book.index - step;
  if (prevIndex < 0) return;

  if (!book.spread) {
    book.index = prevIndex;
    render();
    flashPage();
    return;
  }

  const frontPage = pageAt(prevIndex);
  const backPage = pageAt(book.spread ? book.index : book.index);

  els.leafFront.innerHTML = frontPage ? renderPage(frontPage, prevIndex, PAGES.length) : '';
  els.leafBack.innerHTML = backPage ? renderPage(backPage, book.spread ? book.index : book.index, PAGES.length) : '';

  book.animating = true;
  els.leaf.hidden = false;
  els.leaf.classList.add('leaf--back-turn');
  void els.leaf.offsetWidth;
  els.leaf.classList.add('leaf--turning');

  await wait(700);
  book.index = prevIndex;
  els.leaf.classList.remove('leaf--turning', 'leaf--back-turn');
  els.leaf.hidden = true;
  els.leafFront.innerHTML = '';
  els.leafBack.innerHTML = '';
  book.animating = false;
  render();
}

/** Короткий вход страницы: заметно, что страница сменилась, и не мешает читать. */
function flashPage() {
  els.right.classList.remove('page-enter');
  void els.right.offsetWidth;
  els.right.classList.add('page-enter');
  window.setTimeout(() => els.right.classList.remove('page-enter'), 320);
  // Прокрутка мгновенная: плавная «догоняла» палец и сбивала нажатие на «Дальше».
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function goTo(anchor) {
  const index = PAGES.findIndex((page) => page.kind === 'person' && page.person.id === anchor);
  const special = { tastes: 'tastes', stats: 'stats' }[anchor];
  const target = special ? PAGES.findIndex((page) => page.kind === special) : index;
  if (target < 0) return;
  book.index = book.spread ? target - (target % 2) : target;
  render();
}

// ── Управление ───────────────────────────────────────────────────────────────
document.getElementById('next').addEventListener('click', () => void turnForward());
document.getElementById('next-bottom').addEventListener('click', () => void turnForward());
document.getElementById('prev').addEventListener('click', () => void turnBack());
document.getElementById('prev-bottom').addEventListener('click', () => void turnBack());

document.getElementById('view-toggle').addEventListener('click', () => {
  const single = !els.book.classList.contains('book--single');
  els.book.classList.toggle('book--single', single);
  book.spread = !single;
  document.getElementById('view-toggle').setAttribute('aria-pressed', String(single));
  const text = document.querySelector('#view-toggle .tool__text');
  if (text) text.textContent = single ? 'Страница' : 'Разворот';
  render();
});

document.getElementById('to-start').addEventListener('click', (event) => {
  event.preventDefault();
  book.index = 0;
  render();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') void turnForward();
  if (event.key === 'ArrowLeft') void turnBack();
});

// Свайп: на телефоне это основной способ листать.
let touchStartX = null;
els.book.addEventListener(
  'touchstart',
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true },
);
els.book.addEventListener(
  'touchend',
  (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) void turnForward();
    else void turnBack();
  },
  { passive: true },
);

// Ссылки содержания: листаем к нужному человеку, не перезагружая страницу.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const anchor = link.getAttribute('href').slice(1);
  const known = PAGES.some((page) => page.kind === 'person' && page.person.id === anchor) || anchor === 'tastes' || anchor === 'stats';
  if (!known) return;
  event.preventDefault();
  goTo(anchor);
});

window.addEventListener('resize', () => {
  const wide = window.innerWidth >= 900;
  if (wide === book.spread) return;
  applyViewport();
});

applyViewport();
