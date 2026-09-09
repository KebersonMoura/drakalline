import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Stethoscope, Microscope, MapPin, Instagram } from 'lucide-react';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

export const AboutSection: React.FC = () => {
  const [photoSrc, setPhotoSrc] = useState<string>(() => storageService.getDoctorPhoto());
  const [clinicAddress, setClinicAddress] = useState(() => storageService.getClinicAddress());

  useEffect(() => {
    storageService.fetchLiveDoctorPhoto().then(url => {
      if (url) setPhotoSrc(url);
    });

    const handlePhotoUpdated = (e: any) => {
      if (e.detail) {
        setPhotoSrc(e.detail);
      }
    };

    const handleAddressUpdated = (e: any) => {
      if (e.detail) {
        setClinicAddress(e.detail);
      } else {
        setClinicAddress(storageService.getClinicAddress());
      }
    };

    window.addEventListener('doctor-photo-updated', handlePhotoUpdated);
    window.addEventListener('clinic-address-updated', handleAddressUpdated);
    return () => {
      window.removeEventListener('doctor-photo-updated', handlePhotoUpdated);
      window.removeEventListener('clinic-address-updated', handleAddressUpdated);
    };
  }, []);
  return (
    <section id="sobre" className="py-16 md:py-20 bg-[#c9bcad]/20 border-y border-[#c9bcad] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Doctor Portrait Frame */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="aspect-3/4 rounded-2xl overflow-hidden shadow-lg border-4 border-[#f4f3eb] bg-[#c9bcad]/30 relative group">
                <img
                  src={photoSrc}
                  alt="Dra. Kaline - Especialista em Saúde e Restauração Capilar"
                  className="w-full h-full object-cover"
                  onError={() => setPhotoSrc('/images/foto-1-destaque.svg')}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4 bg-[#aa907d] text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <Stethoscope className="w-3.5 h-3.5 text-[#f4f3eb]" />
                <span>Atendimento Médico</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f3eb] border border-[#c9bcad] text-[#aa907d] text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#aa907d]" />
              <span>Sobre a Médica</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3b3530] leading-tight">
              Dra. Kaline
            </h2>

            <p className="text-sm sm:text-base font-medium text-[#aa907d]">
              Especialista em saúde e restauração capilar
            </p>

            <p className="text-sm sm:text-base text-[#655d56] leading-relaxed">
              Dedicada à saúde e restauração capilar, a Dra. Kaline acredita que a chave para resultados verdadeiramente transformadores reside no diagnóstico preciso.
            </p>

            <blockquote className="p-4 bg-[#f4f3eb] rounded-xl border-l-4 border-[#aa907d] italic text-[#4a433d] text-sm leading-relaxed shadow-2xs">
              "{CLINIC_INFO.bio}"
            </blockquote>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-[#f4f3eb] rounded-xl border border-[#c9bcad] shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-[#aa907d]" />
                  <h3 className="font-semibold text-xs sm:text-sm text-[#3b3530]">Ciência & Rigor</h3>
                </div>
                <p className="text-xs text-[#655d56] leading-relaxed">
                  Tricoscopia digital de alta definição e técnicas cirúrgicas FUE minimamente invasivas.
                </p>
              </div>

              <div className="p-4 bg-[#f4f3eb] rounded-xl border border-[#c9bcad] shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#aa907d]" />
                  <h3 className="font-semibold text-xs sm:text-sm text-[#3b3530]">Ética & Individualidade</h3>
                </div>
                <p className="text-xs text-[#655d56] leading-relaxed">
                  Planos de tratamento realistas, individualizados e focados na saúde do paciente.
                </p>
              </div>
            </div>

            {/* Contact details mini footer */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-[#655d56]">
              <a
                href={clinicAddress.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium hover:text-[#aa907d] transition-colors"
                title="Ver localização no Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                <span>{clinicAddress.address}, {clinicAddress.city}</span>
              </a>
              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#3b3530] font-semibold hover:text-[#aa907d] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#aa907d]" />
                <span>@{CLINIC_INFO.instagramHandle}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
