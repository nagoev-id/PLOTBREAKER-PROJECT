// Слушаем сообщения от popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCRAPE_DATA') {
    const data = extractMovieData();
    sendResponse({ payload: data });
  }
  return true;
});

// Маппинг жанров (копия из src/utilities/constants.ts)
const GENRE_MAPPING = {
  боевик: 'action',
  приключения: 'adventure',
  мультфильм: 'animation',
  комедия: 'comedy',
  криминал: 'crime',
  документальный: 'documentary',
  драма: 'drama',
  семейный: 'family',
  фэнтези: 'fantasy',
  история: 'history',
  ужасы: 'horror',
  музыка: 'music',
  мюзикл: 'musical',
  детектив: 'mystery',
  мелодрама: 'romance',
  фантастика: 'sci-fi',
  триллер: 'thriller',
  военный: 'war',
  вестерн: 'western',
  биография: 'biography',
  мистика: 'mystic',
  спорт: 'sport',
  короткометражка: 'short',
  'чёрная комедия': 'comedy',
};

/**
 * Маппинг русских месяцев для парсинга даты «Премьера в мире».
 */
const MONTH_MAP = {
  января: '01',
  февраля: '02',
  марта: '03',
  апреля: '04',
  мая: '05',
  июня: '06',
  июля: '07',
  августа: '08',
  сентября: '09',
  октября: '10',
  ноября: '11',
  декабря: '12',
};

/**
 * Декодирует HTML-сущности (&apos; &#039; &amp; и т.д.) в обычный текст.
 */
function decodeHtmlEntities(str) {
  if (!str) return str;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

// ─── Основная точка входа ────────────────────────────────────────────

function extractMovieData() {
  const url = window.location.href;

  // Проверяем, что мы на Кинопоиске
  if (!url.includes('kinopoisk.ru')) {
    console.warn('[KP → Payload] Страница не является Кинопоиском');
    return null;
  }

  // Извлекаем kinopoiskId из URL (/film/12345/ или /series/12345/)
  const kinopoiskId = extractKinopoiskIdFromUrl(url);

  // JSON-LD данные (Кинопоиск их отдаёт)
  const jsonLdData = findMovieJsonLD();
  if (jsonLdData) {
    console.log('[KP → Payload] Found JSON-LD:', jsonLdData);
    return parseJsonLd(jsonLdData, kinopoiskId);
  }

  // Фоллбэк на DOM-скрейпинг
  return extractFromDom(kinopoiskId);
}

// ─── JSON-LD ─────────────────────────────────────────────────────────

function findMovieJsonLD() {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent);
      const data = Array.isArray(json)
        ? json.find((i) => i['@type'] === 'Movie' || i['@type'] === 'TVSeries')
        : json;

      if (data && (data['@type'] === 'Movie' || data['@type'] === 'TVSeries')) {
        return data;
      }
    } catch (e) {
      console.warn('Ошибка парсинга JSON-LD:', e);
    }
  }
  return null;
}

function parseJsonLd(data, kinopoiskId) {
  // Жанры
  let genres = [];
  if (Array.isArray(data.genre)) {
    genres = data.genre
      .map((g) => GENRE_MAPPING[g.toLowerCase()] || null)
      .filter(Boolean);
  } else if (typeof data.genre === 'string') {
    const g = GENRE_MAPPING[data.genre.toLowerCase()];
    if (g) genres.push(g);
  }

  // Режиссёр
  let director = '';
  if (Array.isArray(data.director)) {
    director = data.director.map((d) => decodeHtmlEntities(d.name)).join(', ');
  } else if (data.director) {
    director = decodeHtmlEntities(data.director.name);
  }

  // Длительность (PT104M -> 104)
  let duration = null;
  if (data.duration) {
    const match = data.duration.match(/PT(\d+)M/);
    if (match) {
      duration = parseInt(match[1], 10);
    }
  }

  // Год
  let year = null;
  if (data.datePublished) {
    year = parseInt(data.datePublished.split('-')[0], 10);
  }

  // Тип контента
  let type = 'film';
  if (
    data.genre &&
    (data.genre.includes('Мультфильм') || data.genre.includes('Анимация'))
  ) {
    type = 'cartoon';
  } else if (data['@type'] === 'TVSeries') {
    type = 'series';
  }

  // Рейтинг КП (из JSON-LD)
  let rating = null;
  if (data.aggregateRating && data.aggregateRating.ratingValue) {
    rating = parseFloat(data.aggregateRating.ratingValue);
  }

  return {
    sourceUrl: window.location.href,
    kinopoiskId,
    title: decodeHtmlEntities(data.name),
    originalTitle: decodeHtmlEntities(
      data.alternativeHeadline || data.alternateName
    ),
    description: decodeHtmlEntities(data.description),
    year,
    releaseDate: extractReleaseDateFromDom() || data.datePublished,
    rating,
    tmdbRating: extractImdbRatingFromDom(),
    genres,
    director,
    duration,
    posterUrl: data.image,
    type,
  };
}

// ─── DOM-экстракторы (Кинопоиск) ────────────────────────────────────

/**
 * Извлекает kinopoiskId из URL страницы.
 * Поддерживает /film/12345/ и /series/12345/.
 */
function extractKinopoiskIdFromUrl(url) {
  const match = url.match(/kinopoisk\.ru\/(?:film|series)\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Извлекает IMDB рейтинг из DOM Кинопоиска.
 * Ищет блок film-sub-rating с текстом "IMDb".
 */
function extractImdbRatingFromDom() {
  const subRatings = document.querySelectorAll('.film-sub-rating');
  for (const block of subRatings) {
    const text = block.textContent || '';
    if (text.includes('IMDb')) {
      const match = text.match(/(\d+[.,]\d+)/);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }
  }
  return null;
}

/**
 * Извлекает дату «Премьера в мире» из DOM Кинопоиска.
 * Парсит формат «23 сентября 2011» → «2011-09-23».
 */
function extractReleaseDateFromDom() {
  const rows = document.querySelectorAll('[data-tid]');
  for (const row of rows) {
    const titleEl = row.querySelector('[class*="title"]');
    if (!titleEl) continue;

    const label = titleEl.textContent?.trim() || '';
    if (!label.includes('Премьера в мире')) continue;

    const valueLink = row.querySelector('a[href*="/dates/"]');
    if (valueLink) {
      const dateText = valueLink.textContent.trim();
      return parseRussianDate(dateText);
    }
  }
  return null;
}

/**
 * Парсит дату в формате «23 сентября 2011» → «2011-09-23».
 */
function parseRussianDate(dateStr) {
  const match = dateStr.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const month = MONTH_MAP[match[2].toLowerCase()];
  const year = match[3];

  if (!month) return null;
  return `${year}-${month}-${day}`;
}

// ─── DOM Fallback (без JSON-LD) ─────────────────────────────────────

function extractFromDom(kinopoiskId) {
  // Название
  const titleEl =
    document.querySelector('[data-tid] h1') ||
    document.querySelector('h1[itemprop="name"]');

  // Оригинальное название
  const originalTitleEl =
    document.querySelector('[data-tid] span[class*="originalTitle"]') ||
    document.querySelector('span[itemprop="alternativeHeadline"]');

  // Год
  const yearEl = document.querySelector('a[href*="/lists/navigator/"]');

  // Рейтинг КП
  const ratingEl = document.querySelector(
    '[class*="film-rating-value"], [data-tid] span[class*="ratingValue"]'
  );

  // Описание
  const descriptionEl = document.querySelector(
    '[data-tid] p[class*="synopsis"], [itemprop="description"]'
  );

  const title = titleEl ? titleEl.textContent.trim() : '';
  const originalTitle = originalTitleEl
    ? originalTitleEl.textContent.trim()
    : '';
  const yearRaw = yearEl ? yearEl.textContent.trim() : '';
  const year = parseInt(yearRaw.replace(/\D/g, ''), 10) || null;
  const ratingRaw = ratingEl ? ratingEl.textContent.trim() : '';
  const rating = parseFloat(ratingRaw.replace(',', '.')) || null;
  const description = descriptionEl ? descriptionEl.textContent.trim() : '';

  if (!title) {
    console.warn('[KP → Payload] Не удалось найти заголовок фильма');
    return null;
  }

  return {
    sourceUrl: window.location.href,
    kinopoiskId,
    title,
    originalTitle,
    year,
    rating,
    tmdbRating: extractImdbRatingFromDom(),
    releaseDate: extractReleaseDateFromDom(),
    description,
  };
}
