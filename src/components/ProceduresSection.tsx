import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  X, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { Procedure } from '../types';

interface ProceduresSectionProps {
  procedures: Procedure[];
  onSelectProcedureForBooking: (procedureId: string) => void;
}

export const ProceduresSection: React.FC<ProceduresSectionProps> = ({
  procedures,
  onSelectProcedureForBooking
}) => {
  const [selectedModalProcedure, setSelectedModalProcedure] = useState<Procedure | null>(null);

  return (
    <section id="tratamento" className="py-16 md:py-20 bg-[#f4f3eb] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#aa907d] block mb-2">
            Cuidados & Procedimentos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3b3530] tracking-tight">
            Tratamentos
          </h2>
          <p className="mt-3 text-[#655d56] text-sm sm:text-base leading-relaxed">
            Soluções médicas e cirúrgicas para a restauração capilar, controle da queda e cuidado integral da pele.
          </p>
        </div>

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((proc) => (
            <div
              key={proc.id}
              className="bg-[#f4f3eb] rounded-2xl overflow-hidden border border-[#c9bcad] shadow-2xs hover:border-[#aa907d] hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              {/* Image Frame */}
              <div className="relative aspect-16/10 overflow-hidden bg-[#c9bcad]/20">
                <img
                  src={proc.imageUrl}
                  alt={proc.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/uploads/tricoscopia.jpg';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4f3eb]/95 backdrop-blur-xs text-[11px] font-medium text-[#3b3530] border border-[#c9bcad] shadow-xs">
                    <Clock className="w-3 h-3 text-[#aa907d]" />
                    {proc.duration}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg text-[#3b3530] leading-snug">
                    {proc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#655d56] line-clamp-2 leading-relaxed">
                    {proc.subtitle}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#c9bcad]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedModalProcedure(proc)}
                    className="text-xs font-semibold text-[#aa907d] hover:text-[#967e6c] py-1 transition-colors cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => onSelectProcedureForBooking(proc.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-medium rounded-full transition-colors cursor-pointer"
                  >
                    <span>Agendar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Details Modal */}
      {selectedModalProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3b3530]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#f4f3eb] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#c9bcad] animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header Image */}
            <div className="relative aspect-16/9 bg-[#c9bcad]/30 shrink-0">
              <img
                src={selectedModalProcedure.imageUrl}
                alt={selectedModalProcedure.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/uploads/tricoscopia.jpg';
                }}
              />
              <button
                onClick={() => setSelectedModalProcedure(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#f4f3eb]/95 text-[#3b3530] flex items-center justify-center hover:bg-[#f4f3eb] shadow-xs border border-[#c9bcad] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#aa907d] block">
                  Procedimento
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#3b3530] mt-1">
                  {selectedModalProcedure.title}
                </h3>
                <p className="text-xs text-[#ada49c] mt-0.5">
                  Duração estimada: {selectedModalProcedure.duration} • {selectedModalProcedure.downtime}
                </p>
              </div>

              <p className="text-sm text-[#655d56] leading-relaxed">
                {selectedModalProcedure.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2 pt-2 border-t border-[#c9bcad]/60">
                <h4 className="text-xs font-semibold text-[#3b3530] uppercase tracking-wider">
                  Principais Indicações & Benefícios
                </h4>
                <ul className="space-y-1.5">
                  {selectedModalProcedure.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#655d56]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#aa907d] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modal CTA */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    const id = selectedModalProcedure.id;
                    setSelectedModalProcedure(null);
                    onSelectProcedureForBooking(id);
                  }}
                  className="flex-1 py-3 px-4 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#f4f3eb]" />
                  <span>Agendar Este Tratamento</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
