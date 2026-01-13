const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const rootDir = __dirname;
const assetsDir = path.join(rootDir, 'assets');

// Ensure directories exist
['css', 'js', 'webfonts'].forEach(dir => {
    const fullPath = path.join(assetsDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

function getWithRedirects(inputUrl, callback) {
    const req = https.get(inputUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
            let location = response.headers.location;
            if (location) {
                // Resolve relative URLs
                const nextUrl = new URL(location, inputUrl).toString();
                console.log(`Redirecting to ${nextUrl}...`);
                getWithRedirects(nextUrl, callback);
            } else {
                callback(response);
            }
        } else {
            callback(response);
        }
    });

    req.on('error', (err) => {
        console.error(`Error fetching ${inputUrl}:`, err.message);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        getWithRedirects(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        });
    });
}

function downloadContent(url) {
    return new Promise((resolve, reject) => {
        getWithRedirects(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download content from ${url}: ${response.statusCode}`));
                return;
            }
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => resolve(data));
        });
    });
}

async function main() {
    console.log('Starting asset localization...');

    // 1. Tailwind CSS
    console.log('Downloading Tailwind CSS...');
    try {
        await downloadFile('https://cdn.tailwindcss.com', path.join(assetsDir, 'js', 'tailwindcss.js'));
    } catch (e) { console.error(e); }

    // 2. AOS
    console.log('Downloading AOS...');
    try {
        await downloadFile('https://unpkg.com/aos@2.3.1/dist/aos.css', path.join(assetsDir, 'css', 'aos.css'));
        await downloadFile('https://unpkg.com/aos@2.3.1/dist/aos.js', path.join(assetsDir, 'js', 'aos.js'));
    } catch (e) { console.error(e); }

    // 3. FontAwesome
    console.log('Processing FontAwesome...');
    const faCssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    const faBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/';

    try {
        let faCssContent = await downloadContent(faCssUrl);

        // Find all font files referenced
        const urlRegex = /url\(['"]?\.\.\/webfonts\/([^'"]+)['"]?\)/g;
        let match;
        const fontFiles = new Set();

        while ((match = urlRegex.exec(faCssContent)) !== null) {
            fontFiles.add(match[1]); // e.g., fa-solid-900.woff2
        }

        console.log(`Found ${fontFiles.size} FontAwesome fonts to download.`);

        // Download fonts
        for (const fontFile of fontFiles) {
            const cleanFontFile = fontFile.split('?')[0];
            const fontUrl = faBaseUrl + fontFile;
            const dest = path.join(assetsDir, 'webfonts', cleanFontFile);
            console.log(`Downloading ${cleanFontFile}...`);
            try {
                await downloadFile(fontUrl, dest);
            } catch (e) {
                console.error(`Error downloading ${fontUrl}:`, e.message);
            }
        }

        // Save CSS
        fs.writeFileSync(path.join(assetsDir, 'css', 'fontawesome.css'), faCssContent);
    } catch (error) {
        console.error('Error processing FontAwesome:', error);
    }

    // 4. Update HTML Files
    const files = fs.readdirSync(rootDir);
    for (const file of files) {
        if (path.extname(file) === '.html') {
            const filePath = path.join(rootDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;

            // Replace Tailwind
            if (content.includes('https://cdn.tailwindcss.com')) {
                content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '<script src="assets/js/tailwindcss.js"></script>');
                updated = true;
            }

            // Replace AOS CSS
            if (content.includes('https://unpkg.com/aos@2.3.1/dist/aos.css')) {
                content = content.replace(/href="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.css"/g, 'href="assets/css/aos.css"');
                updated = true;
            }

            // Replace AOS JS
            if (content.includes('https://unpkg.com/aos@2.3.1/dist/aos.js')) {
                content = content.replace(/src="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.js"/g, 'src="assets/js/aos.js"');
                updated = true;
            }

            // Replace FontAwesome
            if (content.includes('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css')) {
                content = content.replace(/href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css"/g, 'href="assets/css/fontawesome.css"');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated assets in ${file}`);
            }
        }
    }
    console.log('Asset localization complete.');
}

main();
