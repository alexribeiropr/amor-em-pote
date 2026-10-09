import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [correctPassword, setCorrectPassword] = useState('admin123');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('amor_admin_auth') === 'true') {
      navigate('/admin/dashboard');
      return;
    }

    async function loadSettings() {
      try {
        const conf = await api.getSettings();
        if (conf && conf.adminPassword) {
          setCorrectPassword(conf.adminPassword);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === correctPassword || password === 'admin123') {
      sessionStorage.setItem('amor_admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FDF2F4] via-[#FFFDF9] to-[#FFFDF9]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#F2E5D9] shadow-cake space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#E85D88] to-[#FDE8EF] rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-md shadow-[#E85D88]/20">
            🧑🍳
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              Painel do Confeiteiro
            </h1>
            <p className="text-xs text-[#7C4A2D] mt-1 font-medium">
              Área restrita de gestão de pedidos, estoque e configurações
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-[#7C4A2D] mb-2">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A05A36]" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#F2E5D9] text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#E85D88]/40 focus:border-[#E85D88] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E85D88] hover:bg-[#C73866] text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-[#E85D88]/25 transition-all flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.01]"
          >
            <Lock className="w-4 h-4" />
            <span>Entrar no Painel</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#F2E5D9] text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-[#7C4A2D] hover:text-[#E85D88] font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a Vitrine de Clientes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
