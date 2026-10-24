import 'dotenv/config';
import { PrismaClient, Role, VerificationStatus, ProductStatus, RFQStatus, QuotationStatus, OrderStatus, PaymentStatus, PaymentMethod, ShipmentStatus, BusinessRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous demo data ---');
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rFQAttachment.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.priceTier.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplierVerification.deleteMany();
  await prisma.businessMember.deleteMany();
  await prisma.business.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();

  console.log('--- Seeding Platform Settings ---');
  await prisma.platformSetting.createMany({
    data: [
      { key: 'MARKETPLACE_NAME', value: 'TradeFlow B2B Wholesale' },
      { key: 'COMMISSION_RATE_PERCENT', value: '3.5' },
      { key: 'DEFAULT_CURRENCY', value: 'USD' },
      { key: 'MAINTENANCE_MODE', value: 'false' },
      { key: 'AUTO_APPROVE_BUYER_REGISTRATIONS', value: 'true' },
    ],
  });

  console.log('--- Seeding Users ---');
  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      firebaseUid: 'demo_admin_uid_001',
      email: 'admin@tradeflow.com',
      name: 'Sarah Jenkins',
      role: Role.ADMIN,
      profile: {
        create: {
          jobTitle: 'Head of Operations & Compliance',
          country: 'United States',
          phone: '+1 555-019-2831',
          emailVerified: true,
        },
      },
    },
  });

  // Supplier User & Business
  const supplierUser = await prisma.user.create({
    data: {
      firebaseUid: 'demo_supplier_uid_001',
      email: 'supplier@apex.com',
      name: 'David Zhang',
      role: Role.SUPPLIER,
      profile: {
        create: {
          companyName: 'Apex Global Electronics Ltd.',
          jobTitle: 'VP International Sales',
          country: 'China',
          phone: '+86 755 8392 1100',
          emailVerified: true,
        },
      },
    },
  });

  // Buyer User
  const buyerUser = await prisma.user.create({
    data: {
      firebaseUid: 'demo_buyer_uid_001',
      email: 'buyer@globalmerch.com',
      name: 'Marcus Vance',
      role: Role.BUYER,
      profile: {
        create: {
          companyName: 'Global Merchandising Partners Inc.',
          jobTitle: 'Director of Procurement',
          country: 'United States',
          phone: '+1 415-883-9912',
          emailVerified: true,
        },
      },
      addresses: {
        create: {
          contactName: 'Marcus Vance',
          companyName: 'Global Merchandising Partners Logistics Hub',
          phone: '+1 415-883-9912',
          addressLine1: '450 Harbor Boulevard, Suite 300',
          city: 'South San Francisco',
          state: 'CA',
          postalCode: '94080',
          country: 'United States',
          isDefault: true,
        },
      },
    },
  });

  const buyerAddress = await prisma.address.findFirst({ where: { userId: buyerUser.id } });

  console.log('--- Seeding Supplier Businesses ---');
  const apexBusiness = await prisma.business.create({
    data: {
      name: 'Apex Global Electronics Ltd.',
      slug: 'apex-global-electronics',
      legalName: 'Shenzhen Apex Global Electronics Manufacturing Co., Ltd.',
      businessType: 'MANUFACTURER',
      registrationNumber: 'CN91440300MA5EXX892J',
      taxId: '91440300MA5EXX892J',
      yearEstablished: 2012,
      employeeCount: '250 - 500 Employees',
      annualRevenue: '$25M - $50M USD',
      mainProducts: ['ANC Bluetooth Headphones', 'Industrial Power Banks', 'Smart IoT Sensors', 'GaN Fast Chargers'],
      description: 'Apex Global Electronics is a premier Tier-1 manufacturer specializing in precision acoustics, smart wearables, and industrial power electronics. Operating across 22,000 sqm of ISO9001 and ISO14001 certified cleanroom facilities, we supply enterprise clients across North America, Europe, and Asia-Pacific with comprehensive OEM/ODM engineering support.',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
      websiteUrl: 'https://apex-electronics.example.com',
      country: 'China',
      city: 'Shenzhen, Guangdong',
      address: 'Bldg 4, High-Tech Industrial Park, Nanshan District',
      postalCode: '518057',
      isVerified: true,
      rating: 4.92,
      reviewCount: 148,
      responseRate: 99,
      responseTime: '< 3 hours',
      members: {
        create: {
          userId: supplierUser.id,
          role: BusinessRole.OWNER,
        },
      },
      verification: {
        create: {
          status: VerificationStatus.APPROVED,
          businessLicenseUrl: 'https://tradeflow-docs.storage/licenses/apex_business_license.pdf',
          taxCertificateUrl: 'https://tradeflow-docs.storage/licenses/apex_tax_cert.pdf',
          factoryCertificates: [
            'ISO9001:2015 Quality Management',
            'ISO14001:2015 Environmental',
            'CE & FCC Verified Lab Audit',
          ],
          reviewerNotes: 'Verified onsite audit report and official chamber of commerce registration. Approved for Tier-1 Gold Supplier status.',
          reviewedAt: new Date('2025-01-10T09:00:00Z'),
          reviewedBy: adminUser.id,
        },
      },
    },
  });

  const titanBusiness = await prisma.business.create({
    data: {
      name: 'Titan Industrial Mechanics GmbH',
      slug: 'titan-industrial-mechanics',
      legalName: 'Titan Industriemechanik und Fertigungstechnik GmbH',
      businessType: 'MANUFACTURER',
      yearEstablished: 1998,
      employeeCount: '100 - 250 Employees',
      annualRevenue: '$50M - $100M USD',
      mainProducts: ['5-Axis CNC Milling Spindles', 'High-Torque Planetary Gearboxes', 'Automated Pneumatic Actuators'],
      description: 'Precision German engineering for high-tolerance CNC milling systems, industrial robotics components, and heavy-duty drivetrain assemblies. CE marked and DIN EN ISO compliant.',
      logoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      country: 'Germany',
      city: 'Stuttgart, Baden-Württemberg',
      isVerified: true,
      rating: 4.96,
      reviewCount: 89,
      responseRate: 97,
      responseTime: '< 5 hours',
    },
  });

  const nordicBusiness = await prisma.business.create({
    data: {
      name: 'Nordic BioTextiles AS',
      slug: 'nordic-biotextiles',
      legalName: 'Nordic Sustainable BioTextiles AS',
      businessType: 'MANUFACTURER',
      yearEstablished: 2016,
      employeeCount: '50 - 100 Employees',
      annualRevenue: '$10M - $25M USD',
      mainProducts: ['Organic GOTS Combed Cotton', 'Merino Thermal Fleeces', 'Recycled Ocean Polymer Fabrics'],
      description: 'Certified sustainable B2B textile manufacturer supplying fashion brands and commercial uniforms worldwide with certified organic and low-carbon materials.',
      logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop&q=80',
      country: 'Norway',
      city: 'Oslo',
      isVerified: true,
      rating: 4.88,
      reviewCount: 62,
    },
  });

  console.log('--- Seeding Categories ---');
  const catElectronics = await prisma.category.create({
    data: {
      name: 'Consumer Electronics',
      slug: 'consumer-electronics',
      description: 'High-volume wholesale electronics, components, audio equipment, and wearable IoT tech.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      order: 1,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: 'Audio & Acoustics',
      slug: 'audio-and-acoustics',
      description: 'Commercial ANC headsets, wireless Bluetooth earbuds, and conferencing hardware.',
      parentId: catElectronics.id,
      order: 1,
    },
  });

  const catPower = await prisma.category.create({
    data: {
      name: 'Power & Charging Equipment',
      slug: 'power-charging-equipment',
      description: 'GaN wall adapters, industrial power banks, solar generators, and custom battery packs.',
      parentId: catElectronics.id,
      order: 2,
    },
  });

  const catMachinery = await prisma.category.create({
    data: {
      name: 'Industrial Machinery & Automation',
      slug: 'industrial-machinery',
      description: 'CNC machining centers, precision tool holders, hydraulic presses, and robotic actuators.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      order: 2,
    },
  });

  const catTextiles = await prisma.category.create({
    data: {
      name: 'Apparel & Commercial Textiles',
      slug: 'apparel-textiles',
      description: 'Organic raw fabrics, performance sportswear blanks, protective outerwear, and trims.',
      imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop&q=80',
      order: 3,
    },
  });

  const catMedical = await prisma.category.create({
    data: {
      name: 'Medical Supplies & Equipment',
      slug: 'medical-equipment',
      description: 'Hospital grade sterilization units, diagnostic monitors, PPE batches, and clinic furnishings.',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
      order: 4,
    },
  });

  console.log('--- Seeding Products with Tiered Wholesale Pricing ---');

  // Product 1: Apex ANC Headphones
  const prodHeadphones = await prisma.product.create({
    data: {
      businessId: apexBusiness.id,
      categoryId: catAudio.id,
      name: 'Apex Pro Sound X7 Hybrid Active Noise Cancelling Wireless Headphones',
      slug: 'apex-pro-sound-x7-hybrid-anc-wireless-headphones',
      shortDescription: 'Enterprise OEM/ODM wireless ANC headset with 40mm beryllium drivers, 55dB noise reduction, 70-hour battery life, and custom branding support.',
      description: `### Product Architecture & Performance
The Apex Pro Sound X7 is engineered for commercial distributors and audio brands seeking flagship acoustics without the development cycle. Featuring custom-tuned 40mm Beryllium acoustic drivers, 5-microphone feedforward/feedback hybrid ANC, and Qualcomm Bluetooth 5.4 aptX Lossless decoding.

#### Wholesale Customization Options:
- **Silk-screen or Laser-engraved logo** on earcups and headband
- **Custom packaging:** Retail blister, luxury magnetic gift box, or bulk bulk-pack master cartons
- **Custom Bluetooth pairing broadcast name** burned into firmware
- **Proprietary DSP EQ profiles** tailored to your brand's acoustic signature

#### Quality & Compliance:
- CE, FCC, RoHS, REACH, Telec, WEEE certified
- 100% automated acoustic curve frequency response testing per unit
- Full drop-test and environmental chamber reliability certification (MIL-STD-810G compliant)
`,
      sku: 'APX-ANC-X7',
      status: ProductStatus.PUBLISHED,
      currency: 'USD',
      unitOfMeasurement: 'Piece',
      moq: 50,
      basePrice: 38.50,
      countryOfOrigin: 'China',
      leadTimeDays: 14,
      shippingEstimate: 'Air Freight: 5-7 days | Sea Cargo: 20-28 days to US/EU ports',
      sampleAvailable: true,
      samplePrice: 65.00,
      customizationOptions: 'Custom logo (MOQ 200), Custom retail box (MOQ 500), Custom firmware DSP (MOQ 1000)',
      specifications: {
        'Bluetooth Version': 'Bluetooth 5.4 + BLE Audio',
        'Noise Cancellation Depth': 'Up to 55dB Hybrid ANC',
        'Battery Capacity': '850 mAh Li-Polymer',
        'Playtime': '70 hours (ANC OFF), 48 hours (ANC ON)',
        'Charging Interface': 'USB Type-C Fast Charge (10 min = 5 hours)',
        'Frequency Response': '15 Hz - 40,000 Hz Hi-Res Certified',
        'Weight': '248 grams',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            altText: 'Apex Pro Sound X7 ANC Headphones in Matte Midnight Black',
            order: 0,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
            altText: 'Ear cushion detail and precision memory foam',
            order: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            altText: 'Foldable hinge design for retail compact packaging',
            order: 2,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 50, maxQuantity: 199, unitPrice: 38.50 },
          { minQuantity: 200, maxQuantity: 999, unitPrice: 32.00 },
          { minQuantity: 1000, maxQuantity: 4999, unitPrice: 26.50 },
          { minQuantity: 5000, maxQuantity: null, unitPrice: 22.00 },
        ],
      },
      inventory: {
        create: {
          available: 12500,
          reserved: 450,
          sold: 84000,
        },
      },
      variants: {
        create: [
          { name: 'Matte Midnight Black', sku: 'APX-ANC-X7-BLK', additionalPrice: 0.00, stock: 6000 },
          { name: 'Nordic Silver White', sku: 'APX-ANC-X7-WHT', additionalPrice: 0.00, stock: 4500 },
          { name: 'Titanium Gunmetal Grey', sku: 'APX-ANC-X7-GRY', additionalPrice: 1.50, stock: 2000 },
        ],
      },
    },
  });

  // Product 2: Apex 140W GaN Fast Charger
  const prodCharger = await prisma.product.create({
    data: {
      businessId: apexBusiness.id,
      categoryId: catPower.id,
      name: 'GaN Ultra 140W Multi-Port Desktop USB-C PD 3.1 Fast Charging Station',
      slug: 'gan-ultra-140w-multi-port-desktop-usb-c-fast-charging-station',
      shortDescription: 'Gallium Nitride (GaN III) 140W rapid charger with 3x USB-C, 1x USB-A, intelligent dynamic power allocation, and global plug configurations (US/EU/UK/AU).',
      description: 'Engineered with cutting-edge Navitas GaN III semiconductor chips for high thermal dissipation and minimal power loss. Fully supports MacBook Pro 16" 140W EPR rapid charging, Samsung Super Fast Charging 2.0, and PD 3.1 PPS protocols.',
      sku: 'APX-GAN-140W',
      status: ProductStatus.PUBLISHED,
      currency: 'USD',
      unitOfMeasurement: 'Piece',
      moq: 100,
      basePrice: 24.50,
      countryOfOrigin: 'China',
      leadTimeDays: 10,
      sampleAvailable: true,
      samplePrice: 35.00,
      specifications: {
        'Total Output': '140W Max',
        'Protocols': 'PD 3.1, PPS, QC 5.0, AFC, SCP',
        'Inputs': '100-240V ~ 50/60Hz 2.0A Global Voltage',
        'Port Configuration': '3x USB-C + 1x USB-A',
        'Safety Certifications': 'UL 62368-1, CB, CE, TUV, PSE',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
            altText: '140W GaN Charging Station',
            order: 0,
            isPrimary: true,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 499, unitPrice: 24.50 },
          { minQuantity: 500, maxQuantity: 1999, unitPrice: 19.80 },
          { minQuantity: 2000, maxQuantity: null, unitPrice: 16.20 },
        ],
      },
      inventory: {
        create: {
          available: 20000,
          reserved: 0,
          sold: 140000,
        },
      },
    },
  });

  // Product 3: Titan CNC Milling Spindle
  const prodSpindle = await prisma.product.create({
    data: {
      businessId: titanBusiness.id,
      categoryId: catMachinery.id,
      name: 'Titan Pro-5X Industrial Electro-Spindle 24,000 RPM Water-Cooled CNC Unit',
      slug: 'titan-pro-5x-industrial-electro-spindle-cnc-unit',
      shortDescription: 'High-precision German engineered electro-spindle with ceramic hybrid bearings, HSK-E40 tool interface, and integrated thermal vibration sensors.',
      description: 'Manufactured in Stuttgart, the Titan Pro-5X is specifically designed for 5-axis high-speed milling of aerospace grade aluminum, titanium alloys, and composite materials.',
      sku: 'TTN-SPN-24K',
      status: ProductStatus.PUBLISHED,
      currency: 'USD',
      unitOfMeasurement: 'Set',
      moq: 1,
      basePrice: 3450.00,
      countryOfOrigin: 'Germany',
      leadTimeDays: 28,
      sampleAvailable: false,
      specifications: {
        'Max Rotational Speed': '24,000 RPM',
        'Rated Power': '12 kW Continuous / 15 kW Peak',
        'Bearing Type': 'High Precision Ceramic Hybrid (Germany FAG)',
        'Runout': '< 0.0015 mm (at collet nose)',
        'Cooling System': 'Closed-loop Liquid Chiller',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
            altText: 'Titan Industrial CNC Spindle Assembly',
            order: 0,
            isPrimary: true,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 1, maxQuantity: 4, unitPrice: 3450.00 },
          { minQuantity: 5, maxQuantity: 19, unitPrice: 3100.00 },
          { minQuantity: 20, maxQuantity: null, unitPrice: 2850.00 },
        ],
      },
      inventory: {
        create: {
          available: 45,
          reserved: 2,
          sold: 310,
        },
      },
    },
  });

  // Product 4: Nordic Organic Cotton Tees
  const prodTees = await prisma.product.create({
    data: {
      businessId: nordicBusiness.id,
      categoryId: catTextiles.id,
      name: 'Nordic Organic Heavyweight Combed Cotton Blank T-Shirts (240 GSM)',
      slug: 'nordic-organic-heavyweight-cotton-blank-t-shirts-240-gsm',
      shortDescription: 'Premium GOTS-certified 100% organic combed ring-spun cotton wholesale blanks. Pre-shrunk with side seams, reinforced neck tape, and tear-away labels.',
      description: 'Crafted for ethical streetwear brands, corporate uniform programs, and high-density screen printing. Produced using zero hazardous dyes under OEKO-TEX Standard 100 certification.',
      sku: 'NDC-TEE-240',
      status: ProductStatus.PUBLISHED,
      currency: 'USD',
      unitOfMeasurement: 'Piece',
      moq: 200,
      basePrice: 5.80,
      countryOfOrigin: 'Norway',
      leadTimeDays: 14,
      sampleAvailable: true,
      samplePrice: 15.00,
      specifications: {
        'Fabric Weight': '240 GSM / 7.1 oz Heavyweight Jersey',
        'Yarn Composition': '100% Combed Ring-Spun Organic Cotton',
        'Certifications': 'GOTS, FairTrade, OEKO-TEX 100',
        'Fitting': 'Relaxed European Streetwear Cut',
      },
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            altText: 'Organic Heavyweight T-Shirt Pile',
            order: 0,
            isPrimary: true,
          },
        ],
      },
      priceTiers: {
        create: [
          { minQuantity: 200, maxQuantity: 499, unitPrice: 5.80 },
          { minQuantity: 500, maxQuantity: 1999, unitPrice: 4.90 },
          { minQuantity: 2000, maxQuantity: null, unitPrice: 4.10 },
        ],
      },
      inventory: {
        create: {
          available: 50000,
          reserved: 1200,
          sold: 620000,
        },
      },
    },
  });

  console.log('--- Seeding Demo RFQ & Quotations ---');
  const sampleRFQ = await prisma.rFQ.create({
    data: {
      userId: buyerUser.id,
      categoryId: catAudio.id,
      title: 'Bulk Order: Custom Branded ANC Bluetooth Headsets for Corporate Gift Program',
      description: 'Looking for a reliable manufacturer to supply 500 units of premium hybrid active noise cancelling over-ear headphones with custom embossed corporate logo and custom rigid gift packaging. Delivery to California by next quarter.',
      quantity: 500,
      unitOfMeasurement: 'Piece',
      targetPrice: 30.00,
      currency: 'USD',
      destinationCountry: 'United States',
      requiredDeliveryDate: new Date('2026-12-15T00:00:00Z'),
      status: RFQStatus.QUOTED,
      specifications: {
        'Logo Placement': 'Outer aluminum earcup shell',
        'Packaging': 'Matte black magnetic closure box with EVA foam tray',
        'Certification Required': 'FCC ID and CE Declaration of Conformity',
      },
      attachments: {
        create: [
          {
            fileName: 'corporate_branding_vector_specs.pdf',
            fileUrl: 'https://tradeflow-files.storage/rfqs/rfq_branding_specs.pdf',
            fileSize: 1048576,
            mimeType: 'application/pdf',
          },
        ],
      },
    },
  });

  const sampleQuotation = await prisma.quotation.create({
    data: {
      rfqId: sampleRFQ.id,
      businessId: apexBusiness.id,
      unitPrice: 29.50,
      currency: 'USD',
      minOrderQuantity: 500,
      leadTimeDays: 18,
      shippingEstimateCost: 850.00,
      paymentTerms: '30% deposit upon order confirmation, 70% prior to air freight dispatch',
      validUntil: new Date('2026-11-30T00:00:00Z'),
      notes: 'We can accommodate your custom embossed metallic logo on the earcups and provide sample approval prototypes within 5 business days. All FCC and CE certificates will be attached to the bill of lading.',
      status: QuotationStatus.SUBMITTED,
      items: {
        create: [
          {
            description: 'Apex Pro Sound X7 Headsets with Custom Laser Engraving (500 units)',
            minQuantity: 500,
            unitPrice: 28.00,
          },
          {
            description: 'Custom Rigid Magnetic Presentation Gift Boxes with EVA Insert (500 units)',
            minQuantity: 500,
            unitPrice: 1.50,
          },
        ],
      },
    },
  });

  console.log('--- Seeding Completed Demo Order & Shipment ---');
  if (buyerAddress) {
    const demoOrder = await prisma.order.create({
      data: {
        orderNumber: 'TF-2026-10492',
        buyerId: buyerUser.id,
        supplierId: apexBusiness.id,
        addressId: buyerAddress.id,
        status: OrderStatus.SHIPPED,
        currency: 'USD',
        subtotal: 6400.00,
        shippingCost: 350.00,
        taxCost: 0.00,
        totalAmount: 6750.00,
        notes: 'Commercial Invoice and Packing List attached to consignment.',
        items: {
          create: [
            {
              productId: prodHeadphones.id,
              productName: 'Apex Pro Sound X7 Hybrid Active Noise Cancelling Wireless Headphones',
              productSku: 'APX-ANC-X7-BLK',
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
              unitPrice: 32.00,
              quantity: 200,
              totalPrice: 6400.00,
              unitOfMeasurement: 'Piece',
              variantSnapshot: { color: 'Matte Midnight Black' },
            },
          ],
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Order created via checkout' },
            { status: OrderStatus.PAID, note: 'Payment verified via Stripe Sandbox' },
            { status: OrderStatus.PROCESSING, note: 'Goods packaged at Shenzhen distribution center' },
            { status: OrderStatus.SHIPPED, note: 'Dispatched via DHL Express Air Waybill' },
          ],
        },
        payments: {
          create: {
            amount: 6750.00,
            currency: 'USD',
            method: PaymentMethod.SANDBOX_TEST,
            status: PaymentStatus.PAID,
            transactionId: 'TXN-SANDBOX-994821',
            paymentMetadata: { mode: 'test_sandbox', provider: 'Stripe Sandbox Mock' },
          },
        },
        shipments: {
          create: {
            carrier: 'DHL Express Worldwide',
            trackingNumber: 'DHL-8492019482',
            trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=DHL-8492019482',
            status: ShipmentStatus.IN_TRANSIT,
            notes: 'Consignment cleared Hong Kong export customs. In transit to SFO International Hub.',
          },
        },
      },
    });

    // Seed Verified Review
    await prisma.review.create({
      data: {
        userId: buyerUser.id,
        productId: prodHeadphones.id,
        rating: 5,
        title: 'Outstanding build quality and flawless noise cancellation',
        comment: 'We ordered a pilot batch of 200 units for our corporate team. The ANC is equivalent to leading tier-1 brands, sound signature is balanced, and battery life exceeded 60 hours in our stress tests. David and the Apex engineering team provided phenomenal communication.',
        isVerified: true,
      },
    });
  }

  // Seed sample B2B conversation
  const demoConversation = await prisma.conversation.create({
    data: {
      productId: prodHeadphones.id,
      rfqId: sampleRFQ.id,
      subject: 'Inquiry regarding custom packaging and lead time for 500 units',
      participants: {
        create: [
          { userId: buyerUser.id },
          { userId: supplierUser.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: buyerUser.id,
            content: 'Hello David, we reviewed the Apex Pro Sound X7 specification sheet. Can you confirm whether sample units can be shipped with our custom laser logo before placing the 500 batch order?',
          },
          {
            senderId: supplierUser.id,
            content: 'Hi Marcus, absolutely! We can prepare 2 pre-production sample units with your laser-engraved vector logo and ship via DHL express within 4 days. I have submitted the formal quotation on your RFQ page.',
          },
        ],
      },
    },
  });

  console.log('--- Database seeding completed successfully! ---');
  console.log('Demo Accounts created:');
  console.log('  Admin:    admin@tradeflow.com (Firebase UID: demo_admin_uid_001)');
  console.log('  Supplier: supplier@apex.com   (Firebase UID: demo_supplier_uid_001)');
  console.log('  Buyer:    buyer@globalmerch.com (Firebase UID: demo_buyer_uid_001)');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
