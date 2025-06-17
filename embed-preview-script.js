class EmbedPreview {
    constructor() {
        this.params = this.parseURLParams();
        this.config = this.getInitialConfig();
        this.init();
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
        return {
            prompt: this.params.prompt || '',
            context: this.params.context ? this.params.context.split(',').map(c => c.trim()) : [],
            model: this.params.model || 'gpt-4o',
            mode: this.params.agentMode || 'chat',
            thinking: this.params.thinking === 'true',
            max: this.params.max === 'true',
            lightColor: this.params.lightColor || '#3b82f6',
            darkColor: this.params.darkColor || '#60a5fa',
            themeMode: this.params.themeMode || 'auto',
            filetree: this.params.filetree ? decodeURIComponent(this.params.filetree).split('\n').filter(f => f.trim()) : []
        };
    }
    
    init() {
        this.setupColors();
        this.setupElements();
        this.render();
    }
    
    setupColors() {
        const root = document.documentElement;
        
        // Determine if we should use dark mode
        let isDarkMode;
        if (this.config.themeMode === 'light') {
            isDarkMode = false;
        } else if (this.config.themeMode === 'dark') {
            isDarkMode = true;
        } else {
            // Auto mode - use system preference
            isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        const baseColor = isDarkMode ? this.config.darkColor : this.config.lightColor;
        
        // Convert hex to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        // Convert RGB to HSL
        const rgbToHsl = (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            
            return { h: h * 360, s: s * 100, l: l * 100 };
        };
        
        // Convert HSL to RGB
        const hslToRgb = (h, s, l) => {
            h /= 360;
            s /= 100;
            l /= 100;
            
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        };
        
        const rgb = hexToRgb(baseColor);
        if (rgb) {
            // Get HSL values for color manipulation
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            // Set primary color
            root.style.setProperty('--primary', `${rgb.r} ${rgb.g} ${rgb.b}`);
            
            // Generate color scheme based on primary color
            if (isDarkMode) {
                // Dark mode: darker backgrounds, lighter text
                const bgHsl = { ...hsl, s: Math.min(hsl.s * 0.15, 20), l: 8 };
                const bg = hslToRgb(bgHsl.h, bgHsl.s, bgHsl.l);
                
                const mutedHsl = { ...hsl, s: Math.min(hsl.s * 0.2, 25), l: 15 };
                const muted = hslToRgb(mutedHsl.h, mutedHsl.s, mutedHsl.l);
                
                const borderHsl = { ...hsl, s: Math.min(hsl.s * 0.25, 30), l: 20 };
                const border = hslToRgb(borderHsl.h, borderHsl.s, borderHsl.l);
                
                root.style.setProperty('--background', `${bg.r} ${bg.g} ${bg.b}`);
                root.style.setProperty('--foreground', '248 250 252');
                root.style.setProperty('--muted', `${muted.r} ${muted.g} ${muted.b}`);
                root.style.setProperty('--muted-foreground', '148 163 184');
                root.style.setProperty('--border', `${border.r} ${border.g} ${border.b}`);
            } else {
                // Light mode: lighter backgrounds, darker text
                const bgHsl = { ...hsl, s: Math.min(hsl.s * 0.05, 5), l: 99 };
                const bg = hslToRgb(bgHsl.h, bgHsl.s, bgHsl.l);
                
                const mutedHsl = { ...hsl, s: Math.min(hsl.s * 0.1, 10), l: 97 };
                const muted = hslToRgb(mutedHsl.h, mutedHsl.s, mutedHsl.l);
                
                const borderHsl = { ...hsl, s: Math.min(hsl.s * 0.15, 15), l: 92 };
                const border = hslToRgb(borderHsl.h, borderHsl.s, borderHsl.l);
                
                root.style.setProperty('--background', `${bg.r} ${bg.g} ${bg.b}`);
                root.style.setProperty('--foreground', '15 23 42');
                root.style.setProperty('--muted', `${muted.r} ${muted.g} ${muted.b}`);
                root.style.setProperty('--muted-foreground', '100 116 139');
                root.style.setProperty('--border', `${border.r} ${border.g} ${border.b}`);
            }
            
            // Set accent (slightly different from primary)
            const accentHsl = { ...hsl, l: Math.min(hsl.l + 10, 90) };
            const accent = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);
            root.style.setProperty('--accent', `${accent.r} ${accent.g} ${accent.b}`);
        }
        
        this.isDarkMode = isDarkMode;
    }
    
    setupElements() {
        const copyButton = document.getElementById('copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.handleCopy());
        }
        
        const editButton = document.getElementById('edit-button');
        if (editButton) {
            editButton.addEventListener('click', () => this.handleEdit());
        }
    }
    
    render() {
        this.renderContextPills();
        this.renderPromptText();
        this.renderSettingsPills();
        this.renderFileTree();
    }
    
    renderContextPills() {
        const container = document.getElementById('context-pills');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.config.context.forEach(context => {
            const pill = this.createContextPill(context);
            container.appendChild(pill);
        });
    }
    
    createContextPill(context) {
        const pill = document.createElement('div');
        pill.className = 'px-2 py-0.5 rounded-lg text-[0.65rem] font-medium animate-slide-in flex items-center gap-1';
        
        let icon = '';
        
        // Use dynamic color classes for all pills
        if (this.isDarkMode) {
            pill.className += ' bg-dynamic-primary/10 text-dynamic-foreground border border-dynamic-primary/30';
        } else {
            pill.className += ' bg-dynamic-primary/0 text-dynamic-foreground border border-dynamic-primary/20';
        }
        
        if (context.startsWith('@')) {
            // @mentions - just show the text
            pill.innerHTML = '<span>' + context + '</span>';
        } else if (context.startsWith('http://') || context.startsWith('https://')) {
            // Web URLs show world icon
            icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/></svg>';
            pill.innerHTML = icon + '<span>' + context + '</span>';
        } else if (context.startsWith('#')) {
            // Any hashtag context shows image icon
            icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>';
            // Remove hash from display
            pill.innerHTML = icon + '<span>' + context.substring(1) + '</span>';
        } else if (context.includes('.')) {
            // File context (contains a dot)
            icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm2 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm-1 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>';
            pill.innerHTML = icon + '<span>' + context + '</span>';
        } else {
            // Generic context
            pill.innerHTML = '<span>' + context + '</span>';
        }
        return pill;
    }
    
    renderPromptText() {
        const promptText = document.getElementById('prompt-text');
        const placeholder = document.getElementById('prompt-placeholder');
        
        if (!promptText || !placeholder) return;
        
        if (this.config.prompt) {
            promptText.innerHTML = this.highlightMentions(this.config.prompt);
            placeholder.style.display = 'none';
        } else {
            promptText.innerHTML = '';
            placeholder.style.display = 'block';
        }
    }
    
    renderSettingsPills() {
        const container = document.getElementById('settings-pills');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Mode pill (first)
        const modePill = this.createSettingPill(this.capitalizeFirst(this.config.mode), 'mode');
        container.appendChild(modePill);
        
        // Model pill (second)
        const modelPill = this.createSettingPill(this.config.model, 'model');
        container.appendChild(modelPill);
        
        // Thinking pill (if enabled)
        if (this.config.thinking) {
            const thinkingPill = this.createSettingPill('Thinking', 'thinking');
            container.appendChild(thinkingPill);
        }
        
        // MAX pill (if enabled)
        if (this.config.max) {
            const maxPill = this.createSettingPill('MAX', 'max');
            container.appendChild(maxPill);
        }
    }
    
    createSettingPill(text, type) {
        const pill = document.createElement('div');
        pill.className = 'rounded-full text-xs font-medium flex items-center gap-1.5';
        
        let icon = '';
        
        // Use different styling based on pill type
        if (type === 'mode') {
            // Mode pill keeps the background
            if (this.isDarkMode) {
                pill.className += ' px-3 py-2 bg-dynamic-primary/20 text-dynamic-foreground border border-dynamic-primary/30';
            } else {
                pill.className += ' px-3 py-2 bg-dynamic-primary/10 text-dynamic-foreground border border-dynamic-primary/20';
            }
        } else {
            // Model, thinking, and max pills only have text color
            pill.className += ' pl-1 text-dynamic-primary';
        }
        
        switch (type) {
            case 'model':
                pill.innerHTML = '<span>' + text + '</span>';
                break;
            case 'mode':
                // Add icon based on mode type
                const modeType = text.toLowerCase();
                switch (modeType) {
                    case 'agent':
                        icon = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.18 8.04c-.78-.84-1.92-1.54-3.18-1.54-1.44 0-2.7.93-3.48 2.25-.78-1.32-2.04-2.25-3.48-2.25-1.26 0-2.4.7-3.18 1.54-.87.94-1.36 2.11-1.36 3.46 0 1.35.49 2.52 1.36 3.46.78.84 1.92 1.54 3.18 1.54 1.44 0 2.7-.93 3.48-2.25.78 1.32 2.04 2.25 3.48 2.25 1.26 0 2.4-.7 3.18-1.54.87-.94 1.36-2.11 1.36-3.46 0-1.35-.49-2.52-1.36-3.46z"/></svg>';
                        break;
                    case 'chat':
                        icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>';
                        break;
                    case 'manual':
                        icon = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
                        break;
                    case 'cloud':
                        icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/></svg>';
                        break;
                    default:
                        icon = '';
                }
                
                pill.innerHTML = icon + '<span>' + text + '</span>';
                break;
            case 'thinking':
                // Brain icon for thinking mode
                icon = '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.864 8.465a3.505 3.505 0 0 0-3.03-4.449A3.005 3.005 0 0 0 14 2a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 2c-1.301 0-2.41.831-2.825 2.015a3.505 3.505 0 0 0-3.039 4.45A4.028 4.028 0 0 0 2 12c0 1.075.428 2.086 1.172 2.832A4.067 4.067 0 0 0 3 16c0 1.957 1.412 3.59 3.306 3.934A3.515 3.515 0 0 0 9.5 22c.979 0 1.864-.407 2.5-1.059A3.484 3.484 0 0 0 14.5 22a3.51 3.51 0 0 0 3.19-2.06 4.006 4.006 0 0 0 3.138-5.108A4.003 4.003 0 0 0 22 12a4.028 4.028 0 0 0-2.136-3.535zM9.5 20c-.711 0-1.33-.504-1.47-1.198L7.818 18H7c-1.103 0-2-.897-2-2 0-.352.085-.682.253-.981l.456-.816-.784-.51A2.019 2.019 0 0 1 4 12c0-.977.723-1.824 1.682-1.972l1.693-.26-1.059-1.346a1.502 1.502 0 0 1 1.498-2.39L9 6.207V5a1 1 0 0 1 2 0v13.5c0 .827-.673 1.5-1.5 1.5zm9.575-6.308-.784.51.456.816c.168.3.253.63.253.982 0 1.103-.897 2-2.05 2h-.818l-.162.802A1.502 1.502 0 0 1 14.5 20c-.827 0-1.5-.673-1.5-1.5V5c0-.552.448-1 1-1s1 .448 1 1.05v1.207l1.186-.225a1.502 1.502 0 0 1 1.498 2.39l-1.059 1.347 1.693.26A2.002 2.002 0 0 1 20 12c0 .683-.346 1.315-.925 1.692z"></path></svg>';
                pill.innerHTML = icon + '<span>' + text + '</span>';
                break;
            case 'max':
                // Lightning bolt icon for MAX mode
                icon = '<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>';
                pill.innerHTML = icon + '<span>' + text + '</span>';
                break;
        }
        
        return pill;
    }
    
    highlightMentions(text) {
        return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    async handleCopy() {
        if (!this.config.prompt) {
            this.showNotification('No prompt to copy');
            return;
        }
        
        await this.copyToClipboard(this.config.prompt);
        this.showNotification('Prompt copied to clipboard!');
    }
    
    handleEdit() {
        // Get current query string
        const queryString = window.location.search;
        
        // Get current URL path parts
        const pathParts = window.location.pathname.split('/');
        
        // Find index of 'embed-preview' and replace with 'embed'
        const embedPreviewIndex = pathParts.findIndex(part => part === 'embed-preview');
        if (embedPreviewIndex !== -1) {
            pathParts[embedPreviewIndex] = 'embed';
        } else {
            // Fallback: just append /embed/ if embed-preview not found
            pathParts.push('embed');
        }
        
        // Construct new URL
        const newPath = pathParts.join('/');
        const newUrl = window.location.origin + newPath + queryString;
        
        // Open in new tab
        window.open(newUrl, '_blank');
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
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('opacity-0');
        notification.classList.add('opacity-100');
        
        setTimeout(() => {
            notification.classList.remove('opacity-100');
            notification.classList.add('opacity-0');
        }, 2000);
    }
    
    buildFileTree(paths) {
        const tree = {};
        
        paths.forEach(path => {
            // Check if the path ends with an asterisk
            const isHighlighted = path.endsWith('*');
            // Remove asterisk if present
            const cleanPath = isHighlighted ? path.slice(0, -1) : path;
            
            const parts = cleanPath.split('/');
            let current = tree;
            
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = {
                        name: part,
                        isFile: index === parts.length - 1,
                        isHighlighted: index === parts.length - 1 && isHighlighted,
                        children: {}
                    };
                }
                if (index < parts.length - 1) {
                    current = current[part].children;
                }
            });
        });
        
        return tree;
    }
    
    renderFileTree() {
        const sidebar = document.getElementById('file-sidebar');
        const treeContainer = document.getElementById('file-tree');
        
        if (!sidebar || !treeContainer) return;
        
        // Show/hide sidebar based on whether there are files
        if (this.config.filetree && this.config.filetree.length > 0) {
            sidebar.classList.remove('hidden');
            
            // Build tree structure
            const tree = this.buildFileTree(this.config.filetree);
            
            // Clear existing content
            treeContainer.innerHTML = '';
            
            // Render tree
            this.renderTreeNode(tree, treeContainer, 0);
        } else {
            sidebar.classList.add('hidden');
        }
    }
    
    renderTreeNode(node, container, level) {
        const sortedKeys = Object.keys(node).sort((a, b) => {
            // Folders first, then files
            const aIsFile = node[a].isFile;
            const bIsFile = node[b].isFile;
            if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
            return a.localeCompare(b);
        });
        
        sortedKeys.forEach(key => {
            const item = node[key];
            const itemElement = document.createElement('div');
            
            // Add highlighting class if the file is marked
            if (item.isHighlighted) {
                itemElement.className = 'flex items-center gap-1 py-0.5 px-1.5 bg-dynamic-primary/20 rounded cursor-pointer text-xs text-dynamic-foreground font-medium transition-all hover:bg-dynamic-primary/30';
            } else {
                itemElement.className = 'flex items-center gap-1 py-0.5 px-1.5 hover:bg-dynamic-primary/10 rounded cursor-pointer text-xs text-dynamic-foreground/80 hover:text-dynamic-foreground transition-colors';
            }
            
            itemElement.style.paddingLeft = `${level * 12 + 6}px`;
            
            // Add icon
            const icon = document.createElement('span');
            icon.className = 'flex-shrink-0';
            
            if (item.isFile) {
                // File icon with different colors based on extension
                const ext = key.split('.').pop().toLowerCase();
                let iconColor = 'text-dynamic-muted-foreground';
                
                // If highlighted, use primary color for icon
                if (item.isHighlighted) {
                    iconColor = 'text-dynamic-primary';
                } else {
                    // Color code common file types
                    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
                        iconColor = 'text-yellow-500';
                    } else if (['css', 'scss', 'sass', 'less'].includes(ext)) {
                        iconColor = 'text-blue-500';
                    } else if (['html', 'htm'].includes(ext)) {
                        iconColor = 'text-orange-500';
                    } else if (['vue', 'svelte'].includes(ext)) {
                        iconColor = 'text-green-500';
                    } else if (['json', 'xml', 'yaml', 'yml'].includes(ext)) {
                        iconColor = 'text-purple-500';
                    } else if (['md', 'mdx'].includes(ext)) {
                        iconColor = 'text-gray-500';
                    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                        iconColor = 'text-pink-500';
                    }
                }
                
                icon.innerHTML = `<svg class="w-3 h-3 ${iconColor}" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm2 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7zm-1 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>`;
            } else {
                // Folder icon
                icon.innerHTML = '<svg class="w-3 h-3 text-dynamic-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>';
            }
            
            // Add name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'truncate flex-1';
            nameSpan.textContent = item.name;
            
            itemElement.appendChild(icon);
            itemElement.appendChild(nameSpan);
            
            // Add a star indicator for highlighted files
            if (item.isHighlighted) {
                const starIcon = document.createElement('span');
                starIcon.className = 'ml-auto text-dynamic-primary';
                starIcon.innerHTML = '<svg class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                itemElement.appendChild(starIcon);
            }
            
            container.appendChild(itemElement);
            
            // Recursively render children
            if (!item.isFile && Object.keys(item.children).length > 0) {
                this.renderTreeNode(item.children, container, level + 1);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.embedPreview = new EmbedPreview();
});

// Expose API for external usage
window.EmbedPreviewAPI = {
    getPrompt: () => window.embedPreview?.config.prompt,
    setPrompt: (prompt) => {
        if (window.embedPreview) {
            window.embedPreview.config.prompt = prompt;
            window.embedPreview.renderPromptText();
        }
    },
    updateConfig: (config) => {
        if (window.embedPreview) {
            Object.assign(window.embedPreview.config, config);
            window.embedPreview.render();
        }
    }
}; 