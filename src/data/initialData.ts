import { Procedure, InstagramPost, Testimonial, BlogPost, ClientRecord, Appointment, HeroSlide } from '../types';

export const CLINIC_INFO = {
  name: 'Dra. Kaline',
  title: 'Especialista em Saúde e Restauração Capilar',
  subtitle: 'Especialista em saúde e restauração capilar',
  tagline: 'Para um diagnóstico preciso',
  crm: 'CRM Médico • Restauração Capilar',
  instagramHandle: 'dra_kaline',
  instagramUrl: 'https://www.instagram.com/dra_kaline/',
  whatsappNumber: '5584996421034',
  whatsappDisplay: '(84) 99642-1034',
  address: 'Av. Hermes da Fonseca, 1144 - Tirol | Centro Médico Integrado',
  city: 'Natal - RN',
  openingHours: 'Segunda a Sexta: 08:30 às 18:30 | Consultas com hora marcada',
  heroImage: '/images/foto-1-destaque.svg',
  doctorPhoto: '/images/foto-1-destaque.svg',
  clinicPhoto: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  bio: 'Especialista em saúde e restauração capilar, fundamenta sua prática clínica no princípio de que todo tratamento de excelência parte de um diagnóstico preciso. Com tecnologia de tricoscopia digital de alta resolução e visão médica integral, desenvolve planos terapêuticos personalizados e baseados em evidências científicas.'
};

export const INITIAL_PROCEDURES: Procedure[] = [
  {
    id: 'tricoscopia-digital',
    title: 'Tricoscopia Digital & Diagnóstico Capilar',
    subtitle: 'Exame de alta precisão para identificar as reais causas da queda capilar',
    description: 'Avaliação dermatoscópica computadorizada dos fios e couro cabeludo. Permite analisar densidade folicular, espessura dos fios, sinais inflamatórios e miniaturização, viabilizando um diagnóstico preciso.',
    category: 'facial',
    duration: '60 minutos',
    downtime: 'Sem downtime (exame não invasivo)',
    popular: true,
    idealFor: ['Queda acentuada de cabelo', 'Afinamento dos fios e entradas', 'Suspeita de calvície (alopecia)', 'Descamação, dor ou coceira no couro cabeludo'],
    benefits: [
      'Diagnóstico médico preciso e precoce',
      'Mapeamento fotográfico para acompanhamento de evolução',
      'Identificação da causa raiz da queda capilar',
      'Direcionamento de tratamento personalizado'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    faq: [
      { question: 'Como é feita a tricoscopia?', answer: 'Com uma lente de aumento dermatoscópica digital conectada ao monitor, avaliamos folículo a folículo em alta ampliação de forma indolor.' },
      { question: 'Preciso de preparo antes do exame?', answer: 'Recomendamos estar com os cabelos limpos e sem uso de produtos tópicos ou maquiagens capilares no dia da consulta.' }
    ]
  },
  {
    id: 'transplante-capilar',
    title: 'Transplante Capilar (Técnica FUE)',
    subtitle: 'Restauração definitiva com aspecto natural e preservação da área doadora',
    description: 'Cirurgia de restauração capilar minimamente invasiva onde os folículos são extraídos individualmente e implantados respeitando o ângulo, densidade e linha frontal natural do paciente.',
    category: 'facial',
    duration: 'Procedimento de 6 a 8 horas',
    downtime: 'Retorno às atividades leves em 3 a 5 dias',
    popular: true,
    idealFor: ['Calvície masculina e feminina avançada', 'Recuo da linha capilar e entradas', 'Falhas na barba ou sobrancelhas', 'Cicatrizes no couro cabeludo'],
    benefits: [
      'Cabelos definitivos e naturais',
      'Sem cicatriz linear visível (técnica FUE fio a fio)',
      'Linha anterior projetada com naturalidade anatômica',
      'Acompanhamento pré e pós-operatório completo'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    faq: [
      { question: 'O cabelo transplantado volta a cair?', answer: 'Os folículos retirados da área doadora posterior são geneticamente resistentes à calvície e permanecem crescendo ao longo da vida.' },
      { question: 'Quando vejo os primeiros resultados?', answer: 'Os fios começam a nascer a partir do 3º mês, com resultado maduro e denso entre 9 e 12 meses.' }
    ]
  },
  {
    id: 'mmp-capilar',
    title: 'MMP® Capilar & Microinfusão de Medicamentos',
    subtitle: 'Aplicação direta de ativos estéreis na raiz do folículo piloso',
    description: 'Técnica médica que utiliza microagulhamento controlado para infundir fatores de crescimento, vitaminas e medicações específicas diretamente na derme onde se localizam as raízes dos fios.',
    category: 'rejuvenescimento',
    duration: '45 minutos',
    downtime: 'Sem repouso (lavagem liberada em 24h)',
    popular: true,
    idealFor: ['Alopécia androgenética (calvície)', 'Eflúvio telógeno persistente', 'Fios enfraquecidos e desvitalizados', 'Estímulo pré e pós-transplante'],
    benefits: [
      'Ação direta no bulbo capilar com alta absorção',
      'Freia a queda e estimula novos fios em crescimento',
      'Espessamento do calibre da haste capilar',
      'Procedimento realizado com anestesia local confortável'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f41b2a926a5?auto=format&fit=crop&w=800&q=80',
    faq: [
      { question: 'Quantas sessões são indicadas?', answer: 'Em média de 3 a 6 sessões mensais, ajustadas de acordo com o diagnóstico na tricoscopia.' }
    ]
  },
  {
    id: 'terapia-laser',
    title: 'Fotobioestimulação & Lasers Capilares',
    subtitle: 'Energia luminosa para ativar a circulação e metabolismo folicular',
    description: 'Uso de luzes e lasers de baixa intensidade (LLLT) para aumentar a oxigenação celular no couro cabeludo, reduzir a inflamação folicular e acelerar a transição dos fios para a fase de crescimento.',
    category: 'rejuvenescimento',
    duration: '30 minutos',
    downtime: 'Zero (indolor e relaxante)',
    idealFor: ['Queda pós-estresse ou pós-parto', 'Dermatite seborreica do couro cabeludo', 'Recuperação pós-cirúrgica capilar', 'Potencialização de tratamentos clínicos'],
    benefits: [
      'Estímulo da microcirculação local',
      'Ação anti-inflamatória no couro cabeludo',
      'Melhora a nutrição e brilho dos fios',
      'Procedimento seguro, indolor e sem contraindicações graves'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    faq: [
      { question: 'Dói ou esquenta?', answer: 'Não. É uma luz fria extremamente confortável e sem desconforto térmico.' }
    ]
  },
  {
    id: 'dermatologia-clinica',
    title: 'Dermatologia Clínica & Saúde da Pele',
    subtitle: 'Diagnóstico e condutas médicas para saúde cutânea integral',
    description: 'Atendimento médico dermatológico focado no diagnóstico e tratamento de doenças da pele, couro cabeludo e unhas, além de prevenção e cuidados individualizados.',
    category: 'facial',
    duration: '45 minutos',
    downtime: 'Sem downtime',
    popular: false,
    idealFor: ['Dermatites e psoríase', 'Acne e rosácea', 'Manchas e melasma', 'Prevenção e check-up dermatológico'],
    benefits: [
      'Avaliação médica minuciosa da barreira cutânea',
      'Prescrição de rotinas médicas eficientes',
      'Diagnóstico de lesões de pele',
      'Cuidado humanizado e individualizado'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    faq: [
      { question: 'A consulta inclui prescrição completa?', answer: 'Sim, a conduta inclui orientação médica, prescrição de manipulados ou medicamentos industriais e acompanhamento.' }
    ]
  }
];

export const INITIAL_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-1-destaque.svg',
    caption: 'Dra. Kaline — Especialista em Saúde e Restauração Capilar. "Para um diagnóstico preciso", fundamentado em tricoscopia digital de alta resolução, avaliação microscópica e conduta médica individualizada. 🩺🔬🤍 #dra_kaline #destaque #restauracaocapilar #diagnostico',
    likes: 1420,
    commentsCount: 98,
    procedureTag: 'Destaque Principal',
    date: 'Destaque'
  },
  {
    id: 'post-2',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-2-uti.svg',
    caption: 'Essa foto foi tirada durante um plantão na UTI. Ela me faz lembrar de algo importante: a medicina é vocação, presença humana e compromisso inegociável com a vida de cada paciente. 🏥🩺 #dra_kaline #medicina #trajetoria #cuidado',
    likes: 980,
    commentsCount: 76,
    procedureTag: 'Plantão na UTI',
    date: 'Recente'
  },
  {
    id: 'post-3',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-3-autoestima.svg',
    caption: 'Porque autoestima também é saúde. E toda mulher merece informação médica de verdade. Quando recuperamos a densidade e o vigor dos fios, devolvemos a confiança diária. ✨💆‍♀️ #dra_kaline #autoestima #saudecapilar',
    likes: 1140,
    commentsCount: 84,
    procedureTag: 'Autoestima é Saúde',
    date: 'Recente'
  },
  {
    id: 'post-4',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-4-meu-trabalho.svg',
    caption: 'MEU TRABALHO NÃO É INDICAR UM PROCEDIMENTO. É entender o seu caso e definir qual caminho faz sentido para você. Tratamentos capilares devem ser sob medida, baseados na ciência e na sua real necessidade. 🧬📋 #dra_kaline #condutamedica #personalizado',
    likes: 1280,
    commentsCount: 95,
    procedureTag: 'Conduta Médica',
    date: 'Recente'
  },
  {
    id: 'post-5',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-5-achismos.svg',
    caption: 'Seu cabelo não precisa de achismos. Precisa entender por que está caindo. Queda de cabelo é um sinal. E sinais precisam ser investigados através de tricoscopia digital e exames direcionados. 🔍💡 #dra_kaline #diagnostico #semachismos',
    likes: 1050,
    commentsCount: 88,
    procedureTag: 'Sem Achismos',
    date: 'Recente'
  },
  {
    id: 'post-6',
    instagramUrl: 'https://www.instagram.com/dra_kaline/',
    imageUrl: '/images/foto-6-cinco-sinais.svg',
    caption: '5 SINAIS DE QUE SEU COURO CABELUDO PODE ESTAR INFLAMADO: 1) Coceira frequente, 2) Dor/sensibilidade na raiz, 3) Descamação, 4) Vermelhidão e 5) Aumento de queda. Alguns sinais parecem comuns, mas não deveriam ser ignorados! ⚠️🔬 #dra_kaline #courocabeludo #sinaisdealerta',
    likes: 1510,
    commentsCount: 130,
    procedureTag: '5 Sinais de Alerta',
    date: 'Recente'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'dep-1',
    name: 'Rodrigo Medeiros',
    age: 38,
    location: 'Natal - RN',
    procedure: 'Transplante Capilar FUE',
    comment: 'Eu convivia com a calvície há mais de 10 anos e tinha muito receio de ficar com aspecto artificial. A Dra. Kaline realizou meu transplante FUE com uma precisão cirúrgica impecável. O desenho da linha frontal ficou 100% natural, ninguém percebe que fiz cirurgia!',
    rating: 5,
    date: 'Janeiro de 2026',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'dep-2',
    name: 'Fernanda Albuquerque',
    age: 33,
    location: 'Natal - RN',
    procedure: 'Tricoscopia Digital & MMP® Capilar',
    comment: 'Estava desesperada com a queda pós-parto e afinamento dos fios. Na consulta, a Dra. Kaline fez a tricoscopia, me explicou detalhadamente o diagnóstico e iniciamos o tratamento. Em 3 meses de protocolo, a queda cessou e já vejo centenas de novos fios nascendo!',
    rating: 5,
    date: 'Dezembro de 2025',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'dep-3',
    name: 'Lucas Barreto',
    age: 29,
    location: 'Mossoró / Natal',
    procedure: 'Tratamento de Alopécia Androgenética',
    comment: 'O diferencial da Dra. Kaline é a clareza e a precisão do diagnóstico. Ela não inventa modismos: pede os exames certos, investiga a fundo e propõe o tratamento médico que realmente funciona.',
    rating: 5,
    date: 'Novembro de 2025',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Para um Diagnóstico Preciso: Como a Tricoscopia Digital Revolucionou o Tratamento da Queda',
    slug: 'para-um-diagnostico-preciso-tricoscopia',
    summary: 'Entenda por que tratar queda de cabelo sem exame microscópico é como prescrever no escuro e saiba como a tecnologia identifica a causa exata.',
    category: 'Tricologia Médica',
    readTime: '4 min de leitura',
    publishedAt: '05 de Fevereiro, 2026',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Dra. Kaline',
      role: 'Médica • Tricologia & Restauração Capilar',
      avatar: 'https://images.unsplash.com/photo-1594824813501-44754564c767?auto=format&fit=crop&w=200&q=80'
    },
    keyCareTips: [
      'Evitar aplicar óleos ou pós volumizadores 24h antes do exame.',
      'Levar exames laboratoriais recentes para correlação clínica.',
      'Identificar o padrão de queda (se é súbita ou gradual).'
    ],
    content: `
A queda capilar possui dezenas de causas distintas: desde alterações hormonais e nutricionais até alopécias cicatriciais e eflúvios telógenos.

Com a tricoscopia digital de alta precisão, conseguimos observar a espessura de cada fio, se há inflamação perifolicular e quantos fios estão em fase anágena ou telógena, garantindo o diagnóstico correto antes de iniciar qualquer intervenção.
    `
  },
  {
    id: 'blog-2',
    title: 'Transplante Capilar FUE: O Que Esperar da Recuperação e dos Resultados',
    slug: 'transplante-capilar-fue-recuperacao',
    summary: 'Guia prático sobre o pós-operatório da técnica FUE, fases de crescimento dos fios e cuidados fundamentais.',
    category: 'Transplante Capilar',
    readTime: '5 min de leitura',
    publishedAt: '20 de Janeiro, 2026',
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Dra. Kaline',
      role: 'Médica • Tricologia & Restauração Capilar',
      avatar: 'https://images.unsplash.com/photo-1594824813501-44754564c767?auto=format&fit=crop&w=200&q=80'
    },
    keyCareTips: [
      'Dormir com a cabeceira a 45 graus nos primeiros 3 dias.',
      'Lavar a área implantada apenas com a técnica suave prescrita.',
      'Evitar sol direto e atividades físicas intensas nas primeiras 2 semanas.'
    ],
    content: `
A técnica FUE (Follicular Unit Extraction) revolucionou a cirurgia capilar por não deixar cicatriz linear e permitir rápida recuperação.

Os fios transplantados caem entre a 3ª e a 6ª semana (fase transitória) e começam a renascer fortes e saudáveis a partir do terceiro mês.
    `
  }
];

export const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 'cli-001',
    name: 'Carlos Eduardo Nogueira',
    phone: '(84) 99881-2233',
    email: 'carlos.nogueira@email.com',
    birthDate: '1985-04-12',
    cpf: '054.***.***-91',
    firstVisitDate: '2025-02-10',
    totalVisits: 3,
    allergies: 'Nenhuma alergia conhecida a medicamentos',
    contraindications: 'Nenhuma',
    aestheticGoals: 'Restauração capilar da linha frontal e controle da calvície androgenética',
    medicalNotes: 'Tricoscopia mostrou miniaturização em vértex e região frontal. Paciente em protocolo de MMP e finasterida tópica com excelente resposta.',
    history: [
      {
        id: 'hist-1',
        date: '2025-02-10',
        procedure: 'Tricoscopia Digital & Planejamento Capilar',
        productUsed: 'Mapeamento Digital Dermatoscópico',
        lotNumber: 'TRICO-0021',
        notes: 'Mapeamento capilar completo. Densidade média de 68UF/cm2 na área doadora. Indicação de 4 sessões de MMP.',
        returnDate: '2025-03-10'
      },
      {
        id: 'hist-2',
        date: '2025-03-10',
        procedure: 'MMP® Capilar - Sessão 1',
        productUsed: 'Fatores de Crescimento + Minoxidil Estéril',
        lotNumber: 'LT-88192',
        notes: 'Aplicação em região frontal e coroa. Boa tolerância anestésica local.',
        returnDate: '2025-04-10'
      }
    ],
    createdAt: '2025-02-10T10:30:00.000Z'
  },
  {
    id: 'cli-002',
    name: 'Beatriz Vasconcelos',
    phone: '(84) 98711-4455',
    email: 'beatriz.v@gmail.com',
    birthDate: '1992-11-23',
    cpf: '089.***.***-22',
    firstVisitDate: '2025-05-15',
    totalVisits: 2,
    allergies: 'Nenhuma alergia relatada',
    contraindications: 'Nenhuma',
    aestheticGoals: 'Queda pós-covid e afinamento capilar difuso',
    medicalNotes: 'Quadro de Eflúvio Telógeno associado a ferritina baixa. Tratamento clínico com reposição e laser capilar.',
    history: [
      {
        id: 'hist-3',
        date: '2025-05-15',
        procedure: 'Consulta Médica de Tricologia',
        productUsed: 'Tricoscopia + Fotobioestimulação',
        lotNumber: 'LASER-04',
        notes: 'Protocolo de 6 sessões de fotobioestimulação + suporte nutricional.',
        returnDate: '2025-06-15'
      }
    ],
    createdAt: '2025-05-15T14:00:00.000Z'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Marcelo Pires',
    clientPhone: '(84) 99122-3344',
    clientEmail: 'marcelo.pires@email.com',
    procedureId: 'tricoscopia-digital',
    procedureTitle: 'Tricoscopia Digital & Diagnóstico Capilar',
    date: '2026-09-15',
    time: '10:00',
    status: 'confirmado',
    notes: 'Queda acentuada nos últimos 4 meses.',
    reminderSent: true,
    createdAt: '2026-09-08T10:00:00.000Z'
  },
  {
    id: 'apt-2',
    clientName: 'Larissa Albuquerque',
    clientPhone: '(84) 99455-6677',
    clientEmail: 'larissa.alb@email.com',
    procedureId: 'mmp-capilar',
    procedureTitle: 'MMP® Capilar & Microinfusão',
    date: '2026-09-16',
    time: '14:30',
    status: 'pendente',
    notes: 'Segunda sessão do protocolo.',
    reminderSent: false,
    createdAt: '2026-09-08T11:20:00.000Z'
  }
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: 'Diagnóstico Preciso & Saúde Capilar',
    title: 'Especialista em saúde e restauração capilar.',
    subtitle: 'Avaliação minuciosa com tricoscopia digital de alta resolução, tratamentos individualizados para queda de cabelo e restauração capilar com máxima naturalidade.',
    quote: '“Para um diagnóstico preciso.”',
    imageUrl: 'https://images.unsplash.com/photo-1594824813589-32e6a715f5f3?auto=format&fit=crop&w=1400&q=85',
    ctaText: 'Agendar Consulta',
    ctaLink: '#agendamento',
    secondaryCtaText: 'Falar no WhatsApp',
    secondaryCtaLink: 'whatsapp',
    order: 1,
    isActive: true
  },
  {
    id: 'slide-2',
    badge: 'Tecnologia Médica & Ciência',
    title: 'Tricoscopia Digital de Alta Resolução.',
    subtitle: 'Mapeamento folicular computadorizado em tempo real para diagnosticar a causa exata da queda capilar antes de iniciar qualquer protocolo terapêutico.',
    quote: '“Entender a causa é a chave do tratamento definitivo.”',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=85',
    ctaText: 'Conhecer o Diagnóstico',
    ctaLink: '#diagnostico',
    secondaryCtaText: 'Agendar Avaliação',
    secondaryCtaLink: '#agendamento',
    order: 2,
    isActive: true
  },
  {
    id: 'slide-3',
    badge: 'Protocolos Clínicos Avançados',
    title: 'MMP®, Fotobioestimulação e Regeneração Capilar.',
    subtitle: 'Microinfusão de medicamentos na derme e bioestimulação com lasers para interromper o afinamento folicular e estimular novos fios fortes.',
    quote: '“Resultados visíveis com protocolos médicos personalizados.”',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=85',
    ctaText: 'Ver Procedimentos',
    ctaLink: '#procedimentos',
    secondaryCtaText: 'Falar no WhatsApp',
    secondaryCtaLink: 'whatsapp',
    order: 3,
    isActive: true
  }
];

