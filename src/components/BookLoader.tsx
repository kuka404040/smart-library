import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface BookLoaderProps {
  isLoading: boolean;
  onFinish?: () => void;
  lang: Language;
}

export const BookLoader: React.FC<BookLoaderProps> = ({ isLoading, onFinish, lang }) => {
  const [show, setShow] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const t = translations[lang];

  useEffect(() => {
    const pageTimer = setInterval(() => {
      setPageIndex((prev) => (prev + 1) % 4);
    }, 700);

    return () => clearInterval(pageTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const exitTimer = setTimeout(() => {
        setShow(false);
        onFinish?.();
      }, 700);
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading, onFinish]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050811] overflow-hidden select-none"
      >
        {/* Ambient Dark-Blue & Golden Particle Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#d4af37]/15 via-[#1a2b4c]/30 to-transparent rounded-full blur-3xl animate-gold-pulse" />
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-[#d4af37]/10 rounded-full blur-2xl animate-float-particles" />
          <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[#0055ff]/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* 3D Scene Container */}
        <div className="relative w-80 h-64 perspective-1200 flex items-center justify-center mb-8">
          {/* Background Rotating Books */}
          <div className="absolute -left-12 -top-4 w-28 h-36 transform-style-3d opacity-40 hidden sm:block animate-book-rotate" style={{ animationDuration: '16s' }}>
            <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-r-md border-l-4 border-l-[#d4af37]/60 shadow-2xl flex items-center justify-center">
              <span className="text-[10px] text-amber-200/60 font-serif -rotate-90">KNOWLEDGE</span>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-2 w-28 h-36 transform-style-3d opacity-40 hidden sm:block animate-book-rotate" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
            <div className="w-full h-full bg-gradient-to-br from-[#132238] to-[#07111e] rounded-r-md border-l-4 border-l-[#b8860b]/60 shadow-2xl flex items-center justify-center">
              <span className="text-[10px] text-amber-200/60 font-serif -rotate-90">DIGITAL</span>
            </div>
          </div>

          {/* Central Feature Tome - Realistic 3D Opening Book */}
          <div className="relative w-48 h-64 transform-style-3d [transform:rotateX(20deg)_rotateY(-15deg)] transition-transform duration-700">
            {/* Book Spine */}
            <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-[#0d1627] via-[#1a2844] to-[#0a1120] rounded-l-md border-r border-[#d4af37]/40 shadow-xl flex flex-col justify-between py-4 items-center">
              <div className="w-1.5 h-6 bg-[#d4af37]/70 rounded-full" />
              <div className="text-[9px] text-[#f3c68f] font-serif -rotate-90 tracking-widest font-semibold">SMART</div>
              <div className="w-1.5 h-6 bg-[#d4af37]/70 rounded-full" />
            </div>

            {/* Back Cover */}
            <div className="absolute left-6 top-0 w-44 h-full bg-[#0a1324] rounded-r-lg border-2 border-[#d4af37]/30 shadow-2xl" />

            {/* Book Pages Stack (Edge texture) */}
            <div className="absolute left-7 top-1.5 w-40 h-[98%] bg-gradient-to-r from-[#f7f2e4] via-[#eae0cc] to-[#ded2b8] rounded-r shadow-inner">
              {/* Golden Volumetric Light Emanating From Inside */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/30 via-transparent to-[#f3c68f]/20" />
            </div>

            {/* Turning Dynamic Pages with 3D Flip */}
            <div className="absolute left-7 top-1.5 w-40 h-[98%] transform-style-3d">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 bg-[#fdfbf7] text-[#1c1917] p-3 rounded-r shadow-md border-r border-amber-200/60 transform-style-3d origin-left backface-hidden"
                  style={{
                    animation: `pageFlipSlow 2.8s ease-in-out infinite`,
                    animationDelay: `${idx * 0.45}s`,
                  }}
                >
                  <div className="h-full border border-dashed border-amber-900/10 p-2 flex flex-col justify-between">
                    <div className="space-y-1.5 opacity-60">
                      <div className="h-1 bg-amber-900/40 rounded w-4/5" />
                      <div className="h-1 bg-amber-900/30 rounded w-full" />
                      <div className="h-1 bg-amber-900/30 rounded w-3/4" />
                      <div className="h-1 bg-amber-900/20 rounded w-5/6" />
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-amber-900/50">
                      <span>Smart Library</span>
                      <span>p. {24 + idx}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Open Front Cover Flap */}
            <div className="absolute left-6 top-0 w-44 h-full bg-gradient-to-br from-[#0c1830] via-[#102142] to-[#080f1e] rounded-r-lg border-2 border-[#d4af37]/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] origin-left [transform:rotateY(-140deg)] transition-all duration-1000 flex flex-col justify-between p-4 backface-hidden">
              <div className="flex justify-between items-start">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span className="text-[8px] font-mono text-[#f3c68f]/80 uppercase">Est. 2026</span>
              </div>
              <div className="text-center py-4">
                <div className="w-10 h-10 mx-auto rounded-full border border-[#d4af37]/40 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-[#f3c68f]" />
                </div>
                <div className="font-serif text-[11px] font-bold text-[#f3c68f] tracking-wider">SMART</div>
                <div className="text-[9px] text-[#e2e8f0]/80">LIBRARY</div>
              </div>
              <div className="text-[7px] text-center text-[#d4af37]/60 uppercase tracking-widest">
                Digital Edition
              </div>
            </div>
          </div>
        </div>

        {/* Text & Status Display */}
        <div className="text-center max-w-md px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#f3c68f] via-[#ffffff] to-[#d4af37]">
              SMART LIBRARY
            </h1>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm text-[#cbd5e1] font-light tracking-wide mb-4"
          >
            {t.appSubtitle}
          </motion.p>

          {/* Progress / Loading Indicator (Non-circular, Book Themed) */}
          <div className="w-48 mx-auto h-1.5 bg-[#121c32] rounded-full overflow-hidden border border-[#d4af37]/20 relative">
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: 'easeInOut',
              }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-full shadow-[0_0_10px_#d4af37]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.6 }}
            className="text-[11px] text-[#94a3b8] mt-3 font-mono flex items-center justify-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
            {t.loaderSubtitle}
          </motion.p>
        </div>

        {/* Fast dismiss button in bottom right if user is in a hurry */}
        <button
          onClick={() => {
            setShow(false);
            onFinish?.();
          }}
          className="absolute bottom-6 right-6 text-[11px] text-slate-500 hover:text-[#f3c68f] transition-colors font-mono cursor-pointer underline underline-offset-4"
        >
          {lang === 'kk' ? 'Өткізіп жіберу →' : 'Пропустить →'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
