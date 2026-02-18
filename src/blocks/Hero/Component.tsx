'use client';
import { FC } from 'react';
import { PageCollection } from '@/utilities/types';
import { motion } from 'framer-motion';
import { CMSLink } from '@/components/shared/link';
import { BLOCK_TYPES, ANIMATIONS } from '@/utilities/constants';

/**
 * Типизация для пропсов блока "Hero".
 * Извлекается из общей схемы страницы Payload CMS.
 */
type HeroBlockProps = Extract<
  NonNullable<PageCollection['layout']>[number],
  { blockType: typeof BLOCK_TYPES.hero }
>;

/**
 * Главный блок страницы (HeroBlock).
 *
 * Предназначен для первого экрана. Отображает крупный заголовок,
 * подзаголовок и до двух призывов к действию (CTA).
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
      className="container mx-auto grid place-items-center text-center space-y-6 xl:space-y-10 px-6 py-4 md:py-8 xl:py-18"
    >
      <div className="max-w-4xl space-y-2 md:space-y-6">
        {/* Заголовок */}
        {heroTitle && (
          <motion.h1
            variants={ANIMATIONS.itemVariants}
            className="text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {heroTitle}
          </motion.h1>
        )}

        {/* Подзаголовок */}
        {heroText && (
          <motion.p
            variants={ANIMATIONS.itemVariants}
            className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg leading-relaxed"
          >
            {heroText}
          </motion.p>
        )}

        {/* Кнопки */}
        {Array.isArray(links) && links.length > 0 && (
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
