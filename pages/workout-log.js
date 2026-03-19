// pages/api/workout-log.js
// Saves workout logs and returns progression suggestions

import { getServerSupabase } from "../../lib/supabase";
import { buildSystemPrompt } from "../../lib/systemPrompt";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return saveLog(req, res);
  }
  if (req.method === "GET") {
    return getLogs(req, res);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function saveLog(req, res) {
  var supabase = getServerSupabase();
  var body = req.body;
  var userId = body.userId;
  var exerciseName = body.exerciseName;
  var setNumber = body.setNumber;
  var weightLbs = body.weightLbs;
  var reps = body.reps;
  var rir = body.rir;
  var notes = body.notes;
  var programId = body.programId;
  var blockNumber = body.blockNumber;
  var weekNumber = body.weekNumber;
  var dayLabel = body.dayLabel;

  if (!userId || !exerciseName) {
    return res.status(400).json({ error: "userId and exerciseName required" });
  }

  try {
    var insertResult = await supabase.from("workout_logs").insert({
      user_id: userId,
      program_id: programId,
      block_number: blockNumber,
      week_number: weekNumber,
      day_label: dayLabel,
      exercise_name: exerciseName,
      set_number: setNumber,
      weight_lbs: weightLbs,
      reps: reps,
      rir: rir,
      notes: notes || null,
      logged_at: new Date().toISOString()
    });

    if (insertResult.error) throw insertResult.error;

    // After saving, generate a progression suggestion asynchronously
    var suggestion = await generateProgression(userId, exerciseName, weightLbs, reps, rir, notes, supabase);

    return res.status(200).json({ success: true, suggestion: suggestion });
  } catch (error) {
    console.error("Workout log error:", error);
    return res.status(500).json({ error: "Failed to save log" });
  }
}

async function getLogs(req, res) {
  var supabase = getServerSupabase();
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
    // Get last 3 logs for this exercise to understand trend
    var historyResult = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_name", exerciseName)
      .order("logged_at", { ascending: false })
      .limit(6);

    var history = historyResult.data || [];

    // Build a progression prompt
    var prompt = "You are The Regimen progression engine. Based on the workout data below, provide a brief, direct suggestion for next week's target for this exercise. One or two sentences maximum. Be specific with numbers.\n\n";
    prompt += "Exercise: " + exerciseName + "\n";
    prompt += "This session: " + (weightLbs ? weightLbs + " lbs" : "bodyweight") + " x " + reps + " reps @ " + rir + " RIR\n";
    if (notes) prompt += "Member notes: " + notes + "\n";
    if (history.length > 1) {
      prompt += "\nRecent history:\n";
      history.slice(1, 4).forEach(function(log) {
        prompt += "- " + (log.weight_lbs ? log.weight_lbs + " lbs" : "BW") + " x " + log.reps + " reps @ " + log.rir + " RIR";
        if (log.notes) prompt += " (note: " + log.notes + ")";
        prompt += "\n";
      });
    }
    prompt += "\nRIR target for next week based on block progression. If RIR is 2+ above target, increase load or reps. If at target, maintain and add 1-2 reps. If below target, hold weight and focus on form. Always factor in any notes about pain, discomfort, or form breakdown.\n\nSuggestion:";

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }]
      })
    });

    var data = await response.json();
    return data.content && data.content[0] ? data.content[0].text : null;
  } catch (error) {
    console.error("Progression generation error:", error);
    return null;
  }
}
