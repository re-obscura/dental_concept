const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const files = fs.readdirSync(rootDir);

const linksToRemove = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com',
    'https://unpkg.com'
];

files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(rootDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let initialContent = content;

        linksToRemove.forEach(link => {
            // Regex to match the full link tag containing the href
            // <link rel="preconnect" href="..."> or with attributes swapped
            const regex = new RegExp(`<link[^>]*href=["']${link.replace(/\./g, '\\.')}["'][^>]*>`, 'gi');
            content = content.replace(regex, '');
        });

        // Clean up empty lines left behind (optional, but good for cleanliness)
        // This simple regex looks for blank lines that might have resulted
        content = content.replace(/^\s*[\r\n]/gm, '');

        if (content !== initialContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Cleaned preconnects in ${file}`);
        }
    }
});
