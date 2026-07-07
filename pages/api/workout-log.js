import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  if (req.method === "POST") return saveLog(req, res);
  if (req.method === "GET") return getLogs(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}

async function saveLog(req, res) {
  var supabase = getSupabase();
  var b = req.body;
  if (!b || !b.exerciseName) {
    return res.status(400).json({ error: "exerciseName required" });
  }
  try {
    await supabase.from("workout_logs").insert({
      user_id: b.userId || null,
      program_id: b.programId || null,
      block_number: b.blockNumber || null,
      week_number: b.weekNumber || null,
      day_label: b.dayLabel || null,
      exercise_name: b.exerciseName,
      set_number: b.setNumber || null,
      weight_lbs: b.weightLbs || null,
      reps: b.reps || null,
      rir: b.rir || null,
      notes: b.notes || null,
      logged_at: new Date().toISOString()
    });
    var suggestion = await getProgression(b.userId, b.exerciseName, b.weightLbs, b.reps, b.rir, b.notes, b.prescribedReps, supabase);
    return res.status(200).json({ success: true, suggestion: suggestion });
  } catch (err) {
    console.error("saveLog error:", err);
    return res.status(500).json({ error: "Failed to save" });
  }
}

async function getLogs(req, res) {
  var supabase = getSupabase();
  var userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    var result = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(500);
    return res.status(200).json({ logs: result.data || [] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch" });
  }
}

async function getProgression(userId, exerciseName, weightLbs, reps, rir, notes, prescribedReps, supabase) {
  try {
    var hist = await supabase
      .from("workout_logs")
      .select("weight_lbs,reps,rir,notes")
      .eq("user_id", userId)
      .eq("exercise_name", exerciseName)
      .order("logged_at", { ascending: false })
      .limit(4);
    var history = hist.data ? hist.data.slice(1) : [];
    var prompt = "You are a strength coach. Give a single one-sentence progression suggestion for next week.\n";
    prompt += "Exercise: " + exerciseName + "\n";
    prompt += "This session: " + (weightLbs ? weightLbs + " lbs" : "bodyweight") + " x " + reps + " reps @ " + rir + " RIR\n";
    if (notes) prompt += "Notes: " + notes + "\n";
    if (prescribedReps) {
      prompt += "PRESCRIBED REP RANGE: " + prescribedReps + ". Your suggestion MUST stay within this range. Do not suggest more reps than the upper end of this range. Do not suggest fewer reps than the lower end. Only suggest adding weight if the member is at or above the top of the range with low RIR.\n";
    }
    history.forEach(function(h) {
      prompt += "Previous: " + (h.weight_lbs || "BW") + " x " + h.reps + " @ " + h.rir + "\n";
    });
    prompt += "Suggestion (one sentence, stay within prescribed rep range):";
    var resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }]
      })
    });
    var data = await resp.json();
    return data.content && data.content[0] ? data.content[0].text : null;
  } catch (e) {
    return null;
  }
}
