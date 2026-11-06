import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface LibrarianLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLogin: (password: string) => Promise<boolean>;
}

export const LibrarianLoginModal: React.FC<LibrarianLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLogin,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const ok = await onLogin(password);
      if (ok) {
        setPassword('');
        onClose();
      } else {
        setError(t.loginError);
      }
    } catch {
      setError(t.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0f1d36] to-[#08101e] border border-[#d4af37]/50 shadow-[0_0_50px_rgba(212,175,55,0.25)] p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#142340] border border-[#d4af37]/60 flex items-center justify-center shadow-lg mb-3">
            <Lock className="w-6 h-6 text-[#f3c68f]" />
          </div>
          <h3 className="font-serif-title text-xl font-bold text-white tracking-wide">
            {t.loginTitle}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'kk' ? 'Кітапханашы құпиясөзі' : 'Пароль библиотекаря'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                autoFocus
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#091122] border border-[#223555] hover:border-[#385382] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0b162a] border border-[#1a2d4f] flex items-center justify-between text-xs text-slate-400">
            <span>{t.defaultPassHint}</span>
            <span className="font-mono font-bold text-[#f3c68f] bg-[#12223e] px-2 py-0.5 rounded border border-[#253f6c]">
              admin123
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t.loginCancel}
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                loading || !password.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#d4af37] via-[#f3c68f] to-[#d4af37] text-[#09101d] hover:brightness-110 shadow-md font-bold'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? '...' : t.loginSubmit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
