import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CustomerAddress, OrderRequest, OrderResponse, Product } from '../../core/models/models';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="checkout-page">
      <div class="intro"><a routerLink="/" class="back">← &nbsp; {{ languageService.t('continueShopping') }}</a><span class="eyebrow">{{ languageService.t('yourBag') }}</span><h1>{{ languageService.t('almostYours') }}</h1><p>{{ languageService.t('bagDescription') }}</p></div>
      @if (!cartService.cartItems().length) {
        <div class="empty"><span>✦</span><h2>{{ languageService.t('emptyBagTitle') }}</h2><p>{{ languageService.t('emptyBagDescription') }}</p><a routerLink="/">{{ languageService.t('explore') }}</a></div>
      } @else {
        <div class="checkout-grid">
          <section class="bag"><h2>{{ languageService.t('yourBagCount') }} <span>({{ cartService.itemCount() }})</span></h2>
            @for (item of cartService.cartItems(); track item.product.id) {
              <article class="bag-item">
                <div class="thumb">@if (item.product.imageUrl) { <img [src]="item.product.imageUrl" [alt]="item.product.name"> } @else { <span>{{ item.product.name.charAt(0) }}</span> }</div>
                <div class="item-info"><h3>{{ productName(item.product) }}</h3><p>{{ item.product.price | currency:'EGP':'symbol':'1.2-2':languageService.locale() }}</p><button class="remove" type="button" (click)="cartService.removeFromCart(item.product.id)">{{ languageService.t('remove') }}</button></div>
                <div class="quantity"><button type="button" [disabled]="item.quantity <= 1" (click)="setQuantity(item.product, item.quantity - 1)" [attr.aria-label]="languageService.t('decreaseQuantity')">−</button><span>{{ item.quantity }}</span><button type="button" [disabled]="item.quantity >= item.product.stock" (click)="setQuantity(item.product, item.quantity + 1)" [attr.aria-label]="languageService.t('increaseQuantity')">+</button></div>
                <strong>{{ item.product.price * item.quantity | currency:'EGP':'symbol':'1.2-2':languageService.locale() }}</strong>
              </article>
            }
          </section>
          <aside class="summary"><h2>{{ languageService.t('deliveryDetails') }}</h2>
            @if (!authService.isAuthenticated()) {
              <p class="address-hint">{{ languageService.t('checkoutSignInPrompt') }}</p>
              <button class="submit" type="button" (click)="authService.openAuthentication()">{{ languageService.t('signIn') }}</button>
            } @else {
            <p class="muted">{{ languageService.t('cashOnDelivery') }}</p>
            <form (ngSubmit)="placeOrder()">
              <label for="savedAddress">{{ languageService.t('deliveryAddress') }}</label>
              @if (addressesLoading) {
                <p class="address-hint">{{ languageService.t('loadingAddresses') }}</p>
              } @else if (addresses.length) {
                <select id="savedAddress" [(ngModel)]="selectedAddressId" name="addressId" required>
                  <option [ngValue]="null" disabled>{{ languageService.t('selectAddress') }}</option>
                  @for (address of addresses; track address.id) {
                    <option [ngValue]="address.id">{{ address.name }} — {{ address.value }}</option>
                  }
                </select>
                      } @else {
                <p class="address-hint">{{ addressLoadError ? languageService.t('addressesUnavailable') : languageService.t('noSavedAddresses') }}</p>
              }
              @if (addresses.length) { <p class="address-hint">{{ languageService.t('addressHint') }}</p> }
              <button class="add-address-toggle" type="button" (click)="showAddressForm = !showAddressForm">{{ languageService.t('addAddress') }}</button>
              @if (showAddressForm) {
                <label for="addressName">{{ languageService.t('addressName') }}</label>
                <input id="addressName" [(ngModel)]="addressName" name="addressName" maxlength="60" [placeholder]="languageService.t('addressNamePlaceholder')" required>
                <label for="addressValue">{{ languageService.t('addressValue') }}</label>
                <textarea id="addressValue" [(ngModel)]="addressValue" name="addressValue" rows="3" maxlength="500" [placeholder]="languageService.t('addressValuePlaceholder')" required></textarea>
                <button class="submit" type="button" (click)="saveAddress()" [disabled]="savingAddress">{{ savingAddress ? languageService.t('savingAddress') : languageService.t('saveAddress') }}</button>
              }
              <div class="total"><span>{{ languageService.t('estimatedTotal') }}</span><strong>{{ cartService.getTotal() | currency:'EGP':'symbol':'1.2-2':languageService.locale() }}</strong></div>
              @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
              <button class="submit" type="submit" [disabled]="submitting">{{ submitting ? languageService.t('placingOrder') : languageService.t('placeOrder') }}</button>
              <p class="secure">{{ languageService.t('checkoutNote') }}</p>
            </form>
            }
          </aside>
        </div>
      }
      @if (success) { <div class="success" role="status">{{ success }} <a routerLink="/">{{ languageService.t('continueBrowsing') }}</a></div> }
    </section>
  `,
  styles: [`
    :host{display:block;color:#293a2e}.checkout-page{max-width:1000px;margin:auto}.intro{padding:0 0 2rem;border-bottom:1px solid #e7e8e1}.back{display:block;margin-bottom:1.6rem;color:#69806c;font-size:.75rem;text-decoration:none}.eyebrow{color:#7c887b;font-size:.65rem;font-weight:750;letter-spacing:.15em}.intro h1{margin:.5rem 0;font:400 2.7rem Georgia,serif;letter-spacing:-.04em}.intro p,.muted{margin:0;color:#899087;font-size:.83rem}.checkout-grid{display:grid;grid-template-columns:1.3fr .8fr;gap:3rem;padding-top:2rem}.bag h2,.summary h2{margin:0 0 1.4rem;font:400 1.45rem Georgia,serif}.bag h2 span{color:#9a9e96;font:400 .8rem system-ui}.bag-item{display:grid;grid-template-columns:78px 1fr auto auto;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid #e9e9e3}.thumb{height:78px;display:grid;place-items:center;overflow:hidden;background:#e8ebe3;color:#fff9;font:2.5rem Georgia,serif}.thumb img{width:100%;height:100%;object-fit:cover}.item-info h3{margin:0;font-size:.88rem}.item-info p{margin:.4rem 0;color:#647767;font-size:.78rem}.remove{padding:0;border:0;background:transparent;color:#959a91;font-size:.7rem;text-decoration:underline;cursor:pointer}.quantity{display:flex;align-items:center;gap:.55rem;color:#3c4a3e;font-size:.8rem}.quantity button{width:27px;height:27px;border:1px solid #e1e5dc;background:#fff;color:#526b56;cursor:pointer}.quantity button:disabled{color:#c9cdc6;cursor:not-allowed}.bag-item>strong{min-width:80px;text-align:right;font-size:.8rem}.summary{padding:1.5rem;background:#f7f7f1}.summary h2{margin-bottom:.35rem}.summary .muted{margin-bottom:1.4rem}.summary form{display:flex;flex-direction:column;gap:.55rem}.summary label{margin-top:.25rem;color:#59665a;font-size:.7rem;font-weight:700}.summary label span{font-weight:400;color:#969b94}.summary input,.summary select,.summary textarea{width:100%;box-sizing:border-box;padding:.7rem .75rem;border:1px solid #e0e3dc;border-radius:0;background:#fff;color:#39453b;font:inherit;font-size:.78rem}.summary textarea{resize:vertical;min-height:6rem}.address-hint{margin:0;color:#899087;font-size:.68rem;line-height:1.5}.add-address-toggle{align-self:flex-start;padding:0;border:0;background:transparent;color:#45634b;font-size:.72rem;text-decoration:underline;cursor:pointer}.total{display:flex;justify-content:space-between;align-items:center;margin-top:.9rem;padding:1rem 0;border-top:1px solid #e2e5dc;color:#687368;font-size:.82rem}.total strong{color:#304a36;font-size:1.05rem}.submit{padding:.85rem;border:0;background:#315c40;color:#fff;font-size:.76rem;font-weight:700;cursor:pointer}.submit:disabled{opacity:.65;cursor:wait}.secure{margin:0;text-align:center;color:#949a91;font-size:.65rem}.form-error{margin:0;color:#a34e3d;font-size:.75rem}.empty{min-height:300px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.empty>span{color:#779078;font-size:1.7rem}.empty h2{margin:.8rem 0 .3rem;font:400 1.5rem Georgia,serif}.empty p{color:#8b9088;font-size:.82rem}.empty a{margin-top:.7rem;padding:.7rem 1rem;background:#315c40;color:#fff;text-decoration:none;font-size:.75rem}.success{margin-top:1rem;padding:1rem;background:#edf3eb;color:#3d6844;font-size:.85rem}@media(max-width:700px){.checkout-grid{grid-template-columns:1fr;gap:2rem}.bag-item{grid-template-columns:60px 1fr auto;gap:.7rem}.thumb{height:60px}.bag-item>strong{grid-column:2;text-align:left}.quantity{grid-column:3;grid-row:1/3}}
  `]
})
export class CheckoutComponent implements OnInit {
  addresses: CustomerAddress[] = [];
  selectedAddressId: number | null = null;
  addressesLoading = true;
  addressLoadError = false;
  addressName = '';
  addressValue = '';
  showAddressForm = false;
  savingAddress = false;
  submitting = false;
  error = '';
  success = '';

  cartService = inject(CartService);
  readonly languageService = inject(LanguageService);
  readonly authService = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;

    this.http.get<CustomerAddress[]>(`${environment.apiUrl}/addresses`, {
      headers: this.authService.authorizationHeaders(),
    }).subscribe({
      next: addresses => {
        this.addresses = addresses;
        this.selectedAddressId = addresses[0]?.id ?? null;
        this.addressesLoading = false;
      },
      error: () => {
        this.addresses = [];
        this.addressLoadError = true;
        this.addressesLoading = false;
      },
    });
  }

  saveAddress(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthentication();
      return;
    }

    const name = this.addressName.trim();
    const value = this.addressValue.trim();
    if (!name || !value) {
      this.error = this.languageService.t('addressRequired');
      return;
    }

    this.savingAddress = true;
    this.error = '';
    this.http.post<CustomerAddress>(`${environment.apiUrl}/addresses`, { name, value }, {
      headers: this.authService.authorizationHeaders(),
    }).subscribe({
      next: address => {
        this.addresses = [...this.addresses, address];
        this.selectedAddressId = address.id;
        this.addressName = '';
        this.addressValue = '';
        this.showAddressForm = false;
        this.addressLoadError = false;
        this.savingAddress = false;
      },
      error: err => {
        this.savingAddress = false;
        this.error = err.error?.detail || err.error?.message || this.languageService.t('addressesUnavailable');
      },
    });
  }

  setQuantity(product: Product, quantity: number): void {
    this.cartService.setQuantity(product, quantity);
  }

  productName(product: Product): string {
    const names: Record<string, string> = {
      'Olivewood serving board': this.languageService.t('sampleBoard'),
      'Linen table runner': this.languageService.t('sampleRunner'),
      'Hand-thrown ceramic vase': this.languageService.t('sampleVase'),
      'Woven market basket': this.languageService.t('sampleBasket'),
      'Stoneware coffee set': this.languageService.t('sampleCoffee'),
      'Cotton cushion cover': this.languageService.t('sampleCushion'),
    };
    return names[product.name] ?? product.name;
  }

  placeOrder(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthentication();
      return;
    }

    if (this.cartService.cartItems().some(item => item.product.id < 0)) {
      this.error = this.languageService.t('previewCheckoutBlocked');
      return;
    }

    if (this.selectedAddressId === null) {
      this.error = this.languageService.t('selectAddressRequired');
      return;
    }

    const payload: OrderRequest = {
      addressId: this.selectedAddressId,
      items: this.cartService.cartItems().map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    };
    this.submitting = true;
    this.error = '';
    this.http.post<OrderResponse>(`${environment.apiUrl}/orders/checkout`, payload, {
      headers: this.authService.authorizationHeaders(),
    }).subscribe({
      next: response => {
        this.cartService.clearCart();
        this.submitting = false;
        this.success = this.languageService.t('orderPlaced', { id: response.orderId });
      },
      error: err => {
        this.submitting = false;
        this.error = err.error?.detail || err.error?.message || this.languageService.t('orderFailed');
      },
    });
  }
}