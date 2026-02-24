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
} from '@/utilities/constants';
import type { MediaContent, Collection } from '@/payload-types';
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
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [type, setType] = useState('film');
  const [status, setStatus] = useState('planned');
  const [personalOpinion, setPersonalOpinion] = useState('neutral');
  const [posterUrl, setPosterUrl] = useState('');
  const [review, setReview] = useState('');
  const [promptStatus, setPromptStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  // Детали
  const [director, setDirector] = useState('');
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Рейтинги
  const [tmdbRating, setTmdbRating] = useState<string>('');
  const [kpRating, setKpRating] = useState<string>('');

  // Внешние ID
  const [kinopoiskId, setKinopoiskId] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setOriginalTitle(entry.originalTitle || '');
      setSynopsis(entry.synopsis || '');
      setType(entry.type || 'film');
      setStatus(entry.status || 'planned');
      setPersonalOpinion(entry.personalOpinion || 'neutral');
      setPosterUrl(entry.posterUrl || '');
      // review — richText, пустое значение (заполняется через paste markdown)
      setDirector(entry.director || '');
      setReleaseYear(entry.releaseYear?.toString() || '');
      setDuration(entry.duration?.toString() || '');
      setSelectedGenres(entry.genres || []);
      setTmdbRating(entry.tmdbRating?.toString() || '');
      setKpRating(entry.kpRating?.toString() || '');
      setKinopoiskId(entry.kinopoiskId || '');

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
    if (data.duration) setDuration(String(data.duration));
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
2. Завязка и первый акт (6-8 предложений)
3. Развитие сюжета — второй акт (10-15 предложений)
4. Кульминация (5-7 предложений)
5. Развитие и финал (4-6 предложений)
6. Важные детали и нюансы (3-4 предложения)

Требования к стилю:
- Язык: живой, эмоциональный, насыщенный деталями
- Тон: увлечённый рассказчик, который помнит каждую сцену
- НЕ СОКРАЩАЙ описания важных моментов
- Используй конкретные примеры сцен, а не общие фразы

Важно: это ПОЛНЫЙ пересказ СО ВСЕМИ спойлерами. В конце выпиши все плюсы и минусы.

Форматирование:
- Вывод в .md формате
- Используй ## для заголовков разделов
- Используй **жирный** для акцентов
- Используй > для цитат
- Разделяй части горизонтальной линией (---)`;

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
        duration: duration ? parseInt(duration, 10) : undefined,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        collections:
          selectedCollections.length > 0
            ? selectedCollections.map((id) => parseInt(id, 10))
            : undefined,
        tmdbRating: tmdbRating ? parseFloat(tmdbRating) : undefined,
        kpRating: kpRating ? parseFloat(kpRating) : undefined,
        kinopoiskId: kinopoiskId.trim() || undefined,
        review: review.trim() || undefined,
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
      <div className="flex flex-wrap gap-3">
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
                <SelectValue />
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
                <SelectValue />
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
                <SelectValue />
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

          {/* Длительность */}
          <div className="space-y-2">
            <Label htmlFor="entry-duration">Длительность (мин)</Label>
            <Input
              id="entry-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="120"
              min={1}
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
        </div>
      </div>
    </form>
  );
};
