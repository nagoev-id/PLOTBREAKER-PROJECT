'use client';
import { FC, JSX } from 'react';
import { PageCollection } from '@/utilities/types';
import { BLOCK_TYPES } from '@/utilities/constants';
import {
  FeatureCards,
  LinkGroups,
  SectionContainer,
  SectionHeading,
} from '@/blocks/About/components';

/**
 * Типизация для пропсов блока "About".
 * Извлекается из общей схемы страницы Payload CMS.
 */
export type AboutBlockProps = Extract<
  NonNullable<PageCollection['layout']>[number],
  { blockType: typeof BLOCK_TYPES.about }
>;

/**
 * Блок "О проекте", который отображает список особенностей и полезных ссылок.
 * @param featuresSection - Секция с особенностями.
 * @param usefulLinksSection - Секция с полезными ссылками.
 * @returns {JSX.Element}.
 */
export const AboutBlock: FC<AboutBlockProps> = ({
  featuresSection,
  usefulLinksSection,
  blockType: _blockType,
}): JSX.Element => {
  return (
    <>
      {/* Секция с особенностями */}
      <SectionContainer sectionClass="bg-muted/30 border-border border-b border-t">
        <SectionHeading
          title={featuresSection.title}
          text={featuresSection.text}
        />
        <FeatureCards items={featuresSection.items ?? []} />
      </SectionContainer>

      {/* Секция полезных ссылок */}
      <SectionContainer>
        <SectionHeading
          title={usefulLinksSection.title}
          text={usefulLinksSection.text}
        />
        <LinkGroups items={usefulLinksSection.items ?? []} />
      </SectionContainer>
    </>
  );
};
