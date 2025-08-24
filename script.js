// ===== Solace – unified script (pages + language + filter + modal-safe) =====
let currentLanguage = localStorage.getItem('preferredLanguage') || 'ar';

// ---- Pages ----
function showPage(pageId) {
  try {
    // Hide all pages by removing the 'active' class
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show the target page by adding the 'active' class
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.add('active');

          // Update the active state in the navigation
      document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('data-page') === pageId) {
          a.classList.add('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (e) {
    console.error('showPage error:', e);
  }
}

// ---- Language ----
function updateTextContent() {
  try {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir  = currentLanguage === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-en],[data-ar]').forEach(el => {
      const txt = el.getAttribute(`data-${currentLanguage}`);
      if (txt != null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = txt;
        } else {
          el.innerHTML = txt; // Use innerHTML to support <br> tags
        }
      }
    });

    // Update placeholders for inputs with data-*-placeholder attributes
    document.querySelectorAll(`[data-${currentLanguage}-placeholder]`).forEach(el => {
      const placeholderTxt = el.getAttribute(`data-${currentLanguage}-placeholder`);
      if (placeholderTxt && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        el.placeholder = placeholderTxt;
      }
    });

    updateLanguageToggle();

  } catch (e) {
    console.error('updateTextContent error:', e);
  }
}

function updateLanguageToggle() {
  const t = document.getElementById('languageToggle');
  if (!t) return;
  t.setAttribute('data-lang', currentLanguage);
  const en = t.querySelector('.lang-en');
  const ar = t.querySelector('.lang-ar');
  en?.classList.toggle('active', currentLanguage === 'en');
  ar?.classList.toggle('active', currentLanguage === 'ar');
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  localStorage.setItem('preferredLanguage', currentLanguage);
  updateTextContent();
}


// ---- Menu Filter ----
function filterMenu(category) {
  try {
    // Update active state for category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });

    // Show/hide category headers and their corresponding item containers
    document.querySelectorAll('.category-header, .menu-items').forEach(el => {
      el.style.display = (el.getAttribute('data-category') === category) ? '' : 'none';
    });

  } catch (e) {
    console.error('filterMenu error:', e);
  }
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  // Setup navigation
  // Setup navigation for all elements with a data-page attribute
  document.querySelectorAll('[data-page]').forEach(element => {
    element.addEventListener('click', e => {
      e.preventDefault();
      const pageId = element.getAttribute('data-page');
      if (pageId) {
        showPage(pageId);
      }
    });
  });

  // Setup language toggle
  document.getElementById('languageToggle')?.addEventListener('click', e => {
    e.preventDefault();
    toggleLanguage();
  });

  // Setup menu filter
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      if (category) filterMenu(category);
    });
  });

  // Initialize simple Saudi-only phone input
  setTimeout(() => {
    initializePhoneInput();
  }, 100);

  // Initialize date and time selection
  initializeDateTimeSelection();

  // Initialize
  updateTextContent();
  
  // Show menu page by default and filter for appetizers
  showPage('home');
  filterMenu('appetizers');
});

// ---- Form Validation Functions ----
function validateName(name) {
  const nameRegex = /^[a-zA-Zا-ي\s]{2,50}$/;
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: { en: 'Name is required', ar: 'الاسم مطلوب' } };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: { en: 'Name must be at least 2 characters', ar: 'الاسم يجب أن يكون حرفين على الأقل' } };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: { en: 'Name must be less than 50 characters', ar: 'الاسم يجب أن يكون أقل من 50 حرف' } };
  }
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: { en: 'Name can only contain letters and spaces', ar: 'الاسم يجب أن يحتوي على حروف ومسافات فقط' } };
  }
  return { isValid: true };
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: { en: 'Email is required', ar: 'البريد الإلكتروني مطلوب' } };
  }
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: { en: 'Please enter a valid email address', ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح' } };
  }
  return { isValid: true };
}

function validatePhone(phone, countryCode) {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, message: { en: 'Phone number is required', ar: 'رقم الهاتف مطلوب' } };
  }
    
  const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    
  // Saudi-specific validation: exactly 9 digits starting with 5
  if (cleanPhone.length !== 9) {
      return { 
        isValid: false, 
        message: { 
          en: 'Saudi phone number must be exactly 9 digits', 
          ar: 'رقم الهاتف السعودي يجب أن يكون 9 أرقام بالضبط' 
        } 
      };
    }
    
    if (!cleanPhone.startsWith('5')) {
      return { 
        isValid: false, 
        message: { 
          en: 'Saudi mobile number must start with 5', 
          ar: 'رقم الجوال السعودي يجب أن يبدأ بالرقم 5' 
        } 
      };
    }
    
    return { isValid: true };
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add error class
    formGroup.classList.add('error');
    
    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Remove error class
    formGroup.classList.remove('error');
    
    // Remove error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  // ---- Real-time Validation ----
  function setupRealTimeValidation() {
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    if (nameField) {
      nameField.addEventListener('blur', function() {
        const nameValidation = validateName(this.value);
        const lang = document.documentElement.lang || 'en';
        
        if (!nameValidation.isValid) {
          showFieldError('name', nameValidation.message[lang]);
        } else {
          clearFieldError('name');
        }
      });
      
      nameField.addEventListener('input', function() {
        // Clear error on input if field has content
        if (this.value.trim().length > 0) {
          clearFieldError('name');
        }
      });
    }
    
    if (emailField) {
      emailField.addEventListener('blur', function() {
        const emailValidation = validateEmail(this.value);
        const lang = document.documentElement.lang || 'en';
        
        if (!emailValidation.isValid) {
          showFieldError('email', emailValidation.message[lang]);
        } else {
          clearFieldError('email');
        }
      });
      
      emailField.addEventListener('input', function() {
        // Clear error on input if field has content
        if (this.value.trim().length > 0) {
          clearFieldError('email');
        }
      });
    }
    
    if (phoneField) {
      phoneField.addEventListener('blur', function() {
        const currentCountryData = window.selectedCountry || { dialCode: '+966' };
        const phoneValidation = validatePhone(this.value, currentCountryData.dialCode);
        const lang = document.documentElement.lang || 'en';
        
        if (!phoneValidation.isValid) {
          showFieldError('phone', phoneValidation.message[lang]);
        } else {
          clearFieldError('phone');
        }
      });
      
      phoneField.addEventListener('input', function() {
        // Clear error on input if field has content
        if (this.value.trim().length > 0) {
          clearFieldError('phone');
        }
      });
    }
  }

  // ---- Reservation Form Submission ----
  const reservationForm = document.getElementById('reservationForm');

  if (reservationForm) {
    // Setup real-time validation
    setupRealTimeValidation();
    
    reservationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const guests = document.getElementById('guests').value;
      const specialRequests = document.getElementById('message').value;
      
      const lang = document.documentElement.lang || 'en';
      let hasErrors = false;

      // Validate name
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        showFieldError('name', nameValidation.message[lang]);
        hasErrors = true;
      } else {
        clearFieldError('name');
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        showFieldError('email', emailValidation.message[lang]);
        hasErrors = true;
      } else {
        clearFieldError('email');
      }

      // Validate phone
      const formCountryData = window.selectedCountry || { dialCode: '+966' };
      const phoneValidation = validatePhone(phone, formCountryData.dialCode);
      if (!phoneValidation.isValid) {
        showFieldError('phone', phoneValidation.message[lang]);
        hasErrors = true;
      } else {
        clearFieldError('phone');
      }

      // Check other required fields
      if (!phone || !date || !time || !guests) {
        alert(lang === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
        return;
      }
      
      // Stop submission if there are validation errors
      if (hasErrors) {
        return;
      }

      // Form is valid, prepare data for submission
      const selectedCountryData = window.selectedCountry || { dialCode: '+966' };
      const fullPhoneNumber = selectedCountryData.dialCode + phone;
      
      const formData = {
        name: name,
        email: email,
        phone: fullPhoneNumber,
        date: date,
        time: time,
        guests: guests,
        specialRequests: specialRequests
      };
      
      console.log('Form submitted:', formData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = document.documentElement.lang === 'ar' 
        ? 'تم إرسال حجزك بنجاح!' 
        : 'Your reservation has been submitted successfully!';
      
      reservationForm.prepend(successMessage);
      
      // Reset form
      reservationForm.reset();
      
      // Reset phone input to default (Saudi Arabia)
      if (typeof window.resetPhoneInput === 'function') {
        window.resetPhoneInput();
      }
      
      // After resetting, re-select the first available day and time
      const firstAvailableDay = document.querySelector('.day-chip:not(.disabled)');
      if (firstAvailableDay) {
        firstAvailableDay.click();
      }
      
      // Remove success message after 5 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 5000);
    });
  }

// ---- Simplified Saudi-Only Phone Input ----
// Only Saudi Arabia - no API, no dropdown, no country selection
window.selectedCountry = { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: 'sa' };

function initializePhoneInput() {
  console.log('Initializing Saudi-only phone input...');
  
  const countrySelector = document.getElementById('countrySelector');
  const selectedCountryEl = document.getElementById('selectedCountry');
  const phoneInput = document.getElementById('phone');

  if (!countrySelector || !selectedCountryEl || !phoneInput) {
    console.error('Missing phone input elements');
    return;
  }

  // Set Saudi Arabia flag and code (static)
  selectedCountryEl.innerHTML = `
    <img src="https://flagcdn.com/24x18/sa.png" alt="Saudi Arabia" class="country-flag">
    <span class="country-code">+966</span>
  `;

  // Remove dropdown arrow and disable click events
  const dropdownArrow = selectedCountryEl.querySelector('.dropdown-arrow');
  if (dropdownArrow) {
    dropdownArrow.remove();
  }

  // Remove all event listeners and disable dropdown functionality
  selectedCountryEl.style.cursor = 'default';
  selectedCountryEl.style.pointerEvents = 'none';

  // Update placeholder for Saudi phone format
  updatePlaceholder();

  console.log('Saudi-only phone input initialized successfully');
}

// Update placeholder with Saudi phone format
function updatePlaceholder() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;
  
  const lang = document.documentElement.lang || 'en';
  const placeholders = {
    en: '5XXXXXXXX',
    ar: '5XXXXXXXX'
  };
  phoneInput.placeholder = placeholders[lang] || placeholders['en'];
}

// Make function globally accessible
window.initializePhoneInput = initializePhoneInput;
window.updatePlaceholder = updatePlaceholder;

// ---- Date and Time Selection Initialization ----
function initializeDateTimeSelection() {
  const dayNames = {
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
  };
  const monthNames = {
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    ar: ['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس']
  };

  const lang = (window.currentLanguage || document.documentElement.lang || 'en').startsWith('ar') ? 'ar' : 'en';

  const quickDays = document.getElementById('quickDays');
  const dateInput = document.getElementById('date');
  const timeSlotsWrap = document.getElementById('timeSlots');
  const timeInput = document.getElementById('time');

  if (!quickDays || !timeSlotsWrap) {
    console.error('Date/time elements not found:', {
      quickDays: !!quickDays,
      timeSlotsWrap: !!timeSlotsWrap
    });
    return;
  }

  console.log('Initializing date and time selection...');

  // Restaurant closed on Monday (day=1)
  const CLOSED_DAY = 1; // Monday

  // Create 14 days ahead
  const today = new Date();
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  // Render day buttons
  days.forEach((d, idx) => {
    const isClosed = d.getDay() === CLOSED_DAY;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-chip' + (isClosed ? ' disabled' : '');
    btn.dataset.date = d.toISOString().slice(0,10);

    const dow = dayNames[lang][d.getDay()];
    const dom = `${d.getDate()} ${monthNames[lang][d.getMonth()]}`;

    btn.innerHTML = `<span class="dow">${dow}</span><span class="dom">${dom}</span>`;

    if (!isClosed) {
      btn.addEventListener('click', () => {
        // Select day
        document.querySelectorAll('.day-chip').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Store date for submission
        if (dateInput) dateInput.value = btn.dataset.date;

        // Render time slots
        renderTimeSlots(d);
      });
    }

    quickDays.appendChild(btn);

    // Auto-select first available day
    if (idx === 0 && !isClosed) {
      setTimeout(() => btn.click(), 0);
    }
  });

  // Available time slots
  const baseSlots = ['17:00','18:30','20:00','21:30'];

  // Simulate availability (e.g., Friday 18:30 and 20:00 are busy)
  function getDisabledSlotsForDate(d){
    const isFri = d.getDay() === 5;
    return isFri ? new Set(['18:30','20:00']) : new Set();
  }

  function renderTimeSlots(dateObj){
    timeSlotsWrap.innerHTML = '';
    if (timeInput) timeInput.value = '';

    const disabled = getDisabledSlotsForDate(dateObj);

    baseSlots.forEach(t => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'time-chip' + (disabled.has(t) ? ' disabled' : '');
      chip.textContent = t;

      if (!disabled.has(t)) {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          if (timeInput) timeInput.value = t;
        });
      }

      timeSlotsWrap.appendChild(chip);
    });
  }

  // Language change event handler
  document.addEventListener('languageChanged', () => {
    const currentLang = (window.currentLanguage || document.documentElement.lang || 'en').startsWith('ar') ? 'ar' : 'en';
    document.querySelectorAll('.day-chip').forEach(btn => {
      const d = new Date(btn.dataset.date);
      const dow = dayNames[currentLang][d.getDay()];
      const dom = `${d.getDate()} ${monthNames[currentLang][d.getMonth()]}`;
      btn.innerHTML = `<span class="dow">${dow}</span><span class="dom">${dom}</span>`;
    });
  });

  console.log('Date and time selection initialized successfully');
}