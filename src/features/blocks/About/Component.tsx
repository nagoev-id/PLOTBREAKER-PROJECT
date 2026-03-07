'use client';
import { FC, JSX } from 'react';

import { BLOCK_TYPES } from '@/lib/constants';
import type { Page } from '@/payload-types';

import {
  FeatureCards,
  LinkGroups,
  SectionContainer,
  SectionHeading,
} from '@/features/blocks/About/components';

export type AboutBlockProps = Extract<
  NonNullable<Page['layout']>[number],
  { blockType: typeof BLOCK_TYPES.about }
>;

export const AboutBlock: FC<AboutBlockProps> = ({
  featuresSection,
  usefulLinksSection,
  blockType: _blockType,
}): JSX.Element => {
  return (
    <>
      <SectionContainer sectionClass="bg-muted/30 border-border border-b border-t">
        <SectionHeading
          title={featuresSection.title}
          text={featuresSection.text}
        />
        <FeatureCards items={featuresSection.items ?? []} />
      </SectionContainer>

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
