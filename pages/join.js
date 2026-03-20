import { useState } from 'react';
import { useRouter } from 'next/router';

var styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400&display=swap');",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ":root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}",
  "body{background:var(--off-white);font-family:Barlow,sans-serif;min-height:100vh;}",
  ".wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;}",
  ".left{background:var(--maroon);padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}",
  ".logo{font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:14px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:48px;cursor:pointer;}",
  ".free-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);color:white;font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:6px 12px;margin-bottom:20px;width:fit-content;}",
  ".headline{font-family:Playfair Display,serif;font-size:clamp(28px,4vw,48px);font-weight:900;color:white;line-height:1.1;margin-bottom:12px;}",
  ".headline em{font-style:italic;color:rgba(255,255,255,.7);}",
  ".sub{font-size:15px;font-weight:300;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:40px;}",
  ".includes{display:flex;flex-direction:column;}",
  ".item{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:14px;font-weight:300;color:rgba(255,255,255,.7);}",
  ".item:first-child{border-top:1px solid rgba(255,255,255,.1);}",
  ".chk{width:18px;height:18px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;min-width:18px;font-size:10px;color:white;}",
  ".right{padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}",
  ".plan-toggle{display:flex;margin-bottom:28px;border:1.5px solid var(--border);background:white;}",
  ".plan-btn{flex:1;padding:12px;font-family:Barlow Condensed,sans-serif;font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border:none;background:transparent;cursor:pointer;color:var(--mid);transition:all .15s;}",
  ".plan-btn.active{background:var(--maroon);color:white;}",
  ".trial-box{text-align:center;margin-bottom:28px;padding:24px;background:var(--maroon-light);border:1px solid rgba(123,26,56,.2);}",
  ".trial-big{font-family:Playfair Display,serif;font-size:48px;font-weight:900;color:var(--maroon);line-height:1;}",
  ".trial-label{font-family:Barlow Condensed,sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--charcoal);margin-top:4px;}",
  ".trial-then{font-size:13px;font-weight:300;color:var(--mid);margin-top:6px;}",
  ".save-badge{display:inline-block;background:var(--gold);color:white;font-family:Barlow Condensed,sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:3px 8px;margin-top:4px;}",
  ".fg{margin-bottom:18px;}",
  ".fl{font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--charcoal);display:block;margin-bottom:7px;}",
  "input[type=email],input[type=text]{width:100%;background:white;border:1.5px solid var(--border);padding:13px 16px;font-family:Barlow,sans-serif;font-size:15px;font-weight:300;color:var(--charcoal);outline:none;transition:border-color .2s;}",
  "input:focus{border-color:var(--maroon);}",
  ".promo-row{display:flex;gap:8px;}",
  ".promo-row input{flex:1;}",
  ".promo-btn{background:var(--charcoal);color:white;border:none;cursor:pointer;font-family:Barlow Condensed,sans-serif;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:13px 18px;transition:background .2s;white-space:nowrap;}",
  ".promo-btn:hover{background:var(--maroon);}",
  ".promo-ok{font-size:12px;color:#27AE60;font-family:Barlow Condensed,sans-serif;font-weight:600;margin-top:6px;}",
  ".waiver-box{background:white;border:1px solid var(--border);padding:14px;margin-bottom:16px;max-height:120px;overflow-y:auto;}",
  ".waiver-text{font-size:11px;font-weight:300;color:var(--mid);line-height:1.7;}",
  ".waiver-text strong{font-weight:600;color:var(--charcoal);}",
  ".cb-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:18px;cursor:pointer;}",
  ".cb-box{width:18px;height:18px;min-width:18px;border:1.5px solid var(--border);background:white;display:flex;align-items:center;justify-content:center;margin-top:2px;transition:all .15s;}",
  ".cb-box.on{background:var(--maroon);border-color:var(--maroon);}",
  ".cb-label{font-size:12px;font-weight:300;color:var(--mid);line-height:1.5;}",
  ".submit-btn{width:100%;background:var(--maroon);border:none;cursor:pointer;font-family:Barlow Condensed,sans-serif;font-size:15px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:white;padding:18px;transition:background .2s;margin-top:4px;}",
  ".submit-btn:hover:not(:disabled){background:var(--maroon-dark);}",
  ".submit-btn:disabled{opacity:.4;cursor:not-allowed;}",
  ".note{font-size:11px;font-weight:300;color:var(--mid);margin-top:12px;text-align:center;line-height:1.6;}",
  ".err{color:#C0392B;font-size:12px;margin-top:6px;font-family:Barlow Condensed,sans-serif;font-weight:500;}",
  ".back{font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--mid);margin-bottom:32px;cursor:pointer;border:none;background:none;text-decoration:underline;}",
  "@media(max-width:768px){.wrap{grid-template-columns:1fr;}.left,.right{padding:48px 24px;}}"
].join(' ');

var WAIVER = 'ASSUMPTION OF RISK AND LIABILITY WAIVER. By enrolling in the Rallis Regimen, I acknowledge that physical exercise involves inherent risks including but not limited to injury, illness, or death. I represent that I am in good physical health and have no medical condition that would prevent me from participating in a fitness program. I agree to consult a physician before beginning any exercise program. I understand that the Rallis Regimen provides general fitness and nutrition information and is not a substitute for professional medical advice. I voluntarily assume all risks and release Rallis Regimen and its affiliates from any liability for injury, loss, or damage arising from my participation.';

var INCLUDES = [
  'Full personalized program generated in minutes',
  'Workout logging with automatic progression',
  'Custom nutrition and meal plan',
  'Personalized sleep protocol',
  'Environment audit and action list',
  'The Regimen chat, unlimited 24/7',
  'Cancel anytime, no questions asked',
];

var ADMIN_CODE = 'RALLISTEST';

export default function JoinPage() {
  var router = useRouter();
  var planState = useState('monthly'); var plan = planState[0]; var setPlan = planState[1];
  var emailState = useState(''); var email = emailState[0]; var setEmail = emailState[1];
  var nameState = useState(''); var name = nameState[0]; var setName = nameState[1];
  var waiverState = useState(false); var waiver = waiverState[0]; var setWaiver = waiverState[1];
  var promoState = useState(''); var promo = promoState[0]; var setPromo = promoState[1];
  var promoOkState = useState(false); var promoOk = promoOkState[0]; var setPromoOk = promoOkState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];
  var errState = useState(''); var err = errState[0]; var setErr = errState[1];

  function applyPromo() {
    if (promo.toUpperCase() === ADMIN_CODE) { setPromoOk(true); setErr(''); }
    else { setErr('Invalid promo code.'); }
  }

  async function handleJoin() {
    if (!email || !name) { setErr('Please enter your name and email.'); return; }
    if (!waiver) { setErr('Please accept the liability waiver to continue.'); return; }
    setLoading(true); setErr('');

    if (promoOk) {
      // Bypass: go directly to auth-callback which creates user and sends magic link
      window.location.href = '/api/auth-callback?bypass=true&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
      return;
    }

    try {
      var res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, name: name, plan: plan })
      });
      var data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setErr('Something went wrong. Please try again.'); setLoading(false); }
    } catch (e) {
      setErr('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <style>{styles}</style>
      <div className="wrap">
        <div className="left">
          <div className="logo" onClick={function() { router.push('/'); }}>Rallis Regimen</div>
          <div className="free-badge">30 Days Free</div>
          <h1 className="headline">Start your<br /><em>free month.</em></h1>
          <p className="sub">Get your complete personalized program in minutes. Not charged a thing for 30 days.</p>
          <div className="includes">
            {INCLUDES.map(function(item, i) {
              return (
                <div className="item" key={i}>
                  <div className="chk">V</div>
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        <div className="right">
          <button className="back" onClick={function() { router.push('/'); }}>Back to home</button>
          <div className="plan-toggle">
            <button className={plan === 'monthly' ? 'plan-btn active' : 'plan-btn'} onClick={function() { setPlan('monthly'); }}>Monthly</button>
            <button className={plan === 'annual' ? 'plan-btn active' : 'plan-btn'} onClick={function() { setPlan('annual'); }}>Annual</button>
          </div>
          <div className="trial-box">
            <div className="trial-big">Free</div>
            <div className="trial-label">for your first 30 days</div>
            <div className="trial-then">{plan === 'monthly' ? 'Then $47/month. Cancel anytime.' : 'Then $397/year. Cancel anytime.'}</div>
            {plan === 'annual' && <div className="save-badge">Save 30% vs monthly</div>}
          </div>
          <div className="fg">
            <label className="fl">First Name</label>
            <input type="text" value={name} onChange={function(e) { setName(e.target.value); }} placeholder="Your first name" />
          </div>
          <div className="fg">
            <label className="fl">Email Address</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="you@example.com" />
          </div>
          <div className="fg">
            <label className="fl">Promo Code</label>
            <div className="promo-row">
              <input type="text" value={promo} onChange={function(e) { setPromo(e.target.value); }} placeholder="Enter code" />
              <button className="promo-btn" onClick={applyPromo}>Apply</button>
            </div>
            {promoOk && <div className="promo-ok">Code applied. No payment required.</div>}
          </div>
          <div className="waiver-box">
            <div className="waiver-text">
              <strong>Assumption of Risk and Liability Waiver</strong><br /><br />
              {WAIVER}
            </div>
          </div>
          <div className="cb-row" onClick={function() { setWaiver(!waiver); }}>
            <div className={waiver ? 'cb-box on' : 'cb-box'}>
              {waiver && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="cb-label">I have read and agree to the Liability Waiver and confirm I am in good health and able to participate in a fitness program.</div>
          </div>
          {err && <div className="err">{err}</div>}
          <button className="submit-btn" onClick={handleJoin} disabled={loading || !waiver}>
            {loading ? 'Redirecting...' : (promoOk ? 'Access My Program' : 'Start My Free Month')}
          </button>
          <p className="note">
            {promoOk ? 'Promo code applied. No payment required.' : 'Secure checkout via Stripe. Not charged for 30 days. Cancel before then and you will never be billed.'}
          </p>
        </div>
      </div>
    </div>
  );
}
