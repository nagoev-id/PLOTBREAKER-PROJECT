# React Doctor — Оставшиеся задачи

> **Текущий балл**: 93 / 100 (96 warnings, 40 files)  
> **Дата**: 2026-03-29

---

## Giant Components (6 шт.)

| Компонент | Файл | Строки |
|---|---|---|
| `ReviewsPageClient` | `reviews/page.client.tsx` | 615 |
| `EntryForm` | `EntryForm.tsx` | 567 |
| `ReviewDetailClient` | `reviews/[slug]/page.client.tsx` | 491 |
| `KpSearch` | `Titles/fields/kp.tsx` | 455 |
| `TmdbSearch` | `Titles/fields/tmdb.tsx` | 394 |
| `DashboardEntriesClient` | `dashboard/entries/page.client.tsx` | 308 |

---

## prefer-useReducer (5 компонентов)

| Компонент | Файл | useState calls |
|---|---|---|
| `EntryForm` | `EntryForm.tsx` | 20 |
| `DashboardEntriesClient` | `dashboard/entries/page.client.tsx` | 8 |
| `KpSearchDashboard` | `ExternalSearch.tsx` | 6 |
| `TmdbSearchDashboard` | `ExternalSearch.tsx` | 6 |
| `DashboardCollectionsClient` | `dashboard/page.client.tsx` | 6 |

---

## useSearchParams без Suspense (6 файлов)

| Файл | Строка |
|---|---|
| `reviews/page.client.tsx` | 74 |
| `collections/[slug]/page.client.tsx` | 28 |
| `reviews/[slug]/page.client.tsx` | — |
| `reviews/tags/[tag]/page.client.tsx` | 33 |
| `reviews/franchises/[name]/page.client.tsx` | 27 |
| `reviews/genres/[genre]/page.client.tsx` | 34 |
| `blog/tags/[tag]/page.client.tsx` | 34 |

---

## no-derived-useState (4 случая)

Все в `dashboard/entries/page.client.tsx` (строки 43–45) и `dashboard/page.client.tsx` (строка 34):

| Файл | Prop |
|---|---|
| `dashboard/entries/page.client.tsx` | `initialEntries` |
| `dashboard/entries/page.client.tsx` | `initialTotalPages` |
| `dashboard/entries/page.client.tsx` | `initialTotalDocs` |
| `dashboard/page.client.tsx` | `initialCollections` |

---

## no-cascading-set-state (2 файла)

| Файл | setState calls в useEffect |
|---|---|
| `search/components/SearchModal.tsx` | 6 |
| `shared/ui/Preloader.tsx` | 4 |

---

## dangerouslySetInnerHTML (3 случая)

| Файл | Строка |
|---|---|
| `Footer/Footer.client.tsx` | 78 |
| `Header/Header.client.tsx` | 125 |
| `About/components/FeatureCards.tsx` | 21 |

---

## Прочие предупреждения

### no-array-index-as-key (1)
- `shared/ui/Preloader.tsx:60` — array index `"i"` как key

### heading-has-content (1)
- `components/ui/alert.tsx:39` — заголовок без доступного контента (a11y)

---

## Dead Code — Unused Files (2)

| Файл |
|---|
| `src/payload/access/authenticated.ts` |
| `src/components/shared/titles/SynopsisBlock.tsx` |

---

## Dead Code — Unused Exports (66 шт.)

> Большинство — shadcn/ui компоненты, которые установлены, но не используются.

### Non-UI exports (приоритет):
| Файл | Экспорт |
|---|---|
| `src/payload/utilities/utils.ts` | `isObject` |
| `src/payload/access/isAdmin.ts` | `adminOnly`, `adminField` |

### shadcn/ui (низкий приоритет — можно удалить файлы целиком):
| Файл | Неиспользуемые экспорты |
|---|---|
| `alert-dialog.tsx` | `AlertDialogPortal`, `AlertDialogOverlay` |
| `alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` |
| `badge.tsx` | `badgeVariants` |
| `button-group.tsx` | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants` |
| `card.tsx` | `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` |
| `checkbox.tsx` | `Checkbox` |
| `dialog.tsx` | `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose` |
| `form.tsx` | `useFormField`, `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField` |
| `input-group.tsx` | `InputGroup` |
| `navigation-menu.tsx` | `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport` |
| `popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` |
| `radio-group.tsx` | `RadioGroup`, `RadioGroupItem` |
| `select.tsx` | `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` |
| `skeleton.tsx` | `Skeleton` |
| `tabs.tsx` | `TabsContent` |
| `toggle-group.tsx` | `ToggleGroup`, `ToggleGroupItem` |
| `toggle.tsx` | `Toggle` |
| `tooltip.tsx` | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |

---

## Прогресс исправлений

### ✅ Исправлено в предыдущих сессиях
- Убраны неиспользуемые типы и экспорты (часть)
- `KpSearch` и `TmdbSearch` частично разбиты (вынесены в `ExternalSearch.tsx`)
- Добавлены `Suspense` для части страниц
- `dashboard/page.client.tsx` — частично улучшено

### ✅ Исправлено 2026-03-29
- [x] `no-derived-useState` — `DashboardEntriesClient` рефакторен: убраны `initial*` пропсы,
  данные теперь загружаются через `useEffect` + `fetch` при монтировании. Все 8 `useState` объединены в один `state`-объект  
- [x] `useSearchParams` без Suspense — **false positive**: все 6 страниц уже обёрнуты в `<Suspense>` в соответствующих `page.tsx`
- [x] Удалены неиспользуемые файлы: `src/payload/access/authenticated.ts`, `src/components/shared/titles/SynopsisBlock.tsx`

### 🔴 Приоритет 1 — Критично
*(все задачи выполнены)*

### ✅ Исправлено 2026-03-29 (Приоритет 2)
- [x] `prefer-useReducer` — `KpSearchDashboard`: 6 useState → `useReducer(kpReducer)` с типизированными actions
- [x] `prefer-useReducer` — `TmdbSearchDashboard`: 6 useState → `useReducer(tmdbReducer)` с типизированными actions
- [x] `no-cascading-set-state` в `SearchModal.tsx` — false positive: два `setState` в одном обработчике батчатся React 18; `searchState` уже объединён в один объект
- [x] `no-array-index-as-key` в `Preloader.tsx` — предвычислен `PRELOADER_CHARS[]` с ключами `preloader-char-{char}-{i}`
- [x] `heading-has-content` в `alert.tsx` — `AlertTitle` теперь явно рендерит `{children}` (не через spread), добавлен `data-slot`

### 🟡 Приоритет 2 — Важно
*(все задачи выполнены)*

### ✅ Исправлено 2026-03-29 (Приоритет 3)
- [x] `dangerouslySetInnerHTML` — **легитимное использование**: только в `FeatureCards.tsx`, `Footer.client.tsx`, `Header.client.tsx` для SVG-логотипов и иконок из Payload CMS (admin-only). Заменить невозможно — поля хранят SVG-код, не URL. Добавлен поясняющий комментарий в `FeatureCards.tsx`
- [x] Dead code exports — удалены 7 неиспользуемых shadcn/ui компонентов: `button-group`, `input-group`, `navigation-menu`, `popover`, `radio-group`, `toggle`, `toggle-group` (файлы удалены, `index.ts` обновлён)
- [x] `adminOnly`, `adminField` в `isAdmin.ts` — удалены (дубликаты `admin`, нигде не импортировались)

### 🟢 Приоритет 3 — Долг
*(все задачи выполнены)*
