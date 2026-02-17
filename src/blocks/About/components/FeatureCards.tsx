import { ANIMATIONS } from '@/utilities/constants';
import { FC, JSX } from 'react';
import { motion } from 'framer-motion';
import { AboutBlockProps } from '../Component';

// Типизация для пропсов компонента
type FeaturesItem = NonNullable<
  AboutBlockProps['featuresSection']['items']
>[number];

type Props = {
  items: FeaturesItem[];
};

/**
 * Компонент для отображения карточек особенностей
 * @param items - Массив особенностей
 * @returns {JSX.Element}
 */
export const FeatureCards: FC<Props> = ({ items }): JSX.Element => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={ANIMATIONS.containerVariants}
      className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3"
    >
      {/* Отображение списка особенностей */}
      {items?.map((item: FeaturesItem) => (
        <motion.div
          key={item.id}
          variants={ANIMATIONS.itemVariants}
          className="group flex flex-col items-start"
        >
          {/* Отображение иконки */}
          {item.icon && (
            <div className="bg-primary/10 group-hover:bg-primary/20 mb-6 flex h-10 w-10 items-center justify-center rounded-sm border border-primary/20 transition-colors">
              <div
                className="text-primary h-7 w-7 flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
            </div>
          )}

          {/* Отображение заголовка */}
          <h3 className="mb-3 text-xl font-bold tracking-tight">
            {item.title}
          </h3>

          {/* Отображение описания */}
          <p className="text-muted-foreground leading-relaxed">{item.text}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
