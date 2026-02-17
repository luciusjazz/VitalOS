const fs = require('fs');
const path = require('path');

const logFile = 'debug-extract.log';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

process.on('uncaughtException', (err) => {
    log('Uncaught Exception: ' + err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection at: ' + promise + ' reason: ' + reason);
    process.exit(1);
});

log('Starting debug script');

try {
    const pdf = require('pdf-parse');
    log('pdf-parse required successfully');
    log('Type of pdf: ' + typeof pdf);

    const filePath = "c:\\Users\\olive\\OneDrive\\Documentos\\Aplicativo de saúde\\papers\\paper_whatsapp.pdf";
    log('Target file: ' + filePath);

    if (fs.existsSync(filePath)) {
        log('File exists');
        const stats = fs.statSync(filePath);
        log('File size: ' + stats.size);

        const dataBuffer = fs.readFileSync(filePath);
        log('File read into buffer. Length: ' + dataBuffer.length);

        pdf(dataBuffer).then(function (data) {
            log('PDF processed successfully');
            log('Text length: ' + data.text.length);
            fs.writeFileSync('extracted-text-debug.txt', data.text);
            log('Text written to extracted-text-debug.txt');
        }).catch(function (error) {
            log('Error in pdf function: ' + error.stack);
        });
    } else {
        log('File does NOT exist');
    }

} catch (e) {
    log('Error in main block: ' + e.stack);
}
