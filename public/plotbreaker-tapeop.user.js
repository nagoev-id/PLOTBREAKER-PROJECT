// ==UserScript==
// @name            Tape Operator 2.0 + Plotbreaker
// @namespace       tape-operator-plotbreaker
// @author          Kirlovon & Max Letov (modified for Plotbreaker)
// @description     All-in-one: Orange Button on KP/IMDb + Search on Player + Plotbreaker integration
// @version         3.3.5
// @icon            https://github.com/Kirlovon/Tape-Operator/raw/main/assets/favicon.png
// @run-at          document-idle
// @grant           GM.info
// @grant           GM.setValue
// @grant           GM.getValue
// @grant           GM.openInTab
// @grant           GM.deleteValue
// @grant           GM.xmlHttpRequest
// @match           *://www.kinopoisk.ru/*
// @match           *://hd.kinopoisk.ru/*
// @match           *://*.imdb.com/title/*
// @match           *://www.themoviedb.org/movie/*
// @match           *://www.themoviedb.org/tv/*
// @match           *://letterboxd.com/film/*
// @match           *://tapeop.dev/*
// @match           *://plotbreakers.vercel.app/*
// @match           *://localhost:3000/*
// @connect         api.themoviedb.org
// @connect         lingering-salad-a373.l3towm.workers.dev
// ==/UserScript==

(function () {
  'use strict';

  // --- КОНФИГУРАЦИЯ ---
  const VERSION = '3.3.5';
  const PLAYER_URL = 'https://tapeop.dev/';
  const BUTTON_ID = 'tape-operator-button';

  const TMDB_API_KEY = '5fc153497d26350515c189f71fb16ec0';
  const TMDB_PROXY_BASE = 'https://lingering-salad-a373.l3towm.workers.dev/3';
  const PROXY_ROOT = 'https://lingering-salad-a373.l3towm.workers.dev';

  // URL Matchers
  const KINOPOISK_MATCHER = /kinopoisk\.ru\/(film|series)\/.*/;
  const IMDB_MATCHER = /imdb\.com\/title\/tt\.*/;
  const TMDB_MATCHER = /themoviedb\.org\/(movie|tv)\/\.*/;
  const LETTERBOXD_MATCHER = /letterboxd\.com\/film\/\.*/;
  const PLOTBREAKER_MATCHER =
    /(?:plotbreakers\.vercel\.app|localhost:3000)\/reviews\/.*/;
  const MATCHERS = [
    KINOPOISK_MATCHER,
    IMDB_MATCHER,
    TMDB_MATCHER,
    LETTERBOXD_MATCHER,
    PLOTBREAKER_MATCHER,
  ];

  let previousUrl = '/';

  // =================================================================================================
  // ГЛАВНЫЙ ЗАПУСК
  // =================================================================================================

  const href = location.href;

  if (href.includes('tapeop.dev')) {
    initPlayer();
  } else if (
    href.includes('plotbreakers.vercel.app') ||
    href.includes('localhost:3000')
  ) {
    initPlotbreakerIntegration();
  } else {
    initButtonLogic();
  }

  // =================================================================================================
  // ЧАСТЬ PLOTBREAKER: Интеграция с plotbreakers.vercel.app
  // =================================================================================================

  function initPlotbreakerIntegration() {
    // Ждём появления кнопки Tapeop на странице (SPA — элементы могут появиться позже)
    const observer = new MutationObserver(() => {
      enhanceTapeopButton();
    });
    observer.observe(document, { subtree: true, childList: true });

    // Первая попытка сразу
    enhanceTapeopButton();
  }

  function enhanceTapeopButton() {
    const btn = document.getElementById('tapeop-play-btn');
    if (!btn || btn.__tape_enhanced) return;
    btn.__tape_enhanced = true;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const kpId = btn.getAttribute('data-kinopoisk-id');
      if (!kpId) return;

      // Извлекаем название из h1
      const title = document.querySelector('h1')?.textContent?.trim() || '';

      await GM.setValue('movie-data', { kinopoisk: kpId, title });
      GM.openInTab(PLAYER_URL, false);
    });
  }

  // =================================================================================================
  // ЧАСТЬ 1: ЛОГИКА КНОПКИ (KP, IMDB, TMDB, Letterboxd)
  // =================================================================================================

  function initButtonLogic() {
    const observer = new MutationObserver(() => updateButton());
    observer.observe(document, { subtree: true, childList: true });
    setInterval(() => checkButtonPositions(), 500);
    updateButton();
  }

  function updateButton() {
    const url = getCurrentURL();
    if (url !== previousUrl) {
      document.getElementById(BUTTON_ID)?.remove();
    }
    if (!MATCHERS.some((m) => url.match(m))) return removeButton();
    if (document.getElementById(BUTTON_ID)) {
      previousUrl = url;
      return;
    }
    if (!extractTitle()) return removeButton();
    previousUrl = url;
    createAndAttachButton();
  }

  function checkButtonPositions() {
    const url = getCurrentURL();
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;
    if (url.includes('imdb.com')) fixImdbPosition(btn);
    else if (url.includes('hd.kinopoisk.ru')) fixHdKinopoiskPosition(btn);
  }

  function fixImdbPosition(btn) {
    const targetBtn = document.querySelector(
      'button.ipc-split-button__btn.ipc-split-button__btn--button-radius'
    );
    if (targetBtn) {
      const wrapper = targetBtn.parentElement;
      if (wrapper && btn.nextElementSibling !== wrapper) {
        wrapper.parentElement.insertBefore(btn, wrapper);
        btn.className = 'tape-op-base tape-op-yellow';
        btn.classList.remove('tape-op-fixed');
        btn.style.width = '100%';
        btn.style.marginBottom = '12px';
        btn.style.marginRight = '0';
      }
    }
  }

  function fixHdKinopoiskPosition(btn) {
    const trailerBtn = document.querySelector(
      'button[class*="styles_button_trailer"]'
    );
    if (trailerBtn) {
      const parent = trailerBtn.parentElement;
      if (parent && btn.nextElementSibling !== trailerBtn) {
        parent.insertBefore(btn, trailerBtn);
        btn.className = 'tape-op-base tape-op-orange';
        btn.classList.remove('tape-op-fixed');
        btn.style.width = 'auto';
        btn.style.marginBottom = '0';
        btn.style.marginLeft = '0';
        btn.style.marginRight = '12px';
      }
    }
  }

  function createAndAttachButton() {
    if (document.getElementById(BUTTON_ID)) return;
    if (!document.getElementById('tape-op-btn-styles')) {
      const style = document.createElement('style');
      style.id = 'tape-op-btn-styles';
      style.textContent = `
                .tape-op-base { display: flex; align-items: center; justify-content: center; box-sizing: border-box; height: 52px; border-radius: 26px; font-family: 'Graphik LC', Helvetica, Arial, sans-serif; font-weight: 700; font-size: 15px; line-height: 20px; padding: 0 24px; cursor: pointer; border: none; text-decoration: none !important; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; white-space: nowrap; z-index: 9999; margin-bottom: 10px; }
                .tape-op-base:hover { transform: scale(1.02); }
                .tape-op-base svg { margin-right: 8px; width: 24px; height: 24px; }
                .tape-op-orange { background: linear-gradient(90deg, #ff5b35 0%, #ff9e22 100%); color: #fff !important; box-shadow: 0 4px 12px rgba(255, 91, 53, 0.25); margin-right: 12px; width: auto; display: inline-flex; }
                .tape-op-orange:hover { background: linear-gradient(90deg, #ff6b4a 0%, #ffaa3d 100%); box-shadow: 0 6px 16px rgba(255, 91, 53, 0.4); }
                .tape-op-orange svg { fill: #fff; }
                .tape-op-yellow { background: #F5C518; color: #000 !important; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); }
                .tape-op-yellow:hover { background: #E2B616; }
                .tape-op-yellow svg { fill: #000; }
                .tape-op-fixed { position: fixed; bottom: 20px; right: 20px; width: auto !important; z-index: 2147483647; }
            `;
      document.head.appendChild(style);
    }

    const url = getCurrentURL();
    const isImdb = url.includes('imdb.com');
    const btn = document.createElement('div');
    btn.id = BUTTON_ID;
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><span>Смотреть онлайн</span>`;
    btn.addEventListener('click', () => openPlayerFromSite());
    btn.addEventListener(
      'mousedown',
      (e) => e.button === 1 && openPlayerFromSite(true)
    );
    btn.className = `tape-op-base ${isImdb ? 'tape-op-yellow' : 'tape-op-orange'}`;

    if (url.includes('kinopoisk.ru')) {
      const buttonsContainer = document.querySelector(
        '[class*="styles_buttonsContainer"]'
      );
      const foldersButton = document.querySelector(
        '[class^="styles_foldersButton"]'
      );
      if (buttonsContainer) buttonsContainer.prepend(btn);
      else if (foldersButton?.parentElement)
        foldersButton.parentElement.prepend(btn);
      else {
        btn.classList.add('tape-op-fixed');
        document.body.appendChild(btn);
      }
    } else if (url.includes('letterboxd.com')) {
      const actions = document.querySelector('.sidebar');
      if (actions) {
        btn.className = 'tape-op-base tape-op-orange';
        actions.prepend(btn);
      } else {
        btn.classList.add('tape-op-fixed');
        document.body.appendChild(btn);
      }
    } else {
      btn.classList.add('tape-op-fixed');
      document.body.appendChild(btn);
    }
  }

  function removeButton() {
    document.getElementById(BUTTON_ID)?.remove();
  }

  async function openPlayerFromSite(loadInBackground = false) {
    const data = extractMovieData();
    if (!data) return;
    await GM.setValue('movie-data', data);
    GM.openInTab(PLAYER_URL, loadInBackground);
  }

  // =================================================================================================
  // ЧАСТЬ 2: ЛОГИКА ПОИСКА (TAPEOP.DEV)
  // =================================================================================================

  function initSearchLogic() {
    const style = document.createElement('style');
    style.textContent = `
            #kp-search-container { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); width: 550px; z-index: 2147483647; font-family: sans-serif; }
            #kp-search-input { width: 100%; padding: 14px 44px 14px 24px; border-radius: 28px; border: 1px solid rgba(255,255,255,0.15); background: rgba(18,18,18,0.95); color: #fff; font-size: 16px; outline: none; box-shadow: 0 8px 32px rgba(0,0,0,0.8); backdrop-filter: blur(12px); transition: all 0.2s ease; }
            #kp-search-input:focus { background: rgba(25,25,25,1); border-color: #ff6633; box-shadow: 0 8px 40px rgba(255,102,51,0.3); }
            #kp-search-results { margin-top: 12px; background: rgba(25,25,25,0.98); border-radius: 16px; overflow: hidden; display: none; box-shadow: 0 10px 50px rgba(0,0,0,0.95); max-height: 500px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.05); }
            .kp-result-item { display: flex; align-items: center; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
            .kp-result-item:last-child { border-bottom: none; }
            .kp-result-item:hover { background: rgba(255,255,255,0.15); }
            .kp-poster { width: 44px; height: 66px; object-fit: cover; border-radius: 6px; margin-right: 16px; background: #333; flex-shrink: 0; }
            .kp-info { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
            .kp-title { font-weight: 600; color: #eee; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .kp-meta { color: #aaa; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .kp-rating { font-weight: 700; margin-left: 10px; font-size: 14px; }
            .kp-external-btn { padding: 6px 10px; margin-left: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #888; font-size: 11px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; white-space: nowrap; cursor: pointer; text-align: center; }
            .kp-external-btn:hover { background: #ff6633; color: #fff; border-color: #ff6633; }
            .kp-status-msg { padding: 15px; text-align: center; color: #888; font-size: 14px; }
            .kp-fallback-btn { display: block; width: 100%; padding: 15px; text-align: center; background: #222; color: #ff6633; text-decoration: none; font-weight: 600; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.1); }
            .kp-fallback-btn:hover { background: #333; }
            #kp-search-results::-webkit-scrollbar { width: 6px; }
            #kp-search-results::-webkit-scrollbar-track { background: transparent; }
            #kp-search-results::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
        `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'kp-search-container';
    const input = document.createElement('input');
    input.id = 'kp-search-input';
    input.placeholder = 'Поиск фильмов и сериалов...';
    input.autocomplete = 'off';
    const resultsList = document.createElement('div');
    resultsList.id = 'kp-search-results';
    container.appendChild(input);
    container.appendChild(resultsList);
    document.body.appendChild(container);

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 2) {
        resultsList.style.display = 'none';
        return;
      }
      resultsList.innerHTML = '<div class="kp-status-msg">Ищу...</div>';
      resultsList.style.display = 'block';
      debounceTimer = setTimeout(() => searchTMDB(query, resultsList), 300);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query)
          debounceTimer = setTimeout(() => searchTMDB(query, resultsList), 100);
      }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) resultsList.style.display = 'none';
    });
  }

  function searchTMDB(query, resultsList) {
    const url = `${TMDB_PROXY_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}&page=1&include_adult=true`;
    GM.xmlHttpRequest({
      method: 'GET',
      url,
      onload: (res) => {
        try {
          renderResults(
            JSON.parse(res.responseText).results,
            query,
            resultsList
          );
        } catch (e) {
          console.error(e);
          resultsList.innerHTML = '<div class="kp-status-msg">Ошибка API</div>';
        }
      },
      onerror: () => {
        resultsList.innerHTML = '<div class="kp-status-msg">Ошибка сети</div>';
      },
    });
  }

  function renderResults(movies, query, resultsList) {
    resultsList.innerHTML = '';
    const filtered = (movies || []).filter(
      (m) => m.media_type === 'movie' || m.media_type === 'tv'
    );
    if (!filtered.length) {
      resultsList.innerHTML =
        '<div class="kp-status-msg">В базе не найдено</div>';
      addFallbackButton(query, resultsList);
      return;
    }

    let count = 0;
    filtered.forEach((movie) => {
      if (count >= 6) return;
      count++;
      const item = document.createElement('div');
      item.className = 'kp-result-item';
      const title = movie.title || movie.name || '???';
      const year = (movie.release_date || movie.first_air_date || '').split(
        '-'
      )[0];
      const poster = movie.poster_path
        ? `${PROXY_ROOT}/t/p/w92${movie.poster_path}`
        : 'https://via.placeholder.com/44x66/333/888?text=?';
      const ratingVal = movie.vote_average || 0;
      const ratingText = ratingVal ? ratingVal.toFixed(1) : '';
      const hue = Math.max(0, Math.min(120, ratingVal * 12));
      const ratingColor = `hsl(${hue}, 85%, 50%)`;

      item.innerHTML = `
                <img src="${poster}" class="kp-poster">
                <div class="kp-info"><div class="kp-title">${title}</div><div class="kp-meta">${year} • ${movie.media_type === 'tv' ? 'Сериал' : 'Фильм'}</div></div>
                ${ratingText ? `<div class="kp-rating" style="color: ${ratingColor}">${ratingText}</div>` : ''}
            `;

      item.addEventListener('click', async () => {
        await GM.setValue('movie-data', { tmdb: movie.id, title });
        window.location.href = PLAYER_URL;
      });

      const kpBtn = document.createElement('div');
      kpBtn.className = 'kp-external-btn';
      kpBtn.innerHTML = 'Кинопоиск ↗';
      kpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(
          `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(title + (year ? ` ${year}` : ''))}`,
          '_blank'
        );
      });
      item.appendChild(kpBtn);
      resultsList.appendChild(item);
    });
    addFallbackButton(query, resultsList);
  }

  function addFallbackButton(query, list) {
    const btn = document.createElement('div');
    btn.className = 'kp-fallback-btn';
    btn.innerHTML = `🔍 Искать "${query}" на Кинопоиске &rarr;`;
    btn.onclick = () =>
      window.open(
        `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(query)}`,
        '_blank'
      );
    list.appendChild(btn);
  }

  // =================================================================================================
  // ЧАСТЬ 3: ИНИЦИАЛИЗАЦИЯ ПЛЕЕРА (TAPEOP.DEV)
  // =================================================================================================

  async function initPlayer() {
    const data = await GM.getValue('movie-data', {});
    await GM.deleteValue('movie-data');

    if (!data || Object.keys(data).length === 0) {
      initSearchLogic();
      return;
    }

    const dataSerialized = JSON.stringify(JSON.stringify(data));
    const versionSerialized = JSON.stringify(VERSION);
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = `globalThis.init(JSON.parse(${dataSerialized}), ${versionSerialized});`;
    document.body.appendChild(scriptElement);

    initSearchLogic();
  }

  // =================================================================================================
  // HELPER FUNCTIONS
  // =================================================================================================

  function getCurrentURL() {
    return location.origin + location.pathname;
  }

  function extractTitle() {
    try {
      const titleElement =
        document.querySelector('meta[property="og:title"]') ||
        document.querySelector('meta[name="twitter:title"]');
      if (!titleElement) return null;
      let title = titleElement.content.trim();
      if (title.startsWith('Кинопоиск.')) return null;
      if (title.includes('— смотреть онлайн'))
        title = title
          .replace('— смотреть онлайн в хорошем качестве — Кинопоиск', '')
          .trim();
      if (title.includes('⭐')) title = title.split('⭐')[0].trim();
      if (title.endsWith('- IMDb') && title.includes(')'))
        title = title.slice(0, title.lastIndexOf(')') + 1).trim();
      return title;
    } catch (e) {
      return null;
    }
  }

  function extractMovieData() {
    const url = getCurrentURL();
    const title = extractTitle();
    if (!title) return null;

    if (url.match(KINOPOISK_MATCHER)) {
      if (url.includes('hd.kinopoisk.ru')) {
        try {
          const json = JSON.parse(
            document.getElementById('__NEXT_DATA__').innerText
          );
          const apollo = Object.values(
            json?.props?.pageProps?.apolloState?.data || {}
          );
          const id = apollo.find(
            (i) => i?.__typename === 'TvSeries' || i?.__typename === 'Film'
          )?.id;
          return id ? { kinopoisk: id, title } : null;
        } catch (e) {
          return null;
        }
      }
      return { kinopoisk: url.split('/')[4], title };
    }
    if (url.match(IMDB_MATCHER)) return { imdb: url.split('/')[4], title };
    if (url.match(TMDB_MATCHER))
      return { tmdb: url.split('/')[4].split('-')[0], title };
    if (url.match(LETTERBOXD_MATCHER)) {
      const imdb = document
        .querySelector('a[href*="imdb.com"]')
        ?.href?.split('/')[4];
      if (imdb) return { imdb, title };
      const tmdb = document
        .querySelector('a[href*="themoviedb.org"]')
        ?.href?.split('/')[4]
        ?.split('-')[0];
      if (tmdb) return { tmdbId: tmdb, title };
    }
    return null;
  }
})();
