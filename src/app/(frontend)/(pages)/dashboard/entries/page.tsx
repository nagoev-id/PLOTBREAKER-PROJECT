import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { COLLECTION_SLUGS } from '@/lib/constants';
import DashboardEntriesClient from './page.client';
import type { Title as MediaContent } from '@/payload-types';

/**
 * Server component для страницы управления записями.
 */
const DashboardEntriesPage = async () => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: COLLECTION_SLUGS.titles,
    sort: '-createdAt',
    limit: 20,
    depth: 1,
    page: 1,
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

  return (
    <DashboardEntriesClient
      initialEntries={result.docs as MediaContent[]}
      initialTotalPages={result.totalPages}
      initialTotalDocs={result.totalDocs}
    />
  );
};

export default DashboardEntriesPage;
