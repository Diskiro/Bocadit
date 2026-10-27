/**
 * UI Renderer (SRP: Renderizado Fiel y Unificado de Tarjetas, Drawer y Admin)
 */
export class CatalogRenderer {
      static renderGrid(items, container, onChooseItem) {
        if (!container) return;
        if (!items || items.length === 0) {
          container.innerHTML = '';
          const emptyState = document.getElementById('emptyState');
          if (emptyState) emptyState.style.display = 'block';
          return;
        }

        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = items.map(product => {
          const selectedPortion = product.presentations[0];
          const badgeHtml = product.badge 
            ? `<div class="card-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/></svg> <span>${product.badge}</span></div>`
            : '';

          const chipsHtml = product.presentations.map((p, idx) => `
            <button class="portion-chip ${idx === 0 ? 'active' : ''}" 
                    data-product-id="${product.id}" 
                    data-portion="${p.portion}"
                    aria-label="Seleccionar ${p.label}">
              <span class="chip-title">${p.label} · $${p.price}</span>
              <span class="chip-currency">MXN</span>
            </button>
          `).join('');

          return `
            <article class="product-card" data-product-id="${product.id}" id="card-${product.id}">
              <div class="card-photo-box">
                ${badgeHtml}
                <img src="${selectedPortion.image}" alt="${product.name} Bocadit" class="card-img" id="img-${product.id}" loading="lazy" onerror="this.onerror=null; this.src='assets/hero_donuts.jpg';">
              </div>
              <div class="card-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-sub">Elige tu presentación</p>

                <div class="portion-selector" role="group" aria-label="Presentaciones disponibles">
                  ${chipsHtml}
                </div>

                <button class="btn-choose" data-product-id="${product.id}" aria-label="Elegir ${product.name}">
                  <span>Elegir</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </article>
          `;
        }).join('');

        // Selector de porciones en tarjetas
        container.querySelectorAll('.portion-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const card = chip.closest('.product-card');
            const productId = chip.dataset.productId;
            const portion = chip.dataset.portion;
            const product = items.find(p => p.id === productId);
            if (!product) return;

            // Marcar chip activo
            card.querySelectorAll('.portion-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Actualizar foto según presentación elegida
            const pres = product.presentations.find(p => p.portion === portion);
            if (pres) {
              const imgEl = document.getElementById(`img-${productId}`);
              if (imgEl && pres.image) imgEl.src = pres.image;
            }
          });
        });

        // Botón Elegir
        container.querySelectorAll('.btn-choose').forEach(btn => {
          btn.addEventListener('click', () => {
            const productId = btn.dataset.productId;
            const product = items.find(p => p.id === productId);
            if (!product) return;
            const card = document.getElementById(`card-${productId}`);
            const activeChip = card.querySelector('.portion-chip.active');
            const portion = activeChip ? activeChip.dataset.portion : product.presentations[0].portion;
            const presentation = product.presentations.find(p => p.portion === portion) || product.presentations[0];
            onChooseItem(product, presentation);

            // Micro-feedback visual sin abrir el drawer abruptamente
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<span>¡Agregado!</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            btn.style.background = 'var(--color-pink-deep)';
            btn.style.color = '#fff';
            setTimeout(() => {
              btn.innerHTML = originalHtml;
              btn.style.background = '';
              btn.style.color = '';
            }, 900);
          });
        });
      }

      static renderDrawer(cart, listContainer, totalContainer, whatsappBtn, cartService) {
        if (!listContainer || !totalContainer) return;
        const deliveryCard = document.getElementById('deliveryCard');
        if (cart.length === 0) {
          listContainer.innerHTML = `
            <div style="text-align:center; padding:40px 10px; color:var(--color-chocolate-muted);">
              <p style="font-size:14px;">Aún no has agregado antojos a tu pedido.</p>
              <p style="font-size:12px; margin-top:4px;">Selecciona tus donas favoritas y presiona "Elegir".</p>
            </div>
          `;
          totalContainer.textContent = "$0 MXN";
          if (deliveryCard) deliveryCard.style.display = 'none';
          this.updateCheckoutState(whatsappBtn, cartService);
          return;
        }

        if (deliveryCard) deliveryCard.style.display = 'flex';

        listContainer.innerHTML = cart.map(item => `
          <div class="cart-item-card">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.onerror=null; this.src='assets/hero_donuts.jpg';">
            <div class="cart-item-info">
              <h4 class="cart-item-name">${item.name}</h4>
              <p class="cart-item-meta">${item.portionLabel} · $${item.price} MXN</p>
            </div>
            <div class="cart-item-qty">
              <button class="btn-qty btn-minus" data-id="${item.productId}" data-portion="${item.portion}">-</button>
              <span style="font-size:13px; font-weight:700; min-width:16px; text-align:center;">${item.qty}</span>
              <button class="btn-qty btn-plus" data-id="${item.productId}" data-portion="${item.portion}">+</button>
            </div>
          </div>
        `).join('');

        totalContainer.textContent = `$${cartService.getTotal()} MXN`;
        this.updateCheckoutState(whatsappBtn, cartService);

        // Controladores + / -
        listContainer.querySelectorAll('.btn-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            cartService.updateQty(btn.dataset.id, btn.dataset.portion, -1);
          });
        });

        listContainer.querySelectorAll('.btn-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            cartService.updateQty(btn.dataset.id, btn.dataset.portion, 1);
          });
        });
      }

      static updateCheckoutState(whatsappBtn, cartService) {
        if (!whatsappBtn || !cartService) return;
        const check = cartService.canCheckout();
        const spanText = whatsappBtn.querySelector('span');
        if (check.ok) {
          whatsappBtn.href = cartService.generateWhatsAppUrl();
          whatsappBtn.classList.remove('disabled');
          if (spanText) spanText.textContent = "Confirmar por WhatsApp";
        } else {
          whatsappBtn.href = "#";
          whatsappBtn.classList.add('disabled');
          if (spanText) spanText.textContent = check.msg;
        }
      }

      static renderAdminTable(products, tableBody) {
        if (!tableBody) return;
        tableBody.innerHTML = products.map((p, idx) => {
          const presText = p.presentations.map(pr => `${pr.label}: $${pr.price} ${pr.currency}`).join(' | ');
          return `
            <tr>
              <td>#${idx + 1}</td>
              <td style="font-weight:600;">${p.name}</td>
              <td style="text-transform:capitalize;">${p.category}</td>
              <td>${p.presentations.map(pr => pr.label).join(', ')}</td>
              <td style="font-weight:700; color:var(--color-chocolate);">${presText}</td>
            </tr>
          `;
        }).join('');
      }
    }

    /**
     * Orquestación de la Aplicación
     */
