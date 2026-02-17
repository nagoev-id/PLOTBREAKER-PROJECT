import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Миграция для засеивания начальных коллекций.
 * Создаёт предопределённые коллекции по типам контента и впечатлениям.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  INSERT INTO "collections" ("title", "slug", "is_public", "item_count", "updated_at", "created_at")
  VALUES
    -- Фильмы
    ('Фильмы: Буду смотреть', 'planned-film', true, 0, now(), now()),
    ('Фильмы: Понравилось', 'liked-film', true, 0, now(), now()),
    ('Фильмы: Пойдет', 'neutral-film', true, 0, now(), now()),
    ('Фильмы: Потрачено', 'disliked-film', true, 0, now(), now()),
    -- Мультфильмы
    ('Мультфильмы: Буду смотреть', 'planned-animation', true, 0, now(), now()),
    ('Мультфильмы: Понравилось', 'liked-animation', true, 0, now(), now()),
    ('Мультфильмы: Пойдет', 'neutral-animation', true, 0, now(), now()),
    ('Мультфильмы: Потрачено', 'disliked-animation', true, 0, now(), now()),
    -- Сериалы
    ('Сериалы: Буду смотреть', 'planned-series', true, 0, now(), now()),
    ('Сериалы: Понравилось', 'liked-series', true, 0, now(), now()),
    ('Сериалы: Пойдет', 'neutral-series', true, 0, now(), now()),
    ('Сериалы: Потрачено', 'disliked-series', true, 0, now(), now())
  ON CONFLICT ("title") DO NOTHING;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DELETE FROM "collections"
  WHERE "slug" IN (
    'planned-film', 'liked-film', 'neutral-film', 'disliked-film',
    'planned-animation', 'liked-animation', 'neutral-animation', 'disliked-animation',
    'planned-series', 'liked-series', 'neutral-series', 'disliked-series'
  );`);
}
