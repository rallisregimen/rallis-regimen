import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

var styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap');",
  "* { margin:0; padding:0; box-sizing:border-box; }",
  ":root { --maroon:#7B1A38; --maroon-dark:#5C1229; --maroon-light:#F2E8EC; --off-white:#F7F4EF; --charcoal:#1A1A1A; --mid:#4A4A4A; --gold:#B8943A; --border:rgba(123,26,56,0.12); }",
  "body { background:var(--off-white); color:var(--charcoal); font-family:'Barlow',sans-serif; overflow-x:hidden; }",
  ".fade-in { opacity:0; transform:translateY(24px); transition:opacity 0.7s ease,transform 0.7s ease; }",
  ".fade-in.visible { opacity:1; transform:translateY(0); }",
  "nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:20px 48px; background:rgba(247,244,239,0.95); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); }",
  ".nav-logo { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:18px; letter-spacing:0.12em; color:var(--maroon); text-transform:uppercase; cursor:pointer; }",
  ".nav-logo span { color:var(--charcoal); }",
  ".nav-right { display:flex; align-items:center; gap:20px; }",
  ".nav-free { font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--mid); }",
  ".nav-cta { background:var(--maroon); color:white; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; border:none; cursor:pointer; padding:10px 24px; transition:background 0.2s; }",
  ".nav-cta:hover { background:var(--maroon-dark); }",
  ".nav-login { background:transparent; color:var(--charcoal); font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; border:none; cursor:pointer; padding:10px 16px; transition:color 0.2s; }",
  ".nav-login:hover { color:var(--maroon); }",
  ".hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; padding-top:80px; }",
  ".hero-left { display:flex; flex-direction:column; justify-content:center; padding:80px 64px 80px 48px; position:relative; }",
  ".hero-left::after { content:''; position:absolute; top:0; right:0; bottom:0; width:1px; background:var(--maroon); opacity:0.2; }",
  ".trial-badge { display:inline-flex; align-items:center; gap:8px; background:var(--maroon); color:white; font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; padding:6px 14px; margin-bottom:24px; width:fit-content; }",
  ".trial-dot { width:6px; height:6px; background:#4AE06A; border-radius:50%; }",
  ".hero-headline { font-family:'Playfair Display',serif; font-size:clamp(38px,5vw,68px); font-weight:900; line-height:1.05; color:var(--charcoal); margin-bottom:20px; }",
  ".hero-headline em { font-style:italic; color:var(--maroon); }",
  ".hero-sub { font-size:17px; font-weight:300; line-height:1.7; color:var(--mid); max-width:460px; margin-bottom:16px; }",
  ".trial-callout { background:var(--maroon-light); border-left:3px solid var(--maroon); padding:14px 18px; margin-bottom:36px; max-width:460px; }",
  ".trial-callout-text { font-size:14px; font-weight:400; color:var(--charcoal); line-height:1.6; }",
  ".trial-callout-text strong { font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--maroon); }",
  ".hero-actions { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }",
  ".btn-primary { background:var(--maroon); color:white; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:15px; letter-spacing:0.1em; text-transform:uppercase; border:none; cursor:pointer; padding:16px 36px; transition:background 0.2s,transform 0.15s; }",
  ".btn-primary:hover { background:var(--maroon-dark); transform:translateY(-1px); }",
  ".btn-ghost { background:transparent; color:var(--charcoal); font-family:'Barlow Condensed',sans-serif; font-weight:500; font-size:14px; letter-spacing:0.08em; text-transform:uppercase; border:none; cursor:pointer; padding:16px 0; border-bottom:1px solid var(--charcoal); transition:color 0.2s,border-color 0.2s; }",
  ".btn-ghost:hover { color:var(--maroon); border-color:var(--maroon); }",
  ".no-cc { font-size:12px; font-weight:300; color:var(--mid); margin-top:12px; }",
  ".hero-right { background:var(--maroon); display:flex; flex-direction:column; justify-content:center; padding:80px 48px 80px 64px; position:relative; overflow:hidden; }",
  ".hero-right::before { content:'RR'; position:absolute; bottom:-40px; right:-20px; font-family:'Playfair Display',serif; font-size:280px; font-weight:900; color:rgba(255,255,255,0.04); line-height:1; pointer-events:none; }",
  ".pillars { display:flex; flex-direction:column; }",
  ".pillar { padding:24px 0; border-bottom:1px solid rgba(255,255,255,0.12); display:flex; gap:20px; align-items:flex-start; }",
  ".pillar:first-child { border-top:1px solid rgba(255,255,255,0.12); }",
  ".pillar-num { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.15em; color:rgba(255,255,255,0.4); text-transform:uppercase; min-width:32px; padding-top:3px; }",
  ".pillar-title { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:white; margin-bottom:4px; }",
  ".pillar-desc { font-size:13px; font-weight:300; line-height:1.6; color:rgba(255,255,255,0.6); }",
  ".section { padding:100px 48px; }",
  ".section-inner { max-width:1100px; margin:0 auto; }",
  ".section-label { font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold); margin-bottom:20px; }",
  ".section-title { font-family:'Playfair Display',serif; font-size:clamp(28px,4vw,48px); font-weight:900; line-height:1.1; color:var(--charcoal); margin-bottom:16px; }",
  ".section-title em { font-style:italic; color:var(--maroon); }",
  ".section-sub { font-size:16px; font-weight:300; line-height:1.7; color:var(--mid); max-width:560px; margin-bottom:64px; }",
  ".steps { display:grid; grid-template-columns:repeat(3,1fr); }",
  ".step { padding:40px 36px; border-right:1px solid var(--border); }",
  ".step:last-child { border-right:none; }",
  ".step-num { font-family:'Playfair Display',serif; font-size:56px; font-weight:900; color:rgba(123,26,56,0.08); line-height:1; margin-bottom:16px; }",
  ".step-title { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--charcoal); margin-bottom:10px; }",
  ".step-desc { font-size:14px; font-weight:300; line-height:1.7; color:var(--mid); }",
  ".deliverables-section { background:var(--charcoal); padding:100px 48px; }",
  ".deliverables-inner { max-width:1100px; margin:0 auto; }",
  ".deliverables-section .section-label { color:var(--gold); }",
  ".deliverables-section .section-title { color:white; }",
  ".deliverables-section .section-title em { color:var(--gold); }",
  ".deliverables-section .section-sub { color:rgba(255,255,255,0.5); }",
  ".deliverables { display:grid; grid-template-columns:repeat(2,1fr); gap:2px; background:rgba(255,255,255,0.06); }",
  ".deliverable { background:var(--charcoal); padding:36px; transition:background 0.2s; }",
  ".deliverable:hover { background:#222; }",
  ".deliverable-icon { width:40px; height:40px; background:var(--maroon); display:flex; align-items:center; justify-content:center; margin-bottom:16px; font-size:18px; }",
  ".deliverable-title { font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:white; margin-bottom:8px; }",
  ".deliverable-desc { font-size:13px; font-weight:300; line-height:1.7; color:rgba(255,255,255,0.5); }",
  ".about-section { display:grid; grid-template-columns:1fr 1fr; }",
  ".about-left { background:var(--maroon-light); padding:80px 64px 80px 48px; display:flex; flex-direction:column; justify-content:center; }",
  ".about-right { background:var(--maroon); padding:80px 48px 80px 64px; display:flex; flex-direction:column; justify-content:center; }",
  ".about-quote { font-family:'Playfair Display',serif; font-size:clamp(20px,2.5vw,30px); font-style:italic; font-weight:400; line-height:1.5; color:white; margin-bottom:28px; }",
  ".about-attr { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.5); }",
  ".credentials { display:flex; flex-direction:column; }",
  ".credential { display:flex; gap:14px; align-items:flex-start; padding:16px 0; border-bottom:1px solid rgba(123,26,56,0.15); }",
  ".credential:first-child { border-top:1px solid rgba(123,26,56,0.15); }",
  ".credential-dot { width:7px; height:7px; background:var(--maroon); border-radius:50%; min-width:7px; margin-top:7px; }",
  ".credential-text { font-size:14px; font-weight:300; line-height:1.6; color:var(--mid); }",
  ".credential-text strong { font-weight:600; color:var(--charcoal); font-family:'Barlow Condensed',sans-serif; letter-spacing:0.04em; text-transform:uppercase; font-size:13px; }",
  ".pricing-section { padding:100px 48px; }",
  ".pricing-inner { max-width:680px; margin:0 auto; text-align:center; }",
  ".pricing-card { border:2px solid var(--maroon); padding:56px; position:relative; margin-top:48px; background:white; }",
  ".pricing-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:var(--maroon); color:white; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:6px 20px; white-space:nowrap; }",
  ".trial-hero { font-family:'Playfair Display',serif; font-size:56px; font-weight:900; color:var(--maroon); line-height:1; margin-bottom:4px; }",
  ".trial-sub { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--charcoal); margin-bottom:8px; }",
  ".trial-then { font-size:14px; font-weight:300; color:var(--mid); margin-bottom:40px; }",
  ".price-features { list-style:none; text-align:left; display:flex; flex-direction:column; gap:14px; margin-bottom:40px; }",
  ".price-features li { display:flex; gap:12px; align-items:flex-start; font-size:14px; font-weight:300; line-height:1.5; color:var(--mid); }",
  ".price-features li::before { content:'--'; color:var(--maroon); font-weight:600; min-width:16px; }",
  ".price-note { font-size:12px; color:var(--mid); margin-top:16px; opacity:0.7; }",
  ".faq-section { padding:80px 48px; background:var(--charcoal); }",
  ".faq-inner { max-width:800px; margin:0 auto; }",
  ".faq-section .section-title { color:white; }",
  ".faq-section .section-label { color:var(--gold); }",
  ".faq-list { margin-top:40px; }",
  ".faq-item { border-bottom:1px solid rgba(255,255,255,0.1); padding:24px 0; cursor:pointer; }",
  ".faq-q { display:flex; justify-content:space-between; align-items:center; font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:white; }",
  ".faq-toggle { font-size:22px; color:var(--maroon); font-weight:300; transition:transform 0.3s; }",
  ".faq-toggle.open { transform:rotate(45deg); }",
  ".faq-a { max-height:0; overflow:hidden; font-size:14px; font-weight:300; line-height:1.7; color:rgba(255,255,255,0.5); transition:max-height 0.4s ease,padding-top 0.3s; }",
  ".faq-a.open { max-height:200px; padding-top:14px; }",
  "footer { background:var(--maroon-dark); padding:40px 48px; display:flex; align-items:center; justify-content:space-between; }",
  ".footer-logo { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:15px; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.6); }",
  ".footer-copy { font-size:13px; font-weight:300; color:rgba(255,255,255,0.35); }",
  ".maroon-bar { height:4px; background:linear-gradient(90deg,var(--maroon),var(--gold),var(--maroon)); }",
  "@media(max-width:768px){nav{padding:16px 20px;}.nav-free{display:none;}.hero{grid-template-columns:1fr;}.hero-left{padding:48px 24px;}.hero-right{padding:48px 24px;}.hero-left::after{display:none;}.steps{grid-template-columns:1fr;}.step{border-right:none;border-bottom:1px solid var(--border);}.deliverables{grid-template-columns:1fr;}.about-section{grid-template-columns:1fr;}.about-left,.about-right{padding:48px 24px;}.section,.pricing-section{padding:64px 24px;}.pricing-card{padding:36px 24px;}footer{flex-direction:column;gap:12px;text-align:center;}}"
].join(" ");

var faqs = [
  { q: "What do I get during the free month?", a: "Everything. Your full personalized training program, nutrition plan, sleep protocol, environment guide, workout logging with automatic progression, and unlimited access to The Regimen chat. The same experience paying members get, completely free for 30 days." },
  { q: "Do I need a credit card to start?", a: "Yes, we ask for a card to start your free trial. You will not be charged anything for 30 days. Cancel before then and you will never be billed. We send a reminder at day 25." },
  { q: "How does the workout logging and progression work?", a: "Every exercise in your program has a built-in log. You record your weight, reps, RIR, and any notes after each set. The Regimen reads that data and automatically suggests adjustments for next week, whether that is adding weight, adding reps, or holding steady based on how your body responded." },
  { q: "What can The Regimen chat help with?", a: "Anything health and performance related. Swap an exercise because your shoulder hurts. Shorten a workout because you only have 30 minutes. Ask what to order at a restaurant to hit your macros. Adjust intensity because you only slept 5 hours. It knows your program, your goals, your history, and responds like a coach who actually knows you." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments. Cancel directly from your account settings whenever you want. If you cancel during your free trial you will never be charged." },
];

export default function LandingPage() {
  var router = useRouter();
  var faqState = useState(null);
  var openFaq = faqState[0];
  var setOpenFaq = faqState[1];
  var observerRef = useRef(null);

  useEffect(function() {
    observerRef.current = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in").forEach(function(el) {
      observerRef.current.observe(el);
    });
    return function() {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  function goToJoin() { router.push("/join"); }
  function scrollToHow() {
    var el = document.getElementById("how");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div>
      <style>{styles}</style>

      <nav>
        <div className="nav-logo" onClick={function() { router.push("/"); }}>Rallis <span>Regimen</span></div>
        <div className="nav-right">
          <span className="nav-free">30 Days Free</span>
          <button className="nav-login" onClick={function() { router.push('/login'); }}>Log In</button>
          <button className="nav-cta" onClick={goToJoin}>Start Free Trial</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="trial-badge fade-in visible">
            <span className="trial-dot"></span>
            30-Day Free Trial
          </div>
          <h1 className="hero-headline fade-in visible">
            Your complete<br />health system.<br /><em>Free for a month.</em>
          </h1>
          <p className="hero-sub fade-in visible">
            A fully personalized training program, nutrition plan, sleep protocol, and AI coaching layer — built around your body, your goals, and your life.
          </p>
          <div className="trial-callout fade-in visible">
            <div className="trial-callout-text">
              <strong>Free for 30 days</strong> — get your complete personalized program in minutes. No charge until day 31. Cancel anytime.
            </div>
          </div>
          <div className="hero-actions fade-in visible">
            <button className="btn-primary" onClick={goToJoin}>Start My Free Month</button>
            <button className="btn-ghost" onClick={scrollToHow}>See How It Works</button>
          </div>
          <div className="no-cc fade-in visible">Credit card required. Not charged for 30 days.</div>
        </div>
        <div className="hero-right">
          <div className="pillars">
            {[
              { label: "Train", desc: "Personalized programs with built-in workout logging and automatic weekly progression." },
              { label: "Fuel", desc: "Nutrition protocols matched to your training days, body composition goals, and food preferences." },
              { label: "Sleep", desc: "A daily sleep protocol designed around your schedule to maximize recovery and performance." },
              { label: "Thrive", desc: "Environment and lifestyle guidance that removes hidden obstacles to your health and performance." }
            ].map(function(p, i) {
              return (
                <div className="pillar fade-in visible" key={p.label} style={{ transitionDelay: (i * 0.1) + "s" }}>
                  <div className="pillar-num">{"0" + (i + 1)}</div>
                  <div>
                    <div className="pillar-title">{p.label}</div>
                    <div className="pillar-desc">{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="maroon-bar"></div>

      <section className="section" id="how">
        <div className="section-inner">
          <div className="section-label fade-in">The Process</div>
          <h2 className="section-title fade-in">Three steps.<br /><em>One complete system.</em></h2>
          <p className="section-sub fade-in">No generic templates. A program built for you in minutes — that gets smarter every week you use it.</p>
          <div className="steps">
            {[
              { n: "01", title: "Tell Us About You", desc: "Fill out a short intake form covering your goals, training history, available equipment, schedule, and any constraints. Takes about 5 minutes." },
              { n: "02", title: "Get Your Program", desc: "Your personalized training program, nutrition plan, sleep protocol, and environment checklist are generated and delivered immediately. Updated every month." },
              { n: "03", title: "Log, Progress, Improve", desc: "Log your workouts inline as you train. The Regimen reads your data and automatically suggests next week's weights and reps. The system gets smarter as you use it." }
            ].map(function(s) {
              return (
                <div className="step fade-in" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="deliverables-section">
        <div className="deliverables-inner">
          <div className="section-label fade-in">What You Get</div>
          <h2 className="section-title fade-in">Everything you need.<br /><em>Nothing you don't.</em></h2>
          <p className="section-sub fade-in">Every membership includes the full Rallis Regimen system — not just a workout, but a complete approach to how you train, eat, sleep, and live.</p>
          <div className="deliverables">
            {[
              { icon: "⚡", title: "Monthly Training Program", desc: "A personalized program built around your goals and equipment. Includes warm-ups, sets, reps, RIR targets, and exercise notes. Rebuilt every month as you progress." },
              { icon: "📊", title: "Workout Logging + Auto Progression", desc: "Log weight, reps, RIR, and notes inline as you train. The Regimen reads your data and automatically suggests next week's adjustments. Smarter every session." },
              { icon: "🥩", title: "Custom Nutrition Plan", desc: "A meal plan built to your calorie and macro targets. Structured around your training days with carb cycling, travel-friendly options, and food rotation." },
              { icon: "🌙", title: "Sleep Protocol", desc: "A personalized morning, evening, and sleep environment protocol built around your schedule and current habits." },
              { icon: "💬", title: "The Regimen Chat", desc: "Ask anything, anytime. Swap exercises, shorten workouts, get restaurant macro guidance, adjust intensity based on sleep. Available 24/7, unlimited, and knows your full program." },
              { icon: "🔄", title: "Monthly Regeneration", desc: "Every billing cycle your program updates based on your progress logs. New training block, adjusted nutrition, evolving recommendations. The system grows with you." }
            ].map(function(d) {
              return (
                <div className="deliverable fade-in" key={d.title}>
                  <div className="deliverable-icon">{d.icon}</div>
                  <div className="deliverable-title">{d.title}</div>
                  <div className="deliverable-desc">{d.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="about-section">
        <div className="about-left">
          <div className="section-label fade-in">The Foundation</div>
          <h2 className="section-title fade-in" style={{ marginBottom: 32 }}>Built by someone<br />who has <em>lived it.</em></h2>
          <div className="credentials">
            {[
              { label: "Division I Football", desc: "Competed at the highest level of college football, where performance, recovery, and body composition are non-negotiable." },
              { label: "NFL and WWE", desc: "Went on to play professionally in the NFL and compete as a WWE Superstar — environments demanding elite conditioning sustained over years, not weeks." },
              { label: "Decades of Study", desc: "The Rallis Regimen is built on years of hands-on experimentation, study, and refinement across every pillar of human health and performance." },
              { label: "Real-World Results", desc: "Every protocol in the Regimen has been lived, tested, and refined — not assembled from textbooks, but forged through experience." }
            ].map(function(c) {
              return (
                <div className="credential fade-in" key={c.label}>
                  <div className="credential-dot"></div>
                  <div className="credential-text"><strong>{c.label + " -- "}</strong>{c.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="about-right">
          <div className="about-quote fade-in">
            Every element of health and wellness co-exists in a way that makes us unique as human beings. Improving upon the core tenants of these elements lays the foundation for one to take their life to the next level.
          </div>
          <div className="about-attr fade-in">-- Mike Rallis, The Rallis Regimen</div>
        </div>
      </section>

      <div className="maroon-bar"></div>

      <section className="pricing-section">
        <div className="pricing-inner">
          <div className="section-label fade-in">Membership</div>
          <h2 className="section-title fade-in">Start free.<br /><em>Stay because it works.</em></h2>
          <p className="section-sub fade-in" style={{ margin: "0 auto" }}>
            Get your complete personalized program in minutes. Free for 30 days, no questions asked.
          </p>
          <div className="pricing-card fade-in">
            <div className="pricing-badge">Start Your Free Trial Today</div>
            <div className="trial-hero">30 Days</div>
            <div className="trial-sub">Completely Free</div>
            <div className="trial-then">Then $47/month or $397/year (save 30%). Cancel anytime.</div>
            <ul className="price-features">
              <li>Personalized training program, rebuilt every month</li>
              <li>Workout logging with automatic weekly progression</li>
              <li>Custom nutrition plan with full macro breakdown</li>
              <li>Personalized sleep protocol</li>
              <li>Environment audit and priority action list</li>
              <li>The Regimen chat, unlimited AI coaching 24/7</li>
            </ul>
            <button className="btn-primary" style={{ width: "100%", padding: "20px" }} onClick={goToJoin}>
              Start My Free Month
            </button>
            <p className="price-note">Credit card required. Not charged until day 31. Cancel anytime before then.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-inner">
          <div className="section-label">Questions</div>
          <h2 className="section-title">Common questions<br />answered <em>directly.</em></h2>
          <div className="faq-list">
            {faqs.map(function(f, i) {
              return (
                <div className="faq-item" key={i} onClick={function() { setOpenFaq(openFaq === i ? null : i); }}>
                  <div className="faq-q">
                    <span>{f.q}</span>
                    <span className={openFaq === i ? "faq-toggle open" : "faq-toggle"}>+</span>
                  </div>
                  <div className={openFaq === i ? "faq-a open" : "faq-a"}>{f.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Rallis Regimen</div>
        <div className="footer-copy">2026 Rallis Regimen. All rights reserved.</div>
      </footer>
    </div>
  );
}
