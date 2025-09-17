import { PageEntity } from '@/modules/page/page.entity';

export interface PagesResponseInterface {
  pages: PageEntity[];
  pagesCount: number;
}

