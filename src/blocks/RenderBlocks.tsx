'use client';
import React, { FC } from 'react';
import { PageCollection } from '@/utilities/types';
import { HeroBlock } from '@/blocks/Hero/Component';

/**
 * Типизация для массива блоков из макета страницы (Page["layout"]).
 */
type LayoutBlocks = NonNullable<PageCollection['layout']>;

/**
 * Пропсы для компонента RenderBlocks.
 */
interface RenderBlocksProps {
  /** Массив блоков из Payload CMS */
  blocks?: LayoutBlocks | null;
}

/**
 * Словарь компонентов для маппинга blockType -> React Component.
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
          default:
            return null;
        }
      })}
    </>
  );
};
