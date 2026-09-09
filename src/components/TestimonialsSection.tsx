import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../data/initialData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="depoimentos" className="py-16 md:py-20 bg-[#f4f3eb] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#aa907d] block mb-2">
            Resultados & Confiança
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3b3530] tracking-tight">
            Depoimentos de Pacientes
          </h2>
          <p className="mt-3 text-[#655d56] text-sm sm:text-base leading-relaxed">
            A satisfação e recuperação da autoestima de quem confiou no diagnóstico preciso da Dra. Kaline.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-[#f4f3eb] rounded-2xl p-6 border border-[#c9bcad] shadow-2xs hover:border-[#aa907d] hover:shadow-sm transition-all flex flex-col justify-between space-y-4 relative"
            >
              <Quote className="w-7 h-7 text-[#c9bcad]/60 absolute top-5 right-5" />

              <div className="space-y-3">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#aa907d] text-[#aa907d]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#4a433d] leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#c9bcad]/60 flex items-center gap-3">
                {item.avatarUrl && (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#c9bcad]"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-xs text-[#3b3530] flex items-center gap-1">
                    <span>{item.name}</span>
                    {item.verified && (
                      <CheckCircle2 className="w-3 h-3 text-[#aa907d] inline" />
                    )}
                  </h4>
                  <p className="text-[11px] text-[#ada49c]">
                    {item.procedure} • {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
