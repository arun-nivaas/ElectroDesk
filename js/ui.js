/**
 * UI Manipulation Logic
 */

const uiService = {
  
  /**
   * Set error state on input field
   */
  setFieldError(inputEl, message) {
    const errorEl = inputEl.parentElement.nextElementSibling;
    if (message) {
      inputEl.classList.add('error');
      if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
    } else {
      inputEl.classList.remove('error');
      if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
      }
    }
  },

  /**
   * Toggle Password Visibility
   */
  togglePasswordVisibility(buttonEl) {
    const inputEl = buttonEl.previousElementSibling.previousElementSibling; // icon is between input and btn if absolute pos
    // Wait, the structure is: input, input-icon (absolute left), input-action (absolute right)
    // Actually the button is a sibling in `.input-wrapper`
    const wrapper = buttonEl.closest('.input-wrapper');
    const input = wrapper.querySelector('input');
    
    if (input.type === 'password') {
      input.type = 'text';
      // simple change text or svg icon path
      buttonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
      input.type = 'password';
      buttonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
  },

  /**
   * Select Account Role Logic
   */
  selectRole(roleOptionEl) {
    // Remove selected from all
    const allOptions = document.querySelectorAll('.role-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add to clicked
    roleOptionEl.classList.add('selected');
    
    // Check inner radio
    const radio = roleOptionEl.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
    }

    // Hide global error if present
    this.hideGlobalAlert();
  },

  /**
   * Button loading state
   */
  setLoadingState(buttonEl, isLoading) {
    const spinner = buttonEl.querySelector('.spinner');
    const btnText = buttonEl.querySelector('.btn-text');
    
    if (isLoading) {
      buttonEl.disabled = true;
      if (spinner) spinner.classList.add('show');
      if (btnText) btnText.parentElement.style.opacity = '0.8';
    } else {
      buttonEl.disabled = false;
      if (spinner) spinner.classList.remove('show');
      if (btnText) btnText.parentElement.style.opacity = '1';
    }
  },

  /**
   * Show global alert message
   */
  showGlobalAlert(message, type = 'error') {
    let alertEl = document.getElementById('global-alert');
    
    if (!alertEl) {
      const formWrapper = document.querySelector('.auth-wrapper') || document.querySelector('.modal-content') || document.body;
      alertEl = document.createElement('div');
      alertEl.id = 'global-alert';
      if (formWrapper.children && formWrapper.children.length > 1) {
         formWrapper.insertBefore(alertEl, formWrapper.children[1]);
      } else {
         formWrapper.appendChild(alertEl);
      }
    }

    alertEl.style.display = ''; // Clear any inline hidden flags
    alertEl.className = `alert alert-${type} show`;
    
    const iconStr = type === 'error' 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    alertEl.innerHTML = `${iconStr} <span>${message}</span>`;
  },

  hideGlobalAlert() {
    const alertEl = document.getElementById('global-alert');
    if (alertEl) {
      alertEl.classList.remove('show');
    }
  },

  showGlobalError(msg) { this.showGlobalAlert(msg, 'error'); },
  showGlobalSuccess(msg) { this.showGlobalAlert(msg, 'success'); },

  /**
   * Render Product Table rows
   */
  renderProductTable(products, tbodyEl) {
    tbodyEl.innerHTML = ''; // clear

    if (!products || products.length === 0) {
      tbodyEl.innerHTML = `<tr><td colspan="5" class="text-center">No products found.</td></tr>`;
      return;
    }

    products.forEach(p => {
      const tr = document.createElement('tr');
      // Format price with INR symbol safely
      const price = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p.price);

      tr.innerHTML = `
        <td>
          <div class="product-name">${p.name || 'Unknown Product'}</div>
          <div class="product-specs">${p.specification || '-'}</div>
        </td>
        <td class="product-brand">${p.brand || '-'}</td>
        <td class="product-category">${p.category || '-'}</td>
        <td class="product-unit">${p.unit || 'pc'}</td>
        <td class="product-price">${price}</td>
      `;
      tbodyEl.appendChild(tr);
    });
  },

  /**
   * Render total product count
   */
  renderTotalCount(count, countEl) {
    if (countEl) {
      countEl.textContent = new Intl.NumberFormat('en-US').format(count);
    }
  },

  /**
   * Show table loading state
   */
  setTableLoading(tbodyEl, isLoading, colspan = 5) {
    if (isLoading) {
      tbodyEl.innerHTML = `<tr><td colspan="${colspan}" class="text-center" style="padding: 3rem;"><span class="spinner show" style="border-top-color: var(--primary);"></span></td></tr>`;
    }
  },

  /**
   * Render Admin Product Table rows
   */
  renderAdminTable(products, tbodyEl) {
    tbodyEl.innerHTML = ''; 

    if (!products || products.length === 0) {
      tbodyEl.innerHTML = `<tr><td colspan="6" class="text-center">No products found.</td></tr>`;
      return;
    }

    products.forEach(p => {
      const pId = p.id || p._id || p.product_id;
      const tr = document.createElement('tr');
      const price = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p.price || 0);
      
      const productDataStr = encodeURIComponent(JSON.stringify(p));

      tr.innerHTML = `
        <td>
          <div class="product-name">${p.name || 'Unknown Product'}</div>
          <div class="product-specs">${p.specification || '-'}</div>
        </td>
        <td class="product-brand">${p.brand || '-'}</td>
        <td class="product-category">${p.category || '-'}</td>
        <td class="product-unit">${p.unit || 'pc'}</td>
        <td class="product-price">${price}</td>
        <td>
          <div style="display: flex; gap: 0.75rem; align-items: center; justify-content: center;">
            <button class="icon-btn edit-product-btn" aria-label="Edit" data-product="${productDataStr}" title="Edit" style="color: var(--text-muted); padding: 4px; display: flex;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="icon-btn delete-product-btn" aria-label="Delete" data-id="${pId}" data-name="${(p.name || '').replace(/"/g, '&quot;')}" style="color: var(--text-muted); padding: 4px; display: flex;" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      `;
      tbodyEl.appendChild(tr);
    });
  },

  /**
   * Modal Management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      // Set focus to first input
      setTimeout(() => {
        const firstInput = modal.querySelector('input:not([type="hidden"])');
        if (firstInput) firstInput.focus();
      }, 50);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      if (modalId === 'product-modal') {
        window.uiService.hideGlobalAlert();
      }
    }
  },

  openAddProductModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('product-id').value = '';
    
    this.openModal('product-modal');
  },

  openEditProductModal(product) {
    const form = document.getElementById('product-form');
    if (form) form.reset();

    document.getElementById('modal-title').textContent = 'Edit Product';
    // fill fields
    document.getElementById('product-id').value = product.id || product._id || product.product_id || '';
    document.getElementById('field-name').value = product.name || '';
    document.getElementById('field-brand').value = product.brand || '';
    document.getElementById('field-specification').value = product.specification || '';
    document.getElementById('field-unit').value = product.unit || '';
    document.getElementById('field-price').value = product.price || '';
    document.getElementById('field-category').value = product.category || '';

    this.openModal('product-modal');
  },

  showConfirmDelete(id, name) {
    const confirmSpan = document.getElementById('delete-product-name');
    if (confirmSpan) confirmSpan.textContent = name;
    
    const confirmBtn = document.getElementById('confirm-delete-btn');
    if (confirmBtn) confirmBtn.dataset.id = id;

    this.openModal('delete-confirm-modal');
  },

  /**
   * Render Pagination Controls
   */
  renderPagination(total, currentPage, itemsPerPage, onPageChange) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(total / itemsPerPage) || 1;
    const startCount = total === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
    const endCount = Math.min(currentPage * itemsPerPage, total);

    const infoDiv = paginationContainer.querySelector('div:first-child');
    if (infoDiv) {
      infoDiv.innerHTML = `Showing <span style="font-weight: 600;">${startCount}-${endCount} of ${total}</span> results`;
    }

    const controlsContainer = paginationContainer.querySelector('.page-controls');
    if (!controlsContainer) return;

    controlsContainer.innerHTML = '';

    const appendBtn = (text, pageOrClass, disabled = false, onclickFn = null, iconHTML = null) => {
      const btn = document.createElement('button');
      btn.className = typeof pageOrClass === 'string' ? pageOrClass : `page-btn ${pageOrClass === currentPage ? 'active' : ''}`;
      
      if (iconHTML) btn.innerHTML = iconHTML;
      else btn.textContent = text;
      
      if (disabled) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
      }
      
      if (onclickFn && !disabled) {
          btn.onclick = onclickFn;
      }
      
      controlsContainer.appendChild(btn);
    };

    appendBtn('', 'page-btn', currentPage === 1, () => onPageChange(currentPage - 1), `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`);

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage - startPage < 2 && totalPages >= 3) {
      startPage = Math.max(1, endPage - 2);
    }

    if (startPage > 1) {
      appendBtn('1', 1, false, () => onPageChange(1));
      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.style = "display: flex; align-items: center; justify-content: center; width: 32px;";
        dots.textContent = '...';
        controlsContainer.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
       appendBtn(String(i), i, false, () => onPageChange(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.style = "display: flex; align-items: center; justify-content: center; width: 32px;";
        dots.textContent = '...';
        controlsContainer.appendChild(dots);
      }
      appendBtn(String(totalPages), totalPages, false, () => onPageChange(totalPages));
    }

    appendBtn('', 'page-btn', currentPage === totalPages || totalPages === 0, () => onPageChange(currentPage + 1), `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`);
  }
};

window.uiService = uiService;
