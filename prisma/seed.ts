import { PrismaClient, UserRole, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus, InventoryTransactionType, TransactionType, Product, ExpenseCategory, Order } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(randomInt(1, 28));
  return d;
}

async function main() {
  console.log("🚀 Starting enterprise data generation...\n");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("mm123mm", 12);
  const employeePassword = await bcrypt.hash("emp123", 12);

  // ═══════════════════════════════════════════════════════════
  // 1. USERS
  // ═══════════════════════════════════════════════════════════
  console.log("👤 Creating users...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      name: "عبدالله المدير",
      email: "admin@store.com",
      phone: "+966501234567",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@store.com" },
    update: {},
    create: {
      name: "محمد الموظف",
      email: "employee@store.com",
      phone: "+966502345678",
      passwordHash: employeePassword,
      role: UserRole.EMPLOYEE,
      emailVerified: new Date(),
      isActive: true,
    },
  });

  const customerData = [
    { name: "أحمد محمد العلي", email: "mohammed@gmail.com", phone: "+966551112233" },
    { name: "فاطمة عبدالرحمن السالم", email: "fatima@gmail.com", phone: "+966552223344" },
    { name: "خالد عبدالله الراشد", email: "khaled@gmail.com", phone: "+966553334455" },
    { name: "نورة سعد المطيري", email: "noura@gmail.com", phone: "+966554445566" },
    { name: "عمر حسن البكري", email: "omar@gmail.com", phone: "+966555556677" },
    { name: "سارة يوسف الشمري", email: "sara@gmail.com", phone: "+966556667788" },
    { name: "ياسر إبراهيم الدوسري", email: "yasser@gmail.com", phone: "+966557778899" },
    { name: "منال خالد العنزي", email: "manal@gmail.com", phone: "+966558889900" },
    { name: "سلطان فهد الحربي", email: "sultan@gmail.com", phone: "+966559990011" },
    { name: "ريم ناصر القحطاني", email: "reem@gmail.com", phone: "+966550001122" },
    { name: "فهد عادل الزهراني", email: "fahd@gmail.com", phone: "+966551110022" },
    { name: "لينا محمد الغامدي", email: "lina@gmail.com", phone: "+966552220033" },
  ];

  const customers = [];
  for (const c of customerData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: customerPassword,
        role: UserRole.CUSTOMER,
        emailVerified: new Date(),
        isActive: true,
      },
    });
    customers.push(user);
  }
  console.log(`   ✅ ${customers.length + 2} users created (1 admin, 1 employee, ${customers.length} customers)`);

  // ═══════════════════════════════════════════════════════════
  // 2. ADDRESSES
  // ═══════════════════════════════════════════════════════════
  console.log("📍 Creating addresses...");

  const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الظهران", "الخبر", "تبوك", "أبها", "نجران", "الاحساء", "القطيف"];
  const districts = ["حي النزهة", "حي الملقا", "حي العليا", "حي الروضة", "حي المونسية", "حي الراكة", "حي الحمراء", "حي الشفا"];

  let addressCount = 0;
  const existingAddressCount = await prisma.address.count();
  if (existingAddressCount === 0) {
    for (const customer of customers) {
      const numAddresses = randomInt(1, 3);
      for (let i = 0; i < numAddresses; i++) {
        await prisma.address.create({
          data: {
            userId: customer.id,
            label: i === 0 ? "المنزل" : i === 1 ? "العمل" : "العنوان الإضافي",
            street: `شارع ${randomItem(["الملك فهد", "الستين", "تميم", "الفيصل", "عبدالعزيز", "ال延安"])} ${randomInt(1, 200)}`,
            city: randomItem(cities),
            state: randomItem(["منطقة الرياض", "منطقة مكة", "منطقة الشرقية", "منطقة المدينة"]),
            zipCode: `${randomInt(10000, 99999)}`,
            country: "SA",
            isDefault: i === 0,
          },
        });
        addressCount++;
      }
    }
  } else {
    addressCount = existingAddressCount;
  }
  console.log(`   ✅ ${addressCount} addresses (skipped if already exists)`);

  // ═══════════════════════════════════════════════════════════
  // 3. BRANDS
  // ═══════════════════════════════════════════════════════════
  console.log("🏷️  Creating brands...");

  const brandData = [
    { name: "سامسونج", slug: "samsung" },
    { name: "آبل", slug: "apple" },
    { name: "سوني", slug: "sony" },
    { name: "إل جي", slug: "lg" },
    { name: "هواوي", slug: "huawei" },
    { name: "شاومي", slug: "xiaomi" },
    { name: "ديل", slug: "dell" },
    { name: "لينوفو", slug: "lenovo" },
    { name: "HP", slug: "hp" },
    { name: "Canon", slug: "canon" },
    { name: "Philips", slug: "philips" },
    { name: "Bose", slug: "bose" },
  ];

  const brands = [];
  for (const b of brandData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug, status: "ACTIVE" },
    });
    brands.push(brand);
  }
  console.log(`   ✅ ${brands.length} brands created`);

  // ═══════════════════════════════════════════════════════════
  // 4. CATEGORIES (with parent-child)
  // ═══════════════════════════════════════════════════════════
  console.log("📁 Creating categories...");

  const parentCatData = [
    { name: "الإلكترونيات", slug: "electronics" },
    { name: "الهواتف الذكية", slug: "smartphones" },
    { name: "الأجهزة اللوحية", slug: "tablets" },
    { name: "الحواسيب", slug: "computers" },
    { name: "الإكسسوارات", slug: "accessories" },
    { name: "الصوتيات", slug: "audio" },
    { name: "الشاشات", slug: "displays" },
    { name: "أجهزة التصوير", slug: "cameras" },
    { name: "الأجهزة المنزلية", slug: "home-appliances" },
    { name: "العناية الشخصية", slug: "personal-care" },
    { name: "الألعاب", slug: "gaming" },
    { name: "الشبكات", slug: "networking" },
  ];

  const categories = [];
  for (let i = 0; i < parentCatData.length; i++) {
    const c = parentCatData[i];
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        description: `فئة ${c.name} - تشمل أفضل المنتجات والماركات`,
        status: "ACTIVE",
        sortOrder: i,
      },
    });
    categories.push(cat);
  }

  const subCatData = [
    { name: "هواتف أندرويد", slug: "android-phones", parentSlug: "smartphones" },
    { name: "هواتف آيفون", slug: "iphones", parentSlug: "smartphones" },
    { name: "لابتوب", slug: "laptops", parentSlug: "computers" },
    { name: "ديسكتوب", slug: "desktops", parentSlug: "computers" },
    { name: "سماعات", slug: "headphones", parentSlug: "audio" },
    { name: "سماعات لاسلكية", slug: "wireless-headphones", parentSlug: "audio" },
    { name: "شواحن", slug: "chargers", parentSlug: "accessories" },
    { name: "كفرات", slug: "cases", parentSlug: "accessories" },
    { name: "شاشات كمبيوتر", slug: "monitors", parentSlug: "displays" },
    { name: "شاشات تلفزيون", slug: "tvs", parentSlug: "displays" },
  ];

  const subCategories = [];
  for (const sc of subCatData) {
    const parent = categories.find((c) => c.slug === sc.parentSlug);
    if (parent) {
      const sub = await prisma.category.upsert({
        where: { slug: sc.slug },
        update: {},
        create: {
          name: sc.name,
          slug: sc.slug,
          description: `فئة فرعية: ${sc.name}`,
          parentId: parent.id,
          status: "ACTIVE",
          sortOrder: 0,
        },
      });
      subCategories.push(sub);
    }
  }
  console.log(`   ✅ ${categories.length + subCategories.length} categories created (${categories.length} parent, ${subCategories.length} sub)`);

  // ═══════════════════════════════════════════════════════════
  // 5. PRODUCTS
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Creating products...");

  const productData = [
    { name: "سامسونج جالكسي S24 Ultra", slug: "samsung-galaxy-s24-ultra", sku: "SAM-S24U-256", price: 4799, costPrice: 3200, stock: 45, brandSlug: "samsung", catSlugs: ["smartphones", "android-phones"], desc: "هاتف سامسونج جالكسي S24 Ultra بسعة 256 جيجابايت، مع شاشة AMOLED فائقة الوضوح وكاميرا 200 ميجابكسل" },
    { name: "آيفون 15 برو ماكس", slug: "iphone-15-pro-max", sku: "APL-15PM-256", price: 5499, costPrice: 3800, stock: 38, brandSlug: "apple", catSlugs: ["smartphones", "iphones"], desc: "آبل آيفون 15 برو ماكس 256 جيجابايت، مع شريحة A17 Pro وكاميرا ثلاثية" },
    { name: "سامسونج جالكسي A54", slug: "samsung-galaxy-a54", sku: "SAM-A54-128", price: 1599, costPrice: 1050, stock: 72, brandSlug: "samsung", catSlugs: ["smartphones", "android-phones"], desc: "هاتف سامسونج جالكسي A54 بسعة 128 جيجابايت، مع شاشة Super AMOLED وبطارية 5000 مللي أمبير" },
    { name: "هواوي P60 Pro", slug: "huawei-p60-pro", sku: "HUA-P60P-256", price: 3299, costPrice: 2100, stock: 25, brandSlug: "huawei", catSlugs: ["smartphones", "android-phones"], desc: "هاتف هواوي P60 Pro بسعة 256 جيجابايت، مع كاميرا XMAGE وشحن فائق السرعة" },
    { name: "ماك بوك برو 14 بوصة", slug: "macbook-pro-14", sku: "APL-MBP14-M3", price: 8999, costPrice: 6500, stock: 15, brandSlug: "apple", catSlugs: ["computers", "laptops"], desc: "آبل ماك بوك برو 14 بوصة مع شريحة M3 Pro و16 جيجابايت رام" },
    { name: "ديل XPS 15", slug: "dell-xps-15", sku: "DEL-XPS15-I7", price: 5999, costPrice: 4200, stock: 20, brandSlug: "dell", catSlugs: ["computers", "laptops"], desc: " dell XPS 15 مع معالج Intel Core i7 الجيل الثالث عشر و16 جيجابايت رام" },
    { name: "لينوفو ThinkPad X1 Carbon", slug: "lenovo-thinkpad-x1", sku: "LEN-X1C-I7", price: 6499, costPrice: 4500, stock: 18, brandSlug: "lenovo", catSlugs: ["computers", "laptops"], desc: "لينوفو ThinkPad X1 Carbon الجيل الحادي عشر مع Intel Core i7 و512 جيجابايت SSD" },
    { name: "HP Spectre x360", slug: "hp-spectre-x360", sku: "HP-SPX360-I7", price: 5799, costPrice: 4000, stock: 12, brandSlug: "hp", catSlugs: ["computers", "laptops"], desc: "HP Spectre x360 2 في 1 مع شاشة 14 بوصة ومعالج Intel Core i7" },
    { name: "آيباد برو 12.9 بوصة", slug: "ipad-pro-129", sku: "APL-IPDP-129", price: 4999, costPrice: 3500, stock: 22, brandSlug: "apple", catSlugs: ["tablets"], desc: "آبل آيباد برو 12.9 بوصة مع شريحة M2 وسعة 256 جيجابايت" },
    { name: "سامسونج جالكسي تاب S9", slug: "samsung-tab-s9", sku: "SAM-TAB9-256", price: 2999, costPrice: 2000, stock: 30, brandSlug: "samsung", catSlugs: ["tablets"], desc: "سامسونج جالكسي تاب S9 بسعة 256 جيجابايت مع قلم S Pen" },
    { name: "سماعات سوني WH-1000XM5", slug: "sony-wh1000xm5", sku: "SON-WH1000", price: 1499, costPrice: 950, stock: 40, brandSlug: "sony", catSlugs: ["audio", "headphones", "wireless-headphones"], desc: "سماعات سوني WH-1000XM5 لاسلكية مع إلغاء الضوضاء النشط" },
    { name: "سماعات آبل AirPods Pro 2", slug: "airpods-pro-2", sku: "APL-APP2-USB", price: 999, costPrice: 650, stock: 55, brandSlug: "apple", catSlugs: ["audio", "headphones", "wireless-headphones"], desc: "سماعات آبل AirPods Pro 2 مع تقنية USB-C وإلغاء الضوضاء النشط" },
    { name: "سماعات Bose QuietComfort", slug: "bose-qc-ultra", sku: "BOS-QCUltra", price: 1399, costPrice: 900, stock: 28, brandSlug: "bose", catSlugs: ["audio", "headphones", "wireless-headphones"], desc: "سماعات Bose QuietComfort Ultra مع إلغاء الضوضاء المتقدم" },
    { name: "تلفزيون سوني Bravia 65 بوصة", slug: "sony-bravia-65", sku: "SON-BRAV65-4K", price: 4499, costPrice: 3000, stock: 10, brandSlug: "sony", catSlugs: ["displays", "tvs"], desc: "تلفزيون سوني Bravia 65 بوصة 4K OLED مع معالج Cognitive Processor XR" },
    { name: "تلفزيون سامسونج 55 بوصة Neo QLED", slug: "samsung-neo-qled-55", sku: "SAM-NQLED55", price: 3799, costPrice: 2500, stock: 14, brandSlug: "samsung", catSlugs: ["displays", "tvs"], desc: "تلفزيون سامسونج Neo QLED 55 بوصة مع تقنية Quantum Mini LED" },
    { name: "شاشة Dell UltraSharp 27 بوصة", slug: "dell-ultrasharp-27", sku: "DEL-US27-4K", price: 2499, costPrice: 1600, stock: 20, brandSlug: "dell", catSlugs: ["displays", "monitors"], desc: "شاشة Dell UltraSharp 27 بوصة 4K IPS مع تغطية 98% DCI-P3" },
    { name: "كاميرا Canon EOS R6 Mark II", slug: "canon-eos-r6ii", sku: "CAN-R6M2-B", price: 9999, costPrice: 7200, stock: 8, brandSlug: "canon", catSlugs: ["cameras"], desc: "كاميرا Canon EOS R6 Mark II مع مستشعر 24.2 ميجابكسل Full-Frame" },
    { name: "سماعات Philips TAH4205", slug: "philips-tah4205", sku: "PHI-TAH4205", price: 299, costPrice: 180, stock: 60, brandSlug: "philips", catSlugs: ["audio", "headphones", "wireless-headphones"], desc: "سماعات Philips Lاسلكية فوق الأذن مع صوت Bass mạnh" },
    { name: "شاحن آبل MagSafe", slug: "apple-magsafe-charger", sku: "APL-MAGSAFE", price: 179, costPrice: 90, stock: 100, brandSlug: "apple", catSlugs: ["accessories", "chargers"], desc: "شاحن آبل MagSafe لاسلكي سريع مع تثبيت مغناطيسي" },
    { name: "شاحن سامسونج 25 واط", slug: "samsung-25w-charger", sku: "SAM-25W-TYP", price: 129, costPrice: 60, stock: 120, brandSlug: "samsung", catSlugs: ["accessories", "chargers"], desc: "شاحن سامسونج سريع 25 واط مع منفذ USB-C" },
    { name: "كفر آبل MagSafe جلد", slug: "apple-magsafe-case", sku: "APL-CASE-15PM", price: 249, costPrice: 100, stock: 80, brandSlug: "apple", catSlugs: ["accessories", "cases"], desc: "كفر آبل مagneto بجلد طبيعي لآيفون 15 برو ماكس" },
    { name: "جهاز توجيه TP-Link AX73", slug: "tplink-ax73", sku: "TPK-AX73-WiFi", price: 599, costPrice: 350, stock: 35, brandSlug: "philips", catSlugs: ["networking"], desc: "جهاز توجيه TP-Link Archer AX73 WiFi 6AX بسرعة حتى 5400 ميجابت" },
    { name: "ماك بوك اير 15 بوصة M3", slug: "macbook-air-15-m3", sku: "APL-MBA15-M3", price: 6499, costPrice: 4600, stock: 16, brandSlug: "apple", catSlugs: ["computers", "laptops"], desc: "آبل ماك بوك اير 15 بوصة مع شريحة M3 و8 جيجابايت رام" },
    { name: "ساعة آبل Ultra 2", slug: "apple-watch-ultra-2", sku: "APL-AWU2-49", price: 3499, costPrice: 2400, stock: 19, brandSlug: "apple", catSlugs: ["accessories"], desc: "ساعة آبل Ultra 2 بساعة 49 ملم مع GPS + خلوي ومقاومة للماء" },
    { name: "شاحن باور بانك Xiaomi 20000", slug: "xiaomi-powerbank-20k", sku: "XIA-PB20K", price: 149, costPrice: 70, stock: 90, brandSlug: "xiaomi", catSlugs: ["accessories", "chargers"], desc: "شاحن متنقل شاومي بسعة 20000 مللي أمبير مع شحن سريع 50 واط" },
    { name: "جهاز توجيه Huawei AX3", slug: "huawei-ax3", sku: "HUA-AX3-WiFi", price: 399, costPrice: 220, stock: 25, brandSlug: "huawei", catSlugs: ["networking"], desc: "جهاز توجيه هواوي AX3 Dual Band WiFi 6 بسرعة 3000 ميجابت" },
    { name: "شاشة Samsung Odyssey G7 32 بوصة", slug: "samsung-odyssey-g7-32", sku: "SAM-ODG7-32", price: 2799, costPrice: 1900, stock: 11, brandSlug: "samsung", catSlugs: ["displays", "monitors"], desc: "شاشة ألعاب Samsung Odyssey G7 32 بوصة 4K 144Hz مع وقت استجابة 1ms" },
    { name: "كاميرا Canon EOS R50", slug: "canon-eos-r50", sku: "CAN-R50-W", price: 3299, costPrice: 2200, stock: 13, brandSlug: "canon", catSlugs: ["cameras"], desc: "كاميرا Canon EOS R50 مع مستشعر 24.2 ميجابكسل وتسجيل 4K" },
    { name: "سماعات Sony WF-1000XM5", slug: "sony-wf1000xm5", sku: "SON-WF1000", price: 1199, costPrice: 780, stock: 32, brandSlug: "sony", catSlugs: ["audio", "headphones", "wireless-headphones"], desc: "سماعات سوني داخل الأذن WF-1000XM5 مع إلغاء الضوضاء النشط" },
  ];

  const products: Product[] = [];
  for (let i = 0; i < productData.length; i++) {
    const pd = productData[i];
    const brand = brands.find((b) => b.slug === pd.brandSlug);

    const product = await prisma.product.upsert({
      where: { slug: pd.slug },
      update: {},
      create: {
        name: pd.name,
        slug: pd.slug,
        sku: pd.sku,
        description: pd.desc,
        shortDescription: pd.desc.substring(0, 100),
        price: pd.price,
        salePrice: i % 3 === 0 ? Math.round(pd.price * 0.85) : null,
        costPrice: pd.costPrice,
        stockQuantity: pd.stock,
        lowStockThreshold: 15,
        status: ProductStatus.ACTIVE,
        isFeatured: i < 6,
        brandId: brand?.id || null,
      },
    });

    for (const catSlug of pd.catSlugs) {
      const cat = [...categories, ...subCategories].find((c) => c.slug === catSlug);
      if (cat) {
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
          update: {},
          create: { productId: product.id, categoryId: cat.id },
        });
      }
    }

    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://res.cloudinary.com/demo/image/upload/v1/sample.jpg`,
          altText: pd.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    products.push(product);
  }
  console.log(`   ✅ ${products.length} products created with images and categories`);

  // ═══════════════════════════════════════════════════════════
  // 6. PRODUCT VARIANTS
  // ═══════════════════════════════════════════════════════════
  console.log("🎨 Creating product variants...");

  const variantProducts = products.filter((p) => p.sku.startsWith("SAM-S24") || p.sku.startsWith("APL-15PM") || p.sku.startsWith("APL-APP2"));
  let variantCount = 0;
  for (const product of variantProducts) {
    const colors = [
      { name: "أسود", color: "#000000" },
      { name: "أبيض", color: "#FFFFFF" },
      { name: "أزرق", color: "#2563EB" },
      { name: "بنفسجي", color: "#7C3AED" },
    ];
    for (let i = 0; i < 3; i++) {
      await prisma.productVariant.upsert({
        where: { sku: `${product.sku}-C${i + 1}` },
        update: {},
        create: {
          productId: product.id,
          name: colors[i].name,
          sku: `${product.sku}-C${i + 1}`,
          price: null,
          stockQuantity: randomInt(10, 30),
          attributes: { color: colors[i].name, hex: colors[i].color },
        },
      });
      variantCount++;
    }
  }
  console.log(`   ✅ ${variantCount} product variants created`);

  // ═══════════════════════════════════════════════════════════
  // 7. EXPENSE CATEGORIES
  // ═══════════════════════════════════════════════════════════
  console.log("💰 Creating expense categories...");

  const expenseCatData = [
    { name: "الإيجار", description: "إيجار المخزن والمكتب" },
    { name: "الرواتب", description: "رواتب الموظفين والمكافآت" },
    { name: "الشحن والتوصيل", description: "تكاليف الشحن والتوصيل" },
    { name: "التسويق والإعلانات", description: "مصاريف التسويق الرقمي والإعلانات" },
    { name: "المرافق", description: "كهرباء، ماء، إنترنت، هاتف" },
    { name: " الصيانة والإصلاح", description: "صيانة الأجهزة والمعدات" },
    { name: "المواد المستهلكة", description: "مواد تغليف وكراتين ومواد مكتبية" },
    { name: "التأمين", description: "تأمين المخزن والبضاعة" },
    { name: "الرسوم الحكومية", description: "رسوم التصاريح والسجل التجاري" },
    { name: "التدريب والتطوير", description: "دورات تدريبية وتطوير مهارات" },
    { name: "الضرائب", description: "ضريبة القيمة المضافة والرسوم الجمركية" },
    { name: "مصاريف بنكية", description: "عمولات بنكية ورسوم تحويل" },
  ];

  const existingExpCats = await prisma.expenseCategory.count();
  const expenseCategories: ExpenseCategory[] = [];
  if (existingExpCats === 0) {
    const created = await prisma.expenseCategory.createMany({ data: expenseCatData.map((ec) => ({ name: ec.name, description: ec.description })) });
    expenseCategories.push(...await prisma.expenseCategory.findMany());
  } else {
    expenseCategories.push(...await prisma.expenseCategory.findMany());
  }
  console.log(`   ✅ ${expenseCategories.length} expense categories created (skipped if already exists)`);

  // ═══════════════════════════════════════════════════════════
  // 8. ORDERS (with items and timeline)
  // ═══════════════════════════════════════════════════════════
  console.log("🛒 Creating orders...");

  const orderStatuses: OrderStatus[] = [
    OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING,
    OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.RETURNED,
  ];
  const paymentMethods: PaymentMethod[] = [PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.BANK_TRANSFER];

  let orderCount = 0;
  let orders: Order[] = [];

  const existingOrderCount = await prisma.order.count();
  if (existingOrderCount >= 25) {
    orders = await prisma.order.findMany({ orderBy: { createdAt: "asc" } });
    orderCount = orders.length;
    console.log(`   ✅ ${orderCount} orders already exist, skipping creation`);
  } else {
  for (let i = 0; i < 25; i++) {
    const customer = randomItem(customers);
    const numItems = randomInt(1, 4);
    const orderItems: { product: typeof products[0]; quantity: number; price: number }[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = randomItem(products);
      const quantity = randomInt(1, 3);
      const price = product.salePrice ? Number(product.salePrice) : Number(product.price);
      orderItems.push({ product, quantity, price });
      subtotal += price * quantity;
    }

    const shippingCost = subtotal > 500 ? 0 : 25;
    const tax = Math.round(subtotal * 0.15);
    const total = subtotal + shippingCost + tax;
    const status = orderStatuses[i % orderStatuses.length];
    const daysOffset = randomInt(1, 90);
    const orderDate = daysAgo(daysOffset);

    const paymentStatus = status === OrderStatus.DELIVERED ? PaymentStatus.PAID :
      status === OrderStatus.CANCELLED ? PaymentStatus.REFUNDED :
      status === OrderStatus.RETURNED ? PaymentStatus.REFUNDED :
      PaymentStatus.PENDING;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: `ORD-${String(10000 + i).padStart(5, "0")}`,
        status,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress: {
          name: customer.name,
          phone: customer.phone,
          city: randomItem(cities),
          district: randomItem(districts),
          street: `شارع ${randomItem(["الملكة", "الأمير", "الملك"])} ${randomInt(1, 100)}`,
        },
        paymentMethod: randomItem(paymentMethods),
        paymentStatus,
        notes: i % 5 === 0 ? "يرجى التوصيل في المساء" : null,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });

    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
        },
      });

      if (([OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PREPARING, OrderStatus.CONFIRMED] as OrderStatus[]).includes(status)) {
        const oldQty = item.product.stockQuantity;
        const newQty = oldQty - item.quantity;
        await prisma.inventoryTransaction.create({
          data: {
            productId: item.product.id,
            type: InventoryTransactionType.SALE,
            quantity: -item.quantity,
            oldQuantity: oldQty,
            newQuantity: newQty,
            reference: order.orderNumber,
            notes: `بيع من الطلب ${order.orderNumber}`,
            performedBy: admin.id,
            performedByName: admin.name,
            createdAt: orderDate,
          },
        });
        await prisma.product.update({
          where: { id: item.product.id },
          data: { stockQuantity: Math.max(0, newQty) },
        });
      }
    }

    const timelineStatuses: OrderStatus[] = [OrderStatus.PENDING];
    if (([OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] as OrderStatus[]).includes(status)) {
      timelineStatuses.push(OrderStatus.CONFIRMED);
    }
    if (([OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] as OrderStatus[]).includes(status)) {
      timelineStatuses.push(OrderStatus.PREPARING);
    }
    if (([OrderStatus.SHIPPED, OrderStatus.DELIVERED] as OrderStatus[]).includes(status)) {
      timelineStatuses.push(OrderStatus.SHIPPED);
    }
    if (status === OrderStatus.DELIVERED) {
      timelineStatuses.push(OrderStatus.DELIVERED);
    }
    if (status === OrderStatus.CANCELLED) {
      timelineStatuses.push(OrderStatus.CANCELLED);
    }
    if (status === OrderStatus.RETURNED) {
      timelineStatuses.push(OrderStatus.SHIPPED);
      timelineStatuses.push(OrderStatus.RETURNED);
    }

    for (let t = 0; t < timelineStatuses.length; t++) {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: timelineStatuses[t],
          note: t === 0 ? "تم استلام الطلب" : `تم تحديث الحالة إلى ${timelineStatuses[t]}`,
          createdAt: new Date(orderDate.getTime() + t * 86400000),
        },
      });
    }

    orders.push(order);
    orderCount++;
  }
  console.log(`   ✅ ${orderCount} orders created with items and timeline`);
  } // end else (orders not yet created)

  // ═══════════════════════════════════════════════════════════
  // 9. INVENTORY TRANSACTIONS (purchases)
  // ═══════════════════════════════════════════════════════════
  console.log("📊 Creating additional inventory transactions...");

  let invTxCount = 0;
  const existingInvTx = await prisma.inventoryTransaction.count();
  if (existingInvTx <= 25) {
    for (let i = 0; i < 15; i++) {
      const product = randomItem(products);
      const qty = randomInt(10, 50);
      const oldQty = product.stockQuantity;
      const newQty = oldQty + qty;
      const txDate = daysAgo(randomInt(5, 60));

      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: InventoryTransactionType.PURCHASE,
          quantity: qty,
          oldQuantity: oldQty,
          newQuantity: newQty,
          reference: `PO-${String(2000 + i).padStart(4, "0")}`,
          notes: `شراء ${qty} قطعة من ${product.name}`,
          performedBy: admin.id,
          performedByName: admin.name,
          createdAt: txDate,
        },
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: newQty },
      });
      invTxCount++;
    }

    for (let i = 0; i < 5; i++) {
      const product = randomItem(products);
      const qty = randomInt(1, 5);
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: InventoryTransactionType.ADJUSTMENT,
          quantity: qty,
          oldQuantity: product.stockQuantity,
          newQuantity: product.stockQuantity + qty,
          notes: `تعديل جرد: ${product.name}`,
          performedBy: admin.id,
          performedByName: admin.name,
          createdAt: daysAgo(randomInt(1, 30)),
        },
      });
      invTxCount++;
    }
  }
  console.log(`   ✅ ${invTxCount} inventory transactions created`);

  // ═══════════════════════════════════════════════════════════
  // 10. EXPENSES
  // ═══════════════════════════════════════════════════════════
  console.log("💸 Creating expenses...");

  const expenseData = [
    { catIdx: 0, amount: 8500, desc: "إيجار المخزن الشهري - يونيو 2026", daysAgo: 5 },
    { catIdx: 0, amount: 8500, desc: "إيجار المخزن الشهري - مايو 2026", daysAgo: 35 },
    { catIdx: 0, amount: 8500, desc: "إيجار المخزن الشهري - أبريل 2026", daysAgo: 65 },
    { catIdx: 1, amount: 32000, desc: "رواتب الموظفين - يونيو 2026", daysAgo: 3 },
    { catIdx: 1, amount: 32000, desc: "رواتب الموظفين - مايو 2026", daysAgo: 33 },
    { catIdx: 2, amount: 4500, desc: "فواتير شحن وأرامكس - يونيو", daysAgo: 7 },
    { catIdx: 2, amount: 3800, desc: "فواتير شحن وأرامكس - مايو", daysAgo: 37 },
    { catIdx: 3, amount: 6000, desc: "إعلانات قوقل وأדוوردز", daysAgo: 10 },
    { catIdx: 3, amount: 4500, desc: "إعلانات سناب شات وإنستجرام", daysAgo: 20 },
    { catIdx: 3, amount: 3000, desc: "حملة ترويجية - عروض الصيف", daysAgo: 15 },
    { catIdx: 4, amount: 1200, desc: "فواتير كهرباء وماء - يونيو", daysAgo: 8 },
    { catIdx: 4, amount: 800, desc: "اشتراك إنترنت ومكتب", daysAgo: 12 },
    { catIdx: 5, amount: 2500, desc: "صيانة أجهزة المبيعات", daysAgo: 25 },
    { catIdx: 6, amount: 1800, desc: "كراتين تغليف ومواد شحن", daysAgo: 6 },
    { catIdx: 6, amount: 1200, desc: "مواد مكتبية وطابعة", daysAgo: 18 },
    { catIdx: 7, amount: 5000, desc: "تأمين المخزن السنوي", daysAgo: 45 },
    { catIdx: 8, amount: 3500, desc: "تجديد السجل التجاري", daysAgo: 30 },
    { catIdx: 9, amount: 2000, desc: "دورة تدريبية في إدارة المخزون", daysAgo: 40 },
    { catIdx: 11, amount: 850, desc: "عمولات معالجة المدفوعات", daysAgo: 14 },
    { catIdx: 11, amount: 420, desc: "رسوم تحويل بنكي", daysAgo: 22 },
  ];

  const existingExpenses = await prisma.expense.count();
  let expenseCount = 0;
  if (existingExpenses < expenseData.length) {
    await prisma.expense.deleteMany({});
    await prisma.expense.createMany({
      data: expenseData.map((e) => ({
        expenseCategoryId: expenseCategories[e.catIdx].id,
        amount: e.amount,
        description: e.desc,
        date: daysAgo(e.daysAgo),
      })),
    });
    expenseCount = expenseData.length;
  } else {
    expenseCount = existingExpenses;
  }
  console.log(`   ✅ ${expenseCount} expenses (recreated if incomplete)`);

  // ═══════════════════════════════════════════════════════════
  // 11. TRANSACTIONS (income & expense)
  // ═══════════════════════════════════════════════════════════
  console.log("💳 Creating transactions...");

  const existingTx = await prisma.transaction.count();
  let txCount = 0;
  if (existingTx === 0) {
    const txData: { type: TransactionType; amount: number; description: string; reference?: string; orderId?: string; createdAt: Date }[] = [];
    for (const order of orders) {
      if (order.paymentStatus === PaymentStatus.PAID) {
        txData.push({
          type: TransactionType.INCOME,
          amount: Number(order.total),
          description: `دفعة من الطلب ${order.orderNumber}`,
          reference: order.orderNumber,
          orderId: order.id,
          createdAt: order.createdAt,
        });
      }
    }
    for (const e of expenseData) {
      txData.push({
        type: TransactionType.EXPENSE,
        amount: e.amount,
        description: e.desc,
        createdAt: daysAgo(e.daysAgo),
      });
    }
    await prisma.transaction.createMany({ data: txData });
    txCount = txData.length;
  }
  console.log(`   ✅ ${txCount} transactions created (skipped if already exists)`);

  // ═══════════════════════════════════════════════════════════
  // 12. NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  console.log("🔔 Creating notifications...");

  const notifData = [
    { title: "طلب جديد", message: "تم استلام طلب جديد #ORD-10000 من أحمد العلي", type: "order" },
    { title: "تم التوصيل", message: "تم توصيل الطلب #ORD-10001 بنجاح", type: "order" },
    { title: "تنبيه مخزون منخفض", message: "المنتج 'كاميرا Canon EOS R6 Mark II' وصل للحد الأدنى", type: "inventory" },
    { title: "عميلة جديدة", message: "سارة الشمري قامت بإنشاء حساب جديد", type: "customer" },
    { title: "تم إلغاء طلب", message: "تم إلغاء الطلب #ORD-10004 بناءً على طلب العميل", type: "order" },
    { title: "دفعة مستلمة", message: "تم استلام دفعة بقيمة 5,499 ر.س من الطلب #ORD-10001", type: "payment" },
    { title: "تنبيه مخزون منخفض", message: "المنتج 'سماعات Bose QuietComfort' وصل للحد الأدنى", type: "inventory" },
    { title: "تقرير شهري", message: "تقرير شهر يونيو جاهز للعرض", type: "report" },
    { title: "تحديث النظام", message: "تم تحديث النظام إلى الإصدار الأخير بنجاح", type: "system" },
    { title: "عميل عائد", message: "العميل خالد الراشد قام بطلب جديد بعد 30 يوم", type: "customer" },
  ];

  const existingNotifs = await prisma.notification.count();
  let notifCount = 0;
  if (existingNotifs === 0) {
    await prisma.notification.createMany({
      data: notifData.map((n) => ({
        userId: admin.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Math.random() > 0.5,
        createdAt: daysAgo(randomInt(1, 30)),
      })),
    });
    notifCount = notifData.length;
  }
  console.log(`   ✅ ${notifCount} notifications created (skipped if already exists)`);

  // ═══════════════════════════════════════════════════════════
  // 13. AUDIT LOGS
  // ═══════════════════════════════════════════════════════════
  console.log("📋 Creating audit logs...");

  const auditActions = [
    { action: "CREATE", module: "products", entity: "Product", notes: "إضافة منتج جديد: سامسونج جالكسي S24 Ultra" },
    { action: "UPDATE", module: "products", entity: "Product", notes: "تحديث سعر المنتج: آيفون 15 برو ماكس" },
    { action: "CREATE", module: "orders", entity: "Order", notes: "إنشاء طلب جديد #ORD-10000" },
    { action: "UPDATE", module: "orders", entity: "Order", notes: "تحديث حالة الطلب #ORD-10001 إلى تم التوصيل" },
    { action: "DELETE", module: "products", entity: "Product", notes: "حذف منتج: سماعات قديمة" },
    { action: "UPDATE", module: "settings", entity: "StoreSetting", notes: "تحديث إعدادات المتجر" },
    { action: "CREATE", module: "categories", entity: "Category", notes: "إضافة فئة جديدة: الشبكات" },
    { action: "UPDATE", module: "inventory", entity: "InventoryTransaction", notes: "تسجيل شراء مخزون: 50 قطعة" },
    { action: "CREATE", module: "expenses", entity: "Expense", notes: "تسجيل مصروف: إيجار المخزن" },
    { action: "LOGIN", module: "auth", entity: "User", notes: "تسجيل دخول ناجح: عبدالله المدير" },
    { action: "UPDATE", module: "orders", entity: "Order", notes: "إلغاء الطلب #ORD-10004" },
    { action: "CREATE", module: "customers", entity: "User", notes: "إنشاء حساب عميل: فاطمة السالم" },
    { action: "UPDATE", module: "products", entity: "Product", notes: "تحديث مخزون: زيادة 30 قطعة" },
    { action: "READ", module: "reports", entity: "Report", notes: "عرض تقرير المبيعات الشهري" },
    { action: "UPDATE", module: "settings", entity: "StoreSetting", notes: "تحديث نسبة الضريبة إلى 15%" },
  ];

  const existingAudit = await prisma.auditLog.count();
  let auditCount = 0;
  if (existingAudit === 0) {
    await prisma.auditLog.createMany({
      data: auditActions.map((a) => ({
        action: a.action,
        module: a.module,
        entity: a.entity,
        entityId: randomItem([...products, ...orders]).id,
        userId: admin.id,
        userName: admin.name,
        ipAddress: "192.168.1.100",
        notes: a.notes,
        createdAt: daysAgo(randomInt(1, 45)),
      })),
    });
    auditCount = auditActions.length;
  }
  console.log(`   ✅ ${auditCount} audit logs created (skipped if already exists)`);

  // ═══════════════════════════════════════════════════════════
  // 14. STORE SETTINGS
  // ═══════════════════════════════════════════════════════════
  console.log("⚙️  Creating store settings...");

  const settingsData: [string, string, string][] = [
    ["name", "المتجر الإلكتروني", "general"],
    ["nameEn", "The E-Commerce Store", "general"],
    ["subtitle", "وجهتك الأولى للتسوق الرقمي الفاخر", "general"],
    ["description", "متجر إلكتروني متكامل يضم أرقى المنتجات مع ضمان الجودة والتوصيل السريع لجميع المناطق.", "general"],
    ["slogan", "تسوق بكل ثقة وسهولة", "general"],
    ["about", "متجرنا يوفر لك أفضل تجربة تسوق إلكتروني مع خدمة عملاء على مدار الساعة وخيارات دفع متعددة وأمنة.", "general"],
    ["logoUrl", "", "branding"],
    ["darkLogoUrl", "", "branding"],
    ["footerLogoUrl", "", "branding"],
    ["faviconUrl", "/favicon.ico", "branding"],
    ["phone", "+966 50 123 4567", "contact"],
    ["whatsapp", "+966 50 123 4567", "contact"],
    ["email", "info@store.com", "contact"],
    ["secondaryEmail", "support@store.com", "contact"],
    ["address", "حي العليا، طريق الملك فهد، الرياض 12241، المملكة العربية السعودية", "contact"],
    ["googleMapsUrl", "", "contact"],
    ["businessHours", "الأحد - الخميس: 9:00 ص - 10:00 م | الجمعة - السبت: 4:00 م - 11:00 م", "contact"],
    ["facebook", "https://facebook.com/store", "social"],
    ["instagram", "https://instagram.com/store", "social"],
    ["twitter", "https://twitter.com/store", "social"],
    ["tiktok", "", "social"],
    ["youtube", "", "social"],
    ["linkedin", "", "social"],
    ["telegram", "", "social"],
    ["snapchat", "", "social"],
    ["currency", "SAR", "business"],
    ["currencySymbol", "ر.س", "business"],
    ["currencyPosition", "right", "business"],
    ["taxPercentage", "15", "business"],
    ["taxNumber", "310000000000003", "business"],
    ["commercialRegister", "1010234567", "business"],
    ["defaultLanguage", "ar", "business"],
    ["timezone", "Asia/Riyadh", "business"],
    ["dateFormat", "YYYY-MM-DD", "business"],
    ["timeFormat", "12h", "business"],
    ["footerText", "جميع الحقوق محفوظة للمتجر الإلكتروني 2026. نمتلك أفضل التشكيلات بضمان الجودة.", "legal"],
    ["copyright", "© 2026 المتجر الإلكتروني - جميع الحقوق محفوظة", "legal"],
    ["invoiceInformation", "الرقم الضريبي: 310000000000003 | السجل التجاري: 1010234567 | شركة التجارة الإلكترونية المحدودة", "legal"],
    ["receiptInformation", "شكراً لتسوقكم معنا! في حال وجود استفسار يرجى التواصل مع الدعم الفني على الرقم 0501234567.", "legal"],
    ["companyInformation", "شركة التجارة الإلكترونية المحدودة - الرياض، المملكة العربية السعودية | س.ت: 1010234567", "legal"],
    ["metaTitle", "المتجر الإلكتروني - أفضل العروض والمنتجات الفاخرة", "seo"],
    ["metaDescription", "تسوّق من المتجر الإلكتروني - تشكيلة واسعة من الإلكترونيات والهواتف بأفضل الأسعار مع شحن سريع لجميع مدن المملكة.", "seo"],
    ["keywords", "تسوق, متجر إلكتروني, هواتف, لابتوب, إلكترونيات, عروض, السعودية", "seo"],
    ["ogImageUrl", "", "seo"],
    ["primaryColor", "#2563eb", "theme"],
    ["secondaryColor", "#475569", "theme"],
    ["accentColor", "#f59e0b", "theme"],
    ["borderRadius", "0.75rem", "theme"],
    ["defaultTheme", "system", "theme"],
  ];

  for (const [key, value, group] of settingsData) {
    await prisma.storeSetting.upsert({
      where: { key },
      update: { value, group },
      create: { key, value, group },
    });
  }
  console.log(`   ✅ ${settingsData.length} store settings created`);

  // ═══════════════════════════════════════════════════════════
  // 15. SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(50));
  console.log("🎉 ENTERPRISE DATA GENERATION COMPLETE!");
  console.log("═".repeat(50));

  const counts = {
    users: await prisma.user.count(),
    addresses: await prisma.address.count(),
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    productImages: await prisma.productImage.count(),
    productVariants: await prisma.productVariant.count(),
    productCategories: await prisma.productCategory.count(),
    media: await prisma.media.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    orderTimelines: await prisma.orderTimeline.count(),
    inventoryTransactions: await prisma.inventoryTransaction.count(),
    expenseCategories: await prisma.expenseCategory.count(),
    expenses: await prisma.expense.count(),
    transactions: await prisma.transaction.count(),
    notifications: await prisma.notification.count(),
    auditLogs: await prisma.auditLog.count(),
    storeSettings: await prisma.storeSetting.count(),
  };

  console.log("\n📊 Record counts:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`   ${table}: ${count}`);
  }

  console.log("\n✅ All data generated successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
