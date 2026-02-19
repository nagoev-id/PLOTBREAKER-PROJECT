document.addEventListener('DOMContentLoaded', async () => {
  // === DOM References ===
  const statusEl = document.getElementById('status');
  const loadingEl = document.getElementById('loading');
  const contentEl = document.getElementById('content');
  const saveBtn = document.getElementById('saveBtn');
  const openTabBtn = document.getElementById('openTabBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const recordLinks = document.getElementById('recordLinks');
  const linkSite = document.getElementById('linkSite');
  const linkAdmin = document.getElementById('linkAdmin');

  // Form inputs
  const posterUrlInput = document.getElementById('posterUrl');
  const posterPreview = document.getElementById('posterPreview');
  const typeInput = document.getElementById('type');
  const statusSelect = document.getElementById('statusSelect');
  const titleInput = document.getElementById('title');
  const originalTitleInput = document.getElementById('originalTitle');
  const yearInput = document.getElementById('year');
  const ratingInput = document.getElementById('rating');
  const durationInput = document.getElementById('duration');
  const directorInput = document.getElementById('director');
  const genresInput = document.getElementById('genres');
  const descriptionInput = document.getElementById('description');
  const releaseDateInput = document.getElementById('releaseDate');
  const kinopoiskIdInput = document.getElementById('kinopoiskId');
  const personalOpinionInput = document.getElementById('personalOpinion');
  const tmdbRatingInput = document.getElementById('tmdbRating');
  const watchDateInput = document.getElementById('watchDate');
  const watchYearInput = document.getElementById('watchYear');
  const collectionsSelect = document.getElementById('collections');
  const reviewInput = document.getElementById('review');

  // Hidden inputs
  const sourceUrlInput = document.getElementById('sourceUrl');

  // ID существующей записи (null = создание, число = обновление)
  let existingRecordId = null;

  // === Detect tab mode ===
  const isTabMode = new URLSearchParams(window.location.search).has('tab');

  if (isTabMode) {
    document.body.classList.add('tab-mode');
    openTabBtn.style.display = 'none';
  }

  // === Utility Functions ===

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

  /**
   * Заполняет форму данными (из скрейпинга или из существующей записи).
   */
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
    }

    typeInput.value = data.type || 'film';
    durationInput.value = data.duration || '';
    directorInput.value = data.director || '';
    genresInput.value = Array.isArray(data.genres)
      ? data.genres.join(', ')
      : '';

    sourceUrlInput.value = data.sourceUrl || '';

    // Release date — YYYY-MM-DD only
    if (data.releaseDate && data.releaseDate.length >= 10) {
      releaseDateInput.value = data.releaseDate.substring(0, 10);
    } else {
      releaseDateInput.value = '';
    }

    if (data.kinopoiskId) {
      kinopoiskIdInput.value = data.kinopoiskId;
    }

    // Поля, которые могут быть в существующей записи
    statusSelect.value = data.status || 'planned';
    personalOpinionInput.value = data.personalOpinion || 'neutral';
    tmdbRatingInput.value = data.tmdbRating || '';
    watchYearInput.value = data.watchYear || '';

    if (data.watchDate && data.watchDate.length >= 10) {
      watchDateInput.value = data.watchDate.substring(0, 10);
    } else {
      watchDateInput.value = '';
    }
  }

  /**
   * Собирает данные из формы в объект для отправки.
   */
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
      releaseDate: releaseDateInput.value,
      personalOpinion: personalOpinionInput.value,
      tmdbRating: parseFloat(tmdbRatingInput.value) || null,
      watchDate: watchDateInput.value || null,
      watchYear: parseInt(watchYearInput.value) || null,
      collections: Array.from(collectionsSelect.selectedOptions).map((opt) =>
        parseInt(opt.value, 10)
      ),
      review: reviewInput.value || null,
    };
  }

  /**
   * Проверяет, есть ли уже запись в Payload с таким title/originalTitle.
   * Если есть — подгружает данные и переключает кнопку на «Обновить».
   */
  async function checkExisting(title, originalTitle, kinopoiskId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'CHECK_EXISTING',
          payload: { title, originalTitle, kinopoiskId },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error checking existing:', chrome.runtime.lastError);
            resolve(null);
            return;
          }
          if (response && response.success && response.existing) {
            resolve(response.existing);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Обновляет UI для режима «обновление существующей записи».
   */
  function switchToUpdateMode(record) {
    existingRecordId = record.id;
    saveBtn.textContent = 'Обновить';
    saveBtn.style.backgroundColor = '#4f46e5';
    deleteBtn.classList.remove('hidden');

    // Показать ссылки на запись
    if (record.slug) {
      linkSite.href = `http://localhost:3000/reviews/${record.slug}`;
      linkAdmin.href = `http://localhost:3000/admin/collections/media-contents/${record.id}`;
      recordLinks.classList.remove('hidden');
    }

    showStatus(
      `Запись уже существует (ID: ${record.id}). Данные подгружены.`,
      'success'
    );
  }

  // === Event Listeners ===

  // Poster preview
  posterUrlInput.addEventListener('input', () => {
    if (posterUrlInput.value) {
      posterPreview.src = posterUrlInput.value;
      posterPreview.style.display = 'block';
    } else {
      posterPreview.style.display = 'none';
    }
  });

  // Auto-fill Watch Year from Watch Date
  watchDateInput.addEventListener('change', () => {
    if (watchDateInput.value) {
      const date = new Date(watchDateInput.value);
      if (!isNaN(date.getFullYear())) {
        watchYearInput.value = date.getFullYear();
      }
    }
  });

  // Copy AI Prompt
  copyPromptBtn.addEventListener('click', () => {
    const title = titleInput.value || 'Название';
    const originalTitle = originalTitleInput.value || '';
    const year = releaseDateInput.value
      ? releaseDateInput.value.split('-')[0]
      : watchYearInput.value || '';

    const promptText = generatePrompt(
      title,
      originalTitle,
      year,
      typeInput.value
    );

    navigator.clipboard.writeText(promptText).then(() => {
      const originalText = copyPromptBtn.textContent;
      copyPromptBtn.textContent = 'Скопировано!';
      copyPromptBtn.classList.remove('btn-secondary');
      copyPromptBtn.style.backgroundColor = '#22c55e';

      setTimeout(() => {
        copyPromptBtn.textContent = originalText;
        copyPromptBtn.style.backgroundColor = '';
        copyPromptBtn.classList.add('btn-secondary');
      }, 2000);
    });
  });

  // Open in Tab
  openTabBtn.addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = activeTab?.id;

    if (tabId) {
      await chrome.storage.session.set({ scrapeTabId: tabId });
    }

    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html?tab=1'),
    });

    window.close();
  });

  // Delete Handler
  deleteBtn.addEventListener('click', () => {
    if (!existingRecordId) return;

    const title = titleInput.value || 'эту запись';
    if (!confirm(`Удалить "${title}" из Payload CMS?`)) return;

    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Удаление...';
    clearStatus();

    chrome.runtime.sendMessage(
      { type: 'DELETE_MOVIE', payload: { id: existingRecordId } },
      (response) => {
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Удалить запись';

        if (chrome.runtime.lastError) {
          showStatus('Ошибка: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response && response.success) {
          showStatus('Запись удалена!', 'success');
          existingRecordId = null;
          saveBtn.textContent = 'Сохранить';
          saveBtn.style.backgroundColor = '';
          deleteBtn.classList.add('hidden');
          recordLinks.classList.add('hidden');
        } else {
          const err =
            response && response.error ? response.error : 'Неизвестная ошибка';
          showStatus('Ошибка удаления: ' + err, 'error');
        }
      }
    );
  });

  // Save / Update Handler
  saveBtn.addEventListener('click', () => {
    saveBtn.disabled = true;
    const isUpdate = existingRecordId !== null;
    saveBtn.textContent = isUpdate ? 'Обновление...' : 'Сохранение...';
    clearStatus();

    const movieData = collectFormData();

    const messageType = isUpdate ? 'UPDATE_MOVIE' : 'SAVE_MOVIE';
    const payload = isUpdate
      ? { id: existingRecordId, data: movieData }
      : movieData;

    chrome.runtime.sendMessage({ type: messageType, payload }, (response) => {
      saveBtn.disabled = false;
      saveBtn.textContent = isUpdate ? 'Обновить' : 'Сохранить';

      if (chrome.runtime.lastError) {
        showStatus(
          'Ошибка отправки: ' + chrome.runtime.lastError.message,
          'error'
        );
        return;
      }

      if (response && response.success) {
        const verb = isUpdate ? 'обновлено' : 'сохранено';
        showStatus(`Успешно ${verb}!`, 'success');
      } else {
        const err =
          response && response.error ? response.error : 'Неизвестная ошибка';
        showStatus('Ошибка сохранения: ' + err, 'error');
      }
    });
  });

  // === Data Loading ===

  /**
   * Загружает данные из content script нужной вкладки.
   * После загрузки проверяет, есть ли запись в Payload.
   */
  async function loadData() {
    let targetTabId;

    if (isTabMode) {
      const stored = await chrome.storage.session.get('scrapeTabId');
      targetTabId = stored.scrapeTabId;

      if (!targetTabId) {
        loadingEl.style.display = 'none';
        showStatus(
          'Не найдена вкладка для скрейпинга. Откройте расширение через popup.',
          'error'
        );
        return;
      }
    } else {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab) {
        loadingEl.style.display = 'none';
        showStatus('Не удалось получить доступ к вкладке', 'error');
        return;
      }
      targetTabId = tab.id;
    }

    chrome.tabs.sendMessage(
      targetTabId,
      { type: 'SCRAPE_DATA' },
      async (response) => {
        loadingEl.style.display = 'none';

        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          showStatus(
            'Ошибка: перезагрузите страницу или убедитесь, что это Кинопоиск',
            'error'
          );
          return;
        }

        if (!response || !response.payload) {
          showStatus(
            'Не удалось извлечь данные. Это точно страница фильма?',
            'error'
          );
          return;
        }

        const scrapedData = response.payload;
        console.log('[Popup] Scraped data:', scrapedData);

        // Проверяем, есть ли уже такая запись в Payload
        const existing = await checkExisting(
          scrapedData.title,
          scrapedData.originalTitle,
          scrapedData.kinopoiskId
        );

        if (existing) {
          // Запись уже есть — подгружаем данные из Payload
          console.log('[Popup] Existing record found:', existing);
          populateForm(existing);
          switchToUpdateMode(existing);
        } else {
          // Новая запись — заполняем данными со скрейпинга
          populateForm(scrapedData);
        }

        contentEl.classList.remove('hidden');
        populateCollections(existing);
      }
    );
  }

  /**
   * Загружает список коллекций и выделяет уже выбранные (если запись существует).
   */
  function populateCollections(existingRecord) {
    chrome.runtime.sendMessage({ type: 'GET_COLLECTIONS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching collections:', chrome.runtime.lastError);
        return;
      }
      if (response && response.success && Array.isArray(response.data)) {
        collectionsSelect.innerHTML = '';

        // IDs коллекций, которые уже были привязаны
        const selectedIds = new Set();
        if (existingRecord && Array.isArray(existingRecord.collections)) {
          existingRecord.collections.forEach((col) => {
            const id = typeof col === 'object' ? col.id : col;
            selectedIds.add(Number(id));
          });
        }

        response.data.forEach((col) => {
          const option = document.createElement('option');
          option.value = col.id;
          option.textContent =
            col.title || col.name || col.slug || `ID: ${col.id}`;
          if (selectedIds.has(Number(col.id))) {
            option.selected = true;
          }
          collectionsSelect.appendChild(option);
        });
      }
    });
  }

  // Start
  await loadData();
});
