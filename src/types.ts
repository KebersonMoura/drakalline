export type ProcedureCategory = 
  | 'capilar'
  | 'facial'
  | 'rejuvenescimento'
  | 'corporal_pescoco'
  | 'corporal'
  | 'cuidados_pele';

export interface Procedure {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ProcedureCategory;
  duration: string;
  downtime: string;
  idealFor: string[];
  benefits: string[];
  imageUrl: string;
  popular?: boolean;
  faq: { question: string; answer: string }[];
}

export interface InstagramPost {
  id: string;
  instagramUrl: string;
  imageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  procedureTag: string;
  date: string;
  isVideo?: boolean;
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'realizado' | 'cancelado';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  procedureId: string;
  procedureTitle: string;
  date: string;
  time: string;
  notes?: string;
  status: AppointmentStatus;
  reminderSent: boolean;
  createdAt: string;
}

export interface ProcedureHistoryItem {
  id: string;
  date: string;
  procedure: string;
  productUsed?: string;
  lotNumber?: string;
  notes: string;
  returnDate?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate?: string;
  cpf?: string;
  firstVisitDate: string;
  totalVisits: number;
  allergies?: string;
  contraindications?: string;
  aestheticGoals?: string;
  medicalNotes?: string;
  history: ProcedureHistoryItem[];
  beforeAfterPhotos?: string[];
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown or formatted text
  category: string;
  readTime: string;
  publishedAt: string;
  coverImage: string;
  keyCareTips: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  age?: number;
  location?: string;
  procedure: string;
  comment: string;
  rating: number;
  date: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  provider: 'Local Storage / Mock Postgres' | 'PostgreSQL (Cloud / Externo)' | 'MySQL Cloud / Externo' | string;
  connectionStringMasked?: string;
  host?: string;
  database?: string;
  lastSync?: string;
  recordsCount: {
    clients: number;
    appointments: number;
    posts: number;
    gallery: number;
    procedures?: number;
    testimonials?: number;
    notifications?: number;
    history?: number;
    adminUsers?: number;
  };
  allTables?: Record<string, number>;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  quote?: string;
  imageUrl: string;
  // Mobile-specific customizations
  mobileImageUrl?: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'Administrador' | 'Médica' | 'Recepção' | string;
  createdAt?: string;
  updatedAt?: string;
}
