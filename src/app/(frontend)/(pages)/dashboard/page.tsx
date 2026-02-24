import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import DashboardCollectionsClient from './page.client';
import type { Collection } from '@/payload-types';

/**
 * Server component для страницы управления коллекциями.
 */
const DashboardCollectionsPage = async () => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: COLLECTION_SLUGS.collections,
    sort: '-createdAt',
    limit: 0,
    depth: 0,
    select: {
      title: true,
      slug: true,
      isPublic: true,
      isTheme: true,
      itemCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <DashboardCollectionsClient
      initialCollections={result.docs as Collection[]}
    />
  );
};

export default DashboardCollectionsPage;
