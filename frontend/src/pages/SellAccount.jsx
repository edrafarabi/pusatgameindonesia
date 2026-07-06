import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function SellAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    game: 'Mobile Legends',
    price: '',
    specifications: {
      platform: 'Android / iOS',
      rank: '',
      heroCount: '',
      skinCount: '',
      loginVia: 'Moonton ID'
    },
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [name]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate upload/create listing on backend
    setTimeout(() => {
      setLoading(false);
      alert('Iklan Akun berhasil diterbitkan! Pembeli akan segera menghubungi kamu.');
      navigate('/');
    }, 1200);
  };

  return (
    <div className="bg-[#f5f6f9] min-h-screen pb-20">
      {/* Header Navigation */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-gray-800 text-sm">Jual Akun Game</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-5">
          
          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Foto Akun (Lobby, Skin Teratas, dll)</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={24} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-1 font-semibold">Upload</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-500 leading-normal max-w-[200px]">
                Format JPG/PNG, Maks. 5MB. Pastikan gambar jelas agar cepat laku.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Judul Iklan</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Akun MLBB 70 Hero (Skin Epic Saber)"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Game</label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none bg-white"
              >
                <option value="Mobile Legends">Mobile Legends</option>
                <option value="Free Fire">Free Fire</option>
                <option value="Genshin Impact">Genshin Impact</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="Valorant">Valorant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Harga Jual (Rp)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Contoh: 150000"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Login Via</label>
              <input
                type="text"
                name="loginVia"
                value={formData.specifications.loginVia}
                onChange={handleSpecChange}
                placeholder="Contoh: Moonton ID / Gmail Bind"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-150 pt-4">
            <h4 className="text-xs font-bold text-gray-800 mb-3">Spesifikasi Akun Tambahan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rank Terkini</label>
                <input
                  type="text"
                  name="rank"
                  value={formData.specifications.rank}
                  onChange={handleSpecChange}
                  placeholder="Contoh: Mythical Glory"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Hero</label>
                <input
                  type="number"
                  name="heroCount"
                  value={formData.specifications.heroCount}
                  onChange={handleSpecChange}
                  placeholder="Contoh: 85"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Skin</label>
                <input
                  type="number"
                  name="skinCount"
                  value={formData.specifications.skinCount}
                  onChange={handleSpecChange}
                  placeholder="Contoh: 120"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Akun</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tuliskan spesifikasi detail akun, skin langka yang dimiliki, dan informasi pendukung lainnya."
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none resize-none"
              required
            />
          </div>

          {/* Safe trading note */}
          <div className="bg-[#fffbeb] border border-[#fde8c3] rounded-lg p-3 flex items-start gap-2.5">
            <ShieldAlert className="text-[#d97706] shrink-0 mt-0.5" size={18} />
            <div>
              <h5 className="text-xs font-bold text-[#b45309]">Kebijakan Keamanan Penjual</h5>
              <p className="text-[10px] text-[#78350f] mt-0.5 leading-normal">
                Dilarang memberikan data akun langsung via chat room sebelum sistem mengonfirmasi status pembayaran deposit dari pembeli aman.
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0070f0] hover:bg-[#005ec8] disabled:bg-gray-400 text-white font-bold text-xs py-3 rounded transition-colors shadow-sm cursor-pointer"
          >
            {loading ? 'Sedang Menerbitkan...' : 'Terbitkan Iklan Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
