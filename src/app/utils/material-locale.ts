import { MatPaginatorIntl } from '@angular/material/paginator';

export function persianPaginator(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  const number = new Intl.NumberFormat('fa-IR');
  intl.itemsPerPageLabel = 'تعداد محصولات در صفحه';
  intl.nextPageLabel = 'صفحه بعد';
  intl.previousPageLabel = 'صفحه قبل';
  intl.firstPageLabel = 'صفحه اول';
  intl.lastPageLabel = 'صفحه آخر';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (!length || !pageSize) return `۰ از ${number.format(length)}`;
    const start = page * pageSize;
    return `${number.format(start + 1)} تا ${number.format(Math.min(start + pageSize, length))} از ${number.format(length)}`;
  };
  return intl;
}
