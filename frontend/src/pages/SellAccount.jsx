import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ImagePlus, Gamepad2, Package, Tag, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GAME_LIST = [
  { name: 'Mobile Legends', img: '/ml-logo.jpg' },
  { name: 'Free Fire', img: '/ff-logo.jpg' },
  { name: 'Genshin Impact', img: '/genshin-logo.jpg' },
  { name: 'PUBG Mobile', img: '/pubg-logo.jpg' },
  { name: 'Valorant', img: '/valorant-logo.jpg' },
  { name: 'Roblox', img: '/roblox-logo.jpg' },
  { name: 'One Piece Bounty Rush', img: '/opbr-logo.jpg' },
  { name: 'eFootball', img: '/efootball-logo.jpg' },
  { name: 'Honkai Star Rail', img: '/honkai-logo.jpg' },
  { name: 'Clash of Clans', img: '/coc-logo.jpg' },
];

const CATEGORY_OPTIONS = [
  { key: 'AKUN_GAME', label: 'Akun Game', icon: Gamepad2 },
  { key: 'ITEM_GAME', label: 'Item / Top Up', icon: Package },
  { key: 'VOUCHER', label: 'Voucher', icon: Tag },
];

export default function SellAccount() {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', price: '', game_name: '', delivery_format: '', category: 'AKUN_GAME' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  // Check if user is seller
  const isSeller = ['SELLER', 'ADMIN', 'SUPERADMIN'].includes(user.role);

  if (!isSeller) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#1e293b] rounded-2xl flex items-center justify-center border border-[#475569]">
            <AlertTriangle size={28} className="text-[#3b82f6]" />
          </div>
          <h2 className="text-lg font-bold text-[#f8fafc] mb-2">Belum Jadi Seller</h2>
          <p className="text-[13px] text-[#94a3b8] mb-6">Kamu harus upgrade akun ke seller terlebih dahulu untuk bisa menjual produk.</p>
          <button onClick={() => navigate('/akun')}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[14px] px-6 py-3 rounded-xl transition-all">
            Upgrade ke Seller
          </button>
        </div>
      </div>
    );
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => setPreviews(prev => [...prev, URL.createObjectURL(f)]));
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Judul wajib diisi', 'error');
    if (!form.game_name.trim()) return showToast('Nama game wajib diisi', 'error');
    if (!form.description.trim() || form.description.trim().length < 10) return showToast('Deskripsi minimal 10 karakter', 'error');
    if (!form.price || Number(form.price) < 1000) return showToast('Harga minimal Rp 1.000', 'error');

    setLoading(true);
    try {
      let imageUrls = '';
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(f => formData.append('images', f));
        const uploadRes = await api('/api/upload/images', { method: 'POST', body: formData, headers: {} });
        if (!uploadRes.success) throw new Error(uploadRes.error || 'Upload gagal');
        imageUrls = uploadRes.urls.join(',');
      }

      const res = await api('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseInt(form.price),
          game_name: form.game_name.trim(),
          images: imageUrls,
          category: form.category,
          stock: 1,
          delivery_format: form.delivery_format.trim()
        })
      });

      if (res.success) {
        showToast('Iklan berhasil diterbitkan!');
        setTimeout(() => navigate('/produk'), 1500);
      } else {
        showToast(res.error || 'Gagal', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#0f172a]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-medium border ${
          toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400/30' : 'bg-[#3b82f6] text-white border-[#60a5fa]'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="bg-[#1e293b] border-b border-[#475569] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[#334155] rounded-lg">
          <ArrowLeft size={18} className="text-[#f8fafc]" />
        </button>
        <span className="font-bold text-[15px] text-[#f8fafc]">Jual</span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 mt-4 space-y-4">

        {/* Kategori */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-3 block">Kategori</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} type="button"
                  onClick={() => setForm({...form, category: cat.key})}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    form.category === cat.key
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                      : 'border-[#475569] text-[#94a3b8] hover:border-[#3b82f6] hover:text-[#f8fafc]'
                  }`}>
                  <Icon size={20} />
                  <span className="text-[11px] font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Judul */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-2 block">Judul Iklan</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="Contoh: Akun ML Mythic Glory 500+ Star"
            className="w-full px-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none"
          />
        </div>

        {/* Nama Game */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-3 block">Pilih Game</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {GAME_LIST.map(game => (
              <button key={game.name} type="button"
                onClick={() => setForm({...form, game_name: game.name})}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all ${
                  form.game_name === game.name
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-[#475569] hover:border-[#3b82f6]'
                }`}>
                {game.img ? (
                  <img src={game.img} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-[#334155] rounded-lg flex items-center justify-center">
                    <Gamepad2 size={18} className="text-[#94a3b8]" />
                  </div>
                )}
                <span className={`text-[10px] font-bold text-center leading-tight ${form.game_name === game.name ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}>{game.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Format Pengiriman */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-2 block">Info dari Buyer <span className="text-[#64748b] font-normal">(opsional)</span></label>
          <input
            type="text"
            value={form.delivery_format}
            onChange={e => setForm({...form, delivery_format: e.target.value})}
            placeholder="Contoh: Game ID, Server, Nickname"
            className="w-full px-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none"
          />
          <p className="text-[10px] text-[#64748b] mt-1">Data yang harus diisi buyer saat checkout</p>
        </div>

        {/* Deskripsi */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-2 block">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Jelaskan detail akun kamu: rank, skin, level, dll..."
            rows={5}
            className="w-full px-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none resize-none"
          />
          <p className="text-[10px] text-[#64748b] mt-1">{form.description.length} karakter</p>
        </div>

        {/* Harga */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-2 block">Harga (Rp)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-[#64748b] font-semibold">Rp</span>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              placeholder="100000"
              min="1000"
              className="w-full pl-10 pr-4 py-2.5 bg-[#334155] border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none"
            />
          </div>
          {form.price && Number(form.price) >= 1000 && (
            <p className="text-[11px] text-[#3b82f6] font-semibold mt-1">Rp {Number(form.price).toLocaleString('id-ID')}</p>
          )}
        </div>

        {/* Upload Gambar */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label className="text-[12px] font-bold text-[#f8fafc] mb-2 block">Foto <span className="text-[#64748b] font-normal">(opsional, max 5)</span></label>

          <div className="flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#475569]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#3b82f6] text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-[#475569] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3b82f6] transition-colors">
                <ImagePlus size={20} className="text-[#94a3b8]" />
                <span className="text-[9px] text-[#94a3b8] mt-0.5">Tambah</span>
                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-[11px] text-[#94a3b8] font-medium flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#3b82f6] shrink-0 mt-0.5" />
          <span>Jangan bagikan data login sebelum pembayaran dikonfirmasi.</span>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-[14px] transition-all flex items-center justify-center gap-2">
          {loading ? 'Menerbitkan...' : 'Terbitkan Iklan'}
          {!loading && <ChevronRight size={16} />}
        </button>
      </form>
    </div>
  );
}
