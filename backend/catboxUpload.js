const { Catbox, Litterbox } = require('catbox.moe');
const path = require('path');

const catbox = new Catbox(); // anonymous
const litterbox = new Litterbox();

/**
 * Upload file ke Catbox.moe (permanent) atau Litterbox (temporary 24h)
 * @param {string} filePath - Path ke file lokal
 * @param {string} userHash - Catbox user hash (optional, untuk permanent upload)
 * @returns {Promise<string>} - URL gambar
 */
async function uploadToCatbox(filePath, userHash) {
    try {
        // Coba permanent upload dulu kalau ada userHash
        if (userHash) {
            const catboxAuth = new Catbox(userHash);
            const url = await catboxAuth.upload(filePath);
            if (url && !url.includes('Invalid')) {
                return url.trim();
            }
        }
        
        // Fallback ke Litterbox (temporary 24h)
        const url = await litterbox.upload(filePath, '24h');
        return url.trim();
    } catch (err) {
        console.error('Catbox upload error:', err.message);
        throw err;
    }
}

/**
 * Upload multiple files ke Catbox/Litterbox
 * @param {Array<string>} filePaths
 * @param {string} userHash - optional
 * @returns {Promise<Array<string>>}
 */
async function uploadMultipleToCatbox(filePaths, userHash) {
    const urls = [];
    for (const filePath of filePaths) {
        try {
            const url = await uploadToCatbox(filePath, userHash);
            urls.push(url);
        } catch (err) {
            console.error('Upload gagal untuk', filePath, err.message);
        }
    }
    return urls;
}

module.exports = { uploadToCatbox, uploadMultipleToCatbox };
