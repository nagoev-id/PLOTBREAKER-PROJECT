// ==UserScript==
// @name         Кинопоиск → ПРОСМОТРЕНО (Userscript UI)
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Парсит страницу фильма на Кинопоиске, показывает ПУ (UI) и отправляет данные в ПРОСМОТРЕНО по API.
// @author       nam
// @match        *://www.kinopoisk.ru/*
// @match        *://m.kinopoisk.ru/*
// @grant        GM_xmlhttpRequest
// @connect      plotbreakers.vercel.app
// ==/UserScript==

(function () {
  'use strict';

  // === Настройки API ===
  const PAYLOAD_BASE_URL = 'https://plotbreakers.vercel.app';
  const PAYLOAD_COLLECTION_SLUG = 'media-contents';
  const PAYLOAD_AUTH_HEADER =
    'users API-Key 694062b0-a277-45ac-b53e-f0adc1679ac4';

  if (
    !window.location.href.includes('/film/') &&
    !window.location.href.includes('/series/')
  ) {
    return;
  }

  // === INJECT SHADOW DOM ===
  const host = document.createElement('div');
  host.id = 'watched-tracker-host';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host {
      --bg-color: #1a1a1a;
      --text-color: #ffffff;
      --accent-color: #ff4d4f;
      --secondary-bg: #2a2a2a;
      --input-bg: #333;
      --border-color: #444;
      --border-radius: 6px;
      --prompt-btn-color: #4f46e5;
    }

    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    /* Floating Trigger Button */
    .trigger-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #f97316;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 999999;
      transition: all 0.2s ease-in-out;
    }
    .trigger-btn:hover { background-color: #ea580c; transform: translateY(-2px); }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 1000000;
      display: flex;
      justify-content: flex-end;
    }
    .hidden { display: none !important; }

    /* Modal Panel (Slide from right) */
    .modal-content {
      background-color: var(--bg-color);
      color: var(--text-color);
      width: 450px;
      max-width: 100vw;
      height: 100vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: -4px 0 15px rgba(0,0,0,0.5);
      font-size: 13px;
      display: flex;
      flex-direction: column;
    }

    .modal-content::-webkit-scrollbar { width: 8px; }
    .modal-content::-webkit-scrollbar-track { background: var(--bg-color); }
    .modal-content::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    .modal-content::-webkit-scrollbar-thumb:hover { background: #666; }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-row h1 { font-size: 18px; margin: 0; color: var(--accent-color); }
    .close-btn { background: none; border: none; color: #aaa; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
    .close-btn:hover { color: #fff; }

    /* Forms */
    .form-group { margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; color: #aaa; font-size: 11px; font-weight: 500; }
    input, select, textarea {
      width: 100%; padding: 8px; background-color: var(--input-bg);
      border: 1px solid var(--border-color); border-radius: var(--border-radius);
      color: var(--text-color); font-size: 13px;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent-color); }
    textarea { resize: vertical; min-height: 60px; }
    
    .row { display: flex; gap: 10px; }
    .col { flex: 1; }
    
    img#posterPreview { width: 100%; max-height: 200px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 10px; display: none; }
    
    .separator { border: 0; border-top: 1px solid var(--border-color); margin: 16px 0; }
    
    button.action-btn {
      width: 100%; padding: 10px; border: none; border-radius: var(--border-radius);
      background-color: var(--accent-color); color: white; font-size: 14px; font-weight: bold;
      cursor: pointer; margin-top: 10px; transition: opacity 0.2s;
    }
    button.action-btn:hover { opacity: 0.9; }
    button.action-btn:disabled { background-color: #555; cursor: not-allowed; }
    
    .btn-secondary { background-color: var(--prompt-btn-color); }
    .btn-danger { background-color: #dc2626; }
    
    .link-buttons { display: flex; gap: 8px; margin-top: 10px; }
    .btn-link {
      flex: 1; display: block; text-align: center; padding: 8px;
      border: 1px solid var(--border-color); border-radius: var(--border-radius); color: #aaa;
      text-decoration: none; font-size: 12px; transition: color 0.2s, border-color 0.2s;
    }
    .btn-link:hover { color: var(--text-color); border-color: var(--text-color); }

    .status { padding: 8px; border-radius: var(--border-radius); margin-bottom: 12px; text-align: center; display: none; }
    .status.error { background-color: #ffccc7; color: #780650; display: block; }
    .status.success { background-color: #b7eb8f; color: #135200; display: block; }
    .status.info { background-color: #e6f7ff; color: #0050b3; display: block; }
  `;

  const container = document.createElement('div');
  container.innerHTML = `
    <button id="mainTriggerBtn" class="trigger-btn">➕ В ПРОСМОТРЕНО</button>

    <div id="modalOverlay" class="modal-overlay hidden">
      <div class="modal-content">
        <div class="header-row">
          <h1>Kinopoisk → Payload</h1>
          <button id="closeModalBtn" class="close-btn">&times;</button>
        </div>

        <div id="status" class="status"></div>
        <div id="loading" class="status info" style="display: block;">Загрузка данных...</div>

        <div id="formContent" class="hidden">
          <img id="posterPreview" src="" alt="Poster Preview" />
          <div class="form-group">
            <label>URL постера</label>
            <input type="text" id="posterUrl" />
          </div>

          <div class="row">
            <div class="col form-group">
              <label>Тип</label>
              <select id="type">
                <option value="film">Фильм</option>
                <option value="series">Сериал</option>
                <option value="cartoon">Мультфильм</option>
              </select>
            </div>
            <div class="col form-group">
              <label>Статус</label>
              <select id="statusSelect">
                <option value="planned">Планирую</option>
                <option value="watching">Смотрю</option>
                <option value="watched">Просмотрено</option>
                <option value="abandoned">Заброшено</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Название (RU)</label>
            <input type="text" id="title" />
          </div>
          <div class="form-group">
            <label>Оригинальное название</label>
            <input type="text" id="originalTitle" />
          </div>

          <div class="row">
            <div class="col form-group">
              <label>Год</label>
              <input type="number" id="year" />
            </div>
            <div class="col form-group">
              <label>Рейтинг (KP)</label>
              <input type="number" step="0.1" id="rating" />
            </div>
          </div>

          <div class="row">
            <div class="col form-group">
              <label>Длительность (мин)</label>
              <input type="number" id="duration" />
            </div>
            <div class="col form-group">
              <label>Режиссёр</label>
              <input type="text" id="director" />
            </div>
          </div>

          <div class="form-group">
            <label>Жанры (English codes, comma separated)</label>
            <input type="text" id="genres" />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea id="description"></textarea>
          </div>

          <div class="row">
            <div class="col form-group">
              <label>Дата выхода</label>
              <input type="date" id="releaseDate" />
            </div>
            <div class="col form-group">
              <label>ID Кинопоиск</label>
              <input type="text" id="kinopoiskId" placeholder="Напр. 526" />
            </div>
          </div>

          <hr class="separator" />

          <div class="form-group">
            <label>Впечатление</label>
            <select id="personalOpinion">
              <option value="neutral">Пойдет (5-6)</option>
              <option value="like">Понравилось (7-10)</option>
              <option value="dislike">Потрачено (1-4)</option>
            </select>
          </div>

          <div class="row">
            <div class="col form-group">
              <label>Рейтинг TMDB</label>
              <input type="number" step="0.01" id="tmdbRating" />
            </div>
            <div class="col form-group">
              <label>Год просмотра</label>
              <input type="number" id="watchYear" />
            </div>
          </div>

          <div class="form-group">
            <label>Дата просмотра</label>
            <input type="date" id="watchDate" />
          </div>

          <div class="form-group">
            <label>Входит в коллекции</label>
            <select id="collections"></select>
          </div>

          <button id="copyPromptBtn" class="action-btn btn-secondary" type="button">Скопировать промт для AI</button>

          <div class="form-group">
            <label>Мой отзыв</label>
            <textarea id="review" style="min-height: 100px"></textarea>
          </div>

          <input type="hidden" id="sourceUrl" />

          <button id="saveBtn" class="action-btn">Сохранить</button>
          <button id="deleteBtn" class="action-btn btn-danger hidden" type="button">Удалить запись</button>

          <div id="recordLinks" class="link-buttons hidden">
            <a id="linkSite" class="btn-link" href="#" target="_blank">Открыть на сайте</a>
            <a id="linkAdmin" class="btn-link" href="#" target="_blank">Открыть в админке</a>
          </div>
        </div>

      </div>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  // === Elements ===
  const $ = (id) => shadow.getElementById(id);

  const mainTriggerBtn = $('mainTriggerBtn');
  const modalOverlay = $('modalOverlay');
  const closeModalBtn = $('closeModalBtn');

  const statusEl = $('status');
  const loadingEl = $('loading');
  const formContent = $('formContent');

  const posterUrlInput = $('posterUrl');
  const posterPreview = $('posterPreview');
  const typeInput = $('type');
  const statusSelect = $('statusSelect');
  const titleInput = $('title');
  const originalTitleInput = $('originalTitle');
  const yearInput = $('year');
  const ratingInput = $('rating');
  const durationInput = $('duration');
  const directorInput = $('director');
  const genresInput = $('genres');
  const descriptionInput = $('description');
  const releaseDateInput = $('releaseDate');
  const kinopoiskIdInput = $('kinopoiskId');
  const personalOpinionInput = $('personalOpinion');
  const tmdbRatingInput = $('tmdbRating');
  const watchDateInput = $('watchDate');
  const watchYearInput = $('watchYear');
  const collectionsSelect = $('collections');
  const reviewInput = $('review');
  const sourceUrlInput = $('sourceUrl');

  const saveBtn = $('saveBtn');
  const deleteBtn = $('deleteBtn');
  const copyPromptBtn = $('copyPromptBtn');
  const recordLinks = $('recordLinks');
  const linkSite = $('linkSite');
  const linkAdmin = $('linkAdmin');

  let existingRecordId = null;

  // === State UI ===
  function showStatus(msg, type = 'info') {
    statusEl.textContent = msg;
    statusEl.className = 'status ' + type;
    statusEl.style.display = 'block';
  }
  function clearStatus() {
    statusEl.style.display = 'none';
    statusEl.className = 'status';
    statusEl.textContent = '';
  }

  // === Event Listeners for UI ===
  mainTriggerBtn.addEventListener('click', openModalAndLoadContent);
  closeModalBtn.addEventListener('click', () =>
    modalOverlay.classList.add('hidden')
  );
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
  });

  posterUrlInput.addEventListener('input', () => {
    if (posterUrlInput.value) {
      posterPreview.src = posterUrlInput.value;
      posterPreview.style.display = 'block';
    } else {
      posterPreview.style.display = 'none';
    }
  });

  watchDateInput.addEventListener('change', () => {
    if (watchDateInput.value) {
      const date = new Date(watchDateInput.value);
      if (!isNaN(date.getFullYear())) watchYearInput.value = date.getFullYear();
    }
  });

  copyPromptBtn.addEventListener('click', () => {
    const promptText = generatePrompt(
      titleInput.value || 'Название',
      originalTitleInput.value || '',
      releaseDateInput.value
        ? releaseDateInput.value.split('-')[0]
        : watchYearInput.value || '',
      typeInput.value
    );

    navigator.clipboard.writeText(promptText).then(() => {
      const originalText = copyPromptBtn.textContent;
      copyPromptBtn.textContent = 'Скопировано!';
      copyPromptBtn.style.backgroundColor = '#22c55e';
      setTimeout(() => {
        copyPromptBtn.textContent = originalText;
        copyPromptBtn.style.backgroundColor = '';
      }, 2000);
    });
  });

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    const isUpdate = existingRecordId !== null;
    saveBtn.textContent = isUpdate ? 'Обновление...' : 'Сохранение...';
    clearStatus();

    const movieData = collectFormData();

    try {
      if (isUpdate) {
        await updateMovieInPayload(existingRecordId, movieData);
        showStatus('Успешно обновлено!', 'success');
      } else {
        const res = await createMovieInPayload(movieData);
        switchToUpdateMode(res.doc);
        showStatus('Успешно сохранено!', 'success');
      }
    } catch (err) {
      showStatus('Ошибка: ' + err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = existingRecordId ? 'Обновить' : 'Сохранить';
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!existingRecordId) return;
    if (deleteBtn.dataset.confirm !== 'true') {
      deleteBtn.dataset.confirm = 'true';
      deleteBtn.textContent = 'Точно удалить?';
      deleteBtn.style.backgroundColor = '#991b1b';
      setTimeout(() => {
        deleteBtn.dataset.confirm = 'false';
        deleteBtn.textContent = 'Удалить запись';
        deleteBtn.style.backgroundColor = '';
      }, 3000);
      return;
    }

    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Удаление...';
    clearStatus();

    try {
      await deleteMovieInPayload(existingRecordId);
      showStatus('Запись удалена!', 'success');
      existingRecordId = null;
      saveBtn.textContent = 'Сохранить';
      saveBtn.style.backgroundColor = '';
      deleteBtn.classList.add('hidden');
      recordLinks.classList.add('hidden');
    } catch (err) {
      showStatus('Ошибка удаления: ' + err.message, 'error');
    } finally {
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Удалить запись';
      deleteBtn.dataset.confirm = 'false';
      deleteBtn.style.backgroundColor = '';
    }
  });

  // === Core Logic ===
  async function openModalAndLoadContent() {
    modalOverlay.classList.remove('hidden');
    formContent.classList.add('hidden');
    loadingEl.style.display = 'block';
    clearStatus();

    try {
      // 1. Scrape
      const scrapedData = extractMovieData();
      if (!scrapedData)
        throw new Error('Не удалось спарсить данные с Кинопоиска');

      // 2. Check existing
      const existing = await findExistingMovie(
        scrapedData.title,
        scrapedData.originalTitle,
        scrapedData.kinopoiskId
      );

      // 3. Populate
      if (existing) {
        populateForm({ ...scrapedData, ...existing });
        switchToUpdateMode(existing);
      } else {
        existingRecordId = null;
        saveBtn.textContent = 'Сохранить';
        saveBtn.style.backgroundColor = '';
        deleteBtn.classList.add('hidden');
        recordLinks.classList.add('hidden');
        populateForm(scrapedData);
      }

      // 4. Load Collections
      await loadCollections(existing);

      loadingEl.style.display = 'none';
      formContent.classList.remove('hidden');
    } catch (err) {
      loadingEl.style.display = 'none';
      showStatus(err.message, 'error');
    }
  }

  function populateForm(data) {
    titleInput.value = data.title || '';
    originalTitleInput.value = data.originalTitle || '';
    yearInput.value = data.year || data.releaseYear || '';
    ratingInput.value = data.rating || data.kpRating || '';
    descriptionInput.value = data.description || data.synopsis || '';
    posterUrlInput.value = data.posterUrl || '';
    if (data.posterUrl) {
      posterPreview.src = data.posterUrl;
      posterPreview.style.display = 'block';
    } else {
      posterPreview.style.display = 'none';
    }
    typeInput.value = data.type || 'film';
    durationInput.value = data.duration || '';
    directorInput.value = data.director || '';
    genresInput.value = Array.isArray(data.genres)
      ? data.genres.join(', ')
      : '';
    sourceUrlInput.value = data.sourceUrl || '';
    if (data.releaseDate && data.releaseDate.length >= 10)
      releaseDateInput.value = data.releaseDate.substring(0, 10);
    if (data.kinopoiskId) kinopoiskIdInput.value = data.kinopoiskId;
    statusSelect.value = data.status || 'planned';
    personalOpinionInput.value = data.personalOpinion || 'neutral';
    tmdbRatingInput.value = data.tmdbRating || '';
    watchYearInput.value = data.watchYear || '';
    if (data.watchDate && data.watchDate.length >= 10)
      watchDateInput.value = data.watchDate.substring(0, 10);

    if (data.review && data.review.root?.children?.[0]?.children?.[0]?.text) {
      reviewInput.value = data.review.root.children[0].children[0].text;
    } else {
      reviewInput.value = '';
    }
  }

  function collectFormData() {
    return {
      title: titleInput.value,
      originalTitle: originalTitleInput.value,
      year: parseInt(yearInput.value) || null,
      rating: parseFloat(ratingInput.value) || null,
      description: descriptionInput.value,
      posterUrl: posterUrlInput.value,
      type: typeInput.value,
      status: statusSelect.value,
      duration: parseInt(durationInput.value) || null,
      director: directorInput.value,
      genres: genresInput.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      kinopoiskId: kinopoiskIdInput.value,
      sourceUrl: sourceUrlInput.value,
      releaseDate: releaseDateInput.value || null,
      personalOpinion: personalOpinionInput.value,
      tmdbRating: parseFloat(tmdbRatingInput.value) || null,
      watchDate: watchDateInput.value || null,
      watchYear: parseInt(watchYearInput.value) || null,
      collections: collectionsSelect.value
        ? [parseInt(collectionsSelect.value, 10)]
        : [],
      review: reviewInput.value || null,
    };
  }

  function switchToUpdateMode(record) {
    if (!record) return;
    existingRecordId = record.id;
    saveBtn.textContent = 'Обновить';
    saveBtn.style.backgroundColor = '#4f46e5';
    deleteBtn.classList.remove('hidden');

    if (record.slug) {
      // linkSite.href = `http://localhost:3000/reviews/${record.slug}`;
      // linkAdmin.href = `http://localhost:3000/admin/collections/media-contents/${record.id}`;
      linkSite.href = `https://plotbreakers.vercel.app/reviews/${record.slug}`;
      linkAdmin.href = `https://plotbreakers.vercel.app/admin/collections/media-contents/${record.id}`;
      recordLinks.classList.remove('hidden');
    }
  }

  async function loadCollections(existingRecord) {
    try {
      const data = await makeApiRequest(
        'GET',
        `${PAYLOAD_BASE_URL}/api/collections?limit=100`
      );
      collectionsSelect.innerHTML = '<option value="">Не выбрано</option>';
      let selectedId = null;
      if (
        existingRecord &&
        Array.isArray(existingRecord.collections) &&
        existingRecord.collections[0]
      ) {
        selectedId =
          typeof existingRecord.collections[0] === 'object'
            ? existingRecord.collections[0].id
            : existingRecord.collections[0];
      }

      (data.docs || []).forEach((col) => {
        const option = document.createElement('option');
        option.value = col.id;
        option.textContent =
          col.title || col.name || col.slug || `ID: ${col.id}`;
        if (selectedId && Number(col.id) === Number(selectedId))
          option.selected = true;
        collectionsSelect.appendChild(option);
      });
    } catch (e) {
      console.error('Failed to load collections', e);
    }
  }

  // === API Functions (via GM_xmlhttpRequest) ===
  function makeApiRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        method: method,
        url: url,
        headers: {
          Authorization: PAYLOAD_AUTH_HEADER,
          'Content-Type': 'application/json',
        },
        onload: function (response) {
          if (response.status >= 200 && response.status < 300) {
            resolve(JSON.parse(response.responseText));
          } else {
            console.error('[Userscript API Error]', response.responseText);
            reject(new Error(`API: ${response.statusText}`));
          }
        },
        onerror: function () {
          reject(new Error('Network Error'));
        },
      };
      if (body) options.data = JSON.stringify(body);
      GM_xmlhttpRequest(options);
    });
  }

  async function findExistingMovie(title, originalTitle, kinopoiskId) {
    try {
      if (kinopoiskId) {
        const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}?where[kinopoiskId][equals]=${kinopoiskId}&limit=1`;
        const data = await makeApiRequest('GET', url);
        if (data.docs && data.docs.length > 0) return data.docs[0];
      }
      const conditions = [];
      let idx = 0;
      if (title)
        conditions.push(
          `where[or][${idx++}][title][equals]=${encodeURIComponent(title)}`
        );
      if (originalTitle)
        conditions.push(
          `where[or][${idx}][originalTitle][equals]=${encodeURIComponent(originalTitle)}`
        );
      if (conditions.length > 0) {
        const url = `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}?${conditions.join('&')}&limit=1`;
        const data = await makeApiRequest('GET', url);
        if (data.docs && data.docs.length > 0) return data.docs[0];
      }
    } catch (e) {
      console.error('findExistingMovie error', e);
    }
    return null;
  }

  async function createMovieInPayload(movieData) {
    return await makeApiRequest(
      'POST',
      `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}`,
      buildPayloadBody(movieData)
    );
  }

  async function updateMovieInPayload(id, movieData) {
    return await makeApiRequest(
      'PATCH',
      `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}/${id}`,
      buildPayloadBody(movieData)
    );
  }

  async function deleteMovieInPayload(id) {
    return await makeApiRequest(
      'DELETE',
      `${PAYLOAD_BASE_URL}/api/${PAYLOAD_COLLECTION_SLUG}/${id}`
    );
  }

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

  function buildPayloadBody(movieData) {
    const body = {
      title: cleanHtmlEntities(movieData.title),
      originalTitle: cleanHtmlEntities(movieData.originalTitle),
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
      collections: movieData.collections
        ? movieData.collections
            .map((id) => parseInt(id, 10))
            .filter((n) => !isNaN(n))
        : [],
      sourceUrl: movieData.sourceUrl,
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
    };
    if (movieData.kinopoiskId) body.slug = String(movieData.kinopoiskId);
    return body;
  }

  // === Scraping Logic ===
  function extractMovieData() {
    const kinopoiskId = extractKinopoiskIdFromUrl(window.location.href);
    const jsonLdData = findMovieJsonLD();
    if (jsonLdData) return parseJsonLd(jsonLdData, kinopoiskId);
    return extractFromDom(kinopoiskId);
  }

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

  function decodeHtmlEntities(str) {
    if (!str) return str;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  function extractKinopoiskIdFromUrl(url) {
    const match = url.match(/kinopoisk\.ru\/(?:film|series)\/(\d+)/);
    return match ? match[1] : null;
  }

  function findMovieJsonLD() {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    for (const script of scripts) {
      try {
        const json = JSON.parse(script.textContent);
        const data = Array.isArray(json)
          ? json.find(
              (i) => i['@type'] === 'Movie' || i['@type'] === 'TVSeries'
            )
          : json;
        if (data && (data['@type'] === 'Movie' || data['@type'] === 'TVSeries'))
          return data;
      } catch (e) {}
    }
    return null;
  }

  function parseJsonLd(data, kinopoiskId) {
    let genres = [];
    if (Array.isArray(data.genre))
      genres = data.genre
        .map((g) => GENRE_MAPPING[g.toLowerCase()] || null)
        .filter(Boolean);
    else if (typeof data.genre === 'string') {
      const g = GENRE_MAPPING[data.genre.toLowerCase()];
      if (g) genres.push(g);
    }
    let director = '';
    if (Array.isArray(data.director))
      director = data.director
        .map((d) => decodeHtmlEntities(d.name))
        .join(', ');
    else if (data.director) director = decodeHtmlEntities(data.director.name);
    let duration = null;
    if (data.duration) {
      const match = data.duration.match(/PT(\d+)M/);
      if (match) duration = parseInt(match[1], 10);
    }
    if (!duration) duration = extractDurationFromDom();
    let year = null;
    if (data.datePublished)
      year = parseInt(data.datePublished.split('-')[0], 10);
    let type = 'film';
    if (
      data.genre &&
      (data.genre.includes('Мультфильм') || data.genre.includes('Анимация'))
    )
      type = 'cartoon';
    else if (data['@type'] === 'TVSeries') type = 'series';
    let rating = null;
    if (data.aggregateRating && data.aggregateRating.ratingValue)
      rating = parseFloat(data.aggregateRating.ratingValue);

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

  function extractFromDom(kinopoiskId) {
    const titleEl =
      document.querySelector('[data-tid] h1') ||
      document.querySelector('h1[itemprop="name"]');
    if (!titleEl) return null;
    const originalTitleEl =
      document.querySelector('[data-tid] span[class*="originalTitle"]') ||
      document.querySelector('span[itemprop="alternativeHeadline"]');
    const yearEl = document.querySelector('a[href*="/lists/navigator/"]');
    const ratingEl = document.querySelector(
      '[class*="film-rating-value"], [data-tid] span[class*="ratingValue"]'
    );
    const descriptionEl = document.querySelector(
      '[data-tid] p[class*="synopsis"], [itemprop="description"]'
    );

    return {
      sourceUrl: window.location.href,
      kinopoiskId,
      title: titleEl.textContent.trim(),
      originalTitle: originalTitleEl ? originalTitleEl.textContent.trim() : '',
      year: yearEl
        ? parseInt(yearEl.textContent.trim().replace(/\\D/g, ''), 10) || null
        : null,
      rating: ratingEl
        ? parseFloat(ratingEl.textContent.trim().replace(',', '.')) || null
        : null,
      tmdbRating: extractImdbRatingFromDom(),
      releaseDate: extractReleaseDateFromDom(),
      description: descriptionEl ? descriptionEl.textContent.trim() : '',
      duration: extractDurationFromDom(),
      genres: [],
      type: 'film',
    };
  }

  function extractImdbRatingFromDom() {
    for (const block of document.querySelectorAll('.film-sub-rating')) {
      const text = block.textContent || '';
      if (text.includes('IMDb')) {
        const match = text.match(/(\d+[.,]\d+)/);
        if (match) return parseFloat(match[1].replace(',', '.'));
      }
    }
    return null;
  }

  function extractReleaseDateFromDom() {
    for (const row of document.querySelectorAll('[data-tid]')) {
      const titleEl = row.querySelector('[class*="title"]');
      if (
        !titleEl ||
        !(titleEl.textContent?.trim() || '').includes('Премьера в мире')
      )
        continue;
      const valueLink = row.querySelector('a[href*="/dates/"]');
      if (valueLink) {
        const match = valueLink.textContent
          .trim()
          .match(/(\d{1,2})\s+(\\S+)\s+(\d{4})/);
        if (match && MONTH_MAP[match[2].toLowerCase()])
          return `${match[3]}-${MONTH_MAP[match[2].toLowerCase()]}-${match[1].padStart(2, '0')}`;
      }
    }
    return null;
  }

  function extractDurationFromDom() {
    const durationEl = document.querySelector('[data-test-id="duration"]');
    if (!durationEl) return null;
    let text = durationEl.textContent.trim(),
      totalMinutes = 0;
    const hoursMatch = text.match(/(\d+)\s*ч/);
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    const minutesMatch = text.match(/(\d+)\s*мин/);
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1], 10);
    return totalMinutes > 0 ? totalMinutes : null;
  }

  function generatePrompt(title, originalTitle, year, contentType) {
    const typeStr =
      contentType === 'series'
        ? 'сериала'
        : contentType === 'cartoon'
          ? 'мультфильма'
          : 'фильма';
    return `Твоя задача: создать ПОДРОБНЫЙ и РАЗВЁРНУТЫЙ пересказ ${typeStr} "${title}" (${originalTitle || ''}, ${year || ''}) со всеми спойлерами, который погрузит читателя в атмосферу и полностью раскроет все нюансы сюжета.

Структура подробного пересказа:

1. Введение в мир фильма (4-5 предложений)
   - Детально опиши сеттинг: время, место, атмосферу
   - Представь каждого ключевого персонажа с их предысторией
   - Раскрой начальную ситуацию и настроение

2. Завязка и первый акт (6-8 предложений)
   - Подробно опиши инициирующее событие
   - Как герои реагируют и какие решения принимают
   - Какие отношения складываются между персонажами
   - Что мотивирует каждого героя

3. Развитие сюжета — второй акт (10-15 предложений)
   - Детально раскрой КАЖДЫЙ важный поворот сюжета
   - Опиши ключевые сцены с эмоциональными деталями
   - Раскрой все секреты, предательства и откровения по мере их появления
   - Покажи эволюцию персонажей и их взаимоотношений
   - Включи важные диалоги и их значение
   - Опиши нарастание напряжения

4. Кульминация (5-7 предложений)
   - Детально опиши финальное противостояние или ключевой момент истины
   - Раскрой внутренние конфликты персонажей
   - Покажи, как используются все ранее установленные элементы сюжета
   - Опиши эмоциональный пик истории

5. Развитие и финал (4-6 предложений)
   - Подробно опиши судьбу КАЖДОГО важного персонажа
   - Раскрой все оставшиеся вопросы и тайны
   - Объясни символизм и смысл концовки
   - Какое послание или эмоцию оставляет фильм

6. Важные детали и нюансы (3-4 предложения)
   - Упомяни значимые визуальные метафоры или символы
   - Отметь неочевидные детали, которые обогащают понимание
   - Укажи на связи и параллели внутри сюжета

Требования к стилю:
- Язык: живой, эмоциональный, насыщенный деталями
- Тон: увлечённый рассказчик, который помнит каждую сцену
- НЕ СОКРАЩАЙ описания важных моментов
- Используй конкретные примеры сцен, а не общие фразы
- Передавай атмосферу и эмоции, а не только факты

Важно: это ПОЛНЫЙ пересказ СО ВСЕМИ спойлерами. Раскрывай абсолютно все сюжетные линии, твисты, смерти, секреты, финальные откровения и даже сцены после титров. Чем детальнее — тем лучше.

Форматирование:
- Вывод результата ответа в .md формате в виде кода
- Убери все ссылки в ответе
- Используй Markdown для заголовков (## для разделов)
- Используй **жирный** для акцентов
- Используй > для цитат
- Разделяй части горизонтальной линией (---)`;
  }
})();
