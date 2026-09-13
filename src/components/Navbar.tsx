import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MessageCircle, 
  Instagram, 
  Menu, 
  X, 
  Lock
} from 'lucide-react';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAdmin
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => storageService.getWhatsappNumber());
  const [clinicLogo, setClinicLogo] = useState<string>(() => storageService.getClinicLogo());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);

    const handleWhatsappUpdate = (e: any) => {
      if (e?.detail?.whatsappNumber) {
        setWhatsappNumber(e.detail.whatsappNumber);
      } else {
        setWhatsappNumber(storageService.getWhatsappNumber());
      }
    };
    window.addEventListener('whatsapp-updated', handleWhatsappUpdate);

    const handleLogoUpdate = (e: any) => {
      if (typeof e?.detail === 'string') {
        setClinicLogo(e.detail);
      } else {
        setClinicLogo(storageService.getClinicLogo());
      }
    };
    window.addEventListener('clinic-logo-updated', handleLogoUpdate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('whatsapp-updated', handleWhatsappUpdate);
      window.removeEventListener('clinic-logo-updated', handleLogoUpdate);
    };
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20consulta%20e%20atendimento.`;

  const navLinks = [
    { name: 'Início', href: '#inicio', isExternal: false },
    { name: 'Sobre', href: '#sobre', isExternal: false },
    { name: 'Tratamento', href: '#tratamento', isExternal: false },
    { name: 'Contato', href: whatsappUrl, isExternal: true },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#f4f3eb]/95 backdrop-blur-md shadow-xs border-b border-[#c9bcad]/60 py-3' 
          : 'bg-[#f4f3eb]/90 backdrop-blur-xs py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#inicio" className="flex items-center gap-2.5 group">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt="Logo Dra. Kaline"
                className="h-9 sm:h-11 w-auto max-w-[170px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-[#aa907d] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                  <span className="font-serif text-lg font-bold tracking-tight">K</span>
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-[#3b3530] block leading-none">
                    Dra. Kaline
                  </span>
                </div>
              </>
            )}
          </a>

          {/* Desktop Navigation - inicio, sobre, tratamento, contato */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                className="text-sm font-medium text-[#655d56] hover:text-[#aa907d] transition-colors relative py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Instagram Profile Quick Link */}
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Acessar Instagram @dra_kaline"
              className="p-2 text-[#655d56] hover:text-[#aa907d] hover:bg-[#c9bcad]/30 rounded-full transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* WhatsApp Direct Action Button with Original WhatsApp Green */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] border border-[#20bd5a] rounded-full shadow-[0_2px_12px_rgba(37,211,102,0.35)] hover:shadow-[0_4px_16px_rgba(37,211,102,0.5)] transition-all hover:scale-105 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20 stroke-[2.2]" />
              <span>WhatsApp</span>
            </a>

            {/* Quick Booking CTA */}
            <button
              id="navbar-booking-btn"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#aa907d] hover:bg-[#967e6c] rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#f4f3eb]" />
              <span>Agendar</span>
            </button>

            {/* Admin Panel Access Button */}
            <button
              onClick={onOpenAdmin}
              title="Painel Médico Administrativo"
              className="p-1.5 text-[#ada49c] hover:text-[#aa907d] rounded-full transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center space-x-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3b3530] hover:bg-[#c9bcad]/30 rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#f4f3eb] border-b border-[#c9bcad] px-5 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#3b3530] hover:text-[#aa907d] py-1.5"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#aa907d] text-white text-xs font-semibold rounded-xl"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Consulta</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(37,211,102,0.35)] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white/20 stroke-[2.2]" />
              <span>Falar no WhatsApp</span>
            </a>

            <div className="flex items-center justify-between pt-2 border-t border-[#c9bcad]/60 text-xs text-[#ada49c]">
              <a 
                href={CLINIC_INFO.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[#aa907d]"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{CLINIC_INFO.instagramHandle}</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center gap-1 hover:text-[#aa907d]"
              >
                <Lock className="w-3 h-3" />
                <span>Painel Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
