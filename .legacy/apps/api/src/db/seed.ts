import argon2 from 'argon2';
import { Role, ProductStatus, InventoryStatus, DurationUnit, FulfillmentType, RentalStatus, DepositStatus, PaymentStatus } from '@prisma/client';
import prisma from './client';

async function seed() {
  console.log('🌱 Starting RentIt Database Seed...');

  // 1. Clear existing data
  await prisma.auditEvent.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.damage.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.return.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.securityDeposit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database cleaned.');

  // 2. Create Users
  const adminPasswordHash = await argon2.hash('admin123456');
  const customerPasswordHash = await argon2.hash('customer123456');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@rentit.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@rentit.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      customer: {
        create: {
          name: 'Priyanshu Sharma',
          phone: '+91 98765 43210',
          addresses: {
            create: {
              label: 'Main Office',
              line1: '42 Tech Park, MG Road',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              isDefault: true,
            },
          },
          cart: {
            create: {},
          },
        },
      },
    },
    include: { customer: true },
  });

  console.log('👤 Created Users: admin@rentit.com & customer@rentit.com');

  // 3. Create Product Categories
  const catElectronics = await prisma.productCategory.create({
    data: {
      name: 'Electronics & Audio Visual',
      slug: 'electronics-av',
      description: 'Professional cameras, lenses, audio systems, and stage lighting',
    },
  });

  const catTools = await prisma.productCategory.create({
    data: {
      name: 'Industrial Tools & Machinery',
      slug: 'tools-machinery',
      description: 'Generators, drills, concrete mixers, and construction equipment',
    },
  });

  const catEvents = await prisma.productCategory.create({
    data: {
      name: 'Event & Party Supplies',
      slug: 'event-supplies',
      description: 'Canopies, stage setups, sound systems, and catering gear',
    },
  });

  console.log('📦 Created Product Categories');

  // 4. Create Products with Price Rules & Inventory Units
  const productsData = [
    {
      categoryId: catElectronics.id,
      name: 'Canon EOS R5 Mirrorless Camera',
      slug: 'canon-eos-r5',
      shortDesc: '45MP Full-Frame sensor, 8K RAW Video recording',
      description: 'High-performance camera ideal for studio, event, and cinema productions.',
      depositAmountPaise: 500000, // ₹5,000 deposit
      imageUrls: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      ],
      dayRatePaise: 150000, // ₹1,500 / day
      inventoryCount: 4,
    },
    {
      categoryId: catElectronics.id,
      name: 'Sony FE 24-70mm f/2.8 GM II Lens',
      slug: 'sony-24-70-gm2',
      shortDesc: 'Versatile standard zoom lens for Sony E-mount',
      description: 'Premium G Master lens delivering extreme sharpness and soft bokeh.',
      depositAmountPaise: 250000, // ₹2,500 deposit
      imageUrls: [
        'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
      ],
      dayRatePaise: 80000, // ₹800 / day
      inventoryCount: 5,
    },
    {
      categoryId: catTools.id,
      name: 'Silent Heavy Duty Generator 5KVA',
      slug: 'generator-5kva',
      shortDesc: 'Diesel 5000W generator with electric key start',
      description: 'Reliable backup power source for outdoor events, construction, and emergency power.',
      depositAmountPaise: 400000, // ₹4,000 deposit
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      dayRatePaise: 120000, // ₹1,200 / day
      inventoryCount: 3,
    },
    {
      categoryId: catEvents.id,
      name: 'JBL PRX825W 15" Powered Loudspeaker Set',
      slug: 'jbl-prx825w-set',
      shortDesc: 'Dual 15" 1500W Powered Sound System with Wi-Fi control',
      description: 'Full-range sound reinforcement speaker pair for concerts and events up to 500 people.',
      depositAmountPaise: 600000, // ₹6,000 deposit
      imageUrls: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      ],
      dayRatePaise: 250000, // ₹2,500 / day
      inventoryCount: 2,
    },
    {
      categoryId: catTools.id,
      name: 'Bosch Professional Rotary Hammer Drill',
      slug: 'bosch-rotary-hammer',
      shortDesc: '800W SDS-plus heavy duty impact hammer drill',
      description: 'Engineered for tough concrete drilling and light chiseling work.',
      depositAmountPaise: 100000, // ₹1,000 deposit
      imageUrls: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      ],
      dayRatePaise: 40000, // ₹400 / day
      inventoryCount: 6,
    },
  ];

  // 3.5 Create Default Pricelist
  const defaultPricelist = await prisma.pricelist.create({
    data: {
      name: 'Standard Rental Rates',
      isDefault: true,
      currency: 'INR',
    },
  });

  console.log('🏷️ Created Default Pricelist');

  const createdProducts = [];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        description: p.description,
        status: ProductStatus.ACTIVE,
        depositAmountPaise: p.depositAmountPaise,
        imageUrls: p.imageUrls,
        priceRules: {
          create: [
            {
              pricelistId: defaultPricelist.id,
              durationUnit: DurationUnit.DAY,
              durationValue: 1,
              ratePaise: p.dayRatePaise,
            },
          ],
        },
      },
    });

    // Create physical inventory units
    for (let i = 1; i <= p.inventoryCount; i++) {
      await prisma.inventoryItem.create({
        data: {
          productId: product.id,
          serialNumber: `${p.slug.toUpperCase().slice(0, 4)}-${100 + i}`,
          status: InventoryStatus.AVAILABLE,
          condition: 'Excellent',
        },
      });
    }

    createdProducts.push(product);
  }

  console.log(`🛍️ Created ${createdProducts.length} Products with Physical Inventory Units`);

  // 5. Create Sample Rentals for realistic dashboard testing
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400 * 1000);
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 86400 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 86400 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400 * 1000);

  // Active Rental 1
  await prisma.rental.create({
    data: {
      rentalNumber: 'RNT-202608-01001',
      customerId: customerUser.customer!.id,
      status: RentalStatus.ACTIVE,
      fulfillmentType: FulfillmentType.STORE_PICKUP,
      startDate: threeDaysAgo,
      endDate: fiveDaysFromNow,
      subtotalPaise: 1200000, // ₹12,000
      depositTotalPaise: 500000, // ₹5,000
      totalPaise: 1700000,
      notes: 'Customer picked up at counter',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 1,
            unitPricePaise: 150000,
            totalPaise: 1200000,
          },
        ],
      },
      payments: {
        create: {
          amountPaise: 1700000,
          status: PaymentStatus.SUCCEEDED,
          idempotencyKey: 'SEED-PAY-1',
          providerRef: 'SIM_PAY_1001',
        },
      },
      deposits: {
        create: {
          amountPaise: 500000,
          status: DepositStatus.HELD,
        },
      },
      fulfillment: {
        create: {
          type: FulfillmentType.STORE_PICKUP,
          status: 'COMPLETED',
          completedAt: threeDaysAgo,
        },
      },
    },
  });

  // Overdue Rental 2
  await prisma.rental.create({
    data: {
      rentalNumber: 'RNT-202608-01002',
      customerId: customerUser.customer!.id,
      status: RentalStatus.OVERDUE,
      fulfillmentType: FulfillmentType.DELIVERY,
      startDate: twoDaysAgo,
      endDate: yesterday,
      subtotalPaise: 240000, // ₹2,400
      depositTotalPaise: 400000, // ₹4,000
      totalPaise: 640000,
      notes: 'Overdue by 1 day - notification sent',
      items: {
        create: [
          {
            productId: createdProducts[2].id,
            quantity: 1,
            unitPricePaise: 120000,
            totalPaise: 240000,
          },
        ],
      },
      payments: {
        create: {
          amountPaise: 640000,
          status: PaymentStatus.SUCCEEDED,
          idempotencyKey: 'SEED-PAY-2',
          providerRef: 'SIM_PAY_1002',
        },
      },
      deposits: {
        create: {
          amountPaise: 400000,
          status: DepositStatus.HELD,
        },
      },
      fulfillment: {
        create: {
          type: FulfillmentType.DELIVERY,
          status: 'COMPLETED',
          completedAt: twoDaysAgo,
        },
      },
    },
  });

  console.log('✅ RentIt Database Seed Completed Successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
