import { CATALOG_PRODUCTS } from './data/products.js';
import { CatalogFilterService } from './services/CatalogFilterService.js';
import { CoverageService } from './services/CoverageService.js';
import { CartService } from './services/CartService.js';
import { GeocodingService } from './services/GeocodingService.js';
import { CatalogRenderer } from './ui/CatalogRenderer.js';

/**
 * Orquestación de la Aplicación Bocadit
 */
document.addEventListener('DOMContentLoaded', () => {
      const filterService = new CatalogFilterService(CATALOG_PRODUCTS);
      const cartService = new CartService();

      // Referencias DOM
      const gridContainer = document.getElementById('productsGrid');
      const searchInput = document.getElementById('catalogSearch');
      const catButtons = document.querySelectorAll('.cat-btn');
      const floatingCart = document.getElementById('floatingCartBtn');
      const cartCountBadge = document.getElementById('cartCountBadge');
      const cartTotalSummary = document.getElementById('cartTotalSummary');
      const drawerOverlay = document.getElementById('drawerOverlay');
      const btnCloseDrawer = document.getElementById('btnCloseDrawer');
      const cartItemsList = document.getElementById('cartItemsList');
      const drawerTotalText = document.getElementById('drawerTotalText');
      const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
      const btnHeaderOrder = document.getElementById('btnHeaderOrder');
      
      // Delivery elements
      const btnMethodPickup = document.getElementById('btnMethodPickup');
      const btnMethodDelivery = document.getElementById('btnMethodDelivery');
      const panelPickup = document.getElementById('panelPickup');
      const panelDelivery = document.getElementById('panelDelivery');
      const pickupCustomerName = document.getElementById('pickupCustomerName');
      const btnDetectGps = document.getElementById('btnDetectGps');
      const btnGpsText = document.getElementById('btnGpsText');
      const inputPostalCode = document.getElementById('inputPostalCode');
      const btnValidateCP = document.getElementById('btnValidateCP');
      const coverageStatusAlert = document.getElementById('coverageStatusAlert');
      const addressFieldsGroup = document.getElementById('addressFieldsGroup');
      const deliveryCustomerName = document.getElementById('deliveryCustomerName');
      const deliveryStreet = document.getElementById('deliveryStreet');
      const deliveryColonia = document.getElementById('deliveryColonia');
      const deliveryReference = document.getElementById('deliveryReference');

      // Admin elements
      const btnOpenAdmin = document.getElementById('btnOpenAdmin');
      const adminModal = document.getElementById('adminModal');
      const btnCloseAdmin = document.getElementById('btnCloseAdmin');
      const adminTableBody = document.getElementById('adminTableBody');
      const btnAdminCopy = document.getElementById('btnAdminCopy');
      const btnAdminCSV = document.getElementById('btnAdminCSV');

      // Actualizar catálogo
      const refreshCatalog = () => {
        const filtered = filterService.getFilteredItems();
        CatalogRenderer.renderGrid(filtered, gridContainer, (product, presentation) => {
          cartService.addItem(product, presentation);
        });
      };

      // Buscador
      searchInput.addEventListener('input', (e) => {
        filterService.setSearch(e.target.value);
        refreshCatalog();
      });

      // Filtros de categoría
      catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          catButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          filterService.setCategory(btn.dataset.category);
          refreshCatalog();
        });
      });

      // Suscripción de carrito
      cartService.subscribe(cart => {
        const count = cartService.getCount();
        const total = cartService.getTotal();
        cartCountBadge.textContent = count;
        cartTotalSummary.textContent = `$${total} MXN`;
        
        if (count > 0) {
          floatingCart.classList.add('visible');
        } else {
          floatingCart.classList.remove('visible');
        }

        CatalogRenderer.renderDrawer(cart, cartItemsList, drawerTotalText, btnSendWhatsApp, cartService);
      });

      // Drawer controls
      floatingCart.addEventListener('click', () => drawerOverlay.classList.add('open'));
      btnHeaderOrder.addEventListener('click', () => {
        if (cartService.getCount() === 0) {
          document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
        } else {
          drawerOverlay.classList.add('open');
        }
      });
      btnCloseDrawer.addEventListener('click', () => drawerOverlay.classList.remove('open'));
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
      });

      // Delivery mode toggle
      const updateMethodUI = (method) => {
        cartService.setDeliveryMethod(method);
        if (method === 'pickup') {
          btnMethodPickup.classList.add('active');
          btnMethodPickup.setAttribute('aria-selected', 'true');
          btnMethodDelivery.classList.remove('active');
          btnMethodDelivery.setAttribute('aria-selected', 'false');
          panelPickup.style.display = 'flex';
          panelDelivery.style.display = 'none';
        } else {
          btnMethodDelivery.classList.add('active');
          btnMethodDelivery.setAttribute('aria-selected', 'true');
          btnMethodPickup.classList.remove('active');
          btnMethodPickup.setAttribute('aria-selected', 'false');
          panelPickup.style.display = 'none';
          panelDelivery.style.display = 'flex';
        }
        CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
      };

      btnMethodPickup.addEventListener('click', () => updateMethodUI('pickup'));
      btnMethodDelivery.addEventListener('click', () => updateMethodUI('delivery'));

      // Pickup customer name
      pickupCustomerName.addEventListener('input', (e) => {
        cartService.updateDeliveryData({ pickupName: e.target.value });
        CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
      });

      // GPS Detection
      btnDetectGps.addEventListener('click', () => {
        if (!navigator.geolocation) {
          coverageStatusAlert.className = 'coverage-status-alert error';
          coverageStatusAlert.textContent = 'Tu navegador no soporta geolocalización. Ingresa tu Código Postal abajo.';
          coverageStatusAlert.style.display = 'block';
          return;
        }

        btnGpsText.textContent = 'Detectando ubicación...';
        btnDetectGps.disabled = true;

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            btnGpsText.textContent = 'Detectando dirección...';
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const dist = CoverageService.calculateDistanceKm(lat, lon);

            if (dist !== null && dist <= CoverageService.MAX_DISTANCE_KM) {
              cartService.updateDeliveryData({
                isCoverageValid: true,
                distanceKm: dist,
                gpsCoords: { lat, lon }
              });

              coverageStatusAlert.className = 'coverage-status-alert success';
              coverageStatusAlert.innerHTML = `<strong>✅ ¡Ubicación confirmada!</strong> Estás a ~${dist} km de la tienda (dentro de los 5 km). Obteniendo dirección...`;
              coverageStatusAlert.style.display = 'block';

              // Autocompletar dirección mediante Reverse Geocoding
              try {
                const geo = await GeocodingService.reverseGeocode(lat, lon);
                if (geo.success) {
                  if (geo.street) {
                    deliveryStreet.value = geo.street;
                  }
                  if (geo.colonia) {
                    deliveryColonia.value = geo.colonia;
                  }
                  if (geo.postalCode) {
                    inputPostalCode.value = geo.postalCode;
                    const cpRes = CoverageService.checkPostalCode(geo.postalCode);
                    if (cpRes.covered && cpRes.colonia && !deliveryColonia.value.trim()) {
                      deliveryColonia.value = cpRes.colonia;
                    }
                  }

                  coverageStatusAlert.innerHTML = `
                    <strong>✅ ¡Ubicación confirmada!</strong> Estás a <strong>~${dist} km</strong> de nuestra tienda.<br>
                    <span class="gps-autofill-hint">📍 <em>Dirección sugerida por GPS autocompletada. Puedes editar o ajustar tu calle, número exterior/interior si es necesario.</em></span>
                  `;
                } else {
                  coverageStatusAlert.innerHTML = `<strong>✅ ¡Ubicación confirmada!</strong> Estás a ~${dist} km de la tienda (dentro de los 5 km). Completa los campos de tu dirección para el repartidor:`;
                }
              } catch (e) {
                coverageStatusAlert.innerHTML = `<strong>✅ ¡Ubicación confirmada!</strong> Estás a ~${dist} km de la tienda (dentro de los 5 km). Completa los campos de tu dirección para el repartidor:`;
              }

              // Sincronizar todos los campos autocompletados
              handleAddressChange();
            } else {
              coverageStatusAlert.className = 'coverage-status-alert error';
              coverageStatusAlert.innerHTML = `<strong>⚠️ Fuera de zona de entrega directa:</strong> Tu ubicación está a <strong>~${dist} km</strong> de nuestra tienda (límite 5 km). Puedes seleccionar <em>'Recoger en tienda'</em> o cotizar por Uber Flash / Didi Entrega.`;
              coverageStatusAlert.style.display = 'block';

              cartService.updateDeliveryData({
                isCoverageValid: false,
                distanceKm: dist,
                gpsCoords: null
              });
            }

            btnGpsText.textContent = 'Detectar mi ubicación (GPS)';
            btnDetectGps.disabled = false;
            CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
          },
          (err) => {
            btnGpsText.textContent = 'Detectar mi ubicación (GPS)';
            btnDetectGps.disabled = false;
            coverageStatusAlert.className = 'coverage-status-alert info';
            coverageStatusAlert.textContent = 'No fue posible acceder a tu GPS. Por favor ingresa tu Código Postal abajo para validar cobertura.';
            coverageStatusAlert.style.display = 'block';
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      // Postal Code validation
      const runPostalCodeValidation = () => {
        const cp = inputPostalCode.value.trim();
        const res = CoverageService.checkPostalCode(cp);

        if (res.covered) {
          coverageStatusAlert.className = 'coverage-status-alert success';
          coverageStatusAlert.innerHTML = `<strong>✅ ¡C.P. en cobertura!</strong> ${res.message} Completa tu calle y número abajo para tu entrega.`;
          coverageStatusAlert.style.display = 'block';
          
          if (!deliveryColonia.value.trim() && res.colonia) {
            deliveryColonia.value = res.colonia;
          }

          cartService.updateDeliveryData({
            isCoverageValid: true,
            postalCode: cp,
            colonia: deliveryColonia.value.trim() || res.colonia
          });
        } else {
          coverageStatusAlert.className = 'coverage-status-alert error';
          coverageStatusAlert.innerHTML = `<strong>⚠️ Fuera de radio de cobertura:</strong> ${res.message} Te recomendamos seleccionar <em>'Recoger en tienda'</em> (Xochicalco 79).`;
          coverageStatusAlert.style.display = 'block';

          cartService.updateDeliveryData({
            isCoverageValid: false,
            postalCode: cp
          });
        }
        CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
      };

      btnValidateCP.addEventListener('click', runPostalCodeValidation);
      inputPostalCode.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        cartService.updateDeliveryData({ postalCode: val });
        if (val.length === 5) {
          runPostalCodeValidation();
        } else if (val.length === 0) {
          coverageStatusAlert.style.display = 'none';
          cartService.updateDeliveryData({ isCoverageValid: false });
          CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
        }
      });
      inputPostalCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          runPostalCodeValidation();
        }
      });

      // Address fields listeners
      const handleAddressChange = () => {
        cartService.updateDeliveryData({
          customerName: deliveryCustomerName.value,
          street: deliveryStreet.value,
          colonia: deliveryColonia.value,
          reference: deliveryReference.value
        });
        CatalogRenderer.updateCheckoutState(btnSendWhatsApp, cartService);
      };

      deliveryCustomerName.addEventListener('input', handleAddressChange);
      deliveryStreet.addEventListener('input', handleAddressChange);
      deliveryColonia.addEventListener('input', handleAddressChange);
      deliveryReference.addEventListener('input', handleAddressChange);

      // Admin Modal & Tools
      if (btnOpenAdmin) {
        btnOpenAdmin.addEventListener('click', () => {
          CatalogRenderer.renderAdminTable(CATALOG_PRODUCTS, adminTableBody);
          adminModal.classList.add('open');
        });
      }
      if (btnCloseAdmin) {
        btnCloseAdmin.addEventListener('click', () => adminModal?.classList.remove('open'));
      }
      if (adminModal) {
        adminModal.addEventListener('click', (e) => {
          if (e.target === adminModal) adminModal.classList.remove('open');
        });
      }

      btnAdminCopy.addEventListener('click', () => {
        let text = "MENÚ BOCADIT MINI DONAS\n====================\n\n";
        CATALOG_PRODUCTS.forEach(p => {
          text += `${p.name} (${p.category}):\n`;
          p.presentations.forEach(pr => {
            text += `  • ${pr.label}: $${pr.price} ${pr.currency}\n`;
          });
        });
        navigator.clipboard.writeText(text).then(() => {
          alert("Lista de precios copiada al portapapeles.");
        });
      });

      btnAdminCSV.addEventListener('click', () => {
        const rows = [["Producto", "Categoría", "Presentación", "Precio", "Moneda"]];
        CATALOG_PRODUCTS.forEach(p => {
          p.presentations.forEach(pr => {
            rows.push([`"${p.name}"`, p.category, `"${pr.label}"`, pr.price, pr.currency]);
          });
        });
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(r => r.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bocadit_catalogo_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Render inicial
      refreshCatalog();
    });
