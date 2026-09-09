import mysql from 'mysql2/promise';

async function seedBlog() {
  const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };

  const connection = await mysql.createConnection(config);

  const posts = [
    {
      id: 'blog-1',
      title: 'Para um Diagnóstico Preciso: Como a Tricoscopia Digital Revolucionou o Tratamento da Queda',
      slug: 'para-um-diagnostico-preciso-tricoscopia',
      summary: 'Entenda por que tratar queda de cabelo sem exame microscópico é como prescrever no escuro e saiba como a tecnologia identifica a causa exata.',
      content: `A queda capilar não é uma doença única: ela é um sintoma com dezenas de causas possíveis. Pode ser eflúvio telógeno, alopécia androgenética, alopecia areata ou inflamações do couro cabeludo.\n\nCom a tricoscopia digital de alta resolução, conseguimos avaliar os folículos com aumentos de até 70 vezes, detectando miniaturização folicular precoce, peripilar signs e alterações vasculares muito antes de se tornarem visíveis a olho nu.\n\nO diagnóstico preciso é o único caminho seguro para indicar o tratamento correto e evitar desperdício de tempo e recursos com receitas caseiras ou achismos.`,
      category: 'Tricologia Médica',
      read_time: '4 min de leitura',
      published_at: '05 de Fevereiro, 2026',
      cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
      key_care_tips: JSON.stringify([
        'Evitar aplicar óleos ou pós volumizadores 24h antes do exame.',
        'Levar exames laboratoriais recentes para correlação clínica.',
        'Não lavar os cabelos imediatamente antes da consulta.'
      ]),
      author_name: 'Dra. Kaline',
      author_role: 'Médica • Restauração Capilar',
      author_avatar: '/images/foto-1-destaque.svg'
    },
    {
      id: 'blog-2',
      title: 'Transplante Capilar FUE: Linha Frontal Natural e Recuperação Sem Cicatriz Linear',
      slug: 'transplante-capilar-fue-naturalidade',
      summary: 'Descubra como o planejamento anatômico e a extração folicular individual proporcionam resultados imperceptíveis e definitivos.',
      content: `O grande diferencial de um transplante capilar bem-sucedido reside na naturalidade. Na técnica FUE (Follicular Unit Extraction), os folículos são colhidos um a um da região doadora posterior e implantados respeitando a curvatura, inclinação e distribuição natural dos fios.\n\nAlém de não deixar cicatriz linear contínua, a recuperação pós-operatória é rápida, permitindo o retorno às atividades sociais leves em poucos dias.`,
      category: 'Transplante Capilar',
      read_time: '5 min de leitura',
      published_at: '20 de Janeiro, 2026',
      cover_image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      key_care_tips: JSON.stringify([
        'Dormir com a cabeça elevada nos primeiros 3 dias.',
        'Seguir rigorosamente o protocolo de lavagem pós-cirúrgico.',
        'Evitar exposição solar direta na área transplantada.'
      ]),
      author_name: 'Dra. Kaline',
      author_role: 'Médica • Restauração Capilar',
      author_avatar: '/images/foto-1-destaque.svg'
    }
  ];

  for (const post of posts) {
    await connection.query(`
      INSERT INTO blog_posts (id, title, slug, summary, content, category, read_time, published_at, cover_image, key_care_tips, author_name, author_role, author_avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content)
    `, [
      post.id,
      post.title,
      post.slug,
      post.summary,
      post.content,
      post.category,
      post.read_time,
      post.published_at,
      post.cover_image,
      post.key_care_tips,
      post.author_name,
      post.author_role,
      post.author_avatar
    ]);
  }

  console.log('✅ Blog posts inserted!');
  await connection.end();
}

seedBlog();
