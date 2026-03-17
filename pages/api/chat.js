import { buildSystemPrompt } from '../../lib/systemPrompt'
import { getServerSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { messages, memberId } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages required' })

  try {
    let member = {}
    if (memberId) {
      const supabase = getServerSupabase()
      const [profileRes, intakeRes, programRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', memberId).single(),
        supabase.from('intake_submissions').select('*').eq('user_id', memberId).single(),
        supabase.from('generated_programs').select('*').eq('user_id', memberId).order('generated_at', { ascending: false }).limit(1).single()
      ])
      member = { profile: profileRes.data || {}, intake: intakeRes.data || {}, program: programRes.data || {} }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: buildSystemPrompt(member), messages: messages.map(m => ({ role: m.role, content: m.content })) })
    })

    if (!response.ok) return res.status(500).json({ error: 'Failed to get response' })
    const data = await response.json()
    const reply = data.content?.[0]?.text || 'Something went wrong. Please try again.'

    if (memberId) {
      const supabase = getServerSupabase()
      const lastUser = [...messages].reverse().find(m => m.role === 'user')
      supabase.from('chat_messages').insert({ user_id: memberId, user_message: lastUser?.content || '', assistant_message: reply }).then(() => {}).catch(() => {})
    }

    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
