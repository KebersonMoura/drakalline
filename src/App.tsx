import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TopHeroCarousel } from './components/TopHeroCarousel';
import { DiagnosticSection } from './components/DiagnosticSection';
import { ProceduresSection } from './components/ProceduresSection';
import { AboutSection } from './components/AboutSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { QuickBookingModal } from './components/QuickBookingModal';
import { PushNotificationManager } from './components/PushNotificationManager';
import { AdminPanel } from './components/AdminPanel';
import { storageService } from './services/storageService';
import { Procedure, InstagramPost } from './types';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedProcedureForBooking, setSelectedProcedureForBooking] = useState<string>('tricoscopia-digital');

  // Dynamic datasets from storageService
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [gallery, setGallery] = useState<InstagramPost[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const refreshData = () => {
    setProcedures(storageService.getProcedures());
    setGallery(storageService.getGallery());
    const notifs = storageService.getNotifications();
    setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
  };

  useEffect(() => {
    refreshData();
    // Fetch live procedures and settings from backend
    storageService.fetchLiveProcedures().then((procs) => {
      if (Array.isArray(procs) && procs.length > 0) {
        setProcedures(procs);
      }
    }).catch(() => {});

    storageService.fetchLiveWhatsapp().catch(() => {});

    const handleProceduresUpdated = (e: any) => {
      if (e && e.detail && Array.isArray(e.detail)) {
        setProcedures(e.detail);
      } else {
        refreshData();
      }
    };

    window.addEventListener('procedures-updated', handleProceduresUpdated);
    return () => {
      window.removeEventListener('procedures-updated', handleProceduresUpdated);
    };
  }, []);

  const handleOpenBooking = (procedureId?: string) => {
    if (procedureId) {
      setSelectedProcedureForBooking(procedureId);
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f3eb] text-[#3b3530] font-sans selection:bg-[#c9bcad] selection:text-[#3b3530]">
      
      {/* Header Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Streamlined Sections */}
      <main className="flex-1">
        <TopHeroCarousel 
          onOpenBooking={() => handleOpenBooking()} 
        />
        <DiagnosticSection onOpenBooking={() => handleOpenBooking()} />
        <AboutSection />
        <ProceduresSection
          procedures={procedures}
          onSelectProcedureForBooking={(id) => handleOpenBooking(id)}
        />
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating Elements */}
      <WhatsAppFloatingButton />

      {/* Modals & Management Utilities */}
      <QuickBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        procedures={procedures}
        initialProcedureId={selectedProcedureForBooking}
        onBookingComplete={() => {
          refreshData();
        }}
      />

      <PushNotificationManager
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationsUpdated={() => refreshData()}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        procedures={procedures}
        onDataChanged={() => refreshData()}
      />

    </div>
  );
}
