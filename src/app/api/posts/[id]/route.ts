import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/lib/constants';
import { getAuthUser } from '@/lib/helpers';

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
 * DELETE — удалить пост по ID
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
      collection: COLLECTION_SLUGS.posts,
      id,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении поста:', err);
    return Response.json(
      { error: 'Не удалось удалить пост' },
      { status: 500 }
    );
  }
}
