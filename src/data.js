/* ============================================================
   ORA GYM — dados de referência do app (modalidades, catálogo de
   exercícios, modelos de ficha). Nenhum dado de usuário fica aqui:
   tudo do usuário vem do Firestore.
   ============================================================ */
const SPORTS = {
  musculacao: { id: 'musculacao', name: 'Musculação', short: 'Força', icon: 'dumbbell', c: '#4C8DFF', c2: '#1E4FD8', tagline: 'Cada série conta.' },
  corrida: { id: 'corrida', name: 'Corrida', short: 'Corrida', icon: 'run', c: '#E8ECE6', c2: '#7C8784', tagline: 'Cada quilômetro conta uma história.' },
  ciclismo: { id: 'ciclismo', name: 'Ciclismo', short: 'Pedal', icon: 'bike', c: '#FF7426', c2: '#C2410C', tagline: 'A estrada é o seu ritmo.' },
  calistenia: { id: 'calistenia', name: 'Calistenia', short: 'Calistenia', icon: 'rings', c: '#A3FF12', c2: '#4D7C0F', tagline: 'O corpo é o equipamento.' },
  futebol: { id: 'futebol', name: 'Futebol', short: 'Futebol', icon: 'ball', c: '#FFC23D', c2: '#B45309', tagline: 'O time joga junto.' },
  natacao: { id: 'natacao', name: 'Natação', short: 'Natação', icon: 'swim', c: '#38BDF8', c2: '#0369A1', tagline: 'Deslize. Respire. Repita.' },
  boxe: { id: 'boxe', name: 'Boxe', short: 'Boxe', icon: 'glove', c: '#FF4D5E', c2: '#9F1239', tagline: 'Técnica antes da força.' },
};
const SPORT_IDS = Object.keys(SPORTS);
const AXES = { W: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] };

const GOALS = [
  ['desempenho', 'Desempenho', 'Bater marcas e evoluir números', 'chart'], ['saude', 'Saúde', 'Constância e bem-estar', 'heartbeat'],
  ['condicionamento', 'Condicionamento', 'Fôlego e resistência', 'flame'], ['forca', 'Força', 'Ganhar carga e potência', 'dumbbell'],
  ['comunidade', 'Comunidade', 'Treinar com pessoas', 'users'], ['competicao', 'Competição', 'Desafios e rankings', 'trophy'],
];

/* Catálogo de exercícios de musculação (referência) */
const EXERCISES = {
  Peito: ['Supino reto com barra', 'Supino inclinado com halteres', 'Supino declinado', 'Crucifixo com halteres', 'Crucifixo no cabo', 'Flexão de braço', 'Peck deck'],
  Costas: ['Puxada frontal', 'Barra fixa', 'Remada curvada', 'Remada baixa', 'Remada unilateral', 'Levantamento terra', 'Pulldown com corda'],
  Pernas: ['Agachamento livre', 'Leg press 45°', 'Cadeira extensora', 'Mesa flexora', 'Stiff', 'Afundo com halteres', 'Elevação pélvica', 'Panturrilha em pé'],
  Ombros: ['Desenvolvimento com halteres', 'Desenvolvimento militar', 'Elevação lateral', 'Elevação frontal', 'Crucifixo inverso', 'Encolhimento'],
  Bíceps: ['Rosca direta', 'Rosca alternada', 'Rosca martelo', 'Rosca concentrada', 'Rosca no cabo'],
  Tríceps: ['Tríceps testa', 'Tríceps na polia', 'Tríceps francês', 'Mergulho nas paralelas', 'Supino fechado'],
  Core: ['Prancha', 'Abdominal crunch', 'Elevação de pernas', 'Abdominal na polia', 'Rotação russa'],
};
const EX_GROUP = Object.fromEntries(Object.entries(EXERCISES).flatMap(([g, l]) => l.map(e => [e, g])));
const ex = (n, sets, reps, kg, rest = 90) => ({ n, sets, reps, kg, rest });
const WORKOUT_TEMPLATES = [
  { name: 'Treino A', focus: 'Peito & Tríceps', exercises: [ex('Supino reto com barra', 4, 8, 0), ex('Supino inclinado com halteres', 3, 10, 0, 75), ex('Crucifixo no cabo', 3, 12, 0, 60), ex('Tríceps testa', 3, 10, 0, 60), ex('Tríceps na polia', 3, 12, 0, 60)] },
  { name: 'Treino B', focus: 'Costas & Bíceps', exercises: [ex('Puxada frontal', 4, 10, 0), ex('Remada curvada', 4, 8, 0), ex('Remada unilateral', 3, 10, 0, 75), ex('Rosca direta', 3, 10, 0, 60), ex('Rosca martelo', 3, 12, 0, 60)] },
  { name: 'Treino C', focus: 'Pernas', exercises: [ex('Agachamento livre', 4, 8, 0, 120), ex('Leg press 45°', 4, 10, 0), ex('Cadeira extensora', 3, 12, 0, 60), ex('Mesa flexora', 3, 12, 0, 60), ex('Panturrilha em pé', 4, 15, 0, 45)] },
  { name: 'Treino D', focus: 'Ombros & Core', exercises: [ex('Desenvolvimento com halteres', 4, 10, 0), ex('Elevação lateral', 4, 12, 0, 60), ex('Crucifixo inverso', 3, 12, 0, 60), ex('Prancha', 3, 1, 0, 45), ex('Elevação de pernas', 3, 12, 0, 45)] },
];
/* Calistenia: blocos e progressão de habilidades (o usuário marca as que já domina) */
const CALI_BLOCKS = ['Barra fixa', 'Paralelas', 'Flexão de braço', 'Pike push-up', 'Agachamento', 'Pistol assistido', 'Barra australiana', 'Transição na faixa', 'Negativa de muscle-up', 'L-sit (s)', 'Hollow hold (s)', 'Prancha (s)'];
const SKILLS = ['Prancha 60 s', 'Flexão 20 reps', 'Barra fixa 10 reps', 'Paralelas 15 reps', 'L-sit 20 s', 'Pistol assistido', 'Pike push-up', 'Muscle-up', 'Handstand na parede', 'Front lever tuck', 'Pistol squat', 'Handstand livre', 'Planche tuck', 'Front lever'];
const BOX_COMBOS = ['Jab · Direto', 'Jab duplo · Direto', 'Jab · Direto · Gancho', 'Jab · Esquiva · Direto', 'Direto · Gancho · Direto', 'Upper · Gancho', 'Jab · Saída lateral', 'Jab · Direto · Upper'];
const STROKES = ['Livre', 'Costas', 'Peito', 'Borboleta', 'Medley'];

/* Loja: categorias por esporte → busca real em lojas (sem parceiros fixos ainda) */
const SHOP = {
  musculacao: [['Straps de levantamento', 'Acessório', 'strap'], ['Cinto de musculação', 'Suporte', 'belt'], ['Luvas de treino', 'Pegada', 'glove2'], ['Garrafa térmica', 'Hidratação', 'bottle']],
  corrida: [['Tênis de corrida', 'Calçado', 'shoe'], ['Camiseta dry fit', 'Roupa', 'shirt'], ['Cinto de hidratação', 'Acessório', 'bottle'], ['Meia de compressão', 'Roupa', 'sock']],
  ciclismo: [['Capacete de ciclismo', 'Segurança', 'helmet'], ['Luva de ciclismo', 'Pegada', 'glove2'], ['Caramanhola', 'Hidratação', 'bottle'], ['Óculos de ciclismo', 'Proteção', 'glasses']],
  calistenia: [['Paralelas portáteis', 'Equipamento', 'bars'], ['Argolas de ginástica', 'Equipamento', 'ringsP'], ['Elástico de resistência', 'Assistência', 'band'], ['Garrafa térmica', 'Hidratação', 'bottle']],
  futebol: [['Chuteira society', 'Calçado', 'shoe'], ['Bola de futebol', 'Equipamento', 'ballP'], ['Caneleira', 'Proteção', 'guard'], ['Meião de futebol', 'Roupa', 'sock']],
  natacao: [['Óculos de natação', 'Visão', 'goggles'], ['Touca de silicone', 'Acessório', 'cap'], ['Palmar de natação', 'Treino', 'paddle'], ['Prancha de natação', 'Treino', 'board']],
  boxe: [['Luva de boxe', 'Equipamento', 'boxglove'], ['Bandagem de boxe', 'Proteção', 'band'], ['Protetor bucal', 'Proteção', 'guard'], ['Corda de pular', 'Condicionamento', 'rope']],
};
const shopUrl = q => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;
/* Música: estilos por esporte → busca real no Spotify / Apple Music */
const MUSIC = {
  musculacao: [['Treino pesado', 'Trap · Hip-hop', 140], ['Gym rock', 'Rock · Metal', 160], ['Foco total', 'Eletrônica', 128]],
  corrida: [['Corrida 170 BPM', 'Pop · Dance', 170], ['Longão', 'Indie', 160], ['Tiros', 'Drum & bass', 174]],
  ciclismo: [['Pedal de estrada', 'Synthwave', 120], ['Subida', 'Rock alternativo', 135], ['Giro leve', 'House', 124]],
  calistenia: [['Street workout', 'Rap', 95], ['Calistenia foco', 'Lo-fi', 90], ['Explosão', 'Trap', 145]],
  futebol: [['Vestiário', 'Funk · Rap', 130], ['Aquecimento futebol', 'Pop', 125], ['Pós-jogo', 'Pagode · Samba', 100]],
  natacao: [['Natação', 'Eletrônica', 128], ['Respiração', 'Ambient', 100], ['Mar aberto', 'Indie', 115]],
  boxe: [['Boxing workout', 'Hip-hop clássico', 95], ['Fight night', 'Trap pesado', 150], ['Pular corda', 'Drum & bass', 172]],
};
const spotifyUrl = q => `https://open.spotify.com/search/${encodeURIComponent(q + ' playlist')}`;
const appleUrl = q => `https://music.apple.com/br/search?term=${encodeURIComponent(q)}`;

const avColor = s => { const P = [['#E3192B', '#5c0a10'], ['#4C8DFF', '#1E3A8A'], ['#A3FF12', '#365314'], ['#FF7426', '#7C2D12'], ['#38BDF8', '#0C4A6E'], ['#FFC23D', '#78350F'], ['#8B5CF6', '#3B0764']]; let h = 0; for (const ch of String(s || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return P[h % P.length]; };
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
/* Avatar de qualquer usuário: imagem (id no Firestore) carregada sob demanda, ou iniciais */
function avatar(u, cls = '') {
  const name = (u && (u.name || u.fromName)) || '?'; const img = u && (u.avatar || u.fromAvatar); const [a1, a2] = avColor(name);
  return `<span class="av ${cls}" style="--a1:${a1};--a2:${a2}" aria-hidden="true" ${img ? `data-img="${img}"` : ''}>${esc(initials(name))}</span>`;
}
const meAv = (cls = '') => avatar(API.me || {}, cls);
/* Substitui [data-img] pelo conteúdo do Firestore */
function hydrateImages(root) {
  $$('[data-img]', root).forEach(async el => { const id = el.dataset.img; el.removeAttribute('data-img'); const src = await API.getImage(id).catch(() => null); if (!src) return;
    if (el.tagName === 'IMG') el.src = src; else { el.style.backgroundImage = `url("${src}")`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; el.textContent = ''; } });
}
const PH = { musculacao: ['musculacao', 'musculacao-2', 'musculacao-3'], corrida: ['corrida', 'corrida-2', 'corrida-3'], ciclismo: ['ciclismo', 'ciclismo-2'], calistenia: ['calistenia', 'calistenia-2', 'calistenia-3'], futebol: ['futebol', 'futebol-2'], natacao: ['natacao', 'natacao-2', 'natacao-3'], boxe: ['boxe', 'boxe-2', 'boxe-3'] };
const HAS_SM = ['musculacao', 'musculacao-2', 'corrida', 'corrida-2', 'ciclismo', 'calistenia', 'futebol', 'futebol-2', 'natacao', 'natacao-2', 'boxe', 'boxe-2', 'abertura', 'cadastro'];
function photo(sport, i = 0, sm = false) {
  if (i === 0) { const u = Photos.url(sport); if (u) return u; }
  const a = PH[sport] || [sport]; const n = a[i % a.length];
  return `photos/${n}${sm && HAS_SM.includes(n) ? '-sm' : ''}.jpg`;
}
const pimg = (name, sm) => `photos/${name}${sm && HAS_SM.includes(name) ? '-sm' : ''}.jpg`;
const PHOTO_POS = { musculacao: 'center 20%', 'musculacao-2': 'center 20%', corrida: 'center 35%', 'corrida-2': 'center 40%', ciclismo: 'center 30%', calistenia: 'center 20%', futebol: 'center 40%', 'futebol-2': 'center 40%', natacao: 'center 40%', 'natacao-2': 'center 35%', boxe: 'center 25%', 'boxe-2': 'center 25%' };
