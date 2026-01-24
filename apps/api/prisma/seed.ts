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

    // 2. Create Users with Different Roles
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // ADMIN User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@latios.com' },
        update: { password: hashedPassword },
        create: {
            email: 'admin@latios.com',
            name: 'Usuario Admin',
            password: hashedPassword,
            role: 'ADMIN',
            companyId: company.id,
        },
    });
    console.log(`👤 ADMIN created: ${admin.email}`);

    // LEADER User
    const leader = await prisma.user.upsert({
        where: { email: 'lider@latios.com' },
        update: { password: hashedPassword },
        create: {
            email: 'lider@latios.com',
            name: 'Usuario Líder',
            password: hashedPassword,
            role: 'LEADER',
            companyId: company.id,
        },
    });
    console.log(`👤 LEADER created: ${leader.email}`);

    // MANAGER User
    const manager = await prisma.user.upsert({
        where: { email: 'gestor@latios.com' },
        update: { password: hashedPassword },
        create: {
            email: 'gestor@latios.com',
            name: 'Usuario Gestor',
            password: hashedPassword,
            role: 'MANAGER',
            companyId: company.id,
        },
    });
    console.log(`👤 MANAGER created: ${manager.email}`);

    // 3. Create Sample Process
    const process = await prisma.process.upsert({
        where: { id: 'default-process' },
        update: {},
        create: {
            id: 'default-process',
            name: 'Recursos Humanos',
            description: 'Proceso de gestión de recursos humanos',
            companyId: company.id,
        },
    });
    console.log(`📂 Process created: ${process.name}`);

    // 4. Assign Leader to Process
    await prisma.processLeader.upsert({
        where: {
            processId_userId: {
                processId: process.id,
                userId: leader.id,
            },
        },
        update: {},
        create: {
            processId: process.id,
            userId: leader.id,
        },
    });
    console.log(`🔗 Leader assigned to process: ${leader.name} -> ${process.name}`);

    // 5. Assign Manager to Process
    await prisma.user.update({
        where: { id: manager.id },
        data: { processId: process.id },
    });
    console.log(`🔗 Manager assigned to process: ${manager.name} -> ${process.name}`);

    console.log('');
    console.log('✅ Seed complete!');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log('   Admin:   admin@latios.com / admin123');
    console.log('   Líder:   lider@latios.com / admin123');
    console.log('   Gestor:  gestor@latios.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
