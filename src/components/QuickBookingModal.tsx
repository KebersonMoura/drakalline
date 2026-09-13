import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Procedure, Appointment } from '../types';
import { storageService } from '../services/storageService';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Doctor Schedule & Availability State
  const [dayClinicName, setDayClinicName] = useState<string>('Clínica Principal - Dra. Kaline');
  const [daySlots, setDaySlots] = useState<{ time: string; isBooked: boolean; clinicName: string }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

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
      setFormError('');
    }
  }, [isOpen, initialProcedureId]);

  // Load available slots & clinic whenever date changes
  useEffect(() => {
    if (!isOpen || !selectedDate) return;
    let isCancelled = false;
    setIsLoadingSlots(true);

    storageService.fetchDayAvailability(selectedDate)
      .then((res) => {
        if (isCancelled) return;
        setDayClinicName(res.clinicName || 'Clínica Principal - Dra. Kaline');
        const slots = res.slots || [];
        setDaySlots(slots);

        // Auto-select first free slot if current is booked or nonexistent
        const currentSlot = slots.find(s => s.time === selectedTime);
        if (!currentSlot || currentSlot.isBooked) {
          const firstFree = slots.find(s => !s.isBooked);
          if (firstFree) {
            setSelectedTime(firstFree.time);
          }
        }
      })
      .catch((e) => {
        console.warn('Error fetching availability:', e);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingSlots(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const selectedProcedure = procedures.find(p => p.id === selectedProcedureId) || {
    id: 'tricoscopia-digital',
    title: 'Tricoscopia Digital & Diagnóstico Capilar',
    duration: '60 minutos'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!clientName.trim() || !clientPhone.trim()) {
      setFormError('Por favor, preencha pelo menos seu nome e WhatsApp para contato.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newAppointment = await storageService.addAppointmentLive({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
        procedureId: selectedProcedureId,
        procedureTitle: selectedProcedure.title,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined
      });

      setIsSubmitting(false);
      setConfirmedBooking(newAppointment);
      if (onBookingComplete) onBookingComplete(newAppointment);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Erro ao processar agendamento. Tente novamente.');
    }
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
              <div className="flex justify-between border-b border-[#c9bcad]/60 pb-2">
                <span className="text-[#ada49c]">Local do Atendimento:</span>
                <span className="font-semibold text-[#3b3530] text-right">{dayClinicName || 'Clínica Principal - Dra. Kaline'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ada49c]">Status:</span>
                <span className="font-semibold text-[#aa907d] bg-[#c9bcad]/30 px-2 py-0.5 rounded-md">Pendente de Confirmação</span>
              </div>
            </div>

            {/* Email Notification Transmitted Alert */}
            <div className="p-3 bg-[#e8e4dc] border border-[#c9bcad] rounded-2xl flex items-center gap-2.5 text-left text-xs text-[#524438]">
              <Mail className="w-4 h-4 text-[#aa907d] shrink-0" />
              <span>Uma notificação completa deste agendamento foi transmitida por e-mail para a equipe médica.</span>
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
              <div className="flex items-center gap-1.5 text-[11px] text-[#655d56] bg-[#c9bcad]/20 px-3 py-1.5 rounded-xl border border-[#c9bcad]/40 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                <span>Consultório: Rua Fidêncio Ramos, 100, 5º andar - Vila Olímpia, São Paulo/SP</span>
              </div>
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
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#3b3530] flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#aa907d]" />
                    <span>2. Data Preferida da Consulta:</span>
                  </label>
                  {isLoadingSlots && (
                    <span className="text-[11px] text-[#aa907d] font-medium animate-pulse">
                      Consultando agenda da médica...
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                />
                {dayClinicName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#524438] bg-[#c9bcad]/25 px-3 py-1.5 rounded-xl border border-[#c9bcad]/60 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                    <span>Atendimento neste dia em: <strong className="text-[#3b3530]">{dayClinicName}</strong></span>
                  </div>
                )}
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#3b3530] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#aa907d]" />
                    <span>3. Horários Disponíveis:</span>
                  </label>
                  <span className="text-[10px] text-[#857b73]">
                    Selecione um horário verde/livre
                  </span>
                </div>

                {daySlots.length === 0 && !isLoadingSlots ? (
                  <p className="text-xs text-[#ada49c] italic py-2">Nenhum horário cadastrado para esta data.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {daySlots.map((slot) => {
                      const isSelected = selectedTime === slot.time && !slot.isBooked;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => !slot.isBooked && setSelectedTime(slot.time)}
                          className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center relative ${
                            slot.isBooked
                              ? 'bg-[#e2ded6]/60 border-[#d4cec5] text-[#9c938a] cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#aa907d] text-white border-[#aa907d] shadow-sm font-semibold ring-2 ring-[#aa907d]/30'
                              : 'bg-[#f4f3eb] hover:bg-[#eae6dc] border-[#c9bcad] text-[#3b3530]'
                          }`}
                        >
                          <div className={slot.isBooked ? 'line-through' : ''}>{slot.time}</div>
                          {slot.isBooked ? (
                            <span className="block text-[9px] uppercase tracking-wider font-semibold text-rose-700/80">
                              Ocupado
                            </span>
                          ) : (
                            <span className={`block text-[9px] ${isSelected ? 'text-white/80 font-normal' : 'text-[#857b73]'}`}>
                              Disponível
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {daySlots.length > 0 && daySlots.every(s => s.isBooked) && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Todos os horários desta data já foram reservados. Por favor, selecione outra data acima.</span>
                  </div>
                )}
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

            {/* Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Email Dispatch Notice */}
            <div className="p-3 bg-[#c9bcad]/20 rounded-2xl border border-[#c9bcad] flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#aa907d] mt-0.5 shrink-0" />
              <div className="text-xs text-[#3b3530]">
                <span className="font-semibold text-[#aa907d]">Envio Automático por E-mail</span>
                <span className="block text-[11px] text-[#655d56] mt-0.5">
                  Ao confirmar, os dados do seu agendamento serão transmitidos imediatamente por e-mail para a equipe da clínica.
                </span>
              </div>
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
