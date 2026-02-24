import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import { EntryForm } from '@/components/shared/dashboard/EntryForm';
import type { Collection } from '@/payload-types';

/**
 * Страница создания новой записи медиа-контента.
 */
const NewEntryPage = async () => {
  const payload = await getPayload({ config: configPromise });

  // Загружаем коллекции для выбора в форме
  const collectionsResult = await payload.find({
    collection: COLLECTION_SLUGS.collections,
    sort: 'title',
    limit: 0,
    depth: 0,
    select: {
      title: true,
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Новая запись</h2>
      <EntryForm collections={collectionsResult.docs as Collection[]} />
    </div>
  );
};

export default NewEntryPage;
