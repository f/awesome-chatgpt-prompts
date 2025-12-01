// Language and Tone Selection
function initializeLanguageAndTone() {
  const languageSelect = document.getElementById('languageSelect');
  const customLanguage = document.getElementById('customLanguage');
  const toneSelect = document.getElementById('toneSelect');
  const customTone = document.getElementById('customTone');

  // Load saved preferences
  const savedLanguage = localStorage.getItem('selected-language');
  const savedCustomLanguage = localStorage.getItem('custom-language');
  const savedTone = localStorage.getItem('selected-tone');
  const savedCustomTone = localStorage.getItem('custom-tone');

  if (savedLanguage) {
    languageSelect.value = savedLanguage;
    if (savedLanguage === 'custom' && savedCustomLanguage) {
      customLanguage.value = savedCustomLanguage;
      customLanguage.style.display = 'inline-block';
    }
  }

  if (savedTone) {
    toneSelect.value = savedTone;
    if (savedTone === 'custom' && savedCustomTone) {
      customTone.value = savedCustomTone;
      customTone.style.display = 'inline-block';
    }
  }

  // Language select handler
  languageSelect.addEventListener('change', (e) => {
    const isCustom = e.target.value === 'custom';
    customLanguage.style.display = isCustom ? 'inline-block' : 'none';
    localStorage.setItem('selected-language', e.target.value);
    
    if (!isCustom) {
      customLanguage.value = '';
      localStorage.removeItem('custom-language');
    }
  });

  // Custom language input handler
  customLanguage.addEventListener('input', (e) => {
    localStorage.setItem('custom-language', e.target.value);
  });

  // Tone select handler
  toneSelect.addEventListener('change', (e) => {
    const isCustom = e.target.value === 'custom';
    customTone.style.display = isCustom ? 'inline-block' : 'none';
    localStorage.setItem('selected-tone', e.target.value);
    
    if (!isCustom) {
      customTone.value = '';
      localStorage.removeItem('custom-tone');
    }
  });

  // Custom tone input handler
  customTone.addEventListener('input', (e) => {
    localStorage.setItem('custom-tone', e.target.value);
  });
}
