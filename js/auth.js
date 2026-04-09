/**
 * Authentication Business Logic
 */

const authService = {
  
  /**
   * Handle Login Form Submission
   */
  async handleLogin(event, formEl) {
    event.preventDefault();
    
    // Clear previous errors
    window.uiService.hideGlobalAlert();

    // Validate
    if (!window.validationService.validateForm(formEl)) {
      return;
    }

    const submitBtn = formEl.querySelector('button[type="submit"]');
    window.uiService.setLoadingState(submitBtn, true);

    // Gather data
    const formData = new FormData(formEl);
    const credentials = Object.fromEntries(formData.entries());

    // Call API
    const response = await window.apiService.loginUser(credentials);
    
    window.uiService.setLoadingState(submitBtn, false);

    if (response.success) {
      window.uiService.showGlobalSuccess('Login successful! Redirecting...');
      
      // Store token if received
      if (response.data && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        
        // Robust extraction of role, falling back to JWT decode
        let role = 'viewer';
        if (response.data.role) {
          role = response.data.role;
        } else if (response.data.user && response.data.user.role) {
          role = response.data.user.role;
        } else if (response.data.access_token) {
          try {
            const payloadStr = response.data.access_token.split('.')[1];
            if (payloadStr) {
               const payload = JSON.parse(atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/')));
               if (payload.role) {
                  role = payload.role;
               } else if (payload.sub && payload.sub.toLowerCase().includes('admin')) {
                  role = 'admin';
               }
            }
          } catch(e) {
             console.log("JWT decode failed", e);
          }
        }
        localStorage.setItem('auth_role', role);
      }

      setTimeout(() => {
        const storedRole = localStorage.getItem('auth_role');
        if (storedRole === 'admin') {
           window.location.href = 'admin.html';
        } else {
           window.location.href = 'viewer.html';
        }
      }, 1500);

    } else {
      window.uiService.showGlobalError(response.error);
    }
  },

  /**
   * Handle Register Form Submission
   */
  async handleRegister(event, formEl) {
    event.preventDefault();
    
    window.uiService.hideGlobalAlert();

    if (!window.validationService.validateForm(formEl)) {
      return;
    }

    const submitBtn = formEl.querySelector('button[type="submit"]');
    window.uiService.setLoadingState(submitBtn, true);

    const formData = new FormData(formEl);
    const userData = Object.fromEntries(formData.entries());

    const response = await window.apiService.registerUser(userData);
    
    window.uiService.setLoadingState(submitBtn, false);

    if (response.success) {
      window.uiService.showGlobalSuccess('Account created successfully! Redirecting to login...');
      formEl.reset();
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      window.uiService.showGlobalError(response.error);
    }
  }

};

window.authService = authService;
