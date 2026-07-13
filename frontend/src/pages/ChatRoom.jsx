import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Send, MessageCircle, Shield, Clock, Package, CheckCircle,
  ArrowRight, XCircle, CreditCard, AlertTriangle, Eye, Lock, Key,
  ExternalLink, Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Status Config ─── */
const STATUS = {
  WAITING_PAYMENT: { label: 'Menunggu Bayar', icon: CreditCard, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', color: '#94a3b8' },
  PAID:            { label: 'Sudah Dibayar', icon: Shield, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', color: '#3b82f6' },
  PROCESSING:      { label: 'Seller Siapkan', icon: Package, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', color: '#3b82f6' },
  DELIVERED:       { label: 'Akun Dikirim', icon: ArrowRight, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', color: '#3b82f6' },
  COMPLETED:       { label: 'Selesai', icon: CheckCircle, bg: 'bg-[#1e293b]', text: 'text-[#f8fafc]', color: '#3b82f6' },
  CANCELLED:       { label: 'Dibatalkan', icon: XCircle, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', color: '#94a3b8' },
  DISPUTED:        { label: 'Sengketa', icon: Shield, bg: 'bg-[#1e293b]', text: 'text-[#94a3b8]', color: '#94a3b8' },
};

/* ─── Toast helper ─── */
function showToast(msg, type = 'info') {
  const existing = document.getElementById('chat-toast');
  if (existing) existing.remove();

  const colors = {
    success: 'bg-[#3b82f6] text-white',
    error: 'bg-[#334155] text-red-400',
    info: 'bg-[#1e293b] text-[#f8fafc]',
  };

  const toast = document.createElement('div');
  toast.id = 'chat-toast';
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg border border-[#475569] ${colors[type]} transition-all`;
  toast.style.transform = 'translate(-50%, -8px)';
  toast.style.opacity = '0';
  requestAnimationFrame(() => {
    toast.style.transition = 'all 0.25s ease-out';
    toast.style.transform = 'translate(-50%, 0)';
    toast.style.opacity = '1';
  });
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export default function ChatRoom() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [transaction, setTransaction] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [accountForm, setAccountForm] = useState({ username: '', password: '', additional: '' });
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadChat();
    pollRef.current = setInterval(loadChat, 5000);
    return () => clearInterval(pollRef.current);
  }, [transactionId, user]);

  const loadChat = async () => {
    try {
      const res = await api(`/api/chat/${transactionId}`);
      setMessages(res.messages || []);
      setTransaction(res.transaction);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal memuat chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await api(`/api/chat/${transactionId}`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      setNewMessage('');
      clearInterval(pollRef.current);
      await loadChat();
      pollRef.current = setInterval(loadChat, 5000);
    } catch (err) {
      showToast('Gagal kirim pesan: ' + err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const sendAccountDetails = async () => {
    if (!accountForm.username.trim() || !accountForm.password.trim()) {
      showToast('Username dan password harus diisi', 'error');
      return;
    }
    setSending(true);
    try {
      const details =
        `DETAIL AKUN\n─────────────\nUsername: ${accountForm.username}\nPassword: ${accountForm.password}` +
        (accountForm.additional ? `\nInfo Tambahan: ${accountForm.additional}` : '') +
        `\n─────────────\nSilakan cek akunnya. Jika ada masalah, chat saya kembali.`;

      await api(`/api/chat/${transactionId}`, {
        method: 'POST',
        body: JSON.stringify({ message: details, is_account_delivery: true }),
      });

      await api(`/api/seller/orders/${transactionId}/deliver`, {
        method: 'PUT',
        body: JSON.stringify({ delivery_note: details }),
      });

      setAccountForm({ username: '', password: '', additional: '' });
      setShowAccountForm(false);
      showToast('Detail akun terkirim', 'success');
      clearInterval(pollRef.current);
      await loadChat();
      pollRef.current = setInterval(loadChat, 5000);
    } catch (err) {
      showToast('Gagal kirim detail akun: ' + err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const confirmReceive = async () => {
    setShowConfirmModal(false);
    try {
      await api(`/api/transaction/${transactionId}/confirm`, { method: 'PUT' });
      showToast('Transaksi berhasil diselesaikan', 'success');
      loadChat();
    } catch (err) {
      showToast(err.message || 'Gagal konfirmasi', 'error');
    }
  };

  const releaseEscrow = async () => {
    try {
      const res = await api(`/api/transaction/${transactionId}/release`, { method: 'POST' });
      showToast(`Dana dicairkan! Seller terima Rp${res.seller_amount?.toLocaleString('id-ID')}`, 'success');
      loadChat();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const isBuyer = transaction?.buyer_id === user.id;
  const isSeller = transaction?.seller_id === user.id;
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
  const otherName = isBuyer
    ? (transaction?.seller_name || 'Seller')
    : (transaction?.buyer_name || 'Pembeli');
  const st = STATUS[transaction?.status] || {
    label: transaction?.status || 'Unknown',
    icon: MessageCircle,
    bg: 'bg-[#1e293b]',
    text: 'text-[#94a3b8]',
    color: '#94a3b8',
  };
  const StIcon = st.icon;



  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      {/* ── Header ── */}
      <div className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#475569] sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/chats')}
            className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-[#f8fafc]" />
          </button>

          {/* Product image */}
          {transaction?.product_images && (() => {
            let imgSrc = null;
            try {
              const imgs = JSON.parse(transaction.product_images);
              if (imgs[0]) imgSrc = imgs[0];
            } catch {}
            return imgSrc ? (
              <img
                src={imgSrc}
                alt=""
                className="w-9 h-9 rounded-lg object-cover border border-[#475569] shrink-0"
              />
            ) : null;
          })()}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#f8fafc] truncate">
              {transaction?.product_name || 'Chat'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#94a3b8]">{otherName}</span>
              <span className="text-[#475569]">·</span>
              <span className={`flex items-center gap-1 text-[11px] font-medium ${st.text}`}>
                <StIcon size={10} />
                {st.label}
              </span>
            </div>
          </div>

          {/* Product link */}
          {transaction?.product_id && (
            <Link
              to={`/product/${transaction.product_id}`}
              className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors"
              title="Lihat Produk"
            >
              <ExternalLink size={15} className="text-[#94a3b8]" />
            </Link>
          )}
        </div>

        {/* ── Action Bar ── */}
        {transaction && transaction.status !== 'COMPLETED' && transaction.status !== 'CANCELLED' && (
          <div className="px-4 pb-3 flex gap-2">
            {/* Seller: send account details */}
            {isSeller && ['PAID', 'PROCESSING'].includes(transaction.status) && (
              <button
                onClick={() => setShowAccountForm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all"
              >
                <Key size={14} />
                Kirim Detail Akun
              </button>
            )}

            {/* Seller: waiting for buyer confirmation */}
            {isSeller && transaction.status === 'DELIVERED' && (
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1e293b] text-[#f8fafc] rounded-xl text-xs font-medium border border-[#475569]">
                <Clock size={14} />
                Menunggu Buyer Konfirmasi
              </div>
            )}

            {/* Buyer: confirm receipt */}
            {isBuyer && transaction.status === 'DELIVERED' && (
              <>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all"
                >
                  <CheckCircle size={14} />
                  Konfirmasi Diterima
                </button>
                <button
                  onClick={async () => {
                    const reason = prompt('Alasan dispute:');
                    if (!reason) return;
                    try {
                      await api(`/api/transaction/${transactionId}/dispute`, {
                        method: 'PUT',
                        body: JSON.stringify({ reason }),
                      });
                      showToast('Dispute diajukan', 'success');
                      loadChat();
                    } catch (err) {
                      showToast(err.message || 'Gagal ajukan dispute', 'error');
                    }
                  }}
                  className="flex items-center justify-center px-3 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-red-400 rounded-xl transition-all border border-[#475569]"
                  title="Laporkan masalah"
                >
                  <AlertTriangle size={14} />
                </button>
              </>
            )}

            {/* Buyer: waiting for seller */}
            {isBuyer && ['PAID', 'PROCESSING'].includes(transaction.status) && (
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1e293b] text-[#f8fafc] rounded-xl text-xs font-medium border border-[#475569]">
                <Package size={14} />
                Seller sedang menyiapkan akun...
              </div>
            )}

            {/* Waiting payment */}
            {transaction.status === 'WAITING_PAYMENT' && (
              <Link
                to={`/rekber?trx=${transactionId}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all"
              >
                <CreditCard size={14} />
                Bayar Sekarang
              </Link>
            )}

            {/* Admin: release escrow */}
            {isAdmin && transaction.status === 'COMPLETED' && !transaction.escrow_released && (
              <button
                onClick={releaseEscrow}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all"
              >
                <Banknote size={14} />
                Cairkan Dana ke Seller
              </button>
            )}

            {/* Admin: already released */}
            {isAdmin && transaction.escrow_released && (
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1e293b] text-[#f8fafc] rounded-xl text-xs font-medium border border-[#475569]">
                <CheckCircle size={14} />
                Dana Sudah Dicairkan
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Escrow info bar ── */}
      {transaction && ['PAID', 'PROCESSING', 'DELIVERED'].includes(transaction.status) && (
        <div className="bg-[#1e293b] border-b border-[#475569] px-4 py-2 flex items-center gap-2">
          <Shield size={12} className="text-[#3b82f6] shrink-0" />
          <span className="text-[11px] text-[#94a3b8]">
            Dana Rp{(transaction.amount || 0).toLocaleString()} ditahan oleh sistem. Akan cair setelah konfirmasi.
          </span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {error && (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-red-400 font-medium">{error}</p>
            <button
              onClick={loadChat}
              className="mt-1.5 text-xs text-[#3b82f6] font-medium underline underline-offset-2"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-[#475569] border-t-[#3b82f6] rounded-full animate-spin" />
            <span className="text-xs text-[#94a3b8]">Memuat chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#475569]">
              <MessageCircle size={24} className="text-[#94a3b8]" />
            </div>
            <p className="text-sm font-medium text-[#f8fafc]">Mulai percakapan</p>
            <p className="text-xs text-[#94a3b8] mt-1">Kirim pesan ke {otherName}</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === user.id;
            const isSystem =
              msg.sender_id === 0 ||
              msg.sender_id === null ||
              msg.message?.includes('DETAIL AKUN') ||
              msg.message?.startsWith('💰') ||
              msg.message?.startsWith('🔔');

            /* System message */
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 max-w-[85%]">
                    <div className="text-[11px] font-medium text-[#3b82f6] mb-1 flex items-center gap-1.5">
                      <Shield size={11} />
                      Sistem
                    </div>
                    <div className="text-xs text-[#f8fafc] whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>
                    <div className="text-[10px] text-[#94a3b8] mt-1.5 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            /* Account delivery message */
            const isAccountDelivery =
              msg.is_account_delivery || msg.message?.includes('DETAIL AKUN');

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[78%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <div className="text-[11px] text-[#94a3b8] mb-1 ml-1 font-medium">
                      {msg.sender_name}
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      isAccountDelivery
                        ? 'bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 text-[#f8fafc] rounded-br-md'
                        : isMe
                          ? 'bg-[#3b82f6] text-white rounded-br-md'
                          : 'bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 text-[#f8fafc] rounded-bl-md'
                    }`}
                  >
                    {isAccountDelivery && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#3b82f6] mb-1.5">
                        <Key size={11} />
                        Detail Akun
                      </div>
                    )}
                    {isAccountDelivery && !showCredentials ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                          <Lock size={12} />
                          Detail akun terenkripsi
                        </div>
                        <button
                          onClick={() => setShowCredentials(true)}
                          className="mt-2.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          Lihat Detail Akun
                        </button>
                      </div>
                    ) : (
                      <div className={isAccountDelivery ? 'font-mono text-xs' : ''}>
                        {msg.message}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-[10px] text-[#94a3b8] mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Transaction amount bar ── */}
      {transaction && (
        <div className="bg-[#1e293b] border-t border-[#475569] px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#94a3b8]">Total Transaksi</span>
          <span className="text-sm font-semibold text-[#f8fafc]">
            Rp{(transaction.amount || 0).toLocaleString()}
          </span>
        </div>
      )}

      {/* ── Input ── */}
      {transaction?.status !== 'COMPLETED' && transaction?.status !== 'CANCELLED' ? (
        <form
          onSubmit={sendMessage}
          className="bg-[#0f172a] border-t border-[#475569] px-4 py-3 flex gap-2 sticky bottom-16 md:bottom-0"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-3.5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-20 text-white rounded-xl transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="bg-[#0f172a] border-t border-[#475569] px-4 py-3 text-center">
          <span className="text-xs text-[#94a3b8]">
            {transaction.status === 'COMPLETED'
              ? 'Transaksi selesai — chat ditutup'
              : 'Transaksi dibatalkan'}
          </span>
        </div>
      )}

      {/* ── Modal: Send Account Details ── */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#475569]">
                <Key size={22} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-base font-semibold text-[#f8fafc]">
                Kirim Detail Akun
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Detail akan dikirim sebagai pesan rahasia ke buyer
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#94a3b8] mb-1.5 block">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, username: e.target.value })
                  }
                  placeholder="Username atau email akun"
                  className="w-full bg-[#334155] border border-[#475569] rounded-xl px-3.5 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#94a3b8] mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  value={accountForm.password}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, password: e.target.value })
                  }
                  placeholder="Password akun"
                  className="w-full bg-[#334155] border border-[#475569] rounded-xl px-3.5 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#94a3b8] mb-1.5 block">
                  Info Tambahan (opsional)
                </label>
                <textarea
                  value={accountForm.additional}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, additional: e.target.value })
                  }
                  placeholder="Link, kode verifikasi, catatan..."
                  rows={2}
                  className="w-full bg-[#334155] border border-[#475569] rounded-xl px-3.5 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowAccountForm(false)}
                className="flex-1 px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-[#94a3b8] rounded-xl text-xs font-medium transition-all border border-[#475569]"
              >
                Batal
              </button>
              <button
                onClick={sendAccountDetails}
                disabled={sending}
                className="flex-1 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {sending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Kirim & Tandai Dikirim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Receipt ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#334155] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#475569]">
                <CheckCircle size={22} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-base font-semibold text-[#f8fafc]">
                Konfirmasi Penerimaan
              </h3>
              <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                Pastikan akun sudah diterima dan berfungsi dengan baik. Dana Rp
                {(transaction?.amount || 0).toLocaleString()} akan langsung cair ke
                seller.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-[#94a3b8] rounded-xl text-xs font-medium transition-all border border-[#475569]"
              >
                Batal
              </button>
              <button
                onClick={confirmReceive}
                className="flex-1 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={13} />
                Ya, Sudah Diterima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
