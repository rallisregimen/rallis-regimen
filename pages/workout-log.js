export default async function handler(req, res) {
  var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  var ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  async function db(method, table, body, query) {
    var url = SUPABASE_URL + "/rest/v1/" + table + (query || "");
    var r = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (method === "GET") return r.json();
    return r;
  }

  if (req.method === "POST") {
    var b = req.body;
    try {
      await db("POST", "workout_logs", {
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

      var suggestion = null;
      try {
        var history = await db("GET", "workout_logs", null,
          "?user_id=eq." + b.userId + "&exercise_name=eq." + encodeURIComponent(b.exerciseName) + "&order=logged_at.desc&limit=4"
        );
        var past = Array.isArray(history) ? history.slice(1) : [];
        var prompt = "One sentence progression suggestion for next week. Exercise: " + b.exerciseName +
          ". This week: " + (b.weightLbs ? b.weightLbs + "lbs" : "BW") + " x " + b.reps + " reps @ " + b.rir + " RIR.";
        if (b.notes) prompt += " Notes: " + b.notes + ".";
        if (past.length > 0) {
          prompt += " History: " + past.map(function(l) {
            return (l.weight_lbs || "BW") + " x " + l.reps + " @ " + l.rir;
          }).join(", ") + ".";
        }
        prompt += " Be specific with numbers. One sentence only.";
        var ar = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 80, messages: [{ role: "user", content: prompt }] })
        });
        var ad = await ar.json();
        suggestion = ad.content && ad.content[0] ? ad.content[0].text : null;
      } catch (e) { suggestion = null; }

      return res.status(200).json({ success: true, suggestion: suggestion });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save" });
    }
  }

  if (req.method === "GET") {
    try {
      var uid = req.query.userId;
      var ex = req.query.exerciseName;
      var q = "?user_id=eq." + uid + "&order=logged_at.desc&limit=50";
      if (ex) q += "&exercise_name=eq." + encodeURIComponent(ex);
      var logs = await db("GET", "workout_logs", null, q);
      return res.status(200).json({ logs: logs });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
