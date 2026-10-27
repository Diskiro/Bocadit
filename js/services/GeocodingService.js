/**
 * GeocodingService (SRP: Conversión de Coordenadas GPS a Dirección y Validación de Inputs)
 * Responsabilidad Única: Realizar geocodificación inversa (Reverse Geocoding) segura,
 * con validación rigurosa de coordenadas, control de timeout y fallback entre servicios.
 */
export class GeocodingService {
  static TIMEOUT_MS = 4000;

  /**
   * Valida estrictamente que las coordenadas sean números válidos dentro de los límites terrestres.
   * @param {number} lat - Latitud (-90 a 90)
   * @param {number} lon - Longitud (-180 a 180)
   * @returns {boolean}
   */
  static isValidCoordinates(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') return false;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lon < -180 || lon > 180) return false;
    return true;
  }

  /**
   * Normaliza un código postal a formato de 5 dígitos si es válido
   * @param {string|number} rawPostcode
   * @returns {string}
   */
  static sanitizePostalCode(rawPostcode) {
    if (!rawPostcode) return '';
    const match = String(rawPostcode).trim().match(/\b\d{5}\b/);
    return match ? match[0] : '';
  }

  /**
   * Intenta geocodificación inversa con Photon (OpenStreetMap)
   * @private
   */
  static async fetchFromPhoton(lat, lon, signal) {
    const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Photon HTTP Error: ${res.status}`);
    const data = await res.json();
    const props = data?.features?.[0]?.properties;
    if (!props) return null;

    let street = '';
    if (props.street) {
      street = props.housenumber ? `${props.street} ${props.housenumber}` : props.street;
    } else if (props.name && props.type === 'street') {
      street = props.name;
    }

    const coloniaParts = [props.locality || props.district, props.city].filter(Boolean);
    const colonia = coloniaParts.join(', ');
    const postalCode = this.sanitizePostalCode(props.postcode);

    return {
      street: street.trim(),
      postalCode,
      colonia: colonia.trim(),
      source: 'photon'
    };
  }

  /**
   * Fallback secundario con BigDataCloud
   * @private
   */
  static async fetchFromBigDataCloud(lat, lon, signal) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=es`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`BigDataCloud HTTP Error: ${res.status}`);
    const data = await res.json();
    if (!data) return null;

    const postalCode = this.sanitizePostalCode(data.postcode);
    const colonia = [data.locality, data.principalSubdivision].filter(Boolean).join(', ');

    return {
      street: '',
      postalCode,
      colonia: colonia.trim(),
      source: 'bigdatacloud'
    };
  }

  /**
   * Ejecuta geocodificación inversa con timeout y fallback.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<{success: boolean, street: string, postalCode: string, colonia: string, message?: string}>}
   */
  static async reverseGeocode(lat, lon) {
    if (!this.isValidCoordinates(lat, lon)) {
      return {
        success: false,
        street: '',
        postalCode: '',
        colonia: '',
        message: 'Coordenadas geográficas inválidas o fuera de rango.'
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      // 1. Intento primario con Photon
      try {
        const photonResult = await this.fetchFromPhoton(lat, lon, controller.signal);
        if (photonResult && (photonResult.street || photonResult.postalCode || photonResult.colonia)) {
          clearTimeout(timeoutId);
          return {
            success: true,
            street: photonResult.street || '',
            postalCode: photonResult.postalCode || '',
            colonia: photonResult.colonia || '',
            source: 'photon'
          };
        }
      } catch (err) {
        // Fallback a siguiente proveedor si no fue abortado por timeout global
        if (controller.signal.aborted) throw err;
      }

      // 2. Fallback con BigDataCloud
      const bdcResult = await this.fetchFromBigDataCloud(lat, lon, controller.signal);
      clearTimeout(timeoutId);

      if (bdcResult) {
        return {
          success: true,
          street: bdcResult.street || '',
          postalCode: bdcResult.postalCode || '',
          colonia: bdcResult.colonia || '',
          source: 'bigdatacloud'
        };
      }

      return {
        success: false,
        street: '',
        postalCode: '',
        colonia: '',
        message: 'No se encontraron datos de dirección para estas coordenadas.'
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        street: '',
        postalCode: '',
        colonia: '',
        message: error.name === 'AbortError' 
          ? 'Tiempo de espera agotado al consultar el servicio de mapa.' 
          : 'Error al consultar la dirección aproximada.'
      };
    }
  }
}
