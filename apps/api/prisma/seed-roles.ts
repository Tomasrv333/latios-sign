
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const company = await prisma.company.findFirst();

    if (!company) {
        console.log('No company found. Please create one first.');
        return;
    }

    const password = await bcrypt.hash('password123', 10);

    // Leader
    const leader = await prisma.user.upsert({
        where: { email: 'lider@latios.com' },
        update: { role: 'LEADER' as any }, // Cast to any because Types might be stale
        create: {
            email: 'lider@latios.com',
            name: 'Usuario Líder',
            password,
            role: 'LEADER' as any,
            companyId: company.id,
        },
    });
    console.log('✅ Created Leader: lider@latios.com / password123');

    // Manager
    const manager = await prisma.user.upsert({
        where: { email: 'gestor@latios.com' },
        update: { role: 'MANAGER' as any },
        create: {
            email: 'gestor@latios.com',
            name: 'Usuario Gestor',
            password,
            role: 'MANAGER' as any,
            companyId: company.id,
        },
    });
    console.log('✅ Created Manager: gestor@latios.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
