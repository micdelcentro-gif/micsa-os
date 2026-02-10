const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

const xmlParserService = {
    /**
     * Parsea un XML de CFDI 4.0 o 3.3
     */
    parseCFDI: async (filePath) => {
        try {
            const xmlContent = fs.readFileSync(filePath, 'utf-8');
            const result = await parser.parseStringPromise(xmlContent);

            // Determinar si es CFDI 4.0 o 3.3
            const comprobante = result['cfdi:Comprobante'] || result['Comprobante'];
            if (!comprobante) throw new Error('No es un CFDI válido');

            const emisor = comprobante['cfdi:Emisor'] || comprobante['Emisor'];
            const receptor = comprobante['cfdi:Receptor'] || comprobante['Receptor'];
            const timbre = comprobante['cfdi:Complemento']?.['tfd:TimbreFiscalDigital'] || comprobante['Complemento']?.['TimbreFiscalDigital'];

            return {
                uuid: timbre?.UUID,
                fecha: comprobante.Fecha,
                rfcEmisor: emisor?.Rfc,
                nombreEmisor: emisor?.Nombre,
                rfcReceptor: receptor?.Rfc,
                nombreReceptor: receptor?.Rfc === 'XAXX010101000' ? 'PUBLICO EN GENERAL' : receptor?.Nombre,
                subtotal: parseFloat(comprobante.SubTotal || 0),
                total: parseFloat(comprobante.Total || 0),
                tipo: comprobante.TipoDeComprobante, // I: Ingreso, E: Egreso, P: Pago, N: Nomina
                metodoPago: comprobante.MetodoPago,
                folio: comprobante.Folio,
                // Datos de Nómina
                nomina: result['cfdi:Comprobante']?.['cfdi:Complemento']?.['nom12:Nomina'] || null
            };
        } catch (err) {
            console.error('Error parseando XML:', err);
            return null;
        }
    }
};

module.exports = xmlParserService;
