import { COVERAGE_POSTAL_CODES } from '../data/postalCodes.js';

/**
 * Coverage Service (SRP: Validación Geográfica y Códigos Postales en Radio de 5 km)
 */
export class CoverageService {
      static STORE_LAT = 19.391337;
      static STORE_LON = -99.154067;
      static STORE_ADDRESS = "Xochicalco 79, Narvarte Poniente, Benito Juárez, CDMX, CP 03020";
      static MAX_DISTANCE_KM = 5.0;

      // Base de datos de Códigos Postales en radio <= 5 km de Narvarte Poniente
      static VALID_POSTAL_CODES = COVERAGE_POSTAL_CODES;

      /**
       * Calcula distancia geodésica en kilómetros con fórmula de Haversine
       */
      static calculateDistanceKm(lat2, lon2) {
        if (typeof lat2 !== 'number' || typeof lon2 !== 'number') return null;
        const R = 6371.0;
        const dLat = (lat2 - this.STORE_LAT) * Math.PI / 180;
        const dLon = (lon2 - this.STORE_LON) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.STORE_LAT * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
      }

      /**
       * Valida un código postal de 5 dígitos contra la base de cobertura
       */
      static checkPostalCode(cp) {
        const clean = String(cp || '').trim();
        if (!/^\d{5}$/.test(clean)) {
          return { validFormat: false, covered: false, message: 'Ingresa un código postal válido de 5 dígitos.' };
        }
        if (this.VALID_POSTAL_CODES[clean]) {
          return {
            validFormat: true,
            covered: true,
            colonia: this.VALID_POSTAL_CODES[clean],
            message: `¡C.P. ${clean} con cobertura de entrega directa (< 5 km)! (${this.VALID_POSTAL_CODES[clean]}).`
          };
        }
        return {
          validFormat: true,
          covered: false,
          message: `El C.P. ${clean} supera nuestro radio máximo de entrega directa de 5 km.`
        };
      }
    }

    /**
     * Cart Service (SRP: Gestión de Pedido, Modalidad de Entrega y Generación de WhatsApp)
     */
