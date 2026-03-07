'use client';

import { FC, JSX } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  /** Текущее значение */
  value: string;
  /** Callback при изменении значения */
  onValueChange: (value: string) => void;
  /** Список опций */
  options: SelectOption[];
  /** Placeholder для незаполненного Select */
  placeholder: string;
  /** Подпись над Select (необязательно) */
  label?: string;
  /** Дополнительные CSS-классы для обёртки */
  className?: string;
};

/**
 * Переиспользуемый компонент Select с опциональным label.
 */
export const CustomSelect: FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  className,
}): JSX.Element => (
  <div className={className}>
    {label && (
      <span className="text-muted-foreground mb-1 block text-[11px] font-medium uppercase tracking-wide">
        {label}
      </span>
    )}
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="text-xs sm:text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
