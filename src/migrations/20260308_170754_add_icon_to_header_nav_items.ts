import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_about_lnks_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_about_lnks_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_media_contents_seasons_personal_opinion" AS ENUM('like', 'neutral', 'dislike', 'planned');
  CREATE TYPE "public"."enum_media_contents_genres" AS ENUM('biography', 'action', 'western', 'war', 'mystery', 'documentary', 'drama', 'history', 'comedy', 'short', 'crime', 'romance', 'mystic', 'music', 'musical', 'adventure', 'family', 'sport', 'thriller', 'horror', 'sci-fi', 'fantasy', 'animation');
  CREATE TYPE "public"."enum_media_contents_type" AS ENUM('film', 'series', 'cartoon');
  CREATE TYPE "public"."enum_media_contents_status" AS ENUM('planned', 'watching', 'watched', 'abandoned');
  CREATE TYPE "public"."enum_media_contents_personal_opinion" AS ENUM('like', 'neutral', 'dislike', 'planned');
  CREATE TYPE "public"."enum_posts_tags" AS ENUM('review', 'news', 'collection', 'opinion', 'guide');
  CREATE TYPE "public"."enum_exports_format" AS ENUM('csv', 'json');
  CREATE TYPE "public"."enum_exports_sort_order" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_exports_drafts" AS ENUM('yes', 'no');
  CREATE TYPE "public"."enum_imports_collection_slug" AS ENUM('titles', 'posts');
  CREATE TYPE "public"."enum_imports_import_mode" AS ENUM('create', 'update', 'upsert');
  CREATE TYPE "public"."enum_imports_status" AS ENUM('pending', 'completed', 'partial', 'failed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'createCollectionExport', 'createCollectionImport');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'createCollectionExport', 'createCollectionImport');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"username" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT 'media',
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL,
  	"link_appearance" "enum_pages_blocks_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'О проекте.' NOT NULL,
  	"hero_text" varchar DEFAULT 'Минималистичный журнал о визуальном повествовании в кино.',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_about_features_section_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "about_lnks" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"link_type" "enum_about_lnks_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_appearance" "enum_about_lnks_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "about_cols" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"features_section_title" varchar DEFAULT 'Философия' NOT NULL,
  	"features_section_text" varchar DEFAULT 'Краткие пересказы фильмов и сериалов для тех, кто ценит своё время. Узнайте суть сюжета, ключевые моменты и мою честную оценку — и решите, стоит ли тратить вечер на просмотр. Никакой воды, только главное.',
  	"useful_links_section_title" varchar DEFAULT 'Полезные ссылки' NOT NULL,
  	"useful_links_section_text" varchar DEFAULT 'Популярные платформы с обзорами и рейтингами фильмов',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" jsonb,
  	"is_public" boolean DEFAULT true,
  	"is_theme" boolean DEFAULT false,
  	"item_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_contents_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season_number" numeric,
  	"review" jsonb,
  	"personal_opinion" "enum_media_contents_seasons_personal_opinion" DEFAULT 'neutral',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "media_contents_genres" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_contents_genres",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "media_contents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"original_title" varchar,
  	"slug" varchar,
  	"synopsis" varchar,
  	"review" jsonb,
  	"visual_tags" varchar,
  	"is_published" boolean DEFAULT false,
  	"type" "enum_media_contents_type" DEFAULT 'film' NOT NULL,
  	"status" "enum_media_contents_status" DEFAULT 'planned',
  	"poster_id" integer,
  	"poster_url" varchar,
  	"personal_opinion" "enum_media_contents_personal_opinion" DEFAULT 'neutral',
  	"tmdb_rating" numeric,
  	"kp_rating" numeric,
  	"watch_date" timestamp(3) with time zone,
  	"watch_year" numeric,
  	"director" varchar,
  	"release_year" numeric,
  	"season_count" numeric,
  	"episode_count" numeric,
  	"kinopoisk_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_contents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"collections_id" integer
  );
  
  CREATE TABLE "posts_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_posts_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"annotation" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"content" jsonb NOT NULL,
  	"hero_image_id" integer,
  	"is_published" boolean DEFAULT false,
  	"image_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "exports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"format" "enum_exports_format" DEFAULT 'csv' NOT NULL,
  	"limit" numeric,
  	"page" numeric DEFAULT 1,
  	"sort" varchar,
  	"sort_order" "enum_exports_sort_order",
  	"drafts" "enum_exports_drafts" DEFAULT 'yes',
  	"collection_slug" varchar NOT NULL,
  	"where" jsonb DEFAULT '{}'::jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "exports_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "imports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection_slug" "enum_imports_collection_slug" NOT NULL,
  	"import_mode" "enum_imports_import_mode",
  	"match_field" varchar DEFAULT 'id',
  	"status" "enum_imports_status" DEFAULT 'pending',
  	"summary_imported" numeric,
  	"summary_updated" numeric,
  	"summary_total" numeric,
  	"summary_issues" numeric,
  	"summary_issue_details" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "search_results" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"keywords" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_results_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_contents_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"collections_id" integer,
  	"media_contents_id" integer,
  	"posts_id" integer,
  	"search_results_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL,
  	"icon" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_logo_icon" varchar,
  	"logo_logo_text" varchar DEFAULT 'ПРОСМОТРЕНО',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_logo_icon" varchar,
  	"logo_logo_text" varchar DEFAULT 'ПРОСМОТРЕНО',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_links" ADD CONSTRAINT "pages_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_features_section_items" ADD CONSTRAINT "pages_blocks_about_features_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_lnks" ADD CONSTRAINT "about_lnks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_cols"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_cols" ADD CONSTRAINT "about_cols_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about" ADD CONSTRAINT "pages_blocks_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_contents_seasons" ADD CONSTRAINT "media_contents_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_contents_genres" ADD CONSTRAINT "media_contents_genres_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_contents" ADD CONSTRAINT "media_contents_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_contents_rels" ADD CONSTRAINT "media_contents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_contents_rels" ADD CONSTRAINT "media_contents_rels_lists_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exports_texts" ADD CONSTRAINT "exports_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_results_rels" ADD CONSTRAINT "search_results_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_results_rels" ADD CONSTRAINT "search_results_rels_titles_fk" FOREIGN KEY ("media_contents_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_results_rels" ADD CONSTRAINT "search_results_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lists_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_titles_fk" FOREIGN KEY ("media_contents_id") REFERENCES "public"."media_contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_results_fk" FOREIGN KEY ("search_results_id") REFERENCES "public"."search_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "pages_blocks_hero_links_order_idx" ON "pages_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_links_parent_id_idx" ON "pages_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_features_section_items_order_idx" ON "pages_blocks_about_features_section_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_features_section_items_parent_id_idx" ON "pages_blocks_about_features_section_items" USING btree ("_parent_id");
  CREATE INDEX "about_lnks_order_idx" ON "about_lnks" USING btree ("_order");
  CREATE INDEX "about_lnks_parent_id_idx" ON "about_lnks" USING btree ("_parent_id");
  CREATE INDEX "about_cols_order_idx" ON "about_cols" USING btree ("_order");
  CREATE INDEX "about_cols_parent_id_idx" ON "about_cols" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_order_idx" ON "pages_blocks_about" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_parent_id_idx" ON "pages_blocks_about" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_path_idx" ON "pages_blocks_about" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "collections_title_idx" ON "collections" USING btree ("title");
  CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  CREATE INDEX "media_contents_seasons_order_idx" ON "media_contents_seasons" USING btree ("_order");
  CREATE INDEX "media_contents_seasons_parent_id_idx" ON "media_contents_seasons" USING btree ("_parent_id");
  CREATE INDEX "media_contents_genres_order_idx" ON "media_contents_genres" USING btree ("order");
  CREATE INDEX "media_contents_genres_parent_idx" ON "media_contents_genres" USING btree ("parent_id");
  CREATE UNIQUE INDEX "media_contents_slug_idx" ON "media_contents" USING btree ("slug");
  CREATE INDEX "media_contents_poster_idx" ON "media_contents" USING btree ("poster_id");
  CREATE INDEX "media_contents_updated_at_idx" ON "media_contents" USING btree ("updated_at");
  CREATE INDEX "media_contents_created_at_idx" ON "media_contents" USING btree ("created_at");
  CREATE INDEX "media_contents_rels_order_idx" ON "media_contents_rels" USING btree ("order");
  CREATE INDEX "media_contents_rels_parent_idx" ON "media_contents_rels" USING btree ("parent_id");
  CREATE INDEX "media_contents_rels_path_idx" ON "media_contents_rels" USING btree ("path");
  CREATE INDEX "media_contents_rels_collections_id_idx" ON "media_contents_rels" USING btree ("collections_id");
  CREATE INDEX "posts_tags_order_idx" ON "posts_tags" USING btree ("order");
  CREATE INDEX "posts_tags_parent_idx" ON "posts_tags" USING btree ("parent_id");
  CREATE UNIQUE INDEX "posts_title_idx" ON "posts" USING btree ("title");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "exports_updated_at_idx" ON "exports" USING btree ("updated_at");
  CREATE INDEX "exports_created_at_idx" ON "exports" USING btree ("created_at");
  CREATE UNIQUE INDEX "exports_filename_idx" ON "exports" USING btree ("filename");
  CREATE INDEX "exports_texts_order_parent" ON "exports_texts" USING btree ("order","parent_id");
  CREATE INDEX "imports_updated_at_idx" ON "imports" USING btree ("updated_at");
  CREATE INDEX "imports_created_at_idx" ON "imports" USING btree ("created_at");
  CREATE UNIQUE INDEX "imports_filename_idx" ON "imports" USING btree ("filename");
  CREATE INDEX "search_results_updated_at_idx" ON "search_results" USING btree ("updated_at");
  CREATE INDEX "search_results_created_at_idx" ON "search_results" USING btree ("created_at");
  CREATE INDEX "search_results_rels_order_idx" ON "search_results_rels" USING btree ("order");
  CREATE INDEX "search_results_rels_parent_idx" ON "search_results_rels" USING btree ("parent_id");
  CREATE INDEX "search_results_rels_path_idx" ON "search_results_rels" USING btree ("path");
  CREATE INDEX "search_results_rels_media_contents_id_idx" ON "search_results_rels" USING btree ("media_contents_id");
  CREATE INDEX "search_results_rels_posts_id_idx" ON "search_results_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX "payload_locked_documents_rels_media_contents_id_idx" ON "payload_locked_documents_rels" USING btree ("media_contents_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_search_results_id_idx" ON "payload_locked_documents_rels" USING btree ("search_results_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_hero_links" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_about_features_section_items" CASCADE;
  DROP TABLE "about_lnks" CASCADE;
  DROP TABLE "about_cols" CASCADE;
  DROP TABLE "pages_blocks_about" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "collections" CASCADE;
  DROP TABLE "media_contents_seasons" CASCADE;
  DROP TABLE "media_contents_genres" CASCADE;
  DROP TABLE "media_contents" CASCADE;
  DROP TABLE "media_contents_rels" CASCADE;
  DROP TABLE "posts_tags" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "exports" CASCADE;
  DROP TABLE "exports_texts" CASCADE;
  DROP TABLE "imports" CASCADE;
  DROP TABLE "search_results" CASCADE;
  DROP TABLE "search_results_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_about_lnks_link_type";
  DROP TYPE "public"."enum_about_lnks_link_appearance";
  DROP TYPE "public"."enum_media_contents_seasons_personal_opinion";
  DROP TYPE "public"."enum_media_contents_genres";
  DROP TYPE "public"."enum_media_contents_type";
  DROP TYPE "public"."enum_media_contents_status";
  DROP TYPE "public"."enum_media_contents_personal_opinion";
  DROP TYPE "public"."enum_posts_tags";
  DROP TYPE "public"."enum_exports_format";
  DROP TYPE "public"."enum_exports_sort_order";
  DROP TYPE "public"."enum_exports_drafts";
  DROP TYPE "public"."enum_imports_collection_slug";
  DROP TYPE "public"."enum_imports_import_mode";
  DROP TYPE "public"."enum_imports_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";`);
}
