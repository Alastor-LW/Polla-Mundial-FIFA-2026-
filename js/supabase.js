const SUPABASE_URL = 'https://jgybhnyhdniwarnwolrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJobnloZG5pd2FybndvbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg1NTYsImV4cCI6MjA5NDg1NDU1Nn0.vzFrYYw0042L4rI3P71WdZWH_n6h7A48344_CPeLgvU';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── DB helpers ────────────────────────────────────────────────────
async function getParticipants() {
  const { data, error } = await sb.from('participants').select('*').order('total_points', { ascending: false });
  if (error) throw error;
  return data;
}

async function getParticipantByName(name) {
  const { data, error } = await sb.from('participants').select('*').ilike('name', name).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createParticipant(name) {
  const { data, error } = await sb.from('participants').insert({ name, total_points: 0, paid: false }).select().single();
  if (error) throw error;
  return data;
}

async function savePredictions(participantId, predictions) {
  // predictions: array of {match_id, home_score, away_score}
  const rows = predictions.map(p => ({ participant_id: participantId, ...p }));
  // upsert so they can update phase 1 before deadline
  const { error } = await sb.from('match_predictions').upsert(rows, { onConflict: 'participant_id,match_id' });
  if (error) throw error;
}

async function saveGroupPredictions(participantId, groupPreds) {
  // groupPreds: array of {group_key, first_place, second_place}
  const rows = groupPreds.map(g => ({ participant_id: participantId, ...g }));
  const { error } = await sb.from('group_predictions').upsert(rows, { onConflict: 'participant_id,group_key' });
  if (error) throw error;
}

async function saveChampionPrediction(participantId, champion, runnerUp) {
  const { error } = await sb.from('champion_predictions').upsert(
    { participant_id: participantId, champion, runner_up: runnerUp },
    { onConflict: 'participant_id' }
  );
  if (error) throw error;
}

async function getResults() {
  const { data, error } = await sb.from('results').select('*');
  if (error) throw error;
  return data || [];
}

async function saveResult(matchId, homeScore, awayScore) {
  const { error } = await sb.from('results').upsert(
    { match_id: matchId, home_score: homeScore, away_score: awayScore },
    { onConflict: 'match_id' }
  );
  if (error) throw error;
}

async function recalculateAllPoints() {
  // Trigger recalculation via DB function
  const { error } = await sb.rpc('recalculate_points');
  if (error) console.warn('recalc rpc:', error.message);
}

async function getPredictionsForParticipant(participantId) {
  const [matchPreds, groupPreds, champPred] = await Promise.all([
    sb.from('match_predictions').select('*').eq('participant_id', participantId),
    sb.from('group_predictions').select('*').eq('participant_id', participantId),
    sb.from('champion_predictions').select('*').eq('participant_id', participantId).single(),
  ]);
  return {
    matches: matchPreds.data || [],
    groups: groupPreds.data || [],
    champion: champPred.data || null,
  };
}

// ── Scoring logic (client-side for display) ──────────────────────
function scoreMatchPrediction(predicted, actual) {
  if (!actual) return 0;
  if (predicted.home_score === actual.home_score && predicted.away_score === actual.away_score) {
    return SCORING.exact_score;
  }
  const predWinner = Math.sign(predicted.home_score - predicted.away_score);
  const actWinner  = Math.sign(actual.home_score - actual.away_score);
  if (predWinner === actWinner) return SCORING.correct_winner;
  return 0;
}
