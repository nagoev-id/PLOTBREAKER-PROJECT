import { NextRequest, NextResponse } from 'next/server';
import { getPayload, Where } from 'payload';
import config from '@payload-config';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * GET /api/search?q=query&type=film|series&page=1&limit=10
 *
 * Эндпоинт для внутреннего поиска по коллекции media-content.
 * Ищет совпадения в названии, оригинальном названии и по режиссеру.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // Если нет ни поискового запроса, ни фильтра по типу — возвращаем пустой результат
  if ((!query || query.trim().length === 0) && !type) {
    return NextResponse.json({ results: [] });
  }

  try {
    const payload = await getPayload({ config });

    const andConditions: Where[] = [];

    // Полнотекстовый поиск (через contains) по ключевым полям
    if (query && query.trim().length > 0) {
      const cleanQuery = query.trim();
      andConditions.push({
        or: [
          { title: { contains: cleanQuery } },
          { originalTitle: { contains: cleanQuery } },
          { director: { contains: cleanQuery } },
        ],
      });
    }

    // Фильтр по типу контента (фильм/сериал)
    if (type) {
      andConditions.push({
        contentType: { equals: type },
      });
    }

    const where: Where = {
      and: andConditions,
    };

    const result = await payload.find({
      collection: COLLECTION_SLUGS.mediaContents,
      where,
      limit,
      page,
      depth: 1,
      // Сортировка по дате релиза или названию для стабильности
      sort: '-releaseYear',
    });

    return NextResponse.json({
      results: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  } catch (error) {
    console.error('Ошибка при поиске контента:', error);
    return NextResponse.json(
      { error: 'Не удалось выполнить поиск' },
      { status: 500 }
    );
  }
}
