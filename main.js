/**
 * Yang Liu Academic Homepage
 * Load content from content/ directory
 */

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
        if (!json || !json.publications) return '';
        
        let html = '<div class="publications-list">';
        
        json.publications.forEach(pub => {
            html += this.renderPublication(pub);
        });
        
        html += '</div>';
        return html;
    },

    renderPublication(pub) {
        // Process authors - handle *** for equal contribution
        const authors = pub.authors
            .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong>$1*</strong>')
            .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

        // Build venue string
        let venue = `<em>${pub.venue}, ${pub.year}`;
        if (pub.note) {
            venue += ` (${pub.note})`;
        }
        venue += '</em>';

        // Build links in priority order
        const linkParts = [];
        this.linkPriority.forEach(key => {
            if (pub.links && pub.links[key]) {
                const label = this.linkLabels[key] || key;
                linkParts.push(`<a href="${pub.links[key]}" target="_blank">${label}</a>`);
            }
        });

        // Add any remaining links not in priority
        if (pub.links) {
            Object.keys(pub.links).forEach(key => {
                if (!this.linkPriority.includes(key)) {
                    linkParts.push(`<a href="${pub.links[key]}" target="_blank">${key}</a>`);
                }
            });
        }

        const linksHtml = linkParts.join(' · ');

        return `
            <div class="publication-item">
                <div class="pub-title">${pub.title}</div>
                <div class="pub-authors">${authors}</div>
                <div class="pub-meta"><span class="pub-venue">${venue}</span> · ${linksHtml}</div>
            </div>
        `;
    }
};

// ============================================
// Simple Markdown Parser
// ============================================
const Markdown = {
    parse(md) {
        if (!md) return '';
        // Split by double newline to create paragraphs
        return md.split('\n\n').map(paragraph => {
            if (!paragraph.trim()) return '';
            return '<p>' + paragraph
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                .replace(/\n/g, '<br>') + '</p>';
        }).join('');
    },

    parseNews(md) {
        if (!md) return '';
        const lines = md.split('\n').filter(line => line.trim());
        let html = '<div class="news-list">';
        
        lines.forEach(line => {
            const match = line.match(/^-?\s*\*\*\[(.*?)\]\*\*\s*(.+)$/);
            if (match) {
                const date = match[1];
                let content = match[2]
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                html += `<div class="news-item"><span class="news-date">${date}</span><span class="news-content-text">${content}</span></div>`;
            }
        });
        
        html += '</div>';
        return html;
    },



    parseExperience(md) {
        if (!md) return '';
        const sections = md.split('###').filter(s => s.trim());
        let html = '<div class="experience-list">';
        
        sections.forEach(section => {
            const lines = section.split('\n').filter(l => l.trim());
            if (lines.length < 1) return;
            
            const category = lines[0].trim();
            let itemsHtml = '';
            
            let i = 1;
            while (i < lines.length) {
                const line = lines[i];
                const match = line.match(/\*\*(.*?)\*\*\s*·\s*(.+?)\s*·\s*(.+)/);
                if (match) {
                    const title = match[1];
                    const institution = match[2];
                    const date = match[3];
                    
                    let subtitle = '';
                    let description = '';
                    
                    i++;
                    while (i < lines.length && !lines[i].match(/\*\*(.*?)\*\*\s*·/)) {
                        const descLine = lines[i].trim();
                        if (descLine) {
                            if (descLine.startsWith('Advisor:') || descLine.startsWith('Collaborated')) {
                                subtitle = descLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
                            } else {
                                description = descLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
                            }
                        }
                        i++;
                    }
                    
                    itemsHtml += `
                        <div class="experience-item">
                            <div class="exp-header">
                                <span class="exp-title">${title} · ${institution}</span>
                                <span class="exp-date">${date}</span>
                            </div>
                            ${subtitle ? `<div class="exp-subtitle">${subtitle}</div>` : ''}
                            ${description ? `<div class="exp-description">${description}</div>` : ''}
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
        const lines = md.split('\n').filter(l => l.trim());
        let html = '<div class="awards-list">';
        
        lines.forEach(line => {
            const match = line.match(/^-?\s*(?:[\u{1F300}-\u{1F9FF}]\s*)?\*\*(.*?)\*\*[,\s]+(.+?)\s*·\s*(.+)$/u);
            if (match) {
                const award = match[1];
                const event = match[2];
                const year = match[3];
                
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
        const sections = md.split('###').filter(s => s.trim());
        let html = '<div class="services-list">';
        
        sections.forEach(section => {
            const lines = section.split('\n').filter(l => l.trim());
            if (lines.length < 1) return;
            
            const category = lines[0].trim();
            let itemsHtml = '';
            
            lines.slice(1).forEach(line => {
                if (line.startsWith('-')) {
                    const match = line.match(/-?\s*\*\*(.*?)\*\*\s*(.+)/);
                    if (match) {
                        const conf = match[1];
                        let yearsHtml = match[2]
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                            .trim();
                        
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
// Embedded Content (Fallback when fetch fails)
// ============================================
const EmbeddedContent = {
    biography: `I am a second-year Ph.D. student at [MiLab](https://milab.westlake.edu.cn), School of Engineering, Westlake University, advised by [Assoc. Prof. Donglin Wang](https://www.westlake.edu.cn/faculty/donglin-wang.html). Prior to this, I received my master's degree at School of Computer Science & Technology, Soochow University, advised by [Prof. Shoushan Li](https://scholar.google.com.hk/citations?user=ZRGSxdUAAAAJ) and [Assoc. Prof. Dong Zhang](https://scholar.google.com/citations?user=1E_WmCUAAAAJ). I received my bachelor's degree from School of Software, Henan University, advised by [Lec. Zhen Wang](http://software.henu.edu.cn/info/1327/2254.htm).\n\nMy research interest lies in the intersection of **Embodied AI (EAI)**, **Computer Vision (CV)**, and **Natural Language Processing (NLP)**.\n\n📢 **I am actively seeking academic internship opportunities within leading enterprises.** Please feel free to contact me if you are interested!`,

    news: `## News\n\n- **[2026.03]** One paper ([MMaDA-VLA](https://yliu-cs.github.io/MMaDA-VLA)) released on arXiv\n- **[2026.02]** One paper ([HiF-VLA](https://hifvla.github.io/)) got accepted by **CVPR 2026**\n- **[2026.02]** One paper ([FRAPPE](https://h-zhao1997.github.io/frappe)) released on arXiv\n- **[2025.09]** One paper ([SSR](https://yliu-cs.github.io/SSR)) got accepted by **NeurIPS 2025**\n- **[2025.08]** One paper ([Long-VLA](https://long-vla.github.io)) got accepted by **CoRL 2025**\n- **[2025.05]** One paper ([OpenHelix](https://openhelix-robot.github.io)) released on arXiv\n- **[2024.07]** One paper ([PiTe](https://doi.org/10.1007/978-3-031-72652-1_10)) got accepted by **ECCV 2024** (_Oral_)`,


    experience: `## Education & Experience

### Education

**Ph.D. in Electronic Science and Technology** · Westlake University · 2024.09 - Present
Advisor: [Assoc. Prof. Donglin Wang](https://www.westlake.edu.cn/faculty/donglin-wang.html)

**M.S. in Computer Science and Technology** · Soochow University · 2021.09 - 2024.06
Advisor: [Prof. Shoushan Li](https://scholar.google.com.hk/citations?user=ZRGSxdUAAAAJ), [Assoc. Prof. Dong Zhang](https://scholar.google.com/citations?user=1E_WmCUAAAAJ)
Scholarships: First Prize (2021), Third Prize (2022), First Prize (2023)

**B.S. in Software Engineering** · Henan University · 2017.09 - 2021.06
Advisor: [Lec. Zhen Wang](http://software.henu.edu.cn/info/1327/2254.htm)
ACM-ICPC Training Team Captain (2019-2020) · Scholarship & Merit Student (2018-2020) · Excellent Graduates (2021)

### Internships

**Machine Intelligence Laboratory (MiLAB), Westlake University** · Visiting Intern · 2023.12 - 2024.08
Advisor: [Prof. Donglin Wang](https://www.westlake.edu.cn/faculty/donglin-wang.html)
Collaborated with [Ph.D. Siteng Huang](https://kyonhuang.top) & [Ph.D. Stu. Pengxiang Ding](https://dingpx.github.io)
Trajectory-Guided Video-Language Alignment across both Spatial and Temporal dimensions

**NetEase Games** · Game Development Engineer Intern · 2020.07 - 2020.09
Team collaboration application via Electron-Vue and Spring Boot · Mapping application by Python Imaging Library (PIL) and PyQt5 · Road recognition and pathfinding based on [recastnavigation](https://github.com/recastnavigation/recastnavigation)`,

    awards: `## Awards

- **Silver Medal**, ICPC Asia-East Continent Final · 2019.12
- **Gold Medal**, ACM-ICPC Henan Provincial Contest · 2019.05
- **Gold Medal**, China Collegiate Programming Contest - Henan Provincial · 2019.04
- **Team Gold Medal**, Group Programming Ladder Tournament National Finals · 2019.04
- **Bronze Medal**, ICPC Asia Nanjing Regional Contest · 2019.10
- **Bronze Medal**, China Collegiate Programming Contest (Qinhuangdao) · 2019.09
- **Bronze Medal**, ICPC China Xi'an National Invitational · 2019.05
- **Second Prize**, Lanqiao Cup Programming Competition B Group National Finals · 2019.05
- **Bronze Medal**, ACM-ICPC Asia Regional (Xuzhou) · 2018.10
- **Second Prize**, Group Programming Ladder Tournament National Finals · 2018.05`,

    services: `## Services

### Conference Reviewer
- **ECCV** ([2026](https://eccv.ecva.net/Conferences/2026))
- **ICML** ([2026](https://icml.cc/Conferences/2026))
- **CVPR** ([2026](https://cvpr.thecvf.com/Conferences/2026), [2025](https://cvpr.thecvf.com/Conferences/2025))
- **ICCV** ([2025](https://iccv.thecvf.com/Conferences/2025))
- **NeurIPS** ([2024](https://neurips.cc/Conferences/2024))
- **ICMR** ([2024](https://icmr2024.org))
- **EMNLP** ([2023](https://2023.emnlp.org))
- **ACM MM** ([2025](https://acmmm2025.org), [2023](https://www.acmmm2023.org))
- **COLING** ([2022](https://coling2022.org))`
};

// ============================================
// Load Content from External Files or Embedded
// ============================================
async function loadContent() {
    // Load markdown-based content from content/ directory
    const contentMap = [
        { id: 'biography-content', file: 'content/biography.md', parser: 'parse' },
        { id: 'news-content', file: 'content/news.md', parser: 'parseNews' },
        { id: 'experience-content', file: 'content/experience.md', parser: 'parseExperience' },
        { id: 'awards-content', file: 'content/awards.md', parser: 'parseAwards' },
        { id: 'services-content', file: 'content/services.md', parser: 'parseServices' }
    ];
    
    for (const item of contentMap) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        
        try {
            const response = await fetch(item.file);
            if (response.ok) {
                const md = await response.text();
                if (md && Markdown[item.parser]) {
                    element.innerHTML = Markdown[item.parser](md);
                }
            } else {
                console.error(`Failed to load ${item.file}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error loading ${item.file}:`, error);
        }
    }

    // Load publications from JSON
    await loadPublications();
}

async function loadPublications() {
    const element = document.getElementById('publications-content');
    if (!element) return;
    
    try {
        const response = await fetch('content/publications.json');
        if (response.ok) {
            const json = await response.json();
            element.innerHTML = PublicationsRenderer.render(json);
        } else {
            console.error(`Failed to load publications.json: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading publications.json:', error);
    }
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
