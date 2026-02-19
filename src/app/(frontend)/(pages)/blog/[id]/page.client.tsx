'use client';

import { FC, JSX, useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, Check, Tag } from 'lucide-react';

import { Badge } from '@/components/ui';
import { RichText } from '@/components/shared';
import { PostCollection, MediaCollection } from '@/utilities/types';

// Маппинг тегов
const TAG_LABELS: Record<string, string> = {
  review: 'Обзор',
  news: 'Новости',
  collection: 'Подборка',
  opinion: 'Мнение',
  guide: 'Гайд',
};

// Тип пропсов
type BlogDetailClientProps = {
  post: PostCollection;
};

/**
 * Форматирует дату
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Клиентский компонент детальной страницы поста.
 */
const BlogDetailClient: FC<BlogDetailClientProps> = ({ post }): JSX.Element => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const heroImage =
    post.heroImage && typeof post.heroImage === 'object'
      ? (post.heroImage as MediaCollection)
      : null;

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <article>
      {/* ── Hero-секция ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b">
        {/* Фоновый постер (размытый) */}
        {heroImage?.url && (
          <div className="absolute inset-0">
            <Image
              src={heroImage.url}
              alt=""
              fill
              className="object-cover blur-2xl scale-110 opacity-20"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}

        <div className="container relative mx-auto px-4 py-8">
          {/* Кнопка «Назад» */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Назад
            </button>
          </motion.div>

          {/* Заголовок + Миниатюра */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-end gap-6"
          >
            {/* Миниатюра */}
            {heroImage?.url && (
              <div className="relative hidden aspect-[3/2] w-[160px] h-[260px] shrink-0 overflow-hidden rounded-sm border shadow-sm sm:block lg:w-[200px]">
                <Image
                  src={heroImage.url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="200px"
                  priority
                />
              </div>
            )}

            {/* Текстовый блок */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                {/* Теги */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-sm px-2 py-0.5 text-xs"
                      >
                        <Tag size={10} className="mr-1" />
                        {TAG_LABELS[tag] ?? tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Дата */}
                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Контент ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <RichText
              content={post.content}
              className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-2 prose-p:text-base prose-p:leading-relaxed prose-p:text-justify prose-p:my-2 prose-li:my-0.5 prose-hr:my-4"
            />
          </motion.div>

          {/* Поделиться */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-10 border-t pt-6"
          >
            <button
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2 text-sm transition-colors hover:bg-accent"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Скопировано
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  Поделиться
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>
    </article>
  );
};

export default BlogDetailClient;
