'use client';

import { FC, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag } from 'lucide-react';

import { ANIMATIONS } from '@/utilities/constants';
import { MediaContentCollection, UserCollection } from '@/utilities/types';
import { MovieCard } from '@/components/shared';

// Описание типов пропсов
type TagPageClientProps = {
  items: MediaContentCollection[];
  tag: string;
  user?: UserCollection | null;
};

/**
 * Клиентский компонент страницы фильтрации по тегу.
 * Отображает заголовок с тегом и сетку карточек.
 *
 * @param items - Массив записей с данным тегом
 * @param tag - Декодированный тег
 * @param user - Текущий пользователь (для AdminActions в карточках)
 * @returns {JSX.Element}
 */
const TagPageClient: FC<TagPageClientProps> = ({
  items,
  tag,
  user,
}): JSX.Element => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Кнопка «Назад» */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Назад
        </button>
      </motion.div>

      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Tag size={20} className="text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">#{tag}</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {items.length}{' '}
          {items.length === 1
            ? 'запись'
            : items.length < 5
              ? 'записи'
              : 'записей'}
        </p>
      </motion.div>

      {/* Сетка карточек */}
      <motion.div
        variants={ANIMATIONS.containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={ANIMATIONS.itemVariants}>
            <MovieCard item={item} user={user} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TagPageClient;
