import { Card, Button } from "@latios/ui";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo 👋</h2>
                    <p className="text-gray-500">Aquí tienes un resumen de tu actividad.</p>
                </div>
                <Button size="lg">+ Crear Documento</Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Documentos Enviados">
                    <p className="text-3xl font-bold text-brand-600">124</p>
                    <p className="text-sm text-gray-500 mt-2">↑ 12% vs mes anterior</p>
                </Card>
                <Card title="Pendientes de Firma">
                    <p className="text-3xl font-bold text-orange-500">8</p>
                    <p className="text-sm text-gray-500 mt-2">Requieren atención</p>
                </Card>
                <Card title="Plantillas Activas">
                    <p className="text-3xl font-bold text-gray-700">12</p>
                    <p className="text-sm text-gray-500 mt-2">Listas para usar</p>
                </Card>
            </div>

            <Card title="Actividad Reciente">
                <div className="text-gray-500 text-center py-8">
                    No hay actividad reciente para mostrar.
                </div>
            </Card>
        </div>
    );
}
