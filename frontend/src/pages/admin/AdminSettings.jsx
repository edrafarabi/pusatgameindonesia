import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Loader2, Settings, CreditCard, Plug, Wrench } from 'lucide-react';

const TABS = [
  { key: 'general', label: 'Umum', icon: Settings },
  { key: 'digiflazz', label: 'Digiflazz', icon: Plug },
  { key: 'payment', label: 'Pembayaran', icon: CreditCard },
  { key: 'advanced', label: 'Lanjutan', icon: Wrench },
];

function Skeleton() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#334155] rounded-lg" />
          <div className="h-3.5 w-64 bg-[#334155] rounded" />
        </div>
        <div className="h-10 w-28 bg-[#334155] rounded-xl" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-[#334155] rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-[#334155] rounded-2xl" />
    </div>
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl ${
        type === 'error'
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      }`}
    >
      {type === 'error' ? <X size={14} /> : <Check size={14} />}
      {message}
    </div>
  );
}

export default function AdminSettings() {
  const { api } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api('/api/admin/settings');
      setSettings(data);
    } catch (err) {
      setToast({ msg: err.message || 'Gagal memuat pengaturan', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setToast({ msg: 'Pengaturan berhasil disimpan', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Gagal menyimpan', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton />;

  const inputClass =
    'w-full px-3.5 py-2.5 bg-[#334155] border border-[#475569]/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors';

  return (
    <div className="max-w-4xl">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Pengaturan</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Konfigurasi platform Anda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 bg-[#1e293b] rounded-xl p-1.5 border border-[#475569]/40">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-[#334155] text-[#f8fafc] border border-[#3b82f6]/30'
                  : 'text-[#64748b] hover:text-[#94a3b8] border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-6">
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Nama Situs</label>
              <input
                value={settings.site_name || ''}
                onChange={e => update('site_name', e.target.value)}
                placeholder="Nama website Anda"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Deskripsi Situs</label>
              <textarea
                value={settings.site_description || ''}
                onChange={e => update('site_description', e.target.value)}
                rows={3}
                placeholder="Deskripsi singkat tentang website"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Email Kontak</label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={e => update('contact_email', e.target.value)}
                placeholder="admin@example.com"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {activeTab === 'digiflazz' && (
          <div className="space-y-5">
            <p className="text-xs text-[#64748b] -mt-1 mb-2">
              Kredensial Digiflazz. Jika kosong, fallback ke .env.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Username</label>
              <input
                value={settings.digiflazz_username || ''}
                onChange={e => update('digiflazz_username', e.target.value)}
                placeholder="Username Digiflazz"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">API Key</label>
              <input
                type="password"
                value={settings.digiflazz_api_key || ''}
                onChange={e => update('digiflazz_api_key', e.target.value)}
                placeholder="API Key Digiflazz"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Webhook Secret</label>
              <input
                type="password"
                value={settings.digiflazz_webhook_secret || ''}
                onChange={e => update('digiflazz_webhook_secret', e.target.value)}
                placeholder="Webhook Secret"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">
                Metode Pembayaran (pisahkan koma)
              </label>
              <input
                value={settings.payment_methods || ''}
                onChange={e => update('payment_methods', e.target.value)}
                placeholder="DANA,GoPay,OVO,QRIS"
                className={inputClass}
              />
              <p className="text-[11px] text-[#64748b] mt-1.5">Contoh: DANA,GoPay,OVO,Transfer Bank,QRIS</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Fee Rekber (%)</label>
              <input
                type="number"
                value={settings.rekber_fee_percent || ''}
                onChange={e => update('rekber_fee_percent', e.target.value)}
                placeholder="2.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Minimum Fee (Rp)</label>
              <input
                type="number"
                value={settings.minimum_fee || ''}
                onChange={e => update('minimum_fee', e.target.value)}
                placeholder="1000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Pakasir Slug</label>
              <input
                value={settings.pakasir_slug || ''}
                onChange={e => update('pakasir_slug', e.target.value)}
                placeholder="slug-toko"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-2">Pakasir API Key</label>
              <input
                type="password"
                value={settings.pakasir_api_key || ''}
                onChange={e => update('pakasir_api_key', e.target.value)}
                placeholder="API Key Pakasir"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#334155] border border-[#475569]/40">
              <div>
                <p className="text-sm font-medium text-[#f8fafc]">Mode Maintenance</p>
                <p className="text-xs text-[#64748b] mt-0.5">Website tidak dapat diakses pengunjung</p>
              </div>
              <button
                onClick={() => update('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: settings.maintenance_mode === 'true' ? '#22c55e' : '#475569' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: settings.maintenance_mode === 'true' ? 'translateX(20px)' : 'none' }}
                />
              </button>
            </div>
            {settings.maintenance_mode === 'true' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 font-medium">
                Mode maintenance aktif — website tidak bisa diakses pengunjung.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
