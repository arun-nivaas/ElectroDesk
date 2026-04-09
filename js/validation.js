/**
 * Form Validation Logic
 */

const validationService = {
  
  rules: {
    required: (value) => value.trim() !== '',
    minLength: (value, min) => value.trim().length >= min,
  },

  messages: {
    required: 'This field is required',
    minLength: (min) => `Must be at least ${min} characters`,
  },

  /**
   * Validate a single input field
   */
  validateField(inputEl) {
    const value = inputEl.value;
    const name = inputEl.name;
    let isValid = true;
    let errorMessage = '';

    // Check required
    if (inputEl.hasAttribute('required')) {
      if (!this.rules.required(value)) {
        isValid = false;
        errorMessage = this.messages.required;
      }
    }

    // Check specific fields
    if (isValid) {
      if (name === 'username' && !this.rules.minLength(value, 3)) {
        isValid = false;
        errorMessage = this.messages.minLength(3);
      } else if (name === 'password' && !this.rules.minLength(value, 6)) {
        isValid = false;
        errorMessage = this.messages.minLength(6);
      }
    }

    // Update UI for this field
    window.uiService.setFieldError(inputEl, isValid ? '' : errorMessage);
    
    return isValid;
  },

  /**
   * Validate entire form
   */
  validateForm(formEl) {
    const inputs = formEl.querySelectorAll('input:not([type="radio"])');
    let isFormValid = true;

    inputs.forEach(input => {
      const isFieldValid = this.validateField(input);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    // Check Role if we are on Register Form
    const roleInputs = formEl.querySelectorAll('input[name="role"]');
    if (roleInputs.length > 0) {
      const selectedRole = Array.from(roleInputs).find(radio => radio.checked);
      if (!selectedRole) {
        isFormValid = false;
        window.uiService.showGlobalError('Please select an account role.');
      }
    }

    return isFormValid;
  }
};

// Export to global scope
window.validationService = validationService;
