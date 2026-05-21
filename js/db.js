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
async function dbSavePredictions(pid,preds){
  // preds: [{match_id, home_score, away_score}]
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
  if(error)throw error; return data||{phase:1};
}
async function dbSetPhase(phase){
  const{error}=await sb.from('settings').upsert({id:1,phase},{onConflict:'id'});
  if(error)throw error;
}
async function dbUpdateParticipantPoints(pid,pts,breakdown){
  const{error}=await sb.from('participants').update({total_points:pts,breakdown:JSON.stringify(breakdown)}).eq('id',pid);
  if(error)throw error;
}
async function dbTogglePaid(pid,paid){
  const{error}=await sb.from('participants').update({paid}).eq('id',pid);
  if(error)throw error;
}

// ── SCORING ENGINE ──────────────────────────────────────────────
function scoreAll(predictions, results, phase){
  // predictions: array of {participant_id, match_id, home_score, away_score}
  // results: array of {match_id, home_score, away_score}
  const resultMap={};
  results.forEach(r=>resultMap[r.match_id]={h:r.home_score,a:r.away_score});

  const byParticipant={};
  predictions.forEach(p=>{
    if(!byParticipant[p.participant_id]) byParticipant[p.participant_id]=[];
    byParticipant[p.participant_id].push(p);
  });

  const scores={};
  Object.entries(byParticipant).forEach(([pid,preds])=>{
    const breakdown={group_matches:[],elim_f1:[],elim_f2:[],groups:[],total:0};
    let total=0;

    preds.forEach(p=>{
      const r=resultMap[p.match_id];
      if(!r) return;
      const ph=parseInt(p.home_score),pa=parseInt(p.away_score);
      const rh=r.h,ra=r.a;
      if(isNaN(ph)||isNaN(pa)) return;

      const isGroup=p.match_id<=70;
      const isElim=p.match_id>=71&&p.match_id<=102;
      const isF2=p.phase===2;

      let pts=0,label='';
      if(isGroup){
        if(ph===rh&&pa===ra){pts=SCORING.group_exact;label='✅ Exacto';}
        else if(Math.sign(ph-pa)===Math.sign(rh-ra)){pts=SCORING.group_winner;label='👍 Ganador';}
        else{label='❌ Fallo';}
        breakdown.group_matches.push({match_id:p.match_id,pts,label,pred:`${ph}-${pa}`,real:`${rh}-${ra}`});
      } else if(isElim){
        const predWin=ph>=pa?'home':'away';
        const realWin=rh>=ra?'home':'away';
        const correct=predWin===realWin;
        if(!isF2){
          if(correct&&ph===rh&&pa===ra){pts=SCORING.elim1_exact;label='✅ Exacto F1';}
          else if(correct){pts=SCORING.elim1_winner;label='👍 Clasificante F1';}
          else{pts=SCORING.elim1_miss;label='❌ Fallo F1';}
          breakdown.elim_f1.push({match_id:p.match_id,pts,label,pred:`${ph}-${pa}`,real:`${rh}-${ra}`});
        } else {
          if(correct&&ph===rh&&pa===ra){pts=SCORING.elim2_exact;label='✅ Exacto F2';}
          else if(correct){pts=SCORING.elim2_winner;label='👍 Clasificante F2';}
          else{pts=SCORING.elim2_miss;label='❌ Fallo F2';}
          breakdown.elim_f2.push({match_id:p.match_id,pts,label,pred:`${ph}-${pa}`,real:`${rh}-${ra}`});
        }
        // Champion bonus (match 101 = Final)
        if(p.match_id===101&&correct){
          const champBonus=isF2?SCORING.champion_f2:SCORING.champion_f1;
          pts+=champBonus;
          breakdown.elim_f1.push({match_id:'bonus_champ',pts:champBonus,label:`🏆 Campeón ${isF2?'F2':'F1'}`});
        }
      }
      total+=pts;
    });

    breakdown.total=total;
    scores[pid]={total,breakdown};
  });
  return scores;
}
