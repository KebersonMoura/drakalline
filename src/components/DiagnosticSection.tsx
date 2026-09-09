import React from 'react';
import { Microscope, FileCheck, Stethoscope, ArrowRight } from 'lucide-react';

interface DiagnosticSectionProps {
  onOpenBooking: () => void;
}

export const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({ onOpenBooking }) => {
  const steps = [
    {
      number: '01',
      title: 'Tricoscopia Digital de Alta Resolução',
      description: 'Mapeamento microscópico detalhado dos folículos, calibre dos fios e couro cabeludo para detectar sinais precoces de calvície e inflamação.',
      icon: Microscope
    },
    {
      number: '02',
      title: 'Investigação Médica & Exames',
      description: 'Avaliação clínica minuciosa que correlaciona fatores genéticos, hormonais, nutricionais e de estilo de vida para identificar a raiz do problema.',
      icon: FileCheck
    },
    {
      number: '03',
      title: 'Plano Terapêutico Individualizado',
      description: 'Definição da conduta precisa: protocolos orais, tópicos, MMP® Capilar com fatores de crescimento ou indicação de restauração FUE.',
      icon: Stethoscope
    }
  ];

  return (
    <section id="diagnostico" className="py-16 md:py-20 bg-[#f4f3eb] border-b border-[#c9bcad]/60 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#aa907d] block mb-2">
            Metodologia & Rigor Clínico
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3b3530] tracking-tight">
            Para um diagnóstico preciso
          </h2>
          <p className="mt-3 text-[#655d56] text-sm sm:text-base leading-relaxed">
            Não existe fórmula genérica para queda capilar. O sucesso de qualquer recuperação começa pela identificação exata da causa biológica.
          </p>
        </div>

        {/* 3 Simple Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="bg-[#f4f3eb] p-6 rounded-2xl border border-[#c9bcad] shadow-2xs hover:border-[#aa907d] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#c9bcad]/30 flex items-center justify-center text-[#aa907d]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-serif text-sm font-bold text-[#aa907d]">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-[#3b3530] pt-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#655d56] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action prompt */}
        <div className="mt-10 text-center">
          <button
            id="diagnostic-booking-cta"
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs sm:text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <span>Agendar Avaliação e Tricoscopia</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#f4f3eb]" />
          </button>
        </div>

      </div>
    </section>
  );
};
