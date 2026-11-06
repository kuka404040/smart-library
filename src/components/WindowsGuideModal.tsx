import React, { useState } from 'react';
import { X, Terminal, Copy, Check, Server, Cpu, Database, Play } from 'lucide-react';
import { Language } from '../types';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isKk = lang === 'kk';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-b from-[#0e172a] via-[#091122] to-[#050b16] border border-[#d4af37]/50 shadow-[0_0_60px_rgba(212,175,55,0.2)] p-6 sm:p-8 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#142340] border border-[#d4af37]/60 flex items-center justify-center text-[#f3c68f] shadow-md">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title text-xl font-bold text-white tracking-wide">
              {isKk ? 'Windows жүйесінде орнату және іске қосу нұсқаулығы' : 'Инструкция по установке и запуску на Windows'}
            </h3>
            <p className="text-xs text-slate-400">
              Python + FastAPI + SQLite + Ollama (nomic-embed-text) & Node.js
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300 max-h-[500px] overflow-y-auto pr-2">
          {/* Architecture Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f4d] flex items-center gap-2.5">
              <Server className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">FastAPI / Node</div>
                <div className="text-[10px] text-slate-400">Backend API</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f4d] flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#f3c68f] shrink-0" />
              <div>
                <div className="font-semibold text-white">SQLite 3</div>
                <div className="text-[10px] text-slate-400">data/library.db</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f4d] flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Ollama AI</div>
                <div className="text-[10px] text-slate-400">nomic-embed-text</div>
              </div>
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#f3c68f] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1b2b48] border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-mono">1</span>
              {isKk ? 'Ollama және nomic-embed-text моделін орнату' : 'Установка Ollama и модели nomic-embed-text'}
            </h4>
            <p className="text-slate-400">
              {isKk
                ? 'Ресми сайттан Ollama жүктеп алыңыз (ollama.com). Содан кейін Windows PowerShell немесе CMD терезесінде модельді тартып алыңыз:'
                : 'Скачайте Ollama с официального сайта (ollama.com). Затем в Windows PowerShell или командной строке выполните:'}
            </p>
            <div className="relative p-3 rounded-xl bg-[#040812] border border-[#16233a] font-mono text-[11px] text-emerald-300">
              <code>ollama pull nomic-embed-text</code>
              <button
                onClick={() => copyCode('ollama pull nomic-embed-text', 1)}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#0e172a] hover:bg-[#1a2947] text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#f3c68f] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1b2b48] border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-mono">2</span>
              {isKk ? 'Python тәуелділіктерін орнату (FastAPI)' : 'Установка зависимостей Python (FastAPI)'}
            </h4>
            <div className="relative p-3 rounded-xl bg-[#040812] border border-[#16233a] font-mono text-[11px] text-emerald-300">
              <code>cd backend{'\n'}pip install -r requirements.txt</code>
              <button
                onClick={() => copyCode('cd backend\npip install -r requirements.txt', 2)}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#0e172a] hover:bg-[#1a2947] text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#f3c68f] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1b2b48] border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-mono">3</span>
              {isKk ? 'Python серверін іске қосу' : 'Запуск сервера Python FastAPI'}
            </h4>
            <div className="relative p-3 rounded-xl bg-[#040812] border border-[#16233a] font-mono text-[11px] text-emerald-300">
              <code>uvicorn main:app --reload --port 8000</code>
              <button
                onClick={() => copyCode('uvicorn main:app --reload --port 8000', 3)}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#0e172a] hover:bg-[#1a2947] text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 4: Frontend or Single Command */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-[#f3c68f] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1b2b48] border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-mono">4</span>
              {isKk ? 'Немесе бір пәрменмен іске қосу (Node.js)' : 'Или запуск одной командой (Node.js Fullstack)'}
            </h4>
            <p className="text-slate-400">
              {isKk
                ? 'Жоба толық дербес Express + SQLite режимінде де жұмыс істейді:'
                : 'Проект также готов к запуску в режиме единого сервера Node.js + SQLite:'}
            </p>
            <div className="relative p-3 rounded-xl bg-[#040812] border border-[#16233a] font-mono text-[11px] text-emerald-300">
              <code>npm install{'\n'}npm run dev</code>
              <button
                onClick={() => copyCode('npm install\nnpm run dev', 4)}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#0e172a] hover:bg-[#1a2947] text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Librarian Access Notice */}
          <div className="p-4 rounded-xl bg-[#0c182d] border border-[#d4af37]/40 space-y-1.5">
            <div className="font-bold text-[#f3c68f] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#d4af37]" />
              <span>{isKk ? 'Кітапханашы кіруі:' : 'Вход библиотекаря:'}</span>
            </div>
            <p className="text-slate-300">
              {isKk
                ? 'Браузердің мекенжай жолағына тікелей /admin деп жазыңыз (мысалы, http://localhost:3000/admin). Құпиясөз:'
                : 'Введите в адресной строке браузера /admin (например, http://localhost:3000/admin). Пароль:'}{' '}
              <strong className="text-[#f3c68f] font-mono bg-[#142340] px-2 py-0.5 rounded border border-[#233a62]">
                admin123
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1a2946] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#13223d] hover:bg-[#1a2f54] text-white font-semibold text-xs cursor-pointer"
          >
            {isKk ? 'Түсінікті, жабу' : 'Понятно, закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};
