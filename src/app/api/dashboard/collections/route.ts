import { getPayload } from 'payload';
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
 * GET — получить все коллекции (списки)
 */
export async function GET() {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const result = await payload!.find({
      collection: COLLECTION_SLUGS.collections,
      sort: 'title',
      limit: 0,
      depth: 0,
      select: {
        title: true,
        slug: true,
        isPublic: true,
        isTheme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(result);
  } catch (err) {
    console.error('Ошибка при получении коллекций:', err);
    return Response.json(
      { error: 'Не удалось загрузить коллекции' },
      { status: 500 }
    );
  }
}

/**
 * POST — создать новую коллекцию
 */
export async function POST(request: Request) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const doc = await payload!.create({
      collection: COLLECTION_SLUGS.collections,
      data: body,
    });

    return Response.json(doc, { status: 201 });
  } catch (err) {
    console.error('Ошибка при создании коллекции:', err);
    return Response.json(
      { error: 'Не удалось создать коллекцию' },
      { status: 500 }
    );
  }
}
