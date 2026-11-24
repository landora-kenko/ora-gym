/* ============================================================
   ORA GYM — dados demonstrativos (todos fictícios e identificados)
   ============================================================ */
const SPORTS = {
  musculacao: { id: 'musculacao', name: 'Musculação', short: 'Força', icon: 'dumbbell', c: '#4C8DFF', c2: '#1E4FD8', word: 'FORÇA', tagline: 'Cada série conta.',
    stats: [{ k: 'Volume semanal', v: 18.4, d: 1, u: 't' }, { k: 'Treinos', v: 4, d: 0, u: '/5' }, { k: 'Sequência', v: 12, d: 0, u: 'dias' }],
    metric: { k: 'Volume total', u: 't', W: [3.1, 3.6, 2.4, 4.2, 0, 3.8, 1.3], M: [12.1, 13.4, 14.0, 13.2, 15.6, 16.1, 15.4, 17.2, 16.8, 18.0, 17.5, 18.4], Y: [38, 41, 44, 47, 46, 52, 55, 58, 61, 63, 66, 70] },
    records: [{ k: 'Supino reto', v: '92,5 kg', d: '12 out' }, { k: 'Agachamento livre', v: '140 kg', d: '28 set' }, { k: 'Levantamento terra', v: '165 kg', d: '03 nov' }],
    goal: { k: 'Supino 100 kg', p: .78 } },
  corrida: { id: 'corrida', name: 'Corrida', short: 'Corrida', icon: 'run', c: '#E8ECE6', c2: '#7C8784', word: 'RITMO', tagline: 'Cada quilômetro conta uma história.',
    stats: [{ k: 'Distância semanal', v: 28.6, d: 1, u: 'km' }, { k: 'Pace médio', v: 5.12, d: 2, u: '/km', fmt: 'pace' }, { k: 'Corridas', v: 4, d: 0, u: '' }],
    metric: { k: 'Distância', u: 'km', W: [6.2, 0, 8.4, 5.1, 0, 12.3, 0], M: [18, 21, 19.5, 24, 22, 26.4, 25, 27.2, 24.8, 29.1, 27.5, 28.6], Y: [62, 70, 85, 92, 88, 101, 110, 98, 115, 120, 118, 126] },
    records: [{ k: '5 km', v: '23:41', d: '09 nov' }, { k: '10 km', v: '49:58', d: '19 out' }, { k: 'Maior distância', v: '21,1 km', d: '07 set' }],
    goal: { k: '100 km em novembro', p: .64 } },
  ciclismo: { id: 'ciclismo', name: 'Ciclismo', short: 'Pedal', icon: 'bike', c: '#FF7426', c2: '#C2410C', word: 'GIRO', tagline: 'A estrada é o seu ritmo.',
    stats: [{ k: 'Distância', v: 142, d: 0, u: 'km' }, { k: 'Elevação', v: 1860, d: 0, u: 'm' }, { k: 'Vel. média', v: 27.4, d: 1, u: 'km/h' }],
    metric: { k: 'Distância', u: 'km', W: [0, 32, 0, 28, 0, 82, 0], M: [90, 110, 96, 130, 120, 128, 135, 140, 126, 150, 138, 142], Y: [310, 360, 420, 460, 400, 520, 560, 530, 600, 640, 610, 680] },
    records: [{ k: 'Maior pedal', v: '112 km', d: '15 out' }, { k: 'Maior subida', v: '940 m', d: '15 out' }, { k: 'Vel. máx.', v: '61 km/h', d: '02 nov' }],
    goal: { k: '500 km no mês', p: .48 } },
  calistenia: { id: 'calistenia', name: 'Calistenia', short: 'Calistenia', icon: 'rings', c: '#A3FF12', c2: '#4D7C0F', word: 'CONTROLE', tagline: 'O corpo é o equipamento.',
    stats: [{ k: 'Habilidades', v: 7, d: 0, u: '/14' }, { k: 'Barras máx.', v: 18, d: 0, u: 'reps' }, { k: 'Prancha', v: 3.2, d: 1, u: 'min' }],
    metric: { k: 'Repetições', u: 'reps', W: [120, 0, 140, 0, 160, 0, 90], M: [300, 340, 360, 380, 410, 430, 420, 470, 490, 520, 510, 560], Y: [900, 1100, 1300, 1500, 1600, 1800, 1900, 2100, 2200, 2400, 2500, 2700] },
    records: [{ k: 'Barra fixa', v: '18 reps', d: '06 nov' }, { k: 'Paralelas', v: '32 reps', d: '30 out' }, { k: 'L-sit', v: '28 s', d: '11 nov' }],
    goal: { k: 'Muscle-up', p: .55 } },
  futebol: { id: 'futebol', name: 'Futebol', short: 'Futebol', icon: 'ball', c: '#FFC23D', c2: '#B45309', word: 'JOGO', tagline: 'O time joga junto.',
    stats: [{ k: 'Partidas', v: 23, d: 0, u: '' }, { k: 'Gols', v: 14, d: 0, u: '' }, { k: 'Assistências', v: 9, d: 0, u: '' }],
    metric: { k: 'Participações em gol', u: 'G+A', W: [0, 2, 0, 0, 3, 0, 1], M: [1, 2, 2, 1, 3, 2, 2, 3, 1, 2, 2, 3], Y: [4, 5, 6, 8, 7, 9, 10, 9, 11, 12, 13, 14] },
    records: [{ k: 'Gols em uma partida', v: '3', d: '25 out' }, { k: 'Sequência marcando', v: '4 jogos', d: 'out' }, { k: 'Distância em jogo', v: '7,8 km', d: '08 nov' }],
    goal: { k: '20 gols na temporada', p: .7 } },
  natacao: { id: 'natacao', name: 'Natação', short: 'Natação', icon: 'swim', c: '#38BDF8', c2: '#0369A1', word: 'FLUXO', tagline: 'Deslize. Respire. Repita.',
    stats: [{ k: 'Distância', v: 6.4, d: 1, u: 'km' }, { k: 'Voltas', v: 256, d: 0, u: '' }, { k: '100 m médio', v: 1.58, d: 2, u: '', fmt: 'pace' }],
    metric: { k: 'Distância', u: 'm', W: [1500, 0, 2000, 0, 1400, 0, 1500], M: [4200, 4800, 5000, 4600, 5200, 5600, 5400, 5900, 6000, 6200, 6100, 6400], Y: [14, 16, 18, 19, 18, 21, 22, 23, 24, 25, 26, 27] },
    records: [{ k: '100 m livre', v: '1:31', d: '04 nov' }, { k: '400 m livre', v: '6:48', d: '21 out' }, { k: 'Maior treino', v: '2.500 m', d: '10 nov' }],
    goal: { k: '1 km sem parar', p: .9 } },
  boxe: { id: 'boxe', name: 'Boxe', short: 'Boxe', icon: 'glove', c: '#FF4D5E', c2: '#9F1239', word: 'GUARDA', tagline: 'Técnica antes da força.',
    stats: [{ k: 'Rounds', v: 36, d: 0, u: '' }, { k: 'Tempo', v: 2.4, d: 1, u: 'h' }, { k: 'Intensidade', v: 82, d: 0, u: '%' }],
    metric: { k: 'Rounds', u: 'rounds', W: [8, 0, 10, 0, 0, 12, 6], M: [20, 24, 22, 26, 28, 27, 30, 29, 32, 33, 34, 36], Y: [70, 80, 90, 100, 95, 110, 118, 120, 126, 130, 134, 140] },
    records: [{ k: 'Mais rounds', v: '12', d: '08 nov' }, { k: 'Maior intensidade', v: '91%', d: '01 nov' }, { k: 'Sequência', v: '9 dias', d: 'nov' }],
    goal: { k: 'Sparring nível 2', p: .4 } },
};
const SPORT_IDS = Object.keys(SPORTS);
const AXES = { W: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], M: ['', '', '', '', '', '', '', '', '', '', '', ''], Y: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] };

const PEOPLE = {
  marina: { n: 'Marina Duarte', i: 'MD', a1: '#FF7426', a2: '#7C2D12', sport: 'corrida' },
  rafa: { n: 'Rafael Souza', i: 'RS', a1: '#4C8DFF', a2: '#1E3A8A', sport: 'musculacao' },
  julia: { n: 'Júlia Campos', i: 'JC', a1: '#A3FF12', a2: '#365314', sport: 'calistenia' },
  caio: { n: 'Caio Lima', i: 'CL', a1: '#FF4D5E', a2: '#881337', sport: 'boxe' },
  bia: { n: 'Beatriz Rocha', i: 'BR', a1: '#38BDF8', a2: '#0C4A6E', sport: 'natacao' },
  theo: { n: 'Theo Martins', i: 'TM', a1: '#2DD4BF', a2: '#134E4A', sport: 'ciclismo' },
  luana: { n: 'Luana Prado', i: 'LP', a1: '#FFC23D', a2: '#78350F', sport: 'futebol' },
  gui: { n: 'Guilherme Alves', i: 'GA', a1: '#8B5CF6', a2: '#3B0764', sport: 'corrida' },
};
const av = (id, cls = '') => { const p = PEOPLE[id]; return `<span class="av ${cls}" style="--a1:${p.a1};--a2:${p.a2}" aria-hidden="true">${p.i}</span>`; };
const meAv = (cls = '') => { const s = Store.get(); const ini = (s.name || 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); return `<span class="av ${cls}" style="--a1:var(--accent);--a2:#0A1F44" aria-hidden="true">${esc(ini)}</span>`; };

const FEED = [
  { id: 'p1', who: 'marina', sport: 'corrida', t: '32 min', kind: 'activity', title: 'Longão de domingo', text: 'Fechei o longão com negativo nos últimos 3 km. Pernas no lugar certo.',
    stats: [['Distância', '12,3 km'], ['Tempo', '1:02:14'], ['Pace', "5'03\"/km"]], pr: false, route: 2, likes: 128, comments: 14 },
  { id: 'p2', who: 'rafa', sport: 'musculacao', t: '1 h', kind: 'pr', title: 'Novo recorde pessoal', text: 'Supino 100 kg saiu! Três meses de ficha bem feita.',
    stats: [['Exercício', 'Supino reto'], ['Carga', '100 kg'], ['Anterior', '95 kg']], pr: true, likes: 342, comments: 41 },
  { id: 'p3', who: 'julia', sport: 'calistenia', t: '3 h', kind: 'achievement', title: 'Habilidade desbloqueada', text: 'Primeiro muscle-up limpo. Obrigada, grupo!',
    stats: [['Habilidade', 'Muscle-up'], ['Nível', '9 de 14'], ['Tentativas', '46']], pr: false, likes: 517, comments: 63 },
  { id: 'p4', who: 'caio', sport: 'boxe', t: '5 h', kind: 'activity', title: 'Treino de saco', text: 'Doze rounds focando em jab duplo e saída lateral.',
    stats: [['Rounds', '12 × 3 min'], ['Intensidade', '88%'], ['Duração', '52 min']], pr: false, likes: 86, comments: 7 },
  { id: 'p5', who: 'bia', sport: 'natacao', t: 'ontem', kind: 'activity', title: 'Série de 100s', text: '10 × 100 m livre, descanso de 20 s. Ritmo estável.',
    stats: [['Distância', '2.000 m'], ['Voltas', '80'], ['100 m médio', '1:38']], pr: false, likes: 64, comments: 5 },
  { id: 'p6', who: 'theo', sport: 'ciclismo', t: 'ontem', kind: 'activity', title: 'Serra ao amanhecer', text: 'Subida longa, descida com vento a favor.',
    stats: [['Distância', '82 km'], ['Elevação', '940 m'], ['Vel. média', '26,8 km/h']], pr: true, route: 1, likes: 203, comments: 22 },
  { id: 'p7', who: 'luana', sport: 'futebol', t: '2 d', kind: 'activity', title: 'Pelada de quinta', text: 'Dois gols e uma assistência. Time de sempre, energia nova.',
    stats: [['Gols', '2'], ['Assist.', '1'], ['Distância', '6,9 km']], pr: false, likes: 97, comments: 18 },
];

const CHALLENGES = [
  { id: 'c1', sport: 'musculacao', name: '30 dias de força', metric: 'Treinos concluídos', target: 30, mine: 19, unit: 'treinos', days: 11, kind: 'Grupo privado', group: 'Turma das 6h',
    rank: [['rafa', 23], ['me', 19], ['julia', 18], ['caio', 15], ['gui', 11]] },
  { id: 'c2', sport: 'corrida', name: '100 km em novembro', metric: 'Distância', target: 100, mine: 64, unit: 'km', days: 13, kind: 'Público', group: 'Comunidade Corrida',
    rank: [['marina', 71.4], ['gui', 66.0], ['me', 64.0], ['theo', 40.2], ['bia', 22.5]] },
  { id: 'c3', sport: 'boxe', name: 'Consistência semanal', metric: 'Dias ativos', target: 5, mine: 4, unit: 'dias', days: 3, kind: 'Amigos', group: 'Amigos',
    rank: [['caio', 5], ['me', 4], ['luana', 3], ['rafa', 3]] },
  { id: 'c4', sport: 'calistenia', name: 'Rei da barra', metric: 'Barras acumuladas', target: 500, mine: 0, unit: 'reps', days: 20, kind: 'Público', group: 'Comunidade Calistenia', rank: [['julia', 212], ['rafa', 140], ['caio', 96]] },
  { id: 'c5', sport: 'natacao', name: '10 km na piscina', metric: 'Distância', target: 10, mine: 0, unit: 'km', days: 28, kind: 'Público', group: 'Comunidade Natação', rank: [['bia', 4.1], ['theo', 1.2]] },
  { id: 'c6', sport: 'ciclismo', name: 'Escalada do mês', metric: 'Elevação', target: 5000, mine: 0, unit: 'm', days: 24, kind: 'Público', group: 'Comunidade Ciclismo', rank: [['theo', 1860], ['gui', 720]] },
];
const HISTORY = [
  { name: 'Outubro sem falhas', sport: 'musculacao', res: '1º lugar', medal: true },
  { name: 'Meia maratona coletiva', sport: 'corrida', res: 'Concluído', medal: true },
  { name: '7 dias de guarda alta', sport: 'boxe', res: '3º lugar', medal: false },
];
const GROUPS = [
  { name: 'Turma das 6h', members: 12, sport: 'musculacao', priv: true, ppl: ['rafa', 'julia', 'caio'] },
  { name: 'Pace de Domingo', members: 48, sport: 'corrida', priv: false, ppl: ['marina', 'gui', 'theo'] },
  { name: 'Ringue Leste', members: 9, sport: 'boxe', priv: true, ppl: ['caio', 'luana'] },
];

const WORKOUT_A = { name: 'Treino A — Peito & Tríceps', est: '58 min', ex: [
  { n: 'Supino reto com barra', m: 'Peitoral maior', sets: 4, reps: 8, kg: 85, rest: 90, pr: 92.5, cue: 'Escápulas encaixadas, pés firmes, barra desce até a linha do peito.' },
  { n: 'Supino inclinado com halteres', m: 'Peitoral superior', sets: 3, reps: 10, kg: 30, rest: 75, pr: 34, cue: 'Banco a 30°, cotovelos a ~45° do tronco.' },
  { n: 'Crucifixo no cabo', m: 'Peitoral', sets: 3, reps: 12, kg: 15, rest: 60, pr: 20, cue: 'Arco amplo, leve flexão do cotovelo durante todo o movimento.' },
  { n: 'Tríceps testa', m: 'Tríceps', sets: 3, reps: 10, kg: 30, rest: 60, pr: 35, cue: 'Cotovelos apontados para cima, sem abrir.' },
  { n: 'Mergulho nas paralelas', m: 'Tríceps & peito', sets: 3, reps: 12, kg: 0, rest: 75, pr: 10, cue: 'Tronco levemente inclinado, desça até 90°.' },
] };
const FICHAS = [
  { id: 'A', name: 'Treino A', sub: 'Peito & Tríceps', ex: 5, min: 58, last: 'há 3 dias' },
  { id: 'B', name: 'Treino B', sub: 'Costas & Bíceps', ex: 6, min: 62, last: 'há 2 dias' },
  { id: 'C', name: 'Treino C', sub: 'Pernas completas', ex: 6, min: 70, last: 'ontem' },
  { id: 'D', name: 'Treino D', sub: 'Ombros & Core', ex: 5, min: 50, last: 'há 5 dias' },
];
const SKILLS = [
  ['Prancha 60 s', 1], ['Flexão 20 reps', 1], ['Barra fixa 10 reps', 1], ['Paralelas 15 reps', 1], ['L-sit 20 s', 1], ['Pistol assistido', 1], ['Pike push-up', 1],
  ['Muscle-up', 0], ['Handstand na parede', 0], ['Front lever tuck', 0], ['Pistol squat', 0], ['Handstand livre', 0], ['Planche tuck', 0], ['Front lever', 0],
];
const PRODUCTS = {
  musculacao: [['Straps de levantamento', 'Acessório', 'strap'], ['Cinto de couro', 'Suporte', 'belt'], ['Luvas de treino', 'Pegada', 'glove2'], ['Garrafa térmica 1 L', 'Hidratação', 'bottle']],
  corrida: [['Tênis com amortecimento', 'Calçado', 'shoe'], ['Camiseta respirável', 'Roupa', 'shirt'], ['Cinto de hidratação', 'Acessório', 'bottle'], ['Meia de compressão', 'Roupa', 'sock']],
  ciclismo: [['Capacete aerodinâmico', 'Segurança', 'helmet'], ['Luvas de ciclismo', 'Pegada', 'glove2'], ['Garrafa para quadro', 'Hidratação', 'bottle'], ['Óculos esportivo', 'Proteção', 'glasses']],
  calistenia: [['Paralelas portáteis', 'Equipamento', 'bars'], ['Argolas de madeira', 'Equipamento', 'ringsP'], ['Faixa elástica', 'Assistência', 'band'], ['Garrafa térmica 1 L', 'Hidratação', 'bottle']],
  futebol: [['Chuteira de campo', 'Calçado', 'shoe'], ['Bola oficial', 'Equipamento', 'ballP'], ['Caneleira', 'Proteção', 'guard'], ['Meião', 'Roupa', 'sock']],
  natacao: [['Óculos de natação', 'Visão', 'goggles'], ['Touca de silicone', 'Acessório', 'cap'], ['Palmar', 'Treino', 'paddle'], ['Prancha', 'Treino', 'board']],
  boxe: [['Luvas de boxe 14 oz', 'Equipamento', 'boxglove'], ['Bandagem elástica', 'Proteção', 'band'], ['Protetor bucal', 'Proteção', 'guard'], ['Corda de pular', 'Condicionamento', 'rope']],
};
const PLAYLISTS = {
  musculacao: [['Peso Pesado', 'Trap · Hip-hop', 140], ['Série Final', 'Rock · Metal', 160], ['Foco Total', 'Eletrônica', 128]],
  corrida: [['Pace 170', 'Pop · Dance', 170], ['Longão', 'Indie · Alternativo', 160], ['Tiro de 400', 'Drum & bass', 174]],
  ciclismo: [['Estrada Aberta', 'Synthwave', 120], ['Subida', 'Rock alternativo', 135], ['Giro Leve', 'House', 124]],
  calistenia: [['Controle', 'Lo-fi · Beats', 90], ['Explosão', 'Trap', 145], ['Fluxo', 'Eletrônica', 118]],
  futebol: [['Vestiário', 'Funk · Rap', 130], ['Aquecimento', 'Pop', 125], ['Pós-jogo', 'Pagode · Samba', 100]],
  natacao: [['Respiração', 'Ambient', 100], ['Série de 100', 'Eletrônica', 128], ['Mar Aberto', 'Indie', 115]],
  boxe: [['Round 12', 'Hip-hop clássico', 95], ['Guarda Alta', 'Trap pesado', 150], ['Corda', 'Drum & bass', 172]],
};
const GOALS = [
  ['desempenho', 'Desempenho', 'Bater marcas e evoluir números', 'chart'], ['saude', 'Saúde', 'Constância e bem-estar', 'heartbeat'],
  ['condicionamento', 'Condicionamento', 'Fôlego e resistência', 'flame'], ['forca', 'Força', 'Ganhar carga e potência', 'dumbbell'],
  ['comunidade', 'Comunidade', 'Treinar com pessoas', 'users'], ['competicao', 'Competição', 'Desafios e rankings', 'trophy'],
];
const MEALS = [
  { n: 'Café da manhã', t: '07:10', kcal: 520, items: 'Ovos mexidos, pão integral, mamão' },
  { n: 'Almoço', t: '12:30', kcal: 780, items: 'Arroz, feijão, frango grelhado, salada' },
  { n: 'Pré-treino', t: '17:00', kcal: 310, items: 'Banana, aveia, pasta de amendoim' },
];

/* ---------- Fotografias (Unsplash, licença Unsplash) ---------- */
const PH = { musculacao: ['musculacao', 'musculacao-2', 'musculacao-3'], corrida: ['corrida', 'corrida-2', 'corrida-3'], ciclismo: ['ciclismo', 'ciclismo-2'], calistenia: ['calistenia', 'calistenia-2', 'calistenia-3'], futebol: ['futebol', 'futebol-2'], natacao: ['natacao', 'natacao-2', 'natacao-3'], boxe: ['boxe', 'boxe-2', 'boxe-3'] };
const HAS_SM = ['musculacao', 'musculacao-2', 'corrida', 'corrida-2', 'ciclismo', 'calistenia', 'futebol', 'futebol-2', 'natacao', 'natacao-2', 'boxe', 'boxe-2', 'abertura', 'cadastro'];
function photo(sport, i = 0, sm = false) {
  if (i === 0) { const u = Photos.url(sport); if (u) return u; }
  const a = PH[sport] || [sport]; const n = a[i % a.length];
  return `photos/${n}${sm && HAS_SM.includes(n) ? '-sm' : ''}.jpg`;
}
const pimg = (name, sm) => `photos/${name}${sm && HAS_SM.includes(name) ? '-sm' : ''}.jpg`;
const PHOTO_POS = { musculacao: 'center 20%', 'musculacao-2': 'center 20%', corrida: 'center 35%', 'corrida-2': 'center 40%', ciclismo: 'center 30%', calistenia: 'center 20%', futebol: 'center 40%', 'futebol-2': 'center 40%', natacao: 'center 40%', 'natacao-2': 'center 35%', boxe: 'center 25%', 'boxe-2': 'center 25%' };
