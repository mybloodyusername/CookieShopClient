import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import {
  ApiProductService,
  ApiOrderService,
  ApiCategoryService,
  ProductResponse,
  OrderResponse,
  CategoryResponse,
} from '../../../../api';
import { SessionService } from '../../../services/session.service';
import { TomanPipe } from '../../../pipes/toman.pipe';
import { ProductEditorComponent } from '../product-editor/product-editor';
import { OrderDetailComponent } from '../order-detail/order-detail';

type Panel = 'overview' | 'products' | 'orders' | 'categories';
@Component({
  selector: 'cs-admin-panel',
  imports: [
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TomanPipe,
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanelComponent {
  readonly session = inject(SessionService);
  private readonly productsApi = inject(ApiProductService);
  private readonly ordersApi = inject(ApiOrderService);
  private readonly categoriesApi = inject(ApiCategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);
  private readonly breakpoint = toSignal(inject(BreakpointObserver).observe('(min-width: 1024px)'));
  readonly desktop = computed(() => this.breakpoint()?.matches ?? false);
  readonly menuOpen = signal(false);
  readonly links: { id: Panel; label: string; icon: string; description: string }[] = [
    { id: 'overview', label: 'نمای کلی', icon: 'home', description: 'فروشگاه شما، در یک نگاه' },
    {
      id: 'products',
      label: 'محصولات',
      icon: 'cookie',
      description: 'قیمت، موجودی و اطلاعات کوکی‌ها',
    },
    {
      id: 'orders',
      label: 'سفارش‌ها',
      icon: 'shopping_bag',
      description: 'پیگیری سفارش‌ها و اطلاعات ارسال',
    },
    {
      id: 'categories',
      label: 'دسته‌بندی‌ها',
      icon: 'redeem',
      description: 'دسته‌بندی طعم‌های فروشگاه',
    },
  ];
  readonly panel = computed(
    () => this.links.find((l) => l.id === this.query()?.get('view')) ?? this.links[0],
  );
  readonly products = signal<ProductResponse[]>([]);
  readonly orders = signal<OrderResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly productCount = signal(0);
  readonly orderCount = signal(0);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly page = signal(0);
  readonly search = signal('');
  private request = 0;
  readonly stats = computed(() => [
    {
      label: 'محصولات فروشگاه',
      value: this.number(this.productCount()),
      icon: 'cookie',
      view: 'products',
    },
    {
      label: 'سفارش‌های ثبت‌شده',
      value: this.number(this.orderCount()),
      icon: 'shopping_bag',
      view: 'orders',
    },
    {
      label: 'دسته‌بندی‌ها',
      value: this.number(this.categories().length),
      icon: 'redeem',
      view: 'categories',
    },
  ]);
  constructor() {
    effect(() => {
      const panel = this.panel().id;
      const allowed = this.session.ready() && this.session.isAdmin();
      untracked(() => {
        this.page.set(0);
        this.search.set('');
        this.menuOpen.set(false);
        if (allowed) void this.load(panel);
        else {
          this.request++;
          this.products.set([]);
          this.orders.set([]);
          this.categories.set([]);
        }
      });
    });
  }
  async load(panel: Panel = this.panel().id) {
    if (!this.session.isAdmin()) return;
    const request = ++this.request;
    this.loading.set(true);
    this.error.set(false);
    try {
      if (panel === 'overview') {
        const [products, orders, categories] = await Promise.all([
          firstValueFrom(this.productsApi.apiProductGet({ page: 1, pageSize: 1 })),
          firstValueFrom(this.ordersApi.apiOrderGetAllByAdminGet({ page: 1, pageSize: 5 })),
          firstValueFrom(this.categoriesApi.apiCategoryGet()),
        ]);
        if (request !== this.request) return;
        this.productCount.set(Number(products.totalCount));
        this.orderCount.set(Number(orders.totalCount));
        this.orders.set(orders.items);
        this.categories.set(categories);
      } else if (panel === 'products') {
        const [products, categories] = await Promise.all([
          firstValueFrom(
            this.productsApi.apiProductGet({
              page: this.page() + 1,
              pageSize: 12,
              search: this.search() || undefined,
            }),
          ),
          firstValueFrom(this.categoriesApi.apiCategoryGet()),
        ]);
        if (request !== this.request) return;
        this.products.set(products.items);
        this.productCount.set(Number(products.totalCount));
        this.categories.set(categories);
      } else if (panel === 'orders') {
        const orders = await firstValueFrom(
          this.ordersApi.apiOrderGetAllByAdminGet({ page: this.page() + 1, pageSize: 12 }),
        );
        if (request !== this.request) return;
        this.orders.set(orders.items);
        this.orderCount.set(Number(orders.totalCount));
      } else {
        const categories = await firstValueFrom(this.categoriesApi.apiCategoryGet());
        if (request !== this.request) return;
        this.categories.set(categories);
      }
    } catch {
      if (request === this.request) this.error.set(true);
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
  filter(value: string) {
    this.search.set(value.trim());
    this.page.set(0);
    void this.load();
  }
  paginate(page: number) {
    this.page.set(page);
    void this.load();
  }
  async edit(product?: ProductResponse) {
    const saved = await firstValueFrom(
      this.dialog
        .open(ProductEditorComponent, {
          data: { product, categories: this.categories() },
          direction: 'rtl',
          width: '640px',
          maxWidth: 'calc(100vw - 24px)',
        })
        .afterClosed(),
    );
    if (saved) await this.load();
  }
  async details(order: OrderResponse) {
    const changed = await firstValueFrom(
      this.dialog
        .open(OrderDetailComponent, {
          data: order.id,
          direction: 'rtl',
          width: '600px',
          maxWidth: 'calc(100vw - 24px)',
        })
        .afterClosed(),
    );
    if (changed) await this.load();
  }
  number(value: number | string) {
    return Number(value).toLocaleString('fa-IR');
  }
  date(value: Date) {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value));
  }
  status(value: string) {
    return (
      (
        {
          pending: 'در انتظار پرداخت',
          paid: 'پرداخت‌شده',
          shipped: 'ارسال‌شده',
          delivered: 'تحویل‌شده',
          cancelled: 'لغوشده',
        } as Record<string, string>
      )[value.toLowerCase()] ?? value
    );
  }
}
