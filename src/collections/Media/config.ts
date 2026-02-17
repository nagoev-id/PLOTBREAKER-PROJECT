import { adminOnly } from '@/access'
import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиа',
    plural: 'Медиа',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Конфигурация',
  },
  folders: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Альтернативный текст',
      required: true,
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Ensure url is populated for local uploads if missing
        if (!doc.url && doc.filename) {
          doc.url = `/media/${doc.filename}`
        }
        return doc
      },
    ],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../../public/media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        position: 'centre',
      },
    ],
  },
}
