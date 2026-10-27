/**
 * Filter Service (SRP: Búsqueda y filtrado de categorías)
 */
export class CatalogFilterService {
      constructor(items) {
        this.items = Array.isArray(items) ? items : [];
        this.activeCategory = "donas";
        this.searchQuery = "";
      }

      setCategory(cat) {
        if (typeof cat === 'string') {
          this.activeCategory = cat.trim();
        }
      }

      setSearch(query) {
        this.searchQuery = (typeof query === 'string' ? query : '').toLowerCase().trim();
      }

      getFilteredItems() {
        return this.items.filter(product => {
          const matchesCategory = !this.activeCategory || product.category === this.activeCategory;
          const matchesSearch = !this.searchQuery || 
            product.name.toLowerCase().includes(this.searchQuery) ||
            product.presentations.some(p => p.label.toLowerCase().includes(this.searchQuery));
          return matchesCategory && matchesSearch;
        });
      }
    }

    /**
     * Coverage Service (SRP: Validación Geográfica y Códigos Postales en Radio de 5 km)
     */
