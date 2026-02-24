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
 * GET — получить запись медиа-контента по ID
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const doc = await payload!.findByID({
      collection: COLLECTION_SLUGS.mediaContents,
      id,
      depth: 1,
    });

    return Response.json(doc);
  } catch (err) {
    console.error('Ошибка при получении записи:', err);
    return Response.json({ error: 'Запись не найдена' }, { status: 404 });
  }
}

/**
 * PATCH — обновить запись медиа-контента по ID
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const doc = await payload!.update({
      collection: COLLECTION_SLUGS.mediaContents,
      id,
      data: body,
    });

    return Response.json(doc);
  } catch (err) {
    console.error('Ошибка при обновлении записи:', err);
    return Response.json(
      { error: 'Не удалось обновить запись' },
      { status: 500 }
    );
  }
}

/**
 * DELETE — удалить запись медиа-контента по ID
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, payload } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await payload!.delete({
      collection: COLLECTION_SLUGS.mediaContents,
      id,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении записи:', err);
    return Response.json(
      { error: 'Не удалось удалить запись' },
      { status: 500 }
    );
  }
}
