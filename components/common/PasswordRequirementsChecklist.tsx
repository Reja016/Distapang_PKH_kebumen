'use client';

import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { validatePasswordCriteria } from '@/lib/password';

interface PasswordRequirementsChecklistProps {
  password: string;
  showAlways?: boolean;
  className?: string;
}

export default function PasswordRequirementsChecklist({
  password,
  showAlways = false,
  className = '',
}: PasswordRequirementsChecklistProps) {
  if (!password && !showAlways) return null;

  const { hasMinLength, hasNumber, hasSymbol, hasLetter, isValid, score } =
    validatePasswordCriteria(password);

  const criteria = [
    { label: 'Minimal 8 karakter', met: hasMinLength },
    { label: 'Mengandung angka (0-9)', met: hasNumber },
    { label: 'Mengandung simbol khusus (!@#$% dll)', met: hasSymbol },
    { label: 'Mengandung huruf (A-Z / a-z)', met: hasLetter },
  ];

  return (
    <div
      className={`p-3 rounded-xl border text-xs transition-all duration-200 ${
        isValid
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldCheck size={14} className={isValid ? 'text-emerald-600' : 'text-slate-400'} />
          <span>Syarat Kombinasi Sandi:</span>
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isValid
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700'
              : score >= 2
              ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700'
              : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700'
          }`}
        >
          {isValid ? 'Kuat & Sesuai' : `${score}/4 Terpenuhi`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              item.met
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                item.met
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-300 dark:border-slate-700'
              }`}
            >
              {item.met ? (
                <Check size={11} strokeWidth={3} />
              ) : (
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              )}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
