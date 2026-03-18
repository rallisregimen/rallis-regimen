import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}
  body{background:var(--off-white);font-family:'Barlow',sans-serif;min-height:100vh;}
 
  .join-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;width:100%;}
 
  .join-left{background:var(--maroon);padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}
  .join-logo{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:48px;cursor:pointer;}
  .join-headline{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);font-weight:900;color:white;line-height:1.1;margin-bottom:16px;}
  .join-headline em{font-style:italic;color:rgba(255,255,255,0.7);}
  .join-sub{font-size:16px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:48px;}
  .join-includes{display:flex;flex-direction:column;gap:0;}
  .join-item{display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;font-weight:300;color:rgba(255,255,255,0.7);}
  .join-item:first-child{border-top:1px solid rgba(255,255,255,0.1);}
  .join-check{width:20px;height:20px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;min-width:20px;font-size:10px;color:white;}
 
  .join-right{padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}
  .plan-toggle{display:flex;gap:0;margin-bottom:32px;border:1.5px solid var(--border);background:white;}
  .plan-btn{flex:1;padding:12px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;border:none;background:transparent;cursor:pointer;color:var(--mid);transition:all 0.15s;}
  .plan-btn.active{background:var(--maroon);color:white;}
 
  .price-display{margin-bottom:32px;}
  .price-big{font-family:'Playfair Display',serif;font-size:72px;font-weight:900;color:var(--charcoal);line-height:1;}
  .price-period{font-family:'Barlow Condensed',sans-serif;font-size:16px;color:var(--mid);margin-top:6px;}
  .price-save{display:inline-block;background:var(--gold);color:white;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;margin-top:8px;}
 
  .field-group{margin-bottom:20px;}
  .field-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--charcoal);display:block;margin-bottom:8px;}
  input[type=email],input[type=text]{width:100%;background:white;border:1.5px solid var(--border);padding:14px 16px;font-family:'Barlow',sans-serif;font-size:15px;font-weight:300;color:var(--charcoal);outline:none;transition:border-color 0.2s;}
  input:focus{border-color:var(--maroon);}
 
  .waiver-box{background:white;border:1px solid var(--border);padding:16px;margin-bottom:20px;max-height:140px;overflow-y:auto;}
  .waiver-text{font-size:12px;font-weight:300;color:var(--mid);line-height:1.7;}
  .waiver-text strong{font-weight:600;color:var(--charcoal);}
 
  .checkbox-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:20px;cursor:pointer;}
  .checkbox-box{width:20px;height:20px;min-width:20px;border:1.5px solid var(--border);background:white;display:flex;align-items:center;justify-content:center;margin-top:2px;transition:all 0.15s;cursor:pointer;}
  .checkbox-box.checked{background:var(--maroon);border-color:var(--maroon);}
  .checkbox-label{font-size:13px;font-weight:300;color:var(--mid);line-height:1.5;}
  .checkbox-label a{color:var(--maroon);text-decoration:underline;cursor:pointer;}
 
  .btn-join{width:100%;background:var(--maroon);border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:white;padding:18px;transition:background 0.2s;margin-top:8px;}
  .btn-join:hover:not(:disabled){background:var(--maroon-dark);}
  .btn-join:disabled{opacity:0.4;cursor:not-allowed;}
  .join-note{font-size:12px;font-weight:300;color:var(--mid);margin-top:14px;text-align:center;}
  .error{color:#C0392B;font-size:13px;margin-top:8px;font-family:'Barlow Condensed',sans-serif;font-weight:500;}
  .back-link{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);margin-bottom:40px;cursor:pointer;border:none;background:none;text-decoration:underline;}
 
  @media(max-width:768px){
    .join-wrap{grid-template-columns:1fr;}
    .join-left{padding:48px 24px;}
    .join-right{padding:48px 24px;}
  }
`
 
const INCLUDES = [
  "Personalized training program, rebuilt every month",
  "Custom nutrition plan with full macro breakdown",
  "Personalized sleep protocol",
  "Environment audit and priority action list",
  "The Regimen — AI coaching chat, available 24/7",
  "Cancel anytime, no contracts",
]
 
const WAIVER_TEXT = `ASSUMPTION OF RISK & LIABILITY WAIVER. By enrolling in the Rallis Regimen, I acknowledge that physical exercise involves inherent risks including but not limited to injury, illness, or death. I represent that I am in good physical health and have no medical condition that would prevent me from participating in a fitness program. I agree to consult a physician before beginning any exercise program, especially if I have any known health conditions. I understand that the Rallis Regimen provides general fitness and nutrition information and is not a substitute for professional medical advice, diagnosis, or treatment. I voluntarily assume all risks associated with participation and release Rallis Regimen, its founders, employees, and affiliates from any and all liability for injury, loss, or damage arising from my participation. I acknowledge that results vary and no specific outcomes are guaranteed.`
 
export default function JoinPage() {
  const router = useRouter()
  const [plan, setPlan] = useState('monthly')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 
  async function handleJoin() {
    if (!email || !name) { setError('Please enter your name and email.'); return }
    if (!waiverAccepted) { setError('Please accept the liability waiver to continue.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, plan })
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError('Something went wrong. Please try again.') }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }
 
  return (
    <>
      <Head><title>Join The Regimen — Rallis Regimen</title></Head>
      <style>{styles}</style>
      <div className="join-wrap">
 
        <div className="join-left">
          <div className="join-logo" onClick={() => router.push('/')}>Rallis Regimen</div>
          <h1 className="join-headline">Start your<br /><em>Regimen.</em></h1>
          <p className="join-sub">Everything you need to train, eat, sleep, and live better — personalized for you, rebuilt every month.</p>
          <div className="join-includes">
            {INCLUDES.map((item, i) => (
              <div className="join-item" key={i}>
                <div className="join-check">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
 
        <div className="join-right">
          <button className="back-link" onClick={() => router.push('/')}>← Back to home</button>
 
          <div className="plan-toggle">
            <button className={`plan-btn ${plan==='monthly'?'active':''}`} onClick={() => setPlan('monthly')}>Monthly</button>
            <button className={`plan-btn ${plan==='annual'?'active':''}`} onClick={() => setPlan('annual')}>Annual</button>
          </div>
 
          <div className="price-display">
            <div className="price-big">{plan==='monthly'?'$47':'$397'}</div>
            <div className="price-period">{plan==='monthly'?'per month':'per year'}</div>
            {plan==='annual' && <div className="price-save">Save 30% — 2 months free</div>}
          </div>
 
          <div className="field-group">
            <label className="field-label">First Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" />
          </div>
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key==='Enter' && handleJoin()} />
          </div>
 
          <div className="waiver-box">
            <div className="waiver-text">
              <strong>Assumption of Risk & Liability Waiver</strong><br /><br />
              {WAIVER_TEXT}
            </div>
          </div>
 
          <div className="checkbox-row" onClick={() => setWaiverAccepted(!waiverAccepted)}>
            <div className={`checkbox-box ${waiverAccepted?'checked':''}`}>
              {waiverAccepted && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div className="checkbox-label">
              I have read and agree to the <a onClick={e => e.stopPropagation()}>Liability Waiver</a> and confirm I am in good health and able to participate in a fitness program. I understand results vary and no specific outcomes are guaranteed.
            </div>
          </div>
 
          {error && <div className="error">{error}</div>}
 
          <button className="btn-join" onClick={handleJoin} disabled={loading || !waiverAccepted}>
            {loading ? 'Redirecting to checkout...' : `Start My Regimen — ${plan==='monthly'?'$47/mo':'$397/yr'}`}
          </button>
          <p className="join-note">Secure checkout via Stripe · Cancel anytime · 30-day money-back guarantee</p>
        </div>
 
      </div>
    </>
  )
}
 
