import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const company = await prisma.company.findFirst();
    if (!company) {
        console.log('No company found');
        return;
    }

    const password = await bcrypt.hash('123456', 10);

    console.log(`Creating managers for company: ${company.name}`);

    for (let i = 1; i <= 10; i++) {
        const email = `gestor${i}.${Date.now()}@latios.com`; // Unique email just in case
        await prisma.user.create({
            data: {
                email,
                name: `Gestor ${i}`,
                password,
                role: 'MANAGER',
                companyId: company.id,
            },
        });
        console.log(`Created user: ${email}`);
    }
    console.log('Created 10 managers successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
