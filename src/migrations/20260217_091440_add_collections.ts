import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Создаём ENUM типы (идемпотентно через DO блоки)
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_media_contents_seasons_personal_opinion" AS ENUM('liked', 'okay', 'wasted');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_media_contents_genres" AS ENUM('biography', 'action', 'western', 'war', 'mystery', 'documentary', 'drama', 'history', 'comedy', 'short', 'crime', 'romance', 'mystic', 'music', 'musical', 'adventure', 'family', 'sport', 'thriller', 'horror', 'sci-fi', 'fantasy', 'animation');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_media_contents_type" AS ENUM('film', 'series', 'cartoon');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_media_contents_status" AS ENUM('planned', 'watching', 'watched', 'abandoned');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_media_contents_personal_opinion" AS ENUM('like', 'neutral', 'dislike');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`);

  // Таблица Collections
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "collections" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "description" jsonb,
    "is_public" boolean DEFAULT true,
    "item_count" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );`);

  // Таблицы MediaContents
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "media_contents_seasons" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "season_number" numeric,
    "review" jsonb,
    "personal_rating" numeric,
    "personal_opinion" "enum_media_contents_seasons_personal_opinion",
    "start_date" timestamp(3) with time zone,
    "end_date" timestamp(3) with time zone
  );

  CREATE TABLE IF NOT EXISTS "media_contents_visual_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "tag" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "media_contents_genres" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_media_contents_genres",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "media_contents" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "original_title" varchar,
    "slug" varchar,
    "synopsis" varchar,
    "review" jsonb,
    "type" "enum_media_contents_type" DEFAULT 'film' NOT NULL,
    "status" "enum_media_contents_status" DEFAULT 'planned',
    "poster_id" integer,
    "poster_url" varchar,
    "personal_opinion" "enum_media_contents_personal_opinion" DEFAULT 'neutral',
    "tmdb_rating" numeric,
    "watch_date" timestamp(3) with time zone,
    "watch_year" numeric,
    "director" varchar,
    "release_date" timestamp(3) with time zone,
    "release_year" numeric,
    "duration" numeric,
    "season_count" numeric,
    "episode_count" numeric,
    "kinopoisk_id" varchar,
    "kinorium_id" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "media_contents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "collections_id" integer
  );`);

  // Таблица Posts
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );`);

  // Foreign keys (идемпотентно через DO блоки)
  await db.execute(sql`
  DO $$ BEGIN
    ALTER TABLE "media_contents_seasons" ADD CONSTRAINT "media_contents_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "media_contents_visual_tags" ADD CONSTRAINT "media_contents_visual_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "media_contents_genres" ADD CONSTRAINT "media_contents_genres_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "media_contents" ADD CONSTRAINT "media_contents_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "media_contents_rels" ADD CONSTRAINT "media_contents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "media_contents_rels" ADD CONSTRAINT "media_contents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`);

  // Колонки и FK для payload_locked_documents_rels
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "collections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "media_contents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "posts_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_contents_fk" FOREIGN KEY ("media_contents_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`);

  // Индексы (все с IF NOT EXISTS)
  await db.execute(sql`
  CREATE UNIQUE INDEX IF NOT EXISTS "collections_title_idx" ON "collections" USING btree ("title");
  CREATE INDEX IF NOT EXISTS "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "collections_created_at_idx" ON "collections" USING btree ("created_at");

  CREATE INDEX IF NOT EXISTS "media_contents_seasons_order_idx" ON "media_contents_seasons" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "media_contents_seasons_parent_id_idx" ON "media_contents_seasons" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "media_contents_visual_tags_order_idx" ON "media_contents_visual_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "media_contents_visual_tags_parent_id_idx" ON "media_contents_visual_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "media_contents_genres_order_idx" ON "media_contents_genres" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "media_contents_genres_parent_idx" ON "media_contents_genres" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "media_contents_slug_idx" ON "media_contents" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "media_contents_poster_idx" ON "media_contents" USING btree ("poster_id");
  CREATE INDEX IF NOT EXISTS "media_contents_updated_at_idx" ON "media_contents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_contents_created_at_idx" ON "media_contents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "type_releaseYear_idx" ON "media_contents" USING btree ("type","release_year");
  CREATE INDEX IF NOT EXISTS "personalOpinion_watchYear_idx" ON "media_contents" USING btree ("personal_opinion","watch_year");
  CREATE INDEX IF NOT EXISTS "title_originalTitle_idx" ON "media_contents" USING btree ("title","original_title");
  CREATE INDEX IF NOT EXISTS "media_contents_rels_order_idx" ON "media_contents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "media_contents_rels_parent_idx" ON "media_contents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "media_contents_rels_path_idx" ON "media_contents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "media_contents_rels_collections_id_idx" ON "media_contents_rels" USING btree ("collections_id");

  CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" USING btree ("created_at");

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_contents_id_idx" ON "payload_locked_documents_rels" USING btree ("media_contents_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "payload_locked_documents_rels_collections_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_media_contents_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_posts_id_idx";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_collections_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_media_contents_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "collections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "media_contents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "posts_id";

  DROP TABLE IF EXISTS "media_contents_rels" CASCADE;
  DROP TABLE IF EXISTS "media_contents_seasons" CASCADE;
  DROP TABLE IF EXISTS "media_contents_visual_tags" CASCADE;
  DROP TABLE IF EXISTS "media_contents_genres" CASCADE;
  DROP TABLE IF EXISTS "media_contents" CASCADE;
  DROP TABLE IF EXISTS "posts" CASCADE;
  DROP TABLE IF EXISTS "collections" CASCADE;

  DROP TYPE IF EXISTS "public"."enum_media_contents_seasons_personal_opinion";
  DROP TYPE IF EXISTS "public"."enum_media_contents_genres";
  DROP TYPE IF EXISTS "public"."enum_media_contents_type";
  DROP TYPE IF EXISTS "public"."enum_media_contents_status";
  DROP TYPE IF EXISTS "public"."enum_media_contents_personal_opinion";`);
}
