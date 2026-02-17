import { FC, JSX } from 'react';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '@/utilities/constants';
import { cn } from '@/lib/utils';

// Типизация для пропсов компонента
type Props = {
  title: string | null | undefined;
  text: string | null | undefined;
  className?: string;
};

/**
 * Универсальный компонент заголовка секции
 * @param title - Заголовок
 * @param text - Описание
 * @param className - Дополнительные стили
 */
export const SectionHeading: FC<Props> = ({
  title,
  text,
  className,
}): JSX.Element => {
  if (!title && !text) return <></>;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={ANIMATIONS.itemVariants}
      className={cn('text-center space-y-1 md:space-y-2', className)}
    >
      {title && (
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
      )}
      {text && (
        <div className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed md:text-lg">
          {text}
        </div>
      )}
    </motion.div>
  );
};
