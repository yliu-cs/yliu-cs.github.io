const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const { Markdown, PublicationsRenderer } = vm.runInNewContext(
    source + '\n({ Markdown, PublicationsRenderer })',
    { document: { addEventListener() {} }, console }
);
const readContent = name => fs.readFileSync(path.join(root, 'content', name), 'utf8');
const countClass = (html, name) => (html.match(new RegExp(`class="${name}"`, 'g')) || []).length;
const decodeEntities = text => text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'");
const visibleText = html => decodeEntities(html
    .replace(/<(?:\/?(?:div|p)|br)\b[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const markdownText = text => text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
const hrefs = html => Array.from(html.matchAll(/href="([^"]*)"/g), match => decodeEntities(match[1]));

test('every current Markdown entry and link is rendered', () => {
    const sections = [
        ['news.md', 'parseNews', 'news-item', /^\s*-\s+/gm],
        ['experience.md', 'parseExperience', 'experience-item', /^\*\*/gm],
        ['awards.md', 'parseAwards', 'award-item', /^\s*-\s+/gm],
        ['services.md', 'parseServices', 'service-item', /^\s*-\s+/gm]
    ];
    for (const [filename, parser, itemClass, entryPattern] of sections) {
        const input = readContent(filename);
        const html = Markdown[parser](input);
        const expectedCount = (input.match(entryPattern) || []).length;
        assert.ok(expectedCount > 0, `${filename} contains entries`);
        assert.equal(countClass(html, itemClass), expectedCount, filename);
        const renderedLinks = hrefs(html);
        for (const match of input.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
            assert.ok(renderedLinks.includes(match[1]), `${filename}: ${match[1]}`);
        }
    }
});

test('all current experience titles and details remain in source order', () => {
    const input = readContent('experience.md');
    const output = visibleText(Markdown.parseExperience(input));
    let offset = 0;
    for (const line of input.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'))) {
        // Header fields are displayed separately, without the source date separator.
        const parts = line.startsWith('**') ? markdownText(line).split(/\s*·\s*/) : [markdownText(line)];
        for (const expected of parts) {
            const position = output.indexOf(expected, offset);
            assert.ok(position >= offset, `Missing or reordered experience text: ${expected}`);
            offset = position + expected.length;
        }
    }
});

test('experience preserves multiple descriptions interleaved with advisor and collaborator lines', () => {
    const html = Markdown.parseExperience(`### Internships
**Lab** · Research Intern · 2026
First project description
Advisor: [Mentor](https://example.org/mentor)
Second project description
Collaborated with [Colleague](https://example.org/colleague)
Third project description

**Other Lab** · Visiting Intern · 2025
Other project description`);
    assert.equal(countClass(html, 'experience-item'), 2);
    const output = visibleText(html);
    let offset = 0;
    for (const expected of [
        'First project description', 'Advisor: Mentor', 'Second project description',
        'Collaborated with Colleague', 'Third project description', 'Other Lab', 'Other project description'
    ]) {
        const position = output.indexOf(expected, offset);
        assert.ok(position >= offset, `Missing or reordered detail: ${expected}`);
        offset = position + expected.length;
    }
    assert.ok(hrefs(html).includes('https://example.org/mentor'));
    assert.ok(hrefs(html).includes('https://example.org/colleague'));
});

test('a bold description with a middle dot does not terminate its experience item', () => {
    const html = Markdown.parseExperience(`### Education
**Degree** · University · 2024
**Award** · Competition distinction
Following detail

**Next Degree** · Next University · 2025
Next detail`);
    assert.equal(countClass(html, 'experience-item'), 2);
    const firstItem = html.split('<div class="experience-item">')[1];
    assert.ok(visibleText(firstItem).includes('Award · Competition distinction'));
    assert.ok(visibleText(firstItem).includes('Following detail'));
    assert.match(firstItem, /<strong>Award<\/strong>/);
});

test('biography paragraph boundaries survive CRLF and whitespace-only blank lines', () => {
    const html = Markdown.parse('First paragraph\r\n \t\r\nSecond paragraph\r\n\r\nThird paragraph');
    const paragraphs = Array.from(html.matchAll(/<p>([\s\S]*?)<\/p>/g), match => visibleText(match[1]));
    assert.deepEqual(paragraphs, ['First paragraph', 'Second paragraph', 'Third paragraph']);
});

test('indented service list entries keep their conference and year links', () => {
    const html = Markdown.parseServices('### Conference Reviewer\r\n  - **ECCV** ([2026](https://example.org/2026))\r\n\t- **CVPR** ([2025](https://example.org/2025))');
    assert.equal(countClass(html, 'service-item'), 2);
    assert.ok(visibleText(html).includes('ECCV'));
    assert.ok(visibleText(html).includes('CVPR'));
    assert.deepEqual(hrefs(html), ['https://example.org/2026', 'https://example.org/2025']);
});

test('news and awards support inline emphasis and links', () => {
    const news = Markdown.parseNews('- **[2026.01]** Accepted by **Conference** (_Oral_) with *honors*; [paper](https://example.org/paper)');
    assert.match(news, /<strong>Conference<\/strong>/);
    assert.match(news, /<em>Oral<\/em>/);
    assert.match(news, /<em>honors<\/em>/);
    assert.deepEqual(hrefs(news), ['https://example.org/paper']);

    const awards = Markdown.parseAwards('- **Gold Medal**, [Competition](https://example.org/competition) (*Final*) · 2026');
    assert.equal(countClass(awards, 'award-item'), 1);
    assert.match(awards, /<strong>Gold Medal<\/strong>/);
    assert.match(awards, /<em>Final<\/em>/);
    assert.deepEqual(hrefs(awards), ['https://example.org/competition']);
});

test('balanced parentheses and underscores in link URLs are preserved', () => {
    const url = 'https://example.org/paper_(2024)?source=home_page&mode=full';
    for (const [parser, input] of [
        ['parse', `[Paper](${url})`],
        ['parseNews', `- **[2026]** [Paper](${url})`],
        ['parseExperience', `### Education\n**Degree** · University · 2026\nAdvisor: [Paper](${url})`],
        ['parseAwards', `- **Prize**, [Paper](${url}) · 2026`],
        ['parseServices', `### Reviewer\n- **Conference** ([Paper](${url}))`]
    ]) {
        const html = Markdown[parser](input);
        assert.deepEqual(hrefs(html), [url], parser);
        assert.ok(visibleText(html).includes('Paper'), parser);
        if (parser !== 'parseServices') assert.doesNotMatch(html, /<\/a>\)/, parser);
    }
});

test('all current publications retain complete authors and metadata', () => {
    const data = JSON.parse(readContent('publications.json'));
    assert.equal(countClass(PublicationsRenderer.render(data), 'publication-item'), data.publications.length);
    for (const publication of data.publications) {
        const html = PublicationsRenderer.renderPublication(publication);
        const output = visibleText(html);
        assert.ok(output.includes(publication.title.trim()), publication.title);
        assert.ok(output.includes(markdownText(publication.authors)), publication.title);
        assert.ok(output.includes(`${publication.venue}, ${publication.year}`), publication.title);
        if (publication.note) assert.ok(output.includes(`(${publication.note})`), publication.title);
        for (const url of Object.values(publication.links || {})) {
            assert.ok(hrefs(html).includes(url), `${publication.title}: ${url}`);
        }
    }
});

test('author contribution stars stay literal alongside bold names', () => {
    const html = PublicationsRenderer.renderPublication({
        title: 'Paper', authors: '**Yang Liu***, Coauthor*, Other Author', venue: 'Conference', year: '2026', links: {}
    });
    const authors = html.match(/<div class="pub-authors">([\s\S]*?)<\/div>/)[1];
    assert.equal(visibleText(authors), 'Yang Liu*, Coauthor*, Other Author');
    assert.match(authors, /<strong>Yang Liu(?:\*)?<\/strong>/);
    assert.doesNotMatch(authors, /<em>/);
});
