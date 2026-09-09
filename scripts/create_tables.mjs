import mysql from 'mysql2/promise';

async function createAllTables() {
  console.log('🚀 Connecting to MySQL and creating all database tables...');

  const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
    connectTimeout: 15000,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  const connection = await mysql.createConnection(config);
  console.log(`✅ Connected to database: ${config.database} @ ${config.host}`);

  try {
    // 1. Clients Table
    console.log('Creating table: clients...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        birth_date VARCHAR(30),
        cpf VARCHAR(20),
        first_visit_date VARCHAR(50),
        total_visits INT DEFAULT 1,
        allergies TEXT,
        contraindications TEXT,
        aesthetic_goals TEXT,
        medical_notes TEXT,
        before_after_photos JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_clients_phone (phone),
        INDEX idx_clients_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Client Procedure History Table (Prontuário)
    console.log('Creating table: client_procedure_history...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_procedure_history (
        id VARCHAR(64) PRIMARY KEY,
        client_id VARCHAR(64) NOT NULL,
        procedure_date VARCHAR(50) NOT NULL,
        procedure_name VARCHAR(255) NOT NULL,
        product_used VARCHAR(255),
        lot_number VARCHAR(100),
        notes TEXT,
        return_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cph_client (client_id),
        CONSTRAINT fk_cph_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Appointments Table (Agendamentos de Consultas)
    console.log('Creating table: appointments...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(64) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        client_email VARCHAR(255),
        procedure_id VARCHAR(100),
        procedure_title VARCHAR(255),
        appointment_date VARCHAR(30) NOT NULL,
        appointment_time VARCHAR(20) NOT NULL,
        notes TEXT,
        status ENUM('pendente', 'confirmado', 'realizado', 'cancelado') DEFAULT 'pendente',
        reminder_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_app_date (appointment_date),
        INDEX idx_app_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Procedures Table (Tratamentos & Protocolos da Dra. Kaline)
    console.log('Creating table: procedures...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS procedures (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        category VARCHAR(50),
        duration VARCHAR(100),
        downtime VARCHAR(100),
        ideal_for JSON,
        benefits JSON,
        image_url TEXT,
        popular BOOLEAN DEFAULT FALSE,
        faq JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proc_cat (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Gallery Posts Table (Instagram & Conteúdo Visual)
    console.log('Creating table: gallery_posts...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_posts (
        id VARCHAR(64) PRIMARY KEY,
        instagram_url TEXT,
        image_url MEDIUMTEXT NOT NULL,
        caption TEXT,
        likes INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        procedure_tag VARCHAR(100),
        post_date VARCHAR(50),
        is_video BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_gal_tag (procedure_tag)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Blog Posts Table (Artigos Educativos & Cuidados Pós)
    console.log('Creating table: blog_posts...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        summary TEXT,
        content LONGTEXT,
        category VARCHAR(100),
        read_time VARCHAR(50),
        published_at VARCHAR(50),
        cover_image TEXT,
        key_care_tips JSON,
        author_name VARCHAR(100),
        author_role VARCHAR(150),
        author_avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_blog_cat (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Testimonials Table (Depoimentos de Pacientes)
    console.log('Creating table: testimonials...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT,
        location VARCHAR(100),
        procedure_name VARCHAR(255),
        comment TEXT,
        rating INT DEFAULT 5,
        testimonial_date VARCHAR(50),
        verified BOOLEAN DEFAULT TRUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Notifications Table
    console.log('Creating table: notifications...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        type VARCHAR(50),
        appointment_id VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Clinic Settings Table
    console.log('Creating table: clinic_settings...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinic_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Hero Slides Carousel Table
    console.log('Creating table: hero_slides...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id VARCHAR(64) PRIMARY KEY,
        badge VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT NOT NULL,
        quote VARCHAR(255),
        image_url LONGTEXT NOT NULL,
        cta_text VARCHAR(100) DEFAULT 'Agendar Consulta',
        cta_link VARCHAR(255) DEFAULT '#agendamento',
        secondary_cta_text VARCHAR(100) DEFAULT 'Falar no WhatsApp',
        secondary_cta_link VARCHAR(255) DEFAULT 'whatsapp',
        slide_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slides_order (slide_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('🎉 All tables created successfully in MySQL!');

    // Check existing tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Current tables in MySQL:');
    console.table(tables);

  } finally {
    await connection.end();
  }
}

createAllTables().catch(err => {
  console.error('❌ Error creating tables:', err);
  process.exit(1);
});
