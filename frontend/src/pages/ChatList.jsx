import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle, ChevronRight, Search, Shield, Package,
  CheckCircle, ArrowRight, XCircle, CreditCard, Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Status Config ─── */
const STATUS = {
  WAITING_PAYMENT: { label: 'Menunggu Bayar', icon: CreditCard, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', dot: 'bg-[#94a3b8]' },
  PAID:            { label: 'Sudah Dibayar', icon: Shield, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', dot: 'bg-[#3b82f6]' },
  PROCESSING:      { label: 'Seller Siapkan', icon: Package, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', dot: 'bg-[#3b82f6]' },
  DELIVERED:       { label: 'Akun Dikirim', icon: ArrowRight, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', dot: 'bg-[#3b82f6]' },
  COMPLETED:       { label: 'Selesai', icon: CheckCircle, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', dot: 'bg-[#3b82f6]' },
  CANCELLED:       { label: 'Dibatalkan', icon: XCircle, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', dot: 'bg-[#94a3b8]' },
  DISPUTED:        { label: 'Sengketa', icon: Shield, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', dot: 'bg-[#94a3b8]' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  return `${days}h`;
};

export default function ChatList() {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadChats = async () => {
    try {
      const res = await api('/api/chats');
      setChats(res.chats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (chat.other_name || '').toLowerCase().includes(q) ||
      (chat.product_name || '').toLowerCase().includes(q)
    );
  });

  /* Group: action needed vs all */
  const actionNeeded = filteredChats.filter(c => {
    const st = c.transaction_status;
    return (c.is_buyer && st === 'DELIVERED') || (!c.is_buyer && st === 'PAID');
  });
  const otherChats = filteredChats.filter(c => !actionNeeded.includes(c));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      {/* ── Header ── */}
      <div className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#475569] sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 py-4">
          <h1 className="text-lg font-semibold text-[#f8fafc] tracking-tight">Chat</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">Pesan dari transaksi kamu</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* ── Search ── */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari chat..."
            className="w-full bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#1e293b] rounded-xl h-[72px] animate-pulse border border-[#475569]" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl py-14 px-6 text-center">
            <div className="w-14 h-14 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} className="text-[#94a3b8]" />
            </div>
            <p className="text-sm font-medium text-[#f8fafc]">
              {search ? 'Chat tidak ditemukan' : 'Belum ada chat'}
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">
              {search ? 'Coba kata kunci lain' : 'Chat akan muncul setelah ada transaksi'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Action needed section */}
            {actionNeeded.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-1 pt-1 pb-2.5">
                  <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider">
                    Butuh Aksi
                  </span>
                </div>
                {actionNeeded.map(chat => (
                  <ChatCard key={chat.transaction_id} chat={chat} highlight />
                ))}
              </>
            )}

            {/* All chats section */}
            {actionNeeded.length > 0 && otherChats.length > 0 && (
              <div className="px-1 pt-5 pb-2.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Semua Chat
                </span>
              </div>
            )}
            {otherChats.map(chat => (
              <ChatCard key={chat.transaction_id} chat={chat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Chat Card ─── */
function ChatCard({ chat, highlight = false }) {
  const st = STATUS[chat.transaction_status] || {
    label: chat.transaction_status || 'Unknown',
    icon: MessageCircle,
    bg: 'bg-[#1e293b]',
    text: 'text-[#94a3b8]',
    dot: 'bg-[#94a3b8]',
  };
  const otherRole = chat.is_buyer ? 'Penjual' : 'Pembeli';

  return (
    <Link
      to={`/chat/${chat.transaction_id}`}
      className={`block rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all ${
        highlight
          ? 'bg-[#1e293b] border border-[#3b82f6]/30 hover:border-[#3b82f6]'
          : 'bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 hover:border-[#3b82f6]'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-sm font-semibold text-white">
          {chat.other_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {highlight && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#3b82f6] rounded-full border-2 border-[#0f172a]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm text-[#f8fafc] truncate">
              {chat.other_name}
            </span>
            <span className="text-[10px] text-[#94a3b8] bg-[#334155] px-1.5 py-0.5 rounded-full shrink-0">
              {otherRole}
            </span>
          </div>
          <span className="text-[10px] text-[#94a3b8] shrink-0">
            {timeAgo(chat.last_message_at)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#94a3b8] truncate">
            {chat.product_name}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        </div>
        {chat.last_message && (
          <p className="text-xs text-[#64748b] truncate mt-0.5">
            {chat.last_message}
          </p>
        )}
      </div>

      {/* Right side: unread badge or chevron */}
      {chat.unread_count > 0 ? (
        <span className="bg-[#3b82f6] text-white text-[10px] font-semibold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shrink-0">
          {chat.unread_count}
        </span>
      ) : (
        <ChevronRight size={14} className="text-[#94a3b8] shrink-0" />
      )}
    </Link>
  );
}
