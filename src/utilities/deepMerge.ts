

/**
 * Утилита для глубокого слияния объектов.
 *
 * Предоставляет функции для безопасной проверки типов и рекурсивного
 * слияния объектов без изменения исходных данных.
 */

/**
 * Проверяет, является ли переданное значение объектом.
 *
 * @param item - Значение для проверки
 * @returns true, если значение является объектом (не массивом и не null)
 */
export function isObject(item: unknown): boolean {
  return Boolean(item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Выполняет глубокое слияние двух объектов.
 *
 * Рекурсивно объединяет свойства исходного объекта (source) в целевой объект (target).
 * В случае конфликтов для вложенных объектов выполняется рекурсивное слияние.
 * Для примитивных значений и массивов значения из source перезаписывают значения в target.
 *
 * @param target - Целевой объект, в который будут добавлены свойства
 * @param source - Исходный объект, свойства которого будут добавлены в target
 * @returns Новый объект с объединенными свойствами
 */
export const deepMerge = <T, R>(
  target: T,
  source: R
): T => {
  // Создаем копию целевого объекта для иммутабельности
  const output = { ...target } as any;

  if (isObject(target) && isObject(source)) {
    Object.keys(source as any).forEach((key) => {
      const sourceValue = (source as any)[key];
      const targetValue = output[key];

      if (isObject(sourceValue)) {
        // Если свойство в source - объект
        if (!(key in output)) {
          // Если свойства нет в target, добавляем его
          Object.assign(output, { [key]: sourceValue });
        } else {
          // Если свойство есть в обоих объектах, рекурсивно сливаем
          output[key] = deepMerge(
            targetValue,
            sourceValue
          );
        }
      } else {
        // Для примитивов и массивов просто перезаписываем значение
        Object.assign(output, { [key]: sourceValue });
      }
    });
  }

  return output;
};
