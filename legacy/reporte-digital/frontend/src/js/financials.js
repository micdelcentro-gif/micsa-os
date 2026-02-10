/**
 * MICSA OS - Financial Statements Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    document.getElementById('dateStart').value = firstDay;
    document.getElementById('dateEnd').value = lastDay;

    loadFinancials();
});

async function loadFinancials() {
    const start = document.getElementById('dateStart').value;
    const end = document.getElementById('dateEnd').value;

    if (!start || !end) return;

    await Promise.all([
        loadPNL(start, end),
        loadBalance(end)
    ]);
}

async function loadPNL(start, end) {
    try {
        const response = await fetch(`/api/accounting/reports/pnl?start=${start}&end=${end}`);
        const data = await response.json();

        const tbody = document.getElementById('pnlBody');
        tbody.innerHTML = '';

        let totalIncome = 0;
        let totalExpense = 0;

        data.forEach(item => {
            const row = document.createElement('tr');
            const balance = item.balance || 0;

            if (item.type === 'INGRESO') totalIncome += balance;
            else totalExpense += Math.abs(balance);

            row.innerHTML = `
                <td>${item.code} - ${item.name}</td>
                <td class="${balance >= 0 ? 'amount-pos' : 'amount-neg'}">
                    ${formatCurrency(balance)}
                </td>
            `;
            tbody.appendChild(row);
        });

        const net = totalIncome - totalExpense;
        const netEl = document.getElementById('netProfit');
        netEl.textContent = formatCurrency(net);
        netEl.className = net >= 0 ? 'amount-pos' : 'amount-neg';

    } catch (err) {
        console.error('Error P&L:', err);
    }
}

async function loadBalance(date) {
    try {
        const response = await fetch(`/api/accounting/reports/balance?date=${date}`);
        const data = await response.json();

        const tbody = document.getElementById('balanceBody');
        tbody.innerHTML = '';

        const groups = { 'ACTIVO': [], 'PASIVO': [], 'CAPITAL': [] };
        data.forEach(item => {
            if (groups[item.type]) groups[item.type].push(item);
        });

        for (const [type, items] of Object.entries(groups)) {
            if (items.length === 0) continue;

            const headRow = document.createElement('tr');
            headRow.innerHTML = `<td colspan="2" style="font-weight:700; background:rgba(255,255,255,0.05); color:var(--accent-color);">${type}</td>`;
            tbody.appendChild(headRow);

            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding-left: 25px;">${item.code} - ${item.name}</td>
                    <td class="amount-neutral">${formatCurrency(item.balance || 0)}</td>
                `;
                tbody.appendChild(row);
            });
        }

    } catch (err) {
        console.error('Error Balance:', err);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}
