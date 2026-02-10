/**
 * MICSA Payroll Calculator Service
 * Maneja lógica fiscal de México (ISR, IMSS, Subsidio)
 */

// Tablas ISR 2024 (Semanales - Ejemplo simplificado)
// En un sistema real, estas tablas se cargarían de la base de datos
const ISR_TABLE_WEEKLY_2024 = [
    { lowerLimit: 0.01, upperLimit: 176.72, fixedFee: 0.00, rate: 0.0192 },
    { lowerLimit: 176.73, upperLimit: 1499.90, fixedFee: 3.36, rate: 0.0640 },
    { lowerLimit: 1499.91, upperLimit: 2635.85, fixedFee: 88.06, rate: 0.1088 },
    { lowerLimit: 2635.86, upperLimit: 3064.32, fixedFee: 211.61, rate: 0.1600 },
    { lowerLimit: 3064.33, upperLimit: 3668.70, fixedFee: 280.14, rate: 0.1792 },
    { lowerLimit: 3668.71, upperLimit: 7399.00, fixedFee: 388.50, rate: 0.2136 },
    { lowerLimit: 7399.01, upperLimit: 11661.30, fixedFee: 1185.38, rate: 0.2352 },
    { lowerLimit: 11661.31, upperLimit: 22262.61, fixedFee: 2187.98, rate: 0.3000 },
    { lowerLimit: 22262.62, upperLimit: 29683.48, fixedFee: 5368.32, rate: 0.3200 },
    { lowerLimit: 29683.49, upperLimit: 89050.44, fixedFee: 7743.03, rate: 0.3400 },
    { lowerLimit: 89050.45, upperLimit: Infinity, fixedFee: 27927.73, rate: 0.3500 }
];

// Tasas IMSS Obrero (Aproximadas 2024)
const IMSS_RATES = {
    CUOTA_FIJA_PATRONAL: 0, // No aplica al obrero
    EXCEDENTE_3_UMA: 0.0040, // 0.4% sobre excedente de 3 UMAs
    PRESTACIONES_DINERO: 0.0025, // 0.25%
    GASTOS_MEDICOS: 0.00375, // 0.375%
    INVALIDEZ_VIDA: 0.00625, // 0.625%
    CESANTIA_VEJEZ: 0.01125, // 1.125%
};

const UMA_2024 = 108.57;

const payrollCalculator = {
    /**
     * Calcula ISR para un ingreso gravable
     */
    calculateISR: (taxableIncome, periodType = 'weekly') => {
        // Por ahora solo semanal, se escala si es quincenal
        const table = ISR_TABLE_WEEKLY_2024;
        const row = table.find(r => taxableIncome >= r.lowerLimit && taxableIncome <= r.upperLimit);

        if (!row) return 0;

        const excess = taxableIncome - row.lowerLimit;
        const taxOnExcess = excess * row.rate;
        return row.fixedFee + taxOnExcess;
    },

    /**
     * Calcula IMSS Obrero
     */
    calculateIMSS: (dailyBaseSalary, daysWorked = 7) => {
        const totalBase = dailyBaseSalary * daysWorked;
        const uma3 = UMA_2024 * 3;

        let imss = 0;

        // Prestaciones en dinero
        imss += totalBase * IMSS_RATES.PRESTACIONES_DINERO;
        // Gastos médicos pensionados
        imss += totalBase * IMSS_RATES.GASTOS_MEDICOS;
        // Invalidez y vida
        imss += totalBase * IMSS_RATES.INVALIDEZ_VIDA;
        // Cesantía y vejez
        imss += totalBase * IMSS_RATES.CESANTIA_VEJEZ;

        // Excedente si aplica
        if (dailyBaseSalary > uma3) {
            imss += (dailyBaseSalary - uma3) * daysWorked * IMSS_RATES.EXCEDENTE_3_UMA;
        }

        return imss;
    },

    /**
     * Genera el desglose completo de un recibo
     */
    processReceipt: (employee, period) => {
        const days = period.days || 7;
        const salary = employee.salary || 0;
        const perceptions = [
            { id: 'P001', type: '001', concept: 'Sueldo', total: salary * days, taxable: salary * days, exempt: 0 }
        ];

        const taxableIncome = perceptions.reduce((sum, p) => sum + p.taxable, 0);

        const isr = payrollCalculator.calculateISR(taxableIncome);
        const imss = payrollCalculator.calculateIMSS(salary, days);

        const deductions = [
            { id: 'D001', type: '002', concept: 'ISR', total: isr },
            { id: 'D002', type: '001', concept: 'IMSS', total: imss }
        ];

        const totalPerceptions = perceptions.reduce((sum, p) => sum + p.total, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.total, 0);

        return {
            perceptions,
            deductions,
            totalPerceptions,
            totalDeductions,
            netPay: totalPerceptions - totalDeductions
        };
    }
};

module.exports = payrollCalculator;
