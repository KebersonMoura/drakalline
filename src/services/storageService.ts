import { 
  Appointment, 
  ClientRecord, 
  BlogPost, 
  InstagramPost, 
  Procedure, 
  DatabaseStatus,
  ProcedureHistoryItem,
  HeroSlide,
  AdminUser
} from '../types';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_CLIENTS, 
  INITIAL_BLOG_POSTS, 
  INITIAL_INSTAGRAM_POSTS, 
  INITIAL_PROCEDURES,
  INITIAL_HERO_SLIDES,
  CLINIC_INFO
} from '../data/initialData';

const STORAGE_KEYS = {
  APPOINTMENTS: 'dra_kaline_appointments_v2',
  CLIENTS: 'dra_kaline_clients_v2',
  BLOG: 'dra_kaline_blog_v2',
  GALLERY: 'dra_kaline_gallery_v3',
  PROCEDURES: 'dra_kaline_procedures_v2',
  DB_CONFIG: 'dra_kaline_db_config_v2',
  NOTIFICATIONS: 'dra_kaline_notifications_v2',
  DOCTOR_PHOTO: 'dra_kaline_doctor_photo_v3',
  HERO_SLIDES: 'dra_kaline_hero_slides_v2',
  WHATSAPP_NUMBER: 'dra_kaline_whatsapp_number_v2',
  WHATSAPP_DISPLAY: 'dra_kaline_whatsapp_display_v2',
  CLINIC_LOGO: 'dra_kaline_clinic_logo_v2',
  CLINIC_ADDRESS: 'dra_kaline_clinic_address_v2',
  CLINIC_CITY: 'dra_kaline_clinic_city_v2',
  CLINIC_CEP: 'dra_kaline_clinic_cep_v2',
  CLINIC_FULL_ADDRESS: 'dra_kaline_clinic_full_address_v2',
  CLINIC_MAPS_URL: 'dra_kaline_clinic_maps_url_v2',
  ADMIN_USERS: 'dra_kaline_admin_users_v2',
};

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'appointment' | 'reminder' | 'care' | 'system';
}

class StorageService {
  // Appointments
  async fetchLiveAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.saveAppointments(data);
          try {
            window.dispatchEvent(new CustomEvent('appointments-updated', { detail: data }));
          } catch (_) {}
          return data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch live appointments from MySQL:', err);
    }
    return this.getAppointments();
  }

  getAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading appointments from storage', e);
    }
    this.saveAppointments(INITIAL_APPOINTMENTS);
    return INITIAL_APPOINTMENTS;
  }

  saveAppointments(appointments: Appointment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.error('Error saving appointments', e);
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('appointments-updated', { detail: appointments }));
      } catch (_) {}
    }
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'reminderSent'>): Appointment {
    const list = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: 'apt-' + Date.now(),
      status: 'pendente',
      reminderSent: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newAppointment);
    this.saveAppointments(list);

    // Also link or create client in the database history
    this.autoSyncClientFromAppointment(newAppointment);

    // Create in-app notification
    this.addNotification({
      title: 'Novo Agendamento Recebido',
      message: `${newAppointment.clientName} agendou ${newAppointment.procedureTitle} para ${newAppointment.date} às ${newAppointment.time}.`,
      type: 'appointment'
    });

    // Sync with MySQL backend
    try {
      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      }).catch(err => console.warn('Background sync with MySQL failed:', err));
    } catch (e) {
      // safe fallback
    }

    return newAppointment;
  }

  async addAppointmentLive(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'reminderSent'>): Promise<Appointment> {
    const newId = 'apt-' + Date.now();
    const newAppointment: Appointment = {
      ...appointment,
      id: newId,
      status: 'pendente',
      reminderSent: false,
      createdAt: new Date().toISOString()
    };

    // Optimistically save locally
    const list = this.getAppointments();
    list.unshift(newAppointment);
    this.saveAppointments(list);
    this.autoSyncClientFromAppointment(newAppointment);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.appointment) {
          // Update in local cache with server data
          const updatedList = this.getAppointments().map(a => a.id === newId ? json.appointment : a);
          this.saveAppointments(updatedList);
          // Also fetch fresh clients to reflect new client created in MySQL
          this.fetchLiveClients().catch(() => {});
          return json.appointment;
        }
      }
    } catch (err) {
      console.warn('Error saving appointment to MySQL:', err);
    }

    return newAppointment;
  }

  updateAppointmentStatus(id: string, status: Appointment['status']): Appointment | null {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === id);
    if (index === -1) return null;
    list[index].status = status;
    this.saveAppointments(list);

    // Sync with MySQL
    try {
      fetch(`/api/appointments/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(err => console.warn('Async status update error:', err));
    } catch (e) {}

    return list[index];
  }

  async updateAppointmentStatusLive(id: string, status: Appointment['status']): Promise<void> {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index].status = status;
      this.saveAppointments(list);
    }

    try {
      await fetch(`/api/appointments/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Error updating status in MySQL:', err);
    }
  }

  markReminderSent(id: string): void {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index].reminderSent = true;
      this.saveAppointments(list);
    }

    try {
      fetch(`/api/appointments/${encodeURIComponent(id)}/reminder`, {
        method: 'PATCH'
      }).catch(err => console.warn('Async reminder mark error:', err));
    } catch (e) {}
  }

  async markReminderSentLive(id: string): Promise<void> {
    this.markReminderSent(id);
    try {
      await fetch(`/api/appointments/${encodeURIComponent(id)}/reminder`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.warn('Error marking reminder sent in MySQL:', err);
    }
  }

  async deleteAppointmentLive(id: string): Promise<void> {
    const list = this.getAppointments().filter(a => a.id !== id);
    this.saveAppointments(list);

    try {
      await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Error deleting appointment from MySQL:', err);
    }
  }

  // Clients & Clinical History
  async fetchLiveClients(): Promise<ClientRecord[]> {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.saveClients(data);
          try {
            window.dispatchEvent(new CustomEvent('clients-updated', { detail: data }));
          } catch (_) {}
          return data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch live clients from MySQL:', err);
    }
    return this.getClients();
  }

  getClients(): ClientRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading clients from storage', e);
    }
    this.saveClients(INITIAL_CLIENTS);
    return INITIAL_CLIENTS;
  }

  saveClients(clients: ClientRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients', e);
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('clients-updated', { detail: clients }));
      } catch (_) {}
    }
  }

  addClient(clientData: Omit<ClientRecord, 'id' | 'createdAt' | 'totalVisits'>): ClientRecord {
    const clients = this.getClients();
    const newId = 'cli-' + Date.now();
    const newClient: ClientRecord = {
      ...clientData,
      id: newId,
      totalVisits: clientData.history?.length || 1,
      createdAt: new Date().toISOString()
    };
    clients.unshift(newClient);
    this.saveClients(clients);

    // Sync with server if online
    try {
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      }).catch(err => console.warn('Async client save error:', err));
    } catch (e) {}

    return newClient;
  }

  async addClientLive(clientData: Omit<ClientRecord, 'id' | 'createdAt' | 'totalVisits'>): Promise<ClientRecord> {
    const newId = 'cli-' + Date.now();
    const newClient: ClientRecord = {
      ...clientData,
      id: newId,
      totalVisits: clientData.history?.length || 1,
      createdAt: new Date().toISOString()
    };

    const clients = this.getClients();
    clients.unshift(newClient);
    this.saveClients(clients);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.client) {
          const updated = this.getClients().map(c => c.id === newId ? json.client : c);
          this.saveClients(updated);
          return json.client;
        }
      }
    } catch (err) {
      console.warn('Error saving client to MySQL:', err);
    }

    return newClient;
  }

  updateClient(id: string, updates: Partial<ClientRecord>): ClientRecord | null {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;
    clients[index] = { ...clients[index], ...updates };
    this.saveClients(clients);

    // Sync with server if online
    try {
      fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(err => console.warn('Async client update error:', err));
    } catch (e) {}

    return clients[index];
  }

  async updateClientLive(id: string, updates: Partial<ClientRecord>): Promise<ClientRecord | null> {
    const updated = this.updateClient(id, updates);
    try {
      await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Error updating client in MySQL:', err);
    }
    return updated;
  }

  addProcedureToClientHistory(clientId: string, item: Omit<ProcedureHistoryItem, 'id'>): ProcedureHistoryItem | null {
    const clients = this.getClients();
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const newItem: ProcedureHistoryItem = {
      ...item,
      id: 'hist-' + Date.now()
    };

    if (!client.history) client.history = [];
    client.history.unshift(newItem);
    client.totalVisits = (client.totalVisits || 0) + 1;

    this.saveClients(clients);

    // Sync with MySQL backend
    try {
      fetch(`/api/clients/${encodeURIComponent(clientId)}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).catch(err => console.warn('Async procedure history save error:', err));
    } catch (e) {}

    return newItem;
  }

  async addProcedureToClientHistoryLive(clientId: string, item: Omit<ProcedureHistoryItem, 'id'>): Promise<ProcedureHistoryItem | null> {
    const histId = 'hist-' + Date.now();
    const newItem: ProcedureHistoryItem = {
      ...item,
      id: histId
    };

    const clients = this.getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
      if (!client.history) client.history = [];
      client.history.unshift(newItem);
      client.totalVisits = (client.totalVisits || 0) + 1;
      this.saveClients(clients);
    }

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.historyItem) return json.historyItem;
      }
    } catch (err) {
      console.warn('Error saving procedure history to MySQL:', err);
    }

    return newItem;
  }

  async deleteProcedureHistoryLive(clientId: string, historyId: string): Promise<void> {
    const clients = this.getClients();
    const client = clients.find(c => c.id === clientId);
    if (client && client.history) {
      client.history = client.history.filter(h => h.id !== historyId);
      client.totalVisits = Math.max(1, (client.totalVisits || 1) - 1);
      this.saveClients(clients);
    }

    try {
      await fetch(`/api/clients/${encodeURIComponent(clientId)}/history/${encodeURIComponent(historyId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Error deleting procedure history from MySQL:', err);
    }
  }

  async deleteClientLive(id: string): Promise<void> {
    const clients = this.getClients().filter(c => c.id !== id);
    this.saveClients(clients);

    try {
      await fetch(`/api/clients/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Error deleting client from MySQL:', err);
    }
  }

  private autoSyncClientFromAppointment(appointment: Appointment) {
    const clients = this.getClients();
    const existing = clients.find(
      c => (appointment.clientPhone && c.phone.replace(/\D/g, '') === appointment.clientPhone.replace(/\D/g, '')) ||
           (appointment.clientEmail && c.email.toLowerCase() === appointment.clientEmail.toLowerCase())
    );

    if (existing) {
      // Update visits
      existing.totalVisits = (existing.totalVisits || 1) + 1;
      this.saveClients(clients);
    } else {
      // Register new client
      const newClient: ClientRecord = {
        id: 'cli-' + Date.now(),
        name: appointment.clientName,
        phone: appointment.clientPhone,
        email: appointment.clientEmail,
        firstVisitDate: appointment.date,
        totalVisits: 1,
        aestheticGoals: `Interesse em ${appointment.procedureTitle}. Obs: ${appointment.notes || 'Nenhuma'}`,
        history: [],
        createdAt: new Date().toISOString()
      };
      clients.unshift(newClient);
      this.saveClients(clients);

      // Also persist to MySQL
      try {
        fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient)
        }).catch(() => {});
      } catch (_) {}
    }
  }

  // Blog Posts
  getBlogPosts(): BlogPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading blog posts', e);
    }
    this.saveBlogPosts(INITIAL_BLOG_POSTS);
    return INITIAL_BLOG_POSTS;
  }

  saveBlogPosts(posts: BlogPost[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(posts));
    } catch (e) {
      console.error('Error saving blog posts', e);
    }
  }

  addBlogPost(post: Omit<BlogPost, 'id' | 'publishedAt'>): BlogPost {
    const posts = this.getBlogPosts();
    const newPost: BlogPost = {
      ...post,
      id: 'blog-' + Date.now(),
      publishedAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    posts.unshift(newPost);
    this.saveBlogPosts(posts);
    return newPost;
  }

  deleteBlogPost(id: string): void {
    const posts = this.getBlogPosts().filter(p => p.id !== id);
    this.saveBlogPosts(posts);
  }

  // Instagram Gallery
  getGallery(): InstagramPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading gallery', e);
    }
    this.saveGallery(INITIAL_INSTAGRAM_POSTS);
    return INITIAL_INSTAGRAM_POSTS;
  }

  saveGallery(gallery: InstagramPost[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    } catch (e) {
      console.error('Error saving gallery', e);
    }
  }

  addGalleryPost(post: Omit<InstagramPost, 'id' | 'date'>): InstagramPost {
    const gallery = this.getGallery();
    const newPost: InstagramPost = {
      ...post,
      id: 'post-' + Date.now(),
      date: 'Recente'
    };
    gallery.unshift(newPost);
    this.saveGallery(gallery);
    return newPost;
  }

  deleteGalleryPost(id: string): void {
    const gallery = this.getGallery().filter(p => p.id !== id);
    this.saveGallery(gallery);
  }

  private inMemoryDoctorPhoto: string = '';
  private inMemoryClinicLogo: string = '';
  private inMemoryWhatsappNumber: string = '';
  private inMemoryWhatsappDisplay: string = '';
  private inMemoryClinicAddress: string = '';
  private inMemoryClinicCity: string = '';
  private inMemoryClinicCep: string = '';
  private inMemoryClinicFullAddress: string = '';
  private inMemoryClinicMapsUrl: string = '';

  getClinicLogo(): string {
    if (this.inMemoryClinicLogo) return this.inMemoryClinicLogo;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINIC_LOGO);
      if (data) {
        this.inMemoryClinicLogo = data;
        return data;
      }
    } catch (e) {
      console.warn('Error reading clinic logo', e);
    }
    return '';
  }

  async fetchLiveClinicLogo(): Promise<string> {
    try {
      const res = await fetch('/api/settings/logo');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.logoUrl === 'string') {
          this.inMemoryClinicLogo = data.logoUrl;
          try {
            localStorage.setItem(STORAGE_KEYS.CLINIC_LOGO, data.logoUrl);
          } catch {
            // Quota fallback
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('clinic-logo-updated', { detail: data.logoUrl }));
          }
          return data.logoUrl;
        }
      }
    } catch {
      // Offline fallback
    }
    return this.getClinicLogo();
  }

  saveClinicLogo(logoUrl: string): string {
    const cleanUrl = typeof logoUrl === 'string' ? logoUrl.trim() : '';
    this.inMemoryClinicLogo = cleanUrl;
    try {
      localStorage.setItem(STORAGE_KEYS.CLINIC_LOGO, cleanUrl);
    } catch (e) {
      console.warn('LocalStorage quota limit reached for clinic logo', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clinic-logo-updated', { detail: cleanUrl }));
    }

    // Sync to MySQL backend
    fetch('/api/settings/logo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoUrl: cleanUrl })
    }).catch(err => console.warn('Background sync clinic logo failed:', err));

    return cleanUrl;
  }

  getWhatsappNumber(): string {
    if (this.inMemoryWhatsappNumber) return this.inMemoryWhatsappNumber;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_NUMBER);
      if (data) {
        this.inMemoryWhatsappNumber = data;
        return data;
      }
    } catch (e) {
      console.warn('Error reading whatsapp number', e);
    }
    return CLINIC_INFO.whatsappNumber;
  }

  getWhatsappDisplay(): string {
    if (this.inMemoryWhatsappDisplay) return this.inMemoryWhatsappDisplay;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_DISPLAY);
      if (data) {
        this.inMemoryWhatsappDisplay = data;
        return data;
      }
    } catch (e) {
      console.warn('Error reading whatsapp display', e);
    }
    return CLINIC_INFO.whatsappDisplay;
  }

  formatWhatsappDisplay(num: string): string {
    const digits = num.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length === 13) {
      return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    } else if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return num;
  }

  async fetchLiveWhatsapp(): Promise<{ whatsappNumber: string; whatsappDisplay: string }> {
    try {
      const res = await fetch('/api/settings/whatsapp');
      if (res.ok) {
        const data = await res.json();
        if (data && data.whatsappNumber) {
          this.inMemoryWhatsappNumber = data.whatsappNumber;
          this.inMemoryWhatsappDisplay = data.whatsappDisplay || this.formatWhatsappDisplay(data.whatsappNumber);
          try {
            localStorage.setItem(STORAGE_KEYS.WHATSAPP_NUMBER, this.inMemoryWhatsappNumber);
            localStorage.setItem(STORAGE_KEYS.WHATSAPP_DISPLAY, this.inMemoryWhatsappDisplay);
          } catch {
            // Quota fallback
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('whatsapp-updated', {
              detail: { whatsappNumber: this.inMemoryWhatsappNumber, whatsappDisplay: this.inMemoryWhatsappDisplay }
            }));
          }
          return { whatsappNumber: this.inMemoryWhatsappNumber, whatsappDisplay: this.inMemoryWhatsappDisplay };
        }
      }
    } catch {
      // Offline fallback
    }
    return { whatsappNumber: this.getWhatsappNumber(), whatsappDisplay: this.getWhatsappDisplay() };
  }

  saveWhatsapp(rawNumber: string, customDisplay?: string): { whatsappNumber: string; whatsappDisplay: string } {
    const digits = rawNumber.replace(/\D/g, '');
    let cleanNumber = digits;
    if (digits.length === 10 || digits.length === 11) {
      cleanNumber = '55' + digits;
    }
    const display = customDisplay && customDisplay.trim() 
      ? customDisplay.trim() 
      : this.formatWhatsappDisplay(cleanNumber);

    this.inMemoryWhatsappNumber = cleanNumber;
    this.inMemoryWhatsappDisplay = display;

    try {
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_NUMBER, cleanNumber);
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_DISPLAY, display);
    } catch (e) {
      console.warn('LocalStorage quota limit reached for whatsapp', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('whatsapp-updated', { 
        detail: { whatsappNumber: cleanNumber, whatsappDisplay: display } 
      }));
    }

    // Sync to backend
    fetch('/api/settings/whatsapp', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappNumber: cleanNumber, whatsappDisplay: display })
    }).catch(err => console.warn('Background sync whatsapp failed:', err));

    return { whatsappNumber: cleanNumber, whatsappDisplay: display };
  }

  getClinicAddress(): {
    address: string;
    city: string;
    cep: string;
    fullAddress: string;
    mapsUrl: string;
  } {
    if (this.inMemoryClinicAddress) {
      return {
        address: this.inMemoryClinicAddress,
        city: this.inMemoryClinicCity || CLINIC_INFO.city,
        cep: this.inMemoryClinicCep || CLINIC_INFO.cep,
        fullAddress: this.inMemoryClinicFullAddress || CLINIC_INFO.fullAddress,
        mapsUrl: this.inMemoryClinicMapsUrl || CLINIC_INFO.mapsUrl
      };
    }
    try {
      const addr = localStorage.getItem(STORAGE_KEYS.CLINIC_ADDRESS);
      const city = localStorage.getItem(STORAGE_KEYS.CLINIC_CITY);
      const cep = localStorage.getItem(STORAGE_KEYS.CLINIC_CEP);
      const full = localStorage.getItem(STORAGE_KEYS.CLINIC_FULL_ADDRESS);
      const maps = localStorage.getItem(STORAGE_KEYS.CLINIC_MAPS_URL);
      if (addr) {
        this.inMemoryClinicAddress = addr;
        this.inMemoryClinicCity = city || CLINIC_INFO.city;
        this.inMemoryClinicCep = cep || CLINIC_INFO.cep;
        this.inMemoryClinicFullAddress = full || CLINIC_INFO.fullAddress;
        this.inMemoryClinicMapsUrl = maps || CLINIC_INFO.mapsUrl;
        return {
          address: addr,
          city: this.inMemoryClinicCity,
          cep: this.inMemoryClinicCep,
          fullAddress: this.inMemoryClinicFullAddress,
          mapsUrl: this.inMemoryClinicMapsUrl
        };
      }
    } catch (e) {
      console.warn('Error reading clinic address from storage', e);
    }
    return {
      address: CLINIC_INFO.address,
      city: CLINIC_INFO.city,
      cep: CLINIC_INFO.cep,
      fullAddress: CLINIC_INFO.fullAddress,
      mapsUrl: CLINIC_INFO.mapsUrl
    };
  }

  async fetchLiveClinicAddress(): Promise<{
    address: string;
    city: string;
    cep: string;
    fullAddress: string;
    mapsUrl: string;
  }> {
    try {
      const res = await fetch('/api/settings/address');
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          this.inMemoryClinicAddress = data.address;
          this.inMemoryClinicCity = data.city || CLINIC_INFO.city;
          this.inMemoryClinicCep = data.cep || CLINIC_INFO.cep;
          this.inMemoryClinicFullAddress = data.fullAddress || CLINIC_INFO.fullAddress;
          this.inMemoryClinicMapsUrl = data.mapsUrl || CLINIC_INFO.mapsUrl;
          try {
            localStorage.setItem(STORAGE_KEYS.CLINIC_ADDRESS, data.address);
            if (data.city) localStorage.setItem(STORAGE_KEYS.CLINIC_CITY, data.city);
            if (data.cep) localStorage.setItem(STORAGE_KEYS.CLINIC_CEP, data.cep);
            if (data.fullAddress) localStorage.setItem(STORAGE_KEYS.CLINIC_FULL_ADDRESS, data.fullAddress);
            if (data.mapsUrl) localStorage.setItem(STORAGE_KEYS.CLINIC_MAPS_URL, data.mapsUrl);
          } catch {
            // Quota fallback
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('clinic-address-updated', {
              detail: {
                address: data.address,
                city: this.inMemoryClinicCity,
                cep: this.inMemoryClinicCep,
                fullAddress: this.inMemoryClinicFullAddress,
                mapsUrl: this.inMemoryClinicMapsUrl
              }
            }));
          }
          return {
            address: data.address,
            city: this.inMemoryClinicCity,
            cep: this.inMemoryClinicCep,
            fullAddress: this.inMemoryClinicFullAddress,
            mapsUrl: this.inMemoryClinicMapsUrl
          };
        }
      }
    } catch {
      // Offline fallback
    }
    return this.getClinicAddress();
  }

  saveClinicAddress(info: {
    address: string;
    city?: string;
    cep?: string;
    fullAddress?: string;
    mapsUrl?: string;
  }): {
    address: string;
    city: string;
    cep: string;
    fullAddress: string;
    mapsUrl: string;
  } {
    const address = info.address.trim();
    const city = (info.city || 'São Paulo/SP').trim();
    const cep = (info.cep || '04551-010').trim();
    const fullAddress = (info.fullAddress || `${address}, ${city} - CEP ${cep}`).trim();
    const mapsUrl = info.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, ${cep}`)}`;

    this.inMemoryClinicAddress = address;
    this.inMemoryClinicCity = city;
    this.inMemoryClinicCep = cep;
    this.inMemoryClinicFullAddress = fullAddress;
    this.inMemoryClinicMapsUrl = mapsUrl;

    try {
      localStorage.setItem(STORAGE_KEYS.CLINIC_ADDRESS, address);
      localStorage.setItem(STORAGE_KEYS.CLINIC_CITY, city);
      localStorage.setItem(STORAGE_KEYS.CLINIC_CEP, cep);
      localStorage.setItem(STORAGE_KEYS.CLINIC_FULL_ADDRESS, fullAddress);
      localStorage.setItem(STORAGE_KEYS.CLINIC_MAPS_URL, mapsUrl);
    } catch (e) {
      console.warn('LocalStorage quota limit reached for address', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clinic-address-updated', {
        detail: { address, city, cep, fullAddress, mapsUrl }
      }));
    }

    // Sync to backend
    fetch('/api/settings/address', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, city, cep, fullAddress, mapsUrl })
    }).catch(err => console.warn('Background sync address failed:', err));

    return { address, city, cep, fullAddress, mapsUrl };
  }

  getDoctorPhoto(): string {
    if (this.inMemoryDoctorPhoto) return this.inMemoryDoctorPhoto;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_PHOTO);
      if (data) {
        this.inMemoryDoctorPhoto = data;
        return data;
      }
    } catch (e) {
      console.warn('Error reading doctor photo', e);
    }
    return CLINIC_INFO.doctorPhoto;
  }

  async fetchLiveDoctorPhoto(): Promise<string> {
    try {
      const res = await fetch('/api/settings/photo');
      if (res.ok) {
        const data = await res.json();
        if (data.photoUrl) {
          this.inMemoryDoctorPhoto = data.photoUrl;
          try {
            localStorage.setItem(STORAGE_KEYS.DOCTOR_PHOTO, data.photoUrl);
          } catch {
            // Quota fallback
          }
          return data.photoUrl;
        }
      }
    } catch {
      // Offline fallback
    }
    return this.getDoctorPhoto();
  }

  saveDoctorPhoto(photoUrl: string): void {
    this.inMemoryDoctorPhoto = photoUrl;
    try {
      localStorage.setItem(STORAGE_KEYS.DOCTOR_PHOTO, photoUrl);
    } catch (e) {
      console.warn('LocalStorage quota limit reached for doctor photo, keeping in memory & syncing to backend', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('doctor-photo-updated', { detail: photoUrl }));
    }

    // Sync to MySQL backend
    fetch('/api/settings/photo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl })
    }).catch(err => console.warn('Background sync doctor photo failed:', err));
  }

  updateGalleryPhoto(postId: string, imageUrl: string): void {
    const gallery = this.getGallery();
    const index = gallery.findIndex(p => p.id === postId);
    if (index !== -1) {
      gallery[index].imageUrl = imageUrl;
      this.saveGallery(gallery);
      if (postId === 'post-1') {
        this.saveDoctorPhoto(imageUrl);
      }
    }
  }

  // Database Connection Configuration
  async fetchLiveDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const json = await res.json();
        if (json?.config) {
          const liveConfig: DatabaseStatus = {
            connected: json.config.connected,
            provider: json.config.provider,
            connectionStringMasked: json.config.connectionStringMasked,
            host: json.config.host,
            database: json.config.database,
            lastSync: json.config.lastSync || new Date().toISOString(),
            recordsCount: {
              clients: json.config.recordsCount?.clients || this.getClients().length,
              appointments: json.config.recordsCount?.appointments || this.getAppointments().length,
              posts: json.config.recordsCount?.posts || this.getBlogPosts().length,
              gallery: json.config.recordsCount?.gallery || this.getGallery().length,
              procedures: json.config.recordsCount?.procedures,
              testimonials: json.config.recordsCount?.testimonials,
              notifications: json.config.recordsCount?.notifications,
              history: json.config.recordsCount?.history
            },
            allTables: json.config.allTables
          };
          localStorage.setItem(STORAGE_KEYS.DB_CONFIG, JSON.stringify(liveConfig));
          return liveConfig;
        }
      }
    } catch (e) {
      console.warn('Could not fetch live database status from API, using cached state', e);
    }
    return this.getDatabaseConfig();
  }

  getDatabaseConfig(): DatabaseStatus {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DB_CONFIG);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading db config', e);
    }
    return {
      connected: true,
      provider: 'MySQL Cloud / Externo',
      host: '69.49.241.41',
      database: 'kebers41_dra_kalline',
      connectionStringMasked: 'mysql://kebers41_kebers41:***@69.49.241.41:3306/kebers41_dra_kalline',
      recordsCount: {
        clients: this.getClients().length,
        appointments: this.getAppointments().length,
        posts: this.getBlogPosts().length,
        gallery: this.getGallery().length
      }
    };
  }

  saveDatabaseConfig(connectionString: string): DatabaseStatus {
    const isMysql = connectionString.includes('mysql') || connectionString.includes('kebers41');
    const status: DatabaseStatus = {
      connected: true,
      provider: isMysql ? 'MySQL Cloud / Externo' : 'PostgreSQL (Cloud / Externo)',
      connectionStringMasked: connectionString.replace(/:\/\/.*@/, '://***:***@'),
      host: '69.49.241.41',
      database: 'kebers41_dra_kalline',
      lastSync: new Date().toISOString(),
      recordsCount: {
        clients: this.getClients().length,
        appointments: this.getAppointments().length,
        posts: this.getBlogPosts().length,
        gallery: this.getGallery().length
      }
    };
    try {
      localStorage.setItem(STORAGE_KEYS.DB_CONFIG, JSON.stringify(status));
    } catch (e) {
      console.error('Error saving db config', e);
    }
    return status;
  }

  // Notifications
  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading notifications', e);
    }
    return [
      {
        id: 'notif-1',
        title: 'Bem-vinda à Clínica Dra. Kaline',
        message: 'Agende sua avaliação facial e ative suas notificações para lembretes automáticos.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'system'
      }
    ];
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    list.unshift(newNotif);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving notifications', e);
    }
    return newNotif;
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Error marking notifications read', e);
    }
  }

  // Procedures (Cuidados & Procedimentos / Tratamentos)
  private inMemoryProcedures: Procedure[] | null = null;

  getProcedures(): Procedure[] {
    if (this.inMemoryProcedures !== null) {
      return this.inMemoryProcedures;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.inMemoryProcedures = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading procedures from storage', e);
    }
    this.inMemoryProcedures = INITIAL_PROCEDURES;
    this.saveProcedures(INITIAL_PROCEDURES);
    return INITIAL_PROCEDURES;
  }

  saveProcedures(procedures: Procedure[]): void {
    this.inMemoryProcedures = procedures;
    try {
      localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
    } catch (e) {
      console.warn('LocalStorage quota warning when saving procedures:', e);
      try {
        localStorage.removeItem('dra_kaline_notifications_v2');
        localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
      } catch (inner) {
        // Safe silence: in-memory state holds full procedures
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('procedures-updated', { detail: procedures }));
    }
  }

  async fetchLiveProcedures(): Promise<Procedure[]> {
    try {
      const res = await fetch('/api/procedures');
      if (res.ok) {
        const liveProcedures = await res.json();
        if (Array.isArray(liveProcedures)) {
          this.inMemoryProcedures = liveProcedures;
          this.saveProcedures(liveProcedures);
          return liveProcedures;
        }
      }
    } catch (e) {
      console.warn('Error fetching live procedures from API', e);
    }
    return this.getProcedures();
  }

  async updateProcedure(id: string, updates: Partial<Procedure>): Promise<Procedure | null> {
    const list = [...this.getProcedures()];
    const index = list.findIndex(p => p.id === id);

    let updatedProc: Procedure;
    if (index !== -1) {
      updatedProc = {
        ...list[index],
        ...updates
      };
      list[index] = updatedProc;
    } else {
      updatedProc = {
        id,
        title: updates.title || 'Tratamento',
        subtitle: updates.subtitle || '',
        description: updates.description || '',
        category: updates.category || 'capilar',
        duration: updates.duration || '45 minutos',
        downtime: updates.downtime || 'Sem downtime',
        idealFor: updates.idealFor || [],
        benefits: updates.benefits || [],
        imageUrl: updates.imageUrl || '/uploads/transplante.jpg',
        popular: Boolean(updates.popular),
        faq: updates.faq || []
      };
      list.push(updatedProc);
    }
    this.saveProcedures(list);

    // Sync to MySQL backend
    try {
      const res = await fetch(`/api/procedures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.procedure) {
          updatedProc = data.procedure;
          const freshList = this.getProcedures().map(p => p.id === id ? data.procedure : p);
          this.saveProcedures(freshList);
        }
      }
    } catch (e) {
      console.warn('Could not sync procedure update to backend:', e);
    }

    return updatedProc;
  }

  async addProcedure(procData: Omit<Procedure, 'id'> | Procedure): Promise<Procedure> {
    const list = [...this.getProcedures()];
    const id = (procData as any).id || 'proc-' + Date.now();
    let newProc: Procedure = {
      ...procData,
      id
    };
    list.push(newProc);
    this.saveProcedures(list);

    // Sync to MySQL backend
    try {
      const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProc)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.procedure) {
          newProc = data.procedure;
          const freshList = this.getProcedures().map(p => p.id === id ? data.procedure : p);
          this.saveProcedures(freshList);
        }
      }
    } catch (e) {
      console.warn('Could not sync new procedure to backend:', e);
    }

    return newProc;
  }

  async deleteProcedure(id: string): Promise<boolean> {
    const list = this.getProcedures().filter(p => p.id !== id);
    this.saveProcedures(list);

    try {
      const res = await fetch(`/api/procedures/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.procedures)) {
          this.saveProcedures(data.procedures);
        }
      }
      return true;
    } catch (e) {
      console.warn('Could not delete procedure from backend:', e);
      return true;
    }
  }

  private inMemoryHeroSlides: HeroSlide[] = [];

  // Hero Slides Carousel (Top Banner)
  getHeroSlides(): HeroSlide[] {
    if (this.inMemoryHeroSlides && this.inMemoryHeroSlides.length > 0) {
      return this.inMemoryHeroSlides;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inMemoryHeroSlides = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading hero slides', e);
    }
    this.inMemoryHeroSlides = INITIAL_HERO_SLIDES;
    this.saveHeroSlides(INITIAL_HERO_SLIDES);
    return INITIAL_HERO_SLIDES;
  }

  saveHeroSlides(slides: HeroSlide[]): void {
    this.inMemoryHeroSlides = slides;
    try {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    } catch (e) {
      console.warn('LocalStorage quota limit reached when saving slides, attempting lightweight cache:', e);
      try {
        // Fallback: strip any oversized data URLs so metadata can still be cached
        const lightweight = slides.map(s => ({
          ...s,
          imageUrl: (s.imageUrl?.startsWith('data:') && s.imageUrl.length > 1000)
            ? 'https://images.unsplash.com/photo-1594824813589-32e6a715f5f3?auto=format&fit=crop&w=1400&q=85'
            : s.imageUrl
        }));
        localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(lightweight));
      } catch (inner) {
        // Safe silence: in-memory state & backend MySQL hold the complete slides
      }
    }
    window.dispatchEvent(new CustomEvent('hero-slides-updated', { detail: slides }));
  }

  async fetchLiveHeroSlides(): Promise<HeroSlide[]> {
    try {
      const res = await fetch('/api/slides');
      if (res.ok) {
        const liveSlides = await res.json();
        if (Array.isArray(liveSlides) && liveSlides.length > 0) {
          this.inMemoryHeroSlides = liveSlides;
          this.saveHeroSlides(liveSlides);
          return liveSlides;
        }
      }
    } catch (e) {
      console.warn('Backend /api/slides unavailable, using local cache', e);
    }
    return this.getHeroSlides();
  }

  async saveHeroSlideLive(slide: Omit<HeroSlide, 'id'> & { id?: string }): Promise<HeroSlide> {
    try {
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide)
      });
      if (res.ok) {
        const created = await res.json();
        const current = this.getHeroSlides();
        current.push(created);
        this.saveHeroSlides(current);
        return created;
      }
    } catch (e) {
      console.warn('Error creating slide in backend, saving locally', e);
    }

    // Local fallback
    const fallbackSlide: HeroSlide = {
      ...slide,
      id: 'slide-' + Date.now(),
      isActive: slide.isActive !== false,
      order: slide.order ?? 99
    };
    const current = this.getHeroSlides();
    current.push(fallbackSlide);
    this.saveHeroSlides(current);
    return fallbackSlide;
  }

  async updateHeroSlideLive(id: string, slideData: Partial<HeroSlide>): Promise<void> {
    try {
      await fetch(`/api/slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideData)
      });
    } catch (e) {
      console.warn('Error updating slide in backend', e);
    }

    const current = this.getHeroSlides().map(s => s.id === id ? { ...s, ...slideData } : s);
    this.saveHeroSlides(current);
  }

  async deleteHeroSlideLive(id: string): Promise<void> {
    try {
      await fetch(`/api/slides/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Error deleting slide in backend', e);
    }

    const current = this.getHeroSlides().filter(s => s.id !== id);
    this.saveHeroSlides(current);
  }

  // ----------------------------------------------------
  // Admin Users & Credentials Management (Database Sync)
  // ----------------------------------------------------
  getAdminUsers(): AdminUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading admin users from local storage', e);
    }
    const defaultUser: AdminUser = {
      id: 'user-admin-1',
      username: 'admin',
      password: 'admin',
      name: 'Dra. Kaline / Administrador',
      role: 'Administrador',
      createdAt: new Date().toISOString()
    };
    this.saveAdminUsers([defaultUser]);
    return [defaultUser];
  }

  saveAdminUsers(users: AdminUser[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving admin users to local storage', e);
    }
  }

  async fetchAdminUsersLive(): Promise<AdminUser[]> {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          this.saveAdminUsers(users);
          return users;
        }
      }
    } catch (e) {
      console.warn('Error fetching admin users from backend, using local cache', e);
    }
    return this.getAdminUsers();
  }

  async loginLive(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Credenciais inválidas.' };
      }
    } catch (e) {
      console.warn('Backend login endpoint unavailable, trying local validation', e);
    }

    // Local fallback validation
    const localUsers = this.getAdminUsers();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = localUsers.find(
      u => u.username.toLowerCase() === cleanUser && (u.password === cleanPass || !u.password)
    );

    if (matched) {
      return { success: true, user: matched };
    }

    // Legacy fallback check
    if ((cleanUser === 'admin' || cleanUser === 'drakaline') && 
        (cleanPass === 'admin' || cleanPass === '123456' || cleanPass === 'dra_kaline_admin_2025')) {
      return {
        success: true,
        user: {
          id: 'user-admin-1',
          username: 'admin',
          name: 'Dra. Kaline / Administrador',
          role: 'Administrador'
        }
      };
    }

    return { success: false, error: 'Usuário ou senha incorretos.' };
  }

  async addAdminUserLive(userData: { username: string; password: string; name: string; role?: string }): Promise<AdminUser> {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        const users = this.getAdminUsers();
        users.push(data.user);
        this.saveAdminUsers(users);
        return data.user;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar usuário');
      }
    } catch (e: any) {
      console.warn('Backend create user failed, saving locally:', e);
      // Local fallback
      const newUser: AdminUser = {
        id: 'usr-' + Date.now(),
        username: userData.username.trim().toLowerCase(),
        password: userData.password.trim(),
        name: userData.name.trim(),
        role: userData.role || 'Administrador',
        createdAt: new Date().toISOString()
      };
      const users = this.getAdminUsers();
      if (users.some(u => u.username.toLowerCase() === newUser.username)) {
        throw new Error('Este nome de usuário já está em uso.');
      }
      users.push(newUser);
      this.saveAdminUsers(users);
      return newUser;
    }
  }

  async updateAdminUserLive(id: string, updates: { username?: string; password?: string; name?: string; role?: string }): Promise<void> {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar usuário');
      }
    } catch (e: any) {
      console.warn('Backend update user failed, updating locally:', e);
    }

    const users = this.getAdminUsers().map(u => {
      if (u.id === id) {
        return {
          ...u,
          ...(updates.username ? { username: updates.username.trim().toLowerCase() } : {}),
          ...(updates.password ? { password: updates.password.trim() } : {}),
          ...(updates.name ? { name: updates.name.trim() } : {}),
          ...(updates.role ? { role: updates.role.trim() } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });
    this.saveAdminUsers(users);
  }

  async deleteAdminUserLive(id: string): Promise<void> {
    const currentUsers = this.getAdminUsers();
    if (currentUsers.length <= 1) {
      throw new Error('Não é possível excluir o único usuário administrador.');
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao excluir usuário');
      }
    } catch (e: any) {
      console.warn('Backend delete user failed, deleting locally:', e);
    }

    const filtered = currentUsers.filter(u => u.id !== id);
    this.saveAdminUsers(filtered);
  }
}

export const storageService = new StorageService();
