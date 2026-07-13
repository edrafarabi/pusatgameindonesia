import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, ArrowRight, CheckCircle2, Star, Lock, Sparkles } from 'lucide-react';

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setShow(true), delay); obs.unobserve(e.target); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={className} style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(32px)', transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>{children}</div>;
}

export default function Welcome() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const onScroll = () => setScrollY(window.scrollY); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);

  const heroOpacity = Math.max(0.3, 1 - scrollY / 700);
  const heroY = scrollY * 0.35;

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-x-hidden text-[#f8fafc]">
      {/* Nav */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[94%] max-w-5xl">
        <Reveal>
          <nav className="bg-[#1e293b]/80 backdrop-blur-2xl border border-[#475569]/30 rounded-2xl px-5 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden"><img src="/logo.jpg" alt="" className="w-full h-full object-cover" /></div>
              <span className="font-bold text-[15px] tracking-tight">PusatGame</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link to="/produk" className="px-3.5 py-2 text-[12px] font-medium text-[#94a3b8] hover:text-[#3b82f6] rounded-lg hover:bg-[#3b82f6]/5 transition-all">Market</Link>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3.5 py-2 text-[12px] font-medium text-[#94a3b8] hover:text-[#f8fafc] transition-all hidden sm:block">Masuk</Link>
              <Link to="/register" className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold transition-all">Daftar</Link>
            </div>
          </nav>
        </Reveal>
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#3b82f6]/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#2563eb]/[0.03] blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-[#60a5fa]/[0.02] blur-[80px]" />

        <div className="relative z-10 max-w-4xl text-center" style={{ transform: `translateY(${heroY}px)`, opacity: heroOpacity }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full text-[11px] font-bold text-[#3b82f6] tracking-wide mb-8">
            <Sparkles size={12} /> Marketplace Gaming #1 Indonesia
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-6"><img src="/logo.jpg" alt="PusatGame" className="w-full h-full object-cover" /></div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-6">
            <span className="text-[#f8fafc]">Jual beli</span><br />
            <span className="text-[#3b82f6]">akun game</span>
          </h1>

          <p className="text-base sm:text-lg text-[#94a3b8] max-w-lg mx-auto mb-10 leading-relaxed">
            Marketplace jual beli akun & item game terpercaya di Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/produk" className="px-8 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2">
              Mulai Belanja <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="px-8 py-3.5 border border-[#475569] text-[#94a3b8] rounded-xl text-[14px] font-medium hover:bg-[#1e293b] hover:text-[#f8fafc] transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Kenapa PusatGame?</h2>
              <p className="text-[#94a3b8] text-base max-w-md mx-auto">Transaksi aman, cepat, dan terpercaya.</p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Transaksi Aman', desc: 'Admin mengawasi setiap transaksi.' },
              { icon: Lock, title: 'Anti Penipuan', desc: 'Verifikasi sebelum deal. Gagal = refund.' },
              { icon: Zap, title: 'Proses Cepat', desc: 'Checkout instan, chat langsung.' },
              { icon: Star, title: 'Rating Seller', desc: 'Lihat reputasi. Pilih yang terpercaya.' },
              { icon: CheckCircle2, title: 'Banyak Game', desc: 'ML, FF, Genshin, Valorant, dan lainnya.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="bg-[#1e293b] border border-[#475569]/30 rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mb-4"><Icon size={20} className="text-[#3b82f6]" /></div>
                    <h3 className="text-[15px] font-bold mb-1">{item.title}</h3>
                    <p className="text-[13px] text-[#94a3b8]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Siap mulai?</h2>
            <p className="text-[#94a3b8] mb-8">Daftar sekarang dan mulai jual beli akun game.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[14px] font-bold transition-all">
              Buat Akun Gratis <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#475569]/30 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden"><img src="/logo.jpg" alt="" className="w-full h-full object-cover" /></div>
            <span className="font-bold text-[15px]">PusatGame</span>
          </div>
          <p className="text-[12px] text-[#94a3b8]/50">© 2026 PusatGameIndonesia</p>
        </div>
      </footer>
    </div>
  );
}
