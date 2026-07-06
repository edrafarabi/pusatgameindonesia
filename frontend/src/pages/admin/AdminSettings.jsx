import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { api } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await api('/api/admin/settings');
      setSettings(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">⚙️ Pengaturan Website</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-500 font-medium">✅ Tersimpan!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-medium"
          >
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Semua'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'general', label: '🌐 Umum' },
          { key: 'digiflazz', label: '🎮 Digiflazz' },
          { key: 'payment', label: '💳 Pembayaran' },
          { key: 'advanced', label: '🔧 Lanjutan' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">🌐 Informasi Website</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nama Website</label>
                <input value={settings.site_name || ''} onChange={e => updateSetting('site_name', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Logo URL</label>
                <input value={settings.site_logo || ''} onChange={e => updateSetting('site_logo', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Deskripsi Website</label>
                <textarea value={settings.site_description || ''} onChange={e => updateSetting('site_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">📞 Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email Kontak</label>
                <input value={settings.contact_email || ''} onChange={e => updateSetting('contact_email', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">WhatsApp Admin</label>
                <input value={settings.admin_whatsapp || ''} onChange={e => updateSetting('admin_whatsapp', e.target.value)}
                  placeholder="628xxxxxxxxxx"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digiflazz Settings */}
      {activeTab === 'digiflazz' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">🎮 Kredensial Digiflazz</h3>
          <p className="text-sm text-gray-500 mb-4">Kredensial ini disimpan di database. Jika kosong, akan fallback ke file .env di server.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Username Digiflazz</label>
              <input value={settings.digiflazz_username || ''} onChange={e => updateSetting('digiflazz_username', e.target.value)}
                placeholder="Masukkan username Digiflazz"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">API Key</label>
              <input type="password" value={settings.digiflazz_api_key || ''} onChange={e => updateSetting('digiflazz_api_key', e.target.value)}
                placeholder="Masukkan API Key Digiflazz"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Webhook Secret</label>
              <input type="password" value={settings.digiflazz_webhook_secret || ''} onChange={e => updateSetting('digiflazz_webhook_secret', e.target.value)}
                placeholder="Masukkan Webhook Secret"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono" />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">💡 <strong>Tip:</strong> Kamu bisa mendapatkan kredensial ini dari dashboard Digiflazz → Pengaturan → API.</p>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">💳 Pengaturan Pembayaran</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Metode Pembayaran (pisahkan koma)</label>
              <input value={settings.payment_methods || ''} onChange={e => updateSetting('payment_methods', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <p className="text-xs text-gray-400 mt-1">Contoh: DANA,GoPay,OVO,Transfer Bank,QRIS</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Minimum Top Up (Rp)</label>
              <input type="number" value={settings.min_topup_amount || ''} onChange={e => updateSetting('min_topup_amount', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">🔧 Pengaturan Lanjutan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Mode Maintenance</p>
                <p className="text-sm text-gray-500">Aktifkan untuk menutup website sementara</p>
              </div>
              <button
                onClick={() => updateSetting('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  settings.maintenance_mode === 'true' ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>
            {settings.maintenance_mode === 'true' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">⚠️ Mode maintenance AKTIF! Website tidak bisa diakses oleh user biasa.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
