import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import { notFound } from 'next/navigation';
import { EntryForm } from '@/components/shared/dashboard/EntryForm';
import type { MediaContent, Collection } from '@/payload-types';

interface EditEntryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Страница редактирования записи медиа-контента.
 */
const EditEntryPage = async ({ params }: EditEntryPageProps) => {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  let entry: MediaContent;
  try {
    entry = await payload.findByID({
      collection: COLLECTION_SLUGS.mediaContents,
      id,
      depth: 1,
    });
  } catch {
    return notFound();
  }

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
      <h2 className="text-xl font-semibold">Редактирование: {entry.title}</h2>
      <EntryForm
        entry={entry}
        collections={collectionsResult.docs as Collection[]}
      />
    </div>
  );
};

export default EditEntryPage;
