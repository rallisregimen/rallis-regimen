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
    // Parse recorded values
    var weight = parseFloat(weightLbs) || 0;
    var recordedReps = parseInt(reps) || 0;
    var recordedRir = parseInt(rir);

    // Parse prescribed rep range e.g. "6-8", "4-6", "12-15"
    var prescribedMin = null;
    var prescribedMax = null;
    if (prescribedReps) {
      var parts = String(prescribedReps).match(/(\d+)\s*[-–]\s*(\d+)/);
      if (parts) {
        prescribedMin = parseInt(parts[1]);
        prescribedMax = parseInt(parts[2]);
      } else {
        var single = parseInt(prescribedReps);
        if (!isNaN(single)) { prescribedMin = single; prescribedMax = single; }
      }
    }

    // Determine progression based on where reps land in the range
    if (prescribedMin !== null && prescribedMax !== null && weight > 0) {
      var isNaN_rir = isNaN(recordedRir);
      var lowRir = !isNaN_rir && recordedRir <= 2;

      if (recordedReps >= prescribedMax) {
        // At or above top of range — add weight, drop to bottom
        var increment = weight >= 200 ? 10 : weight >= 100 ? 5 : 2.5;
        return 'Hit the top of your range — add ' + increment + ' lbs next week and aim for ' + prescribedMin + '-' + (prescribedMin + 1) + ' reps.';
      } else if (recordedReps <= prescribedMin) {
        // At bottom of range — add a rep, keep weight
        return 'Stay at ' + (weight > 0 ? weight + ' lbs' : 'same weight') + ' and add 1-2 reps to work up toward ' + prescribedMax + '.';
      } else {
        // Mid-range — add a rep
        return 'Keep the weight and add 1 rep — target ' + (recordedReps + 1) + ' reps next session.';
      }
    }

    // Bodyweight or no prescribed range — simple suggestion
    if (!weight || weight === 0) {
      return 'Add 1-2 reps or add a small load (weighted vest or plate) to progress this movement.';
    }

    // Fallback: at least suggest adding reps or weight
    return 'Aim for 1 more rep than today, or add 5 lbs if you completed all reps cleanly.';

  } catch (e) {
    return null;
  }
}
