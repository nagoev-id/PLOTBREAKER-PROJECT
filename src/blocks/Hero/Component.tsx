'use client';
import { FC } from 'react';
import { PageCollection } from '@/utilities/types';
import { motion, Variants } from 'framer-motion';
import { CMSLink } from '@/components/shared/link';
import { BLOCK_TYPES } from '@/utilities/constants';

/**
 * Типизация для пропсов блока "Hero".
 * Извлекается из общей схемы страницы Payload CMS.
 */
type HeroBlockProps = Extract<
  NonNullable<PageCollection['layout']>[number],
  { blockType: typeof BLOCK_TYPES.hero }
>;

/**
 * Варианты анимации для плавного появления контента.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

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
      variants={containerVariants}
      className="border-border container mx-auto grid place-items-center items-center space-y-6 border-b px-4 py-20 text-center md:py-32 xl:space-y-10"
    >
      <div className="max-w-4xl space-y-6">
        {heroTitle && (
          <motion.h1
            variants={itemVariants}
            className="text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {heroTitle}
          </motion.h1>
        )}

        {heroText && (
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl"
          >
            {heroText}
          </motion.p>
        )}

        {Array.isArray(links) && links.length > 0 && (
          <motion.div
            variants={itemVariants}
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
