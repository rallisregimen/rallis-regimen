import { useState, useEffect, useRef } from "react";

const MAROON = "#7B1A38";
const MAROON_DARK = "#5C1229";
const MAROON_LIGHT = "#F2E8EC";
const OFF_WHITE = "#F7F4EF";
const CHARCOAL = "#1A1A1A";
const MID = "#4A4A4A";
const GOLD = "#B8943A";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --maroon: ${MAROON};
    --maroon-dark: ${MAROON_DARK};
    --maroon-light: ${MAROON_LIGHT};
    --off-white: ${OFF_WHITE};
    --charcoal: ${CHARCOAL};
    --mid: ${MID};
    --gold: ${GOLD};
  }

  body { background: var(--off-white); color: var(--charcoal); font-family: 'Barlow', sans-serif; overflow-x: hidden; }

  .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    background: rgba(247,244,239,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(123,26,56,0.12);
  }
  .nav-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 18px; letter-spacing: 0.12em;
    color: var(--maroon); text-transform: uppercase;
  }
  .nav-logo span { color: var(--charcoal); }
  .nav-cta {
    background: var(--maroon); color: white;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; font-size: 13px; letter-spacing: 0.1em;
    text-transform: uppercase; border: none; cursor: pointer;
    padding: 10px 24px;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: var(--maroon-dark); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    padding-top: 80px;
  }
  .hero-left {
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 64px 80px 48px;
    background: var(--off-white);
    position: relative;
  }
  .hero-left::after {
    content: '';
    position: absolute; top: 0; right: 0; bottom: 0;
    width: 1px; background: var(--maroon); opacity: 0.2;
  }
  .hero-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; font-size: 12px; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--gold);
    margin-bottom: 24px;
  }
  .hero-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 5vw, 72px);
    font-weight: 900; line-height: 1.05;
    color: var(--charcoal);
    margin-bottom: 32px;
  }
  .hero-headline em {
    font-style: italic; color: var(--maroon);
  }
  .hero-sub {
    font-family: 'Barlow', sans-serif;
    font-size: 17px; font-weight: 300; line-height: 1.7;
    color: var(--mid); max-width: 460px;
    margin-bottom: 48px;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; }
  .btn-primary {
    background: var(--maroon); color: white;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; font-size: 15px; letter-spacing: 0.1em;
    text-transform: uppercase; border: none; cursor: pointer;
    padding: 16px 36px;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover { background: var(--maroon-dark); transform: translateY(-1px); }
  .btn-ghost {
    background: transparent; color: var(--charcoal);
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 500; font-size: 14px; letter-spacing: 0.08em;
    text-transform: uppercase; border: none; cursor: pointer;
    padding: 16px 0;
    border-bottom: 1px solid var(--charcoal);
    transition: color 0.2s, border-color 0.2s;
  }
  .btn-ghost:hover { color: var(--maroon); border-color: var(--maroon); }

  .hero-right {
    background: var(--maroon);
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 48px 80px 64px;
    position: relative; overflow: hidden;
  }
  .hero-right::before {
    content: 'RR';
    position: absolute; bottom: -40px; right: -20px;
    font-family: 'Playfair Display', serif;
    font-size: 320px; font-weight: 900;
    color: rgba(255,255,255,0.04); line-height: 1;
    pointer-events: none;
  }
  .pillars {
    display: flex; flex-direction: column; gap: 0;
  }
  .pillar {
    padding: 28px 0;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    display: flex; gap: 20px; align-items: flex-start;
  }
  .pillar:first-child { border-top: 1px solid rgba(255,255,255,0.12); }
  .pillar-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
    color: rgba(255,255,255,0.4); text-transform: uppercase;
    min-width: 32px; padding-top: 3px;
  }
  .pillar-content { flex: 1; }
  .pillar-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: white;
    margin-bottom: 6px;
  }
  .pillar-desc {
    font-family: 'Barlow', sans-serif;
    font-size: 14px; font-weight: 300; line-height: 1.6;
    color: rgba(255,255,255,0.6);
  }

  /* HOW IT WORKS */
  .section { padding: 120px 48px; }
  .section-inner { max-width: 1100px; margin: 0 auto; }
  .section-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600; font-size: 11px; letter-spacing: 0.25em;
    text-transform: uppercase; color: var(--gold);
    margin-bottom: 20px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 52px); font-weight: 900;
    line-height: 1.1; color: var(--charcoal);
    margin-bottom: 16px;
  }
  .section-title em { font-style: italic; color: var(--maroon); }
  .section-sub {
    font-size: 17px; font-weight: 300; line-height: 1.7;
    color: var(--mid); max-width: 560px; margin-bottom: 72px;
  }

  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .step {
    padding: 40px 36px;
    border-right: 1px solid rgba(123,26,56,0.12);
    position: relative;
  }
  .step:last-child { border-right: none; }
  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 64px; font-weight: 900;
    color: rgba(123,26,56,0.08); line-height: 1;
    margin-bottom: 20px;
  }
  .step-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--charcoal);
    margin-bottom: 12px;
  }
  .step-desc {
    font-size: 15px; font-weight: 300; line-height: 1.7;
    color: var(--mid);
  }

  /* WHAT YOU GET */
  .deliverables-section {
    background: var(--charcoal);
    padding: 120px 48px;
  }
  .deliverables-inner { max-width: 1100px; margin: 0 auto; }
  .deliverables-section .section-label { color: var(--gold); }
  .deliverables-section .section-title { color: white; }
  .deliverables-section .section-title em { color: var(--gold); }
  .deliverables-section .section-sub { color: rgba(255,255,255,0.5); }

  .deliverables {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px;
    background: rgba(255,255,255,0.06);
  }
  .deliverable {
    background: var(--charcoal);
    padding: 40px 36px;
    transition: background 0.2s;
    cursor: default;
  }
  .deliverable:hover { background: #222; }
  .deliverable-icon {
    width: 44px; height: 44px;
    background: var(--maroon);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    font-size: 20px;
  }
  .deliverable-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: white;
    margin-bottom: 10px;
  }
  .deliverable-desc {
    font-size: 14px; font-weight: 300; line-height: 1.7;
    color: rgba(255,255,255,0.5);
  }

  /* ABOUT MIKE */
  .about-section {
    display: grid; grid-template-columns: 1fr 1fr;
    min-height: 600px;
  }
  .about-left {
    background: var(--maroon-light);
    padding: 100px 64px 100px 48px;
    display: flex; flex-direction: column; justify-content: center;
  }
  .about-right {
    background: var(--maroon);
    padding: 100px 48px 100px 64px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; overflow: hidden;
  }
  .about-quote {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 2.5vw, 32px);
    font-style: italic; font-weight: 400;
    line-height: 1.5; color: white;
    margin-bottom: 32px;
    position: relative; z-index: 1;
  }
  .about-quote::before {
    content: '"';
    font-size: 120px; color: rgba(255,255,255,0.08);
    position: absolute; top: -40px; left: -20px;
    font-family: 'Playfair Display', serif;
    line-height: 1; z-index: 0;
  }
  .about-attr {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(255,255,255,0.5);
  }
  .credentials {
    display: flex; flex-direction: column; gap: 16px;
  }
  .credential {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 20px 0; border-bottom: 1px solid rgba(123,26,56,0.15);
  }
  .credential:first-child { border-top: 1px solid rgba(123,26,56,0.15); }
  .credential-dot {
    width: 8px; height: 8px; background: var(--maroon);
    border-radius: 50%; min-width: 8px; margin-top: 6px;
  }
  .credential-text {
    font-size: 15px; font-weight: 300; line-height: 1.6;
    color: var(--mid);
  }
  .credential-text strong {
    font-weight: 600; color: var(--charcoal);
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.04em; text-transform: uppercase;
    font-size: 14px;
  }

  /* PRICING */
  .pricing-section { padding: 120px 48px; background: var(--off-white); }
  .pricing-inner { max-width: 700px; margin: 0 auto; text-align: center; }
  .pricing-card {
    border: 2px solid var(--maroon);
    padding: 64px;
    position: relative; margin-top: 48px;
    background: white;
  }
  .pricing-badge {
    position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    background: var(--maroon); color: white;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; padding: 6px 20px;
  }
  .price-amount {
    font-family: 'Playfair Display', serif;
    font-size: 80px; font-weight: 900;
    color: var(--charcoal); line-height: 1;
  }
  .price-period {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 400; letter-spacing: 0.06em;
    color: var(--mid); margin-top: 8px; margin-bottom: 48px;
  }
  .price-features {
    list-style: none; text-align: left;
    display: flex; flex-direction: column; gap: 16px;
    margin-bottom: 48px;
  }
  .price-features li {
    display: flex; gap: 14px; align-items: flex-start;
    font-size: 15px; font-weight: 300; line-height: 1.5; color: var(--mid);
  }
  .price-features li::before {
    content: '—'; color: var(--maroon); font-weight: 600;
    min-width: 14px; margin-top: 1px;
  }
  .price-note {
    font-size: 13px; color: var(--mid); margin-top: 20px; opacity: 0.7;
  }

  /* FAQ */
  .faq-section { padding: 100px 48px; background: var(--charcoal); }
  .faq-inner { max-width: 800px; margin: 0 auto; }
  .faq-section .section-title { color: white; }
  .faq-section .section-label { color: var(--gold); }
  .faq-list { margin-top: 48px; }
  .faq-item {
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 28px 0; cursor: pointer;
  }
  .faq-q {
    display: flex; justify-content: space-between; align-items: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; color: white;
  }
  .faq-toggle {
    font-size: 24px; color: var(--maroon); font-weight: 300;
    transition: transform 0.3s;
  }
  .faq-toggle.open { transform: rotate(45deg); }
  .faq-a {
    max-height: 0; overflow: hidden;
    font-size: 15px; font-weight: 300; line-height: 1.7;
    color: rgba(255,255,255,0.5);
    transition: max-height 0.4s ease, padding-top 0.3s;
  }
  .faq-a.open { max-height: 200px; padding-top: 16px; }

  /* FOOTER */
  footer {
    background: var(--maroon-dark);
    padding: 48px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700; font-size: 16px; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(255,255,255,0.6);
  }
  .footer-copy {
    font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.35);
  }

  /* DIVIDER */
  .maroon-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--maroon), var(--gold), var(--maroon));
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .hero { grid-template-columns: 1fr; }
    .hero-left { padding: 60px 24px; }
    .hero-right { padding: 60px 24px; }
    .hero-left::after { display: none; }
    .steps { grid-template-columns: 1fr; }
    .step { border-right: none; border-bottom: 1px solid rgba(123,26,56,0.12); }
    .deliverables { grid-template-columns: 1fr; }
    .about-section { grid-template-columns: 1fr; }
    .about-left { padding: 60px 24px; }
    .about-right { padding: 60px 24px; }
    .section { padding: 80px 24px; }
    .pricing-section { padding: 80px 24px; }
    .pricing-card { padding: 40px 24px; }
    footer { flex-direction: column; gap: 16px; text-align: center; }
  }
`;

const faqs = [
  {
    q: "Is this a generic app program or actually personalized?",
    a: "Every program is built specifically for you based on your goals, experience level, available training days, equipment, and time constraints — using the same framework Mike uses with his personal coaching clients."
  },
  {
    q: "What do I need to get started?",
    a: "Just a few minutes to fill out the intake form. No gym required — programs are built for whatever equipment you have access to, including full bodyweight-only options."
  },
  {
    q: "How is this different from other fitness apps?",
    a: "Most apps give you pre-built programs and call them personalized. The Rallis Regimen generates a program specific to you and includes training, nutrition, sleep, and environment guidance — the full picture, not just workouts."
  },
  {
    q: "What happens after I sign up?",
    a: "You fill out the intake questionnaire, and your personalized program — training plan, meal plan, and lifestyle protocol — is generated and delivered to you. A new program is generated each month as you progress."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel whenever you want directly from your account dashboard."
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in").forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo">Rallis <span>Regimen</span></div>
        <button className="nav-cta">Start Your Regimen</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow fade-in visible">Holistic Performance · Edition 1</div>
          <h1 className="hero-headline fade-in visible">
            Train with<br /><em>intention.</em><br />Live with purpose.
          </h1>
          <p className="hero-sub fade-in visible">
            A fully personalized program built around your body, your goals, and your life — covering training, nutrition, sleep, and environment. The complete system. Nothing left out.
          </p>
          <div className="hero-actions fade-in visible">
            <button className="btn-primary">Build My Program</button>
            <button className="btn-ghost">See How It Works</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="pillars">
            {[
              { label: "Train", desc: "Personalized resistance and conditioning programs built around your goals, schedule, and equipment." },
              { label: "Fuel", desc: "Nutrition protocols matched to your training days, body composition goals, and food preferences." },
              { label: "Sleep", desc: "A daily sleep protocol designed around your schedule to maximize recovery and performance." },
              { label: "Thrive", desc: "Environment and lifestyle guidance that removes hidden obstacles to your health and performance." }
            ].map((p, i) => (
              <div className="pillar fade-in visible" key={p.label} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="pillar-num">0{i + 1}</div>
                <div className="pillar-content">
                  <div className="pillar-title">{p.label}</div>
                  <div className="pillar-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="maroon-bar" />

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label fade-in">The Process</div>
          <h2 className="section-title fade-in">Three steps.<br /><em>One complete system.</em></h2>
          <p className="section-sub fade-in">No generic templates. No cookie-cutter plans. A program that's actually built for you — in minutes.</p>

          <div className="steps">
            {[
              {
                n: "01", title: "Tell Us About You",
                desc: "Fill out a short intake form covering your goals, training history, available equipment, schedule, and any constraints. Takes about 5 minutes."
              },
              {
                n: "02", title: "Get Your Program",
                desc: "Your personalized training program, nutrition plan, sleep protocol, and environment checklist are generated and delivered immediately."
              },
              {
                n: "03", title: "Progress Every Month",
                desc: "A new program is built each month that builds on your progress — new exercises, adjusted loads, evolved nutrition targets. It grows with you."
              }
            ].map(s => (
              <div className="step fade-in" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <div className="deliverables-section">
        <div className="deliverables-inner">
          <div className="section-label fade-in">What's Included</div>
          <h2 className="section-title fade-in">Everything you need.<br /><em>Nothing you don't.</em></h2>
          <p className="section-sub fade-in">Every membership includes the full Rallis Regimen system — not just a workout, but a complete approach to how you train, eat, sleep, and live.</p>

          <div className="deliverables">
            {[
              { icon: "⚡", title: "Personalized Training Program", desc: "A 12-week program built around your goals and equipment — strength, hypertrophy, conditioning, or all of the above. Includes warm-ups, exercise notes, sets, reps, RIR targets, and recovery protocol." },
              { icon: "🥩", title: "Custom Nutrition Plan", desc: "A meal plan built to your calorie and macro targets, using high-quality whole foods from the Rallis Regimen food list. Structured around your training days with high and low carb days mapped to your schedule." },
              { icon: "🌙", title: "Sleep Protocol", desc: "A personalized morning, evening, and sleep environment protocol designed around your schedule and current sleep habits. Built from the complete Rallis Regimen sleep framework." },
              { icon: "🌿", title: "Environment Guide", desc: "A prioritized action list of the highest-impact environment changes for your specific situation — from light exposure to EMF to water quality. Start with the easy wins, build from there." },
              { icon: "📋", title: "Program Write-Up", desc: "A clear explanation of your program — goals, approach, and key principles — so you understand not just what to do but why. Written in plain language, not fitness jargon." },
              { icon: "🔄", title: "Monthly Regeneration", desc: "Every billing cycle, your program updates. New training block, adjusted nutrition targets, evolving sleep and environment recommendations. The system keeps moving forward with you." }
            ].map(d => (
              <div className="deliverable fade-in" key={d.title}>
                <div className="deliverable-icon">{d.icon}</div>
                <div className="deliverable-title">{d.title}</div>
                <div className="deliverable-desc">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-left">
          <div className="section-label fade-in">The Foundation</div>
          <h2 className="section-title fade-in" style={{ marginBottom: 32 }}>Built by someone who's<br /><em>lived it.</em></h2>
          <div className="credentials">
            {[
              { label: "Division I Football", desc: "Competed at the highest level of college football, where the demands of performance, recovery, and body composition are non-negotiable." },
              { label: "NFL & WWE", desc: "Went on to play professionally in the NFL and compete as a WWE Superstar — environments that require elite conditioning sustained over years, not weeks." },
              { label: "Decades of Study", desc: "The Rallis Regimen is built on years of hands-on experimentation, study, and refinement across every pillar of human health and performance." },
              { label: "Real-World Results", desc: "Every protocol in the Regimen has been lived, tested, and refined — not assembled from textbooks, but forged through experience at the highest levels of physical demand." }
            ].map(c => (
              <div className="credential fade-in" key={c.label}>
                <div className="credential-dot" />
                <div className="credential-text"><strong>{c.label} — </strong>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="about-right">
          <div className="about-quote fade-in">
            Every element of health and wellness co-exists in a way that makes us unique as human beings. Improving upon the core tenants of these elements lays the foundation for one to take their life to the next level.
          </div>
          <div className="about-attr fade-in">— Mike Rallis, The Rallis Regimen</div>
        </div>
      </section>

      <div className="maroon-bar" />

      {/* PRICING */}
      <section className="pricing-section">
        <div className="pricing-inner">
          <div className="section-label fade-in">Membership</div>
          <h2 className="section-title fade-in">Simple pricing.<br /><em>Complete system.</em></h2>
          <p className="section-sub fade-in" style={{ margin: "0 auto 0" }}>
            One tier. Everything included. Less than a single personal training session — for a full month of personalized guidance across every pillar of your health.
          </p>

          <div className="pricing-card fade-in">
            <div className="pricing-badge">The Rallis Regimen Membership</div>
            <div className="price-amount">$47</div>
            <div className="price-period">per month · cancel anytime</div>
            <ul className="price-features">
              <li>Personalized 12-week training program, rebuilt monthly</li>
              <li>Custom nutrition plan with full macro breakdown</li>
              <li>Personalized sleep protocol</li>
              <li>Environment audit and priority action list</li>
              <li>Program write-up explaining your goals and approach</li>
              <li>Update your profile anytime — program regenerates automatically</li>
            </ul>
            <button className="btn-primary" style={{ width: "100%", padding: "20px" }}>
              Start Your Regimen
            </button>
            <p className="price-note">Annual membership available at $397 (save 30%)</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-inner">
          <div className="section-label">Questions</div>
          <h2 className="section-title">Common questions<br />answered <em>directly.</em></h2>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div className="faq-item" key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">
                  <span>{f.q}</span>
                  <span className={`faq-toggle ${openFaq === i ? "open" : ""}`}>+</span>
                </div>
                <div className={`faq-a ${openFaq === i ? "open" : ""}`}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Rallis Regimen</div>
        <div className="footer-copy">© 2026 Rallis Regimen. All rights reserved.</div>
      </footer>
    </>
  );
}
