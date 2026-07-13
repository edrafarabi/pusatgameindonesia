const axios = require('axios');

/**
 * Pakasir Payment Gateway Integration
 * Docs: https://app.pakasir.com/
 */

const PAKASIR_BASE = 'https://app.pakasir.com';

/**
 * Create payment URL (simple redirect)
 */
function createPaymentUrl(slug, amount, orderId, redirectUrl = null, qrisOnly = false) {
    let url = `${PAKASIR_BASE}/pay/${slug}/${amount}?order_id=${orderId}`;
    
    if (redirectUrl) {
        url += `&redirect=${encodeURIComponent(redirectUrl)}`;
    }
    if (qrisOnly) {
        url += '&qris_only=1';
    }
    
    return url;
}

/**
 * Create transaction via API
 */
async function createTransaction(apiKey, slug, method, orderId, amount) {
    try {
        const res = await axios.post(`${PAKASIR_BASE}/api/transactioncreate/${method}`, {
            project: slug,
            order_id: orderId,
            amount: amount,
            api_key: apiKey
        });
        return res.data;
    } catch (err) {
        console.error('Pakasir createTransaction error:', err.response?.data || err.message);
        throw err;
    }
}

/**
 * Get transaction detail
 */
async function getTransactionDetail(apiKey, slug, amount, orderId) {
    try {
        const res = await axios.get(`${PAKASIR_BASE}/api/transactiondetail`, {
            params: {
                project: slug,
                amount: amount,
                order_id: orderId,
                api_key: apiKey
            }
        });
        return res.data;
    } catch (err) {
        console.error('Pakasir getTransactionDetail error:', err.response?.data || err.message);
        throw err;
    }
}

/**
 * Cancel transaction
 */
async function cancelTransaction(apiKey, slug, amount, orderId) {
    try {
        const res = await axios.post(`${PAKASIR_BASE}/api/transactioncancel`, {
            project: slug,
            order_id: orderId,
            amount: amount,
            api_key: apiKey
        });
        return res.data;
    } catch (err) {
        console.error('Pakasir cancelTransaction error:', err.response?.data || err.message);
        throw err;
    }
}

/**
 * Simulate payment (sandbox only)
 */
async function simulatePayment(apiKey, slug, amount, orderId) {
    try {
        const res = await axios.post(`${PAKASIR_BASE}/api/paymentsimulation`, {
            project: slug,
            order_id: orderId,
            amount: amount,
            api_key: apiKey
        });
        return res.data;
    } catch (err) {
        console.error('Pakasir simulatePayment error:', err.response?.data || err.message);
        throw err;
    }
}

module.exports = {
    createPaymentUrl,
    createTransaction,
    getTransactionDetail,
    cancelTransaction,
    simulatePayment
};
