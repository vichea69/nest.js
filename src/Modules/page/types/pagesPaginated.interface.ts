import { PageEntity } from '@/Modules/page/page.entity';

export interface PagesPaginatedInterface {
  items: PageEntity[];
  total: number;
}

