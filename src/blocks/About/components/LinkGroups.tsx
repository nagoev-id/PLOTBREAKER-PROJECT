import { FC, JSX } from 'react';
import { motion } from 'framer-motion';

import { ANIMATIONS } from '@/utilities/constants';
import { AboutBlockProps } from '@/blocks/About/Component';
import { CMSLink } from '@/components/shared';

// Типизация для пропсов компонента
type UsefulLinksColumn = NonNullable<
  AboutBlockProps['usefulLinksSection']['items']
>[number];

type UsefulLinksItem = NonNullable<UsefulLinksColumn['links']>[number];

type Props = {
  items: UsefulLinksColumn[];
};

/**
 * Компонент для отображения групп ссылок
 * @param items - Массив столбцов ссылок
 * @returns {JSX.Element}
 */
export const LinkGroups: FC<Props> = ({ items }): JSX.Element => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={ANIMATIONS.containerVariants}
      className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
    >
      {/* Отображение списка полезных ссылок */}
      {items?.map((column: UsefulLinksColumn) => (
        <motion.div
          key={column.id}
          variants={ANIMATIONS.itemVariants}
          className="flex flex-col space-y-6"
        >
          {/* Отображение заголовка */}
          <h3 className="text-xl font-bold tracking-tight">{column.title}</h3>
          {/* Отображение списка ссылок */}
          <div className="flex flex-col space-y-4">
            {column.links?.map((linkItem: UsefulLinksItem) => (
              <div key={linkItem.id} className="group">
                <CMSLink
                  {...linkItem.link}
                  className="border-border bg-card hover:border-primary/50 hover:bg-primary/5 block border p-5 transition-all hover:shadow-sm"
                  appearance="inline"
                  newTab={true}
                >
                  <h4 className="group-hover:text-primary font-semibold transition-colors">
                    {linkItem.title}
                  </h4>
                  {linkItem.text && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {linkItem.text}
                    </p>
                  )}
                </CMSLink>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
