import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Locally generated on-brand placeholder art (scripts/generate-placeholder-art.mjs)
// — avoids depending on hotlinked third-party stock photography.
const img = (_id: string) => `/images/misc/hero.svg`
const productImg = (slug: string) => `/images/products/${slug}.svg`
const restaurantImg = (slug: string) => `/images/restaurants/${slug}.svg`

async function main() {
  console.log('🔥 Seeding Texas Grill demo data...')

  // ---- Roles & permissions (RBAC reference tables) -----------------------
  const roleDefs = [
    ['SUPER_ADMIN', 'Super administrateur'],
    ['ADMIN', 'Administrateur'],
    ['RESTAURANT_MANAGER', 'Manager de restaurant'],
    ['KITCHEN_MANAGER', 'Chef de cuisine'],
    ['CASHIER', 'Caissier'],
    ['DELIVERY_MANAGER', 'Responsable livraisons'],
    ['MARKETING_MANAGER', 'Responsable marketing'],
    ['CONTENT_MANAGER', 'Responsable contenu'],
    ['CUSTOMER', 'Client'],
  ] as const
  for (const [key, label] of roleDefs) {
    await prisma.role.upsert({ where: { key }, update: {}, create: { key, label } })
  }
  const permissionDefs = [
    'dashboard:view', 'orders:manage', 'restaurants:manage', 'products:manage', 'stock:manage',
    'customers:manage', 'deliveries:manage', 'reservations:manage', 'promotions:manage',
    'content:manage', 'analytics:view', 'roles:manage', 'reviews:manage', 'events:manage', 'corporate:manage',
  ]
  for (const key of permissionDefs) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key, label: key } })
  }

  // ---- Restaurants (demo data — clearly identified, editable via admin) --
  const restaurantDefs = [
    { slug: 'riviera', name: 'Texas Grill Riviera', address: 'Boulevard Latrille, Riviera 3, Abidjan', lat: 5.3644, lng: -3.9756, heroImage: restaurantImg('riviera') },
    { slug: 'zone-4', name: 'Texas Grill Zone 4', address: 'Rue du Canal 4, Zone 4, Abidjan', lat: 5.2894, lng: -3.9967, heroImage: restaurantImg('zone-4') },
    { slug: 'yopougon', name: 'Texas Grill Yopougon', address: 'Route de Dabou, Yopougon, Abidjan', lat: 5.3453, lng: -4.0864, heroImage: restaurantImg('yopougon') },
    { slug: 'deux-plateaux', name: 'Texas Grill Deux-Plateaux', address: 'Rue des Jardins, Deux-Plateaux, Abidjan', lat: 5.3689, lng: -3.9989, heroImage: restaurantImg('deux-plateaux') },
    { slug: 'cocody', name: 'Texas Grill Cocody', address: 'Boulevard de France, Cocody, Abidjan', lat: 5.3597, lng: -3.9764, heroImage: restaurantImg('cocody') },
  ]

  const restaurants = []
  for (const r of restaurantDefs) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        slug: r.slug,
        name: r.name,
        description: `${r.name} — grillades au feu de bois, ambiance urbaine et service rapide.`,
        phone: '+225 07 00 00 00 00',
        email: `${r.slug}@texasgrill.ci`,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        status: 'OPEN',
        servicesJson: JSON.stringify(['DINE_IN', 'DELIVERY', 'PICKUP', 'CATERING']),
        deliveryZoneJson: JSON.stringify([r.name.split(' ').pop()]),
        heroImage: r.heroImage,
        galleryJson: JSON.stringify([r.heroImage, '/images/misc/hero.svg']),
        isDemo: true,
      },
    })
    restaurants.push(restaurant)

    for (let day = 0; day < 7; day++) {
      await prisma.restaurantHours.upsert({
        where: { restaurantId_dayOfWeek: { restaurantId: restaurant.id, dayOfWeek: day } },
        update: {},
        create: { restaurantId: restaurant.id, dayOfWeek: day, openTime: '11:00', closeTime: day === 5 || day === 6 ? '23:30' : '22:30', isClosed: false },
      })
    }

    for (let n = 1; n <= 8; n++) {
      await prisma.table.upsert({
        where: { restaurantId_number: { restaurantId: restaurant.id, number: n } },
        update: {},
        create: { restaurantId: restaurant.id, number: n, capacity: n % 3 === 0 ? 6 : 4 },
      })
    }

    await prisma.inventoryItem.upsert({
      where: { id: `${restaurant.id}-boeuf` },
      update: {},
      create: { id: `${restaurant.id}-boeuf`, name: 'Bœuf (poitrine)', unit: 'KG', quantity: 42, threshold: 15, restaurantId: restaurant.id },
    })
    await prisma.inventoryItem.upsert({
      where: { id: `${restaurant.id}-poulet` },
      update: {},
      create: { id: `${restaurant.id}-poulet`, name: 'Poulet fermier', unit: 'KG', quantity: 8, threshold: 10, restaurantId: restaurant.id },
    })
  }

  // ---- Menu categories -----------------------------------------------------
  const categoryDefs = [
    ['burgers', 'Burgers'], ['grillades', 'Grillades'], ['steaks', 'Steaks'], ['ribs-bbq', 'Ribs & BBQ'],
    ['poulet', 'Poulet'], ['brochettes', 'Brochettes'], ['seafood', 'Seafood'],
    ['accompagnements', 'Accompagnements'], ['boissons', 'Boissons'], ['menus', 'Menus'], ['family-deals', 'Family Deals'],
  ] as const
  const categories: Record<string, Awaited<ReturnType<typeof prisma.menuCategory.upsert>>> = {}
  for (let i = 0; i < categoryDefs.length; i++) {
    const [slug, name] = categoryDefs[i]
    categories[slug] = await prisma.menuCategory.upsert({
      where: { slug },
      update: {},
      create: { slug, name, sortOrder: i, isActive: true },
    })
  }

  // ---- Products --------------------------------------------------------
  const productDefs = [
    { slug: 'texas-trio-burger', name: 'The Texas Trio', cat: 'burgers', price: 6500, desc: 'Double steak haché, cheddar fumé, bacon croustillant et sauce BBQ maison.', img: productImg('texas-trio-burger'), featured: true, badge: 'Le préféré' },
    { slug: 'firehouse-burger', name: 'Firehouse Burger', cat: 'burgers', price: 5900, desc: 'Steak haché épicé, jalapeños grillés, sauce piquante et oignons frits.', img: productImg('firehouse-burger'), isNew: true },
    { slug: 'classic-cheeseburger', name: 'Classic Cheeseburger', cat: 'burgers', price: 4900, desc: 'Steak haché juteux, cheddar fondant, salade, tomate, sauce burger maison.', img: productImg('classic-cheeseburger') },
    { slug: 'poitrine-fumee', name: 'Poitrine de Bœuf Fumée', cat: 'grillades', price: 8900, desc: 'Poitrine fumée 12h au bois de chêne, servie tranchée avec sa sauce.', img: productImg('poitrine-fumee'), featured: true, badge: 'Fumé chaque jour' },
    { slug: 'mix-grill-texas', name: 'Mix Grill Texas', cat: 'grillades', price: 12900, desc: 'Sélection de viandes grillées : bœuf, poulet, saucisse épicée.', img: productImg('mix-grill-texas'), featured: true },
    { slug: 'ribeye-steak', name: 'Ribeye Steak 300g', cat: 'steaks', price: 11500, desc: 'Pièce persillée grillée au feu de bois, cuisson au choix.', img: productImg('ribeye-steak'), featured: true },
    { slug: 't-bone-steak', name: 'T-Bone Steak', cat: 'steaks', price: 13900, desc: "Le classique du grill américain, servi avec beurre à l'ail.", img: productImg('t-bone-steak') },
    { slug: 'pitmaster-ribs', name: 'Pitmaster Ribs', cat: 'ribs-bbq', price: 9500, desc: 'Travers de porc fumés lentement, épices texanes légèrement relevées.', img: productImg('pitmaster-ribs'), badge: 'Fumé chaque jour' },
    { slug: 'baby-back-ribs', name: 'Baby Back Ribs (demi)', cat: 'ribs-bbq', price: 7900, desc: 'Ribs tendres glacées à la sauce BBQ maison.', img: productImg('baby-back-ribs') },
    { slug: 'firehouse-half-chicken', name: 'Firehouse Half Chicken', cat: 'poulet', price: 5900, desc: 'Mariné aux agrumes, rôti à la flamme, nappé de sauce maison.', img: productImg('firehouse-half-chicken'), isNew: true },
    { slug: 'poulet-braise', name: 'Poulet Braisé Épicé', cat: 'poulet', price: 5500, desc: "Poulet braisé à l'ivoirienne, épices douces, servi avec alloco.", img: productImg('poulet-braise') },
    { slug: 'brochettes-boeuf', name: 'Brochettes de Bœuf', cat: 'brochettes', price: 4500, desc: 'Trois brochettes marinées, grillées minute.', img: productImg('brochettes-boeuf') },
    { slug: 'brochettes-mixtes', name: 'Brochettes Mixtes', cat: 'brochettes', price: 5200, desc: 'Bœuf, poulet et poivrons grillés au feu vif.', img: productImg('brochettes-mixtes') },
    { slug: 'crevettes-grillees', name: 'Crevettes Grillées Piri-Piri', cat: 'seafood', price: 7500, desc: 'Crevettes marinées au piri-piri, grillées et citronnées.', img: productImg('crevettes-grillees') },
    { slug: 'charred-street-corn', name: 'Charred Street Corn', cat: 'accompagnements', price: 2200, desc: 'Maïs grillé, cotija, crème citron vert et piment.', img: productImg('charred-street-corn') },
    { slug: 'frites-maison', name: 'Frites Maison', cat: 'accompagnements', price: 1800, desc: 'Frites croustillantes, sel de mer.', img: productImg('frites-maison') },
    { slug: 'alloco', name: 'Alloco', cat: 'accompagnements', price: 1800, desc: 'Bananes plantains frites, épices douces.', img: productImg('alloco') },
    { slug: 'attieke', name: 'Attiéké', cat: 'accompagnements', price: 1500, desc: 'Semoule de manioc fermentée, accompagnement traditionnel.', img: productImg('attieke') },
    { slug: 'jus-bissap', name: 'Jus de Bissap', cat: 'boissons', price: 1500, desc: 'Boisson rafraîchissante à base de fleurs d’hibiscus.', img: productImg('jus-bissap') },
    { slug: 'jus-gingembre', name: 'Jus de Gingembre', cat: 'boissons', price: 1500, desc: 'Jus de gingembre frais, légèrement épicé.', img: productImg('jus-gingembre') },
    { slug: 'soda', name: 'Soda 33cl', cat: 'boissons', price: 1000, desc: 'Coca-Cola, Fanta ou Sprite.', img: productImg('soda') },
    { slug: 'menu-solo-grill', name: 'Menu Solo Grill', cat: 'menus', price: 7900, desc: 'Une pièce grillée au choix + accompagnement + boisson.', img: productImg('menu-solo-grill') },
    { slug: 'family-deal-4', name: 'Family Deal (4 pers.)', cat: 'family-deals', price: 24900, desc: 'Mix grill géant, 4 accompagnements, 4 boissons — parfait pour la famille.', img: productImg('family-deal-4'), featured: true, badge: 'Family Deals' },
    { slug: 'family-deal-6', name: 'Family Deal (6 pers.)', cat: 'family-deals', price: 34900, desc: 'Grand mix grill, ribs, poulet, 6 accompagnements, 6 boissons.', img: productImg('family-deal-6') },
  ]

  const products: Record<string, Awaited<ReturnType<typeof prisma.product.upsert>>> = {}
  let sortOrder = 0
  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.desc,
        price: p.price,
        categoryId: categories[p.cat].id,
        imagesJson: JSON.stringify([p.img]),
        ingredientsJson: JSON.stringify(['Voir description', 'Sauce maison', 'Epices Texas Grill']),
        allergensJson: JSON.stringify(p.cat === 'seafood' ? ['Crustacés'] : p.cat === 'burgers' ? ['Gluten', 'Lait'] : []),
        isAvailable: true,
        isFeatured: Boolean(p.featured),
        isNew: Boolean(p.isNew),
        badge: p.badge,
        prepTimeMinutes: 15,
        sortOrder: sortOrder++,
      },
    })
    products[p.slug] = product

    if (['grillades', 'steaks', 'ribs-bbq', 'poulet', 'brochettes'].includes(p.cat)) {
      const cuisson = await prisma.productOption.create({
        data: { productId: product.id, name: 'Cuisson', type: 'SINGLE', isRequired: true, sortOrder: 0 },
      })
      for (const [i, label] of ['À point', 'Bien cuit', 'Saignant'].entries()) {
        await prisma.productOptionValue.create({ data: { optionId: cuisson.id, label, priceDelta: 0, sortOrder: i } })
      }
      const sauce = await prisma.productOption.create({
        data: { productId: product.id, name: 'Sauce', type: 'SINGLE', isRequired: false, sortOrder: 1 },
      })
      for (const [i, label] of ['BBQ maison', 'Piquante', 'Poivre', 'Sans sauce'].entries()) {
        await prisma.productOptionValue.create({ data: { optionId: sauce.id, label, priceDelta: 0, sortOrder: i } })
      }
      await prisma.productAddon.createMany({
        data: [
          { productId: product.id, name: 'Supplément frites', price: 1500, sortOrder: 0 },
          { productId: product.id, name: 'Supplément alloco', price: 1500, sortOrder: 1 },
          { productId: product.id, name: 'Extra sauce', price: 500, sortOrder: 2 },
        ],
      })
    }
    if (p.cat === 'burgers') {
      const extras = await prisma.productOption.create({
        data: { productId: product.id, name: 'Extras', type: 'MULTI', isRequired: false, sortOrder: 0 },
      })
      for (const [i, label, delta] of [
        ['bacon', 'Bacon supplémentaire', 800],
        ['cheddar', 'Cheddar supplémentaire', 500],
        ['oeuf', 'Œuf au plat', 700],
      ].map((v, idx) => [idx, v[1], Number(v[2])] as const)) {
        await prisma.productOptionValue.create({ data: { optionId: extras.id, label: label as string, priceDelta: delta as number, sortOrder: i as number } })
      }
    }
  }

  // ---- Rewards & coupons -------------------------------------------------
  await prisma.reward.createMany({
    data: [
      { name: 'Boisson offerte', description: 'Une boisson 33cl offerte', pointsCost: 300, type: 'FREE_ITEM', productId: products['soda'].id },
      { name: 'Accompagnement offert', description: 'Un accompagnement au choix offert', pointsCost: 500, type: 'FREE_ITEM', productId: products['frites-maison'].id },
      { name: '-10% sur votre commande', description: 'Réduction de 10% sur la commande', pointsCost: 1200, type: 'DISCOUNT_PERCENT', value: 10 },
      { name: '2000 FCFA de réduction', description: 'Réduction fixe de 2000 FCFA', pointsCost: 2000, type: 'DISCOUNT_FIXED', value: 2000 },
    ],
  })

  await prisma.coupon.upsert({
    where: { code: 'BIENVENUE10' },
    update: {},
    create: { code: 'BIENVENUE10', type: 'PERCENT', value: 10, minOrderAmount: 5000, maxUses: 1000, perUserLimit: 1, isActive: true },
  })
  await prisma.coupon.upsert({
    where: { code: 'LIVRAISONOFFERTE' },
    update: {},
    create: { code: 'LIVRAISONOFFERTE', type: 'FREE_DELIVERY', value: 0, minOrderAmount: 8000, perUserLimit: 3, isActive: true },
  })

  await prisma.promotion.createMany({
    data: [
      { title: 'Happy Hour 17h-19h : -20% sur les brochettes', type: 'HAPPY_HOUR', rulesJson: JSON.stringify({ if: { hourBetween: ['17:00', '19:00'] }, then: { discountPercent: 20, category: 'brochettes' } }), isActive: true },
      { title: 'Grill Master : -10% à vie', type: 'LOYALTY', rulesJson: JSON.stringify({ if: { tier: 'GRILL_MASTER' }, then: { discountPercent: 10 } }), isActive: true },
      { title: 'Menu Family Deal à -3000 FCFA ce week-end', type: 'FIXED', rulesJson: JSON.stringify({ if: { product: 'family-deal-4', dayIn: ['Saturday', 'Sunday'] }, then: { discountFixed: 3000 } }), isActive: true },
    ],
  })

  // ---- Demo users ---------------------------------------------------------
  const adminPassword = await bcrypt.hash('TexasAdmin#2026', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@texasgrill.demo' },
    update: {},
    create: { name: 'Admin Texas Grill', email: 'admin@texasgrill.demo', passwordHash: adminPassword, role: 'SUPER_ADMIN', phone: '+225 07 00 00 00 01' },
  })

  const managerPassword = await bcrypt.hash('Manager#2026', 10)
  await prisma.user.upsert({
    where: { email: 'manager@texasgrill.demo' },
    update: {},
    create: { name: 'Manager Riviera', email: 'manager@texasgrill.demo', passwordHash: managerPassword, role: 'RESTAURANT_MANAGER', phone: '+225 07 00 00 00 02' },
  })

  const customerPassword = await bcrypt.hash('Customer#2026', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'client@texasgrill.demo' },
    update: {},
    create: { name: 'Awa Koffi', email: 'client@texasgrill.demo', passwordHash: customerPassword, role: 'CUSTOMER', phone: '+225 07 00 00 00 03' },
  })

  await prisma.loyaltyAccount.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id, points: 1240, totalEarned: 1240, tier: 'GRILL_LOVER', referralCode: 'TG-AWA24' },
  })
  await prisma.address.upsert({
    where: { id: `${customer.id}-home` },
    update: {},
    create: { id: `${customer.id}-home`, userId: customer.id, label: 'Maison', line1: 'Rue J112, Riviera 2', commune: 'Riviera', city: 'Abidjan', lat: 5.362, lng: -3.972, isDefault: true },
  })

  // ---- Reviews --------------------------------------------------------
  await prisma.review.createMany({
    data: [
      { userId: customer.id, productId: products['texas-trio-burger'].id, foodRating: 5, serviceRating: 5, ambianceRating: 4, overallRating: 5, comment: 'Le meilleur burger d’Abidjan, sans hésiter !', status: 'PUBLISHED' },
      { userId: customer.id, productId: products['poitrine-fumee'].id, foodRating: 5, serviceRating: 4, overallRating: 5, comment: 'Fumée à la perfection, ambiance top.', status: 'PUBLISHED' },
    ],
  })

  // ---- Stories & videos ----------------------------------------------
  await prisma.story.createMany({
    data: [
      { title: 'Le fumoir en action', type: 'PHOTO', mediaUrl: '/images/misc/story-1.svg', isActive: true, sortOrder: 0 },
      { title: 'Soirée grill à Riviera', type: 'PHOTO', mediaUrl: '/images/misc/story-2.svg', isActive: true, sortOrder: 1 },
      { title: 'Nouvelle sauce piri-piri 🔥', type: 'NEWS', mediaUrl: '/images/misc/story-3.svg', isActive: true, sortOrder: 2 },
    ],
  })
  await prisma.video.createMany({
    data: [
      { title: 'Behind The Grill : nos pitmasters', slug: 'behind-the-grill-pitmasters', category: 'BEHIND_THE_GRILL', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/misc/video-1.svg', isPublished: true, publishedAt: new Date() },
      { title: 'Recette : notre sauce BBQ maison', slug: 'recette-sauce-bbq-maison', category: 'RECIPES', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/images/misc/video-2.svg', isPublished: true, publishedAt: new Date() },
    ],
  })

  // ---- Extra demo customers (for CRM / analytics) -----------------------
  const extraCustomers = [
    ['Kouassi Yao', 'kouassi.yao@texasgrill.demo'],
    ['Fatou Diabaté', 'fatou.diabate@texasgrill.demo'],
    ['Ibrahim Traoré', 'ibrahim.traore@texasgrill.demo'],
  ]
  const demoCustomerPassword = await bcrypt.hash('Customer#2026', 10)
  const otherCustomers = []
  for (const [name, email] of extraCustomers) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash: demoCustomerPassword, role: 'CUSTOMER' },
    })
    otherCustomers.push(u)
    await prisma.loyaltyAccount.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, points: Math.floor(Math.random() * 3000), totalEarned: Math.floor(Math.random() * 5000), tier: 'STARTER', referralCode: `TG-${Math.random().toString(36).slice(2, 8).toUpperCase()}` },
    })
  }

  // ---- Driver -------------------------------------------------------------
  const driver = await prisma.driver.upsert({
    where: { id: 'demo-driver-1' },
    update: {},
    create: { id: 'demo-driver-1', name: 'Yao Martial', phone: '+225 07 11 22 33 44', vehicle: 'Moto', status: 'AVAILABLE', restaurantId: restaurants[0].id },
  })

  // ---- Demo orders (various statuses/types, for admin + account pages) --
  const orderSeeds = [
    { customer, restaurant: restaurants[0], type: 'DELIVERY', status: 'DELIVERED', items: ['texas-trio-burger', 'frites-maison'] },
    { customer, restaurant: restaurants[0], type: 'PICKUP', status: 'READY', items: ['poitrine-fumee', 'jus-bissap'] },
    { customer, restaurant: restaurants[1], type: 'DINE_IN', status: 'COOKING', items: ['ribeye-steak', 'alloco'] },
    { customer: otherCustomers[0], restaurant: restaurants[0], type: 'DELIVERY', status: 'OUT_FOR_DELIVERY', items: ['mix-grill-texas', 'soda'] },
    { customer: otherCustomers[1], restaurant: restaurants[2], type: 'DELIVERY', status: 'COMPLETED', items: ['family-deal-4'] },
    { customer: otherCustomers[2], restaurant: restaurants[0], type: 'PICKUP', status: 'CANCELLED', items: ['firehouse-burger'] },
  ] as const

  for (const [i, seed] of orderSeeds.entries()) {
    const orderItems = seed.items.map((slug) => {
      const p = products[slug]
      return { productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price, subtotal: p.price }
    })
    const subtotal = orderItems.reduce((sum, it) => sum + it.subtotal, 0)
    const deliveryFee = seed.type === 'DELIVERY' ? 1000 : 0
    const total = subtotal + deliveryFee

    const order = await prisma.order.create({
      data: {
        orderNumber: `TG-DEMO-${String(i + 1).padStart(4, '0')}`,
        userId: seed.customer.id,
        restaurantId: seed.restaurant.id,
        type: seed.type,
        status: seed.status,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        contactName: seed.customer.name,
        contactPhone: '+225 07 00 00 00 00',
        contactEmail: seed.customer.email,
        items: { create: orderItems },
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'MOCK',
        method: 'MOBILE_MONEY',
        status: seed.status === 'CANCELLED' ? 'REFUNDED' : 'PAID',
        amount: total,
        transactionRef: `MOCK-DEMO-${i + 1}`,
      },
    })

    if (seed.type === 'DELIVERY') {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          driverId: ['OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(seed.status) ? driver.id : undefined,
          status: seed.status === 'DELIVERED' || seed.status === 'COMPLETED' ? 'DELIVERED' : seed.status === 'OUT_FOR_DELIVERY' ? 'EN_ROUTE' : 'PENDING',
          distanceKm: 4.2,
          estimatedMinutes: 32,
        },
      })
    }
  }

  // ---- Demo reservations ---------------------------------------------
  const reservationSeeds = [
    { restaurant: restaurants[0], status: 'CONFIRMED', partySize: 4, daysFromNow: 2 },
    { restaurant: restaurants[1], status: 'PENDING', partySize: 2, daysFromNow: 5 },
    { restaurant: restaurants[2], status: 'COMPLETED', partySize: 6, daysFromNow: -7 },
  ] as const
  for (const [i, r] of reservationSeeds.entries()) {
    const date = new Date()
    date.setDate(date.getDate() + r.daysFromNow)
    await prisma.reservation.create({
      data: {
        code: `RES-DEMO${i + 1}`,
        userId: customer.id,
        restaurantId: r.restaurant.id,
        date,
        time: '19:30',
        partySize: r.partySize,
        name: customer.name,
        phone: '+225 07 00 00 00 03',
        email: customer.email,
        status: r.status,
      },
    })
  }

  // ---- Demo event & corporate requests --------------------------------
  await prisma.event.create({
    data: {
      type: 'BIRTHDAY',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      guestCount: 25,
      budget: 150000,
      restaurantId: restaurants[0].id,
      message: 'Anniversaire surprise, besoin d’un espace privatisé.',
      name: 'Aïcha Bamba',
      phone: '+225 07 22 33 44 55',
      email: 'aicha.bamba@example.com',
      status: 'NEW',
    },
  })
  await prisma.corporateRequest.create({
    data: {
      companyName: 'Ivoire Digital SARL',
      contactName: 'Marc Assouan',
      phone: '+225 07 55 66 77 88',
      email: 'marc.assouan@ivoiredigital.example',
      employeeCount: 40,
      deliveryFrequency: 'Hebdomadaire',
      budget: 400000,
      message: 'Nous cherchons un partenaire traiteur pour nos déjeuners d’équipe.',
      status: 'NEW',
    },
  })

  console.log('✅ Seed complete.')
  console.log('   Admin demo login:  admin@texasgrill.demo / TexasAdmin#2026')
  console.log('   Manager demo login: manager@texasgrill.demo / Manager#2026')
  console.log('   Customer demo login: client@texasgrill.demo / Customer#2026')
  void admin
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
