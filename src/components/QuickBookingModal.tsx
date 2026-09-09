import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Procedure, Appointment } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { CLINIC_INFO } from '../data/initialData';

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedures: Procedure[];
  initialProcedureId?: string;
  onBookingComplete?: (appointment: Appointment) => void;
}

export const QuickBookingModal: React.FC<QuickBookingModalProps> = ({
  isOpen,
  onClose,
  procedures,
  initialProcedureId,
  onBookingComplete
}) => {
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(initialProcedureId || 'tricoscopia-digital');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [enablePushReminder, setEnablePushReminder] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Set default date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
      if (initialProcedureId) {
        setSelectedProcedureId(initialProcedureId);
      }
      setConfirmedBooking(null);
    }
  }, [isOpen, initialProcedureId]);

  if (!isOpen) return null;

  const availableTimes = [
    '09:00', '10:00', '11:15', '14:00', '15:30', '16:45', '18:00'
  ];

  const selectedProcedure = procedures.find(p => p.id === selectedProcedureId) || {
    id: 'tricoscopia-digital',
    title: 'Tricoscopia Digital & Diagnóstico Capilar',
    duration: '60 minutos'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Por favor, preencha pelo menos seu nome e WhatsApp.');
      return;
    }

    setIsSubmitting(true);

    // Request notification permission if requested
    if (enablePushReminder) {
      await notificationService.requestPermission();
    }

    const newAppointment = storageService.addAppointment({
      clientName,
      clientPhone,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
      procedureId: selectedProcedureId,
      procedureTitle: selectedProcedure.title,
      date: selectedDate,
      time: selectedTime,
      notes: notes || undefined
    });

    // Trigger local push notification confirmation
    if (enablePushReminder) {
      notificationService.sendLocalPush(
        'Consulta Pré-Agendada! 🤍',
        `Olá, ${clientName}! Sua consulta para ${selectedProcedure.title} foi solicitada para ${selectedDate} às ${selectedTime}.`
      );
    }

    setIsSubmitting(false);
    setConfirmedBooking(newAppointment);
    if (onBookingComplete) onBookingComplete(newAppointment);
  };

  const generateWhatsAppConfirmationUrl = () => {
    if (!confirmedBooking) return '';
    const text = `Olá Dra. Kaline! Acabei de agendar uma consulta pelo site:%0A%0A*Paciente:* ${confirmedBooking.clientName}%0A*Procedimento:* ${confirmedBooking.procedureTitle}%0A*Data:* ${confirmedBooking.date}%0A*Horário:* ${confirmedBooking.time}%0A*Contato:* ${confirmedBooking.clientPhone}%0A${confirmedBooking.notes ? `*Obs:* ${confirmedBooking.notes}%0A` : ''}%0APoderia confirmar o meu agendamento? Obrigada!`;
    const num = storageService.getWhatsappNumber();
    return `https://wa.me/${num}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#f4f3eb] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-[#c9bcad]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#ada49c] hover:text-[#3b3530] hover:bg-[#c9bcad]/30 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: Confirmed Success Screen */}
        {confirmedBooking ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#c9bcad]/40 text-[#aa907d] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3b3530]">
                Agendamento Solicitado!
              </h3>
              <p className="text-xs sm:text-sm text-[#655d56] max-w-md mx-auto">
                Recebemos sua solicitação de consulta. O sistema registrou seu horário e adicionou seus dados ao histórico de atendimento.
              </p>
            </div>

            {/* Summary Voucher */}
            <div className="p-4 bg-[#f4f3eb] rounded-2xl border border-[#c9bcad] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#c9bcad]/60 pb-2">
                <span className="text-[#ada49c]">Paciente:</span>
                <span className="font-semibold text-[#3b3530]">{confirmedBooking.clientName}</span>
              </div>
              <div className="flex justify-between border-b border-[#c9bcad]/60 pb-2">
                <span className="text-[#ada49c]">Procedimento:</span>
                <span className="font-semibold text-[#aa907d]">{confirmedBooking.procedureTitle}</span>
              </div>
              <div className="flex justify-between border-b border-[#c9bcad]/60 pb-2">
                <span className="text-[#ada49c]">Data e Horário:</span>
                <span className="font-semibold text-[#3b3530]">{confirmedBooking.date} às {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ada49c]">Status:</span>
                <span className="font-semibold text-[#aa907d] bg-[#c9bcad]/30 px-2 py-0.5 rounded-md">Pendente de Confirmação</span>
              </div>
            </div>

            {/* Actions with WhatsApp original colors */}
            <div className="space-y-3 pt-2">
              <a
                href={generateWhatsAppConfirmationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.55)] transition-all hover:scale-[1.01] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white fill-white/20 stroke-[2.2]" />
                <span>Confirmar Agora via WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[#c9bcad]/30 hover:bg-[#c9bcad]/60 text-[#3b3530] font-semibold text-xs rounded-xl transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Booking Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c9bcad]/30 border border-[#c9bcad] text-[#aa907d] text-[11px] font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#aa907d]" />
                <span>Agendamento de Consulta</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3b3530]">
                Reserve sua Avaliação
              </h3>
              <p className="text-xs text-[#655d56]">
                Escolha o procedimento, o melhor dia e receba lembretes automáticos de consulta.
              </p>
            </div>

            {/* Procedure Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#3b3530]">
                1. Selecione o Procedimento:
              </label>
              <select
                value={selectedProcedureId}
                onChange={(e) => setSelectedProcedureId(e.target.value)}
                className="w-full p-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
              >
                <option value="tricoscopia-digital">Tricoscopia Digital & Diagnóstico Capilar</option>
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#3b3530] flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#aa907d]" />
                  <span>2. Data Preferida:</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#3b3530] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#aa907d]" />
                  <span>3. Horário:</span>
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                >
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-3 pt-2 border-t border-[#c9bcad]/60">
              <span className="block text-xs font-semibold text-[#3b3530]">
                4. Seus Dados de Contato:
              </span>

              <div className="space-y-1">
                <div className="relative">
                  <User className="w-4 h-4 text-[#ada49c] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#ada49c] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp com DDD (ex: 84 99999-9999)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                  />
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-[#ada49c] absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="E-mail (opcional para recibo)"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Alguma observação sobre seu cabelo/couro cabeludo ou queixas?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                />
              </div>
            </div>

            {/* Push Notification Toggle Option */}
            <div className="p-3 bg-[#c9bcad]/20 rounded-2xl border border-[#c9bcad] flex items-start gap-3">
              <input
                type="checkbox"
                id="pushNotificationCheck"
                checked={enablePushReminder}
                onChange={(e) => setEnablePushReminder(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#c9bcad] text-[#aa907d] focus:ring-[#aa907d] cursor-pointer"
              />
              <label htmlFor="pushNotificationCheck" className="text-xs text-[#3b3530] cursor-pointer">
                <span className="font-semibold text-[#aa907d] flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-[#aa907d]" />
                  Ativar lembretes no navegador
                </span>
                <span className="block text-[11px] text-[#655d56] mt-0.5">
                  Receba avisos na véspera e orientações pós-procedimento sem perder nada.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CalendarIcon className="w-4 h-4 text-[#f4f3eb]" />
              <span>{isSubmitting ? 'Processando...' : 'Confirmar Pré-Agendamento'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#ada49c] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#aa907d]" />
              <span>Seus dados são protegidos e mantidos sob sigilo médico.</span>
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
