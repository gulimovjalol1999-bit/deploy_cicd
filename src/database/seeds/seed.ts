import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

async function seed() {
  await AppDataSource.initialize();
  console.log('DB connected. Running seed...');

  const userRepo = AppDataSource.getRepository('users');
  const pricingRepo = AppDataSource.getRepository('pricing_history');

  // ─── Super Admin ────────────────────────────────────────────
  const existing = await userRepo.findOne({ where: { username: 'superadmin' } });
  if (!existing) {
    const password = process.env.SUPERADMIN_PASSWORD;
    if (!password) throw new Error('SUPERADMIN_PASSWORD env variable is not set');
    const hash = await bcrypt.hash(password, 12);
    await userRepo.save(
      userRepo.create({
        username: 'superadmin',
        fullName: 'Jaloliddin Gulimov',
        password: hash,
        role: Role.SUPER_ADMIN,
        isActive: true,
      }),
    );
    console.log('  ✓ SUPER_ADMIN created  →  username: superadmin');
  } else {
    console.log('  ✓ SUPER_ADMIN already exists, skipping.');
  }

  // ─── Initial Pricing ────────────────────────────────────────
  const priceCount = await pricingRepo.count();
  if (priceCount === 0) {
    await pricingRepo.save(
      pricingRepo.create({
        hourlyPrice: 80000,
        effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
        note: 'Initial price — 80,000 UZS/hour',
      }),
    );
    console.log('  ✓ Initial hourly price set: 80,000 UZS'); 
  }

  await AppDataSource.destroy();
  console.log('\nSeed completed successfully.\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
