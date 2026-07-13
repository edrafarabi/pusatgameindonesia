import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Gamepad2, Search, ShieldCheck, SlidersHorizontal, Star, X } from 'lucide-react';

const categories = [
  ['', 'Semua'], ['AKUN_GAME', 'Akun'], ['ITEM_GAME', 'Item & Top Up'], ['VOUCHER', 'Voucher'], ['JASA_JOKI', 'Jasa'],
];
const games = [
  ['Mobile Legends', '/ml-logo.jpg'], ['Free Fire', '/ff-logo.jpg'], ['PUBG Mobile', '/pubg-logo.jpg'],
  ['Genshin Impact', '/genshin-logo.jpg'], ['Valorant', '/valorant-logo.jpg'], ['Roblox', '/roblox-logo.jpg'],
  ['Honkai Star Rail', '/honkai-logo.jpg'], ['eFootball', '/efootball-logo.jpg'], ['Clash of Clans', '/coc-logo.jpg'],
  ['Clash Royale', '/cr-logo.jpg'], ['One Piece Bounty Rush', '/opbr-logo.jpg'], ['Voucher', '/voucher-logo.jpg'],
];
const labels = { AKUN_GAME: 'Akun', ITEM_GAME: 'Item', VOUCHER: 'Voucher', JASA_JOKI: 'Jasa' };
const money = value => `Rp${Number(value || 0).toLocaleString('id-ID')}`;

function ProductCard({ product }) {
  const image = product.images?.split(',').filter(Boolean)[0];
  return <Link to={`/product/${product.id}`} className="group bg-white rounded-xl border border-[#e4e8ef] overflow-hidden hover:border-[#b8c7df] hover:shadow-[0_8px_26px_rgba(34,51,84,.10)] transition-all">
    <div className="aspect-square bg-[#f1f4f8] overflow-hidden grid place-items-center">
      {image ? <img src={image} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" /> : <Gamepad2 size={34} className="text-[#a8b1c0]" />}
    </div>
    <div className="p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] text-[#738096] mb-1.5"><span>{product.game_name || 'Game'}</span><span>•</span><span>{labels[product.category] || 'Produk'}</span></div>
      <h3 className="text-sm font-semibold leading-5 line-clamp-2 min-h-10 text-[#202a3d]">{product.title}</h3>
      <p className="mt-2 text-base font-extrabold text-[#172033]">{money(product.price)}</p>
      <div className="mt-2.5 flex items-center gap-1 text-[11px] text-[#7b8496]"><Star size={12} className="fill-[#f5a524] text-[#f5a524]" /><span>{product.rating || '5.0'}</span><span>•</span><span>{product.sold_count || 0} terjual</span></div>
    </div>
  </Link>;
}

function Skeleton() { return <div className="rounded-xl bg-white border border-[#e4e8ef] overflow-hidden animate-pulse"><div className="aspect-square bg-[#edf0f5]" /><div className="p-3.5 space-y-3"><div className="h-3 bg-[#edf0f5] rounded w-2/5"/><div className="h-4 bg-[#edf0f5] rounded"/><div className="h-5 bg-[#edf0f5] rounded w-1/2"/></div></div>; }

export default function ProdukPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const search = searchParams.get('search') || '';
  const game = searchParams.get('game') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '24' });
    if (search) params.set('search', search);
    if (game) params.set('game', game);
    if (category) params.set('category', category);
    if (sort !== 'latest') params.set('sort', sort);
    fetch(`/api/products?${params}`).then(async response => {
      if (!response.ok) throw new Error('Gagal memuat produk');
      return response.json();
    }).then(data => { setProducts(data.products || []); setTotal(data.total || 0); }).catch(() => { setProducts([]); setTotal(0); }).finally(() => setLoading(false));
  }, [search, game, category, sort]);

  return <div className="min-h-screen">
    <section className="bg-white border-b border-[#e5e9f0]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e5dbb] to-[#377ed8] text-white px-6 py-7 md:px-9 md:py-8 relative">
          <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full border-[40px] border-white/10" />
          <div className="relative max-w-xl"><span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-full"><ShieldCheck size={14}/> Transaksi diawasi admin</span><h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">Cari produk game tanpa ribet</h1><p className="mt-2 text-sm md:text-base text-blue-100">Pilih produk, checkout, lalu selesaikan transaksi dalam satu ruang chat.</p></div>
        </div>

        <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
          {games.map(([name, image]) => <button key={name} onClick={() => update('game', game === name ? '' : name)} className={`rounded-xl p-2.5 text-center border transition ${game === name ? 'border-[#2563eb] bg-[#eff6ff] shadow-sm' : 'border-[#e5e9f0] hover:border-[#b8c7df] bg-white'}`}><img src={image} alt="" className="w-11 h-11 mx-auto rounded-xl object-cover"/><span className="block mt-2 text-[11px] font-semibold truncate text-[#354159]">{name}</span></button>)}
        </div>
      </div>
    </section>

    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(([value, label]) => <button key={value} onClick={() => update('category', value)} className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border ${category === value ? 'bg-[#2563eb] border-[#2563eb] text-white' : 'bg-white border-[#dfe4ec] text-[#526075] hover:border-[#9eabc0]'}`}>{label}</button>)}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div><h2 className="text-lg font-extrabold">Produk tersedia</h2><p className="text-sm text-[#7b8496] mt-0.5">{total} produk ditemukan</p></div>
        <div className="flex gap-2">
          <button onClick={() => setMobileFilters(!mobileFilters)} className="md:hidden p-2.5 bg-white border border-[#dfe4ec] rounded-lg"><SlidersHorizontal size={18}/></button>
          <label className="relative"><select value={sort} onChange={event => update('sort', event.target.value)} className="appearance-none bg-white border border-[#dfe4ec] rounded-lg pl-3 pr-9 py-2.5 text-sm font-semibold outline-none"><option value="latest">Terbaru</option><option value="popular">Terlaris</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option></select><ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#7b8496]"/></label>
        </div>
      </div>

      {(search || game || category) && <div className="mt-4 flex flex-wrap gap-2">{[["search", search], ["game", game], ["category", labels[category]]].filter(([,v]) => v).map(([key,value]) => <button key={key} onClick={() => update(key, '')} className="inline-flex items-center gap-1.5 bg-white border border-[#dfe4ec] px-3 py-1.5 rounded-full text-xs font-semibold text-[#526075]">{value}<X size={12}/></button>)}</div>}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {loading ? [...Array(10)].map((_, i) => <Skeleton key={i}/>) : products.map(product => <ProductCard key={product.id} product={product}/>) }
      </div>

      {!loading && products.length === 0 && <div className="mt-5 bg-white border border-[#e4e8ef] rounded-2xl py-16 text-center"><Search size={38} className="mx-auto text-[#a8b1c0]"/><h3 className="mt-4 font-bold">Produk belum ditemukan</h3><p className="mt-1 text-sm text-[#7b8496]">Ubah pencarian atau filter yang dipilih.</p><button onClick={() => setSearchParams({})} className="mt-5 px-5 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-bold">Reset filter</button></div>}
    </div>
  </div>;
}
