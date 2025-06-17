class EmbedDesigner {
    constructor() {
        this.params = this.parseURLParams();
        this.config = this.getInitialConfig();
        this.initDesignerMode();
    }
    
    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams.entries()) {
            params[key] = decodeURIComponent(value);
        }
        return params;
    }
    
    getInitialConfig() {
        // Check if we have URL parameters
        const hasUrlParams = Object.keys(this.params).length > 0;
        
        // If URL params exist, prioritize them over saved config
        if (hasUrlParams) {
            // Start with defaults, then apply saved config, then override with URL params
            const savedConfig = this.loadFromLocalStorage() || {};
            return {
                prompt: this.params.prompt || savedConfig.prompt || '',
                context: this.params.context ? this.params.context.split(',').map(c => c.trim()) : (savedConfig.context || []),
                model: this.params.model || savedConfig.model || 'gpt-4o',
                mode: this.params.agentMode || savedConfig.mode || 'chat',
                thinking: this.params.thinking === 'true' ? true : (this.params.thinking === 'false' ? false : (savedConfig.thinking || false)),
                max: this.params.max === 'true' ? true : (this.params.max === 'false' ? false : (savedConfig.max || false)),
                lightColor: this.params.lightColor || savedConfig.lightColor || '#3b82f6',
                darkColor: this.params.darkColor || savedConfig.darkColor || '#60a5fa',
                height: this.params.height || savedConfig.height || '400',
                themeMode: this.params.themeMode || savedConfig.themeMode || 'auto',
                filetree: this.params.filetree ? decodeURIComponent(this.params.filetree).split('\n').filter(f => f.trim()) : (savedConfig.filetree || [])
            };
        }
        
        // Otherwise, try to load from localStorage
        const savedConfig = this.loadFromLocalStorage();
        if (savedConfig) {
            return savedConfig;
        }
        
        // Fall back to defaults
        return {
            prompt: '',
            context: [],
            model: 'gpt-4o',
            mode: 'chat',
            thinking: false,
            max: false,
            lightColor: '#3b82f6',
            darkColor: '#60a5fa',
            height: '400',
            themeMode: 'auto',
            filetree: []
        };
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('embedDesignerConfig');
            if (saved) {
                const config = JSON.parse(saved);
                // Validate the loaded config has all required fields
                if (config && typeof config === 'object') {
                    // Ensure all properties have defaults
                    return {
                        prompt: config.prompt || '',
                        context: config.context || [],
                        model: config.model || 'gpt-4o',
                        mode: config.mode || 'chat',
                        thinking: config.thinking || false,
                        max: config.max || false,
                        lightColor: config.lightColor || '#3b82f6',
                        darkColor: config.darkColor || '#60a5fa',
                        height: config.height || '400',
                        themeMode: config.themeMode || 'auto',
                        filetree: config.filetree || []
                    };
                }
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
        return null;
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('embedDesignerConfig', JSON.stringify(this.config));
            // Auto-save is silent - no notification
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    clearLocalStorage() {
        try {
            localStorage.removeItem('embedDesignerConfig');
            this.showNotification('Settings cleared!');
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    }
    
    initDesignerMode() {
        this.setupDesignerElements();
        this.setupDesignerEvents();
        this.setupDesignerColors();
        this.updatePreview();
        this.updateIframeSnippet();
    }
    
    setupDesignerElements() {
        // Populate form with current config
        document.getElementById('designer-prompt').value = this.config.prompt;
        document.getElementById('designer-context').value = this.config.context.join(', ');
        document.getElementById('designer-filetree').value = this.config.filetree.join('\n');
        
        // Handle model selection
        const modelSelect = document.getElementById('designer-model');
        const customModelInput = document.getElementById('designer-custom-model');
        
        // Check if model is one of the predefined options
        const isPredefinedModel = Array.from(modelSelect.options).some(opt => opt.value === this.config.model);
        
        if (isPredefinedModel) {
            modelSelect.value = this.config.model;
            customModelInput.classList.add('hidden');
        } else {
            // It's a custom model
            modelSelect.value = 'custom';
            customModelInput.value = this.config.model;
            customModelInput.classList.remove('hidden');
        }
        
        document.getElementById('designer-mode-select').value = this.config.mode;
        document.getElementById('designer-thinking').checked = this.config.thinking;
        document.getElementById('designer-max').checked = this.config.max;
        
        // Set height slider
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = this.config.height;
            if (heightValue) {
                heightValue.textContent = this.config.height;
            }
        }
        
        // Set theme mode buttons
        this.updateThemeModeButtons();
        
        // Set color values
        const lightColorPicker = document.getElementById('designer-light-color');
        const lightColorText = document.getElementById('designer-light-color-text');
        const darkColorPicker = document.getElementById('designer-dark-color');
        const darkColorText = document.getElementById('designer-dark-color-text');
        
        if (lightColorPicker) {
            lightColorPicker.value = this.config.lightColor;
            lightColorText.value = this.config.lightColor;
        }
        if (darkColorPicker) {
            darkColorPicker.value = this.config.darkColor;
            darkColorText.value = this.config.darkColor;
        }
    }
    
    updateThemeModeButtons() {
        // Update theme mode button states
        document.querySelectorAll('.theme-mode-btn').forEach(btn => {
            btn.classList.remove('bg-dynamic-primary', 'text-white');
            btn.classList.add('bg-dynamic-background', 'text-dynamic-foreground');
        });
        
        const activeButton = document.getElementById(`theme-${this.config.themeMode}`);
        if (activeButton) {
            activeButton.classList.remove('bg-dynamic-background', 'text-dynamic-foreground');
            activeButton.classList.add('bg-dynamic-primary', 'text-white');
        }
    }
    
    setupDesignerEvents() {
        // Form changes update preview
        ['designer-prompt', 'designer-context', 'designer-mode-select', 'designer-thinking', 'designer-max', 'designer-filetree'].forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('input', () => this.updateConfigFromForm());
            element.addEventListener('change', () => this.updateConfigFromForm());
        });
        
        // Theme mode buttons
        document.querySelectorAll('.theme-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.id.replace('theme-', '');
                this.config.themeMode = mode;
                this.updateThemeModeButtons();
                this.updatePreview();
                this.saveToLocalStorage();
            });
        });
        
        // Color preset buttons
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lightColor = e.currentTarget.getAttribute('data-light');
                const darkColor = e.currentTarget.getAttribute('data-dark');
                
                // Update color pickers and text inputs
                const lightColorPicker = document.getElementById('designer-light-color');
                const lightColorText = document.getElementById('designer-light-color-text');
                const darkColorPicker = document.getElementById('designer-dark-color');
                const darkColorText = document.getElementById('designer-dark-color-text');
                
                if (lightColorPicker && lightColor) {
                    lightColorPicker.value = lightColor;
                    lightColorText.value = lightColor;
                }
                if (darkColorPicker && darkColor) {
                    darkColorPicker.value = darkColor;
                    darkColorText.value = darkColor;
                }
                
                this.updateConfigFromForm();
            });
        });
        
        // Model dropdown special handling
        const modelSelect = document.getElementById('designer-model');
        const customModelInput = document.getElementById('designer-custom-model');
        
        modelSelect.addEventListener('change', () => {
            if (modelSelect.value === 'custom') {
                customModelInput.classList.remove('hidden');
                customModelInput.focus();
            } else {
                customModelInput.classList.add('hidden');
            }
            this.updateConfigFromForm();
        });
        
        // Custom model input
        customModelInput.addEventListener('input', () => this.updateConfigFromForm());
        
        // Height slider
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.addEventListener('input', (e) => {
                if (heightValue) {
                    heightValue.textContent = e.target.value;
                }
                this.updateConfigFromForm();
            });
        }
        
        // Color pickers
        const lightColorPicker = document.getElementById('designer-light-color');
        const lightColorText = document.getElementById('designer-light-color-text');
        const darkColorPicker = document.getElementById('designer-dark-color');
        const darkColorText = document.getElementById('designer-dark-color-text');
        
        if (lightColorPicker) {
            lightColorPicker.addEventListener('input', (e) => {
                lightColorText.value = e.target.value;
                this.updateConfigFromForm();
            });
        }
        
        if (lightColorText) {
            lightColorText.addEventListener('input', (e) => {
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    lightColorPicker.value = e.target.value;
                    this.updateConfigFromForm();
                }
            });
        }
        
        if (darkColorPicker) {
            darkColorPicker.addEventListener('input', (e) => {
                darkColorText.value = e.target.value;
                this.updateConfigFromForm();
            });
        }
        
        if (darkColorText) {
            darkColorText.addEventListener('input', (e) => {
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    darkColorPicker.value = e.target.value;
                    this.updateConfigFromForm();
                }
            });
        }
        
        // Generate embed button
        document.getElementById('generate-embed').addEventListener('click', () => this.showEmbedModal());
        
        // Iframe snippet click to copy
        document.getElementById('iframe-snippet').addEventListener('click', () => this.copyIframeCode());
        
        // Reset settings button
        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                this.clearLocalStorage();
                // Reset to default config
                this.config = {
                    prompt: '',
                    context: [],
                    model: 'gpt-4o',
                    mode: 'chat',
                    thinking: false,
                    max: false,
                    lightColor: '#3b82f6',
                    darkColor: '#60a5fa',
                    height: '400',
                    themeMode: 'auto',
                    filetree: []
                };
                // Update UI to reflect defaults
                this.setupDesignerElements();
                this.updatePreview();
                this.updateIframeSnippet();
            }
        });
        
        // Load example button
        document.getElementById('load-example').addEventListener('click', () => {
            this.loadExample();
        });
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.hideEmbedModal());
        document.getElementById('copy-embed-code').addEventListener('click', () => this.copyEmbedCode());
        document.getElementById('copy-share-url').addEventListener('click', () => this.copyShareURL());
        
        // Close modal on backdrop click
        document.getElementById('embed-modal').addEventListener('click', (e) => {
            if (e.target.id === 'embed-modal') this.hideEmbedModal();
        });
    }
    
    updateConfigFromForm() {
        const heightSlider = document.getElementById('designer-height');
        const modelSelect = document.getElementById('designer-model');
        const customModelInput = document.getElementById('designer-custom-model');
        const lightColorText = document.getElementById('designer-light-color-text');
        const darkColorText = document.getElementById('designer-dark-color-text');
        
        // Get model value
        let modelValue = modelSelect.value;
        if (modelValue === 'custom') {
            modelValue = customModelInput.value || 'Custom Model';
        }
        
        this.config = {
            prompt: document.getElementById('designer-prompt').value,
            context: document.getElementById('designer-context').value.split(',').map(c => c.trim()).filter(c => c),
            model: modelValue,
            mode: document.getElementById('designer-mode-select').value,
            thinking: document.getElementById('designer-thinking').checked,
            max: document.getElementById('designer-max').checked,
            lightColor: lightColorText ? lightColorText.value : '#3b82f6',
            darkColor: darkColorText ? darkColorText.value : '#60a5fa',
            height: heightSlider ? heightSlider.value : '400',
            themeMode: this.config.themeMode || 'auto',
            filetree: document.getElementById('designer-filetree').value.split('\n').map(f => f.trim()).filter(f => f)
        };
        
        this.updatePreview();
        this.saveToLocalStorage();
        this.updateIframeSnippet();
    }
    
    updateIframeSnippet() {
        const snippet = document.getElementById('iframe-snippet');
        if (!snippet) return;
        
        const code = this.generateEmbedCode();
        // Show a shortened version in the snippet
        const shortCode = code.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        snippet.textContent = shortCode;
    }
    
    setupDesignerColors() {
        // Set up fixed designer colors - always use default blue theme in light mode
        const root = document.documentElement;
        
        // Always use default blue colors for designer
        root.style.setProperty('--primary', '59 130 246'); // Blue-500
        root.style.setProperty('--background', '255 255 255');
        root.style.setProperty('--foreground', '15 23 42');
        root.style.setProperty('--muted', '248 250 252');
        root.style.setProperty('--muted-foreground', '100 116 139');
        root.style.setProperty('--border', '226 232 240');
        root.style.setProperty('--accent', '16 185 129');
    }
    
    updateDesignerColors() {
        // Deprecated - no longer update designer colors
        // Designer maintains fixed color scheme
    }
    
    updatePreview() {
        const previewContainer = document.getElementById('preview-container');
        const previewWrapper = document.getElementById('preview-wrapper');
        if (!previewContainer) return;
        
        // Update preview wrapper height
        if (previewWrapper) {
            previewWrapper.style.height = `${this.config.height}px`;
        }
        
        // Generate preview URL with parameters
        const previewUrl = this.generatePreviewURL();
        
        // Update iframe src
        let iframe = previewContainer.querySelector('iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.className = 'w-full h-full border-0 rounded-lg';
            previewContainer.innerHTML = '';
            previewContainer.appendChild(iframe);
        }
        
        iframe.src = previewUrl;
    }
    
    generatePreviewURL() {
        const params = new URLSearchParams();
        if (this.config.prompt) params.set('prompt', this.config.prompt);
        if (this.config.context.length > 0) params.set('context', this.config.context.join(','));
        if (this.config.model !== 'gpt-4o') params.set('model', this.config.model);
        if (this.config.mode !== 'chat') params.set('agentMode', this.config.mode);
        if (this.config.thinking) params.set('thinking', 'true');
        if (this.config.max) params.set('max', 'true');
        if (this.config.lightColor !== '#3b82f6') params.set('lightColor', this.config.lightColor);
        if (this.config.darkColor !== '#60a5fa') params.set('darkColor', this.config.darkColor);
        if (this.config.themeMode !== 'auto') params.set('themeMode', this.config.themeMode);
        if (this.config.filetree && this.config.filetree.length > 0) params.set('filetree', encodeURIComponent(this.config.filetree.join('\n')));
        params.set('preview', 'true');
        
        return `/embed-preview/?${params.toString()}`;
    }
    
    generateShareURL() {
        const params = new URLSearchParams();
        if (this.config.prompt) params.set('prompt', this.config.prompt);
        if (this.config.context.length > 0) params.set('context', this.config.context.join(','));
        if (this.config.model !== 'gpt-4o') params.set('model', this.config.model);
        if (this.config.mode !== 'chat') params.set('agentMode', this.config.mode);
        if (this.config.thinking) params.set('thinking', 'true');
        if (this.config.max) params.set('max', 'true');
        if (this.config.lightColor !== '#3b82f6') params.set('lightColor', this.config.lightColor);
        if (this.config.darkColor !== '#60a5fa') params.set('darkColor', this.config.darkColor);
        if (this.config.themeMode !== 'auto') params.set('themeMode', this.config.themeMode);
        if (this.config.filetree && this.config.filetree.length > 0) params.set('filetree', encodeURIComponent(this.config.filetree.join('\n')));
        
        return `${window.location.origin}/embed-preview/?${params.toString()}`;
    }
    
    generateEmbedCode() {
        const url = this.generateShareURL();
        return `<iframe 
  src="${url}"
  width="100%" 
  height="${this.config.height}"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e5e7eb;">
</iframe>`;
    }
    
    showEmbedModal() {
        const modal = document.getElementById('embed-modal');
        const embedCode = document.getElementById('embed-code');
        const shareUrl = document.getElementById('share-url');
        
        embedCode.value = this.generateEmbedCode();
        shareUrl.value = this.generateShareURL();
        
        modal.classList.remove('hidden');
    }
    
    hideEmbedModal() {
        document.getElementById('embed-modal').classList.add('hidden');
    }
    
    async copyEmbedCode() {
        const embedCode = document.getElementById('embed-code').value;
        await this.copyToClipboard(embedCode);
        this.showNotification('Embed code copied to clipboard!');
    }
    
    async copyShareURL() {
        const shareUrl = this.generateShareURL();
        await this.copyToClipboard(shareUrl);
        this.showNotification('Share URL copied to clipboard!');
    }
    
    async copyIframeCode() {
        const embedCode = this.generateEmbedCode();
        await this.copyToClipboard(embedCode);
        this.showNotification('Iframe code copied to clipboard!');
    }
    
    async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    }
    
    showNotification(message, duration = 2000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('opacity-0');
        notification.classList.add('opacity-100');
        
        setTimeout(() => {
            notification.classList.remove('opacity-100');
            notification.classList.add('opacity-0');
        }, duration);
    }
    
    loadExample() {
        // Set example values
        document.getElementById('designer-prompt').value = 
`You are a senior React developer. I need help building a modern e-commerce product listing component.

Requirements:
- Use React hooks and functional components
- Implement product filtering by category and price range
- Add smooth animations for product cards
- Make it fully responsive with a grid layout
- Include loading states and error handling

The component should fetch data from a REST API and display products with images, titles, prices, and ratings. Please provide clean, well-commented code following React best practices.`;
        
        document.getElementById('designer-context').value = '@codebase, ProductList.jsx';
        document.getElementById('designer-filetree').value = 
`src/components/ProductList.jsx*
src/components/ProductCard.jsx
src/components/Filters.jsx
src/hooks/useProducts.js
src/api/products.js
src/styles/products.css
src/utils/formatters.js
public/index.html
package.json
README.md`;
        
        // Set some example settings
        document.getElementById('designer-model').value = 'Claude 3.7 Sonnet';
        document.getElementById('designer-mode-select').value = 'agent';
        document.getElementById('designer-thinking').checked = true;
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('Example loaded!');
    }
}

// Dark mode toggle function
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        document.querySelector('.dark-mode-toggle .sun-icon').style.display = 'block';
        document.querySelector('.dark-mode-toggle .moon-icon').style.display = 'none';
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        document.querySelector('.dark-mode-toggle .sun-icon').style.display = 'none';
        document.querySelector('.dark-mode-toggle .moon-icon').style.display = 'block';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.embedDesigner = new EmbedDesigner();
    
    // Initialize dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        document.querySelector('.dark-mode-toggle .sun-icon').style.display = 'none';
        document.querySelector('.dark-mode-toggle .moon-icon').style.display = 'block';
    }
}); 