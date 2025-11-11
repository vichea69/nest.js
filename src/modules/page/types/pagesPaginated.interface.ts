import { PageEntity } from '@/modules/page/page.entity';

export interface PagesPaginatedInterface {
  items: PageEntity[];
  total: number;
}

