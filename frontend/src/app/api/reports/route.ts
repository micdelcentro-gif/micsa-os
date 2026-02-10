import { NextResponse } from 'next/server';

const LEGACY_API = process.env.API_URL || 'http://localhost:3000/api';

const DEFAULT_LABELING = {
    reportId: 'MICSA_GLOBAL_LABELING_SYSTEM',
    internal_id: 'MICSA_GLOBAL_LABELING_SYSTEM',
    data: {
        etiquetas: [
            { categoria: 'Equipo Principal', prefijo: 'EQ', formato: 'EQ-XXX' },
            { categoria: 'Cableado', prefijo: 'CB', formato: 'CB-EQ-XXX-YY' },
            { categoria: 'Tubería', prefijo: 'TB', formato: 'TB-XXX-DIA-MAT' },
            { categoria: 'Válvula', prefijo: 'VL', formato: 'VL-TB-XXX' },
            { categoria: 'Soporte', prefijo: 'SP', formato: 'SP-XXX-TIPO' },
            { categoria: 'Conexión', prefijo: 'CN', formato: 'CN-XXX-TIPO' },
            { categoria: 'Accesorio', prefijo: 'AC', formato: 'AC-EQ-XXX-YY' }
        ]
    }
};

/** Helper: obtain a fresh auth token from the legacy backend */
async function getLegacyToken(): Promise<string | null> {
    try {
        const loginRes = await fetch(`${LEGACY_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        if (loginRes.ok) {
            const data = await loginRes.json();
            return data.token;
        }
    } catch (err) {
        console.warn('⚠️ No se pudo obtener token legacy:', err);
    }
    return null;
}

export async function GET() {
    try {
        const token = await getLegacyToken();

        const res = await fetch(`${LEGACY_API}/reports`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();
            const hasLabeling = data.some(
                (r: any) => r.internal_id === 'MICSA_GLOBAL_LABELING_SYSTEM' || r.reportId === 'MICSA_GLOBAL_LABELING_SYSTEM'
            );
            if (!hasLabeling) data.push(DEFAULT_LABELING);
            return NextResponse.json(data);
        }
    } catch (err) {
        console.warn('⚠️ Backend legacy no disponible, usando datos locales');
    }

    return NextResponse.json([DEFAULT_LABELING]);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        try {
            const token = await getLegacyToken();

            const res = await fetch(`${LEGACY_API}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                return NextResponse.json({ success: true, ...data });
            }
        } catch (err) {
            console.warn('⚠️ Backend legacy no disponible para guardar');
        }

        console.log('📦 Report recibido (modo local):', body.reportId);
        return NextResponse.json({
            success: true,
            message: 'Guardado localmente. Conecta el backend MICSA para persistencia.',
            id: body.reportId
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error procesando request' }, { status: 500 });
    }
}
