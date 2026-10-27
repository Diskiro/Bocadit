/**
 * Cart Service (SRP: Gestión de Pedido, Modalidad de Entrega y Generación de WhatsApp)
 */
export class CartService {
      constructor() {
        this.cart = [];
        this.listeners = [];
        this.delivery = {
          method: 'pickup', // 'pickup' | 'delivery'
          customerName: '',
          pickupName: '',
          street: '',
          colonia: '',
          reference: '',
          postalCode: '',
          distanceKm: null,
          gpsCoords: null,
          isCoverageValid: false
        };
      }

      subscribe(fn) {
        if (typeof fn === 'function') this.listeners.push(fn);
      }

      notify() {
        this.listeners.forEach(fn => fn(this.cart));
      }

      addItem(product, presentation) {
        if (!product || !presentation) return;
        const existing = this.cart.find(item => item.productId === product.id && item.portion === presentation.portion);
        if (existing) {
          existing.qty += 1;
        } else {
          this.cart.push({
            productId: product.id,
            name: product.name,
            portion: presentation.portion,
            portionLabel: presentation.label,
            price: presentation.price,
            image: presentation.image,
            qty: 1
          });
        }
        this.notify();
      }

      updateQty(productId, portion, delta) {
        const item = this.cart.find(i => i.productId === productId && i.portion === portion);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
          this.cart = this.cart.filter(i => !(i.productId === productId && i.portion === portion));
        }
        this.notify();
      }

      getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      }

      getCount() {
        return this.cart.reduce((sum, item) => sum + item.qty, 0);
      }

      setDeliveryMethod(method) {
        this.delivery.method = method === 'delivery' ? 'delivery' : 'pickup';
        this.notify();
      }

      updateDeliveryData(data) {
        Object.assign(this.delivery, data);
        this.notify();
      }

      canCheckout() {
        if (this.cart.length === 0) return { ok: false, msg: 'Agrega al menos un producto a tu pedido.' };
        if (this.delivery.method === 'pickup') {
          return { ok: true, msg: 'Listo para confirmar' };
        }
        // Delivery
        if (!this.delivery.isCoverageValid) {
          return { ok: false, msg: 'Verifica tu ubicación por GPS o C.P. dentro de los 5 km.' };
        }
        if (!this.delivery.customerName.trim()) {
          return { ok: false, msg: 'Ingresa el nombre de quien recibe.' };
        }
        if (!this.delivery.street.trim()) {
          return { ok: false, msg: 'Ingresa la calle y número de entrega.' };
        }
        return { ok: true, msg: 'Listo para confirmar' };
      }

      generateWhatsAppUrl() {
        const phone = "525615381502";
        if (this.cart.length === 0) {
          return `https://wa.me/${phone}?text=` + encodeURIComponent("¡Hola Bocadit! Me gustaría consultar su menú de mini donas.");
        }

        let msg = "¡Hola Bocadit! 🍩 Me gustaría hacer este pedido:\n\n";
        msg += "📋 *RESUMEN DE PRODUCTOS:*\n";
        this.cart.forEach(item => {
          msg += `• ${item.qty}x ${item.name} (${item.portionLabel}) - $${item.price * item.qty} MXN\n`;
        });
        msg += `\n💰 *Total a pagar: $${this.getTotal()} MXN*\n\n`;

        if (this.delivery.method === 'pickup') {
          msg += "━━━━━━━━━━━━━━━━━━━━\n";
          msg += "🏪 *MODALIDAD: Recoger en Tienda*\n";
          msg += "📍 *Sucursal:* Xochicalco 79, Narvarte Poniente, Benito Juárez, CDMX\n";
          if (this.delivery.pickupName.trim()) {
            msg += `👤 *A nombre de:* ${this.delivery.pickupName.trim()}\n`;
          }
        } else {
          msg += "━━━━━━━━━━━━━━━━━━━━\n";
          msg += "🛵 *MODALIDAD: Entrega a Domicilio (Cobertura < 5 km)*\n";
          if (this.delivery.customerName.trim()) {
            msg += `👤 *Recibe:* ${this.delivery.customerName.trim()}\n`;
          }
          msg += `📍 *Dirección:* ${this.delivery.street.trim()}\n`;
          if (this.delivery.colonia.trim() || this.delivery.postalCode.trim()) {
            msg += `🏘️ *Colonia / C.P.:* ${this.delivery.colonia.trim()}${this.delivery.postalCode ? ' (CP ' + this.delivery.postalCode + ')' : ''}\n`;
          }
          if (this.delivery.reference.trim()) {
            msg += `📝 *Referencias:* ${this.delivery.reference.trim()}\n`;
          }
          if (this.delivery.distanceKm) {
            msg += `📏 *Distancia a tienda:* ~${this.delivery.distanceKm} km\n`;
          }
          if (this.delivery.gpsCoords) {
            msg += `🗺️ *Ubicación Maps:* https://maps.google.com/?q=${this.delivery.gpsCoords.lat},${this.delivery.gpsCoords.lon}\n`;
          }
        }

        msg += "\n¿Me confirman disponibilidad y tiempo de entrega? ¡Muchas gracias!";
        return `https://wa.me/${phone}?text=` + encodeURIComponent(msg);
      }
    }

    /**
     * UI Renderer (SRP: Renderizado Fiel y Unificado de Tarjetas)
     */
