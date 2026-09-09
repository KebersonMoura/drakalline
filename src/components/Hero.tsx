import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Sparkles, ArrowRight, ShieldCheck, Microscope } from 'lucide-react';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const [photoSrc, setPhotoSrc] = useState<string>(() => storageService.getDoctorPhoto());

  useEffect(() => {
    // Initial fetch
    storageService.fetchLiveDoctorPhoto().then(url => {
      if (url) setPhotoSrc(url);
    });

    const handlePhotoUpdated = (e: any) => {
      if (e.detail) {
        setPhotoSrc(e.detail);
      }
    };

    window.addEventListener('doctor-photo-updated', handlePhotoUpdated);
    return () => window.removeEventListener('doctor-photo-updated', handlePhotoUpdated);
  }, []);
  return (
    <section id="inicio" className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#f4f3eb] scroll-mt-20">
      {/* Soft natural background accents with palette #c9bcad and #aa907d */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#c9bcad]/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#aa907d]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Main Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Elegant diagnostic badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9bcad]/30 border border-[#c9bcad] text-[#aa907d] text-xs font-semibold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#aa907d]" />
              <span>Diagnóstico Preciso & Saúde Capilar</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#3b3530] tracking-tight leading-[1.15]">
              Especialista em saúde e <span className="italic font-normal text-[#aa907d]">restauração capilar</span>.
            </h1>

            {/* Anchor quote */}
            <div className="space-y-3">
              <p className="font-serif text-2xl sm:text-3xl text-[#aa907d] font-medium italic">
                “Para um diagnóstico preciso.”
              </p>
              <p className="text-base sm:text-lg text-[#655d56] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Avaliação minuciosa com tricoscopia digital de alta resolução, tratamentos individualizados para queda de cabelo e restauração capilar com máxima naturalidade.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-booking-btn"
                onClick={onOpenBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] font-medium text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#f4f3eb]" />
                <span>Agendar Consulta</span>
                <ArrowRight className="w-4 h-4 text-[#c9bcad]" />
              </button>

              <a
                id="hero-whatsapp-btn"
                href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Gostaria%20de%20agendar%20uma%20consulta%20para%20avalia%C3%A7%C3%A3o%20capilar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-emerald-50/50 text-[#3b3530] border-2 border-[#25D366]/60 hover:border-[#25D366] font-medium text-sm rounded-full transition-all shadow-[0_2px_14px_rgba(37,211,102,0.2)] hover:shadow-[0_4px_20px_rgba(37,211,102,0.35)] group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20 stroke-[2.2]" />
                </div>
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#c9bcad]/60 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold uppercase text-[#3b3530] tracking-wider">Tricoscopia</span>
                <span className="block text-xs text-[#ada49c]">Diagnóstico Digital</span>
              </div>
              <div className="space-y-0.5 border-l border-[#c9bcad] pl-3">
                <span className="block text-xs font-semibold uppercase text-[#3b3530] tracking-wider">FUE Fio a Fio</span>
                <span className="block text-xs text-[#ada49c]">Transplante Natural</span>
              </div>
              <div className="space-y-0.5 border-l border-[#c9bcad] pl-3">
                <span className="block text-xs font-semibold uppercase text-[#3b3530] tracking-wider">Individual</span>
                <span className="block text-xs text-[#ada49c]">Plano Terapêutico</span>
              </div>
            </div>

          </div>

          {/* Medical Doctor Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              
              <div className="aspect-4/5 rounded-2xl overflow-hidden shadow-xl border-4 border-[#c9bcad]/60 relative bg-[#c9bcad]/20 group">
                <img
                  src={photoSrc}
                  alt="Dra. Kaline - Especialista em Saúde e Restauração Capilar"
                  className="w-full h-full object-cover"
                  onError={() => setPhotoSrc('/images/foto-1-destaque.svg')}
                  referrerPolicy="no-referrer"
                />
                
                {/* Clean Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#2c2724]/90 via-[#2c2724]/50 to-transparent p-5 text-white">
                  <div className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-[#c9bcad]" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#c9bcad]">Tricoscopia & Restauração</span>
                  </div>
                  <p className="text-base font-serif font-medium mt-0.5 text-[#f4f3eb]">Dra. Kaline</p>
                  <p className="text-xs text-[#c9bcad]">Especialista em saúde e restauração capilar</p>
                </div>
              </div>

              {/* Floating diagnostic badge */}
              <div className="hidden sm:flex absolute -bottom-3 -left-3 bg-[#f4f3eb] px-3.5 py-2 rounded-xl shadow-md border border-[#c9bcad] items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#aa907d]" />
                <span className="text-xs font-medium text-[#3b3530]">Para um diagnóstico preciso</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
