import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Footer() {
  const [settings, setSettings] = useState({
    businessHours: 'Terça a Domingo: 13:00 às 21:00',
    closedMessage: 'Segunda-feira: Fechado para produção',
    storeName: 'Amor em Pote'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const conf = await api.getSettings();
        if (conf) setSettings(prev => ({ ...prev, ...conf }));
      } catch (err) {
        console.error(err);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#3D2314] text-[#F7EFE5] pt-12 pb-8 border-t-4 border-[#E86A8D] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#5C3826]">
          {/* Brand & Concept */}
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E86A8D]/50 shadow-md bg-white shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-pacifico text-2xl text-white block leading-none">Amor em Pote</span>
                <span className="text-[10px] text-[#F7EFE5]/70 uppercase tracking-widest font-black">Doces Artesanais</span>
              </div>
            </div>
            <p className="text-sm text-[#F7EFE5]/80 leading-relaxed">
              Mais que doces, momentos especiais! Feitos com carinho, qualidade em cada pote e sabor que faz bem.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-[#E86A8D] font-bold">
              <span>Feitos com carinho</span>
              <Heart className="w-3.5 h-3.5 fill-[#E86A8D]" />
            </div>
          </div>

          {/* Business Hours & Delivery */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="font-bold text-white text-base flex items-center justify-center md:justify-start gap-2">
              <Clock className="w-4 h-4 text-[#E86A8D]" />
              Horário de Atendimento
            </h4>
            <ul className="text-sm text-[#F7EFE5]/80 space-y-1.5">
              <li>{settings.businessHours || 'Terça a Domingo: 13:00 às 21:00'}</li>
              <li>{settings.closedMessage || 'Segunda-feira: Fechado para produção'}</li>
              <li className="text-xs text-[#E5A93B] font-semibold pt-1">
                ✨ Pedidos enviados imediatamente após confirmação!
              </li>
            </ul>
          </div>

          {/* Quick Contact & Admin access */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="font-bold text-white text-base flex items-center justify-center md:justify-start gap-2">
              <MessageCircle className="w-4 h-4 text-[#E86A8D]" />
              Atendimento Direto
            </h4>
            <p className="text-sm text-[#F7EFE5]/80">
              Dúvidas sobre encomendas personalizadas ou eventos? Fale conosco!
            </p>
            <div className="pt-1">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-[#F7EFE5]/60 hover:text-[#E86A8D] transition-colors border border-[#5C3826] px-3 py-1.5 rounded-full"
              >
                <span>Acesso do Confeiteiro / Painel Admin</span>
                <span>🔒</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center text-xs text-[#F7EFE5]/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings.storeName || 'Amor em Pote - Doces Artesanais'}. Todos os direitos reservados.</span>
          <span>Desenvolvido com carinho para microempreendedores 🍰</span>
        </div>
      </div>
    </footer>
  );
}
