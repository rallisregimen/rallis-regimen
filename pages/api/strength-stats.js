import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Epley formula: estimated 1RM
function epley(weight, reps) {
  if (!weight || !reps) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  var userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  var supabase = getSupabase();

  try {
    // Fetch all workout logs for this user, lifetime
    var result = await supabase
      .from('workout_logs')
      .select('exercise_name, weight_lbs, reps, set_number, logged_at, day_label, week_number')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });

    if (result.error) throw result.error;
    var allLogs = result.data || [];

    if (allLogs.length === 0) {
      return res.status(200).json({ exercises: [] });
    }

    // Group logs by exercise
    var byExercise = {};
    allLogs.forEach(function(log) {
      var name = log.exercise_name;
      if (!name) return;
      if (!byExercise[name]) byExercise[name] = [];
      byExercise[name].push(log);
    });

    // For each exercise, compute stats
    var exerciseStats = [];

    Object.keys(byExercise).forEach(function(name) {
      var logs = byExercise[name];

      // Group by session (day + date)
      var sessions = {};
      logs.forEach(function(log) {
        var sessionKey = log.logged_at ? log.logged_at.slice(0, 10) : 'unknown';
        if (!sessions[sessionKey]) sessions[sessionKey] = [];
        sessions[sessionKey].push(log);
      });

      var sessionKeys = Object.keys(sessions).sort();

      // Need at least 1 session
      if (sessionKeys.length < 1) return;

      var hasWeight = logs.some(function(l) { return l.weight_lbs && parseFloat(l.weight_lbs) > 0; });

      // Build timeline — best metric per session
      var timeline = sessionKeys.map(function(dateKey) {
        var sessionLogs = sessions[dateKey];
        var best = null;

        sessionLogs.forEach(function(log) {
          var w = parseFloat(log.weight_lbs);
          var r = parseInt(log.reps);

          if (hasWeight && w > 0) {
            // Use estimated 1RM
            var e1rm = epley(w, r || 1);
            if (e1rm && (!best || e1rm > best.value)) {
              best = { value: e1rm, weight: w, reps: r, type: 'e1rm' };
            }
          } else if (r > 0) {
            // Rep PR for bodyweight/band
            if (!best || r > best.value) {
              best = { value: r, reps: r, type: 'reps' };
            }
          }
        });

        return { date: dateKey, best: best };
      }).filter(function(s) { return s.best !== null; });

      if (timeline.length === 0) return;

      // Find all-time PR
      var allTimePR = timeline.reduce(function(pr, s) {
        return (s.best.value > pr.value) ? s.best : pr;
      }, timeline[0].best);

      // Recent PR (last 30 days)
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      var recentSessions = timeline.filter(function(s) {
        return new Date(s.date) >= thirtyDaysAgo;
      });

      exerciseStats.push({
        name: name,
        sessionCount: sessionKeys.length,
        hasWeight: hasWeight,
        metricType: hasWeight ? 'e1rm' : 'reps',
        metricLabel: hasWeight ? 'Est. 1RM' : 'Rep PR',
        allTimePR: allTimePR,
        recentBest: recentSessions.length > 0
          ? recentSessions.reduce(function(pr, s) {
              return s.best.value > pr.value ? s.best : pr;
            }, recentSessions[0].best)
          : null,
        // Trim chart timeline to last 52 sessions (~ 1 year) for readability
        // All-time PR is computed above from the full history before this trim
        timeline: timeline.slice(-52)
      });
    });

    // Sort by session count descending, return top 8
    exerciseStats.sort(function(a, b) { return b.sessionCount - a.sessionCount; });
    var top = exerciseStats.slice(0, 8);

    return res.status(200).json({ exercises: top });

  } catch (err) {
    console.error('Strength stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch strength stats' });
  }
}
