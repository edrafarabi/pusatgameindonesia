const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const router = express.Router();
const HERMES_CONFIG = path.join(process.env.HOME || '/root', '.hermes/config.yaml');
const NINEROUTER_URL = 'http://127.0.0.1:20128';
const NINEROUTER_PASS = '123456';
const API_SECRET = 'hermes-remote-2026';

// ─── Auth ───────────────────────────────────────────────
function auth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.key;
  if (key !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ─── 9 Router Auth Helper ───────────────────────────────
async function getRouterToken() {
  try {
    const res = await fetch(`${NINEROUTER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: NINEROUTER_PASS })
    });
    const cookies = res.headers.get('set-cookie') || '';
    const match = cookies.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  } catch(e) {
    return null;
  }
}

async function routerApi(path, opts = {}) {
  const token = await getRouterToken();
  if (!token) return { error: 'Failed to auth with 9 Router' };
  try {
    const res = await fetch(`${NINEROUTER_URL}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${token}`,
        ...opts.headers
      }
    });
    return await res.json();
  } catch(e) {
    return { error: e.message };
  }
}

// ═══════════════════════════════════════════════════════
// HERMES CONFIG
// ═══════════════════════════════════════════════════════

router.get('/config', auth, (req, res) => {
  try {
    const raw = fs.readFileSync(HERMES_CONFIG, 'utf8');
    const config = yaml.load(raw);
    const safe = JSON.parse(JSON.stringify(config));
    if (safe.custom_providers) {
      safe.custom_providers = safe.custom_providers.map(p => ({
        ...p,
        api_key: p.api_key ? p.api_key.substring(0, 12) + '...' : ''
      }));
    }
    if (safe.gateway?.platforms?.telegram?.token) {
      safe.gateway.platforms.telegram.token = '***';
    }
    res.json({ success: true, config: safe });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/config', auth, (req, res) => {
  try {
    const raw = fs.readFileSync(HERMES_CONFIG, 'utf8');
    const config = yaml.load(raw);
    function merge(t, s) {
      for (const k of Object.keys(s)) {
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) {
          if (!t[k]) t[k] = {};
          merge(t[k], s[k]);
        } else { t[k] = s[k]; }
      }
    }
    merge(config, req.body);
    fs.writeFileSync(HERMES_CONFIG, yaml.dump(config, { lineWidth: 120 }));
    res.json({ success: true, message: 'Config updated' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Model ──────────────────────────────────────────────
router.get('/model', auth, (req, res) => {
  try {
    const config = yaml.load(fs.readFileSync(HERMES_CONFIG, 'utf8'));
    res.json({ success: true, model: config.model || {} });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/model', auth, (req, res) => {
  try {
    const config = yaml.load(fs.readFileSync(HERMES_CONFIG, 'utf8'));
    if (req.body.default) config.model.default = req.body.default;
    if (req.body.provider) config.model.provider = req.body.provider;
    fs.writeFileSync(HERMES_CONFIG, yaml.dump(config, { lineWidth: 120 }));
    res.json({ success: true, message: `Model: ${config.model.default}` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── Providers ──────────────────────────────────────────
router.get('/providers', auth, (req, res) => {
  try {
    const config = yaml.load(fs.readFileSync(HERMES_CONFIG, 'utf8'));
    const providers = (config.custom_providers || []).map(p => ({
      name: p.name, base_url: p.base_url, model: p.model,
      api_key: p.api_key ? p.api_key.substring(0, 12) + '...' : ''
    }));
    res.json({ success: true, providers });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/providers', auth, (req, res) => {
  try {
    const { name, base_url, api_key, model } = req.body;
    if (!name || !base_url || !api_key) return res.status(400).json({ error: 'name, base_url, api_key required' });
    const config = yaml.load(fs.readFileSync(HERMES_CONFIG, 'utf8'));
    if (!config.custom_providers) config.custom_providers = [];
    const idx = config.custom_providers.findIndex(p => p.name === name);
    const prov = { name, base_url, api_key, model: model || '' };
    if (idx >= 0) config.custom_providers[idx] = prov;
    else config.custom_providers.push(prov);
    fs.writeFileSync(HERMES_CONFIG, yaml.dump(config, { lineWidth: 120 }));
    res.json({ success: true, message: `Provider ${name} saved` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/providers/:name', auth, (req, res) => {
  try {
    const config = yaml.load(fs.readFileSync(HERMES_CONFIG, 'utf8'));
    config.custom_providers = (config.custom_providers || []).filter(p => p.name !== req.params.name);
    fs.writeFileSync(HERMES_CONFIG, yaml.dump(config, { lineWidth: 120 }));
    res.json({ success: true, message: `Deleted ${req.params.name}` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════
// 9 ROUTER PROXY
// ═══════════════════════════════════════════════════════

router.get('/router/keys', auth, async (req, res) => {
  res.json(await routerApi('/api/keys'));
});

router.post('/router/keys', auth, async (req, res) => {
  res.json(await routerApi('/api/keys', { method: 'POST', body: JSON.stringify(req.body) }));
});

router.delete('/router/keys/:id', auth, async (req, res) => {
  res.json(await routerApi(`/api/keys/${req.params.id}`, { method: 'DELETE' }));
});

router.get('/router/models', auth, async (req, res) => {
  res.json(await routerApi('/api/models'));
});

router.get('/router/providers', auth, async (req, res) => {
  res.json(await routerApi('/api/providers'));
});

router.post('/router/providers', auth, async (req, res) => {
  res.json(await routerApi('/api/providers', { method: 'POST', body: JSON.stringify(req.body) }));
});

router.delete('/router/providers/:id', auth, async (req, res) => {
  res.json(await routerApi(`/api/providers/${req.params.id}`, { method: 'DELETE' }));
});

// ═══════════════════════════════════════════════════════
// SYSTEM STATUS
// ═══════════════════════════════════════════════════════

router.get('/status', auth, (req, res) => {
  exec('ps aux | grep -E "hermes|gateway" | grep -v grep | head -3', (e1, hOut) => {
    exec('ps aux | grep 9router | grep -v grep | head -3', (e2, rOut) => {
      exec('uptime', (e3, uOut) => {
        res.json({
          success: true,
          hermes: { running: hOut.trim().length > 0, processes: hOut.trim() },
          router9: { running: rOut.trim().length > 0, processes: rOut.trim() },
          uptime: uOut.trim()
        });
      });
    });
  });
});

// ─── Chat proxy ─────────────────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8642/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
