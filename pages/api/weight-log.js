import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  var userId = req.body && req.body.userId || req.query && req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  var supabase = getSupabase();

  if (req.method === 'POST') {
    var weight = req.body.weight_lbs;
    var note = req.body.note || null;
    var date = req.body.logged_at || new Date().toISOString().slice(0, 10);

    if (!weight) return res.status(400).json({ error: 'weight_lbs required' });

    var result = await supabase.from('weight_logs').upsert({
      user_id: userId,
      weight_lbs: parseFloat(weight),
      note: note,
      logged_at: date
    }, { onConflict: 'user_id,logged_at' });

    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    var result = await supabase.from('weight_logs')
      .select('weight_lbs, logged_at, note')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true })
      .limit(52); // last year of weekly entries

    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.status(200).json({ logs: result.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
