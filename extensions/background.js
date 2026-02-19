// === Настройки ===
const PAYLOAD_BASE_URL = 'http://localhost:3000';
const PAYLOAD_COLLECTION_SLUG = 'media-contents';
const PAYLOAD_AUTH_HEADER =
  'users API-Key 694062b0-a277-45ac-b53e-f0adc1679ac4';

// === Обработка сообщений ===

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_MOVIE') {
    const movieData = message.payload;
    console.log('[KP → Payload] Получены данные фильма:', movieData);

    createMovieInPayload(movieData)
      .then((res) => {
        console.log('[KP → Payload] Документ создан:', res);
        sendResponse({ success: true, result: res });
      })
      .catch((err) => {
        console.error('[KP → Payload] Ошибка:', err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true;
  }

  if (message.type === 'UPDATE_MOVIE') {
    const { id, data } = message.payload;
    console.log(`[KP → Payload] Обновление документа ${id}:`, data);

    updateMovieInPayload(id, data)
      .then((res) => {
        console.log('[KP → Payload] Документ обновлён:', res);
        sendResponse({ success: true, result: res });
      })
      .catch((err) => {
        console.error('[KP → Payload] Ошибка обновления:', err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true;
  }

  if (message.type === 'DELETE_MOVIE') {
    const { id } = message.payload;
    console.log(`[KP → Payload] Удаление документа ${id}`);

    deleteMovieInPayload(id)
      .then((res) => {
        console.log('[KP → Payload] Документ удалён:', res);
        sendResponse({ success: true, result: res });
      })
      .catch((err) => {
        console.error('[KP → Payload] Ошибка удаления:', err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true;
  }

  if (message.type === 'CHECK_EXISTING') {
    const { title, originalTitle, kinopoiskId } = message.payload;

    findExistingMovie(title, originalTitle, kinopoiskId)
      .then((existing) => sendResponse({ success: true, existing }))
      .catch((err) => {
        console.error('Error checking existing:', err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true;
  }

  if (message.type === 'GET_COLLECTIONS') {
    getCollections()
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => {
        console.error('Error fetching collections:', err);
        sendResponse({ success: false, error: err.toString() });
      });
    return true;
  }
});

// === API Functions ===

async function getCollections() {
  const url = `${PAYLOAD_BASE_URL}/api/collections?limit=100`;
  const res = await fetch(url, {
    headers: { Authorization: PAYLOAD_AUTH_HEADER },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch collections: ${res.statusText}`);
  }

  const json = await res.json();
  return json.docs;
}

/**
 * Ищет существующую запись по kinopoiskId, slug, title или originalTitle.
 * Приоритет: kinopoiskId > slug > title/originalTitle.
 */
async function findExistingMovie(title, originalTitle, kinopoiskId) {
  // Сначала ищем по kinopoiskId (самый надёжный идентификатор)
  if (kinopoiskId) {
    const byKpId = await queryPayload(
      `where[kinopoiskId][equals]=${encodeURIComponent(kinopoiskId)}`
    );
    if (byKpId) return byKpId;

    // Также проверяем по slug (slug = kinopoiskId)
    const bySlug = await queryPayload(
      `where[slug][equals]=${encodeURIComponent(kinopoiskId)}`
    );
    if (bySlug) return bySlug;
  }

  // Затем ищем по title / originalTitle
  const conditions = [];
  let idx = 0;
  if (title) {
    conditions.push(
      `where[or][${idx}][title][equals]=${encodeURIComponent(title)}`
    );
    idx++;
  }
  if (originalTitle) {
    conditions.push(
      `where[or][${idx}][originalTitle][equals]=${encodeURIComponent(originalTitle)}`
    );
  }

  if (conditions.length === 0) return null;
  return queryPayload(conditions.join('&'));
}

/**
 * Выполняет запрос к Payload API с where-условием.
 */
async function queryPayload(whereQuery) {
  const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}?${whereQuery}&limit=1`;

  const res = await fetch(url, {
    headers: { Authorization: PAYLOAD_AUTH_HEADER },
  });

  if (!res.ok) {
    throw new Error(`Payload response ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.docs && json.docs.length > 0 ? json.docs[0] : null;
}

/**
 * Удаляет документ из Payload CMS.
 */
async function deleteMovieInPayload(id) {
  const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: PAYLOAD_AUTH_HEADER },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Payload response ${res.status} ${res.statusText}: ${text}`
    );
  }

  return await res.json();
}

/**
 * Обновляет существующий документ в Payload CMS.
 */
async function updateMovieInPayload(id, movieData) {
  const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}/${id}`;
  const body = buildPayloadBody(movieData);

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: PAYLOAD_AUTH_HEADER,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Payload response ${res.status} ${res.statusText}: ${text}`
    );
  }

  return await res.json();
}

/**
 * Создаёт документ в Payload CMS.
 */
async function createMovieInPayload(movieData) {
  const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}`;
  const body = buildPayloadBody(movieData);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: PAYLOAD_AUTH_HEADER,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Payload response ${res.status} ${res.statusText}: ${text}`
    );
  }

  return await res.json();
}

/**
 * Очищает HTML-сущности (&apos; &#039; и т.д.) из строки.
 */
function cleanHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&apos;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Формирует тело запроса для Payload CMS из данных формы.
 * Slug = kinopoiskId (если есть), иначе генерируется Payload автоматически из originalTitle.
 */
function buildPayloadBody(movieData) {
  const title = cleanHtmlEntities(movieData.title);
  const originalTitle = cleanHtmlEntities(movieData.originalTitle);

  // Slug: kinopoiskId если есть, иначе Payload сгенерирует сам
  const slug = movieData.kinopoiskId || undefined;

  const body = {
    title,
    originalTitle,
    synopsis: cleanHtmlEntities(movieData.description),

    releaseDate:
      movieData.releaseDate && movieData.releaseDate.includes('-')
        ? movieData.releaseDate
        : null,
    releaseYear: movieData.year,
    watchDate:
      movieData.watchDate && movieData.watchDate.includes('-')
        ? movieData.watchDate
        : null,
    watchYear: movieData.watchYear,

    genres: movieData.genres,
    director: cleanHtmlEntities(movieData.director),
    duration: movieData.duration,
    posterUrl: movieData.posterUrl,
    kinopoiskId: movieData.kinopoiskId,
    type: movieData.type || 'film',
    status: movieData.status || 'planned',
    personalOpinion: movieData.personalOpinion || 'neutral',

    kpRating: movieData.rating,
    tmdbRating: movieData.tmdbRating,

    review: movieData.review
      ? {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: movieData.review,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        }
      : null,

    collections: movieData.collections
      ? movieData.collections
          .map((id) => parseInt(id, 10))
          .filter((n) => !isNaN(n))
      : [],

    sourceUrl: movieData.sourceUrl,
  };

  // Добавляем slug только если указан (чтобы не перетирать автогенерацию)
  if (slug) {
    body.slug = slug;
  }

  return body;
}
