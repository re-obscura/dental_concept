const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const files = fs.readdirSync(rootDir);

const schemaData = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "Lorton Dentist",
    "description": "Comprehensive dental care in Lorton, VA tailored to your needs.",
    "slogan": "Your Best Family Dentist in Lorton Virginia",
    "openingHours": "Mo,Tu,We,Th,Fr 08:00-17:00, Sa 09:30-15:00",
    "telephone": "+15715417977",
    "email": "Soyferv@yahoo.com",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lorton",
        "addressRegion": "VA",
        "postalCode": "22079",
        "streetAddress": "7772 Grandwind Dr"
    },
    "paymentAccepted": "Cash, Credit Card, Insurance, CareCredit",
    "priceRange": "$$",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.9,
        "reviewCount": 150
    },
    "image": "https://lortondentist.com/logo.png",
    "review": [
        {
            "@type": "Review",
            "author": "Roy C.",
            "description": "I cannot help but express my gratitude to Dr. Soyfer for his professionalism and sensitive attitude towards patients in the field of anesthesiology. During a complex dental treatment, I had to make a number of important decisions regarding pain relief. The doctor explained all possible options in detail and patiently and helped me choose the best one in my case. Thanks to him, the treatment was as comfortable and painless as possible, and the recommendations for recovery were very useful. He is an experienced doctor to whom you can safely trust your health. I recommend!",
            "name": "Professional and sensitive attitude",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": 5
            }
        },
        {
            "@type": "Review",
            "author": "Lynda M.",
            "description": "I would also like to share a positive experience of visiting Dr. Soyfer with my son. My child had an acute toothache due to caries, and I was worried about how he would cope with the treatment. Dr. Soyfer showed amazing kindness and understanding towards my son. He explained all the stages of the procedure in an accessible way and tried to make it as painless as possible. My son was delighted with the toys in the clinic and with the doctor’s approach. The treatment was successful, and now the child is not afraid of dentists. Thank you for your wonderful attitude!",
            "name": "Amazing kindness and understanding",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": 5
            }
        }
    ]
};

const schemaScript = `
    <!-- JSON-LD Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaData, null, 2)}
    </script>
`;

files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(rootDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove existing JSON-LD scripts to avoid duplication (simple regex approach)
        // Matches <script type="application/ld+json"> ... </script> including newlines
        const regexInfo = /<!-- JSON-LD Schema -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi;
        const regexSimple = /<script type="application\/ld\+json">[\s\S]*?<\/script>/gi;

        let newContent = content;

        if (regexInfo.test(content)) {
            newContent = content.replace(regexInfo, schemaScript.trim());
        } else if (regexSimple.test(content)) {
            newContent = content.replace(regexSimple, schemaScript.trim());
        } else {
            // Insert before </head>
            newContent = content.replace('</head>', `${schemaScript}\n</head>`);
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated schema in ${file}`);
    }
});
