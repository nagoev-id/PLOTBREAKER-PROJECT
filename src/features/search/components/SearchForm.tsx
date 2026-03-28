import { FC } from 'react';
import { Loader2, Search, X } from 'lucide-react';

type SearchFormProps = {
  query: string;
  onQueryChange: (value: string) => void;
  isLoading: boolean;
  onClose: () => void;
};

export const SearchForm: FC<SearchFormProps> = ({
  query,
  onQueryChange,
  isLoading,
  onClose,
}) => (
  <div className="border-border flex items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
    <Search size={18} className="text-muted-foreground shrink-0 sm:size-5" />
    <input
      type="text"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder="Поиск по названию..."
      className="placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none sm:text-lg"
    />
    {isLoading && (
      <Loader2
        size={18}
        className="text-muted-foreground animate-spin sm:size-5"
      />
    )}
    <button
      onClick={onClose}
      className="hover:bg-accent cursor-pointer rounded-full p-1 transition-colors"
      aria-label="Закрыть"
    >
      <X size={18} className="sm:size-5" />
    </button>
  </div>
);
