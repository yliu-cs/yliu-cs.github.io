/**
 * Yang Liu Academic Homepage
 * Load content from content/ directory
 */

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// Publications Renderer (JSON)
// ============================================
const PublicationsRenderer = {
    // Link labels mapping
    linkLabels: {
        homepage: 'Homepage',
        arxiv: 'arXiv',
        doi: 'DOI',
        code: 'Code',
        dataset: 'Dataset',
        bibtex: 'BibTeX'
    },

    // Link priority order
    linkPriority: ['homepage', 'arxiv', 'doi', 'code', 'dataset', 'bibtex'],

    render(json) {
        if (!json || !Array.isArray(json.publications)) {
            throw new Error('Expected a publications array');
        }
        
        let html = '<div class="publications-list">';
        
        json.publications.forEach(pub => {
            html += this.renderPublication(pub);
        });
        
        html += '</div>';
        return html;
    },

    renderPublication(pub) {
        // Process authors - handle *** for equal contribution
        const authors = escapeHTML(pub.authors)
            .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong>$1*</strong>')
            .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

        // Build venue string
        let venue = `<em>${escapeHTML(pub.venue)}, ${escapeHTML(pub.year)}`;
        if (pub.note) {
            venue += ` (${escapeHTML(pub.note)})`;
        }
        venue += '</em>';

        // Build links in priority order
        const linkParts = [];
        this.linkPriority.forEach(key => {
            if (pub.links && pub.links[key]) {
                const label = this.linkLabels[key] || key;
                linkParts.push(`<a href="${escapeHTML(pub.links[key])}" target="_blank">${label}</a>`);
            }
        });

        // Add any remaining links not in priority
        if (pub.links) {
            Object.keys(pub.links).forEach(key => {
                if (!this.linkPriority.includes(key) && pub.links[key]) {
                    linkParts.push(`<a href="${escapeHTML(pub.links[key])}" target="_blank">${escapeHTML(key)}</a>`);
                }
            });
        }

        const linksHtml = linkParts.join(' · ');

        return `
            <div class="publication-item">
                <div class="pub-title">${escapeHTML(pub.title)}</div>
                <div class="pub-authors">${authors}</div>
                <div class="pub-meta"><span class="pub-venue">${venue}</span>${linksHtml ? ` · ${linksHtml}` : ''}</div>
            </div>
        `;
    }
};

// ============================================
// Simple Markdown Parser
// ============================================
const Markdown = {
    normalize(md) {
        return md.replace(/\r\n?/g, '\n');
    },

    inline(text) {
        // Render supported inline Markdown without treating URL characters as formatting.
        const tokens = /\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)|\*\*(.+?)\*\*|\*([^*\n]+)\*|(?<!\w)_([^_\n]+)_(?!\w)/g;
        let html = '';
        let offset = 0;
        for (const match of text.matchAll(tokens)) {
            html += escapeHTML(text.slice(offset, match.index));
            if (match[1] !== undefined) {
                html += `<a href="${escapeHTML(match[2])}" target="_blank">${this.inline(match[1])}</a>`;
            } else if (match[3] !== undefined) {
                html += `<strong>${this.inline(match[3])}</strong>`;
            } else {
                html += `<em>${escapeHTML(match[4] ?? match[5])}</em>`;
            }
            offset = match.index + match[0].length;
        }
        return html + escapeHTML(text.slice(offset));
    },

    parse(md) {
        if (!md) return '';
        // Split by double newline to create paragraphs
        return this.normalize(md).split(/\n\s*\n/).map(paragraph => {
            if (!paragraph.trim()) return '';
            return '<p>' + this.inline(paragraph.trim())
                .replace(/\n/g, '<br>') + '</p>';
        }).join('');
    },

    parseNews(md) {
        if (!md) return '';
        const lines = this.normalize(md).split('\n').map(line => line.trim()).filter(Boolean);
        let html = '<div class="news-list">';
        
        lines.forEach(line => {
            const match = line.match(/^-?\s*\*\*\[(.*?)\]\*\*\s*(.+)$/);
            if (match) {
                const date = escapeHTML(match[1]);
                const content = this.inline(match[2]);
                
                html += `<div class="news-item"><span class="news-date">${date}</span><span class="news-content-text">${content}</span></div>`;
            }
        });
        
        html += '</div>';
        return html;
    },



    parseExperience(md) {
        if (!md) return '';
        const sections = this.normalize(md).split(/^###\s+/m).filter(s => s.trim());
        const entryPattern = /^\*\*(.+?)\*\*\s*·\s*(.+?)\s*·\s*(.+)$/;
        let html = '<div class="experience-list">';
        
        sections.forEach(section => {
            const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
            if (lines.length < 1) return;
            
            const category = this.inline(lines[0]);
            let itemsHtml = '';
            
            let i = 1;
            while (i < lines.length) {
                const line = lines[i];
                const match = line.match(entryPattern);
                if (match) {
                    const title = this.inline(match[1]);
                    const institution = this.inline(match[2]);
                    const date = escapeHTML(match[3]);
                    
                    const details = [];
                    
                    i++;
                    while (i < lines.length && !entryPattern.test(lines[i])) {
                        const descLine = lines[i].trim();
                        if (descLine) {
                            const className = descLine.startsWith('Advisor:') || descLine.startsWith('Collaborated')
                                ? 'exp-subtitle' : 'exp-description';
                            details.push(`<div class="${className}">${this.inline(descLine)}</div>`);
                        }
                        i++;
                    }
                    
                    itemsHtml += `
                        <div class="experience-item">
                            <div class="exp-header">
                                <span class="exp-title">${title} · ${institution}</span>
                                <span class="exp-date">${date}</span>
                            </div>
                            ${details.join('')}
                        </div>
                    `;
                } else {
                    i++;
                }
            }
            
            if (itemsHtml) {
                html += `
                    <div class="experience-category">
                        <div class="experience-category-title">${category}</div>
                        <div class="experience-items">${itemsHtml}</div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    },

    parseAwards(md) {
        if (!md) return '';
        const lines = this.normalize(md).split('\n').map(line => line.trim()).filter(Boolean);
        let html = '<div class="awards-list">';
        
        lines.forEach(line => {
            const match = line.match(/^-?\s*(?:[\u{1F300}-\u{1F9FF}]\s*)?\*\*(.*?)\*\*[,\s]+(.+?)\s*·\s*(.+)$/u);
            if (match) {
                const award = this.inline(match[1]);
                const event = this.inline(match[2]);
                const year = escapeHTML(match[3]);
                
                html += `
                    <div class="award-item">
                        <span class="award-name"><strong>${award}</strong>, ${event}</span>
                        <span class="award-year">${year}</span>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    },

    parseServices(md) {
        if (!md) return '';
        const sections = this.normalize(md).split(/^###\s+/m).filter(s => s.trim());
        let html = '<div class="services-list">';
        
        sections.forEach(section => {
            const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
            if (lines.length < 1) return;
            
            const category = this.inline(lines[0]);
            let itemsHtml = '';
            
            lines.slice(1).forEach(line => {
                if (line.startsWith('-')) {
                    const match = line.match(/^-\s*\*\*(.*?)\*\*\s*(.*)$/);
                    if (match) {
                        const conf = this.inline(match[1]);
                        const yearsHtml = this.inline(match[2]);
                        
                        itemsHtml += `
                            <div class="service-item">
                                <span class="service-conf">${conf}</span>
                                <span class="service-year">${yearsHtml}</span>
                            </div>
                        `;
                    }
                }
            });
            
            if (itemsHtml) {
                html += `
                    <div class="service-category">
                        <div class="service-title">${category}</div>
                        <div class="service-items">${itemsHtml}</div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }
};

// ============================================
// Load each content section independently
// ============================================
async function loadContent() {
    // Keep the inline biography for first paint, then refresh it from Markdown.
    const fetchMap = [
        { id: 'biography-content', file: 'content/biography.md', parser: 'parse' },
        { id: 'news-content', file: 'content/news.md', parser: 'parseNews' },
        { id: 'experience-content', file: 'content/experience.md', parser: 'parseExperience' },
        { id: 'awards-content', file: 'content/awards.md', parser: 'parseAwards' },
        { id: 'services-content', file: 'content/services.md', parser: 'parseServices' },
        { id: 'publications-content', file: 'content/publications.json', type: 'json' }
    ];

    async function loadSection(item) {
        const element = document.getElementById(item.id);
        if (!element) return;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const retryButton = element.querySelector('.content-retry');
        if (retryButton) retryButton.disabled = true;
        try {
            const response = await fetch(item.file, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            if (!text.trim()) throw new Error('Empty content');
            element.innerHTML = item.type === 'json'
                ? PublicationsRenderer.render(JSON.parse(text))
                : Markdown[item.parser](text);
        } catch (error) {
            console.error(`Unable to load ${item.file}:`, error);
            // Preserve any already displayed content, including the inline biography.
            if (!element.textContent.trim() || retryButton) {
                const message = document.createElement('p');
                message.className = 'content-error';
                message.setAttribute('role', 'status');
                message.textContent = 'Unable to load this section. ';
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'content-retry';
                retry.textContent = 'Retry';
                retry.addEventListener('click', () => loadSection(item));
                message.append(retry);
                element.replaceChildren(message);
            }
        } finally {
            clearTimeout(timeout);
        }
    }

    await Promise.all(fetchMap.map(loadSection));
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// Back to Top
// ============================================
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initNavigation();
    initBackToTop();
    checkServer();
});

// ============================================
// Server Check
// ============================================
function checkServer() {
    if (window.location.protocol === 'file:') {
        console.warn('⚠️  You are opening this page directly from the filesystem.');
        console.warn('   Content must be loaded from content/ directory via HTTP server.');
        console.warn('   Start a local server:');
        console.warn('       python3 -m http.server 8000');
        console.warn('   Then open http://localhost:8000');
    }
}
