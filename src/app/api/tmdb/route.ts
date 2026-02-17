import { NextRequest, NextResponse } from 'next/server';

/**
 * Базовый URL TMDB API v3
 */
const TMDB_BASE = 'https://api.themoviedb.org/3';

/**
 * GET /api/tmdb?query=... | GET /api/tmdb?id=...
 *
 * Прокси-эндпоинт для работы с TMDB API.
 * Позволяет избежать раскрытия API ключа на клиенте.
 * Всегда запрашивает данные на русском языке (ru-RU).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie'; // movie или tv

  const apiKey = process.env.TMDB_API;

  // Проверка конфигурации сервера
  if (!apiKey) {
    console.error('Критическая ошибка: отсутствует TMDB_API ключ в окружении');
    return NextResponse.json(
      { error: 'Внутренняя ошибка конфигурации TMDB' },
      { status: 500 }
    );
  }

  try {
    // Режим 1: Поиск по названию
    if (query) {
      const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
      const res = await fetch(
        `${TMDB_BASE}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=ru-RU`
      );

      if (!res.ok) {
        throw new Error(`Ошибка TMDB при поиске: ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Режим 2: Получение деталей по ID (включая актеров через append_to_response)
    if (id) {
      const endpoint = type === 'tv' ? 'tv' : 'movie';
      const res = await fetch(
        `${TMDB_BASE}/${endpoint}/${id}?api_key=${apiKey}&language=ru-RU&append_to_response=credits`
      );

      if (!res.ok) {
        throw new Error(`Ошибка TMDB при получении ID ${id}: ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Необходимо указать параметр query или id' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Ошибка прокси TMDB API:', error);
    return NextResponse.json(
      { error: 'Не удалось получить данные от TMDB' },
      { status: 500 }
    );
  }
}
