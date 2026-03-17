import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

// ─── Styles ──────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}
  body{background:var(--off-white);font-family:'Barlow',sans-serif;font-weight:300;}

  /* LAYOUT */
  .dash-layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh;}

  /* SIDEBAR */
  .dash-sidebar{background:var(--charcoal);padding:32px 24px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
  .dash-logo{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:32px;}
  .dash-member{margin-bottom:40px;}
  .dash-member-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:white;margin-bottom:4px;}
  .dash-member-status{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);}
  .dash-nav{flex:1;display:flex;flex-direction:column;gap:2px;}
  .dash-nav-item{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;border:none;background:transparent;text-align:left;width:100%;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);transition:all 0.15s;border-radius:0;}
  .dash-nav-item:hover{color:white;background:rgba(255,255,255,0.06);}
  .dash-nav-item.active{color:white;background:var(--maroon);}
  .dash-nav-icon{font-size:16px;min-width:20px;}
  .dash-signout{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);border:none;background:transparent;cursor:pointer;padding:8px 0;text-align:left;}
  .dash-signout:hover{color:rgba(255,255,255,0.6);}

  /* MAIN */
  .dash-main{padding:48px;}
  .dash-page-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;color:var(--charcoal);margin-bottom:6px;}
  .dash-page-title em{font-style:italic;color:var(--maroon);}
  .dash-page-sub{font-size:15px;font-weight:300;color:var(--mid);margin-bottom:40px;}

  /* CARDS */
  .card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:32px;}
  .card{background:white;border:1px solid var(--border);padding:28px;}
  .card-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}
  .card-title{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--charcoal);margin-bottom:8px;}
  .card-body{font-size:14px;font-weight:300;color:var(--mid);line-height:1.6;margin-bottom:20px;}
  .card-btn{display:inline-block;background:var(--maroon);color:white;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:none;cursor:pointer;padding:10px 22px;transition:background 0.2s;}
  .card-btn:hover{background:var(--maroon-dark);}
  .card-btn.ghost{background:transparent;color:var(--maroon);border:1.5px solid var(--maroon);}
  .card-btn.ghost:hover{background:var(--maroon-light);}

  /* PROGRAM STATUS */
  .program-status{display:flex;align-items:center;gap:10px;margin-bottom:32px;padding:20px 24px;background:white;border:1px solid var(--border);}
  .status-indicator{width:10px;height:10px;border-radius:50%;min-width:10px;}
  .status-indicator.ready{background:#2ECC71;}
  .status-indicator.generating{background:var(--gold);animation:pulse 1.5s infinite;}
  .status-indicator.none{background:rgba(0,0,0,0.15);}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
  .status-text{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--charcoal);}
  .status-sub{font-size:13px;font-weight:300;color:var(--mid);margin-left:auto;}

  /* PROGRAM DETAIL */
  .program-detail{background:white;border:1px solid var(--border);padding:32px;margin-bottom:24px;}
  .program-week{margin-bottom:32px;}
  .program-week-title{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
  .program-day{margin-bottom:20px;padding:20px;border:1px solid var(--border);}
  .program-day-header{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--maroon);margin-bottom:14px;}
  .exercise-row{display:grid;grid-template-columns:1fr auto auto auto;gap:12px;align-items:start;padding:10px 0;border-bottom:1px solid rgba(123,26,56,0.08);}
  .exercise-row:last-child{border-bottom:none;}
  .exercise-name{font-size:14px;font-weight:500;color:var(--charcoal);}
  .exercise-note{font-size:12px;font-weight:300;color:var(--mid);margin-top:3px;font-style:italic;}
  .exercise-stat{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;color:var(--charcoal);text-align:center;}
  .exercise-stat-label{font-size:10px;font-weight:300;color:var(--mid);text-transform:uppercase;letter-spacing:0.08em;}

  /* NUTRITION */
  .macro-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;}
  .macro-item{background:white;border:1px solid var(--border);padding:20px;text-align:center;}
  .macro-num{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--maroon);}
  .macro-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--mid);margin-top:4px;}
  .meal-card{background:white;border:1px solid var(--border);padding:20px;margin-bottom:12px;}
  .meal-name{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--charcoal);margin-bottom:6px;}
  .meal-desc{font-size:14px;font-weight:300;color:var(--mid);margin-bottom:10px;line-height:1.5;}
  .meal-macros{display:flex;gap:16px;}
  .meal-macro{font-family:'Barlow Condensed',sans-serif;font-size:13px;color:var(--mid);}
  .meal-macro strong{color:var(--charcoal);font-weight:700;}

  /* CHAT embedded */
  .chat-embed{background:white;border:1px solid var(--border);display:flex;flex-direction:column;height:600px;}
  .chat-embed-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;}
  .chat-mark{width:36px;height:36px;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:white;}
  .chat-embed-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--charcoal);}
  .chat-embed-sub{font-size:12px;font-weight:300;color:var(--mid);}
  .chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}
  .chat-msg{display:flex;gap:10px;max-width:100%;}
  .chat-msg.user{flex-direction:row-reverse;}
  .chat-avatar{width:28px;height:28px;min-width:28px;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:12px;font-weight:900;color:white;margin-top:2px;}
  .chat-avatar.user{background:var(--charcoal);}
  .chat-bubble{max-width:calc(100% - 44px);padding:12px 16px;font-size:14px;font-weight:300;line-height:1.7;color:var(--charcoal);background:var(--off-white);border:1px solid var(--border);}
  .chat-msg.user .chat-bubble{background:var(--maroon);color:white;border-color:var(--maroon);}
  .chat-input-row{padding:16px;border-top:1px solid var(--border);display:flex;gap:8px;}
  .chat-input{flex:1;border:1.5px solid var(--border);padding:10px 14px;font-family:'Barlow',sans-serif;font-size:14px;font-weight:300;outline:none;resize:none;height:44px;}
  .chat-input:focus{border-color:var(--maroon);}
  .chat-send{width:44px;height:44px;background:var(--maroon);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;}
  .chat-send:hover{background:var(--maroon-dark);}
  .chat-send:disabled{opacity:0.4;cursor:not-allowed;}
  .chat-suggestions{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px 16px;}
  .chat-suggestion{font-family:'Barlow',sans-serif;font-size:12px;font-weight:300;color:var(--mid);background:var(--off-white);border:1px solid var(--border);padding:6px 12px;cursor:pointer;transition:all 0.15s;}
  .chat-suggestion:hover{border-color:var(--maroon);color:var(--charcoal);}
  .typing{display:flex;gap:4px;align-items:center;padding:12px 16px;}
  .typing-dot{width:6px;height:6px;background:var(--maroon);border-radius:50%;opacity:0.4;animation:typingPulse 1.2s infinite;}
  .typing-dot:nth-child(2){animation-delay:0.2s;}
  .typing-dot:nth-child(3){animation-delay:0.4s;}
  @keyframes typingPulse{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.3);}}

  .loading-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Barlow Condensed',sans-serif;font-size:16px;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);}

  @media(max-width:900px){
    .dash-layout{grid-template-columns:1fr;}
    .dash-sidebar{position:static;height:auto;}
    .dash-main{padding:24px;}
    .card-grid{grid-template-columns:1fr;}
    .macro-bar{grid-template-columns:repeat(2,1fr);}
  }
`

const CHAT_SUGGESTIONS = [
  "What replaces overhead press if my shoulder hurts?",
  "I only have 30 min today — shorten my workout",
  "What should I eat before training?",
  "My sleep has been bad — what's the priority fix?",
]

const NAV = [
  { id: 'overview', icon: '◈', label: 'Overview' },
  { id: 'training', icon: '⚡', label: 'Training' },
  { id: 'nutrition', icon: '🥩', label: 'Nutrition' },
  { id: 'chat', icon: 'R', label: 'The Regimen' },
  { id: 'profile', icon: '◎', label: 'My Profile' },
]

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [program, setProgram] = useState(null)
  const [intake, setIntake] = useState(null)
  const [loading, setLoading] = useState(true)

  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/join'); return }
      setUser(user)

      const [profileRes, intakeRes, programRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('intake_submissions').select('*').eq('user_id', user.id).single(),
        supabase.from('generated_programs').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).single()
      ])

      setProfile(profileRes.data)
      setIntake(intakeRes.data)
      setProgram(programRes.data)
      setLoading(false)

      // If no intake, redirect
      if (!intakeRes.data) { router.push('/intake') }
    }
    loadData()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  async function sendChat(text) {
    const msg = text || chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, memberId: user?.id })
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally { setChatLoading(false) }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <><style>{styles}</style><div className="loading-screen">Loading your Regimen...</div></>

  const nutrition = program?.meal_plan
  const training = program?.training_program
  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'Athlete'

  return (
    <>
      <Head><title>Dashboard — Rallis Regimen</title></Head>
      <style>{styles}</style>

      <div className="dash-layout">
        {/* SIDEBAR */}
        <div className="dash-sidebar">
          <div className="dash-logo">Rallis Regimen</div>
          <div className="dash-member">
            <div className="dash-member-name">{firstName}</div>
            <div className="dash-member-status">● Active Member</div>
          </div>
          <nav className="dash-nav">
            {NAV.map(n => (
              <button key={n.id} className={`dash-nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
                <span className="dash-nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <button className="dash-signout" onClick={signOut}>Sign out</button>
        </div>

        {/* MAIN */}
        <div className="dash-main">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="dash-page-title">Your <em>Regimen.</em></div>
              <div className="dash-page-sub">Welcome back, {firstName}. Here's everything in one place.</div>

              <div className="program-status">
                <div className={`status-indicator ${program?.status || 'none'}`} />
                <div className="status-text">
                  {program?.status === 'ready' ? `Program Ready — ${program.program_name}` :
                   program?.status === 'generating' ? 'Generating your program...' :
                   'No program yet — complete your intake form'}
                </div>
                <div className="status-sub">Block {program?.block_number || '—'} of 3</div>
              </div>

              <div className="card-grid">
                <div className="card">
                  <div className="card-label">Training</div>
                  <div className="card-title">{training?.split || 'Your Program'}</div>
                  <div className="card-body">
                    {program?.status === 'ready'
                      ? `${intake?.training_days_per_week} days/week · Block ${program.block_number} of 3 · Weeks ${(program.block_number - 1) * 4 + 1}–${program.block_number * 4}`
                      : 'Complete your intake form to generate your training program.'}
                  </div>
                  <button className="card-btn" onClick={() => setActiveTab('training')}>View Program</button>
                </div>

                <div className="card">
                  <div className="card-label">Nutrition</div>
                  <div className="card-title">{nutrition?.daily_calories ? `${nutrition.daily_calories} cal/day` : 'Meal Plan'}</div>
                  <div className="card-body">
                    {nutrition
                      ? `${nutrition.protein_g}g protein · ${nutrition.carbs_g_training}g carbs (training) · ${nutrition.fat_g}g fat`
                      : 'Your personalized meal plan will appear here once your program is generated.'}
                  </div>
                  <button className="card-btn" onClick={() => setActiveTab('nutrition')}>View Nutrition</button>
                </div>

                <div className="card">
                  <div className="card-label">The Regimen</div>
                  <div className="card-title">Ask anything</div>
                  <div className="card-body">Your AI coaching layer is ready. Ask about exercise substitutions, nutrition, sleep, recovery — anything about your program.</div>
                  <button className="card-btn" onClick={() => setActiveTab('chat')}>Open Chat</button>
                </div>

                <div className="card">
                  <div className="card-label">Profile</div>
                  <div className="card-title">Update inputs</div>
                  <div className="card-body">Changed your goals, schedule, or equipment? Update your profile and your program will regenerate automatically next cycle.</div>
                  <button className="card-btn ghost" onClick={() => setActiveTab('profile')}>Update Profile</button>
                </div>
              </div>
            </>
          )}

          {/* TRAINING */}
          {activeTab === 'training' && (
            <>
              <div className="dash-page-title"><em>Training</em> Program</div>
              <div className="dash-page-sub">{program?.program_name || 'Your personalized program'} · Block {program?.block_number || 1} of 3</div>

              {!program || program.status !== 'ready' ? (
                <div className="card"><div className="card-body">Your program is being generated. Check back in a moment.</div></div>
              ) : (
                training?.blocks?.map((block, bi) => (
                  <div key={bi}>
                    <div className="program-week">
                      <div className="program-week-title">Block {block.block} · Weeks {block.weeks} · RIR Progression: 3-4 → 2-3 → 1-2 → Deload</div>
                      {block.days?.map((day, di) => (
                        <div className="program-day" key={di}>
                          <div className="program-day-header">{day.day} — {day.focus}</div>
                          {day.exercises?.map((ex, ei) => (
                            <div className="exercise-row" key={ei}>
                              <div>
                                <div className="exercise-name">{ex.superset_with ? `Superset: ${ex.name} + ${ex.superset_with}` : ex.name}</div>
                                {ex.note && <div className="exercise-note">{ex.note}</div>}
                              </div>
                              <div className="exercise-stat">{ex.sets}<div className="exercise-stat-label">sets</div></div>
                              <div className="exercise-stat">{ex.reps}<div className="exercise-stat-label">reps</div></div>
                              <div className="exercise-stat">{ex.rest}<div className="exercise-stat-label">rest</div></div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* NUTRITION */}
          {activeTab === 'nutrition' && (
            <>
              <div className="dash-page-title"><em>Nutrition</em> Plan</div>
              <div className="dash-page-sub">Built around your training schedule and body composition goal.</div>

              {!nutrition ? (
                <div className="card"><div className="card-body">Your nutrition plan will appear here once your program is generated.</div></div>
              ) : (
                <>
                  <div className="macro-bar">
                    {[
                      { num: nutrition.daily_calories, label: 'Calories' },
                      { num: nutrition.protein_g + 'g', label: 'Protein' },
                      { num: nutrition.carbs_g_training + 'g', label: 'Carbs (training)' },
                      { num: nutrition.fat_g + 'g', label: 'Fat' },
                    ].map(m => (
                      <div className="macro-item" key={m.label}>
                        <div className="macro-num">{m.num}</div>
                        <div className="macro-label">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:24}}>
                    <div className="program-week-title" style={{marginBottom:16}}>Sample Training Day</div>
                    {Object.entries(nutrition.sample_training_day || {}).map(([meal, data]) => (
                      <div className="meal-card" key={meal}>
                        <div className="meal-name">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                        <div className="meal-desc">{data.description}</div>
                        <div className="meal-macros">
                          <div className="meal-macro"><strong>{data.protein_g}g</strong> protein</div>
                          <div className="meal-macro"><strong>{data.carbs_g}g</strong> carbs</div>
                          <div className="meal-macro"><strong>{data.fat_g}g</strong> fat</div>
                          <div className="meal-macro"><strong>{data.calories}</strong> cal</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* CHAT */}
          {activeTab === 'chat' && (
            <>
              <div className="dash-page-title">The <em>Regimen</em></div>
              <div className="dash-page-sub">Ask anything about your training, nutrition, sleep, or recovery.</div>

              <div className="chat-embed">
                <div className="chat-embed-header">
                  <div className="chat-mark">R</div>
                  <div>
                    <div className="chat-embed-title">The Regimen</div>
                    <div className="chat-embed-sub">Your personal coaching layer · Always available</div>
                  </div>
                </div>

                <div className="chat-messages">
                  {chatMessages.length === 0 && !chatLoading && (
                    <div style={{color:'var(--mid)',fontSize:14,fontWeight:300,lineHeight:1.7}}>
                      Ask me anything about your program — exercise swaps, nutrition questions, sleep issues, recovery. I know your goals, your equipment, and your current program.
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`chat-msg ${m.role}`}>
                      <div className={`chat-avatar ${m.role}`}>{m.role === 'assistant' ? 'R' : firstName[0]?.toUpperCase()}</div>
                      <div className="chat-bubble">{m.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-msg">
                      <div className="chat-avatar">R</div>
                      <div className="chat-bubble"><div className="typing"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {chatMessages.length === 0 && (
                  <div className="chat-suggestions">
                    {CHAT_SUGGESTIONS.map((s, i) => (
                      <button key={i} className="chat-suggestion" onClick={() => sendChat(s)}>{s}</button>
                    ))}
                  </div>
                )}

                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendChat() }}}
                    placeholder="Ask The Regimen..."
                  />
                  <button className="chat-send" onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <>
              <div className="dash-page-title">Your <em>Profile</em></div>
              <div className="dash-page-sub">Update your information to regenerate your program next cycle.</div>
              <div className="card">
                <div className="card-body">Profile editing coming soon. Contact us at hello@rallisregimen.com to update your intake information.</div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
