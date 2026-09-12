import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  Pause,
  Play
} from 'lucide-react';
import { HeroSlide } from '../types';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

interface TopHeroCarouselProps {
  onOpenBooking: (procedureId?: string) => void;
}

export const TopHeroCarousel: React.FC<TopHeroCarouselProps> = ({ 
  onOpenBooking 
}) => {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const local = storageService.getHeroSlides();
    return local.filter(s => s.isActive !== false);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => storageService.getWhatsappNumber());

  // Touch gesture support for mobile vertical scroll
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Fetch live from MySQL on mount
  useEffect(() => {
    storageService.fetchLiveHeroSlides().then(liveList => {
      const active = liveList.filter(s => s.isActive !== false);
      if (active.length > 0) {
        setSlides(active);
      }
    });

    const handleSlidesUpdate = (e: any) => {
      if (Array.isArray(e.detail)) {
        const active = e.detail.filter((s: HeroSlide) => s.isActive !== false);
        if (active.length > 0) {
          setSlides(active);
          setCurrentIndex(prev => Math.min(prev, active.length - 1));
        }
      }
    };

    const handleWhatsappUpdate = (e: any) => {
      if (e?.detail?.whatsappNumber) {
        setWhatsappNumber(e.detail.whatsappNumber);
      } else {
        setWhatsappNumber(storageService.getWhatsappNumber());
      }
    };

    window.addEventListener('hero-slides-updated', handleSlidesUpdate);
    window.addEventListener('whatsapp-updated', handleWhatsappUpdate);
    return () => {
      window.removeEventListener('hero-slides-updated', handleSlidesUpdate);
      window.removeEventListener('whatsapp-updated', handleWhatsappUpdate);
    };
  }, []);

  // 30 seconds per slide as requested
  const SLIDE_DURATION_MS = 30000;

  // Auto-play interval - rolls vertically every 30 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  // Touch handlers for vertical swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const distance = touchStartY.current - touchEndY.current;
    if (distance > 40) {
      goToNext(); // swiped up -> next slide
    } else if (distance < -40) {
      goToPrev(); // swiped down -> prev slide
    }
    touchStartY.current = null;
    touchEndY.current = null;
  };

  if (!slides || slides.length === 0) return null;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Gostaria%20de%20agendar%20uma%20consulta%20para%20avalia%C3%A7%C3%A3o%20capilar.`;

  return (
    <section 
      id="inicio"
      className="relative pt-20 overflow-hidden bg-[#1c1815] text-[#f4f3eb] scroll-mt-20 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Viewport Window - Fixed responsive height with hidden overflow */}
      <div className="relative h-[560px] sm:h-[640px] lg:h-[700px] w-full overflow-hidden">
        
        {/* 30-Second Continuous Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/15 z-30 overflow-hidden pointer-events-none">
          <div 
            key={`${currentIndex}-${isPaused}`}
            className={`h-full bg-gradient-to-r from-[#aa907d] to-[#d6c7ba] ${isPaused ? '' : 'animate-slide-progress'}`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          />
        </div>

        {/* Vertical Rolling Track */}
        <div 
          className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => {
            const mobileImage = slide.mobileImageUrl || slide.imageUrl;
            const mobileTitle = slide.mobileTitle || slide.title;
            const mobileMessage = slide.mobileSubtitle || slide.subtitle;

            return (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 relative flex items-center bg-[#1c1815] overflow-hidden"
              >
                {/* Background Image: Mobile vs Desktop */}
                <div className="absolute inset-0 z-0 bg-[#1c1815]">
                  {/* Mobile Image (Visible on screen < sm) - Enquadrada puxada da direita para esquerda com movimento suave */}
                  <div className="w-full h-full sm:hidden overflow-hidden">
                    <img
                      src={mobileImage}
                      alt={mobileTitle}
                      className="w-full h-full object-cover object-[72%_center] animate-pan-mobile will-change-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Desktop Image (Visible on screen >= sm) */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center hidden sm:block"
                    referrerPolicy="no-referrer"
                  />
                  {/* Mobile subtle gradient overlay for pristine contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent sm:hidden" />
                </div>

                {/* MOBILE VIEW: Minimal layout displaying ONLY Title and Short Message */}
                <div className="sm:hidden relative z-10 w-full px-5 py-6 mt-auto flex flex-col justify-end">
                  <div className="space-y-3 p-5 rounded-3xl bg-black/55 backdrop-blur-md border border-white/15 shadow-2xl text-left">
                    {/* Only Title */}
                    <h2 className="font-serif text-2xl font-bold text-[#f4f3eb] leading-snug tracking-tight drop-shadow-sm">
                      {mobileTitle}
                    </h2>

                    {/* Only Short Message */}
                    <p className="text-xs text-[#dcd7cf] leading-relaxed font-normal drop-shadow-xs line-clamp-3">
                      {mobileMessage}
                    </p>

                    {/* Compact Mobile Action Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (slide.ctaLink?.startsWith('#')) {
                            const el = document.querySelector(slide.ctaLink);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            else onOpenBooking();
                          } else {
                            onOpenBooking();
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#aa907d] active:scale-95 text-[#f4f3eb] font-medium text-xs rounded-full shadow-md transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#f4f3eb]" />
                        <span>{slide.ctaText || 'Agendar Consulta'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#c9bcad]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* DESKTOP VIEW: Full rich presentation with badges, quote, dual CTAs, and micro highlights */}
                <div className="hidden sm:block relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                  <div className="max-w-3xl space-y-5 sm:space-y-6 p-6 sm:p-8 rounded-3xl bg-black/35 backdrop-blur-md border border-white/10 shadow-2xl">
                    
                    {/* Badge Tag */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#aa907d]/30 backdrop-blur-md border border-[#aa907d]/50 text-[#f4f3eb] text-xs font-semibold uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#c9bcad]" />
                      <span>{slide.badge || 'Diagnóstico Preciso & Restauração Capilar'}</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#f4f3eb] tracking-tight leading-[1.15]">
                      {slide.title}
                    </h1>

                    {/* Quote & Subtitle */}
                    <div className="space-y-2.5">
                      {slide.quote && (
                        <p className="font-serif text-xl sm:text-2xl text-[#c9bcad] font-medium italic">
                          {slide.quote}
                        </p>
                      )}
                      <p className="text-sm sm:text-base md:text-lg text-[#dcd7cf] max-w-2xl font-normal leading-relaxed">
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                      
                      {/* Button 1 (Primary) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (slide.ctaLink?.startsWith('#')) {
                            const el = document.querySelector(slide.ctaLink);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            else onOpenBooking();
                          } else {
                            onOpenBooking();
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#aa907d] hover:bg-[#967e6c] active:scale-95 text-[#f4f3eb] font-medium text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-[#f4f3eb]" />
                        <span>{slide.ctaText || 'Agendar Consulta'}</span>
                        <ArrowRight className="w-4 h-4 text-[#c9bcad]" />
                      </button>

                      {/* Button 2 (Secondary / WhatsApp) */}
                      {slide.secondaryCtaLink === 'whatsapp' || slide.secondaryCtaLink?.includes('wa.me') ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-[#25D366]/20 border border-white/30 hover:border-[#25D366] text-[#f4f3eb] font-medium text-sm rounded-full backdrop-blur-md transition-all group/wa cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0 group-hover/wa:scale-110 transition-transform">
                            <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20 stroke-[2.2]" />
                          </div>
                          <span>{slide.secondaryCtaText || 'Falar no WhatsApp'}</span>
                        </a>
                      ) : (
                        <a
                          href={slide.secondaryCtaLink || '#procedimentos'}
                          onClick={(e) => {
                            if (slide.secondaryCtaLink?.startsWith('#')) {
                              e.preventDefault();
                              const el = document.querySelector(slide.secondaryCtaLink);
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-[#f4f3eb] font-medium text-sm rounded-full backdrop-blur-md transition-all cursor-pointer"
                        >
                          <span>{slide.secondaryCtaText || 'Ver Procedimentos'}</span>
                          <ArrowRight className="w-4 h-4 text-[#c9bcad]" />
                        </a>
                      )}

                    </div>

                    {/* Micro Highlights */}
                    <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/15 max-w-lg text-left">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-semibold uppercase text-[#f4f3eb] tracking-wider">Tricoscopia</span>
                        <span className="block text-xs text-[#c9bcad]">Diagnóstico Digital</span>
                      </div>
                      <div className="space-y-0.5 border-l border-white/20 pl-3">
                        <span className="block text-xs font-semibold uppercase text-[#f4f3eb] tracking-wider">MMP® Capilar</span>
                        <span className="block text-xs text-[#c9bcad]">Fios Fortalecidos</span>
                      </div>
                      <div className="space-y-0.5 border-l border-white/20 pl-3">
                        <span className="block text-xs font-semibold uppercase text-[#f4f3eb] tracking-wider">Individual</span>
                        <span className="block text-xs text-[#c9bcad]">Plano Terapêutico</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Vertical Navigation & Status Controls (Floating Right Side) */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
          
          {/* Vertical Previous (Up Arrow) */}
          <button
            type="button"
            onClick={goToPrev}
            className="w-10 h-10 rounded-full bg-stone-900/75 hover:bg-[#aa907d] text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
            title="Slide Anterior (Para Cima)"
            aria-label="Slide Anterior"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Vertical Indicators & Numbers */}
          <div className="flex flex-col items-center gap-2 py-2 px-1.5 rounded-full bg-stone-900/60 backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'h-6 w-2 bg-[#aa907d] shadow-sm'
                    : 'h-2 w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Ir para slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Vertical Next (Down Arrow) */}
          <button
            type="button"
            onClick={goToNext}
            className="w-10 h-10 rounded-full bg-stone-900/75 hover:bg-[#aa907d] text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
            title="Próximo Slide (Para Baixo)"
            aria-label="Próximo Slide"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-800 text-white/80 hover:text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-colors cursor-pointer mt-1"
            title={isPaused ? "Retomar rotação automática" : "Pausar slide"}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
          </button>

        </div>

        {/* Counter Badge (Bottom Left) */}
        <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono text-stone-300 shadow-md">
          <span className="text-[#aa907d] font-bold">0{currentIndex + 1}</span>
          <span className="opacity-40">/</span>
          <span>0{slides.length}</span>
          <span className="text-[10px] text-stone-400 pl-1 border-l border-white/20 font-sans tracking-wide">30s</span>
        </div>

      </div>
    </section>
  );
};
