import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

const messages = {
  en: {
    language: 'Language', shop: 'Shop', cart: 'Cart', homeLabel: 'Valleystore home', languageLabel: 'Language', footer: 'Thoughtful finds, delivered to your door.',
    account: 'Your account', signIn: 'Sign in', signUp: 'Sign up', signInTitle: 'Welcome back.', signUpTitle: 'Create your account.',
    signInDescription: 'Sign in to manage your addresses and orders.', signUpDescription: 'Create an account to save addresses and place orders.',
    firstName: 'First name', lastName: 'Last name', email: 'Email address', password: 'Password', phoneOptional: 'Phone (optional)',
    pleaseWait: 'Please wait…', createAccount: 'Create account', close: 'Close', registrationSuccess: 'Your account is ready. Sign in to continue.',
    authFailed: 'We couldn’t complete that request. Check your details and try again.', signOut: 'Sign out',
    signOutFailed: 'We couldn’t safely end your session. Please try again.', checkoutSignInPrompt: 'Sign in to view your saved addresses and place your order.',
    heroEyebrow: 'THE VALLEYSTORE EDIT', heroTitle: 'Good things,', heroTitleAccent: 'well chosen.',
    heroDescription: 'Everyday essentials and little luxuries, selected with care and delivered to your door.',
    discover: 'Discover the collection', heroNote: 'Small-batch finds for a more considered home',
    collection: 'THE COLLECTION', collectionTitle: 'Find your next favorite.', piece: 'piece', pieces: 'pieces',
    previewCatalog: 'Preview catalog: the product API is unavailable. These sample items are not from your database and can’t be ordered.',
    search: 'Search products', searchPlaceholder: 'Search the collection', sortBy: 'Sort by', featured: 'Featured',
    priceLow: 'Price: low to high', priceHigh: 'Price: high to low', name: 'Name', loading: 'Loading the collection…',
    loadError: 'We couldn’t load the collection.', tryAgain: 'Try again', emptyCatalog: 'Something lovely is on its way. There are no products to show yet.',
    noMatches: 'No matches just yet. Try a different search.', inStock: 'IN STOCK', soldOut: 'SOLD OUT',
    addToCart: 'Add {name} to cart', addToBag: 'Add to bag', unavailable: 'Currently unavailable',
    sampleBoard: 'Olivewood serving board', sampleBoardDescription: 'Hand-finished olivewood for everyday hosting.',
    sampleRunner: 'Linen table runner', sampleRunnerDescription: 'Soft, breathable linen in a warm natural tone.',
    sampleVase: 'Hand-thrown ceramic vase', sampleVaseDescription: 'A quietly sculptural piece made for fresh stems.',
    sampleBasket: 'Woven market basket', sampleBasketDescription: 'A sturdy, beautiful companion for everyday errands.',
    sampleCoffee: 'Stoneware coffee set', sampleCoffeeDescription: 'Two tactile cups for slower mornings.',
    sampleCushion: 'Cotton cushion cover', sampleCushionDescription: 'A textured layer in an easy, earthy palette.',
    continueShopping: 'Continue shopping', yourBag: 'YOUR VALLEYSTORE BAG', almostYours: 'Almost yours.',
    bagDescription: 'A few thoughtful finds, on their way to you.', emptyBagTitle: 'Your bag is taking a little break.',
    emptyBagDescription: 'Find something you love in the collection.', explore: 'Explore the collection', yourBagCount: 'Your bag',
    remove: 'Remove', decreaseQuantity: 'Decrease quantity', increaseQuantity: 'Increase quantity',
    deliveryDetails: 'Delivery details', cashOnDelivery: 'Cash on delivery', deliveryAddress: 'Saved delivery address',
    loadingAddresses: 'Loading your addresses…', selectAddress: 'Choose an address', noSavedAddresses: 'You have no saved addresses yet. Add one below.', addressesUnavailable: 'Saved addresses could not be loaded. Please try again later.',
    addressName: 'Address name', addressNamePlaceholder: 'e.g. Home or Work', addressValue: 'Address value', addressValuePlaceholder: 'Enter the full address, including area, street and building details',
    addAddress: 'Add a saved address', saveAddress: 'Save address', savingAddress: 'Saving address…', addressHint: 'Choose an address saved to your customer account.', selectAddressRequired: 'Select a saved delivery address to continue.', addressRequired: 'Enter both an address name and address value.',
    estimatedTotal: 'Estimated total', placeOrder: 'Place order · Cash on delivery', placingOrder: 'Placing your order…',
    checkoutNote: 'Final total and stock are confirmed by Valleystore at checkout.',
    previewCheckoutBlocked: 'This is a preview catalog. Sample products cannot be ordered; checkout requires the live catalog and customer APIs.',
        orderFailed: 'We couldn’t place your order. Please try again.', orderPlaced: 'Order #{id} placed successfully. Thank you for shopping with us!',
    continueBrowsing: 'Continue browsing',
  },
  ar: {
    language: 'اللغة', shop: 'تسوّق', cart: 'السلة', homeLabel: 'الصفحة الرئيسية لفالي ستور', languageLabel: 'اللغة', footer: 'اختيارات مميزة تصلك حتى باب منزلك.',
    account: 'حسابك', signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', signInTitle: 'مرحباً بعودتك.', signUpTitle: 'أنشئ حسابك.',
    signInDescription: 'سجّل الدخول لإدارة عناوينك وطلباتك.', signUpDescription: 'أنشئ حساباً لحفظ العناوين وإتمام الطلبات.',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', email: 'البريد الإلكتروني', password: 'كلمة المرور', phoneOptional: 'الهاتف (اختياري)',
    pleaseWait: 'يرجى الانتظار…', createAccount: 'إنشاء حساب', close: 'إغلاق', registrationSuccess: 'تم إنشاء حسابك. سجّل الدخول للمتابعة.',
    authFailed: 'تعذر إكمال الطلب. تحقق من بياناتك وحاول مجدداً.', signOut: 'تسجيل الخروج',
    signOutFailed: 'تعذر إنهاء جلستك بأمان. يرجى المحاولة مجدداً.', checkoutSignInPrompt: 'سجّل الدخول لعرض عناوينك المحفوظة وإتمام طلبك.',
    heroEyebrow: 'اختيارات فالي ستور', heroTitle: 'أشياء جميلة،', heroTitleAccent: 'مختارة بعناية.',
    heroDescription: 'أساسيات يومية ولمسات مميزة، اخترناها بعناية لتصل إلى باب منزلك.',
    discover: 'اكتشف المجموعة', heroNote: 'قطع مختارة بعناية لمنزل أكثر دفئاً',
    collection: 'المجموعة', collectionTitle: 'اكتشف ما سيعجبك.', piece: 'منتج', pieces: 'منتجات',
    previewCatalog: 'كتالوج تجريبي: واجهة المنتجات غير متاحة. هذه المنتجات تجريبية وليست من قاعدة بياناتك ولا يمكن طلبها.',
    search: 'ابحث عن المنتجات', searchPlaceholder: 'ابحث في المجموعة', sortBy: 'ترتيب حسب', featured: 'مميزة',
    priceLow: 'السعر: من الأقل للأعلى', priceHigh: 'السعر: من الأعلى للأقل', name: 'الاسم', loading: 'جارٍ تحميل المجموعة…',
    loadError: 'تعذر تحميل المجموعة.', tryAgain: 'حاول مجدداً', emptyCatalog: 'لا توجد منتجات حالياً. ستجد هنا اختيارات جديدة قريباً.',
    noMatches: 'لا توجد نتائج. جرّب كلمات بحث أخرى.', inStock: 'متوفر', soldOut: 'نفد المخزون',
    addToCart: 'أضف {name} إلى السلة', addToBag: 'أضف إلى السلة', unavailable: 'غير متوفر حالياً',
    sampleBoard: 'لوح تقديم من خشب الزيتون', sampleBoardDescription: 'خشب زيتون مصنوع يدوياً للضيافة اليومية.',
    sampleRunner: 'مفرش طاولة من الكتان', sampleRunnerDescription: 'كتان ناعم وجيد التهوية بلون طبيعي دافئ.',
    sampleVase: 'مزهرية خزفية مصنوعة يدوياً', sampleVaseDescription: 'قطعة فنية بسيطة لإضافة الزهور الطازجة.',
    sampleBasket: 'سلة سوق منسوجة', sampleBasketDescription: 'سلة جميلة ومتينة لمشاويرك اليومية.',
    sampleCoffee: 'طقم أكواب قهوة خزفي', sampleCoffeeDescription: 'كوبان بملمس مميز لصباح أكثر هدوءاً.',
    sampleCushion: 'غطاء وسادة قطني', sampleCushionDescription: 'نسيج مميز بألوان طبيعية هادئة.',
    continueShopping: 'تابع التسوق', yourBag: 'سلة فالي ستور', almostYours: 'بقيت خطوة واحدة.',
    bagDescription: 'اختيارات مميزة في طريقها إليك.', emptyBagTitle: 'سلتك فارغة حالياً.',
    emptyBagDescription: 'اكتشف المجموعة واختر ما يعجبك.', explore: 'اكتشف المجموعة', yourBagCount: 'سلتك',
    remove: 'إزالة', decreaseQuantity: 'تقليل الكمية', increaseQuantity: 'زيادة الكمية',
    deliveryDetails: 'تفاصيل التوصيل', cashOnDelivery: 'الدفع عند الاستلام', deliveryAddress: 'عنوان التوصيل المحفوظ',
    loadingAddresses: 'جارٍ تحميل عناوينك…', selectAddress: 'اختر عنواناً', noSavedAddresses: 'ليس لديك عناوين محفوظة بعد. أضف عنواناً أدناه.', addressesUnavailable: 'تعذر تحميل العناوين المحفوظة. يرجى المحاولة لاحقاً.',
    addressName: 'اسم العنوان', addressNamePlaceholder: 'مثال: المنزل أو العمل', addressValue: 'العنوان', addressValuePlaceholder: 'اكتب العنوان كاملاً، بما في ذلك المنطقة والشارع ورقم المبنى',
    addAddress: 'إضافة عنوان محفوظ', saveAddress: 'حفظ العنوان', savingAddress: 'جارٍ حفظ العنوان…', addressHint: 'اختر عنواناً محفوظاً في حساب العميل.', selectAddressRequired: 'يرجى اختيار عنوان توصيل محفوظ للمتابعة.', addressRequired: 'يرجى إدخال اسم العنوان والعنوان.',
    estimatedTotal: 'الإجمالي التقديري', placeOrder: 'اطلب الآن · الدفع عند الاستلام', placingOrder: 'جارٍ إرسال الطلب…',
    checkoutNote: 'يتم تأكيد السعر النهائي والمخزون عند إتمام الطلب.',
    previewCheckoutBlocked: 'هذا كتالوج تجريبي. لا يمكن طلب المنتجات التجريبية؛ يلزم توفر واجهات الكتالوج والطلبات الفعلية.',
        orderFailed: 'تعذر إتمام الطلب. يرجى المحاولة مجدداً.', orderPlaced: 'تم إرسال الطلب رقم {id} بنجاح. شكراً لتسوقك معنا!',
    continueBrowsing: 'تابع التصفح',
  },
  fr: {
    language: 'Langue', shop: 'Boutique', cart: 'Panier', homeLabel: 'Accueil Valleystore', languageLabel: 'Langue', footer: 'De belles trouvailles livrées chez vous.',
    account: 'Votre compte', signIn: 'Se connecter', signUp: 'Créer un compte', signInTitle: 'Ravi de vous revoir.', signUpTitle: 'Créez votre compte.',
    signInDescription: 'Connectez-vous pour gérer vos adresses et vos commandes.', signUpDescription: 'Créez un compte pour enregistrer vos adresses et commander.',
    firstName: 'Prénom', lastName: 'Nom', email: 'Adresse e-mail', password: 'Mot de passe', phoneOptional: 'Téléphone (facultatif)',
    pleaseWait: 'Veuillez patienter…', createAccount: 'Créer un compte', close: 'Fermer', registrationSuccess: 'Votre compte est prêt. Connectez-vous pour continuer.',
    authFailed: 'Impossible de traiter la demande. Vérifiez vos informations et réessayez.', signOut: 'Se déconnecter',
    signOutFailed: 'Impossible de fermer votre session en toute sécurité. Réessayez.', checkoutSignInPrompt: 'Connectez-vous pour afficher vos adresses et passer commande.',
    heroEyebrow: 'LA SÉLECTION VALLEYSTORE', heroTitle: 'De belles choses,', heroTitleAccent: 'bien choisies.',
    heroDescription: 'Des essentiels du quotidien et de petites attentions, choisis avec soin et livrés chez vous.',
    discover: 'Découvrir la collection', heroNote: 'Des pièces choisies avec soin pour une maison accueillante',
    collection: 'LA COLLECTION', collectionTitle: 'Trouvez votre prochain coup de cœur.', piece: 'article', pieces: 'articles',
    previewCatalog: 'Catalogue de démonstration : l’API produits est indisponible. Ces articles sont fictifs et ne peuvent pas être commandés.',
    search: 'Rechercher des produits', searchPlaceholder: 'Rechercher dans la collection', sortBy: 'Trier par', featured: 'À la une',
    priceLow: 'Prix : croissant', priceHigh: 'Prix : décroissant', name: 'Nom', loading: 'Chargement de la collection…',
    loadError: 'Impossible de charger la collection.', tryAgain: 'Réessayer', emptyCatalog: 'Aucun produit pour le moment. De belles nouveautés arrivent bientôt.',
    noMatches: 'Aucun résultat. Essayez une autre recherche.', inStock: 'EN STOCK', soldOut: 'ÉPUISÉ',
    addToCart: 'Ajouter {name} au panier', addToBag: 'Ajouter au panier', unavailable: 'Indisponible',
    sampleBoard: 'Planche de service en olivier', sampleBoardDescription: 'Olivier travaillé à la main pour recevoir au quotidien.',
    sampleRunner: 'Chemin de table en lin', sampleRunnerDescription: 'Un lin doux et respirant dans une teinte naturelle.',
    sampleVase: 'Vase en céramique façonné à la main', sampleVaseDescription: 'Une pièce sculpturale discrète pour vos fleurs fraîches.',
    sampleBasket: 'Panier de marché tressé', sampleBasketDescription: 'Un compagnon solide et élégant pour vos courses.',
    sampleCoffee: 'Service à café en grès', sampleCoffeeDescription: 'Deux tasses texturées pour des matins plus doux.',
    sampleCushion: 'Housse de coussin en coton', sampleCushionDescription: 'Une touche de texture dans des tons naturels.',
    continueShopping: 'Continuer mes achats', yourBag: 'VOTRE PANIER VALLEYSTORE', almostYours: 'C’est presque à vous.',
    bagDescription: 'Quelques belles trouvailles bientôt chez vous.', emptyBagTitle: 'Votre panier est momentanément vide.',
    emptyBagDescription: 'Découvrez la collection et trouvez votre bonheur.', explore: 'Découvrir la collection', yourBagCount: 'Votre panier',
    remove: 'Retirer', decreaseQuantity: 'Diminuer la quantité', increaseQuantity: 'Augmenter la quantité',
    deliveryDetails: 'Informations de livraison', cashOnDelivery: 'Paiement à la livraison', deliveryAddress: 'Adresse de livraison enregistrée',
    loadingAddresses: 'Chargement de vos adresses…', selectAddress: 'Choisir une adresse', noSavedAddresses: 'Aucune adresse enregistrée. Ajoutez-en une ci-dessous.', addressesUnavailable: 'Impossible de charger les adresses enregistrées. Réessayez plus tard.',
    addressName: 'Nom de l’adresse', addressNamePlaceholder: 'Ex. : domicile ou travail', addressValue: 'Adresse', addressValuePlaceholder: 'Saisissez l’adresse complète : quartier, rue et numéro du bâtiment',
    addAddress: 'Ajouter une adresse enregistrée', saveAddress: 'Enregistrer l’adresse', savingAddress: 'Enregistrement…', addressHint: 'Choisissez une adresse enregistrée dans votre compte client.', selectAddressRequired: 'Choisissez une adresse enregistrée pour continuer.', addressRequired: 'Saisissez un nom et une adresse.',
    estimatedTotal: 'Total estimé', placeOrder: 'Commander · Paiement à la livraison', placingOrder: 'Commande en cours…',
    checkoutNote: 'Le stock et le montant définitif sont confirmés lors de la commande.',
    previewCheckoutBlocked: 'Catalogue de démonstration : ces articles fictifs ne peuvent pas être commandés. Les API réelles sont nécessaires.',
        orderFailed: 'Impossible de passer la commande. Veuillez réessayer.', orderPlaced: 'Commande n° {id} passée avec succès. Merci de votre confiance !',
    continueBrowsing: 'Continuer la visite',
  },
} as const;

export type Language = keyof typeof messages;
export type TranslationKey = keyof typeof messages.en;

const languageConfig: Record<Language, { locale: string; direction: 'ltr' | 'rtl' }> = {
  en: { locale: 'en-EG', direction: 'ltr' },
  ar: { locale: 'ar-EG', direction: 'rtl' },
  fr: { locale: 'fr-FR', direction: 'ltr' },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>(this.readSavedLanguage());
  readonly locale = () => languageConfig[this.language()].locale;

  constructor() {
    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language;
      this.document.documentElement.dir = languageConfig[language].direction;
      try {
        globalThis.localStorage?.setItem('valleystore_language', language);
      } catch {
        // The language remains active for the current session if storage is unavailable.
      }
    });
  }

  setLanguage(language: string): void {
    if (language in messages) this.language.set(language as Language);
  }

  t(key: TranslationKey, params: Record<string, string | number> = {}): string {
    let value: string = messages[this.language()][key];
    for (const [name, replacement] of Object.entries(params)) {
      value = value.replace(`{${name}}`, String(replacement));
    }
    return value;
  }

  private readSavedLanguage(): Language {
    try {
      const saved = globalThis.localStorage?.getItem('valleystore_language');
      if (saved && saved in messages) return saved as Language;
    } catch {
      // Fall back to English if browser storage is unavailable.
    }
    return 'en';
  }
}
