import { NextRequest, NextResponse } from 'next/server';

/**
 * Базовый URL Kinopoisk Unofficial API
 */
const KP_BASE = 'https://kinopoiskapiunofficial.tech/api';

/**
 * GET /api/kp
 *
 * Прокси-эндпоинт для работы с Kinopoisk Unofficial API.
 *
 * Режимы:
 *  - ?query=...&type=ALL|FILM|TV_SERIES  — поиск (v2.1)
 *  - ?id=...                              — детали фильма (v2.2)
 *  - ?id=...&endpoint=seasons             — сезоны сериала (v2.2)
 *  - ?id=...&endpoint=staff               — актёры/режиссёры (v1)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'ALL';
  const endpoint = searchParams.get('endpoint');

  const apiKey = process.env.KINOPOISK_API;

  if (!apiKey) {
    console.error(
      'Критическая ошибка: отсутствует KINOPOISK_API ключ в окружении'
    );
    return NextResponse.json(
      { error: 'Внутренняя ошибка конфигурации Kinopoisk API' },
      { status: 500 }
    );
  }

  const headers = {
    'X-API-KEY': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    // Режим 1: Поиск по ключевому слову
    if (query) {
      const url = `${KP_BASE}/v2.2/films?keyword=${encodeURIComponent(query)}&type=${type}&page=1`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error(`Ошибка KP API при поиске: ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Режимы с id
    if (id) {
      // Сезоны сериала
      if (endpoint === 'seasons') {
        const res = await fetch(`${KP_BASE}/v2.2/films/${id}/seasons`, {
          headers,
        });

        if (!res.ok) {
          throw new Error(
            `Ошибка KP API при получении сезонов ID ${id}: ${res.status}`
          );
        }

        const data = await res.json();
        return NextResponse.json(data);
      }

      // Актёры и съёмочная группа
      if (endpoint === 'staff') {
        const res = await fetch(`${KP_BASE}/v1/staff?filmId=${id}`, {
          headers,
        });

        if (!res.ok) {
          throw new Error(
            `Ошибка KP API при получении staff ID ${id}: ${res.status}`
          );
        }

        const data = await res.json();
        return NextResponse.json(data);
      }

      // Детали фильма (по умолчанию)
      const res = await fetch(`${KP_BASE}/v2.2/films/${id}`, { headers });

      if (!res.ok) {
        throw new Error(
          `Ошибка KP API при получении деталей ID ${id}: ${res.status}`
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Необходимо указать параметр query или id' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Ошибка прокси Kinopoisk API:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные от Kinopoisk API' },
      { status: 500 }
    );
  }
}
