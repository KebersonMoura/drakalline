import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export const WhatsAppFloatingButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => storageService.getWhatsappNumber());

  useEffect(() => {
    const handleWhatsappUpdate = (e: any) => {
      if (e?.detail?.whatsappNumber) {
        setWhatsappNumber(e.detail.whatsappNumber);
      } else {
        setWhatsappNumber(storageService.getWhatsappNumber());
      }
    };
    window.addEventListener('whatsapp-updated', handleWhatsappUpdate);
    return () => window.removeEventListener('whatsapp-updated', handleWhatsappUpdate);
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Gostaria%20de%20agendar%20uma%20consulta%20para%20avalia%C3%A7%C3%A3o%20capilar.`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Main WhatsApp Button with Highlight & Original Colors */}
      <div className="relative group">
        {/* Glowing ripple highlight pulse */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />

        <a
          id="floating-whatsapp-btn"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_-3px_rgba(37,211,102,0.55)] hover:shadow-[0_14px_30px_-2px_rgba(37,211,102,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer border-2 border-white ring-2 ring-[#25D366]/40"
          title="Conversar com a Dra. Kaline no WhatsApp"
          aria-label="Conversar no WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white fill-white/20 stroke-[2.3]" />
          
          {/* Active Online Status Indicator */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-xs ring-1 ring-[#25D366]" />
        </a>
      </div>
    </div>
  );
};
