/**
 * Authentication and Role Guard Logic
 * Instantly executes to prevent unauthorized access
 */

const authGuard = (() => {
  const currentPath = window.location.pathname;
  const isViewerPage = currentPath.includes('viewer');
  const isAdminPage = currentPath.includes('admin');
  const isAuthPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('register');
  const role = localStorage.getItem('auth_role');
  const token = localStorage.getItem('auth_token');

  // If trying to access protected page without token => login
  if ((isViewerPage || isAdminPage) && !token) {
    window.location.replace('index.html');
  }

  // Role based guards
  if (isViewerPage && role && role !== 'viewer') {
    window.location.replace('index.html');
  }

  if (isAdminPage && role && role !== 'admin') {
    window.location.replace('index.html');
  }

  // Auto-redirect if already logged in
  if (isAuthPage && token && role) {
    if (role === 'admin') {
      window.location.replace('admin.html');
    } else if (role === 'viewer') {
      window.location.replace('viewer.html');
    }
  }

  return {
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      window.location.replace('index.html');
    }
  };
})();

window.authGuard = authGuard;
