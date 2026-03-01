'use client';

import { FC, JSX, useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Loader2,
  Monitor,
  ChevronDown,
  AlertCircle,
  Languages,
  Tv,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/utilities/utils';
import Artplayer from 'artplayer';
import { useAuth } from './AuthProvider';

// ============================================================================
// Типы
// ============================================================================

interface StreamVideos {
  [resolution: string]: string[];
}

interface StreamSubtitles {
  [lang: string]: {
    title: string;
    link: string;
  };
}

interface StreamResponse {
  name: string | null;
  season: string | null;
  episode: string | null;
  videos: StreamVideos;
  subtitles: StreamSubtitles;
}

interface TranslatorInfo {
  name: string;
  premium: boolean;
}

interface EpisodeInfo {
  episode: number;
  episode_text: string;
}

interface SeasonInfo {
  season: number;
  season_text: string;
  episodes: EpisodeInfo[];
}

interface InfoResponse {
  name: string;
  type: string;
  thumbnail: string;
  translators: Record<string, TranslatorInfo>;
  seriesInfo: SeasonInfo[] | null;
}

interface VideoPlayerProps {
  hdrezkaUrl: string;
  title: string;
  type?: string;
}

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

const Selector: FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: JSX.Element;
}> = ({ label, value, options, onChange, icon }) => (
  <div className="flex flex-col gap-1">
    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
      {label}
    </span>
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm transition-colors',
          'hover:border-foreground/30 focus:border-foreground/50 focus:outline-none cursor-pointer',
          icon && 'pl-9'
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  </div>
);

// ============================================================================
// Основной компонент
// ============================================================================

const VideoPlayer: FC<VideoPlayerProps> = ({
  hdrezkaUrl,
  title,
  type,
}): JSX.Element | null => {
  // UI
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Данные
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [stream, setStream] = useState<StreamResponse | null>(null);

  // Параметры
  const [selectedTranslator, setSelectedTranslator] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [selectedEpisode, setSelectedEpisode] = useState<string>('1');

  // Artplayer
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);

  const isSeries =
    type === 'series' || (info?.type ? info.type.includes('series') : false);

  // Загрузка информации
  const loadInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/rezka/info?url=${encodeURIComponent(hdrezkaUrl)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Ошибка ${res.status}`);
      }
      const data: InfoResponse = await res.json();
      setInfo(data);

      const translatorIds = Object.keys(data.translators || {});
      if (translatorIds.length > 0) setSelectedTranslator(translatorIds[0]);

      if (data.seriesInfo && data.seriesInfo.length > 0) {
        setSelectedSeason(String(data.seriesInfo[0].season));
        if (data.seriesInfo[0].episodes.length > 0) {
          setSelectedEpisode(String(data.seriesInfo[0].episodes[0].episode));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [hdrezkaUrl]);

  // Загрузка потока
  const loadStream = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ url: hdrezkaUrl });
      if (isSeries) {
        params.set('season', selectedSeason);
        params.set('episode', selectedEpisode);
      }
      if (selectedTranslator) params.set('translation', selectedTranslator);

      const res = await fetch(`/api/rezka/stream?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Ошибка ${res.status}`);
      }
      const data: StreamResponse = await res.json();
      setStream(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [
    hdrezkaUrl,
    isSeries,
    selectedSeason,
    selectedEpisode,
    selectedTranslator,
  ]);

  // Открытие плеера
  const handleOpen = async () => {
    setIsOpen(true);
    if (!info) await loadInfo();
  };

  // Загрузка потока после получения info
  useEffect(() => {
    if (info && !stream) loadStream();
  }, [info, stream, loadStream]);

  // Refs для доступа из Artplayer callbacks
  const stateRef = useRef({
    translator: selectedTranslator,
    season: selectedSeason,
    episode: selectedEpisode,
  });
  useEffect(() => {
    stateRef.current = {
      translator: selectedTranslator,
      season: selectedSeason,
      episode: selectedEpisode,
    };
  }, [selectedTranslator, selectedSeason, selectedEpisode]);

  // Callback refs для изменения из Artplayer
  const changeHandlersRef = useRef({
    setTranslator: (val: string) => {
      setSelectedTranslator(val);
      setStream(null);
    },
    setSeason: (val: string) => {
      setSelectedSeason(val);
      setSelectedEpisode('1');
      setStream(null);
    },
    setEpisode: (val: string) => {
      setSelectedEpisode(val);
      setStream(null);
    },
    nextEpisode: () => {},
  });

  // ===================== Artplayer =====================
  useEffect(() => {
    if (!stream || !artRef.current) return;

    const videos = stream.videos || {};
    const qualities = Object.keys(videos);
    if (qualities.length === 0) return;

    // Сортируем качества по убыванию
    const sortedQualities = qualities.sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numB - numA;
    });

    // Лучшее качество по умолчанию
    const preferred = ['1080p', '1080p Ultra', '720p', '480p', '360p'];
    const defaultQuality =
      preferred.find((q) => sortedQualities.includes(q)) || sortedQualities[0];
    const defaultUrl = videos[defaultQuality]?.[0] || '';

    // Destroy previous
    if (playerRef.current) {
      playerRef.current.destroy(false);
      playerRef.current = null;
    }

    // Субтитры (только если они есть)
    const subs = stream.subtitles || {};
    const subKeys = Object.keys(subs);
    const subtitleOption =
      subKeys.length > 0
        ? {
            url: subs[subKeys[0]]?.link || '',
            type: 'vtt' as const,
            style: {
              color: '#fff',
              fontSize: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            },
            encoding: 'utf-8',
          }
        : undefined;

    // ===== Настройки (settings) =====
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsItems: any[] = [];

    // Озвучка
    if (info && Object.keys(info.translators).length > 0) {
      settingsItems.push({
        html: 'Озвучка',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
        selector: Object.entries(info.translators).map(([id, t]) => ({
          html: `${t.name}${t.premium ? ' ⭐' : ''}`,
          value: id,
          default: id === stateRef.current.translator,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect(item: any) {
          changeHandlersRef.current.setTranslator(item.value);
          return item.html;
        },
      });
    }

    // Сезон (для сериалов)
    if (isSeries && info?.seriesInfo && info.seriesInfo.length > 0) {
      settingsItems.push({
        html: 'Сезон',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
        selector: info.seriesInfo.map((s) => ({
          html: s.season_text || `Сезон ${s.season}`,
          value: String(s.season),
          default: String(s.season) === stateRef.current.season,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect(item: any) {
          changeHandlersRef.current.setSeason(item.value);
          return item.html;
        },
      });

      // Серия
      const currentSeasonData = info.seriesInfo.find(
        (s) => String(s.season) === stateRef.current.season
      );
      if (currentSeasonData && currentSeasonData.episodes.length > 0) {
        settingsItems.push({
          html: 'Серия',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
          selector: currentSeasonData.episodes.map((ep) => ({
            html: ep.episode_text || `Серия ${ep.episode}`,
            value: String(ep.episode),
            default: String(ep.episode) === stateRef.current.episode,
          })),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSelect(item: any) {
            changeHandlersRef.current.setEpisode(item.value);
            return item.html;
          },
        });
      }
    }

    // Субтитры
    if (subKeys.length > 1) {
      settingsItems.push({
        html: 'Субтитры',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        selector: [
          { html: 'Выкл', default: false },
          ...Object.entries(subs).map(([lang, sub], idx) => ({
            html: sub.title || lang,
            url: sub.link,
            default: idx === 0,
          })),
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect(item: any) {
          if (item.url) {
            art.subtitle.switch(item.url, { name: '' });
          } else {
            art.subtitle.show = false;
          }
          return item.html;
        },
      });
    }

    // ===== Controls (кнопка "След. серия") =====
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls: any[] = [];
    if (isSeries) {
      controls.push({
        name: 'next-episode',
        position: 'right',
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
        tooltip: 'Следующая серия',
        click() {
          changeHandlersRef.current.nextEpisode();
        },
      });
    }

    const art = new Artplayer({
      container: artRef.current,
      url: defaultUrl,
      volume: 0.7,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: false,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: subKeys.length > 0,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#6366f1',
      lang: 'ru',

      // Переключатель качества
      quality: sortedQualities.map((q) => ({
        default: q === defaultQuality,
        html: q,
        url: videos[q]?.[0] || '',
      })),

      // Субтитры
      ...(subtitleOption ? { subtitle: subtitleOption } : {}),

      // Настройки (озвучка, сезон, серия, субтитры)
      settings: settingsItems,

      // Кнопки управления
      controls,

      // Кастомные стили
      cssVar: {
        '--art-border-radius': '8px',
        '--art-bottom-gap': '12px',
        '--art-control-height': '42px',
        '--art-padding': '0 12px',
      },
    });

    playerRef.current = art;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }
    };
  }, [stream, title, info, isSeries]);

  // Перезагрузка потока при смене озвучки/серии
  const handleTranslatorChange = (val: string) => {
    setSelectedTranslator(val);
    setStream(null);
  };

  const handleSeasonChange = (val: string) => {
    setSelectedSeason(val);
    setSelectedEpisode('1');
    setStream(null);
  };

  const handleEpisodeChange = (val: string) => {
    setSelectedEpisode(val);
    setStream(null);
  };

  // Следующий эпизод
  const goNextEpisode = useCallback(() => {
    if (!info?.seriesInfo) return;
    const season = info.seriesInfo.find(
      (s) => String(s.season) === selectedSeason
    );
    if (!season) return;

    const currentIdx = season.episodes.findIndex(
      (ep) => String(ep.episode) === selectedEpisode
    );

    if (currentIdx < season.episodes.length - 1) {
      // Есть следующая серия в этом сезоне
      setSelectedEpisode(String(season.episodes[currentIdx + 1].episode));
      setStream(null);
    } else {
      // Переход к следующему сезону
      const seasonIdx = info.seriesInfo.findIndex(
        (s) => String(s.season) === selectedSeason
      );
      if (seasonIdx < info.seriesInfo.length - 1) {
        const nextSeason = info.seriesInfo[seasonIdx + 1];
        setSelectedSeason(String(nextSeason.season));
        setSelectedEpisode(
          nextSeason.episodes.length > 0
            ? String(nextSeason.episodes[0].episode)
            : '1'
        );
        setStream(null);
      }
    }
  }, [info, selectedSeason, selectedEpisode]);

  // Привязка goNextEpisode к ref для Artplayer кнопки
  useEffect(() => {
    changeHandlersRef.current.nextEpisode = goNextEpisode;
  }, [goNextEpisode]);

  // Эпизоды текущего сезона
  const currentSeasonEpisodes =
    info?.seriesInfo?.find((s) => String(s.season) === selectedSeason)
      ?.episodes || [];

  return (
    <div className="w-full">
      {/* Кнопка "Смотреть" */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Button
            onClick={handleOpen}
            size="lg"
            className="inline-flex items-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            Смотреть онлайн
          </Button>
        </motion.div>
      )}

      {/* Панель плеера */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden">
              {/* Заголовок */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-sm font-medium">Плеер</span>
                  {isSeries && stream && (
                    <Badge
                      variant="secondary"
                      className="rounded-sm text-xs font-mono"
                    >
                      S{selectedSeason}:E{selectedEpisode}
                    </Badge>
                  )}
                  {stream?.name && (
                    <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">
                      — {stream.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isSeries && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goNextEpisode}
                      className="text-xs cursor-pointer gap-1"
                    >
                      <Tv size={12} />
                      След. серия
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.destroy(false);
                        playerRef.current = null;
                      }
                      setIsOpen(false);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    Свернуть
                  </Button>
                </div>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  <AlertCircle size={14} />
                  <span className="truncate">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadStream}
                    className="ml-auto text-xs cursor-pointer shrink-0"
                  >
                    Повторить
                  </Button>
                </div>
              )}

              {/* Загрузка */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <span className="text-sm text-muted-foreground">
                    Загрузка потока...
                  </span>
                </div>
              )}

              {/* Artplayer */}
              {!loading && stream && Object.keys(stream.videos).length > 0 && (
                <div
                  ref={artRef}
                  className="aspect-video w-full"
                  style={{ minHeight: 300 }}
                />
              )}

              {/* Управление */}
              {!loading && info && (
                <div className="grid grid-cols-2 gap-3 border-t bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-5">
                  {/* Озвучка */}
                  {Object.keys(info.translators).length > 0 && (
                    <Selector
                      label="Озвучка"
                      value={selectedTranslator}
                      onChange={handleTranslatorChange}
                      icon={<Languages size={14} />}
                      options={Object.entries(info.translators).map(
                        ([id, t]) => ({
                          value: id,
                          label: `${t.name}${t.premium ? ' ⭐' : ''}`,
                        })
                      )}
                    />
                  )}

                  {/* Сезон */}
                  {isSeries && info.seriesInfo && (
                    <Selector
                      label="Сезон"
                      value={selectedSeason}
                      onChange={handleSeasonChange}
                      options={info.seriesInfo.map((s) => ({
                        value: String(s.season),
                        label: s.season_text || `Сезон ${s.season}`,
                      }))}
                    />
                  )}

                  {/* Серия */}
                  {isSeries && currentSeasonEpisodes.length > 0 && (
                    <Selector
                      label="Серия"
                      value={selectedEpisode}
                      onChange={handleEpisodeChange}
                      options={currentSeasonEpisodes.map((ep) => ({
                        value: String(ep.episode),
                        label: ep.episode_text || `Серия ${ep.episode}`,
                      }))}
                    />
                  )}

                  {/* Кнопка загрузки */}
                  {stream === null && !loading && (
                    <div className="flex items-end">
                      <Button
                        onClick={loadStream}
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer gap-1"
                      >
                        <Play size={14} />
                        Загрузить
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
