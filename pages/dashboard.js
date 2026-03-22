import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

var styles = [
  "@import url(https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap);",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ":root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}",
  "body{background:var(--off-white);font-family:'Barlow',sans-serif;font-weight:300;}",
  ".dash-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh;}",
  ".dash-sidebar{background:var(--charcoal);padding:28px 20px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}",
  ".dash-logo{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:28px;}",
  ".dash-member-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:white;margin-bottom:4px;}",
  ".dash-member-status{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:36px;}",
  ".dash-nav{flex:1;display:flex;flex-direction:column;gap:2px;}",
  ".dash-nav-item{display:flex;align-items:center;gap:10px;padding:11px 12px;cursor:pointer;border:none;background:transparent;text-align:left;width:100%;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);transition:all 0.15s;}",
  ".dash-nav-item:hover{color:white;background:rgba(255,255,255,0.06);}",
  ".dash-nav-item.active{color:white;background:var(--maroon);}",
  ".dash-signout{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.3);border:none;background:transparent;cursor:pointer;padding:8px 0;text-align:left;}",
  ".dash-signout:hover{color:rgba(255,255,255,0.6);}",
  ".dash-main{padding:40px;}",
  ".dash-page-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--charcoal);margin-bottom:6px;}",
  ".dash-page-title em{font-style:italic;color:var(--maroon);}",
  ".dash-page-sub{font-size:14px;font-weight:300;color:var(--mid);margin-bottom:36px;}",

  // Cards
  ".card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:28px;}",
  ".card{background:white;border:1px solid var(--border);padding:24px;}",
  ".card-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}",
  ".card-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--charcoal);margin-bottom:6px;}",
  ".card-body{font-size:13px;font-weight:300;color:var(--mid);line-height:1.6;margin-bottom:16px;}",
  ".card-btn{display:inline-block;background:var(--maroon);color:white;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:none;cursor:pointer;padding:9px 18px;transition:background 0.2s;}",
  ".card-btn:hover{background:var(--maroon-dark);}",
  ".card-btn.ghost{background:transparent;color:var(--maroon);border:1.5px solid var(--maroon);}",
  ".card-btn.ghost:hover{background:var(--maroon-light);}",

  // Program view
  ".program-header{background:var(--maroon);color:white;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}",
  ".program-header-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}",
  ".program-header-sub{font-size:12px;font-weight:300;color:rgba(255,255,255,0.6);margin-top:2px;}",
  ".week-tabs{display:flex;gap:2px;background:var(--border);padding:2px;margin-bottom:20px;}",
  ".week-tab{flex:1;padding:10px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border:none;background:transparent;cursor:pointer;color:var(--mid);transition:all 0.15s;}",
  ".week-tab.active{background:white;color:var(--maroon);}",
  ".day-block{background:white;border:1px solid var(--border);margin-bottom:12px;}",
  ".day-header{padding:16px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-bottom:1px solid var(--border);}",
  ".day-header-left{display:flex;align-items:center;gap:12px;}",
  ".day-label{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--charcoal);}",
  ".day-type{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;background:var(--maroon-light);color:var(--maroon);padding:3px 8px;}",
  ".day-toggle{font-size:18px;color:var(--mid);transition:transform 0.2s;}",
  ".day-toggle.open{transform:rotate(45deg);}",
  ".day-completed{width:20px;height:20px;border-radius:50%;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-size:10px;color:white;}",

  // Exercise rows
  ".exercises-table{width:100%;}",
  ".exercise-header-row{display:grid;grid-template-columns:1fr 70px 70px 70px 70px 80px 32px;gap:8px;padding:10px 20px;background:var(--off-white);border-bottom:1px solid var(--border);}",
  ".exercise-col-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--mid);}",
  ".exercise-row{display:grid;grid-template-columns:1fr 70px 70px 70px 70px 80px 32px;gap:8px;padding:12px 20px;border-bottom:1px solid var(--border);align-items:center;}",
  ".exercise-row:last-child{border-bottom:none;}",
  ".exercise-row.logged{background:rgba(123,26,56,0.03);}",
  ".exercise-name{font-size:14px;font-weight:400;color:var(--charcoal);}",
  ".exercise-target{font-size:12px;font-weight:300;color:var(--mid);margin-top:2px;}",
  ".log-input{width:100%;border:1px solid var(--border);padding:6px 8px;font-family:'Barlow',sans-serif;font-size:13px;font-weight:300;color:var(--charcoal);outline:none;background:white;text-align:center;}",
  ".log-input:focus{border-color:var(--maroon);}",
  ".log-input.filled{background:var(--maroon-light);border-color:rgba(123,26,56,0.3);}",
  ".log-btn{width:28px;height:28px;background:var(--maroon);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;transition:background 0.15s;}",
  ".log-btn:hover{background:var(--maroon-dark);}",
  ".log-btn.saved{background:#27AE60;}",
  ".notes-row{padding:8px 20px 12px;border-bottom:1px solid var(--border);}",
  ".notes-input{width:100%;border:1px solid var(--border);padding:7px 10px;font-family:'Barlow',sans-serif;font-size:12px;font-weight:300;color:var(--mid);outline:none;resize:none;min-height:36px;}",
  ".notes-input:focus{border-color:var(--maroon);}",
  ".progression-tip{padding:10px 20px;background:rgba(184,148,58,0.08);border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start;}",
  ".progression-tip-icon{font-size:14px;margin-top:1px;}",
  ".progression-tip-text{font-size:12px;font-weight:300;color:var(--mid);line-height:1.5;}",
  ".progression-tip-text strong{font-weight:600;color:var(--charcoal);}",

  // Chat
  ".chat-embed{background:white;border:1px solid var(--border);display:flex;flex-direction:column;height:580px;}",
  ".chat-embed-header{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;}",
  ".chat-mark{width:34px;height:34px;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:15px;font-weight:900;color:white;}",
  ".chat-embed-title{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--charcoal);}",
  ".chat-embed-sub{font-size:11px;font-weight:300;color:var(--mid);}",
  ".chat-messages{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:14px;}",
  ".chat-msg{display:flex;gap:8px;}",
  ".chat-msg.user{flex-direction:row-reverse;}",
  ".chat-avatar{width:26px;height:26px;min-width:26px;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:11px;font-weight:900;color:white;margin-top:2px;}",
  ".chat-avatar.user{background:var(--charcoal);}",
  ".chat-bubble{max-width:calc(100% - 40px);padding:11px 14px;font-size:13px;font-weight:300;line-height:1.7;color:var(--charcoal);background:var(--off-white);border:1px solid var(--border);}",
  ".chat-msg.user .chat-bubble{background:var(--maroon);color:white;border-color:var(--maroon);}",
  ".chat-suggestions-wrap{display:flex;flex-wrap:wrap;gap:6px;padding:0 18px 12px;}",
  ".chat-suggestion{font-size:11px;font-weight:300;color:var(--mid);background:var(--off-white);border:1px solid var(--border);padding:5px 10px;cursor:pointer;transition:all 0.15s;}",
  ".chat-suggestion:hover{border-color:var(--maroon);color:var(--charcoal);}",
  ".typing{display:flex;gap:4px;align-items:center;padding:11px 14px;}",
  ".typing-dot{width:6px;height:6px;background:var(--maroon);border-radius:50%;opacity:0.4;animation:tp 1.2s infinite;}",
  ".typing-dot:nth-child(2){animation-delay:0.2s;}",
  ".typing-dot:nth-child(3){animation-delay:0.4s;}",
  "@keyframes tp{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.3);}}",
  ".chat-input-row{padding:14px;border-top:1px solid var(--border);display:flex;gap:8px;}",
  ".chat-input{flex:1;border:1.5px solid var(--border);padding:9px 12px;font-family:'Barlow',sans-serif;font-size:13px;font-weight:300;outline:none;resize:none;height:40px;}",
  ".chat-input:focus{border-color:var(--maroon);}",
  ".chat-send{width:40px;height:40px;background:var(--maroon);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;}",
  ".chat-send:hover{background:var(--maroon-dark);}",
  ".chat-send:disabled{opacity:0.4;cursor:not-allowed;}",

  // Nutrition
  ".macro-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}",
  ".macro-item{background:white;border:1px solid var(--border);padding:18px;text-align:center;}",
  ".macro-num{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--maroon);}",
  ".macro-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--mid);margin-top:4px;}",
  ".meal-card{background:white;border:1px solid var(--border);padding:18px;margin-bottom:10px;}",
  ".meal-name{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--charcoal);margin-bottom:5px;}",
  ".meal-desc{font-size:13px;font-weight:300;color:var(--mid);margin-bottom:8px;line-height:1.5;}",
  ".meal-macros{display:flex;gap:14px;}",
  ".meal-macro{font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--mid);}",
  ".meal-macro strong{color:var(--charcoal);font-weight:700;}",

  ".loading-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Barlow Condensed',sans-serif;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);}",
  "@media(max-width:900px){.dash-layout{grid-template-columns:1fr;}.dash-sidebar{position:static;height:auto;}.dash-main{padding:24px;}.card-grid{grid-template-columns:1fr;}.macro-bar{grid-template-columns:repeat(2,1fr);}.exercise-header-row,.exercise-row{grid-template-columns:1fr 60px 60px 60px 60px 70px 28px;}}"
].join(" ");

var CHAT_SUGGESTIONS = [
  "My shoulder hurts — what replaces overhead press?",
  "I only have 30 min today, shorten my workout",
  "What should I eat before training?",
  "I slept badly — should I still train heavy?",
];

var NAV = [
  { id: "overview", icon: "◈", label: "Overview" },
  { id: "training", icon: "⚡", label: "Training" },
  { id: "nutrition", icon: "N", label: "Nutrition" },
  { id: "sleep", icon: "Z", label: "Sleep" },
  { id: "chat", icon: "R", label: "The Regimen" },
  { id: "profile", icon: "◎", label: "Profile" },
];

// Demo program structure for rendering
var DEMO_PROGRAM = {
  program_name: "Hypertrophy Block 1",
  program_type: "hypertrophy",
  block_number: 1,
  training_program: {
    split: "Upper / Lower",
    blocks: [{
      block: 1,
      weeks: "1-4",
      days: [
        {
          day: "Day 1",
          focus: "Upper Body A",
          type: "Hypertrophy",
          exercises: [
            { name: "Seated Overhead Press", sets: 3, reps: "10", rir_week1: "3-4", rest: "3m", note: "2 warm-up sets before working sets" },
            { name: "DB Incline Bench Row", sets: 4, reps: "12", rir_week1: "3-4", rest: "3m", note: "Squeeze at top for 2 count" },
            { name: "DB Chest Press", sets: 3, reps: "15", rir_week1: "3-4", rest: "2m", note: "Control throughout, MMC" },
            { name: "Close Grip Pulldown", sets: 3, reps: "20", rir_week1: "3-4", rest: "2m", note: "" },
            { name: "Barbell Shrug", sets: 3, reps: "15", rir_week1: "2-3", rest: "2m", note: "" },
            { name: "Skull Crushers", sets: 3, reps: "15", rir_week1: "2-3", rest: "2m", note: "" },
            { name: "Preacher Curls", sets: 3, reps: "20", rir_week1: "2-3", rest: "2m", note: "" },
          ]
        },
        {
          day: "Day 2",
          focus: "Lower Body A",
          type: "Hypertrophy",
          exercises: [
            { name: "Barbell Front Squat", sets: 3, reps: "12", rir_week1: "3-4", rest: "3m", note: "2 warm-up sets before working sets" },
            { name: "Barbell RDL", sets: 4, reps: "12", rir_week1: "3-4", rest: "3m", note: "Slight bend in knee, flat back" },
            { name: "Barbell Step Up", sets: 3, reps: "10 ea", rir_week1: "3-4", rest: "3m", note: "90 degree bend at knee minimum" },
            { name: "Barbell Hip Thrust", sets: 3, reps: "15", rir_week1: "3-4", rest: "3m", note: "Tuck chin, squeeze glutes, do not arch back" },
            { name: "DB Calf Raise", sets: 3, reps: "15", rir_week1: "3-4", rest: "2m", note: "" },
            { name: "Bodyweight Tibialis Raise", sets: 3, reps: "10", rir_week1: "2-3", rest: "2m", note: "Knee health — do not skip" },
          ]
        },
        {
          day: "Day 3",
          focus: "Aerobic Capacity",
          type: "Cardio",
          exercises: [
            { name: "Incline Treadmill Walk", sets: 1, reps: "30 min", rir_week1: "--", rest: "--", note: "Just barely able to hold a conversation. 3-4 MPH, 6-15 degrees incline" },
          ]
        },
        {
          day: "Day 4",
          focus: "Upper Body B",
          type: "Hypertrophy",
          exercises: [
            { name: "Barbell Bench Press", sets: 3, reps: "12", rir_week1: "3-4", rest: "3m", note: "2 warm-up sets before working sets" },
            { name: "Pull Ups", sets: 3, reps: "8-12", rir_week1: "3-4", rest: "3m", note: "Use assistance if needed" },
            { name: "DB Incline Chest Press", sets: 3, reps: "12", rir_week1: "3-4", rest: "3m", note: "" },
            { name: "Single-Arm Rows", sets: 3, reps: "12 ea", rir_week1: "3-4", rest: "3m", note: "" },
            { name: "Cable Face Pull", sets: 3, reps: "20", rir_week1: "2-3", rest: "2m", note: "" },
            { name: "Cable OH Tricep Extension", sets: 3, reps: "20", rir_week1: "2-3", rest: "2m", note: "" },
            { name: "DB Incline Bicep Curls", sets: 3, reps: "20", rir_week1: "2-3", rest: "2m", note: "" },
          ]
        },
        {
          day: "Day 5",
          focus: "Lower Body B",
          type: "Hypertrophy",
          exercises: [
            { name: "Bulgarian Split Squat", sets: 3, reps: "10 ea", rir_week1: "3-4", rest: "3m", note: "" },
            { name: "Deadlift", sets: 4, reps: "8", rir_week1: "3-4", rest: "3m", note: "" },
            { name: "Hip Thrust", sets: 3, reps: "15", rir_week1: "3-4", rest: "3m", note: "Tuck chin, squeeze glutes, do not arch back" },
            { name: "Nordic Curl", sets: 3, reps: "6-8", rir_week1: "3-4", rest: "3m", note: "" },
            { name: "Goblet Squat", sets: 3, reps: "15", rir_week1: "3-4", rest: "2m", note: "" },
            { name: "Banded Tibia Flexion", sets: 3, reps: "10", rir_week1: "2-3", rest: "2m", note: "Knee health — do not skip" },
          ]
        },
      ]
    }]
  }
};

function LogInput(props) {
  var placeholder = props.placeholder;
  var value = props.value;
  var onChange = props.onChange;
  var type = props.type;
  return (
    <input
      type={type || "number"}
      className={value ? "log-input filled" : "log-input"}
      placeholder={placeholder}
      value={value}
      onChange={function(e) { onChange(e.target.value); }}
      min="0"
    />
  );
}

export default function Dashboard() {
  var router = useRouter();
  var tabState = useState("overview");
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];

  var profileState = useState(null);
  var profile = profileState[0];
  var setProfile = profileState[1];

  var programState = useState(null);
  var program = programState[0];
  var setProgram = programState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var weekState = useState(1);
  var currentWeek = weekState[0];
  var setCurrentWeek = weekState[1];

  var openDayState = useState(0);
  var openDay = openDayState[0];
  var setOpenDay = openDayState[1];

  // Logs: { "Day1-ExerciseName-setIndex": { weight, reps, rir, notes, saved, suggestion } }
  var logsState = useState({});
  var logs = logsState[0];
  var setLogs = logsState[1];

  var chatMessagesState = useState([]);
  var chatMessages = chatMessagesState[0];
  var setChatMessages = chatMessagesState[1];

  var chatInputState = useState("");
  var chatInput = chatInputState[0];
  var setChatInput = chatInputState[1];

  var chatLoadingState = useState(false);
  var chatLoading = chatLoadingState[0];
  var setChatLoading = chatLoadingState[1];

  var regenState = useState("");
  var regenMessage = regenState[0];
  var setRegenMessage = regenState[1];

  var sleepChecksState = useState(function() {
    try {
      var today = new Date().toDateString();
      var saved = typeof window !== 'undefined' ? localStorage.getItem('sleep-checks') : null;
      if (!saved) return {};
      var parsed = JSON.parse(saved);
      // Reset if it's a new day
      if (parsed._date !== today) return {};
      return parsed;
    } catch(e) { return {}; }
  });
  var sleepChecks = sleepChecksState[0];
  var setSleepChecks = sleepChecksState[1];

  function toggleSleepCheck(key) {
    setSleepChecks(function(prev) {
      var today = new Date().toDateString();
      var next = Object.assign({}, prev);
      next[key] = !prev[key];
      next._date = today;
      try { localStorage.setItem('sleep-checks', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  }

  var chatEndRef = useRef(null);

  async function regenerateProgram() {
    if (!user) { setRegenMessage("Please log in to regenerate your program."); return; }
    setRegenMessage("Generating your program... this takes about 30 seconds.");
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setRegenMessage("Program generated! Refreshing...");
        setTimeout(function() { window.location.reload(); }, 1500);
      } else {
        var err = await res.json();
        setRegenMessage("Generation failed: " + (err.error || "unknown error") + ". Please try again.");
      }
    } catch (e) {
      setRegenMessage("Something went wrong. Please try again.");
    }
  }

  useEffect(function() {
    var authListener = supabase.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        var u = session.user;
        setUser(u);
        supabase.from("profiles").select("*").eq("id", u.id).single().then(function(profileResult) {
          var p = profileResult.data || {};
          // Fall back to auth metadata if profile has no name
          if (!p.first_name && !p.full_name) {
            var meta = u.user_metadata || {};
            p.first_name = meta.full_name ? meta.full_name.split(' ')[0] : (u.email ? u.email.split('@')[0] : 'Athlete');
          }
          setProfile(p);
        });
        supabase.from("generated_programs").select("*").eq("user_id", u.id).order("generated_at", { ascending: false }).limit(1).single().then(function(programResult) {
          setProgram(programResult.data || null);
          setLoading(false);
        });
      } else {
        setTimeout(async function() {
          var result = await supabase.auth.getSession();
          if (result.data && result.data.session) {
            var u = result.data.session.user;
            setUser(u);
            var profileResult = await supabase.from("profiles").select("*").eq("id", u.id).single();
            var p = profileResult.data || {};
            if (!p.first_name && !p.full_name) {
              var meta = u.user_metadata || {};
              p.first_name = meta.full_name ? meta.full_name.split(' ')[0] : (u.email ? u.email.split('@')[0] : 'Athlete');
            }
            setProfile(p);
            var programResult = await supabase.from("generated_programs").select("*").eq("user_id", u.id).order("generated_at", { ascending: false }).limit(1).single();
            setProgram(programResult.data || null);
            setLoading(false);
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

  useEffect(function() {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(function() {
    if (loading || program || !user) return;
    var userId = user.id;
    var interval = setInterval(function() {
      supabase.from("generated_programs").select("*").eq("user_id", userId).eq("status", "ready").order("generated_at", { ascending: false }).limit(1).single().then(function(result) {
        if (result.data) {
          setProgram(result.data);
        }
      });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [loading, program, user]);

  function getLogKey(dayLabel, exerciseName, setIndex) {
    return "w" + currentWeek + "--" + dayLabel + "--" + exerciseName + "--" + setIndex;
  }

  function updateLog(dayLabel, exerciseName, setIndex, field, value) {
    var key = getLogKey(dayLabel, exerciseName, setIndex);
    setLogs(function(prev) {
      var next = {};
      for (var k in prev) next[k] = prev[k];
      var existing = prev[key] || {};
      var updated = {};
      for (var f in existing) updated[f] = existing[f];
      updated[field] = value;
      next[key] = updated;
      return next;
    });
  }

  async function saveLog(dayLabel, exerciseName, setIndex, setNum) {
    var key = getLogKey(dayLabel, exerciseName, setIndex);
    var logData = logs[key] || {};

    // Mark as saving
    setLogs(function(prev) {
      var next = {};
      for (var k in prev) next[k] = prev[k];
      var existing = prev[key] || {};
      var updated = {};
      for (var f in existing) updated[f] = existing[f];
      updated.saving = true;
      next[key] = updated;
      return next;
    });

    try {
      var res = await fetch("/api/workout-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.id : null,
          exerciseName: exerciseName,
          setNumber: setNum,
          weightLbs: logData.weight || null,
          reps: logData.reps || null,
          rir: logData.rir || null,
          notes: logData.notes || null,
          programId: program ? program.id : null,
          blockNumber: program ? program.block_number : 1,
          weekNumber: currentWeek,
          dayLabel: dayLabel,
        })
      });
      var data = await res.json();

      setLogs(function(prev) {
        var next = {};
        for (var k in prev) next[k] = prev[k];
        var existing = prev[key] || {};
        var updated = {};
        for (var f in existing) updated[f] = existing[f];
        updated.saved = true;
        updated.saving = false;
        if (data.suggestion) updated.suggestion = data.suggestion;
        next[key] = updated;
        return next;
      });
    } catch (err) {
      setLogs(function(prev) {
        var next = {};
        for (var k in prev) next[k] = prev[k];
        var existing = prev[key] || {};
        var updated = {};
        for (var f in existing) updated[f] = existing[f];
        updated.saving = false;
        next[key] = updated;
        return next;
      });
    }
  }

  function isDayComplete(day) {
    if (!day.exercises) return false;
    var count = 0;
    day.exercises.forEach(function(ex, ei) {
      for (var s = 0; s < ex.sets; s++) {
        var key = getLogKey(day.day, ex.name, s);
        if (logs[key] && logs[key].saved) count++;
      }
    });
    var total = day.exercises.reduce(function(acc, ex) { return acc + ex.sets; }, 0);
    return total > 0 && count >= total;
  }

  function parseSuggestion(reply) {
    var marker = '@@SUGGESTION@@';
    var endMarker = '@@END@@';
    var start = reply.indexOf(marker);
    var end = reply.indexOf(endMarker);
    if (start === -1 || end === -1) return { text: reply, suggestion: null };
    var jsonStr = reply.substring(start + marker.length, end).trim();
    var text = reply.substring(0, start).trim();
    try {
      var suggestion = JSON.parse(jsonStr);
      return { text: text, suggestion: suggestion };
    } catch(e) {
      return { text: text, suggestion: null };
    }
  }

  async function saveSuggestion(suggestion) {
    if (!user) return;
    try {
      var res = await fetch('/api/save-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, suggestion: suggestion })
      });
      if (res.ok) {
        // Refresh program data
        var programResult = await supabase.from("generated_programs").select("*").eq("user_id", user.id).order("generated_at", { ascending: false }).limit(1).single();
        if (programResult.data) setProgram(programResult.data);
        return true;
      }
    } catch(e) { console.error('Save suggestion error:', e); }
    return false;
  }

  async function sendChat(text) {
    var msg = text || chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    var newMessages = chatMessages.concat([{ role: "user", content: msg }]);
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, memberId: user ? user.id : null })
      });
      var data = await res.json();
      var parsed = parseSuggestion(data.reply || "Something went wrong. Please try again.");
      setChatMessages(function(prev) {
        return prev.concat([{ role: "assistant", content: parsed.text, suggestion: parsed.suggestion }]);
      });
    } catch (err) {
      setChatMessages(function(prev) { return prev.concat([{ role: "assistant", content: "Something went wrong. Please try again." }]); });
    } finally {
      setChatLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div>
        <style>{styles}</style>
        <div className="loading-screen">Loading your Regimen...</div>
      </div>
    );
  }

  var firstName = (profile && (profile.first_name || profile.full_name))
    ? (profile.first_name || profile.full_name.split(' ')[0])
    : (user && user.user_metadata && user.user_metadata.full_name)
      ? user.user_metadata.full_name.split(' ')[0]
      : "Athlete";
  var trainingData = (program && program.training_program) ? program.training_program : DEMO_PROGRAM.training_program;
  var block = trainingData.blocks ? trainingData.blocks[0] : null;

  return (
    <div>
      <style>{styles}</style>
      <div className="dash-layout">

        {/* SIDEBAR */}
        <div className="dash-sidebar">
          <div className="dash-logo">Rallis Regimen</div>
          <div className="dash-member-name">{firstName}</div>
          <div className="dash-member-status">Active Member</div>
          <nav className="dash-nav">
            {NAV.map(function(n) {
              return (
                <button key={n.id} className={activeTab === n.id ? "dash-nav-item active" : "dash-nav-item"} onClick={function() { setActiveTab(n.id); }}>
                  <span style={{ minWidth: 16 }}>{n.icon}</span>
                  {n.label}
                </button>
              );
            })}
          </nav>
          <button className="dash-signout" onClick={signOut}>Sign out</button>
        </div>

        {/* MAIN */}
        <div className="dash-main">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div className="dash-page-title">Your <em>Regimen.</em></div>
              <div className="dash-page-sub">Welcome back, {firstName}.</div>
              <div className="card-grid">
                <div className="card">
                  <div className="card-label">Training</div>
                  <div className="card-title">{(program && program.program_name) ? program.program_name.replace(/_/g, ' ') : "Building Your Program..."}</div>
                  <div className="card-body">
                    {program && program.program_name
                      ? "Log your sets inline as you train. Your program will adjust next week based on your performance."
                      : "Your program is generating — this takes about 30 seconds. This page will refresh automatically."
                    }
                  </div>
                  <button className="card-btn" onClick={function() { setActiveTab("training"); }}>{program && program.program_name ? "Open Program" : "Check Status"}</button>
                </div>
                <div className="card">
                  <div className="card-label">Nutrition</div>
                  <div className="card-title">Meal Plan</div>
                  <div className="card-body">Your personalized nutrition plan built around your training schedule and body composition goal.</div>
                  <button className="card-btn" onClick={function() { setActiveTab("nutrition"); }}>View Nutrition</button>
                </div>
                <div className="card">
                  <div className="card-label">The Regimen</div>
                  <div className="card-title">Ask anything</div>
                  <div className="card-body">Swap exercises, adjust for sleep, get restaurant macro help, or ask about your program. Available 24/7.</div>
                  <button className="card-btn" onClick={function() { setActiveTab("chat"); }}>Open Chat</button>
                </div>
                <div className="card">
                  <div className="card-label">Actions</div>
                  <div className="card-title">Program Tools</div>
                  <div className="card-body">Regenerate your program if something looks wrong, or update your profile for next month.</div>
                  <button className="card-btn" onClick={regenerateProgram} style={{ marginBottom: 8 }}>Regenerate Program</button>
                  <button className="card-btn ghost" onClick={function() { setActiveTab("profile"); }}>Update Profile</button>
                </div>
              </div>
              {regenMessage && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--maroon-light)", border: "1px solid rgba(123,26,56,.2)", fontSize: 14, fontWeight: 300, color: "var(--charcoal)" }}>
                  {regenMessage}
                </div>
              )}
            </div>
          )}

          {/* TRAINING */}
          {activeTab === "training" && (
            <div>
              <div className="dash-page-title"><em>Training</em> Program</div>
              <div className="dash-page-sub">
                {(program && program.program_name) ? program.program_name.replace(/_/g, ' ') : "Your Program"}.
                {" "}Your program will adjust next week based on your performance.
              </div>

              {/* RIR explanation */}
              <div style={{ background: "var(--maroon-light)", border: "1px solid rgba(123,26,56,.15)", padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 300, color: "var(--mid)", lineHeight: 1.6 }}>
                <strong style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--charcoal)" }}>RIR — Reps In Reserve</strong><br />
                The number of reps you have left in the tank when you end a set. RIR 3 means you stop with 3 reps left. Week 1 starts conservative (RIR 3-4) and gets more intense each week. Week 4 is a deload — go light and recover.
              </div>

              {/* Week selector */}
              <div className="week-tabs">
                {[1, 2, 3, 4].map(function(w) {
                  return (
                    <button key={w} className={currentWeek === w ? "week-tab active" : "week-tab"} onClick={function() { setCurrentWeek(w); }}>
                      {w === 4 ? "Week 4 (Deload)" : "Week " + w}
                    </button>
                  );
                })}
              </div>

              {/* Week 4 deload completion prompt */}
              {currentWeek === 4 && (
                <div style={{ background: "var(--charcoal)", padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Deload Week</div>
                    <div style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>Once you finish your deload, generate your next program. Your logs and progress carry forward.</div>
                  </div>
                  <button
                    onClick={regenerateProgram}
                    style={{ background: "var(--maroon)", border: "none", color: "white", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Generate Next Program
                  </button>
                </div>
              )}

              {block && block.days && block.days.map(function(day, di) {
                var isOpen = openDay === di;
                var complete = isDayComplete(day);
                return (
                  <div className="day-block" key={day.day}>
                    <div className="day-header" onClick={function() { setOpenDay(isOpen ? -1 : di); }}>
                      <div className="day-header-left">
                        {complete && <div className="day-completed">✓</div>}
                        <div className="day-label">{day.day} — {day.focus}</div>
                        <div className="day-type">{day.type}</div>
                      </div>
                      <div className={isOpen ? "day-toggle open" : "day-toggle"}>+</div>
                    </div>

                    {isOpen && (
                      <div className="exercises-table">
                        <div className="exercise-header-row">
                          <div className="exercise-col-label">Exercise</div>
                          <div className="exercise-col-label" style={{ textAlign: "center" }}>Weight</div>
                          <div className="exercise-col-label" style={{ textAlign: "center" }}>Reps</div>
                          <div className="exercise-col-label" style={{ textAlign: "center" }}>RIR</div>
                          <div className="exercise-col-label" style={{ textAlign: "center" }}>Target</div>
                          <div className="exercise-col-label" style={{ textAlign: "center" }}>Notes</div>
                          <div className="exercise-col-label"></div>
                        </div>

                        {day.exercises && day.exercises.map(function(ex, ei) {
                          return (
                            <div key={ex.name + ei}>
                              {Array.from({ length: ex.sets }).map(function(_, si) {
                                var key = getLogKey(day.day, ex.name, si);
                                var logEntry = logs[key] || {};
                                return (
                                  <div key={si}>
                                    <div className={logEntry.saved ? "exercise-row logged" : "exercise-row"}>
                                      <div>
                                        {si === 0 && (
                                          <div>
                                            <div className="exercise-name">{ex.name}</div>
                                            {ex.note && <div className="exercise-target">{ex.note}</div>}
                                          </div>
                                        )}
                                        {si > 0 && (
                                          <div className="exercise-target" style={{ paddingLeft: 8, color: "var(--mid)", fontSize: 11 }}>Set {si + 1}</div>
                                        )}
                                      </div>
                                      <LogInput
                                        placeholder="lbs"
                                        value={logEntry.weight || ""}
                                        onChange={function(v) { updateLog(day.day, ex.name, si, "weight", v); }}
                                      />
                                      <LogInput
                                        placeholder={ex.reps}
                                        value={logEntry.reps || ""}
                                        onChange={function(v) { updateLog(day.day, ex.name, si, "reps", v); }}
                                      />
                                      <LogInput
                                        placeholder={ex.rir_week1}
                                        value={logEntry.rir || ""}
                                        onChange={function(v) { updateLog(day.day, ex.name, si, "rir", v); }}
                                      />
                                      <div style={{ textAlign: "center", fontSize: 11, color: "var(--mid)", fontFamily: "Barlow Condensed" }}>
                                        {ex.reps} @ {ex.rir_week1}
                                      </div>
                                      <div className="log-input" style={{ padding: "4px 6px" }}>
                                        <input
                                          type="text"
                                          placeholder="notes"
                                          value={logEntry.notes || ""}
                                          onChange={function(e) { updateLog(day.day, ex.name, si, "notes", e.target.value); }}
                                          style={{ width: "100%", border: "none", outline: "none", font: "inherit", fontSize: 11, background: "transparent", color: "var(--mid)" }}
                                        />
                                      </div>
                                      <button
                                        className={logEntry.saved ? "log-btn saved" : "log-btn"}
                                        onClick={function() { saveLog(day.day, ex.name, si, si + 1); }}
                                        disabled={logEntry.saving}
                                        title="Save set"
                                      >
                                        {logEntry.saving ? "..." : logEntry.saved ? "✓" : "→"}
                                      </button>
                                    </div>
                                    {logEntry.suggestion && (
                                      <div className="progression-tip">
                                        <div className="progression-tip-icon">📈</div>
                                        <div className="progression-tip-text">
                                          <strong>Next week: </strong>{logEntry.suggestion}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* NUTRITION */}
          {activeTab === "nutrition" && (
            <div>
              <div className="dash-page-title"><em>Nutrition</em> Plan</div>
              <div className="dash-page-sub">Built around your training schedule. High carb on training days, higher fat on rest days to match total calories.</div>
              {program && program.meal_plan ? (
                <div>
                  <div className="macro-bar">
                    {[
                      { num: program.meal_plan.daily_calories, label: "Calories" },
                      { num: (program.meal_plan.protein_g || "--") + "g", label: "Protein" },
                      { num: (program.meal_plan.carbs_g_training || "--") + "g", label: "Carbs (training)" },
                      { num: (program.meal_plan.carbs_g_rest || "--") + "g", label: "Carbs (rest)" },
                      { num: (program.meal_plan.fat_g_training || program.meal_plan.fat_g || "--") + "g", label: "Fat (training)" },
                      { num: (program.meal_plan.fat_g_rest || "--") + "g", label: "Fat (rest)" },
                    ].map(function(m) {
                      return (
                        <div className="macro-item" key={m.label}>
                          <div className="macro-num">{m.num}</div>
                          <div className="macro-label">{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  {program.meal_plan.approach && (
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div className="card-body">{program.meal_plan.approach}</div>
                    </div>
                  )}
                  {program.meal_plan.meal_plan && program.meal_plan.meal_plan.map(function(dayPlan, di) {
                    return (
                      <div key={di} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--charcoal)" }}>{dayPlan.day}</div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: dayPlan.type === "training" ? "var(--maroon)" : "var(--gold)", background: dayPlan.type === "training" ? "var(--maroon-light)" : "rgba(184,148,58,.1)", padding: "2px 8px" }}>{dayPlan.type === "training" ? "Training Day" : "Rest Day"}</div>
                          {dayPlan.day_total && <div style={{ fontSize: 12, fontWeight: 300, color: "var(--mid)", marginLeft: "auto" }}>{dayPlan.day_total} cal total</div>}
                        </div>
                        {["breakfast", "shake", "lunch", "dinner", "dessert"].map(function(meal) {
                          var mealData = dayPlan[meal];
                          if (!mealData || !mealData.description) return null;
                          return (
                            <div className="meal-card" key={meal} style={{ marginBottom: 6 }}>
                              <div className="meal-name">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                              <div className="meal-desc">{mealData.description}</div>
                              <div className="meal-macros">
                                <div className="meal-macro"><strong>{mealData.protein_g}g</strong> protein</div>
                                <div className="meal-macro"><strong>{mealData.carbs_g}g</strong> carbs</div>
                                <div className="meal-macro"><strong>{mealData.fat_g}g</strong> fat</div>
                                <div className="meal-macro"><strong>{mealData.calories}</strong> cal</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {!program.meal_plan.meal_plan && (
                    <div className="card">
                      <div className="card-body">Regenerate your program to get the full 7-day meal plan.</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card">
                  <div className="card-body">Your nutrition plan is being generated. Check back in a moment.</div>
                </div>
              )}
            </div>
          )}

          {/* SLEEP */}
          {activeTab === "sleep" && (
            <div>
              <div className="dash-page-title"><em>Sleep</em> Protocol</div>
              <div className="dash-page-sub">Check off each habit as you build it. Your protocol is built around your schedule and current habits.</div>
              {program && program.sleep_protocol ? (
                <div>
                  {[
                    { key: "morning", label: "Morning Routine" },
                    { key: "evening", label: "Evening Routine" },
                    { key: "sleep_environment", label: "Sleep Environment" },
                    { key: "priority_fixes", label: "Priority Fixes For You" },
                  ].map(function(section) {
                    var items = program.sleep_protocol[section.key];
                    if (!items || !items.length) return null;
                    return (
                      <div className="card" key={section.key} style={{ marginBottom: 12 }}>
                        <div className="card-label">{section.label}</div>
                        {items.map(function(item, i) {
                          var checkKey = "sleep-" + section.key + "-" + i;
                          var checked = sleepChecks[checkKey] || false;
                          return (
                            <div
                              key={i}
                              onClick={function() { toggleSleepCheck(checkKey); }}
                              style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                            >
                              <div style={{
                                width: 20, height: 20, minWidth: 20, marginTop: 2,
                                border: checked ? "none" : "1.5px solid var(--border)",
                                background: checked ? "var(--maroon)" : "white",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all .15s"
                              }}>
                                {checked && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 300, color: checked ? "var(--mid)" : "var(--charcoal)", lineHeight: 1.6, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.6 : 1, transition: "all .15s" }}>
                                {item}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card">
                  <div className="card-body">Your sleep protocol is being generated. Check back in a moment.</div>
                </div>
              )}
            </div>
          )}


          {/* CHAT */}
          {activeTab === "chat" && (
            <div>
              <div className="dash-page-title">The <em>Regimen</em></div>
              <div className="dash-page-sub">Ask anything about your training, nutrition, sleep, or recovery.</div>
              <div className="chat-embed">
                <div className="chat-embed-header">
                  <div className="chat-mark">R</div>
                  <div>
                    <div className="chat-embed-title">The Regimen</div>
                    <div className="chat-embed-sub">Your personal coaching layer</div>
                  </div>
                </div>
                <div className="chat-messages">
                  {chatMessages.length === 0 && !chatLoading && (
                    <div style={{ color: "var(--mid)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>
                      Ask about your program, swap exercises, get meal guidance, or troubleshoot your sleep. I know your goals, equipment, and current program.
                    </div>
                  )}
                  {chatMessages.map(function(m, i) {
                    return (
                      <div key={i} className={m.role === "user" ? "chat-msg user" : "chat-msg"}>
                        <div className={m.role === "user" ? "chat-avatar user" : "chat-avatar"}>
                          {m.role === "assistant" ? "R" : firstName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "calc(100% - 40px)" }}>
                          <div className="chat-bubble">{m.content}</div>
                          {m.suggestion && (
                            <button
                              onClick={async function() {
                                var btn = document.getElementById("save-btn-" + i);
                                if (btn) { btn.textContent = "Saving..."; btn.disabled = true; }
                                var ok = await saveSuggestion(m.suggestion);
                                if (btn) { btn.textContent = ok ? "Saved to program" : "Save failed"; }
                              }}
                              id={"save-btn-" + i}
                              style={{ alignSelf: "flex-start", background: "var(--maroon)", color: "white", border: "none", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", transition: "background .2s" }}
                            >
                              {m.suggestion.type === "meal" ? "Save meal to program" : "Save exercise swap"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="chat-msg">
                      <div className="chat-avatar">R</div>
                      <div className="chat-bubble">
                        <div className="typing">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>
                {chatMessages.length === 0 && (
                  <div className="chat-suggestions-wrap">
                    {CHAT_SUGGESTIONS.map(function(s, i) {
                      return (
                        <button key={i} className="chat-suggestion" onClick={function() { sendChat(s); }}>{s}</button>
                      );
                    })}
                  </div>
                )}
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    value={chatInput}
                    onChange={function(e) { setChatInput(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder="Ask The Regimen..."
                  />
                  <button className="chat-send" onClick={function() { sendChat(); }} disabled={!chatInput.trim() || chatLoading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div>
              <div className="dash-page-title">Your <em>Profile</em></div>
              <div className="dash-page-sub">Update your information to regenerate your program with fresh inputs.</div>
              <div className="card">
                <div className="card-label">Update Your Inputs</div>
                <div className="card-body" style={{ marginBottom: 16 }}>Change your goals, weight, schedule, equipment, or any other information. Saving will automatically generate a new program based on your updated profile.</div>
                <button className="card-btn" onClick={function() { router.push('/profile'); }}>Edit Profile</button>
              </div>
              <div className="card">
                <div className="card-label">Account</div>
                <div className="card-body" style={{ marginBottom: 16 }}>Questions or issues? Reach us at <a href="mailto:contact@rallisregimen.com" style={{ color: "var(--maroon)" }}>contact@rallisregimen.com</a></div>
                <button className="card-btn ghost" onClick={signOut}>Sign Out</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
