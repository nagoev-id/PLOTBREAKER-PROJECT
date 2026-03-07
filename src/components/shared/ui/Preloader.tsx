'use client';

import { FC, JSX, useEffect, useState } from 'react';

/**
 * Прелоадер сайта с анимированным SVG-логотипом и текстом "ПРОСМОТРЕНО".
 * Показывается при первой загрузке, затем плавно исчезает.
 */
const Preloader: FC = (): JSX.Element | null => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Запускаем фазу исчезновения через 2.4 секунды
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2400);

    // Полностью убираем прелоадер после завершения анимации
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`preloader ${isFadingOut ? 'preloader--hidden' : ''}`}
      aria-hidden="true"
    >
      {/* Фоновые декоративные элементы */}
      <div className="preloader__glow preloader__glow--1" />
      <div className="preloader__glow preloader__glow--2" />

      <div className="preloader__content">
        {/* SVG-логотип */}
        <div className="preloader__logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 350 172.844"
            preserveAspectRatio="xMidYMid meet"
            className="preloader__svg"
          >
            <path
              className="preloader__path preloader__path--1"
              d="M0 172.855h93.898V.011H0Z"
            />
            <path
              className="preloader__path preloader__path--2"
              d="m182.794.011 67.183 172.844H350L280.948.011Z"
            />
            <path
              className="preloader__path preloader__path--3"
              d="M199.797 135.1a37.809 37.809 0 01-37.809 37.744 37.735 37.735 0 01-37.724-37.744 37.809 37.809 0 0137.744-37.809 37.809 37.809 0 0137.809 37.809"
            />
          </svg>
        </div>

        {/* Текст */}
        <div className="preloader__text">
          {'ПРОСМОТРЕНО'.split('').map((char, i) => (
            <span
              key={i}
              className="preloader__char"
              style={{ animationDelay: `${0.8 + i * 0.06}s` }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Линия-индикатор загрузки */}
        <div className="preloader__bar">
          <div className="preloader__bar-fill" />
        </div>
      </div>
    </div>
  );
};

export { Preloader };
