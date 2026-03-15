import { getPayload } from 'payload';
import type { Where } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/lib/constants';
import { getAuthUser } from '@/lib/helpers';
import { convertReviewMarkdown } from '@/lib/markdownToLexical';

/**
 * Проверяет, что текущий пользователь — admin.
 */
const requireAdmin = async () => {
  const payload = await getPayload({ config: configPromise });
  const user = await getAuthUser();

  if (!user) {
    return {
      error: Response.json({ error: 'Доступ запрещён' }, { status: 403 }),
      payload: null,
    };
  }

  return { error: null, payload };
};

/**
 * GET — получить записи медиа-контента с пагинацией
 */
export async function GET(request: Request) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    let where: Where | undefined;
    if (search) {
      where = {
        or: [
          { title: { contains: search } },
          { originalTitle: { contains: search } },
        ],
      };
    }

    const result = await payload!.find({
      collection: COLLECTION_SLUGS.titles,
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
      where,
      select: {
        title: true,
        originalTitle: true,
        slug: true,
        type: true,
        status: true,
        personalOpinion: true,
        poster: true,
        posterUrl: true,
        genres: true,
        releaseYear: true,
        collections: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(result);
  } catch (err) {
    console.error('Ошибка при получении записей:', err);
    return Response.json(
      { error: 'Не удалось загрузить записи' },
      { status: 500 }
    );
  }
}

/**
 * POST — создать новую запись медиа-контента
 */
export async function POST(request: Request) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();

    // Конвертируем markdown-строку в Lexical JSON
    if (typeof body.review === 'string' && body.review.trim()) {
      body.review = await convertReviewMarkdown(body.review);
    }

    const doc = await payload!.create({
      collection: COLLECTION_SLUGS.titles,
      data: body,
    });

    return Response.json(doc, { status: 201 });
  } catch (err) {
    console.error('Ошибка при создании записи:', err);
    return Response.json(
      { error: 'Не удалось создать запись' },
      { status: 500 }
    );
  }
}

