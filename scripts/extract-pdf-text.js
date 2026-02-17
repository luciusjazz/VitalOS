const pdf = require('pdf-parse');
const path = require('path');

async function extractText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        const output = `
--- START OF FILE: ${path.basename(filePath)} ---
${data.text}
--- END OF FILE: ${path.basename(filePath)} ---
`;
        fs.appendFileSync('extracted-guidelines.txt', output);
    } catch (error) {
        fs.appendFileSync('extracted-guidelines.txt', `Error reading ${filePath}: ${error}\n`);
    }
}

// Files to process
const files = [
    "c:\\Users\\olive\\OneDrive\\Documentos\\Aplicativo de saúde\\papers\\paper_guidelines.pdf",
    // "c:\\Users\\olive\\OneDrive\\Documentos\\Aplicativo de saúde\\papers\\paper_whatsapp.pdf",
    // "c:\\Users\\olive\\OneDrive\\Documentos\\Aplicativo de saúde\\papers\\paper_research.pdf",
    // "c:\\Users\\olive\\OneDrive\\Documentos\\Aplicativo de saúde\\papers\\paper_clinical.pdf",
];

(async () => {
    for (const file of files) {
        await extractText(file);
    }
})();
