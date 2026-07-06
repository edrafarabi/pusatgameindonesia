import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, ShieldCheck, CreditCard, RefreshCw, MessageSquare } from 'lucide-react';

export default function ChatRoom() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const title = searchParams.get('title') || 'Transaksi Rekber';
  const price = parseInt(searchParams.get('price')) || 150000;
  const seller = searchParams.get('seller') || 'Penjual';

  const [messages, setMessages] = useState([
    { sender: 'System', message: 'Selamat datang di room transaksi rekber resmi. Baca petunjuk transaksi aman di bawah.', timestamp: 'Sekarang' }
  ]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('WAITING_PAYMENT'); // WAITING_PAYMENT -> PAID_WAITING_ACCOUNT -> ACCOUNT_DELIVERED -> COMPLETED
  const [userRole, setUserRole] = useState('BUYER'); // BUYER / SELLER / ADMIN
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect socket.io client
    socketRef.current = io('/', { path: '/socket.io' });

    socketRef.current.emit('join-room', id);

    socketRef.current.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgData = {
      roomId: id,
      sender: userRole === 'BUYER' ? 'Pembeli' : 'Penjual',
      message: inputText
    };

    socketRef.current.emit('send-message', msgData);
    setInputText('');
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    // Emit system message to room
    const systemMsgs = {
      PAID_WAITING_ACCOUNT: 'Pembeli telah membayar deposit! Penjual silakan berikan detail login akun (Username & Password) via chat ini atau upload kredensial.',
      ACCOUNT_DELIVERED: 'Penjual telah memberikan kredensial akun. Pembeli silakan amankan/ganti data dan selesaikan transaksi jika semua sudah benar.',
      COMPLETED: 'Transaksi Rekber Selesai! Dana berhasil dilepaskan ke penjual. Terima kasih telah menggunakan PusatGame.'
    };

    socketRef.current.emit('send-message', {
      roomId: id,
      sender: 'System',
      message: systemMsgs[newStatus]
    });
  };

  return (
    <div className="bg-[#f5f6f9] h-[calc(100vh-100px)] flex flex-col pb-14">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-xs text-gray-800 line-clamp-1">{title}</h3>
            <p className="text-[10px] text-gray-500">ID: {id} • Rp {price.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Role Switcher for simulation */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200">
          <button
            onClick={() => setUserRole('BUYER')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${userRole === 'BUYER' ? 'bg-[#0070f0] text-white shadow-sm' : 'text-gray-600'}`}
          >
            Pembeli
          </button>
          <button
            onClick={() => setUserRole('SELLER')}
            className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${userRole === 'SELLER' ? 'bg-[#0070f0] text-white shadow-sm' : 'text-gray-600'}`}
          >
            Penjual
          </button>
        </div>
      </div>

      {/* Transaction status card */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></div>
          <div className="text-xs">
            <span className="font-bold text-gray-700">Status Transaksi: </span>
            <span className="font-black text-[#0070f0]">
              {status === 'WAITING_PAYMENT' && 'Menunggu Pembayaran Deposit'}
              {status === 'PAID_WAITING_ACCOUNT' && 'Pembayaran Aman - Tunggu Serah Akun'}
              {status === 'ACCOUNT_DELIVERED' && 'Akun Dikirim - Silakan Periksa'}
              {status === 'COMPLETED' && 'Selesai & Dana Dilepas'}
            </span>
          </div>
        </div>

        {/* Action Button based on status & role */}
        <div className="shrink-0">
          {status === 'WAITING_PAYMENT' && userRole === 'BUYER' && (
            <button
              onClick={() => updateStatus('PAID_WAITING_ACCOUNT')}
              className="bg-[#0070f0] hover:bg-[#005ec8] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <CreditCard size={12} /> Bayar Deposit
            </button>
          )}

          {status === 'PAID_WAITING_ACCOUNT' && userRole === 'SELLER' && (
            <button
              onClick={() => updateStatus('ACCOUNT_DELIVERED')}
              className="bg-[#ee4d2d] hover:bg-[#d84420] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              Serahkan Akun
            </button>
          )}

          {status === 'ACCOUNT_DELIVERED' && userRole === 'BUYER' && (
            <button
              onClick={() => updateStatus('COMPLETED')}
              className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              Konfirmasi Selesai
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[#f0f2f5]">
        {messages.map((msg, index) => {
          const isSystem = msg.sender === 'System';
          const isSelf = (userRole === 'BUYER' && msg.sender === 'Pembeli') || (userRole === 'SELLER' && msg.sender === 'Penjual');

          if (isSystem) {
            return (
              <div key={index} className="flex justify-center my-2">
                <div className="bg-[#e0f2fe] border border-[#bae6fd] rounded-lg px-4 py-2 max-w-[85%] text-[10px] text-gray-700 leading-normal flex items-start gap-2 shadow-xs">
                  <ShieldCheck className="text-[#0070f0] shrink-0 mt-0.5" size={14} />
                  <span>{msg.message}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3.5 py-2 text-xs shadow-xs relative ${
                isSelf ? 'bg-[#0070f0] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                <div className="font-bold text-[9px] opacity-75 mb-0.5">{msg.sender}</div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                <div className="text-[8px] opacity-60 text-right mt-1">{msg.timestamp || 'Sekarang'}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <form onSubmit={handleSend} className="bg-white border-t border-gray-200 p-2.5 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ketik pesan sebagai ${userRole === 'BUYER' ? 'Pembeli' : 'Penjual'}...`}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
        />
        <button
          type="submit"
          className="bg-[#0070f0] hover:bg-[#005ec8] text-white p-2 rounded-full shadow-xs transition-colors flex items-center justify-center cursor-pointer shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
