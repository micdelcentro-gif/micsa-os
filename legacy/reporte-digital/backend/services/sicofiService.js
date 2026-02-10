const axios = require('axios');

class SicofiService {
    constructor() {
        this.baseUrl = 'https://cfd.sicofi.com.mx/DFWSR/api';
        this.token = null;
        this.username = 'jgonzalez@micsadelcentro.com';
        this.password = 'Fasedem4$';
    }

    async getToken() {
        try {
            // Intento 1: JSON
            let response = await axios.post(`${this.baseUrl}/auth/token`, {
                Username: this.username,
                Password: this.password
            });
            if (response.data.token || response.data.Token) {
                this.token = response.data.token || response.data.Token;
                return this.token;
            }

            // Intento 2: Form Encoded
            const params = new URLSearchParams();
            params.append('Username', this.username);
            params.append('Password', this.password);

            response = await axios.post(`${this.baseUrl}/auth/token`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            this.token = response.data.token || response.data.Token;
            return this.token;
        } catch (error) {
            console.error('Error detallado Sicofi:', error.response?.data || error.message);
            return null;
        }
    }

    async stampInvoice(invoiceData) {
        if (!this.token) await this.getToken();
        if (!this.token) throw new Error('No se pudo autenticar con Sicofi');

        try {
            const response = await axios.post(`${this.baseUrl}/Comprobante40/Factura40`, invoiceData, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al timbrar factura en Sicofi:', error.response?.data || error.message);
            throw error;
        }
    }

    async stampPayroll(payrollData) {
        if (!this.token) await this.getToken();
        if (!this.token) throw new Error('No se pudo autenticar con Sicofi');

        try {
            const response = await axios.post(`${this.baseUrl}/Comprobante40/Nomina40`, payrollData, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al timbrar nómina en Sicofi:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new SicofiService();
