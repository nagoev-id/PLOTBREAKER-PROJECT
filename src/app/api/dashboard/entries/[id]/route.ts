import { getPayload } from 'payload';
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
      collection: COLLECTION_SLUGS.titles,
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

    // Конвертируем markdown-строку в Lexical JSON
    if (typeof body.review === 'string' && body.review.trim()) {
      body.review = await convertReviewMarkdown(body.review);
    }

    const doc = await payload!.update({
      collection: COLLECTION_SLUGS.titles,
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
      collection: COLLECTION_SLUGS.titles,
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
