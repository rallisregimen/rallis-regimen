import { createClient } from '@supabase/supabase-js';

// Uses service key to bypass RLS — admin-only endpoint
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Simple admin password gate — set ADMIN_PASSWORD in Vercel env vars
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rallis2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var password = req.body && req.body.password;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  try {
    var sb = getServiceSupabase();

    // Fetch all profiles
    var profilesRes = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all intake submissions
    var intakeRes = await sb
      .from('intake_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Fetch all generated programs (latest per user)
    var programsRes = await sb
      .from('generated_programs')
      .select('*')
      .order('generated_at', { ascending: false });

    // Fetch all workout logs
    var logsRes = await sb
      .from('workout_logs')
      .select('*')
      .order('logged_at', { ascending: false });

    // Fetch all weight logs
    var weightLogsRes = await sb
      .from('weight_logs')
      .select('*')
      .order('logged_at', { ascending: false });

    if (profilesRes.error) throw profilesRes.error;

    return res.status(200).json({
      profiles: profilesRes.data || [],
      intakes: intakeRes.data || [],
      programs: programsRes.data || [],
      workoutLogs: logsRes.data || [],
      weightLogs: weightLogsRes.data || [],
    });
  } catch (err) {
    console.error('Admin data error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin data' });
  }
}
