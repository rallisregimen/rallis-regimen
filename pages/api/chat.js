import { buildSystemPrompt } from '../../lib/systemPrompt';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var messages = req.body.messages;
  var memberId = req.body.memberId;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  try {
    var member = {};
    if (memberId) {
      var supabase = getSupabase();
      var profileRes = await supabase.from('profiles').select('*').eq('id', memberId).single();
      var intakeRes = await supabase.from('intake_submissions').select('*').eq('user_id', memberId).single();
      var programRes = await supabase.from('generated_programs').select('*').eq('user_id', memberId).order('generated_at', { ascending: false }).limit(1).single();

      member = {
        profile: profileRes.data || {},
        intake: intakeRes.data || {},
        program: programRes.data || {}
      };
    }

    var systemPrompt = buildSystemPrompt(member);

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(function(m) {
          return { role: m.role, content: m.content };
        })
      })
    });

    if (!response.ok) {
      var errText = await response.text();
      console.error('Anthropic error:', errText);
      return res.status(500).json({ error: 'Failed to get response' });
    }

    var data = await response.json();
    var reply = data.content && data.content[0] ? data.content[0].text : 'Something went wrong. Please try again.';

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
