const SUPABASE_URL='https://jgybhnyhdniwarnwolrs.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJobnloZG5pd2FybndvbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg1NTYsImV4cCI6MjA5NDg1NDU1Nn0.vzFrYYw0042L4rI3P71WdZWH_n6h7A48344_CPeLgvU';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

async function dbGetParticipants(){
  const{data,error}=await sb.from('participants').select('*').order('total_points',{ascending:false});
  if(error)throw error; return data||[];
}
async function dbGetParticipant(name){
  const{data,error}=await sb.from('participants').select('*').ilike('name',name).maybeSingle();
  if(error)throw error; return data;
}
async function dbCreateParticipant(name){
  const{data,error}=await sb.from('participants').insert({name,total_points:0,paid:false}).select().single();
  if(error)throw error; return data;
}
async function dbDeleteParticipant(id){
  const{error}=await sb.from('participants').delete().eq('id',id);
  if(error)throw error;
}
async function dbSavePredictions(pid,preds){
  const rows=preds.map(p=>({participant_id:pid,...p}));
  const{error}=await sb.from('predictions').upsert(rows,{onConflict:'participant_id,match_id'});
  if(error)throw error;
}
async function dbGetPredictions(pid){
  const{data,error}=await sb.from('predictions').select('*').eq('participant_id',pid);
  if(error)throw error; return data||[];
}
async function dbGetAllPredictions(){
  const{data,error}=await sb.from('predictions').select('*');
  if(error)throw error; return data||[];
}
async function dbSaveResult(matchId,home,away){
  const{error}=await sb.from('results').upsert({match_id:matchId,home_score:home,away_score:away},{onConflict:'match_id'});
  if(error)throw error;
}
async function dbGetResults(){
  const{data,error}=await sb.from('results').select('*');
  if(error)throw error; return data||[];
}
async function dbGetSettings(){
  const{data,error}=await sb.from('settings').select('*').maybeSingle();
  if(error)throw error; return data||{phase:1,phase1_locked:false,phase2_locked:false};
}
async function dbSaveSettings(settings){
  const{error}=await sb.from('settings').upsert({id:1,...settings},{onConflict:'id'});
  if(error)throw error;
}
async function dbUpdatePoints(pid,pts,breakdown){
  const{error}=await sb.from('participants').update({
    total_points:pts,
    breakdown:JSON.stringify(breakdown)
  }).eq('id',pid);
  if(error)throw error;
}
async function dbTogglePaid(pid,paid){
  const{error}=await sb.from('participants').update({paid}).eq('id',pid);
  if(error)throw error;
}

// ══════════════════════════════════════════════════════════════
// SCORING ENGINE COMPLETO
// ══════════════════════════════════════════════════════════════
function calcAllPoints(participantPreds, realResults, realClassified) {
  // participantPreds: [{match_id, home_score, away_score, phase}]
  // realResults: {matchId: {h, a}}
  // realClassified: {firsts:{A:'México',...}, seconds:{...}, thirds:[...]} o null

  const breakdown = {
    group_matches: [],    // [{match_id, pred, real, pts, label}]
    group_classify: [],   // [{group, pred1, pred2, real1, real2, pts, label}]
    elim_f1: [],          // [{match_id, pred, real, pts, label}]
    elim_f2: [],          // [{match_id, pred, real, pts, label}]
    champion: [],         // [{pts, label}]
    pts_groups: 0,
    pts_classify: 0,
    pts_elim_f1: 0,
    pts_elim_f2: 0,
    pts_champion: 0,
    total: 0
  };

  // ── 1. Puntos por partidos de grupos ──────────────────────
  const groupPreds = participantPreds.filter(p => p.match_id >= 1 && p.match_id <= 72);
  groupPreds.forEach(p => {
    const r = realResults[p.match_id];
    if (!r) return;
    const ph = parseInt(p.home_score), pa = parseInt(p.away_score);
    const rh = r.h, ra = r.a;
    if (isNaN(ph) || isNaN(pa)) return;
    let pts = 0, label = '❌';
    if (ph === rh && pa === ra) { pts = SCORING.group_exact; label = '✅ Exacto'; }
    else if (Math.sign(ph - pa) === Math.sign(rh - ra)) { pts = SCORING.group_winner; label = '👍 Ganador'; }
    breakdown.group_matches.push({ match_id: p.match_id, pred: `${ph}-${pa}`, real: `${rh}-${ra}`, pts, label });
    breakdown.pts_groups += pts;
  });

  // ── 2. Puntos por clasificación de grupos ─────────────────
  // Solo si hay resultados reales de clasificados
  if (realClassified) {
    // Build participant's predicted standings from their group predictions
    const predScores = {};
    groupPreds.forEach(p => {
      predScores[p.match_id] = { home: p.home_score, away: p.away_score };
    });
    const predStandings = calcStandings(predScores);
    const predQ = getQualified(predStandings);

    Object.keys(GROUPS).forEach(grp => {
      const pred1 = predQ.firsts[grp] || '?';
      const pred2 = predQ.seconds[grp] || '?';
      const real1 = realClassified.firsts[grp] || '?';
      const real2 = realClassified.seconds[grp] || '?';

      let pts = 0, label = '❌ Ninguno';
      if (pred1 === real1 && pred2 === real2) {
        pts = SCORING.group_both_order; label = '✅ 1° y 2° exactos';
      } else if (pred1 === real2 && pred2 === real1) {
        pts = SCORING.group_both_swap; label = '🔄 1° y 2° invertidos';
      } else if (pred1 === real1 || pred1 === real2 || pred2 === real1 || pred2 === real2) {
        pts = SCORING.group_one; label = '👍 Uno de los dos';
      }
      // Check if predicted third matches a real best-third
      if (pts === 0) {
        const pred3 = predStandings[grp]?.[2]?.team;
        const realThirds = realClassified.thirds?.map(t => t.team) || [];
        if (pred3 && realThirds.includes(pred3)) {
          pts = SCORING.group_one; label = '⚡ 3° correcto';
        }
      }
      breakdown.group_classify.push({ group: grp, pred1, pred2, real1, real2, pts, label });
      breakdown.pts_classify += pts;
    });

    // ── Penalización por clasificados incorrectos al activar F2 ──────────
    // -2 pts por cada equipo real clasificado que NO estaba en los 32 predichos
    const pred32 = new Set();
    Object.keys(GROUPS).forEach(grp => {
      if (predQ.firsts[grp] && predQ.firsts[grp] !== '?') pred32.add(predQ.firsts[grp]);
      if (predQ.seconds[grp] && predQ.seconds[grp] !== '?') pred32.add(predQ.seconds[grp]);
    });
    predQ.thirds.forEach(t => { if(t.team) pred32.add(t.team); });

    const real32 = new Set();
    Object.keys(GROUPS).forEach(grp => {
      if (realClassified.firsts[grp] && realClassified.firsts[grp] !== '?') real32.add(realClassified.firsts[grp]);
      if (realClassified.seconds[grp] && realClassified.seconds[grp] !== '?') real32.add(realClassified.seconds[grp]);
    });
    realClassified.thirds.forEach(t => { if(t.team) real32.add(t.team); });

    let penaltyPts = 0;
    const penaltyDetails = [];
    real32.forEach(team => {
      if (!pred32.has(team)) {
        penaltyPts -= 2;
        penaltyDetails.push({ team, pts: -2, label: `❌ ${team} no estaba en tus 32` });
      }
    });
    if (penaltyPts < 0) {
      breakdown.group_classify.push({
        group: 'PENALIZACIÓN', pred1: '', pred2: '',
        real1: `${penaltyDetails.length} equipos inesperados`,
        real2: '', pts: penaltyPts,
        label: `⚠️ ${penaltyDetails.length} equipos reales no predichos × -2 pts`,
        details: penaltyDetails
      });
      breakdown.pts_classify += penaltyPts;
    }
  }

  // ── 3. Puntos por eliminatorias ───────────────────────────
  const elimPreds = participantPreds.filter(p => p.match_id >= 101);
  elimPreds.forEach(p => {
    const r = realResults[p.match_id];
    if (!r) return;
    const ph = parseInt(p.home_score), pa = parseInt(p.away_score);
    const rh = r.h, ra = r.a;
    if (isNaN(ph) || isNaN(pa)) return;
    const isF2 = parseInt(p.phase) === 2;
    const correct = Math.sign(ph - pa) === Math.sign(rh - ra);
    const exact = ph === rh && pa === ra;
    let pts = 0, label = '❌ Fallo';
    if (!isF2) {
      if (exact) { pts = SCORING.elim1_exact; label = '✅ Exacto F1'; }
      else if (correct) { pts = SCORING.elim1_winner; label = '👍 Clasificante F1'; }
      else { pts = SCORING.elim1_miss; label = '❌ Fallo F1'; }
      // Bonus campeón (partido 103 = Final)
      if (p.match_id === 131 && correct) {
        breakdown.champion.push({ pts: SCORING.champion_f1, label: '🏆 Campeón F1' });
        breakdown.pts_champion += SCORING.champion_f1;
      }
      if (p.match_id === 131 && !correct) {
        // Subcampeón: el perdedor fue el predicho ganador
        const predWinner = ph >= pa ? 'home' : 'away';
        // Check if predicted winner matches real runner-up (real loser)
        // This is handled at match level — simplified for now
      }
      breakdown.elim_f1.push({ match_id: p.match_id, pred: `${ph}-${pa}`, real: `${rh}-${ra}`, pts, label });
      breakdown.pts_elim_f1 += pts;
    } else {
      if (exact) { pts = SCORING.elim2_exact; label = '✅ Exacto F2'; }
      else if (correct) { pts = SCORING.elim2_winner; label = '👍 Clasificante F2'; }
      else { pts = SCORING.elim2_miss; label = '❌ Fallo F2'; }
      if (p.match_id === 131 && correct) {
        breakdown.champion.push({ pts: SCORING.champion_f2, label: '🏆 Campeón F2' });
        breakdown.pts_champion += SCORING.champion_f2;
      }
      breakdown.elim_f2.push({ match_id: p.match_id, pred: `${ph}-${pa}`, real: `${rh}-${ra}`, pts, label });
      breakdown.pts_elim_f2 += pts;
    }
  });

  breakdown.total = breakdown.pts_groups + breakdown.pts_classify +
                    breakdown.pts_elim_f1 + breakdown.pts_elim_f2 + breakdown.pts_champion;
  return breakdown;
}

async function dbCreateParticipantWithPin(name, pin){
  const{data,error}=await sb.from('participants').insert({name,pin,total_points:0,paid:false}).select().single();
  if(error)throw error; return data;
}

// Update calcAllPoints to use new elim ID ranges
// Group matches: 1-72, Elim: 101-132
function isGroupMatch(id){ return id >= 1 && id <= 72; }
function isElimMatch(id){ return id >= 101 && id <= 132; }
function isFinalMatch(id){ return id === 131; }

async function dbGetRealClassified(){
  const results = await dbGetResults();
  const groupScores = {};
  results.filter(r => r.match_id <= 72).forEach(r => {
    groupScores[r.match_id] = { home: r.home_score, away: r.away_score };
  });
  const grouped = calcStandings(groupScores);
  return getQualified(grouped);
}

async function dbSaveRealClassified(classified){
  const{error}=await sb.from('settings').upsert({
    id:1,
    real_classified: JSON.stringify(classified)
  },{onConflict:'id'});
  if(error)throw error;
}
