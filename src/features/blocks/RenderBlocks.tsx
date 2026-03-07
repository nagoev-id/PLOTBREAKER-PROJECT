'use client';

import React, { FC } from 'react';
import type { Page } from '@/payload-types';
import { HeroBlock } from '@/features/blocks/Hero/Component';
import { AboutBlock } from '@/features/blocks/About/Component';

/**
 * Вспомогательный тип, извлекающий массив блоков из поля `layout`
 * коллекции страниц. Использует `NonNullable` для исключения `null | undefined`.
 */
type LayoutBlocks = NonNullable<Page['layout']>;

/**
 * Пропсы компонента {@link RenderBlocks}.
 */
type RenderBlocksProps = {
  /**
   * Массив блоков макета страницы.
   * Каждый блок идентифицируется полем `blockType`,
   * по которому происходит выбор нужного React-компонента.
   *
   * - Если `undefined`, `null` или пустой массив — компонент ничего не рендерит.
   */
  blocks?: LayoutBlocks | null;
};

/**
 * Компонент динамического рендера блоков страницы.
 *
 * Принимает массив блоков из CMS (Payload CMS) и рендерит
 * соответствующий React-компонент для каждого блока на основе поля `blockType`.
 *
 * Неизвестные типы блоков игнорируются (возвращают `null`).
 *
 * @param props - Пропсы компонента {@link RenderBlocksProps}
 * @param props.blocks - Массив блоков для рендера
 * @returns Фрагмент React с набором блок-компонентов или `null`
 *
 * @example
 * // Базовое использование на странице
 * const page = await getPageBySlug('home');
 *
 * return <RenderBlocks blocks={page.layout} />;
 *
 * @example
 * // Если blocks пустой или null — рендерится null
 * <RenderBlocks blocks={null} /> // → null
 * <RenderBlocks blocks={[]}  /> // → null
 */
export const RenderBlocks: FC<RenderBlocksProps> = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const { blockType } = block;

        switch (blockType) {
          case 'hero':
            return <HeroBlock key={index} {...block} />;
          case 'about':
            return <AboutBlock key={index} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
};
