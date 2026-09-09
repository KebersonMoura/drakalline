import { storageService } from './storageService';

export class NotificationService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendLocalPush(
          'Notificações Ativadas! ✨',
          'Você receberá lembretes das suas consultas e dicas de pós-procedimento da Dra. Kaline.'
        );
      }
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  sendLocalPush(title: string, body: string, icon = 'https://images.unsplash.com/photo-1594824813501-44754564c767?auto=format&fit=crop&w=128&q=80'): boolean {
    // 1. Add to app storage notification center
    storageService.addNotification({
      title,
      message: body,
      type: 'reminder'
    });

    // 2. Real Browser Web Push Notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: icon,
          tag: 'dra-kaline-' + Date.now()
        });
        return true;
      } catch (err) {
        console.warn('Native notification failed, registered in-app:', err);
      }
    }
    return false;
  }

  triggerAppointmentReminder(clientName: string, procedureName: string, date: string, time: string): boolean {
    const title = `Lembrete de Consulta - Dra. Kaline 🩺`;
    const body = `Olá, ${clientName}! Lembramos de sua consulta para ${procedureName} agendada para ${date} às ${time}. Qualquer dúvida, fale conosco.`;
    return this.sendLocalPush(title, body);
  }

  triggerPostCareReminder(clientName: string, procedureName: string): boolean {
    const title = `Cuidados Pós-${procedureName} ✨`;
    const body = `Olá, ${clientName}! Lembre-se de seguir as orientações pós-procedimento: hidratação, evitar calor intenso e não massagear a região.`;
    return this.sendLocalPush(title, body);
  }
}

export const notificationService = new NotificationService();
