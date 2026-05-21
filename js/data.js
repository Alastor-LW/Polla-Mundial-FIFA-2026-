const SCORING={group_exact:3,group_winner:1,group_both_order:10,group_both_swap:6,group_one:3,elim1_winner:5,elim1_exact:8,elim1_miss:-1,elim2_winner:3,elim2_exact:5,elim2_miss:-2,champion_f1:40,runner_f1:20,champion_f2:20,runner_f2:10};

const GROUPS={A:["México","Corea del Sur","Sudáfrica","Rep. Checa"],B:["Canadá","Bosnia-Herz.","Qatar","Suiza"],C:["Brasil","Marruecos","Haití","Escocia"],D:["EE.UU.","Paraguay","Australia","Turquía"],E:["Alemania","C. de Marfil","Ecuador","Curazao"],F:["Países Bajos","Suecia","Túnez","Japón"],G:["Bélgica","Egipto","Irán","Nueva Zelanda"],H:["España","Cabo Verde","Arabia Saudí","Uruguay"],I:["Francia","Senegal","Irak","Noruega"],J:["Argentina","Argelia","Austria","Jordania"],K:["Portugal","DR Congo","Uzbekistán","Colombia"],L:["Inglaterra","Croacia","Ghana","Panamá"]};

const GROUP_MATCHES=[
  {id:1,date:"Jun 11",time:"3 PM",group:"A",home:"México",away:"Sudáfrica",venue:"Ciudad de México"},
  {id:2,date:"Jun 11",time:"10 PM",group:"A",home:"Corea del Sur",away:"Rep. Checa",venue:"Zapopan"},
  {id:3,date:"Jun 12",time:"3 PM",group:"B",home:"Canadá",away:"Bosnia-Herz.",venue:"Toronto"},
  {id:4,date:"Jun 12",time:"9 PM",group:"D",home:"EE.UU.",away:"Paraguay",venue:"Inglewood"},
  {id:5,date:"Jun 13",time:"3 PM",group:"B",home:"Qatar",away:"Suiza",venue:"Santa Clara"},
  {id:6,date:"Jun 13",time:"6 PM",group:"C",home:"Brasil",away:"Marruecos",venue:"E. Rutherford"},
  {id:7,date:"Jun 13",time:"9 PM",group:"C",home:"Haití",away:"Escocia",venue:"Foxborough"},
  {id:8,date:"Jun 14",time:"3 PM",group:"E",home:"Alemania",away:"Curazao",venue:"Toronto"},
  {id:9,date:"Jun 14",time:"6 PM",group:"F",home:"Países Bajos",away:"Túnez",venue:"Guadalajara"},
  {id:10,date:"Jun 14",time:"9 PM",group:"E",home:"C. de Marfil",away:"Ecuador",venue:"Kansas City"},
  {id:11,date:"Jun 15",time:"1 PM",group:"H",home:"España",away:"Cabo Verde",venue:"Atlanta"},
  {id:12,date:"Jun 15",time:"6 PM",group:"G",home:"Bélgica",away:"Egipto",venue:"Seattle"},
  {id:13,date:"Jun 15",time:"6 PM",group:"H",home:"Arabia Saudí",away:"Uruguay",venue:"Miami"},
  {id:14,date:"Jun 16",time:"12 AM",group:"G",home:"Irán",away:"Nueva Zelanda",venue:"Inglewood"},
  {id:15,date:"Jun 16",time:"3 PM",group:"I",home:"Francia",away:"Senegal",venue:"E. Rutherford"},
  {id:16,date:"Jun 16",time:"6 PM",group:"I",home:"Irak",away:"Noruega",venue:"Foxborough"},
  {id:17,date:"Jun 16",time:"9 PM",group:"J",home:"Argentina",away:"Argelia",venue:"Kansas City"},
  {id:18,date:"Jun 17",time:"12 AM",group:"J",home:"Austria",away:"Jordania",venue:"Santa Clara"},
  {id:19,date:"Jun 17",time:"1 PM",group:"K",home:"Portugal",away:"DR Congo",venue:"Houston"},
  {id:20,date:"Jun 17",time:"4 PM",group:"L",home:"Inglaterra",away:"Croacia",venue:"Arlington"},
  {id:21,date:"Jun 17",time:"7 PM",group:"L",home:"Ghana",away:"Panamá",venue:"Toronto"},
  {id:22,date:"Jun 17",time:"10 PM",group:"K",home:"Uzbekistán",away:"Colombia",venue:"Ciudad de México"},
  {id:23,date:"Jun 18",time:"12 PM",group:"A",home:"Rep. Checa",away:"Sudáfrica",venue:"Atlanta"},
  {id:24,date:"Jun 18",time:"3 PM",group:"B",home:"Suiza",away:"Bosnia-Herz.",venue:"Inglewood"},
  {id:25,date:"Jun 18",time:"6 PM",group:"B",home:"Canadá",away:"Qatar",venue:"Vancouver"},
  {id:26,date:"Jun 18",time:"11 PM",group:"A",home:"México",away:"Corea del Sur",venue:"Zapopan"},
  {id:27,date:"Jun 19",time:"3 PM",group:"D",home:"EE.UU.",away:"Australia",venue:"Seattle"},
  {id:28,date:"Jun 19",time:"6 PM",group:"C",home:"Escocia",away:"Marruecos",venue:"Foxborough"},
  {id:29,date:"Jun 19",time:"9 PM",group:"C",home:"Brasil",away:"Haití",venue:"Filadelfia"},
  {id:30,date:"Jun 20",time:"12 AM",group:"D",home:"Turquía",away:"Paraguay",venue:"Santa Clara"},
  {id:31,date:"Jun 20",time:"1 PM",group:"F",home:"Países Bajos",away:"Suecia",venue:"Houston"},
  {id:32,date:"Jun 20",time:"4 PM",group:"E",home:"Alemania",away:"C. de Marfil",venue:"Toronto"},
  {id:33,date:"Jun 20",time:"8 PM",group:"E",home:"Ecuador",away:"Curazao",venue:"Kansas City"},
  {id:34,date:"Jun 20",time:"10 PM",group:"F",home:"Túnez",away:"Japón",venue:"Guadalajara"},
  {id:35,date:"Jun 21",time:"3 PM",group:"G",home:"Bélgica",away:"Nueva Zelanda",venue:"Seattle"},
  {id:36,date:"Jun 21",time:"6 PM",group:"H",home:"España",away:"Arabia Saudí",venue:"Miami"},
  {id:37,date:"Jun 21",time:"9 PM",group:"G",home:"Irán",away:"Egipto",venue:"Inglewood"},
  {id:38,date:"Jun 21",time:"9 PM",group:"H",home:"Cabo Verde",away:"Uruguay",venue:"Atlanta"},
  {id:39,date:"Jun 22",time:"3 PM",group:"I",home:"Francia",away:"Irak",venue:"E. Rutherford"},
  {id:40,date:"Jun 22",time:"6 PM",group:"J",home:"Argentina",away:"Austria",venue:"Kansas City"},
  {id:41,date:"Jun 22",time:"9 PM",group:"I",home:"Senegal",away:"Noruega",venue:"Foxborough"},
  {id:42,date:"Jun 23",time:"12 AM",group:"J",home:"Argelia",away:"Jordania",venue:"Santa Clara"},
  {id:43,date:"Jun 23",time:"1 PM",group:"L",home:"Inglaterra",away:"Ghana",venue:"Arlington"},
  {id:44,date:"Jun 23",time:"4 PM",group:"K",home:"Portugal",away:"Uzbekistán",venue:"Houston"},
  {id:45,date:"Jun 23",time:"7 PM",group:"K",home:"DR Congo",away:"Colombia",venue:"Ciudad de México"},
  {id:46,date:"Jun 23",time:"10 PM",group:"L",home:"Croacia",away:"Panamá",venue:"Toronto"},
  {id:47,date:"Jun 24",time:"3 PM",group:"A",home:"México",away:"Rep. Checa",venue:"Ciudad de México"},
  {id:48,date:"Jun 24",time:"3 PM",group:"A",home:"Corea del Sur",away:"Sudáfrica",venue:"Monterrey"},
  {id:49,date:"Jun 24",time:"9 PM",group:"B",home:"Suiza",away:"Qatar",venue:"Kansas City"},
  {id:50,date:"Jun 24",time:"9 PM",group:"B",home:"Bosnia-Herz.",away:"Canadá",venue:"Inglewood"},
  {id:51,date:"Jun 25",time:"3 PM",group:"C",home:"Brasil",away:"Escocia",venue:"E. Rutherford"},
  {id:52,date:"Jun 25",time:"3 PM",group:"C",home:"Marruecos",away:"Haití",venue:"Foxborough"},
  {id:53,date:"Jun 25",time:"9 PM",group:"D",home:"Paraguay",away:"Australia",venue:"Santa Clara"},
  {id:54,date:"Jun 25",time:"9 PM",group:"D",home:"Turquía",away:"EE.UU.",venue:"Seattle"},
  {id:55,date:"Jun 26",time:"3 PM",group:"E",home:"C. de Marfil",away:"Curazao",venue:"Toronto"},
  {id:56,date:"Jun 26",time:"3 PM",group:"E",home:"Ecuador",away:"Alemania",venue:"Kansas City"},
  {id:57,date:"Jun 26",time:"9 PM",group:"F",home:"Países Bajos",away:"Japón",venue:"Houston"},
  {id:58,date:"Jun 26",time:"9 PM",group:"F",home:"Suecia",away:"Túnez",venue:"Guadalajara"},
  {id:59,date:"Jun 27",time:"3 PM",group:"G",home:"Nueva Zelanda",away:"Egipto",venue:"Inglewood"},
  {id:60,date:"Jun 27",time:"3 PM",group:"G",home:"Irán",away:"Bélgica",venue:"Seattle"},
  {id:61,date:"Jun 27",time:"9 PM",group:"H",home:"Arabia Saudí",away:"Cabo Verde",venue:"Miami"},
  {id:62,date:"Jun 27",time:"9 PM",group:"H",home:"Uruguay",away:"España",venue:"Atlanta"},
  {id:63,date:"Jun 28",time:"3 PM",group:"I",home:"Irak",away:"Francia",venue:"Foxborough"},
  {id:64,date:"Jun 28",time:"3 PM",group:"I",home:"Noruega",away:"Senegal",venue:"E. Rutherford"},
  {id:65,date:"Jun 28",time:"9 PM",group:"J",home:"Jordania",away:"Argentina",venue:"Santa Clara"},
  {id:66,date:"Jun 28",time:"9 PM",group:"J",home:"Austria",away:"Argelia",venue:"Kansas City"},
  {id:67,date:"Jun 29",time:"3 PM",group:"K",home:"Colombia",away:"Portugal",venue:"Houston"},
  {id:68,date:"Jun 29",time:"3 PM",group:"K",home:"Uzbekistán",away:"DR Congo",venue:"Ciudad de México"},
  {id:69,date:"Jun 29",time:"9 PM",group:"L",home:"Croacia",away:"Ghana",venue:"Toronto"},
  {id:70,date:"Jun 29",time:"9 PM",group:"L",home:"Panamá",away:"Inglaterra",venue:"Arlington"},
];

// ── STANDINGS ENGINE ─────────────────────────────────────────────
function calcStandings(scores){
  const st={};
  Object.keys(GROUPS).forEach(g=>GROUPS[g].forEach(t=>{st[t]={team:t,group:g,pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dif:0};}));
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

// Build R32 matchups from qualified teams
function buildR32(q){
  // Official FIFA 2026 bracket pairings
  const f=q.firsts, s=q.seconds, t=q.thirds.map(x=>x.team);
  return [
    {id:71,home:f.A,away:t[0]||'3°Mejor'},  // 1A vs mejor 3°
    {id:72,home:f.C,away:t[1]||'3°Mejor'},  // 1C vs mejor 3°
    {id:73,home:f.B,away:t[2]||'3°Mejor'},  // 1B vs mejor 3°
    {id:74,home:f.D,away:s.B},              // 1D vs 2B
    {id:75,home:f.E,away:t[3]||'3°Mejor'},  // 1E vs mejor 3°
    {id:76,home:f.F,away:s.E},              // 1F vs 2E
    {id:77,home:f.G,away:t[4]||'3°Mejor'},  // 1G vs mejor 3°
    {id:78,home:f.H,away:s.G},              // 1H vs 2G
    {id:79,home:f.I,away:t[5]||'3°Mejor'},  // 1I vs mejor 3°
    {id:80,home:f.J,away:s.I},              // 1J vs 2I
    {id:81,home:f.K,away:t[6]||'3°Mejor'},  // 1K vs mejor 3°
    {id:82,home:f.L,away:s.K},              // 1L vs 2K
    {id:83,home:s.A,away:s.C},              // 2A vs 2C
    {id:84,home:s.D,away:s.F},              // 2D vs 2F
    {id:85,home:s.H,away:s.J},              // 2H vs 2J
    {id:86,home:s.L,away:t[7]||'3°Mejor'},  // 2L vs mejor 3°
  ];
}

// Simulate bracket: given scores for elim matches, determine winners
function getWinner(matchId, scores){
  const s=scores[matchId];
  if(!s||s.home===''||s.home===null) return null;
  const h=parseInt(s.home),a=parseInt(s.away);
  if(isNaN(h)||isNaN(a)) return null;
  // In knockouts if draw, home team advances (simplified - no penalties)
  if(h>=a) return 'home'; else return 'away';
}

function buildKnockoutBracket(r32teams, elimScores){
  // R32 winners → R16
  const r32w=r32teams.map((m,i)=>{
    const s=elimScores[m.id];
    if(!s||s.home===''||s.home===null) return {home:m.home,away:m.away,winner:null,matchId:m.id};
    const h=parseInt(s.home),a=parseInt(s.away);
    const w=isNaN(h)||isNaN(a)?null:(h>=a?m.home:m.away);
    return {home:m.home,away:m.away,winner:w,score:{h,a},matchId:m.id};
  });

  // R16: pairs of R32 winners
  const r16=[
    {id:87,home:r32w[0]?.winner||'?',away:r32w[1]?.winner||'?'},
    {id:88,home:r32w[2]?.winner||'?',away:r32w[3]?.winner||'?'},
    {id:89,home:r32w[4]?.winner||'?',away:r32w[5]?.winner||'?'},
    {id:90,home:r32w[6]?.winner||'?',away:r32w[7]?.winner||'?'},
    {id:91,home:r32w[8]?.winner||'?',away:r32w[9]?.winner||'?'},
    {id:92,home:r32w[10]?.winner||'?',away:r32w[11]?.winner||'?'},
    {id:93,home:r32w[12]?.winner||'?',away:r32w[13]?.winner||'?'},
    {id:94,home:r32w[14]?.winner||'?',away:r32w[15]?.winner||'?'},
  ].map(m=>{
    const s=elimScores[m.id];
    if(!s||s.home===''||s.home===null) return {...m,winner:null};
    const h=parseInt(s.home),a=parseInt(s.away);
    return {...m,winner:isNaN(h)||isNaN(a)?null:(h>=a?m.home:m.away),score:{h,a}};
  });

  // QF
  const qf=[
    {id:95,home:r16[0]?.winner||'?',away:r16[1]?.winner||'?'},
    {id:96,home:r16[2]?.winner||'?',away:r16[3]?.winner||'?'},
    {id:97,home:r16[4]?.winner||'?',away:r16[5]?.winner||'?'},
    {id:98,home:r16[6]?.winner||'?',away:r16[7]?.winner||'?'},
  ].map(m=>{
    const s=elimScores[m.id];
    if(!s||s.home===''||s.home===null) return {...m,winner:null};
    const h=parseInt(s.home),a=parseInt(s.away);
    return {...m,winner:isNaN(h)||isNaN(a)?null:(h>=a?m.home:m.away),score:{h,a}};
  });

  // SF
  const sf=[
    {id:99, home:qf[0]?.winner||'?',away:qf[1]?.winner||'?'},
    {id:100,home:qf[2]?.winner||'?',away:qf[3]?.winner||'?'},
  ].map(m=>{
    const s=elimScores[m.id];
    if(!s||s.home===''||s.home===null) return {...m,winner:null,loser:null};
    const h=parseInt(s.home),a=parseInt(s.away);
    const win=isNaN(h)||isNaN(a)?null:(h>=a?m.home:m.away);
    const los=win===m.home?m.away:m.home;
    return {...m,winner:win,loser:los,score:{h,a}};
  });

  // Final & 3rd
  const final={id:101,home:sf[0]?.winner||'?',away:sf[1]?.winner||'?'};
  const third={id:102,home:sf[0]?.loser||'?', away:sf[1]?.loser||'?'};
  [final,third].forEach(m=>{
    const s=elimScores[m.id];
    if(!s||s.home===''||s.home===null){m.winner=null;return;}
    const h=parseInt(s.home),a=parseInt(s.away);
    m.winner=isNaN(h)||isNaN(a)?null:(h>=a?m.home:m.away);
    m.score={h,a};
  });

  return {r32:r32w,r16,qf,sf,final,third};
}
