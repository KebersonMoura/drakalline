import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Phone, 
  Lock, 
  ArrowUp
} from 'lucide-react';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdmin }) => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => storageService.getWhatsappNumber());
  const [whatsappDisplay, setWhatsappDisplay] = useState<string>(() => storageService.getWhatsappDisplay());

  useEffect(() => {
    const handleWhatsappUpdate = (e: any) => {
      if (e?.detail) {
        if (e.detail.whatsappNumber) setWhatsappNumber(e.detail.whatsappNumber);
        if (e.detail.whatsappDisplay) setWhatsappDisplay(e.detail.whatsappDisplay);
      } else {
        setWhatsappNumber(storageService.getWhatsappNumber());
        setWhatsappDisplay(storageService.getWhatsappDisplay());
      }
    };
    window.addEventListener('whatsapp-updated', handleWhatsappUpdate);
    return () => window.removeEventListener('whatsapp-updated', handleWhatsappUpdate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20consulta%20e%20atendimento.`;

  return (
    <footer id="contato" className="bg-[#2c2724] text-[#ada49c] pt-16 pb-12 border-t border-[#4a433d] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#4a433d]">
          
          {/* Brand Info */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#aa907d] text-[#f4f3eb] flex items-center justify-center">
                <span className="font-serif text-sm font-bold">K</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#f4f3eb] block leading-tight">
                  Dra. Kaline
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#c9bcad] block">
                  Especialista em saúde e restauração capilar
                </span>
              </div>
            </div>

            <p className="text-xs text-[#ada49c] leading-relaxed max-w-md pt-1">
              “Para um diagnóstico preciso” — tratamentos fundamentados na ciência médica, tricoscopia digital de alta definição e restauração capilar com máxima naturalidade.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#3d3530] hover:bg-[#aa907d] text-[#f4f3eb] flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(37,211,102,0.4)] hover:scale-110 cursor-pointer"
                title="Conversar no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white fill-white/20 stroke-[2.2]" />
              </a>
            </div>
          </div>

          {/* Links: inicio, sobre, tratamento, contato */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f4f3eb]">
              Navegação
            </h4>
            <ul className="space-y-1.5 text-xs text-[#ada49c]">
              <li><a href="#inicio" className="hover:text-[#f4f3eb] transition-colors">Início</a></li>
              <li><a href="#sobre" className="hover:text-[#f4f3eb] transition-colors">Sobre</a></li>
              <li><a href="#tratamento" className="hover:text-[#f4f3eb] transition-colors">Tratamento</a></li>
              <li>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors flex items-center gap-1"
                >
                  <span>Contato</span>
                  <MessageCircle className="w-3 h-3 text-[#25D366]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Consultório / Contato */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#f4f3eb]">
              Contato
            </h4>
            <div className="space-y-2 text-xs text-[#ada49c]">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#aa907d] shrink-0 mt-0.5" />
                <span>{CLINIC_INFO.address}, {CLINIC_INFO.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                <span>{CLINIC_INFO.openingHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                  title="Falar no WhatsApp"
                >
                  {whatsappDisplay}
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a4a49c]">
          <p>© {new Date().getFullYear()} Dra. Kaline. Todos os direitos reservados. Atendimento médico com ética e biossegurança.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:text-[#f4f3eb] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Acesso Restrito</span>
            </button>
            <button
              onClick={scrollToTop}
              className="hover:text-[#f4f3eb] transition-colors flex items-center gap-1 cursor-pointer"
              title="Voltar ao Topo"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Topo</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
