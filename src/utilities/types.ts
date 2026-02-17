import {
  Footer,
  Header,
  Media,
  Page,
  User,
  Collection,
  MediaContent,
  Post,
} from '@/payload-types';

// Тип коллекции - медиа
export type MediaCollection = Media;

// Тип коллекции - пользователи
export type UserCollection = User;

// Тип коллекции - страницы
export type PageCollection = Page;

// Тип коллекции - коллекции
export type CollectionCollection = Collection;

// Тип коллекции - медиа-контент
export type MediaContentCollection = MediaContent;

// Тип коллекции - посты
export type PostCollection = Post;

// Тип элемента коллекции - навигационные элементы
export type NavItemCollection = NonNullable<Header['navItems']>[number];

// Тип глобального документа - шапка сайта
export type HeaderGlobal = Header;

// Тип глобального документа - подвал сайта
export type FooterGlobal = Footer;
