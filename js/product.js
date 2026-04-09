/**
 * Product Data Management Logic
 */

const productService = (() => {
  
  let masterProducts = [];
  let currentProducts = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  let debounceTimer;

  const renderCurrentPage = () => {
    const tbodyEl = document.getElementById('product-table-body');
    if (!tbodyEl) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = currentProducts.slice(startIndex, endIndex);

    const isAdminLayout = document.getElementById('add-product-btn') !== null || window.location.pathname.includes('admin');
    if (isAdminLayout) {
      if (window.uiService.renderAdminTable) window.uiService.renderAdminTable(paginatedItems, tbodyEl);
    } else {
      if (window.uiService.renderProductTable) window.uiService.renderProductTable(paginatedItems, tbodyEl);
    }
    
    if (window.uiService.renderPagination) {
      window.uiService.renderPagination(currentProducts.length, currentPage, itemsPerPage, (newPage) => {
        currentPage = newPage;
        renderCurrentPage();
      });
    }
  };

  const applySearchFilter = () => {
    const searchInput = document.getElementById('search-products');
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    
    if (!query) {
      currentProducts = [...masterProducts];
    } else {
      currentProducts = masterProducts.filter(p => {
        return (p.name && p.name.toLowerCase().includes(query)) ||
               (p.brand && p.brand.toLowerCase().includes(query)) ||
               (p.category && p.category.toLowerCase().includes(query)) ||
               (p.specification && p.specification.toLowerCase().includes(query));
      });
    }
    
    currentPage = 1;
    renderCurrentPage();

    const countEl = document.getElementById('total-product-count');
    if (countEl) window.uiService.renderTotalCount(currentProducts.length, countEl);
  };

  /**
   * Load products and trigger UI updates
   */
  const loadProducts = async () => {
    const tbodyEl = document.getElementById('product-table-body');
    if (tbodyEl) window.uiService.setTableLoading(tbodyEl, true);

    const response = await window.apiService.getProducts();
    
    if (response.success) {
      let products = [];

      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data && response.data.products) {
        products = response.data.products;
      } else if (response.data && response.data.items) {
        products = response.data.items;
      }

      masterProducts = products;
      applySearchFilter();

    } else {
      if (tbodyEl) {
        tbodyEl.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--error);">Error loading products: ${response.error}</td></tr>`;
      }
    }
  };

  /**
   * Instant Client-Side Search
   */
  const handleSearch = (event) => {
    applySearchFilter();
  };

  return {
    loadProducts,
    handleSearch
  };

})();

window.productService = productService;
