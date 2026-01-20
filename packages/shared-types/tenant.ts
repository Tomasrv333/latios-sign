export interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    createdAt: Date;
    updatedAt: Date;
}

export interface TenantConfig {
    primaryColor?: string;
    logoUrl?: string;
}
