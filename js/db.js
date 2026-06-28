const SUPABASE_URL='https://jgybhnyhdniwarnwolrs.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJobnloZG5pd2FybndvbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg1NTYsImV4cCI6MjA5NDg1NDU1Nn0.vzFrYYw0042L4rI3P71WdZWH_n6h7A48344_CPeLgvU';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// ── Credenciales locales: el PIN del participante logueado y la
// contraseña del admin viajan a funciones del SERVIDOR que las validan.
// La clave anónima por sí sola no puede escribir nada (ver security_*.sql).
function _myPin(){
  try{return JSON.parse(localStorage.getItem('polla_p')||'{}').pin||'';}catch(e){return '';}
}
function _adminPass(){ return sessionStorage.getItem('polla_admin')||''; }

async function dbGetParticipants(){
  const{data,error}=await sb.from('participants')
    .select('id,name,total_points,paid,breakdown,created_at')
    .order('total_points',{ascending:false});
  if(error)throw error; return data||[];
}
async function dbVerifyLogin(name,pin){
  const{data,error}=await sb.rpc('verify_login',{p_name:name,p_pin:pin});
  if(error)throw error; return (data&&data[0])||null;
}
async function dbDeleteParticipant(id){
  const{error}=await sb.rpc('admin_delete_participant',{p_pass:_adminPass(),p_id:id});
  if(error)throw error;
}
async function dbSavePredictions(pid,preds){
  const{error}=await sb.rpc('save_predictions',{p_pid:pid,p_pin:_myPin(),p_rows:preds});
  if(error)throw error;
}
async function dbGetPredictions(pid){
  const{data,error}=await sb.from('predictions').select('*').eq('participant_id',pid);
  if(error)throw error; return data||[];
}
async function dbGetAllPredictions(){
  // Supabase devuelve máximo 1000 filas por consulta; con ~20 participantes
  // hay ~2000 predicciones, así que hay que paginar o se truncan los datos
  // (rompía el panel de avance y el recálculo de puntos).
  const all=[];
  for(let from=0;;from+=1000){
    const{data,error}=await sb.from('predictions').select('*').range(from,from+999);
    if(error)throw error;
    all.push(...(data||[]));
    if(!data||data.length<1000)break;
  }
  return all;
}
async function dbDeleteElimPredictions(pid,phase){
  // Borra SOLO el bracket (partidos 101+) de la fase dada; los grupos no se tocan
  const{error}=await sb.rpc('delete_bracket',{p_pid:pid,p_pin:_myPin(),p_phase:phase});
  if(error)throw error;
}
async function dbSaveResult(matchId,home,away){
  const{error}=await sb.rpc('admin_save_result',{p_pass:_adminPass(),p_mid:matchId,p_h:home,p_a:away});
  if(error)throw error;
}
async function dbDeleteResult(matchId){
  const{error}=await sb.rpc('admin_delete_result',{p_pass:_adminPass(),p_mid:matchId});
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
  const{error}=await sb.rpc('admin_save_settings',{
    p_pass:_adminPass(),
    p_phase:settings.phase||1,
    p_l1:settings.phase1_locked||false,
    p_l2:settings.phase2_locked||false
  });
  if(error)throw error;
}
async function dbUpdatePoints(pid,pts,breakdown){
  const{error}=await sb.rpc('admin_update_points',{
    p_pass:_adminPass(),p_id:pid,p_points:pts,p_breakdown:JSON.stringify(breakdown)
  });
  if(error)throw error;
}
async function dbTogglePaid(pid,paid){
  const{error}=await sb.rpc('admin_toggle_paid',{p_pass:_adminPass(),p_id:pid,p_paid:paid});
  if(error)throw error;
}
async function dbAdminCheck(pass){
  const{data,error}=await sb.rpc('admin_check',{p_pass:pass});
  if(error)throw error; return data===true;
}
async function dbAdminListParticipants(){
  const{data,error}=await sb.rpc('admin_list_participants',{p_pass:_adminPass()});
  if(error)throw error; return data||[];
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

  // ── 3. Puntos por eliminatorias (comparación por EQUIPOS) ─────────────
  // El bracket predicho puede tener equipos distintos al real en un mismo
  // cruce, así que se reconstruyen ambos brackets completos y se compara
  // QUÉ EQUIPO avanza en cada cruce — no el marcador por posición.
  // Requiere realClassified (los resultados eliminatorios reales solo
  // existen después de que terminan los grupos).
  if (realClassified) {
    const elimScoresF1 = {}, elimScoresF2 = {}, realElimScores = {};
    participantPreds.filter(p => p.match_id >= 101).forEach(p => {
      const h = parseInt(p.home_score), a = parseInt(p.away_score);
      if (isNaN(h) || isNaN(a)) return;
      if (parseInt(p.phase) === 2) elimScoresF2[p.match_id] = { h, a };
      else elimScoresF1[p.match_id] = { h, a };
    });
    Object.keys(realResults).forEach(id => {
      if (parseInt(id) >= 101) realElimScores[id] = realResults[id];
    });

    // F1 usa la estructura LEGACY (lo que cada compa llenó, congelado);
    // F2 usa la estructura OFICIAL. Cada fase se compara contra el bracket
    // real construido con SU MISMA estructura, para que el cotejo sea coherente.
    const realBracketF1 = buildBracketLegacy(buildR32Legacy(realClassified), realElimScores);
    const realBracketF2 = buildBracket(buildR32(realClassified), realElimScores);
    // Bracket F1 del participante: SUS clasificados predichos + sus marcadores F1
    const predScoresG = {};
    participantPreds.filter(p => p.match_id <= 72).forEach(p => {
      predScoresG[p.match_id] = { home: p.home_score, away: p.away_score };
    });
    const predQF1 = getQualified(calcStandings(predScoresG));
    const predBracketF1 = buildBracketLegacy(buildR32Legacy(predQF1), elimScoresF1);
    // Bracket F2 del participante: clasificados REALES + sus marcadores F2
    const predBracketF2 = buildBracket(buildR32(realClassified), elimScoresF2);

    const flat = b => [...b.r32, ...b.r16, ...b.qf, ...b.sf, b.final, b.third];
    const roundName = id => id <= 116 ? 'R32' : id <= 124 ? 'Octavos' : id <= 128 ? 'Cuartos' : id <= 130 ? 'Semis' : id === 131 ? 'Final' : '3er puesto';

    const scoreElim = (predBracket, realBracket, isF2) => {
      const realMap = {};
      flat(realBracket).forEach(m => realMap[m.id] = m);
      flat(predBracket).forEach(pm => {
        if (!pm.winner || pm.winner === '?' || pm.home === '?' || pm.away === '?') return; // sin predicción válida
        const rm = realMap[pm.id];
        if (!rm || !rm.winner || rm.winner === '?') return; // sin resultado real aún
        const predLoser = pm.winner === pm.home ? pm.away : pm.home;
        const realLoser = rm.winner === rm.home ? rm.away : rm.home;
        // Marcador alineado al ganador para que "exacto" no dependa del lado
        const ps = pm.winner === pm.home ? [pm.s.h, pm.s.a] : [pm.s.a, pm.s.h];
        const rs = rm.winner === rm.home ? [rm.s.h, rm.s.a] : [rm.s.a, rm.s.h];
        const sameWinner = pm.winner === rm.winner;
        const exact = sameWinner && predLoser === realLoser && ps[0] === rs[0] && ps[1] === rs[1];
        let pts, label;
        if (exact)           { pts = isF2 ? SCORING.elim2_exact  : SCORING.elim1_exact;  label = '✅ Exacto'; }
        else if (sameWinner) { pts = isF2 ? SCORING.elim2_winner : SCORING.elim1_winner; label = '👍 Clasificante'; }
        else                 { pts = isF2 ? SCORING.elim2_miss   : SCORING.elim1_miss;   label = '❌ Fallo'; }
        const row = {
          match_id: pm.id,
          pred: `${pm.home} ${pm.s.h}-${pm.s.a} ${pm.away}`,
          real: `${rm.home} ${rm.s.h}-${rm.s.a} ${rm.away}`,
          pts, label: `${label} · ${roundName(pm.id)}`
        };
        if (isF2) { breakdown.elim_f2.push(row); breakdown.pts_elim_f2 += pts; }
        else      { breakdown.elim_f1.push(row); breakdown.pts_elim_f1 += pts; }
      });

      // Bonos campeón / subcampeón (por nombre de equipo)
      const predChamp = predBracket.final.winner, realChamp = realBracket.final.winner;
      if (predChamp && predChamp !== '?' && realChamp && realChamp !== '?') {
        const realRunner = realChamp === realBracket.final.home ? realBracket.final.away : realBracket.final.home;
        if (predChamp === realChamp) {
          const b = isF2 ? SCORING.champion_f2 : SCORING.champion_f1;
          breakdown.champion.push({ pts: b, label: `🏆 Campeón ${isF2 ? 'F2' : 'F1'}: ${predChamp}` });
          breakdown.pts_champion += b;
        } else if (predChamp === realRunner) {
          const b = isF2 ? SCORING.runner_f2 : SCORING.runner_f1;
          breakdown.champion.push({ pts: b, label: `🥈 Subcampeón ${isF2 ? 'F2' : 'F1'}: ${predChamp} llegó a la final` });
          breakdown.pts_champion += b;
        }
      }
    };
    scoreElim(predBracketF1, realBracketF1, false);
    scoreElim(predBracketF2, realBracketF2, true);
  }

  breakdown.total = breakdown.pts_groups + breakdown.pts_classify +
                    breakdown.pts_elim_f1 + breakdown.pts_elim_f2 + breakdown.pts_champion;
  return breakdown;
}

async function dbCreateParticipantWithPin(name, pin){
  const{data,error}=await sb.rpc('admin_create_participant',{p_pass:_adminPass(),p_name:name,p_pin:pin});
  if(error)throw error; return (data&&data[0])||data;
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

