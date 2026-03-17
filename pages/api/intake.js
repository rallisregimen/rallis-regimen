import { getServerSupabase } from '../../lib/supabase'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { userId, ...formData } = req.body
  if (!userId) return res.status(400).json({ error: 'User ID required' })
  try {
    const supabase = getServerSupabase()
    const { error } = await supabase.from('intake_submissions').upsert({ user_id: userId, ...formData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw error
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }).catch(() => {})
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Intake error:', error)
    return res.status(500).json({ error: 'Failed to save intake' })
  }
}
