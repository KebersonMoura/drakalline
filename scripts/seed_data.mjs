import mysql from 'mysql2/promise';

async function seedData() {
  console.log('🌱 Seeding initial data into MySQL tables if empty...');

  const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectTimeout: 15000,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  const connection = await mysql.createConnection(config);

  try {
    // 1. Procedures
    const [procRows] = await connection.query('SELECT COUNT(*) AS count FROM procedures');
    if (procRows[0].count === 0) {
      console.log('Seeding procedures...');
      const procedures = [
        {
          id: 'tricoscopia-digital',
          title: 'Tricoscopia Digital & Diagnóstico Capilar',
          subtitle: 'Exame de alta precisão para identificar as reais causas da queda capilar',
          description: 'Avaliação dermatoscópica computadorizada dos fios e couro cabeludo. Permite analisar densidade folicular, espessura dos fios, sinais inflamatórios e miniaturização, viabilizando um diagnóstico preciso.',
          category: 'facial',
          duration: '60 minutos',
          downtime: 'Sem downtime (exame não invasivo)',
          popular: true,
          ideal_for: JSON.stringify(['Queda acentuada de cabelo', 'Afinamento dos fios e entradas', 'Suspeita de calvície (alopecia)', 'Descamação, dor ou coceira no couro cabeludo']),
          benefits: JSON.stringify(['Diagnóstico médico preciso e precoce', 'Mapeamento fotográfico para acompanhamento de evolução', 'Identificação da causa raiz da queda capilar', 'Direcionamento de tratamento personalizado']),
          image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
          faq: JSON.stringify([
            { question: 'Como é feita a tricoscopia?', answer: 'Com uma lente de aumento dermatoscópica digital conectada ao monitor, avaliamos folículo a folículo em alta ampliação de forma indolor.' },
            { question: 'Preciso de preparo antes do exame?', answer: 'Recomendamos estar com os cabelos limpos e sem uso de produtos tópicos ou maquiagens capilares no dia da consulta.' }
          ])
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
          ideal_for: JSON.stringify(['Calvície masculina e feminina avançada', 'Recuo da linha capilar e entradas', 'Falhas na barba ou sobrancelhas', 'Cicatrizes no couro cabeludo']),
          benefits: JSON.stringify(['Cabelos definitivos e naturais', 'Sem cicatriz linear visível (técnica FUE fio a fio)', 'Linha anterior projetada com naturalidade anatômica', 'Acompanhamento pré e pós-operatório completo']),
          image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
          faq: JSON.stringify([
            { question: 'O cabelo transplantado volta a cair?', answer: 'Os folículos retirados da área doadora posterior são geneticamente resistentes à calvície e permanecem crescendo ao longo da vida.' },
            { question: 'Quando vejo os primeiros resultados?', answer: 'Os fios começam a nascer a partir do 3º mês, com resultado maduro e denso entre 9 e 12 meses.' }
          ])
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
          ideal_for: JSON.stringify(['Alopécia androgenética (calvície)', 'Eflúvio telógeno persistente', 'Fios enfraquecidos e desvitalizados', 'Estímulo pré e pós-transplante']),
          benefits: JSON.stringify(['Ação direta no bulbo capilar com alta absorção', 'Freia a queda e estimula novos fios em crescimento', 'Espessamento do calibre da haste capilar', 'Procedimento realizado com anestesia local confortável']),
          image_url: 'https://images.unsplash.com/photo-1512290900672-1f41b2a926a5?auto=format&fit=crop&w=800&q=80',
          faq: JSON.stringify([
            { question: 'Quantas sessões são indicadas?', answer: 'Em média de 3 a 6 sessões mensais, ajustadas de acordo com o diagnóstico na tricoscopia.' }
          ])
        },
        {
          id: 'terapia-laser',
          title: 'Fotobioestimulação & Lasers Capilares',
          subtitle: 'Energia luminosa para ativar a circulação e metabolismo folicular',
          description: 'Uso de luzes e lasers de baixa intensidade (LLLT) para aumentar a oxigenação celular no couro cabeludo, reduzir a inflamação folicular e acelerar a transição dos fios para a fase de crescimento.',
          category: 'rejuvenescimento',
          duration: '30 minutos',
          downtime: 'Zero (indolor e relaxante)',
          popular: false,
          ideal_for: JSON.stringify(['Queda pós-estresse ou pós-parto', 'Dermatite seborreica do couro cabeludo', 'Recuperação pós-cirúrgica capilar', 'Potencialização de tratamentos clínicos']),
          benefits: JSON.stringify(['Estímulo da microcirculação local', 'Ação anti-inflamatória no couro cabeludo', 'Melhora a nutrição e brilho dos fios', 'Indolor e sem agulhas']),
          image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          faq: JSON.stringify([
            { question: 'Pode ser associado a outros tratamentos?', answer: 'Sim, é altamente sinérgico quando combinado com MMP® e terapia medicamentosa oral/tópica.' }
          ])
        }
      ];

      for (const p of procedures) {
        await connection.query(`
          INSERT INTO procedures (id, title, subtitle, description, category, duration, downtime, ideal_for, benefits, image_url, popular, faq)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [p.id, p.title, p.subtitle, p.description, p.category, p.duration, p.downtime, p.ideal_for, p.benefits, p.image_url, p.popular, p.faq]);
      }
      console.log('✅ Procedures seeded!');
    }

    // 2. Gallery Posts
    const [galRows] = await connection.query('SELECT COUNT(*) AS count FROM gallery_posts');
    if (galRows[0].count === 0) {
      console.log('Seeding gallery posts...');
      const posts = [
        {
          id: 'post-1',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-1-destaque.svg',
          caption: 'Dra. Kaline — Especialista em Saúde e Restauração Capilar. "Para um diagnóstico preciso", fundamentado em tricoscopia digital de alta resolução, avaliação microscópica e conduta médica individualizada. 🩺🔬🤍 #dra_kaline #destaque #restauracaocapilar #diagnostico',
          likes: 1420,
          comments_count: 98,
          procedure_tag: 'Destaque Principal',
          post_date: 'Destaque',
          is_video: false
        },
        {
          id: 'post-2',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-2-uti.svg',
          caption: 'Essa foto foi tirada durante um plantão na UTI. Ela me faz lembrar de algo importante: a medicina é vocação, presença humana e compromisso inegociável com a vida de cada paciente. 🏥🩺 #dra_kaline #medicina #trajetoria #cuidado',
          likes: 980,
          comments_count: 76,
          procedure_tag: 'Plantão na UTI',
          post_date: 'Recente',
          is_video: false
        },
        {
          id: 'post-3',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-3-autoestima.svg',
          caption: 'Porque autoestima também é saúde. E toda mulher merece informação médica de verdade. Quando recuperamos a densidade e o vigor dos fios, devolvemos a confiança diária. ✨💆‍♀️ #dra_kaline #autoestima #saudecapilar',
          likes: 1140,
          comments_count: 84,
          procedure_tag: 'Autoestima é Saúde',
          post_date: 'Recente',
          is_video: false
        },
        {
          id: 'post-4',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-4-meu-trabalho.svg',
          caption: 'MEU TRABALHO NÃO É INDICAR UM PROCEDIMENTO. É entender o seu caso e definir qual caminho faz sentido para você. Tratamentos capilares devem ser sob medida, baseados na ciência e na sua real necessidade. 🧬📋 #dra_kaline #condutamedica #personalizado',
          likes: 1280,
          comments_count: 95,
          procedure_tag: 'Conduta Médica',
          post_date: 'Recente',
          is_video: false
        },
        {
          id: 'post-5',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-5-achismos.svg',
          caption: 'Seu cabelo não precisa de achismos. Precisa entender por que está caindo. Queda de cabelo é um sinal. E sinais precisam ser investigados através de tricoscopia digital e exames direcionados. 🔍💡 #dra_kaline #diagnostico #semachismos',
          likes: 1050,
          comments_count: 88,
          procedure_tag: 'Sem Achismos',
          post_date: 'Recente',
          is_video: false
        },
        {
          id: 'post-6',
          instagram_url: 'https://www.instagram.com/dra_kaline/',
          image_url: '/images/foto-6-cinco-sinais.svg',
          caption: '5 SINAIS DE QUE SEU COURO CABELUDO PODE ESTAR INFLAMADO: 1) Coceira frequente, 2) Dor/sensibilidade na raiz, 3) Descamação, 4) Vermelhidão e 5) Aumento de queda. Alguns sinais parecem comuns, mas não deveriam ser ignorados! ⚠️🔬 #dra_kaline #courocabeludo #sinaisdealerta',
          likes: 1510,
          comments_count: 130,
          procedure_tag: '5 Sinais de Alerta',
          post_date: 'Recente',
          is_video: false
        }
      ];

      for (const post of posts) {
        await connection.query(`
          INSERT INTO gallery_posts (id, instagram_url, image_url, caption, likes, comments_count, procedure_tag, post_date, is_video)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [post.id, post.instagram_url, post.image_url, post.caption, post.likes, post.comments_count, post.procedure_tag, post.post_date, post.is_video]);
      }
      console.log('✅ Gallery posts seeded!');
    }

    // 3. Clients & History
    const [cliRows] = await connection.query('SELECT COUNT(*) AS count FROM clients');
    if (cliRows[0].count === 0) {
      console.log('Seeding clients...');
      const client1Id = 'cli-001';
      await connection.query(`
        INSERT INTO clients (id, name, phone, email, birth_date, cpf, first_visit_date, total_visits, allergies, contraindications, aesthetic_goals, medical_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        client1Id,
        'Juliana Paes Vasconcelos',
        '(84) 98822-1144',
        'juliana.vasconcelos@email.com',
        '1989-05-14',
        '042.881.992-04',
        '2024-03-15',
        3,
        'Nenhuma alergia conhecida a medicamentos tópicos',
        'Gestação / Lactação: Não',
        'Tratar eflúvio telógeno pós-covid e recuperar densidade na coroa',
        'Quadro de queda há 6 meses. Tricoscopia revelou eflúvio associado a miniaturização inicial fronto-parietal.'
      ]);

      await connection.query(`
        INSERT INTO client_procedure_history (id, client_id, procedure_date, procedure_name, product_used, lot_number, notes, return_date)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'hist-001',
        client1Id,
        '2024-03-15',
        'Tricoscopia Digital & Mapeamento',
        'Dermatoscópio Digital Polarizado',
        'TRICO-2024',
        'Diagnóstico de eflúvio telógeno associado a alopecia androgenética grau 1 de Ludwig.',
        '2024-04-15',
        'hist-002',
        client1Id,
        '2024-04-15',
        'MMP® Capilar - Sessão 1',
        'Fatores de Crescimento + Minoxidil estéril',
        'LT-98214',
        'Microinfusão realizada em couro cabeludo parietal e vértice. Boa tolerância.',
        '2024-05-15'
      ]);

      const client2Id = 'cli-002';
      await connection.query(`
        INSERT INTO clients (id, name, phone, email, birth_date, cpf, first_visit_date, total_visits, allergies, contraindications, aesthetic_goals, medical_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        client2Id,
        'Rodrigo Albuquerque Medeiros',
        '(84) 99144-8899',
        'rodrigo.medeiros@empresa.com.br',
        '1984-11-20',
        '789.112.443-88',
        '2024-01-10',
        4,
        'Sensibilidade a dipirona',
        'Sem histórico de queloide',
        'Restauração da linha frontal e entradas (Norwood III)',
        'Candidato ideal para transplante FUE. Área doadora densa e de alta viabilidade.'
      ]);

      console.log('✅ Clients and medical histories seeded!');
    }

    // 4. Appointments
    const [appRows] = await connection.query('SELECT COUNT(*) AS count FROM appointments');
    if (appRows[0].count === 0) {
      console.log('Seeding appointments...');
      await connection.query(`
        INSERT INTO appointments (id, client_name, client_phone, client_email, procedure_id, procedure_title, appointment_date, appointment_time, notes, status, reminder_sent)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'app-001',
        'Juliana Paes Vasconcelos',
        '(84) 98822-1144',
        'juliana.vasconcelos@email.com',
        'mmp-capilar',
        'MMP® Capilar & Microinfusão de Medicamentos',
        '2025-06-12',
        '14:30',
        'Sessão de manutenção e nova avaliação fotográfica.',
        'confirmado',
        true,
        'app-002',
        'Rodrigo Albuquerque Medeiros',
        '(84) 99144-8899',
        'rodrigo.medeiros@empresa.com.br',
        'transplante-capilar',
        'Transplante Capilar (Técnica FUE)',
        '2025-06-14',
        '09:00',
        'Consulta de alinhamento pré-cirúrgico e desenho da linha capilar.',
        'confirmado',
        false
      ]);
      console.log('✅ Appointments seeded!');
    }

    // 5. Testimonials
    const [testRows] = await connection.query('SELECT COUNT(*) AS count FROM testimonials');
    if (testRows[0].count === 0) {
      console.log('Seeding testimonials...');
      await connection.query(`
        INSERT INTO testimonials (id, name, age, location, procedure_name, comment, rating, testimonial_date, verified)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'test-1',
        'Mariana Silveira',
        38,
        'Natal - RN',
        'Tricoscopia Digital & Tratamento Clínico',
        'Passei por vários profissionais que só passavam vitaminas aleatórias. Com a Dra. Kaline, no exame de tricoscopia na hora já entendemos a causa da minha queda. Em 3 meses de protocolo meus cabelos recuperaram o volume!',
        5,
        'Há 3 semanas',
        true,
        'test-2',
        'Lucas Ferraz',
        34,
        'Parnamirim - RN',
        'Transplante Capilar FUE',
        'A naturalidade da minha linha frontal ficou impecável. A técnica e o cuidado da Dra. Kaline e da equipe durante todo o procedimento me deram total segurança. Mudou minha autoestima por completo.',
        5,
        'Há 1 mês',
        true,
        'test-3',
        'Dra. Cláudia Monteiro',
        42,
        'Natal - RN',
        'MMP® Capilar',
        'Excelente médica, fundamentada na ciência. O diagnóstico preciso faz toda a diferença antes de indicar qualquer agulhada. Meus fios estão muito mais densos e fortes.',
        5,
        'Há 2 meses',
        true
      ]);
      console.log('✅ Testimonials seeded!');
    }

    // 6. Clinic Settings
    await connection.query(`
      INSERT INTO clinic_settings (setting_key, setting_value)
      VALUES 
      ('clinic_name', 'Dra. Kaline'),
      ('specialty', 'Saúde e Restauração Capilar'),
      ('tagline', 'Para um diagnóstico preciso'),
      ('whatsapp', '5584996421034'),
      ('address', 'Av. Hermes da Fonseca, 1144 - Tirol | Centro Médico Integrado'),
      ('city', 'Natal - RN')
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `);
    console.log('✅ Clinic settings stored in MySQL!');

    console.log('✨ All seed data completed!');
  } finally {
    await connection.end();
  }
}

seedData().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
