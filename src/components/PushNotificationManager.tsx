import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Trash2 
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { storageService, AppNotification } from '../services/storageService';

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsUpdated: () => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  isOpen,
  onClose,
  onNotificationsUpdated
}) => {
  const [permission, setPermission] = useState<string>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermission(notificationService.getPermission());
      setNotifications(storageService.getNotifications());
      storageService.markAllNotificationsRead();
      onNotificationsUpdated();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);
    setNotifications(storageService.getNotifications());
    onNotificationsUpdated();
  };

  const handleSendTest = () => {
    notificationService.sendLocalPush(
      'Lembrete de Consulta - Dra. Kaline 🤍',
      'Sua consulta estética de avaliação está confirmada para amanhã às 10:00. Lembre-se de não consumir álcool nas 24h anteriores.'
    );
    setNotifications(storageService.getNotifications());
    onNotificationsUpdated();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const getPermissionBadge = () => {
    if (permission === 'granted') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          Ativadas no Navegador
        </span>
      );
    }
    if (permission === 'denied') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Bloqueadas pelo Navegador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        Pendente de Ativação
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Lembretes & Notificações
              </h3>
              <p className="text-xs text-stone-500">
                Acompanhe avisos de consulta e pós-atendimento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Status & Action Banner */}
        <div className="p-5 bg-stone-50 border-b border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Status das Notificações Push:</span>
            {getPermissionBadge()}
          </div>

          <div className="flex flex-wrap gap-2">
            {permission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>Permitir Notificações no Navegador</span>
              </button>
            ) : (
              <button
                onClick={handleSendTest}
                className="flex-1 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{testSent ? 'Notificação Enviada!' : 'Enviar Notificação de Teste'}</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            Ao ativar, o sistema enviará avisos automáticos 24h e 2h antes de cada procedimento, além de orientações de cuidados pós-aplicação.
          </p>
        </div>

        {/* Notifications History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
            <span>Histórico de Alertas Recentes</span>
            <span>{notifications.length} avisos</span>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-stone-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">Nenhuma notificação recente no momento.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs space-y-1 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{notif.title}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Sistema Web Push API seguro
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium rounded-lg"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
