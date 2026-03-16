'use client';

import { FC, FormEvent, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Loader2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { lexicalToMarkdown } from '@/lib/lexicalToMarkdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  MEDIA_CONTENT_TYPES,
  MEDIA_CONTENT_STATUS,
  MEDIA_CONTENT_PERSONAL_OPINION,
  GENRES,
} from '@/lib/constants';
import type {
  Title as MediaContent,
  List as Collection,
} from '@/payload-types';
import {
  KpSearchDashboard,
  TmdbSearchDashboard,
  type SearchFillData,
} from '@/components/shared/dashboard/ExternalSearch';

interface EntryFormProps {
  entry?: MediaContent | null;
  collections: Collection[];
}

/**
 * Форма создания/редактирования записи медиа-контента.
 */
export const EntryForm: FC<EntryFormProps> = ({ entry, collections }) => {
  const router = useRouter();
  const isEditing = !!entry;
  const [loading, setLoading] = useState(false);

  // Основная информация
  const [title, setTitle] = useState(entry?.title || '');
  const [originalTitle, setOriginalTitle] = useState(
    entry?.originalTitle || ''
  );
  const [synopsis, setSynopsis] = useState(entry?.synopsis || '');
  const [type, setType] = useState<string>(entry?.type || 'film');
  const [status, setStatus] = useState<string>(entry?.status ?? 'planned');
  const [personalOpinion, setPersonalOpinion] = useState<string>(
    entry?.personalOpinion ?? 'neutral'
  );
  const [posterUrl, setPosterUrl] = useState(entry?.posterUrl || '');
  const [review, setReview] = useState(() =>
    entry?.review ? lexicalToMarkdown(entry.review) : ''
  );
  const [promptStatus, setPromptStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  // Детали
  const [director, setDirector] = useState(entry?.director || '');
  const [releaseYear, setReleaseYear] = useState<string>(
    entry?.releaseYear?.toString() || ''
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    entry?.genres || []
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    () => {
      if (!entry?.collections) return [];
      return (entry.collections as (number | Collection)[]).map((c) =>
        typeof c === 'number' ? String(c) : String(c.id)
      );
    }
  );

  // Рейтинги
  const [tmdbRating, setTmdbRating] = useState<string>(
    entry?.tmdbRating?.toString() || ''
  );
  const [kpRating, setKpRating] = useState<string>(
    entry?.kpRating?.toString() || ''
  );

  // Внешние ID
  const [kinopoiskId, setKinopoiskId] = useState(entry?.kinopoiskId || '');

  // Публикация и даты
  const [isPublished, setIsPublished] = useState(entry?.isPublished ?? false);
  const [watchDate, setWatchDate] = useState(entry?.watchDate?.split('T')[0] || '');
  const [visualTags, setVisualTags] = useState(entry?.visualTags || '');

  useEffect(() => {
    if (entry) {
      console.log(entry);
      setTitle(entry.title || '');
      setOriginalTitle(entry.originalTitle || '');
      setSynopsis(entry.synopsis || '');
      setType(entry.type || 'film');
      setStatus(entry.status ?? 'planned');
      setPersonalOpinion(entry.personalOpinion ?? 'neutral');
      setPosterUrl(entry.posterUrl || '');
      setDirector(entry.director || '');
      setReleaseYear(entry.releaseYear?.toString() || '');

      setSelectedGenres(entry.genres || []);
      setTmdbRating(entry.tmdbRating?.toString() || '');
      setKpRating(entry.kpRating?.toString() || '');
      setKinopoiskId(entry.kinopoiskId || '');
      setIsPublished(entry.isPublished ?? false);
      setWatchDate(entry.watchDate?.split('T')[0] || '');
      setVisualTags(entry.visualTags || '');

      // Коллекции могут быть ID или объектами
      const collIds = (entry.collections || []).map((c: number | Collection) =>
        typeof c === 'number' ? String(c) : String(c.id)
      );
      setSelectedCollections(collIds);
    }
  }, [entry]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleCollectionToggle = (collId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collId)
        ? prev.filter((c) => c !== collId)
        : [...prev, collId]
    );
  };

  /**
   * Обработчик заполнения формы из внешнего поиска (KP / TMDB).
   */
  const handleExternalFill = useCallback((data: SearchFillData) => {
    if (data.title) setTitle(data.title);
    if (data.originalTitle) setOriginalTitle(data.originalTitle);
    if (data.posterUrl) setPosterUrl(data.posterUrl);
    if (data.synopsis) setSynopsis(data.synopsis);
    if (data.director) setDirector(data.director);
    if (data.type) setType(data.type);
    if (data.kinopoiskId) setKinopoiskId(data.kinopoiskId);
    if (data.releaseYear) setReleaseYear(String(data.releaseYear));

    if (data.tmdbRating) setTmdbRating(String(data.tmdbRating));
    if (data.kpRating) setKpRating(String(data.kpRating));
    if (data.genres && data.genres.length > 0) setSelectedGenres(data.genres);
  }, []);

  /**
   * Генерирует промт для AI и копирует в буфер обмена.
   */
  const handleCopyPrompt = useCallback(async () => {
    const contentTypeText =
      type === 'series'
        ? 'сериала'
        : type === 'cartoon'
          ? 'мультфильма'
          : 'фильма';

    const prompt = `Твоя задача: создать ПОДРОБНЫЙ и РАЗВЁРНУТЫЙ пересказ ${contentTypeText} "${title}" (${originalTitle || ''}, ${releaseYear || ''}) со всеми спойлерами, который погрузит читателя в атмосферу и полностью раскроет все нюансы сюжета.

Структура подробного пересказа:

1. Введение в мир фильма (4-5 предложений)
   - Детально опиши сеттинг: время, место, атмосферу
   - Представь каждого ключевого персонажа с их предысторией
   - Раскрой начальную ситуацию и настроение

2. Завязка и первый акт (6-8 предложений)
   - Подробно опиши инициирующее событие
   - Как герои реагируют и какие решения принимают
   - Какие отношения складываются между персонажами
   - Что мотивирует каждого героя

3. Развитие сюжета — второй акт (10-15 предложений)
   - Детально раскрой КАЖДЫЙ важный поворот сюжета
   - Опиши ключевые сцены с эмоциональными деталями
   - Раскрой все секреты, предательства и откровения по мере их появления
   - Покажи эволюцию персонажей и их взаимоотношений
   - Включи важные диалоги и их значение
   - Опиши нарастание напряжения

4. Кульминация (5-7 предложений)
   - Детально опиши финальное противостояние или ключевой момент истины
   - Раскрой внутренние конфликты персонажей
   - Покажи, как используются все ранее установленные элементы сюжета
   - Опиши эмоциональный пик истории

5. Развитие и финал (4-6 предложений)
   - Подробно опиши судьбу КАЖДОГО важного персонажа
   - Раскрой все оставшиеся вопросы и тайны
   - Объясни символизм и смысл концовки
   - Какое послание или эмоцию оставляет фильм

6. Важные детали и нюансы (3-4 предложения)
   - Упомяни значимые визуальные метафоры или символы
   - Отметь неочевидные детали, которые обогащают понимание
   - Укажи на связи и параллели внутри сюжета

Требования к стилю:
- Язык: живой, эмоциональный, насыщенный деталями
- Тон: увлечённый рассказчик, который помнит каждую сцену
- НЕ СОКРАЩАЙ описания важных моментов
- Используй конкретные примеры сцен, а не общие фразы
- Передавай атмосферу и эмоции, а не только факты

Важно: это ПОЛНЫЙ пересказ СО ВСЕМИ спойлерами. Раскрывай абсолютно все сюжетные линии, твисты, смерти, секреты, финальные откровения и даже сцены после титров. Чем детальнее — тем лучше.

В конце выпиши все плюсы и минусы фильма по мнению критиков и зрителей.


Форматирование:
- Вывод результата ответа в .md формате в виде кода
- Верни очищенный текст без сносок.
- Удали все квадратные скобки со сносками вида.
- Используй Markdown для заголовков (## для разделов).
- Используй **жирный** для акцентов.
- Используй > для цитат.
- Разделяй части горизонтальной линией (---).
- Не используй англоицизмы в ответе`;

    try {
      await navigator.clipboard.writeText(prompt);
      setPromptStatus('copied');
      setTimeout(() => setPromptStatus('idle'), 2000);
    } catch {
      setPromptStatus('error');
      setTimeout(() => setPromptStatus('idle'), 3000);
    }
  }, [title, originalTitle, releaseYear, type]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        synopsis: synopsis.trim() || undefined,
        type,
        status,
        personalOpinion,
        posterUrl: posterUrl.trim() || undefined,
        director: director.trim() || undefined,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,

        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        collections:
          selectedCollections.length > 0
            ? selectedCollections.map((id) => parseInt(id, 10))
            : undefined,
        tmdbRating: tmdbRating ? parseFloat(tmdbRating) : undefined,
        kpRating: kpRating ? parseFloat(kpRating) : undefined,
        kinopoiskId: kinopoiskId.trim() || undefined,
        review: review.trim() || undefined,
        isPublished,
        watchDate: watchDate || undefined,
        visualTags: visualTags.trim() || undefined,
      };

      const url = isEditing
        ? `/api/dashboard/entries/${entry!.id}`
        : '/api/dashboard/entries';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка сохранения');
      }

      toast.success(isEditing ? 'Запись обновлена' : 'Запись создана');
      router.push('/dashboard/entries');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/entries')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
        </Button>
      </div>

      {/* Кнопки поиска KP и TMDB */}
      <div className="grid gap-3 md:grid-cols-2">
        <KpSearchDashboard
          onFill={handleExternalFill}
          originalTitle={originalTitle}
        />
        <TmdbSearchDashboard
          onFill={handleExternalFill}
          originalTitle={originalTitle}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Основная область */}
        <div className="space-y-6 lg:col-span-2">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="entry-title">Название (RU) *</Label>
            <Input
              id="entry-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название фильма или сериала"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-original-title">Оригинальное название</Label>
            <Input
              id="entry-original-title"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              placeholder="Original Title"
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="entry-synopsis">Описание (Синопсис)</Label>
            <Textarea
              id="entry-synopsis"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Краткое описание..."
              rows={4}
            />
          </div>

          {/* Отзыв (пересказ) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="entry-review">Отзыв / Пересказ (Markdown)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="gap-1.5"
              >
                {promptStatus === 'copied' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />{' '}
                    Скопировано!
                  </>
                ) : promptStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />{' '}
                    Ошибка
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Скопировать промт
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="entry-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Вставьте сюда результат от AI (в формате Markdown)..."
              rows={10}
              className="font-mono text-sm"
            />
            {review && (
              <p className="text-muted-foreground text-xs">
                {review.length} символов • будет конвертирован из Markdown в
                rich text при сохранении
              </p>
            )}
          </div>
          {/* URL постера */}
          <div className="space-y-2">
            <Label htmlFor="entry-poster-url">URL постера</Label>
            <Input
              id="entry-poster-url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Режиссёр */}
          <div className="space-y-2">
            <Label htmlFor="entry-director">Режиссёр</Label>
            <Input
              id="entry-director"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="Имя режиссёра"
            />
          </div>

          {/* Жанры */}
          <div className="space-y-2">
            <Label>Жанры</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => handleGenreToggle(genre.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedGenres.includes(genre.value)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/50'
                  }`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Коллекции */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label>Коллекции</Label>
              <div className="flex flex-wrap gap-2">
                {collections.map((coll) => (
                  <button
                    key={coll.id}
                    type="button"
                    onClick={() => handleCollectionToggle(String(coll.id))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCollections.includes(String(coll.id))
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/50'
                    }`}
                  >
                    {coll.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Тип контента */}
          <div className="space-y-2">
            <Label>Тип контента</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_CONTENT_TYPES.select.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Статус */}
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <span className="truncate">
                  {MEDIA_CONTENT_STATUS.select.find((o) => o.value === status)
                    ?.label ?? 'Выберите статус'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {MEDIA_CONTENT_STATUS.select.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Впечатление */}
          <div className="space-y-2">
            <Label>Впечатление</Label>
            <Select value={personalOpinion} onValueChange={setPersonalOpinion}>
              <SelectTrigger>
                <span className="truncate">
                  {MEDIA_CONTENT_PERSONAL_OPINION.select.find(
                    (o) => o.value === personalOpinion
                  )?.label ?? 'Выберите впечатление'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {MEDIA_CONTENT_PERSONAL_OPINION.select.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Год выхода */}
          <div className="space-y-2">
            <Label htmlFor="entry-release-year">Год выхода</Label>
            <Input
              id="entry-release-year"
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="2024"
              min={1800}
              max={new Date().getFullYear() + 5}
            />
          </div>

          {/* Рейтинг TMDB */}
          <div className="space-y-2">
            <Label htmlFor="entry-tmdb-rating">Рейтинг TMDB</Label>
            <Input
              id="entry-tmdb-rating"
              type="number"
              value={tmdbRating}
              onChange={(e) => setTmdbRating(e.target.value)}
              placeholder="7.5"
              min={0}
              max={10}
              step={0.01}
            />
          </div>

          {/* Рейтинг Кинопоиск */}
          <div className="space-y-2">
            <Label htmlFor="entry-kp-rating">Рейтинг Кинопоиск</Label>
            <Input
              id="entry-kp-rating"
              type="number"
              value={kpRating}
              onChange={(e) => setKpRating(e.target.value)}
              placeholder="7.5"
              min={0}
              max={10}
              step={0.01}
            />
          </div>

          {/* ID Кинопоиск */}
          <div className="space-y-2">
            <Label htmlFor="entry-kp-id">ID Кинопоиск</Label>
            <Input
              id="entry-kp-id"
              value={kinopoiskId}
              onChange={(e) => setKinopoiskId(e.target.value)}
              placeholder="12345"
            />
          </div>

          {/* Дата просмотра */}
          <div className="space-y-2">
            <Label htmlFor="entry-watch-date">Дата просмотра</Label>
            <Input
              id="entry-watch-date"
              type="date"
              value={watchDate}
              onChange={(e) => setWatchDate(e.target.value)}
            />
          </div>

          {/* Визуальные теги */}
          <div className="space-y-2">
            <Label htmlFor="entry-visual-tags">Визуальные теги</Label>
            <Input
              id="entry-visual-tags"
              value={visualTags}
              onChange={(e) => setVisualTags(e.target.value)}
              placeholder="Теги через запятую"
            />
          </div>

          {/* Опубликовано */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              id="entry-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="entry-published" className="cursor-pointer text-sm">
              Опубликовано
            </Label>
          </div>
        </div>
      </div>
    </form>
  );
};
