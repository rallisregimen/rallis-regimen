import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

var GOALS = [
  { id: 'build_muscle', label: 'Build Muscle', desc: 'Maximize hypertrophy and improve body composition' },
  { id: 'build_strength', label: 'Build Strength', desc: 'Increase maximum force output and get stronger' },
  { id: 'lose_fat', label: 'Lose Body Fat', desc: 'Reduce body fat while preserving muscle' },
  { id: 'athletic_performance', label: 'Athletic Performance', desc: 'Improve speed, power, and sport-specific fitness' },
  { id: 'conditioning', label: 'Conditioning', desc: 'Build aerobic and anaerobic capacity' },
  { id: 'general_health', label: 'General Health', desc: 'Improve overall health and quality of life' },
];

var EQUIPMENT_CARDS = [
  { id: 'full_gym', label: 'Full Gym', desc: 'Barbells, dumbbells, cables, machines' },
  { id: 'dumbbells_only', label: 'Dumbbells Only', desc: 'Dumbbells and a bench' },
  { id: 'home_bands', label: 'Home and Bands', desc: 'Bodyweight and resistance bands' },
  { id: 'bodyweight_only', label: 'Bodyweight Only', desc: 'No equipment needed' },
];

var SPECIFIC_EQ = ['Barbell','Trap Bar','Safety Squat Bar','Dumbbells','Kettlebells','Cable Machines','Weight Machines','Resistance Bands','Pull-Up Bar'];
var DIETARY = ['None','No red meat','No pork','Pescatarian','Vegetarian','Gluten free','Dairy free'];
var STEPS = ['About You','Goals','Training','Nutrition','Sleep'];

var S = [
  "@import url(https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400&display=swap);",
  '* { margin:0; padding:0; box-sizing:border-box; }',
  ':root { --m:#7B1A38; --md:#5C1229; --ml:#F2E8EC; --ow:#F7F4EF; --ch:#1A1A1A; --mi:#4A4A4A; --go:#B8943A; --bo:rgba(123,26,56,0.15); }',
  'body { background:var(--ow); font-family:Barlow,sans-serif; min-height:100vh; }',
  '.wrap { display:grid; grid-template-columns:280px 1fr; min-height:100vh; }',
  '.side { background:var(--m); padding:40px 28px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }',
  '.logo { font-family:Barlow Condensed,sans-serif; font-weight:700; font-size:14px; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.9); margin-bottom:36px; }',
  '.stitle { font-family:Playfair Display,serif; font-size:20px; font-weight:700; color:white; line-height:1.3; margin-bottom:6px; }',
  '.ssub { font-size:12px; font-weight:300; color:rgba(255,255,255,.5); line-height:1.6; margin-bottom:36px; }',
  '.snav { flex:1; }',
  '.sni { display:flex; gap:12px; align-items:center; padding:11px 0; border-bottom:1px solid rgba(255,255,255,.08); }',
  '.sni:first-child { border-top:1px solid rgba(255,255,255,.08); }',
  '.sdot { width:20px; height:20px; border-radius:50%; border:1.5px solid rgba(255,255,255,.3); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:rgba(255,255,255,.4); min-width:20px; }',
  '.sdot.ac { background:white; border-color:white; color:var(--m); }',
  '.sdot.dn { background:rgba(255,255,255,.2); color:white; }',
  '.slb { font-family:Barlow Condensed,sans-serif; font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.5); }',
  '.slb.ac { color:white; }',
  '.pb { height:3px; background:rgba(255,255,255,.15); border-radius:2px; margin-top:32px; overflow:hidden; }',
  '.pf { height:100%; background:white; border-radius:2px; transition:width .4s; }',
  '.plb { font-size:10px; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:.1em; margin-top:8px; font-family:Barlow Condensed,sans-serif; }',
  '.main { padding:52px 60px; max-width:700px; }',
  '.ey { font-family:Barlow Condensed,sans-serif; font-size:10px; font-weight:600; letter-spacing:.25em; text-transform:uppercase; color:var(--go); margin-bottom:10px; }',
  '.hd { font-family:Playfair Display,serif; font-size:30px; font-weight:900; color:var(--ch); line-height:1.1; margin-bottom:8px; }',
  '.hd em { font-style:italic; color:var(--m); }',
  '.dc { font-size:14px; font-weight:300; color:var(--mi); line-height:1.7; margin-bottom:36px; }',
  '.fg { margin-bottom:26px; }',
  '.fl { font-family:Barlow Condensed,sans-serif; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--ch); display:block; margin-bottom:7px; }',
  '.fh { font-size:12px; font-weight:300; color:var(--mi); margin-bottom:9px; display:block; line-height:1.5; }',
  '.fr { color:var(--m); margin-left:2px; }',
  "input[type=text],input[type=number],select,textarea { width:100%; background:white; border:1px solid var(--bo); padding:12px 14px; font-family:Barlow,sans-serif; font-size:14px; font-weight:300; color:var(--ch); outline:none; transition:border-color .2s; appearance:none; }",
  'input:focus,select:focus,textarea:focus { border-color:var(--m); }',
  'textarea { resize:vertical; min-height:80px; }',
  '.r2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }',
  '.r3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }',
  '.og { display:grid; grid-template-columns:1fr 1fr; gap:8px; }',
  '.oc { background:white; border:1.5px solid var(--bo); padding:14px 16px; cursor:pointer; transition:all .15s; display:flex; gap:10px; align-items:flex-start; }',
  '.oc:hover,.oc.sel { border-color:var(--m); background:var(--ml); }',
  '.oc.sel .och { background:var(--m); border-color:var(--m); }',
  '.och { width:16px; height:16px; min-width:16px; border:1.5px solid rgba(123,26,56,.3); margin-top:2px; display:flex; align-items:center; justify-content:center; }',
  '.och.rnd { border-radius:50%; }',
  '.och svg { opacity:0; }',
  '.oc.sel .och svg { opacity:1; }',
  '.olb { font-family:Barlow Condensed,sans-serif; font-size:13px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--ch); margin-bottom:2px; }',
  '.ods { font-size:11px; font-weight:300; color:var(--mi); line-height:1.5; }',
  '.pb2 { margin-bottom:26px; }',
  '.plb2 { font-family:Barlow Condensed,sans-serif; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--ch); display:block; margin-bottom:8px; }',
  '.bg { display:inline-block; color:white; font-family:Barlow Condensed,sans-serif; font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; padding:2px 7px; margin-left:6px; vertical-align:middle; }',
  '.bg1 { background:var(--m); }',
  '.bg2 { background:var(--go); }',
  '.tr { display:flex; justify-content:space-between; align-items:center; padding:13px 0; border-bottom:1px solid var(--bo); }',
  '.tr:first-child { border-top:1px solid var(--bo); }',
  '.tt { font-family:Barlow Condensed,sans-serif; font-size:13px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--ch); }',
  '.ts { font-size:12px; font-weight:300; color:var(--mi); line-height:1.5; }',
  '.tsw { width:42px; height:22px; background:rgba(123,26,56,.15); border-radius:11px; cursor:pointer; position:relative; transition:background .2s; min-width:42px; margin-left:14px; border:none; }',
  '.tsw.on { background:var(--m); }',
  '.tk { position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }',
  '.tsw.on .tk { left:23px; }',
  '.fnav { display:flex; justify-content:space-between; align-items:center; margin-top:44px; padding-top:26px; border-top:1px solid var(--bo); }',
  '.bb { background:transparent; border:none; cursor:pointer; font-family:Barlow Condensed,sans-serif; font-size:13px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--mi); padding:11px 0; border-bottom:1px solid var(--mi); }',
  '.bn { background:var(--m); border:none; cursor:pointer; font-family:Barlow Condensed,sans-serif; font-size:14px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:white; padding:14px 40px; transition:background .2s; }',
  '.bn:hover { background:var(--md); }',
  '.bn:disabled { opacity:.4; cursor:not-allowed; }',
  '.em { color:#C0392B; font-size:12px; margin-top:8px; }',
  '.sc { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; padding:48px; }',
  '.si { width:64px; height:64px; background:var(--m); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:28px; font-size:28px; }',
  '.sh { font-family:Playfair Display,serif; font-size:36px; font-weight:900; color:var(--ch); margin-bottom:12px; }',
  '.sh em { font-style:italic; color:var(--m); }',
  '.sx { font-size:14px; font-weight:300; color:var(--mi); line-height:1.7; max-width:440px; }',
  '.loading { display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:Barlow Condensed,sans-serif; font-size:14px; letter-spacing:.1em; text-transform:uppercase; color:var(--mi); }',
  '@media(max-width:880px){.wrap{grid-template-columns:1fr;}.side{position:static;height:auto;}.snav{display:none;}.main{padding:32px 20px;}.og{grid-template-columns:1fr;}.r3{grid-template-columns:1fr 1fr;}.r2{grid-template-columns:1fr;}}'
].join(' ');

function Chk() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OC(props) {
  return (
    <div className={props.selected ? 'oc sel' : 'oc'} onClick={props.onClick}>
      <div className={props.multi ? 'och' : 'och rnd'}><Chk /></div>
      <div>
        <div className="olb">{props.label}</div>
        {props.desc && <div className="ods">{props.desc}</div>}
      </div>
    </div>
  );
}

function Tog(props) {
  return (
    <div className="tr">
      <div>
        <div className="tt">{props.label}</div>
        {props.sub && <div className="ts">{props.sub}</div>}
      </div>
      <button className={props.value ? 'tsw on' : 'tsw'} onClick={function() { props.onChange(!props.value); }}>
        <div className="tk" />
      </button>
    </div>
  );
}

export default function IntakeForm() {
  var router = useRouter();
  var stepState = useState(0); var step = stepState[0]; var setStep = stepState[1];
  var doneState = useState(false); var done = doneState[0]; var setDone = doneState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];
  var errState = useState(null); var err = errState[0]; var setErr = errState[1];
  var userState = useState(null); var user = userState[0]; var setUser = userState[1];
  var checkingState = useState(true); var checking = checkingState[0]; var setChecking = checkingState[1];

  var formState = useState({
    first_name:'', age:'', sex:'', height_ft:'', height_in:'', current_weight_lbs:'', ideal_weight_lbs:'',
    goal_primary:'', goal_secondary:'',
    experience_level:'', training_days_per_week:'', session_length_mins:'',
    weight_management_goal:'', nutrition_approach:'',
    dietary_restrictions:[], food_preferences:'', foods_to_avoid:'',
    avg_sleep_hours:'', sleep_issue:'', typical_bedtime:'', typical_wake_time:'',
    caffeine_after_noon:false, phone_in_bedroom:false, success_vision:''
  });
  var form = formState[0]; var setForm = formState[1];

  useEffect(function() {
    var authListener = supabase.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        setUser(session.user);
        if (session.user.user_metadata && session.user.user_metadata.full_name) {
          setForm(function(f) { return Object.assign({}, f, { first_name: session.user.user_metadata.full_name.split(' ')[0] }); });
        }
        setChecking(false);
      } else {
        // Give it a moment then check again
        setTimeout(async function() {
          var result = await supabase.auth.getSession();
          if (result.data && result.data.session && result.data.session.user) {
            setUser(result.data.session.user);
            setChecking(false);
          } else {
            router.push('/login');
          }
        }, 500);
      }
    });
    return function() {
      if (authListener && authListener.data && authListener.data.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  function set(k, v) {
    setForm(function(f) { return Object.assign({}, f, { [k]: v }); });
  }
  function tog(k, v) {
    setForm(function(f) {
      var arr = f[k] || [];
      return Object.assign({}, f, { [k]: arr.indexOf(v) >= 0 ? arr.filter(function(x) { return x !== v; }) : arr.concat([v]) });
    });
  }

  var total = STEPS.length;
  var pct = Math.round(((step + 1) / total) * 100);

  async function submit() {
    setLoading(true); setErr(null);
    try {
      var sessionResult = await supabase.auth.getSession();
      var currentUser = sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : user;

      var p = Object.assign({}, form, {
        user_id: currentUser ? currentUser.id : null,
        email: currentUser ? currentUser.email : null,
        age: parseInt(form.age) || null,
        height_ft: parseInt(form.height_ft) || null,
        height_in: parseInt(form.height_in) || null,
        current_weight_lbs: parseFloat(form.current_weight_lbs) || null,
        ideal_weight_lbs: parseFloat(form.ideal_weight_lbs) || null,
        training_days_per_week: parseInt(form.training_days_per_week) || null,
        session_length_mins: parseInt(form.session_length_mins) || null,
        avg_sleep_hours: parseFloat(form.avg_sleep_hours) || null,
      });

      var res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });

      if (!res.ok) throw new Error('failed');
      setDone(true);

      // Trigger generation and go to dashboard — generation runs in background
      if (currentUser && currentUser.id) {
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        }).catch(function(e) { console.error('Generate error:', e); });
      }

      // Go to dashboard after short delay — program will be generating in background
      setTimeout(function() { router.push('/dashboard'); }, 1500);
    } catch(e) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div>
        <style>{S}</style>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <style>{S}</style>
        <div className="wrap">
          <div className="side">
            <div className="logo">Rallis Regimen</div>
            <div className="stitle">Your program is being built.</div>
            <div className="ssub">Redirecting to your dashboard...</div>
          </div>
          <div className="main">
            <div className="sc">
              <div className="si">V</div>
              <div className="sh">You are all set, <em>{form.first_name || 'athlete'}.</em></div>
              <p className="sx">Your personalized Rallis Regimen program is being generated. Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{S}</style>
      <div className="wrap">
        <div className="side">
          <div className="logo">Rallis Regimen</div>
          <div className="stitle">Build Your Regimen</div>
          <div className="ssub">Answer honestly. The more accurate your answers, the better your program.</div>
          <div className="snav">
            {STEPS.map(function(s, i) {
              return (
                <div key={i} className="sni">
                  <div className={i === step ? 'sdot ac' : i < step ? 'sdot dn' : 'sdot'}>{i < step ? 'V' : '0' + (i+1)}</div>
                  <div className={i === step ? 'slb ac' : 'slb'}>{s}</div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="pb"><div className="pf" style={{ width: pct + '%' }} /></div>
            <div className="plb">{pct}% complete</div>
          </div>
        </div>

        <div className="main">
          {step === 0 && (
            <div>
              <div className="ey">Step 1 of 6</div>
              <h2 className="hd">Tell us about <em>you.</em></h2>
              <p className="dc">Basic information to calculate your calorie targets, macro needs, and program structure.</p>
              <div className="fg"><label className="fl">First Name <span className="fr">*</span></label><input type="text" value={form.first_name} onChange={function(e){set('first_name',e.target.value);}} placeholder="Your first name" /></div>
              <div className="r2">
                <div className="fg"><label className="fl">Age <span className="fr">*</span></label><input type="number" value={form.age} onChange={function(e){set('age',e.target.value);}} placeholder="e.g. 34" min="16" max="90" /></div>
                <div className="fg"><label className="fl">Sex <span className="fr">*</span></label><select value={form.sex} onChange={function(e){set('sex',e.target.value);}}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="other">Prefer not to say</option></select></div>
              </div>
              <div className="r2">
                <div className="fg"><label className="fl">Current Weight (lbs) <span className="fr">*</span></label><input type="number" value={form.current_weight_lbs} onChange={function(e){set('current_weight_lbs',e.target.value);}} placeholder="e.g. 185" /></div>
                <div className="fg"><label className="fl">Ideal Weight (lbs) <span className="fr">*</span></label><span className="fh">Where you feel and perform your best.</span><input type="number" value={form.ideal_weight_lbs} onChange={function(e){set('ideal_weight_lbs',e.target.value);}} placeholder="e.g. 175" /></div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="ey">Step 2 of 6</div>
              <h2 className="hd">What are you here <em>for?</em></h2>
              <p className="dc">Pick one primary goal and one secondary. Your program is built around your number one priority.</p>
              <div className="pb2">
                <span className="plb2">Primary Goal <span className="bg bg1">#1 Priority</span></span>
                <div className="og">{GOALS.map(function(g){return <OC key={g.id} selected={form.goal_primary===g.id} onClick={function(){set('goal_primary',g.id);if(form.goal_secondary===g.id)set('goal_secondary','');}} label={g.label} desc={g.desc} />;})}</div>
              </div>
              <div className="pb2">
                <span className="plb2">Secondary Goal <span className="bg bg2">#2 Priority</span></span>
                <span className="fh">Must be different from your primary goal.</span>
                <div className="og">{GOALS.filter(function(g){return g.id!==form.goal_primary;}).map(function(g){return <OC key={g.id} selected={form.goal_secondary===g.id} onClick={function(){set('goal_secondary',g.id);}} label={g.label} desc={g.desc} />;})}</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="ey">Step 3 of 6</div>
              <h2 className="hd">Your training <em>situation.</em></h2>
              <p className="dc">This determines your program structure, split, and exercise selection.</p>
              <div className="fg"><label className="fl">Experience Level <span className="fr">*</span></label><div className="r3"><OC selected={form.experience_level==='beginner'} onClick={function(){set('experience_level','beginner');}} label="Beginner" desc="0-2 years" /><OC selected={form.experience_level==='intermediate'} onClick={function(){set('experience_level','intermediate');}} label="Intermediate" desc="3-7 years" /><OC selected={form.experience_level==='advanced'} onClick={function(){set('experience_level','advanced');}} label="Advanced" desc="8+ years" /></div></div>
              <div className="r2">
                <div className="fg"><label className="fl">Training Days/Week <span className="fr">*</span></label><select value={form.training_days_per_week} onChange={function(e){set('training_days_per_week',e.target.value);}}><option value="">Select...</option>{['2','3','4','5','6'].map(function(n){return <option key={n} value={n}>{n} days</option>;})}</select></div>
                <div className="fg"><label className="fl">Session Length <span className="fr">*</span></label><select value={form.session_length_mins} onChange={function(e){set('session_length_mins',e.target.value);}}><option value="">Select...</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option><option value="120">90+ min</option></select></div>
              </div>
              <div className="fg"><label className="fl">Primary Equipment <span className="fr">*</span></label><div className="og">{EQUIPMENT_CARDS.map(function(o){return <OC key={o.id} selected={form.equipment===o.id} onClick={function(){set('equipment',o.id);}} label={o.label} desc={o.desc} />;})}</div></div>
              <div className="fg"><label className="fl">Specific Equipment</label><span className="fh">Select everything you have access to.</span><div className="og">{SPECIFIC_EQ.map(function(item){return <OC key={item} multi selected={(form.equipment_detail||[]).indexOf(item)>=0} onClick={function(){tog('equipment_detail',item);}} label={item} />;})}</div></div>
              <div className="fg"><label className="fl">Injuries or Limitations</label><span className="fh">Any injuries or movements to avoid? Leave blank if none.</span><textarea value={form.injuries_limitations} onChange={function(e){set('injuries_limitations',e.target.value);}} placeholder="e.g. Lower back issues, avoid heavy overhead pressing." /></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="ey">Step 4 of 6</div>
              <h2 className="hd">How you <em>fuel.</em></h2>
              <p className="dc">Your nutrition plan is built around your training schedule, goals, and food preferences.</p>
              <div className="fg"><label className="fl">Weight Management Goal <span className="fr">*</span></label><div className="r3"><OC selected={form.weight_management_goal==='bulk'} onClick={function(){set('weight_management_goal','bulk');}} label="Gain Weight" desc="Calorie surplus" /><OC selected={form.weight_management_goal==='maintain'} onClick={function(){set('weight_management_goal','maintain');}} label="Maintain" desc="Calorie maintenance" /><OC selected={form.weight_management_goal==='cut'} onClick={function(){set('weight_management_goal','cut');}} label="Lose Weight" desc="Calorie deficit" /></div></div>
              <div className="fg"><label className="fl">Dietary Restrictions</label><span className="fh">Select all that apply.</span><div className="og">{DIETARY.map(function(d){return <OC key={d} multi selected={form.dietary_restrictions.indexOf(d)>=0} onClick={function(){tog('dietary_restrictions',d);}} label={d} />;})}</div></div>
              <div className="fg"><label className="fl">Food Preferences</label><span className="fh">e.g. rotate protein sources, keep meals simple when traveling.</span><textarea value={form.food_preferences} onChange={function(e){set('food_preferences',e.target.value);}} placeholder="e.g. I like to rotate my protein sources." /></div>
              <div className="fg"><label className="fl">Foods to Avoid</label><textarea value={form.foods_to_avoid} onChange={function(e){set('foods_to_avoid',e.target.value);}} placeholder="e.g. Sardines, organ meats, kefir" /></div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="ey">Step 5 of 5</div>
              <h2 className="hd">How you <em>recover.</em></h2>
              <p className="dc">Sleep is the primary driver of recovery and adaptation. Your protocol will be built around your actual schedule.</p>
              <div className="r2">
                <div className="fg"><label className="fl">Average Sleep Hours <span className="fr">*</span></label><input type="number" value={form.avg_sleep_hours} onChange={function(e){set('avg_sleep_hours',e.target.value);}} placeholder="e.g. 6.5" min="3" max="12" step="0.5" /></div>
                <div className="fg"><label className="fl">Sleep Issues</label><select value={form.sleep_issue} onChange={function(e){set('sleep_issue',e.target.value);}}><option value="">Select...</option><option value="none">No issues</option><option value="falling_asleep">Trouble falling asleep</option><option value="staying_asleep">Trouble staying asleep</option><option value="both">Both</option></select></div>
              </div>
              <div className="r2">
                <div className="fg"><label className="fl">Typical Bedtime</label><input type="text" value={form.typical_bedtime} onChange={function(e){set('typical_bedtime',e.target.value);}} placeholder="e.g. 10:30 PM" /></div>
                <div className="fg"><label className="fl">Typical Wake Time</label><input type="text" value={form.typical_wake_time} onChange={function(e){set('typical_wake_time',e.target.value);}} placeholder="e.g. 6:30 AM" /></div>
              </div>
              <div style={{marginTop:'8px'}}>
                <Tog label="Caffeine after noon" sub="Coffee, pre-workout, tea, or energy drinks after 12pm" value={form.caffeine_after_noon} onChange={function(v){set('caffeine_after_noon',v);}} />
                <Tog label="Phone in bedroom" sub="Do you keep your phone in your bedroom while sleeping?" value={form.phone_in_bedroom} onChange={function(v){set('phone_in_bedroom',v);}} />
              </div>
              <div className="fg" style={{marginTop:'28px'}}>
                <label className="fl">What does success look like to you?</label>
                <span className="fh">In your own words, what would a great outcome feel like 3 months from now?</span>
                <textarea value={form.success_vision} onChange={function(e){set('success_vision',e.target.value);}} placeholder="e.g. I want to actually look as strong as I am." style={{minHeight:'100px'}} />
              </div>
              {err && <div className="em">{err}</div>}
            </div>
          )}

          <div className="fnav">
            {step > 0 ? <button className="bb" onClick={function(){setStep(function(s){return s-1;});}}>Back</button> : <span />}
            {step < total - 1
              ? <button className="bn" onClick={function(){setStep(function(s){return s+1;});}}>Continue</button>
              : <button className="bn" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Build My Program'}</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
