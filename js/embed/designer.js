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
                filetree: this.params.filetree ? decodeURIComponent(this.params.filetree).split('\n').filter(f => f.trim()) : (savedConfig.filetree || []),
                showFiletree: savedConfig.showFiletree !== undefined ? savedConfig.showFiletree : true,
                showDiff: this.params.showDiff === 'true' || savedConfig.showDiff || false,
                diffFilename: this.params.diffFilename || savedConfig.diffFilename || '',
                diffOldText: this.params.diffOldText ? decodeURIComponent(this.params.diffOldText) : (savedConfig.diffOldText || ''),
                diffNewText: this.params.diffNewText ? decodeURIComponent(this.params.diffNewText) : (savedConfig.diffNewText || ''),
                flashButton: this.params.flashButton || savedConfig.flashButton || 'none'
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
            filetree: [],
            showFiletree: true,
            showDiff: false,
            diffFilename: '',
            diffOldText: '',
            diffNewText: '',
            flashButton: 'none'
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
                        filetree: config.filetree || [],
                        showFiletree: config.showFiletree !== undefined ? config.showFiletree : true,
                        showDiff: config.showDiff || false,
                        diffFilename: config.diffFilename || '',
                        diffOldText: config.diffOldText || '',
                        diffNewText: config.diffNewText || '',
                        flashButton: config.flashButton || 'none'
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
        
        // Set show filetree checkbox (default to true if not set)
        const showFiletreeCheckbox = document.getElementById('designer-show-filetree');
        if (showFiletreeCheckbox) {
            showFiletreeCheckbox.checked = this.config.showFiletree !== false;
        }
        
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
        
        // Set up diff view
        const showDiffCheckbox = document.getElementById('designer-show-diff');
        const diffFields = document.getElementById('diff-fields');
        if (showDiffCheckbox) {
            showDiffCheckbox.checked = this.config.showDiff || false;
            if (diffFields) {
                diffFields.classList.toggle('hidden', !this.config.showDiff);
            }
        }
        
        // Set diff field values
        const diffFilename = document.getElementById('designer-diff-filename');
        const diffOldText = document.getElementById('designer-diff-old');
        const diffNewText = document.getElementById('designer-diff-new');
        const flashButton = document.getElementById('designer-flash-button');
        
        if (diffFilename) diffFilename.value = this.config.diffFilename || '';
        if (diffOldText) diffOldText.value = this.config.diffOldText || '';
        if (diffNewText) diffNewText.value = this.config.diffNewText || '';
        if (flashButton) flashButton.value = this.config.flashButton || 'none';
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
        ['designer-prompt', 'designer-context', 'designer-mode-select', 'designer-thinking', 'designer-max', 'designer-filetree', 'designer-show-filetree', 'designer-diff-filename', 'designer-diff-old', 'designer-diff-new', 'designer-flash-button'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateConfigFromForm());
                element.addEventListener('change', () => this.updateConfigFromForm());
            }
        });
        
        // Diff view toggle
        const showDiffCheckbox = document.getElementById('designer-show-diff');
        const diffFields = document.getElementById('diff-fields');
        if (showDiffCheckbox) {
            showDiffCheckbox.addEventListener('change', (e) => {
                if (diffFields) {
                    diffFields.classList.toggle('hidden', !e.target.checked);
                }
                this.updateConfigFromForm();
            });
        }
        
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
                    filetree: [],
                    showFiletree: true,
                    showDiff: false,
                    diffFilename: '',
                    diffOldText: '',
                    diffNewText: ''
                };
                // Update UI to reflect defaults
                this.setupDesignerElements();
                this.updatePreview();
                this.updateIframeSnippet();
            }
        });
        
        // Example select
        const exampleSelect = document.getElementById('example-select');
        if (exampleSelect) {
            exampleSelect.addEventListener('change', (e) => {
                const example = e.target.value;
                if (example) {
                    switch (example) {
                        case 'vibe-coding':
                            this.loadVibeCodingExample();
                            break;
                        case 'vibe-coding-diff':
                            this.loadVibeCodingDiffExample();
                            break;
                        case 'chatgpt':
                            this.loadChatGPTExample();
                            break;
                        case 'claude':
                            this.loadClaudeExample();
                            break;
                        case 'image-analysis':
                            this.loadImageAnalysisExample();
                            break;
                        case 'api-design':
                            this.loadAPIDesignExample();
                            break;
                    }
                    // Reset select to placeholder after loading
                    exampleSelect.value = '';
                }
            });
        }
        
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
            filetree: document.getElementById('designer-filetree').value.split('\n').map(f => f.trim()).filter(f => f),
            showFiletree: document.getElementById('designer-show-filetree').checked,
            showDiff: document.getElementById('designer-show-diff').checked,
            diffFilename: document.getElementById('designer-diff-filename').value,
            diffOldText: document.getElementById('designer-diff-old').value,
            diffNewText: document.getElementById('designer-diff-new').value,
            flashButton: document.getElementById('designer-flash-button').value
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
        if (this.config.showFiletree && this.config.filetree && this.config.filetree.length > 0) params.set('filetree', encodeURIComponent(this.config.filetree.join('\n')));
        if (this.config.showDiff) {
            params.set('showDiff', 'true');
            if (this.config.diffFilename) params.set('diffFilename', this.config.diffFilename);
            if (this.config.flashButton && this.config.flashButton !== 'none') params.set('flashButton', this.config.flashButton);
            // Truncate diff text if too long to prevent URL length issues
            if (this.config.diffOldText) {
                const truncated = this.config.diffOldText.substring(0, 100);
                params.set('diffOldText', encodeURIComponent(truncated)+'...');
            }
            if (this.config.diffNewText) {
                const truncated = this.config.diffNewText.substring(0, 100);
                params.set('diffNewText', encodeURIComponent(truncated)+'...');
            }
        }
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
        if (this.config.showFiletree && this.config.filetree && this.config.filetree.length > 0) params.set('filetree', encodeURIComponent(this.config.filetree.join('\n')));
        if (this.config.showDiff) {
            params.set('showDiff', 'true');
            if (this.config.diffFilename) params.set('diffFilename', this.config.diffFilename);
            if (this.config.flashButton && this.config.flashButton !== 'none') params.set('flashButton', this.config.flashButton);
            // Truncate diff text if too long to prevent URL length issues
            if (this.config.diffOldText) {
                const truncated = this.config.diffOldText.substring(0, 150);
                params.set('diffOldText', encodeURIComponent(truncated));
            }
            if (this.config.diffNewText) {
                const truncated = this.config.diffNewText.substring(0, 150);
                params.set('diffNewText', encodeURIComponent(truncated));
            }
        }
        
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
    
    loadVibeCodingExample() {
        // Vibe coding example WITHOUT diff
        // Set vibe coding example values
        document.getElementById('designer-prompt').value = 
`Refactor my React ProductList component:
- Extract filtering logic to custom hook
- Split into smaller components  
- Add TypeScript types
- Implement virtualization

Currently handles display, filtering, sorting, and pagination in one file.

@web Check React Query docs for data fetching patterns.`;
        
        document.getElementById('designer-context').value = '@codebase, ProductList.tsx';
        document.getElementById('designer-filetree').value = 
`src/components/ProductList.tsx*
src/components/ProductCard.tsx
src/hooks/useProducts.ts
src/types/product.ts`;
        
        // Set vibe coding settings
        document.getElementById('designer-model').value = 'Claude 4 Opus';
        document.getElementById('designer-mode-select').value = 'agent';
        document.getElementById('designer-thinking').checked = true;
        document.getElementById('designer-max').checked = true;
        document.getElementById('designer-show-filetree').checked = true;
        
        // Set height and colors for coding example
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '500';
            if (heightValue) {
                heightValue.textContent = '500';
            }
        }
        
        // Set developer-friendly color scheme (purple/violet)
        document.getElementById('designer-light-color').value = '#8b5cf6';
        document.getElementById('designer-light-color-text').value = '#8b5cf6';
        document.getElementById('designer-dark-color').value = '#a78bfa';
        document.getElementById('designer-dark-color-text').value = '#a78bfa';
        
        // Set dark theme mode for coding
        this.config.themeMode = 'dark';
        this.updateThemeModeButtons();
        
        // No diff for this example
        document.getElementById('designer-show-diff').checked = false;
        document.getElementById('diff-fields').classList.add('hidden');
        document.getElementById('designer-flash-button').value = 'none';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('Vibe coding example loaded!');
    }
    
    loadVibeCodingDiffExample() {
        // Vibe coding WITH diff - user giving feedback on suggested changes
        document.getElementById('designer-prompt').value = 
`Actually, don't use Error | null for the error state. Instead:
- Create a custom ApiError type with code, message, and retry()
- Add an AbortController for request cancellation
- Include error boundary integration
- Show me how to handle network vs API errors differently

Also add a refetch function that the UI can call.`;
        
        document.getElementById('designer-context').value = '@codebase, useProducts.ts';
        document.getElementById('designer-filetree').value = 
`src/hooks/useProducts.ts*
src/types/errors.ts
src/utils/api.ts`;
        
        // Set same settings as regular vibe coding
        document.getElementById('designer-model').value = 'Claude 4 Opus';
        document.getElementById('designer-mode-select').value = 'agent';
        document.getElementById('designer-thinking').checked = true;
        document.getElementById('designer-max').checked = true;
        document.getElementById('designer-show-filetree').checked = true;
        
        // Set height and colors
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '500';
            if (heightValue) {
                heightValue.textContent = '500';
            }
        }
        
        document.getElementById('designer-light-color').value = '#8b5cf6';
        document.getElementById('designer-light-color-text').value = '#8b5cf6';
        document.getElementById('designer-dark-color').value = '#a78bfa';
        document.getElementById('designer-dark-color-text').value = '#a78bfa';
        
        this.config.themeMode = 'dark';
        this.updateThemeModeButtons();
        
        // Add diff view showing the previous suggestion
        document.getElementById('designer-show-diff').checked = true;
        document.getElementById('diff-fields').classList.remove('hidden');
        document.getElementById('designer-diff-filename').value = 'useProducts.ts';
        document.getElementById('designer-diff-old').value = 
`const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);`;
        document.getElementById('designer-diff-new').value = 
`const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);`;
        
        // Flash accept button for this example with diff
        document.getElementById('designer-flash-button').value = 'accept';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('Vibe coding with diff loaded!');
    }
    
    loadChatGPTExample() {
        // ChatGPT example with green colors
        document.getElementById('designer-prompt').value = 
`I'm planning a dinner party for 8 people this weekend. One person is vegetarian, another is gluten-free, and I want to make something impressive but not too complicated. 

Can you suggest a menu with appetizers, main course, and dessert that would work for everyone? I have about 4 hours to prepare everything and a moderate cooking skill level.`;
        
        document.getElementById('designer-context').value = '#Kitchen Layout.png, #Pantry Inventory.jpg';
        document.getElementById('designer-filetree').value = '';
        
        // ChatGPT settings
        document.getElementById('designer-model').value = 'GPT 4o';
        document.getElementById('designer-mode-select').value = 'chat';
        document.getElementById('designer-thinking').checked = false;
        document.getElementById('designer-max').checked = false;
        document.getElementById('designer-show-filetree').checked = false;
        
        // Set height and colors for ChatGPT
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '350';
            if (heightValue) {
                heightValue.textContent = '350';
            }
        }
        
        // ChatGPT green color scheme
        document.getElementById('designer-light-color').value = '#10b981';
        document.getElementById('designer-light-color-text').value = '#10b981';
        document.getElementById('designer-dark-color').value = '#34d399';
        document.getElementById('designer-dark-color-text').value = '#34d399';
        
        // Light theme for ChatGPT
        this.config.themeMode = 'light';
        this.updateThemeModeButtons();
        
        // Clear diff view
        document.getElementById('designer-show-diff').checked = false;
        document.getElementById('diff-fields').classList.add('hidden');
        document.getElementById('designer-flash-button').value = 'none';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('ChatGPT example loaded!');
    }
    
    loadClaudeExample() {
        // Claude example with orange colors - daily usage
        document.getElementById('designer-prompt').value = 
`Help me write a professional email to decline a job offer while keeping the door open for future opportunities. 

Context:
- Received offer from TechCorp as Senior Engineer
- Great team and compensation, but role doesn't align with my career goals
- Want to maintain good relationship with the hiring manager Sarah
- Interested in their upcoming ML team expansion next year

Keep it warm but professional, around 150-200 words.`;
        
        document.getElementById('designer-context').value = '';
        document.getElementById('designer-filetree').value = '';
        
        // Claude settings
        document.getElementById('designer-model').value = 'Claude 3.7 Sonnet';
        document.getElementById('designer-mode-select').value = 'chat';
        document.getElementById('designer-thinking').checked = false;
        document.getElementById('designer-max').checked = false;
        document.getElementById('designer-show-filetree').checked = false;
        
        // Set height and colors for Claude
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '350';
            if (heightValue) {
                heightValue.textContent = '350';
            }
        }
        
        // Claude orange color scheme
        document.getElementById('designer-light-color').value = '#f97316';
        document.getElementById('designer-light-color-text').value = '#f97316';
        document.getElementById('designer-dark-color').value = '#fb923c';
        document.getElementById('designer-dark-color-text').value = '#fb923c';
        
        // Auto theme for Claude
        this.config.themeMode = 'auto';
        this.updateThemeModeButtons();
        
        // Clear diff view
        document.getElementById('designer-show-diff').checked = false;
        document.getElementById('diff-fields').classList.add('hidden');
        document.getElementById('designer-flash-button').value = 'none';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('Claude example loaded!');
    }
    
    loadImageAnalysisExample() {
        // Image analysis example
        document.getElementById('designer-prompt').value = 
`Analyze these UI screenshots and provide detailed feedback on:
- Visual hierarchy and layout
- Color scheme and contrast
- Typography choices
- Accessibility concerns
- Mobile responsiveness issues`;
        
        document.getElementById('designer-context').value = '#Homepage Desktop.png, #Homepage Mobile.png, #Dashboard View.jpg';
        document.getElementById('designer-filetree').value = '';
        
        // Image analysis settings
        document.getElementById('designer-model').value = 'GPT 4.1';
        document.getElementById('designer-mode-select').value = 'chat';
        document.getElementById('designer-thinking').checked = false;
        document.getElementById('designer-max').checked = false;
        document.getElementById('designer-show-filetree').checked = false;
        
        // Set height and colors
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '400';
            if (heightValue) {
                heightValue.textContent = '400';
            }
        }
        
        // Pink/purple color scheme for design
        document.getElementById('designer-light-color').value = '#ec4899';
        document.getElementById('designer-light-color-text').value = '#ec4899';
        document.getElementById('designer-dark-color').value = '#f472b6';
        document.getElementById('designer-dark-color-text').value = '#f472b6';
        
        // Light theme
        this.config.themeMode = 'light';
        this.updateThemeModeButtons();
        
        // Clear diff view
        document.getElementById('designer-show-diff').checked = false;
        document.getElementById('diff-fields').classList.add('hidden');
        document.getElementById('designer-flash-button').value = 'none';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('Image analysis example loaded!');
    }
    
    loadAPIDesignExample() {
        // API design example
        document.getElementById('designer-prompt').value = 
`Design a RESTful API for a task management system with:
- User authentication
- Project and task CRUD operations
- Team collaboration features
- Real-time notifications

Include endpoint definitions, request/response schemas, and error handling patterns.`;
        
        document.getElementById('designer-context').value = '@Web, openapi.yaml';
        document.getElementById('designer-filetree').value = 
`api/
api/v1/
api/v1/users/
api/v1/projects/
api/v1/tasks/
docs/openapi.yaml*`;
        
        // API design settings
        document.getElementById('designer-model').value = 'Claude 4 Opus';
        document.getElementById('designer-mode-select').value = 'manual';
        document.getElementById('designer-thinking').checked = true;
        document.getElementById('designer-max').checked = false;
        document.getElementById('designer-show-filetree').checked = true;
        
        // Set height and colors
        const heightSlider = document.getElementById('designer-height');
        const heightValue = document.getElementById('height-value');
        if (heightSlider) {
            heightSlider.value = '500';
            if (heightValue) {
                heightValue.textContent = '500';
            }
        }
        
        // Blue color scheme for API
        document.getElementById('designer-light-color').value = '#3b82f6';
        document.getElementById('designer-light-color-text').value = '#3b82f6';
        document.getElementById('designer-dark-color').value = '#60a5fa';
        document.getElementById('designer-dark-color-text').value = '#60a5fa';
        
        // Dark theme for technical
        this.config.themeMode = 'dark';
        this.updateThemeModeButtons();
        
        // Clear diff view
        document.getElementById('designer-show-diff').checked = false;
        document.getElementById('diff-fields').classList.add('hidden');
        document.getElementById('designer-flash-button').value = 'none';
        
        // Update config from form
        this.updateConfigFromForm();
        
        this.showNotification('API design example loaded!');
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