import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Default Company
    const company = await prisma.company.upsert({
        where: { slug: 'latios-hq' },
        update: {},
        create: {
            name: 'Latios HQ',
            slug: 'latios-hq',
            plan: 'ENTERPRISE',
        },
    });
    console.log(`🏢 Company created: ${company.name}`);

    // 2. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@latios.com' },
        update: {
            password: hashedPassword, // Reset password if exists
        },
        create: {
            email: 'admin@latios.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            companyId: company.id,
        },
    });
    console.log(`👤 User created: ${user.email} (Password: admin123)`);

    console.log('✅ Seed complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
