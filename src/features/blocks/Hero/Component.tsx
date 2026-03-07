'use client';

import { FC } from 'react';
import type { Page } from '@/payload-types';
import { motion } from 'framer-motion';
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
>;

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
}) => {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={ANIMATIONS.containerVariants}
      className="grid place-items-center text-center space-y-6 xl:space-y-10 px-6 py-4 md:py-8 xl:py-18 bg-foreground/2"
    >
      <div className="container mx-auto max-w-4xl space-y-2 md:space-y-6">
        {heroTitle && (
          /**
           * Заголовок H1 — виден поисковым роботам и скринридерам.
           * Анимируется через `ANIMATIONS.itemVariants` (fade + slide up).
           */
          <motion.h1
            variants={ANIMATIONS.itemVariants}
            className="text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
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
            className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg leading-relaxed"
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
            {links.map(({ link }, i) => (
              <CMSLink key={i} {...link} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
