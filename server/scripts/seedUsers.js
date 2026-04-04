/**
 * Rebuilds local/demo database content after a reset or new MongoDB.
 * Run from server directory: npm run seed
 * Requires MONGO_URI in .env
 *
 * Creates verified test users + sample services & jobs (only if the demo provider has none yet).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const Job = require('../models/Job');

const SEED_USERS = [
  {
    name: 'Demo Seeker',
    email: 'seeker@localhelp.test',
    password: 'Seeker123!',
    userType: 'user',
    phone: '9876543210',
  },
  {
    name: 'Demo Provider',
    email: 'provider@localhelp.test',
    password: 'Provider123!',
    userType: 'provider',
    phone: '9876543211',
  },
];

const ADMIN_USER = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@localhelp.test',
  password: 'Admin123!',
  userType: 'admin',
  phone: '9990000000',
};

async function seedUsers() {
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    let user = await User.findOne({ email: u.email });
    if (user) {
      user.name = u.name;
      user.password = hash;
      user.userType = u.userType;
      user.phone = u.phone || user.phone || '';
      user.isVerified = true;
      user.emailVerificationOtp = undefined;
      user.emailVerificationOtpExpire = undefined;
      await user.save();
      console.log('User updated:', u.email);
    } else {
      user = new User({
        name: u.name,
        email: u.email,
        password: hash,
        userType: u.userType,
        phone: u.phone || '',
        isVerified: true,
      });
      await user.save();
      console.log('User created:', u.email);
    }
  }
  return User.findOne({ email: 'provider@localhelp.test' });
}

async function seedAdmin() {
  const hash = await bcrypt.hash(ADMIN_USER.password, 10);
  let user = await User.findOne({ email: ADMIN_USER.email });
  if (user) {
    user.name = ADMIN_USER.name;
    user.password = hash;
    user.userType = 'admin';
    user.phone = ADMIN_USER.phone;
    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;
    await user.save();
    console.log('Admin updated:', ADMIN_USER.email);
  } else {
    user = new User({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hash,
      userType: 'admin',
      phone: ADMIN_USER.phone,
      isVerified: true,
    });
    await user.save();
    console.log('Admin created:', ADMIN_USER.email);
  }
}

/** Approved listings for browse/search — idempotent: skips rows that already exist by provider + name. */
async function seedDemoServices(provider) {
  const rows = [
    {
      name: 'Residential plumbing & repairs',
      category: 'plumbing',
      price: 450,
      rating: 4.7,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1596738363821-2073d8283372?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Tap leaks, clogged drains, WC repairs, and minor pipe work. Serving residential blocks in the city with same-week slots.',
      features: ['Emergency call-outs', 'Parts quoted upfront', 'Cleanup after work'],
    },
    {
      name: 'Home electrical & fan install',
      category: 'home',
      price: 550,
      rating: 4.6,
      reviews: 14,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Safe wiring checks, switchboard work, tube lights, and ceiling fans. Licensed approach with warranty on labour.',
      features: ['Safety inspection', 'Evening slots', 'Material list shared'],
    },
    {
      name: 'Deep house cleaning',
      category: 'cleaning',
      price: 350,
      rating: 4.9,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Kitchen grease removal, bathroom descale, floor mop, and dusting. Ideal before guests or after renovation.',
      features: ['Eco supplies on request', 'Move-in/out', 'Recurring weekly plans'],
    },
    {
      name: 'Math & science tutoring (Class 8–12)',
      category: 'education',
      price: 400,
      rating: 4.8,
      reviews: 22,
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'CBSE / state board — algebra, geometry, physics basics. Online or at your home within 8 km.',
      features: ['Practice sheets', 'Parent updates', 'Exam-focused'],
    },
    {
      name: 'Local moving & loading help',
      category: 'moving',
      price: 750,
      rating: 4.5,
      reviews: 11,
      image: 'https://images.unsplash.com/photo-1587602059367-549b4a8c2794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Small apartment moves, furniture shifting, and loading/unloading with a helper team and basic tools.',
      features: ['Same-day possible', 'Blankets for furniture', 'Hourly or flat quote'],
    },
    {
      name: 'Daily dog walking',
      category: 'pets',
      price: 200,
      rating: 4.8,
      reviews: 27,
      image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        '30–45 minute walks in your neighbourhood; photo check-in when you are at work.',
      features: ['Solo walks', 'Rain backup plan', 'Vaccinated pets only'],
    },
    {
      name: 'Laptop & PC repair',
      category: 'tech',
      price: 900,
      rating: 4.7,
      reviews: 19,
      image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'OS reinstall, slow PC tune-up, screen/SSD upgrades, and data backup. Pickup available in select areas.',
      features: ['Diagnosis first', 'No fix no fee policy', 'Spare parts at cost'],
    },
    {
      name: 'Personal fitness training',
      category: 'wellness',
      price: 800,
      rating: 4.9,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Strength and conditioning at home or nearby park. Plans for fat loss and general fitness.',
      features: ['First session assessment', 'Equipment-free options', 'Flexible timing'],
    },
    {
      name: 'Balcony & kitchen garden setup',
      category: 'home',
      price: 1200,
      rating: 4.4,
      reviews: 9,
      image: 'https://images.unsplash.com/photo-1594495894542-a08dc34c35e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Soil, pots, and basic drip setup for herbs and small vegetables. Maintenance tips included.',
      features: ['Sunny balcony check', 'Organic seeds optional', 'One follow-up visit'],
    },
    {
      name: 'Pet grooming (at home)',
      category: 'pets',
      price: 450,
      rating: 4.6,
      reviews: 13,
      image: 'https://images.unsplash.com/photo-1598810529242-bd1746979854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Bath, brush, nail trim for small dogs and cats. Calm handling for anxious pets.',
      features: ['Pet-safe shampoo', 'Towel dry', 'Ear cleaning'],
    },
    {
      name: 'Yoga & mobility (small groups)',
      category: 'wellness',
      price: 700,
      rating: 4.8,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Gentle yoga for beginners and seniors — breathing, stretching, and joint-friendly flows.',
      features: ['Mats available', 'Max 5 people', 'Morning & evening batches'],
    },
    {
      name: 'Smartphone & Wi-Fi setup help',
      category: 'tech',
      price: 500,
      rating: 4.5,
      reviews: 21,
      image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      description:
        'Router placement, mesh setup, parental controls, and TV casting for older adults — patient teaching style.',
      features: ['Written notes', 'WhatsApp support 3 days', 'Password manager intro'],
    },
  ];

  let created = 0;
  for (const r of rows) {
    const exists = await Service.findOne({ provider: provider._id, name: r.name });
    if (exists) continue;
    await Service.create({
      ...r,
      images: [r.image],
      provider: provider._id,
      providerName: provider.name,
      listingStatus: 'approved',
    });
    created += 1;
  }
  const total = await Service.countDocuments({ provider: provider._id });
  console.log(`Catalog services: ${created} new, ${total} total for demo provider (${rows.length} defined in seed).`);
}

async function seedDemoJobs(provider) {
  const n = await Job.countDocuments({ employer: provider._id });
  if (n > 0) {
    console.log(`Skipping demo jobs (${n} already exist for demo provider).`);
    return;
  }

  const rows = [
    {
      title: 'Part-time delivery driver',
      description: 'Evening routes, valid license required. Weekly schedule.',
      category: 'delivery',
      pay: '₹18/hr',
      location: 'Downtown',
      companyName: 'Demo Provider',
    },
    {
      title: 'Weekend house cleaner',
      description: 'Help with deep clean for small apartments.',
      category: 'cleaning',
      pay: '₹20/hr',
      location: 'North area',
      companyName: 'Demo Provider',
    },
  ];

  for (const r of rows) {
    await Job.create({
      ...r,
      employer: provider._id,
      status: 'open',
    });
  }
  console.log(`Inserted ${rows.length} demo job posts.`);
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in server/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  await seedAdmin();

  const provider = await seedUsers();
  if (!provider) {
    console.error('Could not load demo provider.');
    process.exit(1);
  }

  console.log('');
  await seedDemoServices(provider);
  await seedDemoJobs(provider);

  await mongoose.disconnect();

  console.log('\n--- Test logins (email-verified) ---');
  for (const u of SEED_USERS) {
    console.log(
      `  ${u.userType === 'user' ? 'Seeker  ' : 'Provider'}: ${u.email}  /  ${u.password}`
    );
  }
  console.log(`  Admin: ${ADMIN_USER.email}  /  ${ADMIN_USER.password}`);
  console.log('---');
  console.log('\nNote: If you still need old production data, restore from MongoDB Atlas');
  console.log('backups or a mongodump you saved—this script only recreates demo content.\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
