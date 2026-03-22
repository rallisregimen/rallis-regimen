import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

var CSS = "@import url(https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400&display=swap); *{box-sizing:border-box;margin:0;padding:0;} :root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);} body{background:var(--off-white);font-family:Barlow,sans-serif;min-height:100vh;} .wrap{max-width:720px;margin:0 auto;padding:60px 24px;} .back{font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mid);background:none;border:none;cursor:pointer;text-decoration:underline;margin-bottom:32px;display:block;} .title{font-family:Playfair Display,serif;font-size:36px;font-weight:900;color:var(--charcoal);margin-bottom:8px;} .title em{font-style:italic;color:var(--maroon);} .sub{font-size:14px;font-weight:300;color:var(--mid);margin-bottom:40px;line-height:1.6;} .section{margin-bottom:36px;} .section-label{font-family:Barlow Condensed,sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;} .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;} .fg{margin-bottom:0;} .fl{font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--charcoal);display:block;margin-bottom:6px;} input,select,textarea{width:100%;background:white;border:1.5px solid var(--border);padding:11px 14px;font-family:Barlow,sans-serif;font-size:14px;font-weight:300;color:var(--charcoal);outline:none;transition:border-color .2s;} input:focus,select:focus,textarea:focus{border-color:var(--maroon);} .tog-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);} .tog-row:first-child{border-top:1px solid var(--border);} .tog-label{font-size:14px;font-weight:300;color:var(--charcoal);} .tog-sub{font-size:12px;font-weight:300;color:var(--mid);} .tog{width:42px;height:22px;background:rgba(123,26,56,.15);border-radius:11px;cursor:pointer;position:relative;border:none;transition:background .2s;min-width:42px;} .tog.on{background:var(--maroon);} .tok{position:absolute;top:3px;left:3px;width:16px;height:16px;background:white;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);} .tog.on .tok{left:23px;} .save-btn{width:100%;background:var(--maroon);border:none;cursor:pointer;font-family:Barlow Condensed,sans-serif;font-size:15px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:white;padding:16px;transition:background .2s;margin-top:32px;} .save-btn:hover:not(:disabled){background:var(--maroon-dark);} .save-btn:disabled{opacity:.4;cursor:not-allowed;} .msg{margin-top:16px;padding:14px 16px;font-size:13px;font-weight:300;line-height:1.6;} .msg.success{background:var(--maroon-light);color:var(--charcoal);border:1px solid rgba(123,26,56,.2);} .msg.error{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5;} .loading{text-align:center;padding:80px 24px;font-family:Barlow Condensed,sans-serif;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--mid);} @media(max-width:600px){.grid{grid-template-columns:1fr;}}";

export default function ProfilePage() {
  var router = useRouter();
  var loadingState = useState(true); var loading = loadingState[0]; var setLoading = loadingState[1];
  var savingState = useState(false); var saving = savingState[0]; var setSaving = savingState[1];
  var msgState = useState(null); var msg = msgState[0]; var setMsg = msgState[1];
  var userState = useState(null); var user = userState[0]; var setUser = userState[1];
  var formState = useState({
    first_name: '', age: '', sex: '', current_weight_lbs: '', ideal_weight_lbs: '',
    goal_primary: '', goal_secondary: '', experience_level: '',
    training_days_per_week: '', session_length_mins: '', equipment: '',
    injuries_limitations: '', weight_management_goal: '', nutrition_approach: '',
    dietary_restrictions: '', foods_to_avoid: '', food_preferences: '',
    avg_sleep_hours: '', sleep_issue: '', typical_bedtime: '', typical_wake_time: '',
    caffeine_after_noon: false, phone_in_bedroom: false
  });
  var form = formState[0]; var setForm = formState[1];

  function set(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  useEffect(function() {
    async function load() {
      var sessionResult = await supabase.auth.getSession();
      var u = sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : null;
      if (!u) { router.push('/login'); return; }
      setUser(u);
      var intakeRes = await supabase.from('intake_submissions').select('*').eq('user_id', u.id).order('submitted_at', { ascending: false }).limit(1).single();
      if (intakeRes.data) {
        var d = intakeRes.data;
        setForm({
          first_name: d.first_name || '',
          age: d.age || '',
          sex: d.sex || '',
          current_weight_lbs: d.current_weight_lbs || '',
          ideal_weight_lbs: d.ideal_weight_lbs || '',
          goal_primary: d.goal_primary || '',
          goal_secondary: d.goal_secondary || '',
          experience_level: d.experience_level || '',
          training_days_per_week: d.training_days_per_week || '',
          session_length_mins: d.session_length_mins || '',
          equipment: d.equipment || '',
          injuries_limitations: d.injuries_limitations || '',
          weight_management_goal: d.weight_management_goal || '',
          nutrition_approach: d.nutrition_approach || '',
          dietary_restrictions: (d.dietary_restrictions && d.dietary_restrictions.join) ? d.dietary_restrictions.join(', ') : (d.dietary_restrictions || ''),
          foods_to_avoid: d.foods_to_avoid || '',
          food_preferences: d.food_preferences || '',
          avg_sleep_hours: d.avg_sleep_hours || '',
          sleep_issue: d.sleep_issue || '',
          typical_bedtime: d.typical_bedtime || '',
          typical_wake_time: d.typical_wake_time || '',
          caffeine_after_noon: d.caffeine_after_noon || false,
          phone_in_bedroom: d.phone_in_bedroom || false
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true); setMsg(null);
    try {
      var payload = {
        user_id: user.id,
        first_name: form.first_name || null,
        age: parseInt(form.age) || null,
        sex: form.sex || null,
        current_weight_lbs: parseFloat(form.current_weight_lbs) || null,
        ideal_weight_lbs: parseFloat(form.ideal_weight_lbs) || null,
        goal_primary: form.goal_primary || null,
        goal_secondary: form.goal_secondary || null,
        experience_level: form.experience_level || null,
        training_days_per_week: parseInt(form.training_days_per_week) || null,
        session_length_mins: parseInt(form.session_length_mins) || null,
        equipment: form.equipment || null,
        injuries_limitations: form.injuries_limitations || null,
        weight_management_goal: form.weight_management_goal || null,
        nutrition_approach: form.nutrition_approach || null,
        dietary_restrictions: form.dietary_restrictions ? form.dietary_restrictions.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : null,
        foods_to_avoid: form.foods_to_avoid || null,
        food_preferences: form.food_preferences || null,
        avg_sleep_hours: parseFloat(form.avg_sleep_hours) || null,
        sleep_issue: form.sleep_issue || null,
        typical_bedtime: form.typical_bedtime || null,
        typical_wake_time: form.typical_wake_time || null,
        caffeine_after_noon: form.caffeine_after_noon || false,
        phone_in_bedroom: form.phone_in_bedroom || false,
        submitted_at: new Date().toISOString()
      };

      var res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      var resData = await res.json();
      if (!res.ok || resData.error) throw new Error(resData.error || 'Save failed');

      // Trigger new program generation
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).catch(function(e) { console.error('Generate error:', e); });

      setMsg({ type: 'success', text: 'Profile saved. Your new program is generating — check your dashboard in about 30 seconds.' });
    } catch(e) {
      console.error('Profile save error:', e);
      setMsg({ type: 'error', text: 'Error: ' + (e.message || 'Something went wrong. Please try again.') });
    } finally {
      setSaving(false);
    }
  }

  function Tog(props) {
    return (
      <div className="tog-row">
        <div>
          <div className="tog-label">{props.label}</div>
          {props.sub && <div className="tog-sub">{props.sub}</div>}
        </div>
        <button className={props.value ? "tog on" : "tog"} onClick={function() { props.onChange(!props.value); }}>
          <div className="tok"></div>
        </button>
      </div>
    );
  }

  if (loading) return <div><style>{CSS}</style><div className="loading">Loading your profile...</div></div>;

  return (
    <div>
      <style>{CSS}</style>
      <div className="wrap">
        <button className="back" onClick={function() { router.push('/dashboard'); }}>Back to dashboard</button>
        <h1 className="title">Update your <em>profile.</em></h1>
        <p className="sub">Update your information and save. A new program will generate automatically based on your updated inputs.</p>

        <div className="section">
          <div className="section-label">About You</div>
          <div className="grid">
            <div className="fg"><label className="fl">First Name</label><input type="text" value={form.first_name} onChange={function(e){set('first_name',e.target.value);}} /></div>
            <div className="fg"><label className="fl">Age</label><input type="number" value={form.age} onChange={function(e){set('age',e.target.value);}} /></div>
            <div className="fg"><label className="fl">Sex</label><select value={form.sex} onChange={function(e){set('sex',e.target.value);}}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="prefer_not_to_say">Prefer not to say</option></select></div>
            <div className="fg"><label className="fl">Current Weight (lbs)</label><input type="number" value={form.current_weight_lbs} onChange={function(e){set('current_weight_lbs',e.target.value);}} /></div>
            <div className="fg"><label className="fl">Ideal Weight (lbs)</label><input type="number" value={form.ideal_weight_lbs} onChange={function(e){set('ideal_weight_lbs',e.target.value);}} /></div>
          </div>
        </div>

        <div className="section">
          <div className="section-label">Goals</div>
          <div className="grid">
            <div className="fg"><label className="fl">Primary Goal</label><select value={form.goal_primary} onChange={function(e){set('goal_primary',e.target.value);}}><option value="">Select...</option><option value="build_muscle">Build Muscle</option><option value="build_strength">Build Strength</option><option value="lose_fat">Lose Body Fat</option><option value="athletic_performance">Athletic Performance</option><option value="conditioning">Conditioning</option><option value="general_health">General Health</option></select></div>
            <div className="fg"><label className="fl">Secondary Goal</label><select value={form.goal_secondary} onChange={function(e){set('goal_secondary',e.target.value);}}><option value="">Select...</option><option value="build_muscle">Build Muscle</option><option value="build_strength">Build Strength</option><option value="lose_fat">Lose Body Fat</option><option value="athletic_performance">Athletic Performance</option><option value="conditioning">Conditioning</option><option value="general_health">General Health</option></select></div>
            <div className="fg"><label className="fl">Experience Level</label><select value={form.experience_level} onChange={function(e){set('experience_level',e.target.value);}}><option value="">Select...</option><option value="beginner">Beginner (0-2 years)</option><option value="intermediate">Intermediate (3-7 years)</option><option value="advanced">Advanced (8+ years)</option></select></div>
          </div>
        </div>

        <div className="section">
          <div className="section-label">Training</div>
          <div className="grid">
            <div className="fg"><label className="fl">Training Days / Week</label><select value={form.training_days_per_week} onChange={function(e){set('training_days_per_week',e.target.value);}}><option value="">Select...</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select></div>
            <div className="fg"><label className="fl">Session Length (min)</label><select value={form.session_length_mins} onChange={function(e){set('session_length_mins',e.target.value);}}><option value="">Select...</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="75">75 min</option><option value="90">90 min</option><option value="120">120 min</option></select></div>
            <div className="fg"><label className="fl">Equipment</label><select value={form.equipment} onChange={function(e){set('equipment',e.target.value);}}><option value="">Select...</option><option value="full_gym">Full Gym</option><option value="dumbbells_only">Dumbbells Only</option><option value="home_bands">Home and Bands</option><option value="bodyweight_only">Bodyweight Only</option></select></div>
            <div className="fg"><label className="fl">Injuries / Limitations</label><input type="text" value={form.injuries_limitations} onChange={function(e){set('injuries_limitations',e.target.value);}} placeholder="e.g. bad left knee" /></div>
          </div>
        </div>

        <div className="section">
          <div className="section-label">Nutrition</div>
          <div className="grid">
            <div className="fg"><label className="fl">Approach</label><select value={form.nutrition_approach} onChange={function(e){set('nutrition_approach',e.target.value);}}><option value="">Select...</option><option value="flexible">Flexible / No preference</option><option value="whole_foods">Whole foods focused</option><option value="high_protein">High protein priority</option><option value="low_carb">Lower carb</option></select></div>
            <div className="fg"><label className="fl">Dietary Restrictions</label><input type="text" value={form.dietary_restrictions} onChange={function(e){set('dietary_restrictions',e.target.value);}} placeholder="e.g. gluten free, no dairy" /></div>
            <div className="fg"><label className="fl">Foods to Avoid</label><input type="text" value={form.foods_to_avoid} onChange={function(e){set('foods_to_avoid',e.target.value);}} placeholder="e.g. shellfish, eggs" /></div>
            <div className="fg"><label className="fl">Food Preferences</label><input type="text" value={form.food_preferences} onChange={function(e){set('food_preferences',e.target.value);}} placeholder="e.g. Mediterranean, high variety" /></div>
          </div>
        </div>

        <div className="section">
          <div className="section-label">Sleep</div>
          <div className="grid" style={{ marginBottom: 16 }}>
            <div className="fg"><label className="fl">Avg Sleep Hours</label><input type="number" step="0.5" min="3" max="12" value={form.avg_sleep_hours} onChange={function(e){set('avg_sleep_hours',e.target.value);}} /></div>
            <div className="fg"><label className="fl">Sleep Issues</label><select value={form.sleep_issue} onChange={function(e){set('sleep_issue',e.target.value);}}><option value="">Select...</option><option value="none">No issues</option><option value="falling_asleep">Trouble falling asleep</option><option value="staying_asleep">Trouble staying asleep</option><option value="both">Both</option></select></div>
            <div className="fg"><label className="fl">Typical Bedtime</label><input type="text" value={form.typical_bedtime} onChange={function(e){set('typical_bedtime',e.target.value);}} placeholder="e.g. 10:30 PM" /></div>
            <div className="fg"><label className="fl">Typical Wake Time</label><input type="text" value={form.typical_wake_time} onChange={function(e){set('typical_wake_time',e.target.value);}} placeholder="e.g. 6:30 AM" /></div>
          </div>
          <Tog label="Caffeine after noon" sub="Coffee, pre-workout, tea after 12pm" value={form.caffeine_after_noon} onChange={function(v){set('caffeine_after_noon',v);}} />
          <Tog label="Phone in bedroom" sub="Do you sleep with your phone in the bedroom?" value={form.phone_in_bedroom} onChange={function(v){set('phone_in_bedroom',v);}} />
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving and generating...' : 'Save and Generate New Program'}
        </button>

        {msg && <div className={"msg " + msg.type}>{msg.text}</div>}
      </div>
    </div>
  );
}
