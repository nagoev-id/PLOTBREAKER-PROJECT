'use client';

import React, { FC } from 'react';
import type { Page, Media } from '@/payload-types';
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
 * Извлекает URL видео из поля `backgroundVideo` блока.
 * Поле может быть числом (ID) или объектом Media с полем `url`.
 */
const getVideoUrl = (
  backgroundVideo: number | Media | null | undefined
): string | undefined => {
  if (!backgroundVideo || typeof backgroundVideo === 'number') return undefined;
  return backgroundVideo.url ?? undefined;
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
          case 'hero': {
            const videoUrl = getVideoUrl(
              'backgroundVideo' in block
                ? (block.backgroundVideo as number | Media | null | undefined)
                : undefined
            );

            return (
              <HeroBlock
                key={index}
                {...block}
                fullHeight={Boolean(videoUrl)}
                backgroundVideoSrc={videoUrl}
                enableAudioToggle={Boolean(videoUrl)}
              />
            );
          }
          case 'about':
            return <AboutBlock key={index} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
};
