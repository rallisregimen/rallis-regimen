import { useState } from "react";

const SUPABASE_URL = "https://jehlppchjdjizacytpks.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaGxwcGNoamRqaXphY3l0cGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2NDksImV4cCI6MjA4OTI4ODY0OX0.bfzjHeG9AnOZcGoaEMPG4budZ3KagxbCowmybjN-ILQ";

const styles = [
  "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap');",
  "* { margin:0; padding:0; box-sizing:border-box; }",
  ":root { --maroon:#7B1A38; --maroon-dark:#5C1229; --maroon-light:#F2E8EC; --off-white:#F7F4EF; --charcoal:#1A1A1A; --mid:#4A4A4A; --gold:#B8943A; --border:rgba(123,26,56,0.15); --error:#C0392B; }",
  "body { background:var(--off-white); font-family:'Barlow',sans-serif; min-height:100vh; }",
  ".intake-wrapper { min-height:100vh; display:grid; grid-template-columns:300px 1fr; }",
  ".sidebar { background:var(--maroon); padding:48px 32px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }",
  ".sidebar-logo { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:16px; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.9); margin-bottom:48px; }",
  ".sidebar-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:white; line-height:1.3; margin-bottom:8px; }",
  ".sidebar-sub { font-size:13px; font-weight:300; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:48px; }",
  ".steps-nav { flex:1; }",
  ".step-nav-item { display:flex; gap:14px; align-items:flex-start; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.08); cursor:pointer; transition:opacity 0.2s; }",
  ".step-nav-item:first-child { border-top:1px solid rgba(255,255,255,0.08); }",
  ".step-nav-item.inactive { opacity:0.35; } .step-nav-item.active { opacity:1; } .step-nav-item.completed { opacity:0.7; }",
  ".step-dot { width:24px; height:24px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); min-width:24px; margin-top:1px; transition:all 0.2s; }",
  ".step-nav-item.active .step-dot { background:white; border-color:white; color:var(--maroon); }",
  ".step-nav-item.completed .step-dot { background:rgba(255,255,255,0.2); border-color:rgba(255,255,255,0.4); color:white; }",
  ".step-nav-label { font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:white; padding-top:3px; }",
  ".progress-bar { height:3px; background:rgba(255,255,255,0.15); border-radius:2px; margin-top:40px; overflow:hidden; }",
  ".progress-fill { height:100%; background:white; border-radius:2px; transition:width 0.4s ease; }",
  ".progress-label { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:500; letter-spacing:0.1em; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:10px; }",
  ".form-main { padding:64px 72px; max-width:760px; }",
  ".section-eyebrow { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold); margin-bottom:12px; }",
  ".section-heading { font-family:'Playfair Display',serif; font-size:36px; font-weight:900; color:var(--charcoal); line-height:1.1; margin-bottom:8px; }",
  ".section-heading em { font-style:italic; color:var(--maroon); }",
  ".section-desc { font-size:15px; font-weight:300; color:var(--mid); line-height:1.7; margin-bottom:48px; }",
  ".field-group { margin-bottom:32px; }",
  ".field-label { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--charcoal); margin-bottom:10px; display:block; }",
  ".field-hint { font-size:13px; font-weight:300; color:var(--mid); margin-bottom:12px; display:block; line-height:1.5; }",
  ".field-required { color:var(--maroon); margin-left:2px; }",
  "input[type=text],input[type=number],select,textarea { width:100%; background:white; border:1px solid var(--border); padding:14px 16px; font-family:'Barlow',sans-serif; font-size:15px; font-weight:300; color:var(--charcoal); outline:none; transition:border-color 0.2s; appearance:none; }",
  "input:focus,select:focus,textarea:focus { border-color:var(--maroon); }",
  "textarea { resize:vertical; min-height:80px; }",
  ".field-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }",
  ".option-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }",
  ".option-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }",
  ".option-card { background:white; border:1.5px solid var(--border); padding:16px 18px; cursor:pointer; transition:all 0.15s; display:flex; gap:12px; align-items:flex-start; }",
  ".option-card:hover,.option-card.selected { border-color:var(--maroon); background:var(--maroon-light); }",
  ".option-card.selected .option-check { background:var(--maroon); border-color:var(--maroon); }",
  ".option-check { width:18px; height:18px; min-width:18px; border:1.5px solid rgba(123,26,56,0.3); margin-top:1px; transition:all 0.15s; display:flex; align-items:center; justify-content:center; }",
  ".option-check.round { border-radius:50%; }",
  ".option-check svg { opacity:0; transition:opacity 0.15s; }",
  ".option-card.selected .option-check svg { opacity:1; }",
  ".option-label { font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--charcoal); margin-bottom:3px; }",
  ".option-desc { font-size:12px; font-weight:300; color:var(--mid); line-height:1.5; }",
  ".priority-block { margin-bottom:32px; }",
  ".priority-label { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--charcoal); margin-bottom:10px; display:block; }",
  ".priority-badge { display:inline-block; background:var(--maroon); color:white; font-family:'Barlow Condensed',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; padding:3px 8px; margin-left:8px; vertical-align:middle; }",
  ".priority-badge.secondary { background:var(--gold); }",
  ".toggle-row { display:flex; justify-content:space-between; align-items:center; padding:16px 0; border-bottom:1px solid var(--border); }",
  ".toggle-row:first-child { border-top:1px solid var(--border); }",
  ".toggle-text { flex:1; }",
  ".toggle-title { font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--charcoal); }",
  ".toggle-sub { font-size:13px; font-weight:300; color:var(--mid); line-height:1.5; }",
  ".toggle-switch { width:44px; height:24px; background:rgba(123,26,56,0.15); border-radius:12px; cursor:pointer; position:relative; transition:background 0.2s; min-width:44px; margin-left:16px; border:none; }",
  ".toggle-switch.on { background:var(--maroon); }",
  ".toggle-knob { position:absolute; top:3px; left:3px; width:18px; height:18px; background:white; border-radius:50%; transition:left 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }",
  ".toggle-switch.on .toggle-knob { left:23px; }",
  ".form-nav { display:flex; justify-content:space-between; align-items:center; margin-top:56px; padding-top:32px; border-top:1px solid var(--border); }",
  ".btn-back { background:transparent; border:none; cursor:pointer; font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--mid); padding:14px 0; border-bottom:1px solid var(--mid); }",
  ".btn-next { background:var(--maroon); border:none; cursor:pointer; font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:white; padding:16px 48px; transition:background 0.2s; }",
  ".btn-next:hover { background:var(--maroon-dark); }",
  ".btn-next:disabled { opacity:0.4; cursor:not-allowed; }",
  ".success-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; padding:48px; }",
  ".success-icon { width:72px; height:72px; background:var(--maroon); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:32px; font-size:32px; }",
  ".success-title { font-family:'Playfair Display',serif; font-size:42px; font-weight:900; color:var(--charcoal); margin-bottom:16px; }",
  ".success-title em { font-style:italic; color:var(--maroon); }",
  ".success-sub { font-size:16px; font-weight:300; color:var(--mid); line-height:1.7; max-width:480px; }",
  ".error-msg { color:var(--error); font-size:13px; margin-top:6px; font-family:'Barlow Condensed',sans-serif; font-weight:500; }",
  "@media(max-width:900px){.intake-wrapper{grid-template-columns:1fr;}.sidebar{position:static;height:auto;padding:32px 24px;}.steps-nav{display:none;}.form-main{padding:40px 24px;}.option-grid{grid-template-columns:1fr;}.option-grid-3{grid-template-columns:1fr 1fr;}.field-row{grid-template-columns:1fr;}}"
].join(" ");

const GOALS = [
  { id: "build_muscle", label: "Build Muscle", desc: "Maximize hypertrophy and improve body composition" },
  { id: "build_strength", label: "Build Strength", desc: "Increase maximum force output and get stronger" },
  { id: "lose_fat", label: "Lose Body Fat", desc: "Reduce body fat while preserving muscle" },
  { id: "athletic_performance", label: "Athletic Performance", desc: "Improve speed, power, and sport-specific fitness" },
  { id: "conditioning", label: "Conditioning & Endurance", desc: "Build aerobic and anaerobic capacity" },
  { id: "general_health", label: "General Health", desc: "Improve overall health and quality of life" },
];

const EQUIPMENT_CARDS = [
  { id: "full_gym", label: "Full Gym", desc: "Barbells, dumbbells, cables, machines" },
  { id: "dumbbells_only", label: "Dumbbells Only", desc: "Dumbbells and a bench" },
  { id: "home_bands", label: "Home + Bands", desc: "Bodyweight, resistance bands, minimal equipment" },
  { id: "bodyweight_only", label: "Bodyweight Only", desc: "No equipment needed" },
];

const SPECIFIC_EQUIPMENT = ["Barbell", "Trap Bar", "Safety Squat Bar", "Dumbbells", "Kettlebells", "Cable Machines", "Weight Machines", "Resistance Bands", "Pull-Up Bar"];

const DIETARY = ["None", "No red meat", "No pork", "Pescatarian", "Vegetarian", "Vegan", "Gluten free", "Dairy free", "Halal", "Kosher"];

const STEPS = [
  { num: "01", label: "About You" },
  { num: "02", label: "Your Goals" },
  { num: "03", label: "Training" },
  { num: "04", label: "Nutrition" },
  { num: "05", label: "Sleep" },
  { num: "06", label: "Environment" },
];

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OptionCard(props) {
  var selected = props.selected;
  var onClick = props.onClick;
  var label = props.label;
  var desc = props.desc;
  var multi = props.multi;
  return (
    <div className={selected ? "option-card selected" : "option-card"} onClick={onClick}>
      <div className={multi ? "option-check" : "option-check round"}>
        <CheckIcon />
      </div>
      <div>
        <div className="option-label">{label}</div>
        {desc && <div className="option-desc">{desc}</div>}
      </div>
    </div>
  );
}

function Toggle(props) {
  var label = props.label;
  var sub = props.sub;
  var value = props.value;
  var onChange = props.onChange;
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <div className="toggle-title">{label}</div>
        {sub && <div className="toggle-sub">{sub}</div>}
      </div>
      <button className={value ? "toggle-switch on" : "toggle-switch"} onClick={function() { onChange(!value); }}>
        <div className="toggle-knob" />
      </button>
    </div>
  );
}

export default function IntakeForm() {
  var stepState = useState(0);
  var step = stepState[0];
  var setStep = stepState[1];

  var submittedState = useState(false);
  var submitted = submittedState[0];
  var setSubmitted = submittedState[1];

  var submittingState = useState(false);
  var submitting = submittingState[0];
  var setSubmitting = submittingState[1];

  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];

  var formState = useState({
    first_name: "", age: "", sex: "",
    height_ft: "", height_in: "", current_weight_lbs: "", ideal_weight_lbs: "",
    goal_primary: "", goal_secondary: "",
    experience_level: "", training_days_per_week: "", session_length_mins: "",
    equipment: "", equipment_detail: [], injuries_limitations: "", burnout_history: "",
    weight_management_goal: "", dietary_restrictions: [], travel_frequency: "",
    foods_to_avoid: "", food_preferences: "", nutrition_approach: "",
    avg_sleep_hours: "", sleep_issue: "", typical_bedtime: "", typical_wake_time: "",
    caffeine_after_noon: false, phone_in_bedroom: false,
    filters_water: false, morning_sunlight: false,
    nonstick_cookware: false, conventional_cleaning: false,
    phone_in_bedroom_sleeping: false, success_vision: "",
  });
  var form = formState[0];
  var setForm = formState[1];

  function set(key, val) {
    setForm(function(f) {
      var next = {};
      for (var k in f) next[k] = f[k];
      next[key] = val;
      return next;
    });
  }

  function toggleArr(key, val) {
    setForm(function(f) {
      var arr = f[key] || [];
      var next = arr.indexOf(val) >= 0
        ? arr.filter(function(v) { return v !== val; })
        : arr.concat([val]);
      var result = {};
      for (var k in f) result[k] = f[k];
      result[key] = next;
      return result;
    });
  }

  var totalSteps = STEPS.length;
  var progress = Math.round(((step + 1) / totalSteps) * 100);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      var payload = {};
      for (var k in form) payload[k] = form[k];
      payload.age = parseInt(form.age) || null;
      payload.height_ft = parseInt(form.height_ft) || null;
      payload.height_in = parseInt(form.height_in) || null;
      payload.current_weight_lbs = parseFloat(form.current_weight_lbs) || null;
      payload.ideal_weight_lbs = parseFloat(form.ideal_weight_lbs) || null;
      payload.training_days_per_week = parseInt(form.training_days_per_week) || null;
      payload.session_length_mins = parseInt(form.session_length_mins) || null;
      payload.avg_sleep_hours = parseFloat(form.avg_sleep_hours) || null;
      payload.user_id = "00000000-0000-0000-0000-000000000001";

      var res = await fetch(SUPABASE_URL + "/rest/v1/intake_submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + SUPABASE_ANON_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <style>{styles}</style>
        <div className="intake-wrapper">
          <div className="sidebar">
            <div className="sidebar-logo">Rallis Regimen</div>
            <div className="sidebar-title">Your program is being built.</div>
            <div className="sidebar-sub">Check your dashboard shortly.</div>
          </div>
          <div className="form-main">
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <div className="success-title">You are all set, <em>{form.first_name || "athlete"}.</em></div>
              <p className="success-sub">Your personalized Rallis Regimen program is being generated. Your training program, nutrition plan, sleep protocol, and environment guide will be ready shortly.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{styles}</style>
      <div className="intake-wrapper">

        <div className="sidebar">
          <div className="sidebar-logo">Rallis Regimen</div>
          <div className="sidebar-title">Build Your Regimen</div>
          <div className="sidebar-sub">Answer honestly. The more accurate your answers, the better your program.</div>
          <div className="steps-nav">
            {STEPS.map(function(s, i) {
              return (
                <div key={s.num}
                  className={"step-nav-item " + (i === step ? "active" : i < step ? "completed" : "inactive")}
                  onClick={function() { if (i < step) setStep(i); }}>
                  <div className="step-dot">{i < step ? "✓" : s.num}</div>
                  <div className="step-nav-label">{s.label}</div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progress + "%" }} />
            </div>
            <div className="progress-label">{progress}% complete</div>
          </div>
        </div>

        <div className="form-main">

          {step === 0 && (
            <div>
              <div className="section-eyebrow">Step 1 of 6</div>
              <h2 className="section-heading">Tell us about <em>you.</em></h2>
              <p className="section-desc">Basic information used to calculate your calorie targets, macro needs, and program structure.</p>
              <div className="field-group">
                <label className="field-label">First Name <span className="field-required">*</span></label>
                <input type="text" value={form.first_name} onChange={function(e) { set("first_name", e.target.value); }} placeholder="Your first name" />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Age <span className="field-required">*</span></label>
                  <input type="number" value={form.age} onChange={function(e) { set("age", e.target.value); }} placeholder="e.g. 34" min="16" max="90" />
                </div>
                <div className="field-group">
                  <label className="field-label">Sex <span className="field-required">*</span></label>
                  <select value={form.sex} onChange={function(e) { set("sex", e.target.value); }}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Height <span className="field-required">*</span></label>
                <div className="field-row">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={form.height_ft} onChange={function(e) { set("height_ft", e.target.value); }} placeholder="ft" min="4" max="7" style={{ width: "100%" }} />
                    <span style={{ color: "var(--mid)", fontFamily: "Barlow Condensed", fontSize: 13 }}>ft</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={form.height_in} onChange={function(e) { set("height_in", e.target.value); }} placeholder="in" min="0" max="11" style={{ width: "100%" }} />
                    <span style={{ color: "var(--mid)", fontFamily: "Barlow Condensed", fontSize: 13 }}>in</span>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Current Weight (lbs) <span className="field-required">*</span></label>
                  <input type="number" value={form.current_weight_lbs} onChange={function(e) { set("current_weight_lbs", e.target.value); }} placeholder="e.g. 185" />
                </div>
                <div className="field-group">
                  <label className="field-label">Ideal Weight (lbs) <span className="field-required">*</span></label>
                  <span className="field-hint">The weight where you feel and perform your best.</span>
                  <input type="number" value={form.ideal_weight_lbs} onChange={function(e) { set("ideal_weight_lbs", e.target.value); }} placeholder="e.g. 175" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="section-eyebrow">Step 2 of 6</div>
              <h2 className="section-heading">What are you here <em>for?</em></h2>
              <p className="section-desc">Pick one primary goal and one secondary. Your program is built around your number one priority.</p>
              <div className="priority-block">
                <span className="priority-label">Primary Goal <span className="priority-badge">#1 Priority</span></span>
                <div className="option-grid">
                  {GOALS.map(function(g) {
                    return (
                      <OptionCard key={g.id} selected={form.goal_primary === g.id}
                        onClick={function() { set("goal_primary", g.id); if (form.goal_secondary === g.id) set("goal_secondary", ""); }}
                        label={g.label} desc={g.desc} />
                    );
                  })}
                </div>
              </div>
              <div className="priority-block">
                <span className="priority-label">Secondary Goal <span className="priority-badge secondary">#2 Priority</span></span>
                <span className="field-hint">Must be different from your primary goal.</span>
                <div className="option-grid">
                  {GOALS.filter(function(g) { return g.id !== form.goal_primary; }).map(function(g) {
                    return (
                      <OptionCard key={g.id} selected={form.goal_secondary === g.id}
                        onClick={function() { set("goal_secondary", g.id); }}
                        label={g.label} desc={g.desc} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="section-eyebrow">Step 3 of 6</div>
              <h2 className="section-heading">Your training <em>situation.</em></h2>
              <p className="section-desc">This determines your program structure, split, and exercise selection. Be honest about your schedule.</p>
              <div className="field-group">
                <label className="field-label">Experience Level <span className="field-required">*</span></label>
                <div className="option-grid-3">
                  {[
                    { id: "beginner", label: "Beginner", desc: "Under 1 year of consistent training" },
                    { id: "intermediate", label: "Intermediate", desc: "1-3 years of consistent training" },
                    { id: "advanced", label: "Advanced", desc: "3+ years of consistent training" },
                  ].map(function(o) {
                    return <OptionCard key={o.id} selected={form.experience_level === o.id} onClick={function() { set("experience_level", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Training Days Per Week <span className="field-required">*</span></label>
                  <span className="field-hint">How many days can you realistically commit?</span>
                  <select value={form.training_days_per_week} onChange={function(e) { set("training_days_per_week", e.target.value); }}>
                    <option value="">Select...</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Session Length <span className="field-required">*</span></label>
                  <span className="field-hint">How long per session?</span>
                  <select value={form.session_length_mins} onChange={function(e) { set("session_length_mins", e.target.value); }}>
                    <option value="">Select...</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">90+ minutes</option>
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Primary Equipment Access <span className="field-required">*</span></label>
                <div className="option-grid">
                  {EQUIPMENT_CARDS.map(function(o) {
                    return <OptionCard key={o.id} selected={form.equipment === o.id} onClick={function() { set("equipment", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Specific Equipment</label>
                <span className="field-hint">Select everything you have access to.</span>
                <div className="option-grid">
                  {SPECIFIC_EQUIPMENT.map(function(item) {
                    return (
                      <OptionCard key={item} multi
                        selected={(form.equipment_detail || []).indexOf(item) >= 0}
                        onClick={function() { toggleArr("equipment_detail", item); }}
                        label={item} />
                    );
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Have you ever burned out from training?</label>
                <span className="field-hint">Too much volume, overtraining, or an unsustainable program.</span>
                <div className="option-grid-3">
                  {[
                    { id: "no", label: "No", desc: "Never had burnout issues" },
                    { id: "yes_mild", label: "Somewhat", desc: "Felt overtrained a few times" },
                    { id: "yes_severe", label: "Yes", desc: "Burned out and took significant time off" },
                  ].map(function(o) {
                    return <OptionCard key={o.id} selected={form.burnout_history === o.id} onClick={function() { set("burnout_history", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Injuries or Limitations</label>
                <span className="field-hint">Any injuries, chronic pain, or movements to avoid? Leave blank if none.</span>
                <textarea value={form.injuries_limitations} onChange={function(e) { set("injuries_limitations", e.target.value); }} placeholder="e.g. Lower back issues, avoid heavy overhead pressing." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="section-eyebrow">Step 4 of 6</div>
              <h2 className="section-heading">How you <em>fuel.</em></h2>
              <p className="section-desc">Your nutrition plan is built around your training schedule, body composition goal, and food preferences.</p>
              <div className="field-group">
                <label className="field-label">Weight Management Goal <span className="field-required">*</span></label>
                <div className="option-grid-3">
                  {[
                    { id: "bulk", label: "Gain Weight", desc: "Calorie surplus to maximize muscle and strength" },
                    { id: "maintain", label: "Maintain", desc: "Calorie maintenance, recomp and performance" },
                    { id: "cut", label: "Lose Weight", desc: "Calorie deficit to reduce body fat" },
                  ].map(function(o) {
                    return <OptionCard key={o.id} selected={form.weight_management_goal === o.id} onClick={function() { set("weight_management_goal", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Nutrition Approach <span className="field-required">*</span></label>
                <span className="field-hint">How do you prefer to track your food intake?</span>
                <div className="option-grid">
                  {[
                    { id: "macro_tracking", label: "Macro Tracking", desc: "Exact grams of protein, carbs, and fat per meal" },
                    { id: "fist_portions", label: "Fist Portions", desc: "Simple visual portion guidelines, no counting required" },
                  ].map(function(o) {
                    return <OptionCard key={o.id} selected={form.nutrition_approach === o.id} onClick={function() { set("nutrition_approach", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">How often do you travel or eat away from home?</label>
                <div className="option-grid">
                  {[
                    { id: "rarely", label: "Rarely", desc: "Home most of the time, cook most meals" },
                    { id: "sometimes", label: "1-2 days/week", desc: "Occasional travel or eating out" },
                    { id: "often", label: "3-4 days/week", desc: "Travel or restaurants several days a week" },
                    { id: "mostly", label: "Most of the time", desc: "Mostly eating out or premade meals" },
                  ].map(function(o) {
                    return <OptionCard key={o.id} selected={form.travel_frequency === o.id} onClick={function() { set("travel_frequency", o.id); }} label={o.label} desc={o.desc} />;
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Dietary Restrictions or Preferences</label>
                <span className="field-hint">Select all that apply.</span>
                <div className="option-grid">
                  {DIETARY.map(function(d) {
                    return (
                      <OptionCard key={d} multi
                        selected={form.dietary_restrictions.indexOf(d) >= 0}
                        onClick={function() { toggleArr("dietary_restrictions", d); }}
                        label={d} />
                    );
                  })}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Food Preferences</label>
                <span className="field-hint">Any preferences for your meal plan? e.g. rotate protein sources, keep meals simple when traveling.</span>
                <textarea value={form.food_preferences} onChange={function(e) { set("food_preferences", e.target.value); }} placeholder="e.g. I like to rotate my protein sources. Keep meals simple when traveling." />
              </div>
              <div className="field-group">
                <label className="field-label">Foods to Avoid</label>
                <span className="field-hint">Anything you want kept out of your meal plan?</span>
                <textarea value={form.foods_to_avoid} onChange={function(e) { set("foods_to_avoid", e.target.value); }} placeholder="e.g. Sardines, organ meats, kefir" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="section-eyebrow">Step 5 of 6</div>
              <h2 className="section-heading">How you <em>recover.</em></h2>
              <p className="section-desc">Sleep is the primary driver of recovery and adaptation. Your sleep protocol is built around your actual habits.</p>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Average Sleep Hours <span className="field-required">*</span></label>
                  <input type="number" value={form.avg_sleep_hours} onChange={function(e) { set("avg_sleep_hours", e.target.value); }} placeholder="e.g. 6.5" min="3" max="12" step="0.5" />
                </div>
                <div className="field-group">
                  <label className="field-label">Sleep Issues</label>
                  <select value={form.sleep_issue} onChange={function(e) { set("sleep_issue", e.target.value); }}>
                    <option value="">Select...</option>
                    <option value="none">No issues, sleep well</option>
                    <option value="falling_asleep">Trouble falling asleep</option>
                    <option value="staying_asleep">Trouble staying asleep</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Typical Bedtime</label>
                  <input type="text" value={form.typical_bedtime} onChange={function(e) { set("typical_bedtime", e.target.value); }} placeholder="e.g. 10:30 PM" />
                </div>
                <div className="field-group">
                  <label className="field-label">Typical Wake Time</label>
                  <input type="text" value={form.typical_wake_time} onChange={function(e) { set("typical_wake_time", e.target.value); }} placeholder="e.g. 6:30 AM" />
                </div>
              </div>
              <div className="field-group" style={{ marginTop: 8 }}>
                <Toggle label="Caffeine after noon" sub="Coffee, pre-workout, tea, or energy drinks after 12pm" value={form.caffeine_after_noon} onChange={function(v) { set("caffeine_after_noon", v); }} />
                <Toggle label="Phone in bedroom" sub="Do you keep your phone in your bedroom while sleeping?" value={form.phone_in_bedroom} onChange={function(v) { set("phone_in_bedroom", v); }} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="section-eyebrow">Step 6 of 6</div>
              <h2 className="section-heading">Your <em>environment.</em></h2>
              <p className="section-desc">A quick audit of your current habits. We will prioritize the highest-impact changes first.</p>
              <Toggle label="I filter my drinking water" sub="Reverse osmosis, pitcher filter, or other filtration" value={form.filters_water} onChange={function(v) { set("filters_water", v); }} />
              <Toggle label="I get morning sunlight within an hour of waking" sub="Natural outdoor light, not through a window" value={form.morning_sunlight} onChange={function(v) { set("morning_sunlight", v); }} />
              <Toggle label="I cook with non-stick cookware" sub="Teflon or PFAS-coated pans" value={form.nonstick_cookware} onChange={function(v) { set("nonstick_cookware", v); }} />
              <Toggle label="I use conventional cleaning and laundry products" sub="Standard supermarket cleaners and detergents" value={form.conventional_cleaning} onChange={function(v) { set("conventional_cleaning", v); }} />
              <Toggle label="My phone charges in my bedroom overnight" sub="Phone within arms reach while sleeping" value={form.phone_in_bedroom_sleeping} onChange={function(v) { set("phone_in_bedroom_sleeping", v); }} />
              <div className="field-group" style={{ marginTop: 32 }}>
                <label className="field-label">What does success look like to you?</label>
                <span className="field-hint">In your own words, what would a great outcome feel like 3 months from now?</span>
                <textarea value={form.success_vision} onChange={function(e) { set("success_vision", e.target.value); }} placeholder="e.g. I want to actually look as strong as I am. I want to feel athletic again." style={{ minHeight: 100 }} />
              </div>
              {error && <div className="error-msg" style={{ marginTop: 24 }}>{error}</div>}
            </div>
          )}

          <div className="form-nav">
            {step > 0
              ? <button className="btn-back" onClick={function() { setStep(function(s) { return s - 1; }); }}>Back</button>
              : <span />
            }
            {step < totalSteps - 1
              ? <button className="btn-next" onClick={function() { setStep(function(s) { return s + 1; }); }}>Continue</button>
              : <button className="btn-next" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Build My Program"}</button>
            }
          </div>

        </div>
      </div>
    </div>
  );
}
