import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Database, 
  Plus, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  Bell, 
  Trash2, 
  Edit, 
  Save, 
  Key, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Instagram,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Server,
  Camera,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Upload,
  MapPin,
  LogOut,
  User,
  Smartphone
} from 'lucide-react';
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
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { CLINIC_INFO } from '../data/initialData';
import { ChangePhotoModal } from './ChangePhotoModal';
import { ChangeLogoModal } from './ChangeLogoModal';
import { EditSlideModal } from './EditSlideModal';
import { EditProcedureModal } from './EditProcedureModal';
import { EditUserModal } from './EditUserModal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  procedures: Procedure[];
  onDataChanged: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  procedures,
  onDataChanged
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'appointments' | 'clients' | 'procedures' | 'content' | 'database' | 'whatsapp' | 'users'>('appointments');

  // Admin Users & Credentials State (Gravados no Banco de Dados)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => storageService.getAdminUsers());
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string>('');
  const [userErrorMessage, setUserErrorMessage] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // WhatsApp Settings State
  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState<string>(() => storageService.getWhatsappNumber());
  const [adminWhatsappDisplay, setAdminWhatsappDisplay] = useState<string>(() => storageService.getWhatsappDisplay());
  const [whatsappSaving, setWhatsappSaving] = useState<boolean>(false);
  const [whatsappSuccessMsg, setWhatsappSuccessMsg] = useState<string>('');

  const [adminAddress, setAdminAddress] = useState<string>(() => storageService.getClinicAddress().address);
  const [adminCity, setAdminCity] = useState<string>(() => storageService.getClinicAddress().city);
  const [adminCep, setAdminCep] = useState<string>(() => storageService.getClinicAddress().cep);
  const [addressSaving, setAddressSaving] = useState<boolean>(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState<string>('');

  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<InstagramPost[]>([]);
  const [dbConfig, setDbConfig] = useState<DatabaseStatus>(storageService.getDatabaseConfig());

  // Filters & Search
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  // Modals inside admin
  const [showAddProcedureHistory, setShowAddProcedureHistory] = useState<boolean>(false);
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState<boolean>(false);
  const [doctorPhoto, setDoctorPhoto] = useState<string>(() => storageService.getDoctorPhoto());
  const [showChangeLogoModal, setShowChangeLogoModal] = useState<boolean>(false);
  const [clinicLogo, setClinicLogo] = useState<string>(() => storageService.getClinicLogo());
  const [slides, setSlides] = useState<HeroSlide[]>(() => storageService.getHeroSlides());
  const [showEditSlideModal, setShowEditSlideModal] = useState<boolean>(false);
  const [selectedSlideForEdit, setSelectedSlideForEdit] = useState<HeroSlide | null>(null);

  // Procedures State (Cuidados & Tratamentos)
  const [proceduresList, setProceduresList] = useState<Procedure[]>(() => storageService.getProcedures());
  const [showEditProcedureModal, setShowEditProcedureModal] = useState<boolean>(false);
  const [selectedProcedureForEdit, setSelectedProcedureForEdit] = useState<Procedure | null>(null);
  const [editProcedureInitialTab, setEditProcedureInitialTab] = useState<'text' | 'image'>('text');
  const [procedureToDelete, setProcedureToDelete] = useState<Procedure | null>(null);
  const [isDeletingProcedure, setIsDeletingProcedure] = useState<boolean>(false);

  // Slides Deletion State
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [isDeletingSlide, setIsDeletingSlide] = useState<boolean>(false);

  // Forms states
  const [newHistDate, setNewHistDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newHistProcedure, setNewHistProcedure] = useState<string>('Tricoscopia Digital & Diagnóstico Capilar');
  const [newHistProduct, setNewHistProduct] = useState<string>('MMP® Fatores de Crescimento');
  const [newHistLot, setNewHistLot] = useState<string>('LT-' + Math.floor(10000 + Math.random() * 90000));
  const [newHistNotes, setNewHistNotes] = useState<string>('');
  const [newHistReturn, setNewHistReturn] = useState<string>('');

  // New Client Form
  const [newCliName, setNewCliName] = useState<string>('');
  const [newCliPhone, setNewCliPhone] = useState<string>('');
  const [newCliEmail, setNewCliEmail] = useState<string>('');
  const [newCliBirthDate, setNewCliBirthDate] = useState<string>('');
  const [newCliAllergies, setNewCliAllergies] = useState<string>('Nenhuma alergia conhecida');
  const [newCliGoals, setNewCliGoals] = useState<string>('');

  // Database Connection form
  const [inputDbUrl, setInputDbUrl] = useState<string>('');
  const [dbSuccessMessage, setDbSuccessMessage] = useState<string>('');

  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleProceduresUpdate = (e: any) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setProceduresList(e.detail);
      }
    };
    window.addEventListener('procedures-updated', handleProceduresUpdate as EventListener);
    return () => {
      window.removeEventListener('procedures-updated', handleProceduresUpdate as EventListener);
    };
  }, []);

  const loadAllData = () => {
    setAppointments(storageService.getAppointments());
    setClients(storageService.getClients());
    setBlogPosts(storageService.getBlogPosts());
    setGallery(storageService.getGallery());
    setDbConfig(storageService.getDatabaseConfig());
    setDoctorPhoto(storageService.getDoctorPhoto());
    setClinicLogo(storageService.getClinicLogo());
    setSlides(storageService.getHeroSlides());
    setProceduresList(storageService.getProcedures());
    setAdminWhatsappNumber(storageService.getWhatsappNumber());
    setAdminWhatsappDisplay(storageService.getWhatsappDisplay());

    storageService.fetchLiveProcedures().then(procs => {
      if (Array.isArray(procs) && procs.length > 0) setProceduresList(procs);
    }).catch(() => {});

    // Fetch live slides, db status, whatsapp and logo from backend
    storageService.fetchLiveHeroSlides().then(s => {
      if (Array.isArray(s) && s.length > 0) setSlides(s);
    }).catch(() => {});

    storageService.fetchLiveClinicLogo().then(logo => {
      if (typeof logo === 'string') setClinicLogo(logo);
    }).catch(() => {});

    storageService.fetchLiveDatabaseStatus().then(status => {
      setDbConfig(status);
    }).catch(() => {});

    storageService.fetchLiveWhatsapp().then(w => {
      if (w && w.whatsappNumber) {
        setAdminWhatsappNumber(w.whatsappNumber);
        setAdminWhatsappDisplay(w.whatsappDisplay);
      }
    }).catch(() => {});

    storageService.fetchLiveClinicAddress().then(addr => {
      if (addr && addr.address) {
        setAdminAddress(addr.address);
        if (addr.city) setAdminCity(addr.city);
        if (addr.cep) setAdminCep(addr.cep);
      }
    }).catch(() => {});

    // Fetch live admin users from database
    setAdminUsers(storageService.getAdminUsers());
    storageService.fetchAdminUsersLive().then(users => {
      if (Array.isArray(users) && users.length > 0) setAdminUsers(users);
    }).catch(() => {});
  };

  const handleSaveWhatsappAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminWhatsappNumber.trim()) return;
    setWhatsappSaving(true);
    try {
      const saved = storageService.saveWhatsapp(adminWhatsappNumber, adminWhatsappDisplay);
      setAdminWhatsappNumber(saved.whatsappNumber);
      setAdminWhatsappDisplay(saved.whatsappDisplay);
      setWhatsappSuccessMsg('Número de WhatsApp atualizado com sucesso! Sincronizado no site e banco de dados.');
      setTimeout(() => setWhatsappSuccessMsg(''), 4500);
      onDataChanged();
    } catch (err) {
      console.error('Error saving whatsapp:', err);
    } finally {
      setWhatsappSaving(false);
    }
  };

  const handleSaveAddressAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminAddress.trim()) return;
    setAddressSaving(true);
    try {
      const fullAddress = `${adminAddress}, ${adminCity} - CEP ${adminCep}`;
      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${adminAddress}, ${adminCity}, ${adminCep}`)}`;
      storageService.saveClinicAddress({
        address: adminAddress,
        city: adminCity,
        cep: adminCep,
        fullAddress,
        mapsUrl
      });
      setAddressSuccessMsg('Endereço do consultório atualizado com sucesso em todo o site!');
      setTimeout(() => setAddressSuccessMsg(''), 4500);
      onDataChanged();
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleRefreshDbStatus = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/database/migrate', { method: 'POST' });
      if (res.ok) {
        const liveStatus = await storageService.fetchLiveDatabaseStatus();
        setDbConfig(liveStatus);
        setDbSuccessMessage('Banco de dados MySQL sincronizado! Todas as 10 tabelas estão ativas.');
        setTimeout(() => setDbSuccessMessage(''), 4000);
      }
    } catch {
      // Fallback
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleSaveUser = async (userData: { id?: string; username: string; password?: string; name: string; role?: string }) => {
    if (userData.id) {
      // Atualização de usuário existente no banco
      await storageService.updateAdminUserLive(userData.id, userData);
      setUserSuccessMessage('Login e senha atualizados com sucesso no banco de dados!');
    } else {
      // Criação de novo usuário no banco
      if (!userData.password) throw new Error('A senha é obrigatória para cadastrar um novo usuário.');
      await storageService.addAdminUserLive({
        username: userData.username,
        password: userData.password,
        name: userData.name,
        role: userData.role
      });
      setUserSuccessMessage('Novo usuário e senha gravados no banco de dados com sucesso!');
    }
    const updatedUsers = await storageService.fetchAdminUsersLive();
    setAdminUsers(updatedUsers);
    setTimeout(() => setUserSuccessMessage(''), 4500);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (adminUsers.length <= 1) {
      alert('Não é possível excluir o único administrador cadastrado no sistema.');
      return;
    }
    setIsDeletingUser(true);
    try {
      await storageService.deleteAdminUserLive(user.id);
      const updated = await storageService.fetchAdminUsersLive();
      setAdminUsers(updated);
      setUserToDelete(null);
      setUserSuccessMessage(`Usuário "${user.username}" removido do banco de dados com sucesso.`);
      setTimeout(() => setUserSuccessMessage(''), 4000);
    } catch (err: any) {
      setUserErrorMessage(err.message || 'Erro ao excluir usuário');
      setTimeout(() => setUserErrorMessage(''), 4000);
    } finally {
      setIsDeletingUser(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const res = await storageService.loginLive(usernameInput, passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        setAuthError('');
        // Atualiza a lista ao logar
        storageService.fetchAdminUsersLive().then(users => {
          if (Array.isArray(users) && users.length > 0) setAdminUsers(users);
        }).catch(() => {});
      } else {
        setAuthError(res.error || 'Usuário ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setAuthError('Erro ao validar credenciais. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Appointment actions
  const handleUpdateStatus = (id: string, newStatus: Appointment['status']) => {
    storageService.updateAppointmentStatus(id, newStatus);
    loadAllData();
    onDataChanged();
  };

  const handleSendReminderPush = (apt: Appointment) => {
    notificationService.triggerAppointmentReminder(
      apt.clientName,
      apt.procedureTitle,
      apt.date,
      apt.time
    );
    storageService.markReminderSent(apt.id);
    loadAllData();
    alert(`Lembrete push disparado com sucesso para ${apt.clientName}!`);
  };

  const generateWhatsAppReminderUrl = (apt: Appointment) => {
    const text = `Olá, ${apt.clientName}! Aqui é da clínica da Dra. Kaline. 🤍%0A%0AGostaríamos de confirmar sua consulta agendada para o procedimento *${apt.procedureTitle}* no dia *${apt.date}* às *${apt.time}*.%0A%0AAlguma dúvida ou recomendação pré-atendimento que possamos ajudar?`;
    return `https://wa.me/${apt.clientPhone.replace(/\D/g, '')}?text=${text}`;
  };

  // Client actions
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliName || !newCliPhone) return;

    const newClient = storageService.addClient({
      name: newCliName,
      phone: newCliPhone,
      email: newCliEmail,
      birthDate: newCliBirthDate,
      firstVisitDate: new Date().toISOString().split('T')[0],
      allergies: newCliAllergies,
      aestheticGoals: newCliGoals,
      history: []
    });

    setNewCliName('');
    setNewCliPhone('');
    setNewCliEmail('');
    setShowAddClientModal(false);
    loadAllData();
    setSelectedClient(newClient);
    onDataChanged();
  };

  const handleAddProcedureToHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    storageService.addProcedureToClientHistory(selectedClient.id, {
      date: newHistDate,
      procedure: newHistProcedure,
      productUsed: newHistProduct,
      lotNumber: newHistLot,
      notes: newHistNotes,
      returnDate: newHistReturn || undefined
    });

    // Refresh client
    const updatedClients = storageService.getClients();
    setClients(updatedClients);
    const updated = updatedClients.find(c => c.id === selectedClient.id) || null;
    setSelectedClient(updated);
    setShowAddProcedureHistory(false);
    setNewHistNotes('');
    onDataChanged();
  };

  // Database credential configuration
  const handleSaveDatabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDbUrl) return;

    const newConfig = storageService.saveDatabaseConfig(inputDbUrl);
    setDbConfig(newConfig);
    setDbSuccessMessage('Conexão configurada e validada com sucesso! O histórico dos clientes está associado.');
    setTimeout(() => setDbSuccessMessage(''), 4000);
    onDataChanged();
  };

  const handleExportBackup = () => {
    const data = {
      clinic: CLINIC_INFO.name,
      exportedAt: new Date().toISOString(),
      clients: storageService.getClients(),
      appointments: storageService.getAppointments(),
      blog: storageService.getBlogPosts(),
      gallery: storageService.getGallery()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prontuarios-dra-kaline-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSlideAdmin = async (slideData: HeroSlide) => {
    const existing = slides.some(s => s.id === slideData.id);
    if (existing) {
      await storageService.updateHeroSlideLive(slideData.id, slideData);
    } else {
      await storageService.saveHeroSlideLive(slideData);
    }
    loadAllData();
    onDataChanged();
  };

  const handleDeleteSlideAdmin = async (id: string) => {
    setIsDeletingSlide(true);
    try {
      await storageService.deleteHeroSlideLive(id);
      loadAllData();
      onDataChanged();
      setSlideToDelete(null);
    } catch (err) {
      console.error('Error deleting slide:', err);
    } finally {
      setIsDeletingSlide(false);
    }
  };

  const handleSaveProcedureAdmin = async (procData: Procedure) => {
    let saved: Procedure | null = null;
    const existing = proceduresList.some(p => p.id === procData.id);
    if (existing) {
      saved = await storageService.updateProcedure(procData.id, procData);
    } else {
      saved = await storageService.addProcedure(procData);
    }

    if (saved) {
      setProceduresList(prev => {
        const idx = prev.findIndex(p => p.id === saved!.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = saved!;
          return next;
        }
        return [...prev, saved!];
      });
    }

    loadAllData();
    onDataChanged();
  };

  const handleDeleteProcedureAdmin = async (id: string) => {
    setIsDeletingProcedure(true);
    try {
      await storageService.deleteProcedure(id);
      loadAllData();
      onDataChanged();
      setProcedureToDelete(null);
    } catch (err) {
      console.error('Error deleting procedure:', err);
    } finally {
      setIsDeletingProcedure(false);
    }
  };

  const handleToggleSlideActive = async (s: HeroSlide) => {
    await storageService.updateHeroSlideLive(s.id, { isActive: !s.isActive });
    loadAllData();
    onDataChanged();
  };

  const filteredAppointments = appointmentFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === appointmentFilter);

  const filteredClients = clientSearch
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.includes(clientSearch) ||
        (c.cpf && c.cpf.includes(clientSearch))
      )
    : clients;

  const renderWhatsappCard = (standalone: boolean = false) => {
    const cleanDigits = adminWhatsappNumber.replace(/\D/g, '');
    let targetNum = cleanDigits;
    if (cleanDigits.length === 10 || cleanDigits.length === 11) {
      targetNum = '55' + cleanDigits;
    }
    const testUrl = `https://wa.me/${targetNum || '5583999999999'}?text=Ol%C3%A1%20Dra.%20Kaline!%20Teste%20de%20contato%20via%20site.`;

    return (
      <div className={`bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden ${standalone ? 'p-6 sm:p-8 space-y-6' : 'p-6 space-y-5'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/20 shadow-xs">
              <MessageCircle className="w-6 h-6 fill-[#25D366]/20 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                Contato Direto & Redirecionamentos
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Número de WhatsApp do Site
              </h4>
              <p className="text-xs text-stone-500">
                Altere o número para onde os pacientes serão direcionados ao clicar em Contato, Agendar e botões de WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={testUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#25D366] hover:text-[#1da851] bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors border border-[#25D366]/30"
              title="Testar conversa no WhatsApp"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Testar Link</span>
            </a>
          </div>
        </div>

        {whatsappSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{whatsappSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveWhatsappAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Número com DDD (WhatsApp) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminWhatsappNumber}
                  onChange={(e) => setAdminWhatsappNumber(e.target.value)}
                  placeholder="Ex: (83) 98888-8888 ou 83988888888"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366] pl-9"
                  required
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Dígitos com DDD. Ex: <span className="font-mono text-stone-600">83988888888</span> ou <span className="font-mono text-stone-600">5583988888888</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Texto de Exibição no Rodapé (Opcional)
              </label>
              <input
                type="text"
                value={adminWhatsappDisplay}
                onChange={(e) => setAdminWhatsappDisplay(e.target.value)}
                placeholder="Ex: (83) 98888-8888"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Formato visual exibido no rodapé e informações de contato.
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] mt-1.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-stone-800">Redirecionamento Ativo em Todo o Site:</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Ao clicar em <span className="font-semibold text-stone-700">"Contato"</span> no menu superior e rodapé, a paciente agora é redirecionada diretamente para o seu WhatsApp no número <span className="font-mono font-semibold text-[#25D366]">{targetNum || 'configurado'}</span>. O botão flutuante e a confirmação de agendamento também usam este número.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={whatsappSaving || !adminWhatsappNumber.trim()}
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {whatsappSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Número de WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAddressCard = () => {
    const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(`${adminAddress}, ${adminCity}, ${adminCep}`)}`;

    return (
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                Localização Física do Consultório
              </div>
              <h4 className="text-sm font-bold text-stone-900">
                Endereço da Clínica / Consultório
              </h4>
              <p className="text-xs text-stone-500">
                Endereço exibido no rodapé, seção sobre a Dra. Kaline e voucher de agendamento de consultas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#aa907d] hover:text-[#8a7261] bg-[#aa907d]/10 hover:bg-[#aa907d]/20 rounded-xl transition-colors border border-[#aa907d]/30"
              title="Abrir no Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver no Google Maps</span>
            </a>
          </div>
        </div>

        {addressSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{addressSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveAddressAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Logradouro, Número e Complemento *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  placeholder="Ex: Rua Fidêncio Ramos, 100, 5º andar - Vila Olímpia"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9"
                  required
                />
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Cidade e UF *
              </label>
              <input
                type="text"
                value={adminCity}
                onChange={(e) => setAdminCity(e.target.value)}
                placeholder="Ex: São Paulo/SP"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                CEP (Código Postal) *
              </label>
              <input
                type="text"
                value={adminCep}
                onChange={(e) => setAdminCep(e.target.value)}
                placeholder="Ex: 04551-010"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                required
              />
            </div>

            <div className="p-3 bg-[#f4f3eb] rounded-xl border border-[#c9bcad] flex items-center justify-between">
              <div className="text-xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#655d56] block">Visualização no Rodapé:</span>
                <p className="font-semibold text-[#3b3530] text-xs">{adminAddress}</p>
                <p className="text-[#655d56] text-[11px]">{adminCity} • CEP {adminCep}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={addressSaving || !adminAddress.trim()}
              className="px-5 py-2.5 bg-[#3b3530] hover:bg-[#2a2522] disabled:opacity-50 text-[#f4f3eb] font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {addressSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Endereço da Clínica</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full h-[92vh] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {clinicLogo ? (
              <div className="h-8 max-w-[120px] flex items-center justify-center p-1 bg-white/10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img
                  src={clinicLogo}
                  alt="Logo Clínica"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                K
              </div>
            )}
            <div>
              <h2 className="font-serif text-lg font-bold">Painel Administrativo & Prontuários</h2>
              <p className="text-[11px] text-stone-400">Dra. Kaline | Gestão de Consultas e Histórico Clínico</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={handleExportBackup}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Exportar backup completo em JSON"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backup</span>
                </button>
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setUsernameInput('');
                    setPasswordInput('');
                    setAuthError('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-rose-950/80 text-stone-300 hover:text-rose-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-stone-700/60"
                  title="Encerrar sessão de administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Gate Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-md max-w-md w-full space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Key className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">Acesso Restrito</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Área exclusiva para a Dra. Kaline e equipe clínica autorizada.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: admin"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9"
                      autoFocus
                      required
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Senha de Administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9 pr-10"
                      required
                    />
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                      title={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <p className="text-rose-700 text-xs font-medium">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Validando no Banco...</span>
                    </>
                  ) : (
                    <span>Entrar no Painel</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-stone-500">
                    Credenciais salvas no banco de dados MySQL.
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Acesso inicial padrão: usuário <strong className="text-stone-700 font-mono">admin</strong> / senha <strong className="text-stone-700 font-mono">admin</strong>
                  </p>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Main Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-stone-50 border-r border-stone-200 p-4 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-visible">
              <div className="space-y-1.5 flex md:flex-col gap-1 md:gap-0">
                
                <button
                  onClick={() => { setActiveTab('appointments'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'appointments'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Agendamentos</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full">
                    {appointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'clients'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Histórico de Clientes</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full">
                    {clients.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('procedures'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'procedures'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Cuidados & Tratamentos</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full">
                    {proceduresList.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('content'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Slides & Conteúdos</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full">
                    {slides.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('whatsapp'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'whatsapp'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp & Endereço</span>
                </button>

                <button
                  onClick={() => { setActiveTab('users'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Usuários & Senhas</span>
                  <span className="ml-auto text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full">
                    {adminUsers.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('database'); setSelectedClient(null); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'database'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Banco de Dados</span>
                  {dbConfig.connected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto" />
                  )}
                </button>

              </div>

              {/* Clinic mini badge */}
              <div className="hidden md:block p-3 bg-white rounded-2xl border border-stone-200 text-[11px] text-stone-500">
                <span className="font-bold text-stone-800 block">Status da Persistência</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  ● {dbConfig.provider}
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
              
              {/* TAB 1: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Gestão de Agendamentos
                      </h3>
                      <p className="text-xs text-stone-500">
                        Controle de novas solicitações, confirmação e lembretes automáticos
                      </p>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                      {['all', 'pendente', 'confirmado', 'realizado', 'cancelado'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setAppointmentFilter(st)}
                          className={`px-3 py-1.5 rounded-full capitalize font-medium transition-colors cursor-pointer ${
                            appointmentFilter === st
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st === 'all' ? 'Todos' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 text-stone-400 space-y-2">
                      <Calendar className="w-10 h-10 mx-auto stroke-1" />
                      <p className="text-xs">Nenhum agendamento com este filtro.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 shadow-2xs hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-stone-900">{apt.clientName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  apt.status === 'confirmado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : apt.status === 'pendente'
                                    ? 'bg-amber-100 text-amber-800'
                                    : apt.status === 'realizado'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </div>

                            <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                              <span className="font-semibold text-amber-900">{apt.procedureTitle}</span>
                              <span>•</span>
                              <span className="font-medium text-stone-800">
                                📅 {apt.date} às {apt.time}
                              </span>
                              <span>•</span>
                              <span className="text-stone-500">📞 {apt.clientPhone}</span>
                            </div>

                            {apt.notes && (
                              <p className="text-xs text-stone-500 italic bg-white p-2 rounded-lg border border-stone-200/60 max-w-xl">
                                Obs: "{apt.notes}"
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* WhatsApp Reminder Direct */}
                            <a
                              href={generateWhatsAppReminderUrl(apt)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
                              title="Enviar confirmação e lembrete pelo WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Push Reminder */}
                            <button
                              onClick={() => handleSendReminderPush(apt)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Disparar notificação push imediata"
                            >
                              <Bell className="w-3.5 h-3.5 text-amber-700" />
                              <span>Lembrete Push</span>
                            </button>

                            {/* Change status dropdown */}
                            <select
                              value={apt.status}
                              onChange={(e) => handleUpdateStatus(apt.id, e.target.value as any)}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
                            >
                              <option value="pendente">Pendente</option>
                              <option value="confirmado">Confirmar</option>
                              <option value="realizado">Realizado</option>
                              <option value="cancelado">Cancelar</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CLIENT HISTORY & CLINICAL RECORDS */}
              {activeTab === 'clients' && (
                <div className="space-y-6">
                  
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Prontuários & Histórico dos Clientes
                      </h3>
                      <p className="text-xs text-stone-500">
                        Registro de evolução facial, lotes de produtos utilizados e histórico de retornos
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, telefone ou CPF..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-700 w-64"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddClientModal(true)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Paciente</span>
                      </button>
                    </div>
                  </div>

                  {/* If a client is selected, show detail drawer */}
                  {selectedClient ? (
                    <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-6 animate-in slide-in-from-right-4 duration-200">
                      
                      <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                        <div>
                          <button
                            onClick={() => setSelectedClient(null)}
                            className="text-xs text-amber-800 hover:underline mb-2 block font-medium"
                          >
                            ← Voltar para lista de clientes
                          </button>
                          <h4 className="font-serif text-2xl font-bold text-stone-900">
                            {selectedClient.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                            <span>📞 {selectedClient.phone}</span>
                            <span>•</span>
                            <span>✉️ {selectedClient.email}</span>
                            {selectedClient.birthDate && (
                              <>
                                <span>•</span>
                                <span>🎂 Nascimento: {selectedClient.birthDate}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="font-semibold text-stone-800">
                              Visitas: {selectedClient.totalVisits}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowAddProcedureHistory(true)}
                          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Registrar Procedimento</span>
                        </button>
                      </div>

                      {/* Anamnesis and Notes Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 space-y-1">
                          <span className="font-bold text-stone-800 block">Alergias & Sensibilidades:</span>
                          <p className="text-stone-600">{selectedClient.allergies || 'Nenhuma informada'}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 space-y-1">
                          <span className="font-bold text-stone-800 block">Objetivos Estéticos:</span>
                          <p className="text-stone-600">{selectedClient.aestheticGoals || 'Rejuvenescimento e contorno'}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 space-y-1">
                          <span className="font-bold text-stone-800 block">Anotações Médicas:</span>
                          <p className="text-stone-600">{selectedClient.medicalNotes || 'Paciente com ótima aderência aos cuidados.'}</p>
                        </div>
                      </div>

                      {/* Procedure History Timeline */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-amber-700" />
                          <span>Histórico de Procedimentos Realizados</span>
                        </h5>

                        {(!selectedClient.history || selectedClient.history.length === 0) ? (
                          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                            Nenhum procedimento registrado ainda neste prontuário.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedClient.history.map((hist) => (
                              <div
                                key={hist.id}
                                className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-stone-900">{hist.procedure}</span>
                                    <span className="text-[11px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                                      {hist.productUsed}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-stone-500 flex items-center gap-2">
                                    <span>📅 Realizado em: {hist.date}</span>
                                    {hist.returnDate && (
                                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                                        Retorno: {hist.returnDate}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                  <p>{hist.notes}</p>
                                  {hist.lotNumber && (
                                    <span className="block text-[10px] text-stone-400 font-mono mt-1">
                                      Lote rastreável: {hist.lotNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Clients Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredClients.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedClient(c)}
                          className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 hover:border-amber-700/50 hover:bg-amber-50/20 shadow-2xs transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-sm text-stone-900">{c.name}</h4>
                                <p className="text-xs text-stone-500 mt-0.5">{c.phone}</p>
                              </div>
                              <span className="text-[10px] bg-white font-bold text-stone-700 px-2 py-1 rounded-full border border-stone-200 shadow-2xs">
                                {c.totalVisits || (c.history?.length || 1)} consultas
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 mt-2 line-clamp-2 italic">
                              "{c.aestheticGoals || 'Acompanhamento preventivo'}"
                            </p>
                          </div>

                          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs text-amber-900 font-semibold">
                            <span>Ver Prontuário Completo</span>
                            <span>→</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CONTENT MANAGEMENT (DOCTOR PHOTO & CLINIC ASSETS) */}
              {activeTab === 'content' && (
                <div className="space-y-8">

                  {/* Top Carousel Hero Slides (MySQL persistence) */}
                  <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#aa907d]/20 text-[#aa907d] flex items-center justify-center font-bold shrink-0">
                          <SlidersHorizontal className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            Sincronizado no Banco MySQL
                          </div>
                          <h4 className="font-serif text-lg font-bold text-stone-900">
                            Slides do Carrossel do Topo
                          </h4>
                          <p className="text-xs text-stone-500">
                            Tempo de 30 segundos por slide. No mobile, as fotos contam com enquadramento otimizado e transição suave da direita para a esquerda.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlideForEdit(null);
                          setShowEditSlideModal(true);
                        }}
                        className="px-4 py-2.5 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Slide</span>
                      </button>
                    </div>

                    {/* Slides Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slides.map((s, index) => (
                        <div 
                          key={s.id} 
                          className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                            s.isActive !== false 
                              ? 'border-stone-200 bg-stone-50/50 hover:border-[#aa907d]/60 shadow-xs' 
                              : 'border-dashed border-stone-300 bg-stone-100/60 opacity-60'
                          }`}
                        >
                          {/* Image preview with dark gradient */}
                          <div className="relative h-36 w-full bg-stone-900 overflow-hidden">
                            <img
                              src={s.imageUrl}
                              alt={s.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                            
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                                #{s.order ?? index + 1}
                              </span>
                              {s.badge && (
                                <span className="px-2 py-0.5 rounded-md bg-[#aa907d]/80 text-[#f4f3eb] text-[10px] font-bold">
                                  {s.badge}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-3 right-3">
                              <button
                                type="button"
                                onClick={() => handleToggleSlideActive(s)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer ${
                                  s.isActive !== false
                                    ? 'bg-emerald-500/90 text-white'
                                    : 'bg-stone-600/90 text-stone-200'
                                }`}
                                title="Ativar ou desativar visibilidade deste slide"
                              >
                                {s.isActive !== false ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    <span>Ativo</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    <span>Oculto</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3">
                              <h5 className="font-serif text-sm font-bold text-white line-clamp-1">
                                {s.title}
                              </h5>
                              {s.quote && (
                                <p className="text-[11px] text-[#c9bcad] italic line-clamp-1">
                                  {s.quote}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Content summary */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-xs text-stone-600 line-clamp-2">
                                {s.subtitle || 'Sem descrição cadastrada.'}
                              </p>
                              
                              {/* Mobile Status Tag */}
                              <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/80 text-[11px]">
                                <Smartphone className="w-3.5 h-3.5 text-[#aa907d] shrink-0" />
                                {s.mobileImageUrl ? (
                                  <span className="text-stone-700 truncate">
                                    <strong className="font-semibold text-emerald-800">Foto Mobile ativa</strong>
                                    {s.mobileSubtitle ? ` • “${s.mobileSubtitle.slice(0, 32)}...”` : ' • Msg padrão'}
                                  </span>
                                ) : (
                                  <span className="text-stone-500 truncate">
                                    <span className="text-stone-600">Mobile:</span> Usa imagem do desktop
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                              <span className="font-medium">Botão 1: {s.ctaText || 'Agendar Consulta'}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSlideForEdit(s);
                                    setShowEditSlideModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3 h-3 text-amber-300" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSlideToDelete(s)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuidados & Procedimentos Quick Access inside Content Tab */}
                  <div className="p-6 bg-gradient-to-br from-[#faf8f5] to-white rounded-3xl border border-[#aa907d]/30 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#aa907d]/10 border border-[#aa907d]/30 flex items-center justify-center text-[#aa907d] shrink-0 shadow-xs">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Vitrine de Cuidados & Procedimentos
                          </div>
                          <h4 className="font-serif text-base font-bold text-stone-900">
                            Tratamentos ({proceduresList.length} cadastrados)
                          </h4>
                          <p className="text-xs text-stone-500">
                            Edite textos, títulos, descrições e fotos de cada tratamento exibido no site.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProcedureForEdit(null);
                            setShowEditProcedureModal(true);
                          }}
                          className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Novo Tratamento</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('procedures')}
                          className="px-4 py-2.5 bg-[#aa907d] hover:bg-[#967e6d] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Gerenciar Tratamentos</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Logo (Transparent PNG) Card */}
                  <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-24 h-16 rounded-2xl overflow-hidden border border-stone-300 bg-[#f4f3eb] flex items-center justify-center shrink-0 shadow-2xs relative p-2"
                          style={{
                            backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.04) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.04) 75%)',
                            backgroundSize: '12px 12px',
                            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                          }}
                        >
                          {clinicLogo ? (
                            <img
                              src={clinicLogo}
                              alt="Logo Atual"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 text-stone-400">
                              <span className="w-6 h-6 rounded-full bg-[#aa907d] text-white flex items-center justify-center font-serif text-xs font-bold">K</span>
                              <span className="text-[10px] font-semibold text-stone-600">Padrão</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                            {clinicLogo ? 'Logo Personalizada Ativa' : 'Logotipo Tipográfico Padrão'}
                          </div>
                          <h4 className="font-serif text-base font-bold text-stone-900">
                            Logo do Site (PNG Transparente)
                          </h4>
                          <p className="text-xs text-stone-500 max-w-lg">
                            Insira sua logomarca em formato PNG sem fundo para ser exibida no cabeçalho e rodapé do site. Salva no banco de dados e sincronizada em tempo real.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {clinicLogo && (
                          <button
                            type="button"
                            onClick={() => {
                              storageService.saveClinicLogo('');
                              setClinicLogo('');
                              onDataChanged();
                            }}
                            className="px-3.5 py-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-stone-200"
                            title="Remover logo personalizada e voltar ao padrão tipográfico"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar Padrão</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowChangeLogoModal(true)}
                          className="px-4 py-2.5 bg-[#aa907d] hover:bg-[#967e6c] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{clinicLogo ? 'Alterar Logo (PNG)' : 'Inserir Logo (PNG)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Featured Photo Card */}
                  <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 rounded-2xl overflow-hidden border-2 border-stone-800 bg-stone-100 shrink-0 shadow-xs relative">
                          <img
                            src={doctorPhoto}
                            alt="Foto Dra. Kaline"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/foto-1-destaque.svg';
                            }}
                          />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Foto Principal
                          </div>
                          <h4 className="font-serif text-base font-bold text-stone-900">
                            Foto da Dra. Kaline (Início e Sobre)
                          </h4>
                          <p className="text-xs text-stone-500">
                            Altere a qualquer momento via upload do seu computador, link ou foto de alta resolução.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowChangePhotoModal(true)}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto"
                      >
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Alterar Foto Principal</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Direct Settings within Content */}
                  {renderWhatsappCard(false)}

                </div>
              )}

              {/* TAB: CUIDADOS & PROCEDIMENTOS / TRATAMENTOS */}
              {activeTab === 'procedures' && (
                <div className="space-y-6">
                  
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Cuidados & Procedimentos
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Tratamentos
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Edite fotos, textos, descrições, durações e benefícios de todos os tratamentos. As alterações são sincronizadas no MySQL e aparecem instantaneamente no site.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProcedureForEdit(null);
                        setShowEditProcedureModal(true);
                      }}
                      className="px-4 py-2.5 bg-[#aa907d] hover:bg-[#967e6d] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Tratamento</span>
                    </button>
                  </div>

                  {/* Procedures Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proceduresList.map((proc) => (
                      <div
                        key={proc.id}
                        className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-[#aa907d] hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                      >
                        {/* Procedure Image */}
                        <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                          <img
                            src={proc.imageUrl}
                            alt={proc.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = '/uploads/tricoscopia.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20 capitalize">
                              {proc.category || 'Capilar'}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              {proc.popular && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-xs">
                                  Destaque
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-[10px] font-medium text-white border border-white/20">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {proc.duration}
                              </span>
                            </div>
                          </div>

                          {/* Quick Edit Overlay Button on Hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProcedureForEdit(proc);
                                setEditProcedureInitialTab('image');
                                setShowEditProcedureModal(true);
                              }}
                              className="px-4 py-2 bg-white text-stone-900 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-amber-50 cursor-pointer transition-all transform group-hover:scale-105"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-600" />
                              <span>Editar Foto & Texto</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h4 className="font-serif text-base font-bold text-stone-900 leading-snug line-clamp-2">
                              {proc.title}
                            </h4>
                            {proc.subtitle && (
                              <p className="text-xs text-amber-800 font-medium line-clamp-1">
                                {proc.subtitle}
                              </p>
                            )}
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mt-1">
                              {proc.description}
                            </p>
                          </div>

                          {/* Benefits preview */}
                          {proc.benefits && proc.benefits.length > 0 && (
                            <div className="pt-2 border-t border-stone-100 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                {proc.benefits.length} Diferenciais Cadastrados
                              </span>
                              <p className="text-[11px] text-stone-600 line-clamp-1">
                                ✓ {proc.benefits[0]}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProcedureForEdit(proc);
                                setEditProcedureInitialTab('text');
                                setShowEditProcedureModal(true);
                              }}
                              className="flex-1 py-2 px-3 bg-stone-100 hover:bg-[#aa907d] hover:text-white text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Editar Procedimento</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setProcedureToDelete(proc)}
                              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Excluir tratamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB: WHATSAPP DO SITE */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Comunicação & Localização
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Canais de Contato & Endereço Físico
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Gerencie o número oficial de WhatsApp para atendimento direto e o endereço físico do consultório exibido em todo o site.
                      </p>
                    </div>
                  </div>

                  {renderWhatsappCard(true)}
                  {renderAddressCard()}
                </div>
              )}

              {/* TAB: GERENCIAMENTO DE USUÁRIOS, LOGIN E SENHA (GRAVADO NO BANCO) */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Segurança & Credenciais do Banco
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Usuários, Logins & Senhas
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Altere o login e senha existentes ou cadastre novos acessos. Todas as informações são persistidas no banco de dados MySQL na tabela <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[11px] text-stone-800">admin_users</code>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForEdit(null);
                        setShowEditUserModal(true);
                      }}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Adicionar Novo Usuário</span>
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {userSuccessMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{userSuccessMessage}</span>
                    </div>
                  )}

                  {userErrorMessage && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-medium">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{userErrorMessage}</span>
                    </div>
                  )}

                  {/* Security Notice Card */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-amber-950 space-y-1 leading-relaxed">
                      <h4 className="font-bold">Acesso Restrito Obrigatório por Login e Senha</h4>
                      <p className="text-stone-600 text-[11px]">
                        O acesso rápido de demonstração foi permanentemente removido. Qualquer administrador aqui listado tem autorização para gerenciar consultas, prontuários de pacientes e configurações clínicas. As alterações de senha e novos usuários cadastrados são gravados com efeito imediato.
                      </p>
                    </div>
                  </div>

                  {/* Users Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminUsers.map((u) => {
                      const isRevealed = Boolean(showPasswordMap[u.id]);
                      return (
                        <div
                          key={u.id}
                          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-[#aa907d]/15 border border-[#aa907d]/30 text-[#604938] flex items-center justify-center font-bold text-sm font-serif">
                                {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-stone-900 text-sm">{u.name || u.username}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                    @{u.username}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    {u.role || 'Administrador'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Delete button (disabled if single user) */}
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              disabled={adminUsers.length <= 1}
                              title={adminUsers.length <= 1 ? "Mínimo de 1 administrador necessário" : "Excluir usuário"}
                              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Credentials Details Box */}
                          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 text-[11px] font-medium flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-stone-400" />
                                Login:
                              </span>
                              <span className="font-mono font-bold text-stone-900">{u.username}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60">
                              <span className="text-stone-500 text-[11px] font-medium flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                                Senha:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-800 font-semibold">
                                  {isRevealed ? (u.password || '••••••••') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowPasswordMap(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                                  title={isRevealed ? "Ocultar senha" : "Ver senha"}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {u.createdAt && (
                              <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-400">
                                <span>Cadastrado em:</span>
                                <span>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button: Edit Login and Password */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setShowEditUserModal(true);
                              }}
                              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                              <span>Alterar Login ou Senha</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fast Action Guidance */}
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Total de <strong>{adminUsers.length}</strong> usuário(s) com credenciais ativas no banco.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForEdit(null);
                        setShowEditUserModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      + Cadastrar Outro Login
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DATABASE CONFIGURATION */}
              {activeTab === 'database' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-stone-900">
                        Banco de Dados MySQL Conectado
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Armazenamento relacional e prontuários médicos da Dra. Kaline em tempo real
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshDbStatus}
                      disabled={isCheckingDb}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      title="Sincronizar e re-verificar tabelas"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isCheckingDb ? 'animate-spin' : ''}`} />
                      <span>{isCheckingDb ? 'Verificando...' : 'Sincronizar Tabelas'}</span>
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                            <span>MySQL Database Cloud</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Conectado e Ativo
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-mono">
                            Host: {dbConfig.host || '69.49.241.41'} • Base: {dbConfig.database || 'kebers41_dra_kalline'} • Porta: 3306
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs text-stone-600 font-mono text-[11px] break-all">
                      <span className="text-stone-400 select-none">URL: </span>
                      {dbConfig.connectionStringMasked || 'mysql://kebers41_kebers41:***@69.49.241.41:3306/kebers41_dra_kalline'}
                    </div>

                    {dbSuccessMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{dbSuccessMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Tables Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                      Tabelas Criadas no MySQL ({Object.keys(dbConfig.allTables || {}).length || 9} tabelas ativas):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { name: 'appointments', label: 'Agendamentos', count: dbConfig.recordsCount?.appointments ?? appointments.length, desc: 'Consultas & status' },
                        { name: 'clients', label: 'Pacientes', count: dbConfig.recordsCount?.clients ?? clients.length, desc: 'Cadastro & dados médicos' },
                        { name: 'client_procedure_history', label: 'Prontuário', count: dbConfig.recordsCount?.history ?? 2, desc: 'Lotes, produtos e retornos' },
                        { name: 'procedures', label: 'Procedimentos', count: dbConfig.recordsCount?.procedures ?? 4, desc: 'Protocolos e durações' },
                        { name: 'gallery_posts', label: 'Galeria & Insta', count: dbConfig.recordsCount?.gallery ?? gallery.length, desc: 'Fotos e destaques' },
                        { name: 'blog_posts', label: 'Artigos / Cuidados', count: dbConfig.recordsCount?.posts ?? blogPosts.length, desc: 'Orientações pós' },
                        { name: 'testimonials', label: 'Depoimentos', count: dbConfig.recordsCount?.testimonials ?? 3, desc: 'Avaliações com nota' },
                        { name: 'notifications', label: 'Notificações', count: dbConfig.recordsCount?.notifications ?? 0, desc: 'Alertas e lembretes' },
                        { name: 'clinic_settings', label: 'Configurações', count: 6, desc: 'Dados e contatos' },
                        { name: 'admin_users', label: 'Usuários & Acesso', count: dbConfig.recordsCount?.adminUsers ?? adminUsers.length, desc: 'Logins e senhas no MySQL' }
                      ].map((tbl) => (
                        <div key={tbl.name} className="p-3 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-semibold text-stone-900 text-xs">{tbl.name}</span>
                            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px] rounded-full">
                              {tbl.count} {tbl.count === 1 ? 'linha' : 'linhas'}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-stone-600">{tbl.label}</span>
                          <span className="text-[10px] text-stone-400 mt-0.5">{tbl.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Backup */}
                  <div className="p-5 bg-white rounded-3xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-stone-900">Backup dos Dados</p>
                      <p className="text-[11px] text-stone-500">Exporte um snapshot de segurança dos prontuários e agendamentos</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4 text-stone-600" />
                      <span>Baixar Backup (JSON)</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* SUB-MODAL 1: Add Procedure to Client History */}
      {showAddProcedureHistory && selectedClient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Registrar Procedimento no Prontuário
              </h4>
              <button onClick={() => setShowAddProcedureHistory(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddProcedureToHistory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Procedimento:</label>
                <input
                  type="text"
                  required
                  value={newHistProcedure}
                  onChange={(e) => setNewHistProcedure(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  placeholder="ex: Toxina Botulínica ou Preenchimento Labial"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Produto / Marca:</label>
                  <input
                    type="text"
                    required
                    value={newHistProduct}
                    onChange={(e) => setNewHistProduct(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    placeholder="ex: Juvederm Volift 1ml"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Lote Rastreável:</label>
                  <input
                    type="text"
                    required
                    value={newHistLot}
                    onChange={(e) => setNewHistLot(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Data de Realização:</label>
                  <input
                    type="date"
                    required
                    value={newHistDate}
                    onChange={(e) => setNewHistDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Data de Retorno Prevista:</label>
                  <input
                    type="date"
                    value={newHistReturn}
                    onChange={(e) => setNewHistReturn(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Anotações Clínicas & Vetores:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Quantidade de unidades, técnica empregada (agulha/cânula), recomendações dadas..."
                  value={newHistNotes}
                  onChange={(e) => setNewHistNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProcedureHistory(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold"
                >
                  Salvar no Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Add New Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-serif text-lg font-bold text-stone-900">Novo Paciente</h4>
              <button onClick={() => setShowAddClientModal(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={newCliName}
                  onChange={(e) => setNewCliName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Telefone / WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    placeholder="(84) 99999-9999"
                    value={newCliPhone}
                    onChange={(e) => setNewCliPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Data Nascimento:</label>
                  <input
                    type="date"
                    value={newCliBirthDate}
                    onChange={(e) => setNewCliBirthDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">E-mail:</label>
                <input
                  type="email"
                  value={newCliEmail}
                  onChange={(e) => setNewCliEmail(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Alergias ou Cuidados Especiais:</label>
                <input
                  type="text"
                  value={newCliAllergies}
                  onChange={(e) => setNewCliAllergies(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Objetivos / Queixas Principais:</label>
                <textarea
                  rows={2}
                  value={newCliGoals}
                  onChange={(e) => setNewCliGoals(e.target.value)}
                  placeholder="ex: Suavizar pés de galinha e volumizar lábio superior"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold"
                >
                  Cadastrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 5: Change Doctor Photo */}
      <ChangePhotoModal
        isOpen={showChangePhotoModal}
        onClose={() => setShowChangePhotoModal(false)}
        onPhotoChanged={(newUrl) => {
          setDoctorPhoto(newUrl);
          onDataChanged();
        }}
      />

      {/* SUB-MODAL 5.5: Change Transparent Clinic Logo */}
      <ChangeLogoModal
        isOpen={showChangeLogoModal}
        onClose={() => setShowChangeLogoModal(false)}
        onLogoChanged={(newLogo) => {
          setClinicLogo(newLogo);
          onDataChanged();
        }}
      />

      {/* SUB-MODAL 6: Edit Hero Slide (MySQL DB) */}
      <EditSlideModal
        isOpen={showEditSlideModal}
        slide={selectedSlideForEdit}
        onClose={() => setShowEditSlideModal(false)}
        onSave={handleSaveSlideAdmin}
        onDelete={handleDeleteSlideAdmin}
      />

      {/* SUB-MODAL 7: Edit Procedure (Cuidados & Procedimentos / Tratamentos) */}
      <EditProcedureModal
        isOpen={showEditProcedureModal}
        procedure={selectedProcedureForEdit}
        initialTab={editProcedureInitialTab}
        onClose={() => setShowEditProcedureModal(false)}
        onSave={handleSaveProcedureAdmin}
        onDelete={handleDeleteProcedureAdmin}
      />

      {/* Confirmation Modal: Delete Procedure */}
      {procedureToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Excluir Tratamento?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tem certeza que deseja remover o tratamento <strong className="text-stone-900">"{procedureToDelete.title}"</strong>?
              </p>
              <p className="text-[11px] text-stone-400">
                Esta ação removerá o procedimento da vitrine do site e sincronizará a alteração no banco de dados.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProcedure}
                onClick={() => setProcedureToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingProcedure}
                onClick={async () => {
                  await handleDeleteProcedureAdmin(procedureToDelete.id);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingProcedure ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Hero Slide */}
      {slideToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Excluir Slide do Topo?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Deseja excluir o slide <strong className="text-stone-900">"{slideToDelete.title || 'Slide de Destaque'}"</strong>?
              </p>
              <p className="text-[11px] text-stone-400">
                O slide será removido do carrossel principal e do banco de dados.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingSlide}
                onClick={() => setSlideToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingSlide}
                onClick={async () => {
                  await handleDeleteSlideAdmin(slideToDelete.id);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingSlide ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 8: Edit/Add Admin User (Login & Senha no Banco) */}
      <EditUserModal
        isOpen={showEditUserModal}
        user={selectedUserForEdit}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUserForEdit(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Confirmation Modal: Delete Admin User */}
      {userToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Excluir Usuário de Acesso?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tem certeza que deseja excluir o acesso de <strong className="text-stone-900">@{userToDelete.username}</strong> ({userToDelete.name || 'Administrador'})?
              </p>
              <p className="text-[11px] text-stone-400">
                Este login será removido do banco de dados e não terá mais acesso ao painel de administração.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => handleDeleteUser(userToDelete)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingUser ? 'Excluindo...' : 'Sim, Excluir do Banco'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
