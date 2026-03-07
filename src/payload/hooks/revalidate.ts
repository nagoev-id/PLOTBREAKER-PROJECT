import { revalidatePath, revalidateTag } from 'next/cache';

export const safeRevalidatePath = (path: string): void => {
  try {
    revalidatePath(path);
  } catch {
    // Вне Next.js контекста — игнорируем
  }
};

export const safeRevalidateTag = (tag: string): void => {
  try {
    revalidateTag(tag);
  } catch {
    // Вне Next.js контекста — игнорируем
  }
};
