'use client';

import { useField } from '@payloadcms/ui';
import { useCallback, useState } from 'react';

/**
 * Генерирует текст промта для AI на основе данных фильма или сериала.
 *
 * @param title - Название на русском
 * @param originalTitle - Оригинальное название
 * @param year - Год выпуска
 * @param contentType - Тип контента (series, cartoon, film)
 * @returns Отформатированный текст промта
 */
const generatePrompt = (
  title: string,
  originalTitle: string,
  year: string | number,
  contentType: string
): string => {
  const contentTypeText =
    contentType === 'series'
      ? 'сериала'
      : contentType === 'cartoon'
        ? 'мультфильма'
        : 'фильма';

  return `Твоя задача: создать ПОДРОБНЫЙ и РАЗВЁРНУТЫЙ пересказ ${contentTypeText} "${title}" (${originalTitle || ''}, ${year || ''}) со всеми спойлерами, который погрузит читателя в атмосферу и полностью раскроет все нюансы сюжета.

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

Форматирование:
- Вывод результата ответа в .md формате в виде кода
- Убери все ссылки в ответе
- Используй Markdown для заголовков (## для разделов)
- Используй **жирный** для акцентов
- Используй > для цитат
- Разделяй части горизонтальной линией (---)`;
};

/**
 * Компонент CopyPromptButton - кастомное UI поле для Payload CMS.
 * Кнопка для копирования детального промта для AI (например, для ChatGPT или Claude),
 * который помогает сгенерировать развернутый пересказ сюжета на основе текущих данных фильма.
 */
export const CopyPromptButton = () => {
  const { value: title } = useField<string>({ path: 'title' });
  const { value: originalTitle } = useField<string>({ path: 'originalTitle' });
  const { value: releaseYear } = useField<number>({ path: 'releaseYear' });
  const { value: contentType } = useField<string>({ path: 'contentType' });

  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  /**
   * Обработчик копирования промта в буфер обмена.
   */
  const handleCopy = useCallback(async () => {
    try {
      const promptText = generatePrompt(
        title || 'Название',
        originalTitle || '',
        releaseYear || '',
        contentType || 'film'
      );

      await navigator.clipboard.writeText(promptText);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('[CopyPromptButton] Failed to copy:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [title, originalTitle, releaseYear, contentType]);

  // Стили для разных состояний кнопки
  const getButtonStyle = () => {
    const baseStyle: React.CSSProperties = {
      cursor: 'pointer',
      borderRadius: '4px',
      border: 'none',
      padding: '10px 20px',
      fontWeight: '600',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      width: '100%',
    };

    if (status === 'copied') {
      return {
        ...baseStyle,
        backgroundColor: '#22c55e',
        color: '#fff',
      };
    }

    if (status === 'error') {
      return {
        ...baseStyle,
        backgroundColor: '#ef4444',
        color: '#fff',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'var(--theme-elevation-400)',
      color: 'var(--theme-text)',
    };
  };

  return (
    <div
      className="field-type copy-prompt-component"
      style={{ marginBottom: '20px' }}
    >
      <button type="button" onClick={handleCopy} style={getButtonStyle()}>
        {status === 'copied'
          ? 'Скопировано!'
          : status === 'error'
            ? 'Ошибка копирования'
            : 'Скопировать промт для AI'}
      </button>
    </div>
  );
};

export default CopyPromptButton;
