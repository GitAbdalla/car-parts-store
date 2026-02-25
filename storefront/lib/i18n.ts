export const translations = {
  ar: {
    // Nav
    nav: {
      home: 'الرئيسية',
      catalog: 'الكتالوج',
      myAccount: 'حسابي',
      login: 'دخول',
    },
    // Footer
    footer: {
      desc: 'متجر متخصص في قطع غيار مرسيدس بنز الاصلية في مصر. ارقام OEM حقيقية واسعار منافسة.',
      quickLinks: 'روابط سريعة',
      catalog: 'الكتالوج',
      cart: 'السلة',
      contact: 'تواصل معنا',
    },
    // PartCard
    card: {
      addToCart: 'اضف للسلة',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
    },
    // Catalog
    catalog: {
      searchPlaceholder: 'ابحث بالاسم او رقم OEM...',
      categories: 'التصنيفات',
      all: 'الكل',
      sort: 'ترتيب',
      sortName: 'الاسم',
      sortPriceAsc: 'السعر: الاقل',
      sortPriceDesc: 'السعر: الاعلى',
      sortNewest: 'الاحدث',
      searching: 'جاري البحث...',
      partsCount: (n: number) => `${n} قطعة`,
      noResults: 'لا توجد قطع مطابقة',
    },
    // Cart
    cart: {
      title: 'سلة الطلب',
      delivery: 'السعر شامل التوصيل للباب في كل محافظات مصر',
      empty: 'السلة فارغة',
      emptyDesc: 'لم تقم بإضافة أي قطعة بعد',
      browse: 'تصفح القطع',
      remove: 'حذف',
      qty: 'الكمية:',
      summary: 'ملخص الطلب',
      partsCount: 'عدد القطع',
      shipping: 'التوصيل',
      shippingFree: 'مجاني',
      total: 'الاجمالي',
      shippingForm: 'بيانات التوصيل',
      fullName: 'الاسم الكامل *',
      phone: 'رقم الموبايل *',
      phoneHint: 'يقبل 010 / 011 / 012 / 015',
      governorate: 'المحافظة *',
      govPlaceholder: 'اختر المحافظة',
      area: 'المنطقة / الحي *',
      areaPlaceholder: 'مدينة نصر، الزقازيق...',
      address: 'العنوان بالتفصيل *',
      addressPlaceholder: 'الشارع، المبنى، الشقة',
      notes: 'ملاحظات (اختياري)',
      notesPlaceholder: 'أي تعليمات للمندوب...',
      submit: 'تأكيد الطلب',
      submitting: 'جاري الارسال...',
    },
    // Auth
    auth: {
      loginTitle: 'تسجيل الدخول',
      loginSubtitle: 'أهلاً بعودتك، ادخل بياناتك للمتابعة',
      signupTitle: 'انشاء حساب جديد',
      signupSubtitle: 'سجّل الآن واحصل على تتبع طلباتك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      passwordHint: '8 أحرف على الأقل',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPlaceholder: 'أعد كتابة كلمة المرور',
      fullName: 'الاسم الكامل',
      phone: 'رقم الموبايل',
      phoneHint: '010 / 011 / 012 / 015',
      loginBtn: 'دخول',
      loggingIn: 'جاري الدخول...',
      signupBtn: 'انشاء الحساب',
      signingUp: 'جاري الانشاء...',
      noAccount: 'ليس لديك حساب؟',
      createAccount: 'انشاء حساب جديد',
      haveAccount: 'لديك حساب بالفعل؟',
      loginLink: 'تسجيل الدخول',
    },
    // Profile
    profile: {
      orders: 'طلباتي',
      settings: 'الإعدادات',
      logout: 'خروج',
      noOrders: 'لا توجد طلبات بعد',
      noOrdersDesc: 'ابدأ بتصفح قطع الغيار',
      browseCatalog: 'تصفح الكتالوج',
      editProfile: 'تعديل البيانات',
      fullName: 'الاسم الكامل',
      emailReadonly: 'البريد الإلكتروني لا يمكن تغييره',
      phone: 'رقم الموبايل',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      logoutSection: 'تسجيل الخروج',
      logoutDesc: 'سيتم مسح بيانات الجلسة من هذا الجهاز',
    },
    // AddToCart
    addToCart: {
      qty: 'الكمية:',
      add: 'اضف للسلة',
      unavailable: 'غير متوفر',
      whatsapp: 'تواصل عبر واتساب',
    },
    // CarSelector
    car: {
      title: 'ابحث بسيارتك',
      subtitle: 'اختر موديل سيارتك للحصول على القطع المتوافقة',
      brand: 'الماركة',
      model: 'الموديل',
      year: 'سنة الصنع',
      selectBrand: 'اختر الماركة',
      selectModel: 'اختر الموديل',
      selectYear: 'اختر السنة',
      search: 'ابحث عن القطع',
    },
    // Addresses
    addresses: {
      tab: 'عناويني',
      noAddresses: 'لا توجد عناوين محفوظة',
      noAddressesDesc: 'سيتم حفظ عنوانك تلقائياً عند إتمام طلبك',
      addNew: 'اضف عنوان جديد',
      defaultBadge: 'افتراضي',
      setDefault: 'تعيين كافتراضي',
      delete: 'حذف',
      label: 'اسم العنوان',
      labelPlaceholder: 'المنزل، العمل...',
      name: 'اسم المستلم',
      phone: 'رقم الموبايل',
      addressLine1: 'العنوان',
      addressLine2: 'المنطقة / الحي',
      city: 'المحافظة',
      save: 'حفظ العنوان',
      saving: 'جاري الحفظ...',
      cancel: 'الغاء',
      savedAddresses: 'عناوين محفوظة',
      useThis: 'استخدام هذا العنوان',
      newAddress: 'عنوان جديد',
      autoSaved: 'تم حفظ العنوان في ملفك الشخصي',
    },
    // Order success
    orderSuccess: {
      title: 'تم الطلب بنجاح!',
      subtitle: 'شكراً لك، سيتواصل معك فريقنا قريباً لتأكيد الطلب',
      delivery: 'التوصيل شامل لباب بيتك',
      continueShopping: 'متابعة التسوق',
      home: 'الصفحة الرئيسية',
    },
  },

  en: {
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      myAccount: 'My Account',
      login: 'Login',
    },
    footer: {
      desc: 'Specialized store for original Mercedes-Benz spare parts in Egypt. Real OEM numbers and competitive prices.',
      quickLinks: 'Quick Links',
      catalog: 'Catalog',
      cart: 'Cart',
      contact: 'Contact Us',
    },
    card: {
      addToCart: 'Add to Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
    },
    catalog: {
      searchPlaceholder: 'Search by name or OEM number...',
      categories: 'Categories',
      all: 'All',
      sort: 'Sort',
      sortName: 'Name',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortNewest: 'Newest',
      searching: 'Searching...',
      partsCount: (n: number) => `${n} parts`,
      noResults: 'No matching parts found',
    },
    cart: {
      title: 'Your Cart',
      delivery: 'Price includes door-to-door delivery across all Egypt',
      empty: 'Your cart is empty',
      emptyDesc: "You haven't added any parts yet",
      browse: 'Browse Parts',
      remove: 'Remove',
      qty: 'Qty:',
      summary: 'Order Summary',
      partsCount: 'Parts count',
      shipping: 'Shipping',
      shippingFree: 'Free',
      total: 'Total',
      shippingForm: 'Delivery Details',
      fullName: 'Full Name *',
      phone: 'Mobile Number *',
      phoneHint: 'Accepts 010 / 011 / 012 / 015',
      governorate: 'Governorate *',
      govPlaceholder: 'Select governorate',
      area: 'Area / District *',
      areaPlaceholder: 'Nasr City, Zagazig...',
      address: 'Full Address *',
      addressPlaceholder: 'Street, building, apartment',
      notes: 'Notes (optional)',
      notesPlaceholder: 'Any instructions for the courier...',
      submit: 'Confirm Order',
      submitting: 'Sending...',
    },
    auth: {
      loginTitle: 'Sign In',
      loginSubtitle: 'Welcome back, enter your details to continue',
      signupTitle: 'Create Account',
      signupSubtitle: 'Register now and track your orders',
      email: 'Email Address',
      password: 'Password',
      passwordHint: 'At least 8 characters',
      confirmPassword: 'Confirm Password',
      confirmPlaceholder: 'Re-enter your password',
      fullName: 'Full Name',
      phone: 'Mobile Number',
      phoneHint: '010 / 011 / 012 / 015',
      loginBtn: 'Sign In',
      loggingIn: 'Signing in...',
      signupBtn: 'Create Account',
      signingUp: 'Creating...',
      noAccount: "Don't have an account?",
      createAccount: 'Create a new account',
      haveAccount: 'Already have an account?',
      loginLink: 'Sign In',
    },
    profile: {
      orders: 'My Orders',
      settings: 'Settings',
      logout: 'Logout',
      noOrders: 'No orders yet',
      noOrdersDesc: 'Start browsing spare parts',
      browseCatalog: 'Browse Catalog',
      editProfile: 'Edit Profile',
      fullName: 'Full Name',
      emailReadonly: 'Email address cannot be changed',
      phone: 'Mobile Number',
      save: 'Save Changes',
      saving: 'Saving...',
      logoutSection: 'Sign Out',
      logoutDesc: 'Your session data will be cleared from this device',
    },
    addToCart: {
      qty: 'Qty:',
      add: 'Add to Cart',
      unavailable: 'Unavailable',
      whatsapp: 'Contact via WhatsApp',
    },
    car: {
      title: 'Search by Your Car',
      subtitle: 'Select your vehicle model to find compatible parts',
      brand: 'Brand',
      model: 'Model',
      year: 'Year',
      selectBrand: 'Select brand',
      selectModel: 'Select model',
      selectYear: 'Select year',
      search: 'Search Parts',
    },
    addresses: {
      tab: 'My Addresses',
      noAddresses: 'No saved addresses',
      noAddressesDesc: 'Your address will be saved automatically when you place an order',
      addNew: 'Add New Address',
      defaultBadge: 'Default',
      setDefault: 'Set as Default',
      delete: 'Delete',
      label: 'Address Label',
      labelPlaceholder: 'Home, Work...',
      name: 'Recipient Name',
      phone: 'Mobile Number',
      addressLine1: 'Address',
      addressLine2: 'Area / District',
      city: 'Governorate',
      save: 'Save Address',
      saving: 'Saving...',
      cancel: 'Cancel',
      savedAddresses: 'Saved Addresses',
      useThis: 'Use This Address',
      newAddress: 'New Address',
      autoSaved: 'Address saved to your profile',
    },
    orderSuccess: {
      title: 'Order Placed Successfully!',
      subtitle: 'Thank you! Our team will contact you soon to confirm your order.',
      delivery: 'Free delivery to your door',
      continueShopping: 'Continue Shopping',
      home: 'Home Page',
    },
  },
}

// Translations type uses string (not literal) so AR and EN are mutually assignable
export type Translations = {
  nav:    { home: string; catalog: string; myAccount: string; login: string }
  footer: { desc: string; quickLinks: string; catalog: string; cart: string; contact: string }
  card:   { addToCart: string; inStock: string; outOfStock: string }
  catalog: {
    searchPlaceholder: string; categories: string; all: string
    sort: string; sortName: string; sortPriceAsc: string; sortPriceDesc: string; sortNewest: string
    searching: string; partsCount: (n: number) => string; noResults: string
  }
  cart: {
    title: string; delivery: string; empty: string; emptyDesc: string; browse: string
    remove: string; qty: string; summary: string; partsCount: string; shipping: string
    shippingFree: string; total: string; shippingForm: string; fullName: string; phone: string
    phoneHint: string; governorate: string; govPlaceholder: string; area: string
    areaPlaceholder: string; address: string; addressPlaceholder: string; notes: string
    notesPlaceholder: string; submit: string; submitting: string
  }
  auth: {
    loginTitle: string; loginSubtitle: string; signupTitle: string; signupSubtitle: string
    email: string; password: string; passwordHint: string; confirmPassword: string
    confirmPlaceholder: string; fullName: string; phone: string; phoneHint: string
    loginBtn: string; loggingIn: string; signupBtn: string; signingUp: string
    noAccount: string; createAccount: string; haveAccount: string; loginLink: string
  }
  profile: {
    orders: string; settings: string; logout: string; noOrders: string; noOrdersDesc: string
    browseCatalog: string; editProfile: string; fullName: string; emailReadonly: string
    phone: string; save: string; saving: string; logoutSection: string; logoutDesc: string
  }
  addresses: {
    tab: string; noAddresses: string; noAddressesDesc: string; addNew: string
    defaultBadge: string; setDefault: string; delete: string; label: string
    labelPlaceholder: string; name: string; phone: string; addressLine1: string
    addressLine2: string; city: string; save: string; saving: string; cancel: string
    savedAddresses: string; useThis: string; newAddress: string; autoSaved: string
  }
  addToCart: { qty: string; add: string; unavailable: string; whatsapp: string }
  car: {
    title: string; subtitle: string; brand: string; model: string; year: string
    selectBrand: string; selectModel: string; selectYear: string; search: string
  }
  orderSuccess: { title: string; subtitle: string; delivery: string; continueShopping: string; home: string }
}
