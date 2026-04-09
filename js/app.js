/**
 * Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Initialize Password Toggles
  const passwordToggles = document.querySelectorAll('.toggle-password');
  passwordToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.uiService.togglePasswordVisibility(btn);
    });
  });

  // 2. Initialize Role Selectors
  const roleOptions = document.querySelectorAll('.role-option');
  roleOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      window.uiService.selectRole(opt);
    });
  });

  // 3. Initialize Input Validation on Blur
  const inputs = document.querySelectorAll('input:not([type="radio"])');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      window.validationService.validateField(input);
    });
    input.addEventListener('input', () => {
      // Clear error as user types
      window.uiService.setFieldError(input, '');
    });
  });

  // 4. Attach Form Handlers
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      window.authService.handleLogin(e, loginForm);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      window.authService.handleRegister(e, registerForm);
    });
  }

  // 5. Initialize Viewer / Admin Page
  const isViewerPage = window.location.pathname.includes('viewer');
  const isAdminPage = window.location.pathname.includes('admin') || document.getElementById('add-product-btn') !== null;

  if (isViewerPage || isAdminPage) {
    if (window.productService) {
      // Intial load
      window.productService.loadProducts();

      // Bind search
      const searchInput = document.getElementById('search-products');
      if (searchInput) {
        searchInput.addEventListener('input', window.productService.handleSearch);
      }
    }

    // Bind logout
    const logoutBtn = document.getElementById('logout-btn');
    const topLogoutBtn = document.getElementById('top-logout-btn');
    
    const handleLogout = () => {
      if (window.authGuard) window.authGuard.logout();
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (topLogoutBtn) topLogoutBtn.addEventListener('click', handleLogout);

    if (isAdminPage) {
      const addBtn = document.getElementById('add-product-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (window.uiService.openAddProductModal) window.uiService.openAddProductModal();
        });
      }

      // Add a delegated event listener to tbody for edit/delete buttons
      const tbody = document.getElementById('product-table-body');
      if (tbody) {
        tbody.addEventListener('click', (e) => {
          const editBtn = e.target.closest('.edit-product-btn');
          if (editBtn) {
            try {
              const productStr = editBtn.getAttribute('data-product');
              const product = JSON.parse(decodeURIComponent(productStr));
              if (window.uiService.openEditProductModal) window.uiService.openEditProductModal(product);
            } catch (err) {
              console.error('Failed to parse product data', err);
            }
          }

          const deleteBtn = e.target.closest('.delete-product-btn');
          if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            const name = deleteBtn.getAttribute('data-name');
            if (window.uiService.showConfirmDelete) window.uiService.showConfirmDelete(id, name);
          }
        });
      }

      // Product Add/Edit Form submission
      const productForm = document.getElementById('product-form');
      if (productForm) {
        productForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          window.uiService.hideGlobalAlert();

          const saveBtn = document.getElementById('save-product-btn');
          if (saveBtn) window.uiService.setLoadingState(saveBtn, true);

          const formData = new FormData(productForm);
          const productData = Object.fromEntries(formData.entries());
          
          const productId = productData.id;
          delete productData.id; // Remove ID from PUT/POST body payload since it causes strict schema validation errors
          
          // Ensure precise numeric matching for schemas
          if (productData.price) productData.price = parseFloat(productData.price);

          let response;
          if (productId) {
            response = await window.apiService.updateProduct(productId, productData);
          } else {
            response = await window.apiService.addProduct(productData);
          }

          if (saveBtn) window.uiService.setLoadingState(saveBtn, false);

          if (response.success) {
            window.uiService.closeModal('product-modal');
            window.productService.loadProducts(); // Refresh the list
          } else {
            window.uiService.showGlobalError(response.error);
          }
        });
      }

      // Confirm Delete Action
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async (e) => {
          const id = confirmDeleteBtn.dataset.id;
          if (!id || id === 'undefined') return;

          window.uiService.setLoadingState(confirmDeleteBtn, true);
          const response = await window.apiService.deleteProduct(id);
          window.uiService.setLoadingState(confirmDeleteBtn, false);

          if (response.success) {
            window.uiService.closeModal('delete-confirm-modal');
            window.productService.loadProducts(); // Refresh
          } else {
            window.uiService.showGlobalError(response.error);
          }
        });
      }

      // Close modal buttons
      document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modal = e.target.closest('.modal-overlay');
          if (modal) window.uiService.closeModal(modal.id);
        });
      });
    }
  }

});
