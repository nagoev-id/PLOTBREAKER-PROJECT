'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import type { Page } from '@/payload-types';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { ANIMATIONS } from '@/lib/constants';
import { CMSLink } from '@/components/shared';
import { BLOCK_SLUGS } from '@/payload/config/blocks';

/**
 * Тип пропсов для блока `hero`, извлечённый из union-типа `layout`
 * коллекции страниц с помощью утилиты `Extract`.
 *
 * Гарантирует, что компонент получит только те поля,
 * которые соответствуют блоку с `blockType === BLOCK_TYPES.hero`.
 */
type HeroBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: typeof BLOCK_SLUGS.hero }
> & {
  fullHeight?: boolean;
  backgroundVideoSrc?: string;
  enableAudioToggle?: boolean;
};

/**
 * Блок-компонент Hero — главный баннер страницы.
 *
 * Рендерит анимированную секцию с заголовком, подзаголовком и набором CTA-ссылок.
 *
 * @param props - Пропсы, соответствующие схеме Hero-блока в Payload CMS
 * @param props.heroTitle - Главный заголовок секции (`<h1>`)
 * @param props.heroText - Подзаголовок / описание секции (`<p>`)
 * @param props.links - Массив CTA-ссылок; каждый элемент содержит объект `link`
 *   для компонента {@link CMSLink}
 * @returns Анимированная `<section>` с контентом Hero-блока
 */
export const HeroBlock: FC<HeroBlockProps> = ({
  heroTitle,
  heroText,
  links,
  fullHeight = false,
  backgroundVideoSrc,
  enableAudioToggle = false,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const hasVideoBg = Boolean(backgroundVideoSrc);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleMute = useCallback(() => {
    if (!enableAudioToggle) return;
    setIsMuted((prev) => !prev);
  }, [enableAudioToggle]);

  useEffect(() => {
    if (!hasVideoBg || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { threshold: [0, 0.2, 0.4, 0.7, 1] }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasVideoBg]);

  useEffect(() => {
    if (!hasVideoBg || !videoRef.current) return;

    const video = videoRef.current;
    const syncPlayback = async () => {
      if (isHeroInView && document.visibilityState === 'visible') {
        try {
          await video.play();
        } catch {
          // Игнорируем ошибки autoplay/promise rejection.
        }
      } else {
        video.pause();
      }
    };

    void syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [hasVideoBg, isHeroInView]);

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate="visible"
      variants={ANIMATIONS.containerVariants}
      onClick={toggleMute}
      className={`relative grid place-items-center overflow-hidden px-6 text-center ${
        fullHeight
          ? 'min-h-[calc(100svh-4rem)] py-10 md:py-12 xl:py-18'
          : 'space-y-6 bg-foreground/2 py-4 md:py-8 xl:space-y-10 xl:py-18'
      }`}
    >
      {hasVideoBg && (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            src={backgroundVideoSrc}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            preload="metadata"
          />
          <div className="absolute inset-0 z-10 bg-black/45 backdrop-brightness-75" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.55)_90%)]" />
        </>
      )}

      <div
        className={`relative z-20 container mx-auto max-w-4xl space-y-2 md:space-y-6 ${
          hasVideoBg ? 'text-white' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {heroTitle && (
          /**
           * Заголовок H1 — виден поисковым роботам и скринридерам.
           * Анимируется через `ANIMATIONS.itemVariants` (fade + slide up).
           */
          <motion.h1
            variants={ANIMATIONS.itemVariants}
            className="text-3xl leading-[1.08] font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {heroTitle}
          </motion.h1>
        )}

        {heroText && (
          /**
           * Описательный параграф под заголовком.
           * Ограничен по ширине (`max-w-2xl`) для читаемости.
           */
          <motion.p
            variants={ANIMATIONS.itemVariants}
            className={`mx-auto max-w-2xl text-base leading-relaxed md:text-lg ${
              hasVideoBg ? 'text-white/80' : 'text-muted-foreground'
            }`}
          >
            {heroText}
          </motion.p>
        )}

        {Array.isArray(links) && links.length > 0 && (
          /**
           * Группа CTA-кнопок.
           * Рендерится только при наличии хотя бы одной ссылки.
           * Использует `flex-wrap` для корректного отображения на мобильных.
           */
          <motion.div
            variants={ANIMATIONS.itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            {links.map(({ link }, i) => {
              const isOutline = link.appearance === 'outline';
              const heroButtonClass = hasVideoBg
                ? [
                    'min-w-[220px] rounded-2xl px-6 py-6 text-base font-semibold',
                    'shadow-lg shadow-black/25 transition-all duration-300',
                    isOutline
                      ? 'border-zinc-300/90 bg-white/95 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900/55 dark:text-white dark:hover:bg-zinc-800/85'
                      : 'bg-zinc-900/90 text-white hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
                  ].join(' ')
                : undefined;

              return <CMSLink key={i} {...link} className={heroButtonClass} />;
            })}
          </motion.div>
        )}
      </div>

      {hasVideoBg && enableAudioToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((prev) => !prev);
          }}
          className="absolute right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/45 md:right-6 md:bottom-6 md:text-sm"
          aria-pressed={!isMuted}
          aria-label={isMuted ? 'Включить звук видео' : 'Отключить звук видео'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          {isMuted ? 'Звук выкл' : 'Звук вкл'}
        </button>
      )}
    </motion.section>
  );
};
