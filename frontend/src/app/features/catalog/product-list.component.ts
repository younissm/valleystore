import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/models';
import { CartService } from '../../core/services/cart.service';
import { LanguageService, TranslationKey } from '../../core/services/language.service';

const DEMO_PRODUCTS: Array<Product & { nameKey: TranslationKey; descriptionKey: TranslationKey }> = [
  { id: -1, name: 'Olivewood serving board', description: 'Hand-finished olivewood for everyday hosting.', nameKey: 'sampleBoard', descriptionKey: 'sampleBoardDescription', price: 1250, stock: 8, featured: true },
  { id: -2, name: 'Linen table runner', description: 'Soft, breathable linen in a warm natural tone.', nameKey: 'sampleRunner', descriptionKey: 'sampleRunnerDescription', price: 890, stock: 12, featured: true },
  { id: -3, name: 'Hand-thrown ceramic vase', description: 'A quietly sculptural piece made for fresh stems.', nameKey: 'sampleVase', descriptionKey: 'sampleVaseDescription', price: 1640, stock: 5, featured: true },
  { id: -4, name: 'Woven market basket', description: 'A sturdy, beautiful companion for everyday errands.', nameKey: 'sampleBasket', descriptionKey: 'sampleBasketDescription', price: 740, stock: 9, featured: true },
  { id: -5, name: 'Stoneware coffee set', description: 'Two tactile cups for slower mornings.', nameKey: 'sampleCoffee', descriptionKey: 'sampleCoffeeDescription', price: 1120, stock: 6, featured: true },
  { id: -6, name: 'Cotton cushion cover', description: 'A textured layer in an easy, earthy palette.', nameKey: 'sampleCushion', descriptionKey: 'sampleCushionDescription', price: 680, stock: 14, featured: true },
];

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero">
      <div><span class="eyebrow">✦ &nbsp; {{ languageService.t('heroEyebrow') }}</span><h1>{{ languageService.t('heroTitle') }}<br><em>{{ languageService.t('heroTitleAccent') }}</em></h1><p>{{ languageService.t('heroDescription') }}</p><a href="#products">{{ languageService.t('discover') }} <span>↓</span></a></div>
      <div class="art" [attr.aria-label]="languageService.t('heroEyebrow')"><span class="sun"></span><span class="hill hill-a"></span><span class="hill hill-b"></span><strong>{{ languageService.t('heroEyebrow') }}<br><b>{{ languageService.t('heroTitleAccent') }}</b></strong><i>V</i></div>
      <small class="hero-note">01 — 04 &nbsp; &nbsp; {{ languageService.t('heroNote') }}</small>
    </section>
    <section id="products" class="catalog">
      <div class="heading"><div><span class="eyebrow">{{ languageService.t('collection') }}</span><h2>{{ languageService.t('collectionTitle') }}</h2></div><small>{{ filteredProducts.length }} {{ languageService.t(filteredProducts.length === 1 ? 'piece' : 'pieces') }}</small></div>
      @if (demoMode) { <p class="demo-banner" role="status">{{ languageService.t('previewCatalog') }}</p> }
      <div class="tools"><label class="search"><span aria-hidden="true">⌕</span><input type="search" [attr.aria-label]="languageService.t('search')" [placeholder]="languageService.t('searchPlaceholder')" [(ngModel)]="searchTerm"></label><label class="sort-label">{{ languageService.t('sortBy') }} <select [attr.aria-label]="languageService.t('sortBy')" [(ngModel)]="sortBy"><option value="featured">{{ languageService.t('featured') }}</option><option value="price-low">{{ languageService.t('priceLow') }}</option><option value="price-high">{{ languageService.t('priceHigh') }}</option><option value="name">{{ languageService.t('name') }}</option></select></label></div>
      @if (loading) { <div class="notice">{{ languageService.t('loading') }}</div> }
      @else if (error) { <div class="notice error"><b>{{ languageService.t('loadError') }}</b><span>{{ error }}</span><button (click)="loadProducts()">{{ languageService.t('tryAgain') }}</button></div> }
      @else if (!products.length) { <div class="notice">{{ languageService.t('emptyCatalog') }}</div> }
      @else if (!filteredProducts.length) { <div class="notice">{{ languageService.t('noMatches') }}</div> }
      @else { <div class="grid">
        @for (product of filteredProducts; track product.id; let i = $index) {
          <article><div class="image" [class]="'image tone-' + i % 4">
            @if (product.imageUrl) { <img [src]="product.imageUrl" [alt]="product.name" loading="lazy"> } @else { <span class="initial">{{ product.name.charAt(0) }}</span> }
            <small [class.out]="product.stock < 1">{{ product.stock > 0 ? languageService.t('inStock') : languageService.t('soldOut') }}</small>
            @if (product.stock > 0) { <button class="quick" (click)="addToCart(product)" [attr.aria-label]="languageService.t('addToCart', { name: productName(product) })">+</button> }
          </div><div class="details"><div><h3>{{ productName(product) }}</h3><p>{{ productDescription(product) }}</p></div><b>{{ product.price | currency:'EGP':'symbol':'1.2-2':languageService.locale() }}</b></div>
          <button class="add" [disabled]="product.stock < 1" (click)="addToCart(product)">{{ product.stock > 0 ? languageService.t('addToBag') : languageService.t('unavailable') }} <span>↗</span></button></article>
        }
      </div> }
    </section>
  `,
  styles: [`
    :host{display:block;color:#293a2e}.demo-banner{margin:0 0 1rem;padding:.75rem 1rem;background:#f5eee0;color:#735c35;font-size:.75rem;line-height:1.5}.hero{position:relative;min-height:350px;display:grid;grid-template-columns:1fr .8fr;align-items:center;gap:2rem;padding:3rem 5rem 4rem;overflow:hidden;background:#f0f1e9}.eyebrow{color:#7c887b;font-size:.67rem;font-weight:750;letter-spacing:.15em}.hero h1{margin:1.25rem 0 .8rem;font-size:clamp(3rem,5vw,4.7rem);line-height:.98;letter-spacing:-.07em;font-weight:500}.hero h1 em{color:#789079;font-family:Georgia,serif;font-weight:400}.hero p{max-width:340px;color:#798278;font-size:.9rem;line-height:1.7}.hero a{display:inline-block;margin-top:1rem;color:#385740;font-size:.82rem;font-weight:700;text-decoration:none}.hero a span{margin-left:1rem}.art{height:260px;position:relative;overflow:hidden;border-radius:48% 48% 3px 3px;background:#d8dfd0}.sun{position:absolute;top:8%;right:16%;width:140px;height:140px;border-radius:50%;background:#e6c99f}.hill{position:absolute;bottom:-40px;border-radius:50% 50% 0 0}.hill-a{left:5%;width:62%;height:70%;background:#91a28a;transform:rotate(10deg)}.hill-b{right:-8%;width:72%;height:80%;background:#647d67;transform:rotate(-15deg)}.art strong{position:absolute;bottom:1.4rem;left:1.5rem;color:#fff;font-size:.58rem;letter-spacing:.15em}.art strong b{display:block;margin-top:.4rem;font:400 1.6rem/1.05 Georgia,serif;letter-spacing:0}.art i{position:absolute;top:1rem;left:1rem;display:grid;width:28px;height:28px;place-items:center;border:1px solid #ffffffaa;border-radius:50%;color:#fff;font:normal 1rem Georgia}.hero-note{position:absolute;bottom:1.3rem;left:5rem;color:#899286;font-size:.63rem}.catalog{padding-top:3.5rem}.heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:1.5rem}.heading h2{margin:.45rem 0 0;font:400 2rem Georgia,serif;letter-spacing:-.03em}.heading>small{color:#92988f;font-size:.75rem}.tools{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1.4rem}.search{display:flex;align-items:center;gap:.6rem;width:min(360px,65%);padding:.7rem .8rem;border:1px solid #e5e6df;background:#fbfaf7;color:#809080}.search span{font-size:1.2rem}.search input{width:100%;border:0;outline:0;background:transparent;color:#354438;font:inherit;font-size:.78rem}.sort-label{display:flex;align-items:center;gap:.5rem;color:#898f86;font-size:.72rem}.sort-label select{padding:.6rem;border:1px solid #e5e6df;background:#fbfaf7;color:#46584a;font:inherit;font-size:.72rem}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.3rem}.image{height:260px;position:relative;display:grid;place-items:center;overflow:hidden}.tone-0{background:#e9e5db}.tone-1{background:#e4e9e0}.tone-2{background:#e9e0d9}.tone-3{background:#e1e5e6}.image img{width:100%;height:100%;object-fit:cover;transition:transform .3s}.image img:hover{transform:scale(1.04)}.initial{color:#fff9;font:8rem Georgia,serif}.image small{position:absolute;top:.8rem;left:.8rem;padding:.4rem .55rem;background:#fbfaf7e8;color:#526c56;font-size:.55rem;font-weight:750;letter-spacing:.1em}.image small.out{color:#998d85}.quick{position:absolute;right:.75rem;bottom:.75rem;width:38px;height:38px;border:0;border-radius:50%;background:#fbfaf7;color:#34583c;font-size:1.5rem;cursor:pointer}.details{display:flex;justify-content:space-between;gap:.75rem;padding:.9rem 0 .6rem}.details h3{margin:0;font-size:.92rem;font-weight:650}.details p{margin:.35rem 0 0;color:#8b9088;font-size:.73rem}.details>b{flex-shrink:0;color:#405a43;font-size:.8rem}.add{display:flex;width:100%;justify-content:space-between;padding:.75rem 0;border:0;border-top:1px solid #e7e8e1;background:none;color:#436046;text-align:left;font-weight:700;font-size:.75rem;cursor:pointer}.add:disabled{color:#a9ada6;cursor:not-allowed}.notice{min-height:180px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:.6rem;color:#788477;font-size:.85rem}.notice.error b{color:#465b49}.notice button{padding:.55rem .9rem;border:1px solid #d7dfd5;background:white;color:#45634b;cursor:pointer}@media(max-width:760px){.hero{padding:2.5rem 2rem 4rem;grid-template-columns:1fr .8fr}.hero-note{left:2rem}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.image{height:220px}}@media(max-width:520px){.tools{align-items:flex-start;flex-direction:column}.search{box-sizing:border-box;width:100%}.sort-label{width:100%;justify-content:space-between}.sort-label select{flex:1}.hero{display:block;padding:2rem 1.3rem 3.8rem}.hero h1{font-size:3.35rem}.art{width:75%;height:170px;margin:1.4rem 0 0 auto}.hero-note{left:1.3rem;font-size:.55rem}.catalog{padding-top:2.6rem}.heading h2{font-size:1.55rem}.grid{gap:.75rem}.image{height:160px}.details{flex-direction:column;gap:.3rem}.details h3{font-size:.82rem}.details p{font-size:.68rem}}
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  demoMode = false;
  loading = true;
  error = '';
  searchTerm = '';
  sortBy = 'featured';

  get filteredProducts(): Product[] {
    const search = this.searchTerm.trim().toLocaleLowerCase();
    const matches = this.products.filter(product =>
      !search || product.name.toLocaleLowerCase().includes(search) || (product.description ?? '').toLocaleLowerCase().includes(search),
    );
    return [...matches].sort((a, b) => {
      if (this.sortBy === 'price-low') return a.price - b.price;
      if (this.sortBy === 'price-high') return b.price - a.price;
      if (this.sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }
  readonly languageService = inject(LanguageService);
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Product[]>(`${environment.apiUrl}/products`).subscribe({
      next: products => { this.products = products; this.demoMode = false; this.loading = false; },
      error: () => {
        this.products = DEMO_PRODUCTS;
        this.demoMode = true;
        this.loading = false;
      },
    });
  }

  productName(product: Product): string {
    const sample = DEMO_PRODUCTS.find(item => item.id === product.id);
    return sample ? this.languageService.t(sample.nameKey) : product.name;
  }

  productDescription(product: Product): string {
    const sample = DEMO_PRODUCTS.find(item => item.id === product.id);
    return sample
      ? this.languageService.t(sample.descriptionKey)
      : product.description || this.languageService.t('heroDescription');
  }

  addToCart(product: Product): void { this.cart.addToCart(product); }
}