// pages/api/workout-log.js
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

  if (!b.exerciseName) {
    return res.status(400).json({ error: "exerciseName required" });
  }

  try {
    var insertResult = await supabase.from("workout_logs").insert({
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

    if (insertResult.error) {
      console.error("Insert error:", insertResult.error);
    }

    var suggestion = await generateProgression(
      b.userId, b.exerciseName, b.weightLbs, b.reps, b.rir, b.notes, supabase
    );

    return res.status(200).json({ success: true, suggestion: suggestion });
  } catch (error) {
    console.error("Workout log error:", error);
    return res.status(500).json({ error: "Failed to save log" });
  }
}

async function getLogs(req, res) {
  var supabase = getSupabase();
  var userId = req.query.userId;
  var exerciseName = req.query.exerciseName;

  if (!userId) return res.status(400).json({ error: "userId required" });

  try {
    var query = supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(50);

    if (exerciseName) {
      query = query.eq("exercise_name", exerciseName);
    }

    var result = await query;
    if (result.error) throw result.error;
    return res.status(200).json({ logs: result.data });
  } catch (error) {
    console.error("Get logs error:", error);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
}

async function generateProgression(userId, exerciseName, weightLbs, reps, rir, notes, supabase) {
  try {
    var historyResult = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_name", exerciseName)
      .order("logged_at", { ascending: false })
      .limit(6);

    var history = (historyResult.data || []).slice(1, 4);

    var prompt = "You are The Regimen progression engine. Based on the workout data below, give a one sentence suggestion for next week's target. Be specific with numbers.\n\n";
    prompt += "Exercise: " + exerciseName + "\n";
    prompt += "This session: " + (weightLbs ? weightLbs + " lbs" : "bodyweight") + " x " + reps + " reps @ " + rir + " RIR\n";
    if (notes) prompt += "Member notes: " + notes + "\n";
    if (history.length > 0) {
      prompt += "Recent history:\n";
      history.forEach(function(log) {
        prompt += "- " + (log.weight_lbs ? log.weight_lbs + " lbs" : "BW") + " x " + log.reps + " reps @ " + log.rir + " RIR";
        if (log.notes) prompt += " (" + log.notes + ")";
        prompt += "\n";
      });
    }
    prompt += "Suggestion (one sentence, specific numbers):";

    var response = await fetch("https://api.anthropic.com/v1/messages", {
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

    var data = await response.json();
    return (data.content && data.content[0]) ? data.content[0].text : null;
  } catch (error) {
    console.error("Progression error:", error);
    return null;
  }
}
