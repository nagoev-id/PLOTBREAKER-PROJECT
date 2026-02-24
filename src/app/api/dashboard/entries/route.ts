import { getPayload } from 'payload';
import type { Where } from 'payload';
import { headers } from 'next/headers';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import type { User } from '@/payload-types';

/**
 * Проверяет, что текущий пользователь — admin.
 */
const requireAdmin = async () => {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user || (user as User).role !== 'admin') {
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
      collection: COLLECTION_SLUGS.mediaContents,
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
    const doc = await payload!.create({
      collection: COLLECTION_SLUGS.mediaContents,
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
