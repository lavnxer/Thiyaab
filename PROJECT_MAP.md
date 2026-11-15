---
title: Thyiaab Project Architecture Map
version: 1.0.0
description: Architectural map and navigation guide for Thyiaab project
---

خريطة معمارية تفاعلية ومختصرة لهيكل المشروع. يتم الرجوع إليها كمرجع جغرافي أول لتحديد المسارات والانتقال الدقيق بين الملفات دون مسح عشوائي.

---

## 1. Core & Entry (نواة التطبيق والإعدادات)
- `/src/main.jsx`: نقطة الانطلاق الرئيسية وربط المزودات (Providers)
- `/src/App.jsx`: نظام التوجيه الرئيسي وتوزيع المسارات والحالة العامة
- `/src/index.css`: التنسيقات الأساسية وتضمين الخطوط
- `/src/style.css`: أنماط CSS المخصصة وقواعد المتجر

---

## 2. Pages & Views (الصفحات ومسارات العرض)
- `/src/pages/MenPage.jsx`: قسم ملابس الرجال وتصفية المنتجات
- `/src/pages/WomenPage.jsx`: قسم ملابس النساء وتصفية المنتجات
- `/src/pages/AccessoriesPage.jsx`: قسم الإكسسوارات والمقتنيات
- `/src/pages/ProductPage.jsx`: صفحة تفاصيل المنتج، الصور، واختيار المقاس
- `/src/pages/CartPage.jsx`: صفحة سلة التسوق وحساب الإجمالي
- `/src/pages/CheckoutPage.jsx`: صفحة إنهاء الطلب وعناوين الشحن والدفع
- `/src/pages/WishlistPage.jsx`: صفحة المفضلة وقائمة الرغبات
- `/src/pages/TrackOrderPage.jsx`: صفحة تتبع مسار الشحنات والطلبات
- `/src/pages/AccountPage.jsx`: ملف المستخدم، العناوين، وسجل الطلبات
- `/src/pages/LoginPage.jsx`: تسجيل الدخول، إنشاء الحساب، والمصادقة
- `/src/pages/AdminDashboardPage.jsx`: لوحة تحكم المتجر والمنتجات والطلبات
- `/src/pages/ProductReviewsPage.jsx`: تقييمات ومراجعات تفصيلية للمنتجات
- `/src/pages/SizeGuidePage.jsx`: دليل المقاسات وجداول القياس المعتمدة
- `/src/pages/LegalPage.jsx`: السياسات، الشروط والأحكام، وسياسة الاسترجاع

---

## 3. UI Components (مكونات الواجهة وتجربة المستخدم)
- `/src/components/Navbar.jsx`: شريط التصفح العلوي المتجاوب، قائمة الدرج الجانبية للجوال (Hamburger Drawer)، البحث وسلة التسوق
- `/src/components/Footer.jsx`: تذييل المتجر، الروابط السريعة وتنسيق الأعمدة المتجاوبة على الجوال واللابتوب
- `/src/components/ProductCard.jsx`: بطاقة عرض المنتج المصغرة مع أزرار الإضافة السريعة
- `/src/components/FilterSidebar.jsx`: الفلترة الجانبية (المقاس، السعر، اللون، التصنيف)
- `/src/components/HomeSectionsManagement.jsx`: مكون إدارة وبناء أقسام الصفحة الرئيسية
- `/src/components/OfferManagementSection.jsx`: قسم إدارة العروض الترويجية ومعاينة البانر مع التحكم الدقيق بالإزاحة الأفقية والمقياس
- `/src/components/OutfitShowcaseSection.jsx`: قسم تنسيق الإطلالات والأزياء مع تصميم مخصص للجوال (بطاقة بطل + شبكة 2x2 متناسقة)
- `/src/components/InteractiveButton.jsx`: زر تفاعلي مخصص مع مؤثرات الحركة
- `/src/components/InteractiveIconButton.jsx`: زر أيقونة تفاعلي
- `/src/components/CustomDropdown.jsx`: قائمة اختيار منسدلة مخصصة
- `/src/components/PaymentLogos.jsx`: شعارات طرق وبوابات الدفع (مدى، فيزا، تابي، تمارا)
- `/src/components/RiyalIcon.jsx`: أيقونة العملة (ريال سعودي)
- `/src/components/ScrollToTop.jsx`: زر التمرير السلس إلى أعلى الصفحة
- `/src/components/AnimatedSadX.jsx`: رسم متحرك لحالات الخطأ وعدم توفر النتائج

---

## 4. State & Contexts (إدارة الحالة ومزودات البيانات)
- `/src/context/ShopContext.jsx`: إدارة حالة المتجر، السلة، المفضلة، وقائمة المنتجات
- `/src/context/AuthContext.jsx`: حالة الجلسة والمصادقة وبيانات المستخدم الحالي
- `/src/context/ToastContext.jsx`: إدارة نظام الإشعارات المنبثقة (Toasts)
- `/src/context/ImageSettingsContext.jsx`: إدارة إعدادات وخيارات عرض الصور

---

## 5. Services & Integrations (الخدمات والاتصال الخارجي)
- `/src/lib/api.js`: وظائف الاتصال بواجهة البرمجة (API Requests & Endpoints)
- `/src/lib/supabase.js`: تهيئة عميل Supabase لإدارة البيانات والمصادقة

---

## 6. Static Data & Mocks (البيانات الثابتة والاختبارية)
- `/src/data/homeSectionsData.js`: هيكل وبيانات أقسام الصفحة الرئيسية
- `/src/data/homeOfferData.js`: بيانات العروض الخاصة والخصومات
- `/src/data/productReviews.js`: تقييمات المنتجات المضمنة
- `/src/data/mockAdminData.js`: بيانات تجريبية لإحصائيات لوحة التحكم