import { useState } from "react";
import { useRouter } from "next/router";

var styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap');",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ":root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}",
  "body{background:var(--off-white);font-family:'Barlow',sans-serif;min-height:100vh;}",
  ".join-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;width:100%;}",
  ".join-left{background:var(--maroon);padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}",
  ".join-logo{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:48px;cursor:pointer;}",
  ".join-headline{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,48px);font-weight:900;color:white;line-height:1.1;margin-bottom:12px;}",
  ".join-headline em{font-style:italic;color:rgba(255,255,255,0.7);}",
  ".join-free-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);color:white;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:6px 12px;margin-bottom:20px;width:fit-content;}",
  ".join-sub{font-size:15px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:40px;}",
  ".join-includes{display:flex;flex-direction:column;}",
  ".join-item{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;font-weight:300;color:rgba(255,255,255,0.7);}",
  ".join-item:first-child{border-top:1px solid rgba(255,255,255,0.1);}",
  ".join-check{width:18px;height:18px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;min-width:18px;font-size:10px;color:white;}",
  ".join-right{padding:80px 64px;display:flex;flex-direction:column;justify-content:center;}",
  ".plan-toggle{display:flex;margin-bottom:28px;border:1.5px solid var(--border);background:white;}",
  ".plan-btn{flex:1;padding:12px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;border:none;background:transparent;cursor:pointer;color:var(--mid);transition:all 0.15s;}",
  ".plan-btn.active{background:var(--maroon);color:white;}",
  ".trial-display{text-align:center;margin-bottom:28px;padding:24px;background:var(--maroon-light);border:1px solid rgba(123,26,56,0.2);}",
  ".trial-big{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:var(--maroon);line-height:1;}",
  ".trial-label{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--charcoal);margin-top:4px;}",
  ".trial-then{font-size:13px;font-weight:300;color:var(--mid);margin-top:6px;}",
  ".price-save{display:inline-block;background:var(--gold);color:white;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:3px 8px;margin-top:4px;}",
  ".field-group{margin-bottom:18px;}",
  ".field-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--charcoal);display:block;margin-bottom:7px;}",
  "input[type=email],input[type=text]{width:100%;background:white;border:1.5px solid var(--border);padding:13px 16px;font-family:'Barlow',sans-serif;font-size:15px;font-weight:300;color:var(--charcoal);outline:none;transition:border-color 0.2s;}",
  "input:focus{border-color:var(--maroon);}",
  ".promo-row{display:flex;gap:8px;}",
  ".promo-row input{flex:1;}",
  ".promo-apply{background:var(--charcoal);color:white;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:13px 18px;transition:background 0.2s;white-space:nowrap;}",
  ".promo-apply:hover{background:var(--maroon);}",
  ".promo-success{font-size:12px;color:#27AE60;font-family:'Barlow Condensed',sans-serif;font-weight:600;margin-top:6px;}",
  ".waiver-box{background:white;border:1px solid var(--border);padding:14px;margin-bottom:16px;max-height:120px;overflow-y:auto;}",
  ".waiver-text{font-size:11px;font-weight:300;color:var(--mid);line-height:1.7;}",
  ".waiver-text strong{font-weight:600;color:var(--charcoal);}",
  ".checkbox-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:18px;cursor:pointer;}",
  ".checkbox-box{width:18px;height:18px;min-width:18px;border:1.5px solid var(--border);background:white;display:flex;align-items:center;justify-content:center;margin-top:2px;transition:all 0.15s;cursor:pointer;}",
  ".checkbox-box.checked{background:var(--maroon);border-color:var(--maroon);}",
  ".checkbox-label{font-size:12px;font-weight:300;color:var(--mid);line-height:1.5;}",
  ".btn-join{width:100%;background:var(--maroon);border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:white;padding:18px;transition:background 0.2s;margin-top:4px;}",
  ".btn-join:hover:not(:disabled){background:var(--maroon-dark);}",
  ".btn-join:disabled{opacity:0.4;cursor:not-allowed;}",
  ".join-note{font-size:11px;font-weight:300;color:var(--mid);margin-top:12px;text-align:center;line-height:1.6;}",
  ".error{color:#C0392B;font-size:12px;margin-top:6px;font-family:'Barlow Condensed',sans-serif;font-weight:500;}",
  ".back-link{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);margin-bottom:32px;cursor:pointer;border:none;background:none;text-decoration:underline;}",
  "@media(max-width:768px){.join-wrap{grid-template-columns:1fr;}.join-left,.join-right{padding:48px 24px;}}"
].join(" ");

var WAIVER = "ASSUMPTION OF RISK AND LIABILITY WAIVER. By enrolling in the Rallis Regimen, I acknowledge that physical exercise involves inherent risks including but not limited to injury, illness, or death. I represent that I am in good physical health and have no medical condition that would prevent me from participating in a fitness program. I agree to consult a physician before beginning any exercise program, especially if I have any known health conditions. I understand that the Rallis Regimen provides general fitness and nutrition information and is not a substitute for professional medical advice, diagnosis, or treatment. I voluntarily assume all risks associated with participation and release Rallis Regimen, its founders, employees, and affiliates from any and all liability for injury, loss, or damage arising from my participation. I acknowledge that results vary and no specific outcomes are guaranteed.";

var INCLUDES = [
  "Full personalized program generated in minutes",
  "Workout logging with automatic progression",
  "Custom nutrition and meal plan",
  "Personalized sleep protocol",
  "Environment audit and action list",
  "The Regimen chat, unlimited 24/7",
  "Cancel anytime, no questions asked",
];

var ADMIN_CODE = "RALLISTEST";

export default function JoinPage() {
  var router = useRouter();
  var planState = useState("monthly");
  var plan = planState[0];
  var setPlan = planState[1];
  var emailState = useState("");
  var email = emailState[0];
  var setEmail = emailState[1];
  var nameState = useState("");
  var name = nameState[0];
  var setName = nameState[1];
  var waiverState = useState(false);
  var waiverAccepted = waiverState[0];
  var setWaiverAccepted = waiverState[1];
  var promoState = useState("");
  var promo = promoState[0];
  var setPromo = promoState[1];
  var promoAppliedState = useState(false);
  var promoApplied = promoAppliedState[0];
  var setPromoApplied = promoAppliedState[1];
  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  function applyPromo() {
    if (promo.toUpperCase() === ADMIN_CODE) {
      setPromoApplied(true);
      setError("");
    } else {
      setError("Invalid promo code.");
    }
  }

  async function handleJoin() {
    if (!email || !name) { setError("Please enter your name and email."); return; }
    if (!waiverAccepted) { setError("Please accept the liability waiver to continue."); return; }
    setLoading(true);
    setError("");

    if (promoApplied) {
      router.push("/intake?bypass=true&name=" + encodeURIComponent(name) + "&email=" + encodeURIComponent(email));
      return;
    }

    try {
      var res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, name: name, plan: plan })
      });
      var data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <style>{styles}</style>
      <div className="join-wrap">

        <div className="join-left">
          <div className="join-logo" onClick={function() { router.push("/"); }}>Rallis Regimen</div>
          <div className="join-free-badge">30 Days Free</div>
          <h1 className="join-headline">Start your<br /><em>free month.</em></h1>
          <p className="join-sub">Get your complete personalized program in minutes. Not charged a thing for 30 days.</p>
          <div className="join-includes">
            {INCLUDES.map(function(item, i) {
              return (
                <div className="join-item" key={i}>
                  <div className="join-check">✓</div>
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        <div className="join-right">
          <button className="back-link" onClick={function() { router.push("/"); }}>Back to home</button>

          <div className="plan-toggle">
            <button className={plan === "monthly" ? "plan-btn active" : "plan-btn"} onClick={function() { setPlan("monthly"); }}>Monthly</button>
            <button className={plan === "annual" ? "plan-btn active" : "plan-btn"} onClick={function() { setPlan("annual"); }}>Annual</button>
          </div>

          <div className="trial-display">
            <div className="trial-big">Free</div>
            <div className="trial-label">for your first 30 days</div>
            <div className="trial-then">
              {plan === "monthly" ? "Then $47/month. Cancel anytime." : "Then $397/year. Cancel anytime."}
            </div>
            {plan === "annual" && <div className="price-save">Save 30% vs monthly</div>}
          </div>

          <div className="field-group">
            <label className="field-label">First Name</label>
            <input type="text" value={name} onChange={function(e) { setName(e.target.value); }} placeholder="Your first name" />
          </div>
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="you@example.com" />
          </div>

          <div className="field-group">
            <label className="field-label">Promo Code</label>
            <div className="promo-row">
              <input type="text" value={promo} onChange={function(e) { setPromo(e.target.value); }} placeholder="Enter code" />
              <button className="promo-apply" onClick={applyPromo}>Apply</button>
            </div>
            {promoApplied && <div className="promo-success">Code applied. No payment required.</div>}
          </div>

          <div className="waiver-box">
            <div className="waiver-text">
              <strong>Assumption of Risk and Liability Waiver</strong><br /><br />
              {WAIVER}
            </div>
          </div>

          <div className="checkbox-row" onClick={function() { setWaiverAccepted(!waiverAccepted); }}>
            <div className={waiverAccepted ? "checkbox-box checked" : "checkbox-box"}>
              {waiverAccepted && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="checkbox-label">
              I have read and agree to the Liability Waiver and confirm I am in good health and able to participate in a fitness program.
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn-join" onClick={handleJoin} disabled={loading || !waiverAccepted}>
            {loading ? "Redirecting..." : (promoApplied ? "Access My Program" : "Start My Free Month")}
          </button>
          <p className="join-note">
            {promoApplied
              ? "Promo code applied. No payment required."
              : "Secure checkout via Stripe. Not charged for 30 days. Cancel before then and you will never be billed."
            }
          </p>
        </div>

      </div>
    </div>
  );
}
