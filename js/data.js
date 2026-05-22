const SCORING={
  group_exact:3, group_winner:1,
  group_both_order:10, group_both_swap:6, group_one:3,
  elim1_winner:5, elim1_exact:8, elim1_miss:-1,
  elim2_winner:3, elim2_exact:5, elim2_miss:-2,
  champion_f1:40, runner_f1:20, champion_f2:20, runner_f2:10
};

const GROUPS={
  A:["México","Corea del Sur","Sudáfrica","Rep. Checa"],
  B:["Canadá","Bosnia-Herz.","Qatar","Suiza"],
  C:["Brasil","Marruecos","Haití","Escocia"],
  D:["EE.UU.","Paraguay","Australia","Turquía"],
  E:["Alemania","C. de Marfil","Ecuador","Curazao"],
  F:["Países Bajos","Suecia","Túnez","Japón"],
  G:["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H:["España","Cabo Verde","Arabia Saudí","Uruguay"],
  I:["Francia","Senegal","Irak","Noruega"],
  J:["Argentina","Argelia","Austria","Jordania"],
  K:["Portugal","DR Congo","Uzbekistán","Colombia"],
  L:["Inglaterra","Croacia","Ghana","Panamá"],
};

// 72 partidos de grupos (IDs 1-72)
const GROUP_MATCHES=[
  // GRUPO A (6 partidos)
  {id:1, date:"Jun 11",time:"3 PM",  group:"A",home:"México",       away:"Sudáfrica",     venue:"Ciudad de México"},
  {id:2, date:"Jun 11",time:"10 PM", group:"A",home:"Corea del Sur",away:"Rep. Checa",    venue:"Zapopan"},
  {id:3, date:"Jun 18",time:"12 PM", group:"A",home:"Rep. Checa",   away:"Sudáfrica",     venue:"Atlanta"},
  {id:4, date:"Jun 18",time:"11 PM", group:"A",home:"México",       away:"Corea del Sur", venue:"Zapopan"},
  {id:5, date:"Jun 24",time:"3 PM",  group:"A",home:"México",       away:"Rep. Checa",    venue:"Ciudad de México"},
  {id:6, date:"Jun 24",time:"3 PM",  group:"A",home:"Corea del Sur",away:"Sudáfrica",     venue:"Monterrey"},
  // GRUPO B (6 partidos)
  {id:7, date:"Jun 12",time:"3 PM",  group:"B",home:"Canadá",        away:"Bosnia-Herz.", venue:"Toronto"},
  {id:8, date:"Jun 13",time:"3 PM",  group:"B",home:"Qatar",         away:"Suiza",        venue:"Santa Clara"},
  {id:9, date:"Jun 18",time:"3 PM",  group:"B",home:"Suiza",         away:"Bosnia-Herz.", venue:"Inglewood"},
  {id:10,date:"Jun 18",time:"6 PM",  group:"B",home:"Canadá",        away:"Qatar",        venue:"Vancouver"},
  {id:11,date:"Jun 24",time:"9 PM",  group:"B",home:"Suiza",         away:"Qatar",        venue:"Kansas City"},
  {id:12,date:"Jun 24",time:"9 PM",  group:"B",home:"Bosnia-Herz.",  away:"Canadá",       venue:"Inglewood"},
  // GRUPO C (6 partidos)
  {id:13,date:"Jun 13",time:"6 PM",  group:"C",home:"Brasil",        away:"Marruecos",    venue:"E. Rutherford"},
  {id:14,date:"Jun 13",time:"9 PM",  group:"C",home:"Haití",         away:"Escocia",      venue:"Foxborough"},
  {id:15,date:"Jun 19",time:"6 PM",  group:"C",home:"Escocia",       away:"Marruecos",    venue:"Foxborough"},
  {id:16,date:"Jun 19",time:"9 PM",  group:"C",home:"Brasil",        away:"Haití",        venue:"Filadelfia"},
  {id:17,date:"Jun 25",time:"3 PM",  group:"C",home:"Brasil",        away:"Escocia",      venue:"E. Rutherford"},
  {id:18,date:"Jun 25",time:"3 PM",  group:"C",home:"Marruecos",     away:"Haití",        venue:"Foxborough"},
  // GRUPO D (6 partidos)
  {id:19,date:"Jun 12",time:"9 PM",  group:"D",home:"EE.UU.",        away:"Paraguay",     venue:"Inglewood"},
  {id:20,date:"Jun 19",time:"3 PM",  group:"D",home:"EE.UU.",        away:"Australia",    venue:"Seattle"},
  {id:21,date:"Jun 20",time:"12 AM", group:"D",home:"Turquía",       away:"Paraguay",     venue:"Santa Clara"},
  {id:22,date:"Jun 25",time:"9 PM",  group:"D",home:"Paraguay",      away:"Australia",    venue:"Santa Clara"},
  {id:23,date:"Jun 25",time:"9 PM",  group:"D",home:"Turquía",       away:"EE.UU.",       venue:"Seattle"},
  {id:24,date:"Jun 20",time:"12 AM", group:"D",home:"Australia",     away:"Turquía",      venue:"Kansas City"},
  // GRUPO E (6 partidos)
  {id:25,date:"Jun 14",time:"3 PM",  group:"E",home:"Alemania",      away:"Curazao",      venue:"Toronto"},
  {id:26,date:"Jun 14",time:"9 PM",  group:"E",home:"C. de Marfil",  away:"Ecuador",      venue:"Kansas City"},
  {id:27,date:"Jun 20",time:"4 PM",  group:"E",home:"Alemania",      away:"C. de Marfil", venue:"Toronto"},
  {id:28,date:"Jun 20",time:"8 PM",  group:"E",home:"Ecuador",       away:"Curazao",      venue:"Kansas City"},
  {id:29,date:"Jun 26",time:"3 PM",  group:"E",home:"C. de Marfil",  away:"Curazao",      venue:"Toronto"},
  {id:30,date:"Jun 26",time:"3 PM",  group:"E",home:"Ecuador",       away:"Alemania",     venue:"Kansas City"},
  // GRUPO F (6 partidos)
  {id:31,date:"Jun 14",time:"6 PM",  group:"F",home:"Países Bajos",  away:"Túnez",        venue:"Guadalajara"},
  {id:32,date:"Jun 20",time:"1 PM",  group:"F",home:"Países Bajos",  away:"Suecia",       venue:"Houston"},
  {id:33,date:"Jun 20",time:"10 PM", group:"F",home:"Túnez",         away:"Japón",        venue:"Guadalajara"},
  {id:34,date:"Jun 26",time:"9 PM",  group:"F",home:"Países Bajos",  away:"Japón",        venue:"Houston"},
  {id:35,date:"Jun 26",time:"9 PM",  group:"F",home:"Suecia",        away:"Túnez",        venue:"Guadalajara"},
  {id:36,date:"Jun 21",time:"1 PM",  group:"F",home:"Suecia",        away:"Japón",        venue:"Dallas"},
  // GRUPO G (6 partidos)
  {id:37,date:"Jun 15",time:"6 PM",  group:"G",home:"Bélgica",       away:"Egipto",       venue:"Seattle"},
  {id:38,date:"Jun 16",time:"12 AM", group:"G",home:"Irán",          away:"Nueva Zelanda",venue:"Inglewood"},
  {id:39,date:"Jun 21",time:"3 PM",  group:"G",home:"Bélgica",       away:"Nueva Zelanda",venue:"Seattle"},
  {id:40,date:"Jun 21",time:"9 PM",  group:"G",home:"Irán",          away:"Egipto",       venue:"Inglewood"},
  {id:41,date:"Jun 27",time:"3 PM",  group:"G",home:"Nueva Zelanda", away:"Egipto",       venue:"Inglewood"},
  {id:42,date:"Jun 27",time:"3 PM",  group:"G",home:"Irán",          away:"Bélgica",      venue:"Seattle"},
  // GRUPO H (6 partidos)
  {id:43,date:"Jun 15",time:"1 PM",  group:"H",home:"España",        away:"Cabo Verde",   venue:"Atlanta"},
  {id:44,date:"Jun 15",time:"6 PM",  group:"H",home:"Arabia Saudí",  away:"Uruguay",      venue:"Miami"},
  {id:45,date:"Jun 21",time:"6 PM",  group:"H",home:"España",        away:"Arabia Saudí", venue:"Miami"},
  {id:46,date:"Jun 21",time:"9 PM",  group:"H",home:"Cabo Verde",    away:"Uruguay",      venue:"Atlanta"},
  {id:47,date:"Jun 27",time:"9 PM",  group:"H",home:"Arabia Saudí",  away:"Cabo Verde",   venue:"Miami"},
  {id:48,date:"Jun 27",time:"9 PM",  group:"H",home:"Uruguay",       away:"España",       venue:"Atlanta"},
  // GRUPO I (6 partidos)
  {id:49,date:"Jun 16",time:"3 PM",  group:"I",home:"Francia",       away:"Senegal",      venue:"E. Rutherford"},
  {id:50,date:"Jun 16",time:"6 PM",  group:"I",home:"Irak",          away:"Noruega",      venue:"Foxborough"},
  {id:51,date:"Jun 22",time:"3 PM",  group:"I",home:"Francia",       away:"Irak",         venue:"E. Rutherford"},
  {id:52,date:"Jun 22",time:"9 PM",  group:"I",home:"Senegal",       away:"Noruega",      venue:"Foxborough"},
  {id:53,date:"Jun 28",time:"3 PM",  group:"I",home:"Irak",          away:"Francia",      venue:"Foxborough"},
  {id:54,date:"Jun 28",time:"3 PM",  group:"I",home:"Noruega",       away:"Senegal",      venue:"E. Rutherford"},
  // GRUPO J (6 partidos)
  {id:55,date:"Jun 16",time:"9 PM",  group:"J",home:"Argentina",     away:"Argelia",      venue:"Kansas City"},
  {id:56,date:"Jun 17",time:"12 AM", group:"J",home:"Austria",       away:"Jordania",     venue:"Santa Clara"},
  {id:57,date:"Jun 22",time:"6 PM",  group:"J",home:"Argentina",     away:"Austria",      venue:"Kansas City"},
  {id:58,date:"Jun 23",time:"12 AM", group:"J",home:"Argelia",       away:"Jordania",     venue:"Santa Clara"},
  {id:59,date:"Jun 28",time:"9 PM",  group:"J",home:"Jordania",      away:"Argentina",    venue:"Santa Clara"},
  {id:60,date:"Jun 28",time:"9 PM",  group:"J",home:"Austria",       away:"Argelia",      venue:"Kansas City"},
  // GRUPO K (6 partidos)
  {id:61,date:"Jun 17",time:"1 PM",  group:"K",home:"Portugal",      away:"DR Congo",     venue:"Houston"},
  {id:62,date:"Jun 17",time:"10 PM", group:"K",home:"Uzbekistán",    away:"Colombia",     venue:"Ciudad de México"},
  {id:63,date:"Jun 23",time:"4 PM",  group:"K",home:"Portugal",      away:"Uzbekistán",   venue:"Houston"},
  {id:64,date:"Jun 23",time:"7 PM",  group:"K",home:"DR Congo",      away:"Colombia",     venue:"Ciudad de México"},
  {id:65,date:"Jun 29",time:"3 PM",  group:"K",home:"Colombia",      away:"Portugal",     venue:"Houston"},
  {id:66,date:"Jun 29",time:"3 PM",  group:"K",home:"Uzbekistán",    away:"DR Congo",     venue:"Ciudad de México"},
  // GRUPO L (6 partidos)
  {id:67,date:"Jun 17",time:"4 PM",  group:"L",home:"Inglaterra",    away:"Croacia",      venue:"Arlington"},
  {id:68,date:"Jun 17",time:"7 PM",  group:"L",home:"Ghana",         away:"Panamá",       venue:"Toronto"},
  {id:69,date:"Jun 23",time:"1 PM",  group:"L",home:"Inglaterra",    away:"Ghana",        venue:"Arlington"},
  {id:70,date:"Jun 23",time:"10 PM", group:"L",home:"Croacia",       away:"Panamá",       venue:"Toronto"},
  {id:71,date:"Jun 29",time:"9 PM",  group:"L",home:"Croacia",       away:"Ghana",        venue:"Toronto"},
  {id:72,date:"Jun 29",time:"9 PM",  group:"L",home:"Panamá",        away:"Inglaterra",   venue:"Arlington"},
];

// Eliminatorias IDs 73-104
// R32: 73-88, R16: 89-96, QF: 97-100, SF: 101-102, Final: 103, 3P: 104

function calcStandings(scores){
  const st={};
  Object.keys(GROUPS).forEach(g=>GROUPS[g].forEach(t=>{
    st[t]={team:t,group:g,pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dif:0};
  }));
  GROUP_MATCHES.forEach(m=>{
    const s=scores[m.id];
    if(!s||s.home===''||s.home===null||s.home===undefined) return;
    const h=parseInt(s.home),a=parseInt(s.away);
    if(isNaN(h)||isNaN(a)) return;
    const hm=st[m.home],aw=st[m.away];
    if(!hm||!aw) return;
    hm.pj++;aw.pj++;hm.gf+=h;hm.gc+=a;hm.dif+=(h-a);aw.gf+=a;aw.gc+=h;aw.dif+=(a-h);
    if(h>a){hm.pg++;hm.pts+=3;aw.pp++;}
    else if(h<a){aw.pg++;aw.pts+=3;hm.pp++;}
    else{hm.pe++;hm.pts++;aw.pe++;aw.pts++;}
  });
  const grouped={};
  Object.keys(GROUPS).forEach(g=>{
    grouped[g]=GROUPS[g].map(t=>st[t]).sort((a,b)=>{
      if(b.pts!==a.pts)return b.pts-a.pts;
      if(b.dif!==a.dif)return b.dif-a.dif;
      return b.gf-a.gf;
    });
  });
  return grouped;
}

function getBestThirds(grouped){
  return Object.keys(GROUPS).map(g=>({...grouped[g][2],group:g}))
    .filter(t=>t&&t.team)
    .sort((a,b)=>{
      if(b.pts!==a.pts)return b.pts-a.pts;
      if(b.dif!==a.dif)return b.dif-a.dif;
      return b.gf-a.gf;
    }).slice(0,8);
}

function getQualified(grouped){
  const q={firsts:{},seconds:{},thirds:[]};
  Object.keys(GROUPS).forEach(g=>{
    q.firsts[g]=grouped[g][0]?.team||'?';
    q.seconds[g]=grouped[g][1]?.team||'?';
  });
  q.thirds=getBestThirds(grouped);
  return q;
}

function buildR32(q){
  const f=q.firsts,s=q.seconds,t=q.thirds.map(x=>x.team);
  return [
    {id:73,home:f.A,away:t[0]||'3°Mejor'},
    {id:74,home:f.C,away:t[1]||'3°Mejor'},
    {id:75,home:f.B,away:t[2]||'3°Mejor'},
    {id:76,home:f.D,away:s.B},
    {id:77,home:f.E,away:t[3]||'3°Mejor'},
    {id:78,home:f.F,away:s.E},
    {id:79,home:f.G,away:t[4]||'3°Mejor'},
    {id:80,home:f.H,away:s.G},
    {id:81,home:f.I,away:t[5]||'3°Mejor'},
    {id:82,home:f.J,away:s.I},
    {id:83,home:f.K,away:t[6]||'3°Mejor'},
    {id:84,home:f.L,away:s.K},
    {id:85,home:s.A,away:s.C},
    {id:86,home:s.D,away:s.F},
    {id:87,home:s.H,away:s.J},
    {id:88,home:s.L,away:t[7]||'3°Mejor'},
  ];
}

function winner(id,home,away,scores){
  const s=scores[id];
  if(!s||s.h===undefined||s.h===null||s.h==='') return null;
  const h=parseInt(s.h),a=parseInt(s.a);
  if(isNaN(h)||isNaN(a)) return null;
  return h>=a?home:away;
}

function buildBracket(r32teams,elimScores){
  const r32=r32teams.map(m=>({
    id:m.id,home:m.home,away:m.away,
    winner:winner(m.id,m.home,m.away,elimScores),
    s:elimScores[m.id]||{}
  }));
  const r16=[
    {id:89,home:r32[0].winner||'?',away:r32[1].winner||'?'},
    {id:90,home:r32[2].winner||'?',away:r32[3].winner||'?'},
    {id:91,home:r32[4].winner||'?',away:r32[5].winner||'?'},
    {id:92,home:r32[6].winner||'?',away:r32[7].winner||'?'},
    {id:93,home:r32[8].winner||'?',away:r32[9].winner||'?'},
    {id:94,home:r32[10].winner||'?',away:r32[11].winner||'?'},
    {id:95,home:r32[12].winner||'?',away:r32[13].winner||'?'},
    {id:96,home:r32[14].winner||'?',away:r32[15].winner||'?'},
  ].map(m=>({...m,winner:winner(m.id,m.home,m.away,elimScores),s:elimScores[m.id]||{}}));
  const qf=[
    {id:97,home:r16[0].winner||'?',away:r16[1].winner||'?'},
    {id:98,home:r16[2].winner||'?',away:r16[3].winner||'?'},
    {id:99,home:r16[4].winner||'?',away:r16[5].winner||'?'},
    {id:100,home:r16[6].winner||'?',away:r16[7].winner||'?'},
  ].map(m=>({...m,winner:winner(m.id,m.home,m.away,elimScores),s:elimScores[m.id]||{}}));
  const sf=[
    {id:101,home:qf[0].winner||'?',away:qf[1].winner||'?'},
    {id:102,home:qf[2].winner||'?',away:qf[3].winner||'?'},
  ].map(m=>{
    const w=winner(m.id,m.home,m.away,elimScores);
    return{...m,winner:w,loser:w?(w===m.home?m.away:m.home):null,s:elimScores[m.id]||{}};
  });
  const fh=sf[0].winner||'?',fa=sf[1].winner||'?';
  const final={id:103,home:fh,away:fa,winner:winner(103,fh,fa,elimScores),s:elimScores[103]||{}};
  const th=sf[0].loser||'?',ta=sf[1].loser||'?';
  const third={id:104,home:th,away:ta,winner:winner(104,th,ta,elimScores),s:elimScores[104]||{}};
  return{r32,r16,qf,sf,final,third};
}

// All elim IDs for collection
const ELIM_IDS=[73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,
                89,90,91,92,93,94,95,96,
                97,98,99,100,
                101,102,
                103,104];
