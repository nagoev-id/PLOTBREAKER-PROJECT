import { FC, JSX } from 'react';

type Props = {
  children: React.ReactNode;
  sectionClass?: string;
  containerClass?: string;
};

export const SectionContainer: FC<Props> = ({
  children,
  sectionClass,
  containerClass,
}): JSX.Element => {
  return (
    <section className={`px-6 py-4 md:py-8 xl:py-10 ${sectionClass}`}>
      <div
        className={`container mx-auto max-w-6xl space-y-6 ${containerClass}`}
      >
        {children}
      </div>
    </section>
  );
};
