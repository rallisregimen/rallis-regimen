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
  "@keyframes fadeIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}",
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
  { id: "progress", icon: "↑", label: "Progress" },
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

  // Logs: { "w1--Day1-ExerciseName-setIndex": { weight, reps, rir, notes, saved, suggestion } }
  var logsState = useState(function() {
    try {
      var saved = typeof window !== 'undefined' ? localStorage.getItem('workout-logs') : null;
      return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });
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

  var weightLogsState = useState([]);
  var weightLogs = weightLogsState[0];
  var setWeightLogs = weightLogsState[1];

  var weightInputState = useState("");
  var weightInput = weightInputState[0];
  var setWeightInput = weightInputState[1];

  // Video modal state
  var videoModalState = useState(null); // { exerciseName, youtubeId }
  var videoModal = videoModalState[0];
  var setVideoModal = videoModalState[1];

  // Strength tracking state
  var strengthStatsState = useState([]);
  var strengthStats = strengthStatsState[0];
  var setStrengthStats = strengthStatsState[1];

  var selectedExerciseState = useState(0);
  var selectedExercise = selectedExerciseState[0];
  var setSelectedExercise = selectedExerciseState[1];

  var strengthLoadingState = useState(false);
  var strengthLoading = strengthLoadingState[0];
  var setStrengthLoading = strengthLoadingState[1];

  var prCelebrationState = useState(null);
  var prCelebration = prCelebrationState[0];
  var setPrCelebration = prCelebrationState[1];

  // Exercise video library cache
  var videoLibraryState = useState({});
  var videoLibrary = videoLibraryState[0];
  var setVideoLibrary = videoLibraryState[1];

  var weightNoteState = useState("");
  var weightNote = weightNoteState[0];
  var setWeightNote = weightNoteState[1];

  var weightSavingState = useState(false);
  var weightSaving = weightSavingState[0];
  var setWeightSaving = weightSavingState[1];

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

  async function loadWeightLogs() {
    if (!user) return;
    try {
      var res = await fetch('/api/weight-log?userId=' + user.id);
      var data = await res.json();
      if (data.logs) setWeightLogs(data.logs);
    } catch(e) { console.error('Weight load error:', e); }
  }

  async function loadWorkoutLogs(userId) {
    try {
      var res = await fetch('/api/workout-log?userId=' + userId);
      if (!res.ok) return;
      var data = await res.json();
      if (data.logs && data.logs.length > 0) {
        // Convert DB logs to the local key format and merge with localStorage
        var dbLogs = {};
        data.logs.forEach(function(log) {
          var key = 'w' + log.week_number + '--' + log.day_label + '--' + log.exercise_name + '--' + (log.set_number - 1);
          dbLogs[key] = {
            weight: log.weight_lbs ? String(log.weight_lbs) : '',
            reps: log.reps ? String(log.reps) : '',
            rir: log.rir ? String(log.rir) : '',
            notes: log.notes || '',
            saved: true
          };
        });
        setLogs(function(prev) {
          var merged = Object.assign({}, dbLogs, prev);
          try { localStorage.setItem('workout-logs', JSON.stringify(merged)); } catch(e) {}
          return merged;
        });
      }
    } catch(e) { console.error('Workout log load error:', e); }
  }

  async function loadStrengthStats(userId) {
    setStrengthLoading(true);
    try {
      var res = await fetch('/api/strength-stats?userId=' + userId);
      if (!res.ok) return;
      var data = await res.json();
      if (data.exercises) {
        setStrengthStats(data.exercises);
      }
    } catch(e) { console.error('Strength stats error:', e); }
    finally { setStrengthLoading(false); }
  }

  function checkForPR(exerciseName, weightLbs, reps) {
    if (!strengthStats || strengthStats.length === 0) return;
    var ex = strengthStats.find(function(e) { return e.name === exerciseName; });
    if (!ex) return;
    var w = parseFloat(weightLbs);
    var r = parseInt(reps);
    var newValue;
    if (ex.hasWeight && w > 0) {
      newValue = r > 1 ? Math.round(w * (1 + r / 30)) : w;
    } else if (r > 0) {
      newValue = r;
    }
    if (newValue && ex.allTimePR && newValue > ex.allTimePR.value) {
      setPrCelebration({ exerciseName: exerciseName, value: newValue, metricLabel: ex.metricLabel });
      setTimeout(function() { setPrCelebration(null); }, 5000);
      // Refresh strength stats after PR
      if (user) loadStrengthStats(user.id);
    }
  }

  async function saveWeight() {
    if (!user || !weightInput) return;
    setWeightSaving(true);
    try {
      await fetch('/api/weight-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, weight_lbs: parseFloat(weightInput), note: weightNote })
      });
      setWeightInput("");
      setWeightNote("");
      loadWeightLogs();
    } catch(e) { console.error('Weight save error:', e); }
    finally { setWeightSaving(false); }
  }

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
          // Redirect new users to intake if they haven't completed it
          // has_completed_intake is set on profiles when intake is submitted
          if (p.has_completed_intake === false) {
            router.push('/intake');
          }
        });
        supabase.from("generated_programs").select("*").eq("user_id", u.id).order("generated_at", { ascending: false }).limit(1).single().then(function(programResult) {
          setProgram(programResult.data || null);
          setLoading(false);
        });
        // Load weight logs
        fetch('/api/weight-log?userId=' + u.id).then(function(r) { return r.json(); }).then(function(d) { if (d.logs) setWeightLogs(d.logs); }).catch(function(){});
        // Load workout logs from DB (merges with localStorage)
        loadWorkoutLogs(u.id);
        // Load strength stats
        loadStrengthStats(u.id);
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
    if (loading || !user) return;
    // Only poll if program is actively generating
    if (program && program.status !== 'generating') return;
    var userId = user.id;
    var interval = setInterval(function() {
      supabase.from("generated_programs").select("*").eq("user_id", userId).order("generated_at", { ascending: false }).limit(1).single().then(function(result) {
        if (result.data) {
          setProgram(function(current) {
            if (!current || result.data.id !== current.id || result.data.status !== (current && current.status)) return result.data;
            return current;
          });
          // Stop polling once ready or failed
          if (result.data.status === 'ready' || result.data.status === 'failed') {
            clearInterval(interval);
          }
        }
      });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [loading, user, program && program.status]);

  // Load video library from Supabase once
  useEffect(function() {
    supabase.from('exercise_videos').select('exercise_name, youtube_id, aliases').then(function(res) {
      if (res.data) {
        var lib = {};
        res.data.forEach(function(row) {
          if (row.youtube_id && row.youtube_id !== 'PENDING') {
            var key = row.exercise_name.toLowerCase().trim();
            lib[key] = row.youtube_id;
            if (row.aliases) {
              row.aliases.forEach(function(alias) {
                lib[alias.toLowerCase().trim()] = row.youtube_id;
              });
            }
          }
        });
        setVideoLibrary(lib);
      }
    });
  }, []);

  function getVideoId(exerciseName) {
    if (!exerciseName) return null;
    var name = exerciseName.toLowerCase().trim();

    // 1. Exact match
    if (videoLibrary[name]) return videoLibrary[name];

    // Only strip truly meaningless words — keep all fitness terms
    var stopWords = ['the','and','with','sets','reps','your','each','side','using','some','that','from','or'];

    function meaningful(str) {
      return str.split(/[\s\-\/\(\)]+/).filter(function(w) {
        return w.length > 2 && stopWords.indexOf(w) === -1;
      });
    }

    var nameWords = meaningful(name);
    if (nameWords.length === 0) return null;

    var keys = Object.keys(videoLibrary);
    var bestKey = null;
    var bestScore = 0;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var keyWords = meaningful(key);
      if (keyWords.length === 0) continue;

      var overlap = nameWords.filter(function(w) { return key.indexOf(w) !== -1; });
      var score = overlap.length / Math.max(nameWords.length, keyWords.length);

      // Need at least 1 word overlap and 50% score
      if (overlap.length >= 1 && score >= 0.5 && score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }

    return bestKey ? videoLibrary[bestKey] : null;
  }

  function openVideo(exerciseName) {
    var id = getVideoId(exerciseName);
    if (id) setVideoModal({ exerciseName: exerciseName, youtubeId: id });
  }

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

    // Mark as saving (also clears any previous error state)
    setLogs(function(prev) {
      var next = {};
      for (var k in prev) next[k] = prev[k];
      var existing = prev[key] || {};
      var updated = {};
      for (var f in existing) updated[f] = existing[f];
      updated.saving = true;
      updated.saveError = false;
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

      // If session expired, refresh and retry once
      if (res.status === 401) {
        await supabase.auth.refreshSession();
        res = await fetch("/api/workout-log", {
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
      }

      if (!res.ok) throw new Error('Save failed: ' + res.status);
      var data = await res.json();

      // Check for PR before updating state
      checkForPR(exerciseName, logData.weight, logData.reps);

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
        try { localStorage.setItem('workout-logs', JSON.stringify(next)); } catch(e) {}
        return next;
      });
    } catch (err) {
      console.error('saveLog error:', err);
      setLogs(function(prev) {
        var next = {};
        for (var k in prev) next[k] = prev[k];
        var existing = prev[key] || {};
        var updated = {};
        for (var f in existing) updated[f] = existing[f];
        updated.saving = false;
        updated.saveError = true; // flag for UI
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
                <button key={n.id} className={activeTab === n.id ? "dash-nav-item active" : "dash-nav-item"} onClick={function() {
                  setActiveTab(n.id);
                  if (n.id === 'progress' && user) loadStrengthStats(user.id);
                }}>
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
                  <div className="card-title">
                    {program && program.status === 'failed' ? "Generation Failed"
                      : (program && program.program_name) ? program.program_name.replace(/_/g, ' ')
                      : program && program.status === 'generating' ? "Building Your Program..."
                      : "No Program Yet"}
                  </div>
                  <div className="card-body">
                    {program && program.status === 'failed'
                      ? "Something went wrong generating your program. Please try regenerating below."
                      : program && program.program_name
                      ? "Log your sets and hit Save after each one. You'll get a next-week progression suggestion based on your performance."
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
                  <button className="card-btn" onClick={function() {
                    if (window.confirm('This will replace your current program. Are you sure?')) {
                      regenerateProgram();
                    }
                  }} style={{ marginBottom: 8 }}>Regenerate Program</button>
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
                {" "}Log your sets after each session — hit Save to record your performance and get a next-week progression suggestion.
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
                                          <div className="exercise-name" onClick={function() { openVideo(ex.name); }} style={getVideoId(ex.name) ? { cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationColor: 'var(--gold)' } : {}}>{ex.name}{getVideoId(ex.name) && <span style={{ marginLeft: 5, fontSize: 10, color: 'var(--gold)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>VIDEO</span>}</div>
                                            {ex.note && <div className="exercise-target">{ex.note}</div>}
                                            {ex.rest && <div style={{ fontSize: 11, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2 }}>Rest: {ex.rest}</div>}
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
                                        placeholder={ex["rir_week" + currentWeek] || ex.rir_week1 || "RIR"}
                                        value={logEntry.rir || ""}
                                        onChange={function(v) { updateLog(day.day, ex.name, si, "rir", v); }}
                                      />
                                      <div style={{ textAlign: "center", fontSize: 11, color: "var(--mid)", fontFamily: "Barlow Condensed" }}>
                                        {ex.reps} @ RIR {ex["rir_week" + currentWeek] || ex.rir_week1}
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
                                        className={logEntry.saved ? "log-btn saved" : logEntry.saveError ? "log-btn" : "log-btn"}
                                        onClick={function() { saveLog(day.day, ex.name, si, si + 1); }}
                                        disabled={logEntry.saving}
                                        title={logEntry.saveError ? "Save failed — tap to retry" : "Save set and get next week suggestion"}
                                        style={logEntry.saveError ? { background: '#E74C3C' } : {}}
                                      >
                                        {logEntry.saving ? "..." : logEntry.saved ? "✓" : logEntry.saveError ? "!" : "Save"}
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


          {/* PROGRESS */}
          {activeTab === "progress" && (
            <div>
              <div className="dash-page-title">Your <em>Progress</em></div>
              <div className="dash-page-sub">Lifetime PRs, body weight, and strength trends.</div>

              {/* Strength Tracker */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Strength Progress</div>

                {strengthLoading ? (
                  <div className="card"><div className="card-body">Loading strength data...</div></div>
                ) : strengthStats.length === 0 ? (
                  <div className="card"><div className="card-body">Start logging your sets in the Training tab to track your strength progress over time.</div></div>
                ) : (
                  <div>
                    {/* Exercise selector tabs */}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                      {strengthStats.map(function(ex, i) {
                        return (
                          <button key={ex.name} onClick={function() { setSelectedExercise(i); }} style={{
                            padding: "7px 12px",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            border: "1.5px solid " + (selectedExercise === i ? "var(--maroon)" : "var(--border)"),
                            background: selectedExercise === i ? "var(--maroon)" : "white",
                            color: selectedExercise === i ? "white" : "var(--mid)",
                            cursor: "pointer"
                          }}>
                            {ex.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected exercise chart */}
                    {(function() {
                      var ex = strengthStats[selectedExercise];
                      if (!ex) return null;
                      var timeline = ex.timeline;
                      var values = timeline.map(function(s) { return s.best.value; });
                      var minV = Math.max(0, Math.min.apply(null, values) - (ex.hasWeight ? 10 : 2));
                      var maxV = Math.max.apply(null, values) + (ex.hasWeight ? 10 : 2);
                      var range = maxV - minV || 1;
                      var chartH = 140;
                      var chartW = Math.max(400, timeline.length * 60);
                      var pts = timeline.map(function(s, i) {
                        var x = (i / Math.max(timeline.length - 1, 1)) * (chartW - 40) + 20;
                        var y = chartH - ((s.best.value - minV) / range) * (chartH - 20) - 10;
                        return { x: x, y: y, s: s };
                      });
                      var pathD = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y; }).join(' ');
                      var prIdx = pts.reduce(function(best, p, i) {
                        return p.s.best.value > pts[best].s.best.value ? i : best;
                      }, 0);

                      return (
                        <div className="card">
                          {/* PR stats bar */}
                          <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 4 }}>All-Time PR</div>
                              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 900, color: "var(--maroon)" }}>
                                {ex.allTimePR.value}{ex.hasWeight ? ' lbs' : ' reps'}
                              </div>
                              {ex.hasWeight && ex.allTimePR.weight && (
                                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, color: "var(--mid)", marginTop: 2 }}>
                                  {ex.allTimePR.weight} lbs × {ex.allTimePR.reps || 1} reps
                                </div>
                              )}
                            </div>
                            {ex.recentBest && (
                              <div>
                                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 4 }}>Last 30 Days</div>
                                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 900, color: "var(--charcoal)" }}>
                                  {ex.recentBest.value}{ex.hasWeight ? ' lbs' : ' reps'}
                                </div>
                              </div>
                            )}
                            <div>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 4 }}>Sessions Logged</div>
                              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 900, color: "var(--charcoal)" }}>{ex.sessionCount}</div>
                            </div>
                            <div>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 4 }}>Tracking</div>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 700, color: "var(--charcoal)", marginTop: 6 }}>{ex.metricLabel}</div>
                            </div>
                          </div>

                          {/* Chart */}
                          {timeline.length > 1 && (
                            <div style={{ overflowX: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                              <svg width={chartW} height={chartH + 40} style={{ display: "block" }}>
                                <path d={pathD} fill="none" stroke="var(--maroon)" strokeWidth="2" />
                                {pts.map(function(p, i) {
                                  var isPR = i === prIdx;
                                  return (
                                    <g key={i}>
                                      <circle cx={p.x} cy={p.y} r={isPR ? 6 : 4} fill={isPR ? "var(--gold)" : "var(--maroon)"} />
                                      <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill={isPR ? "var(--gold)" : "var(--charcoal)"} fontFamily="Barlow, sans-serif" fontWeight={isPR ? "700" : "400"}>
                                        {p.s.best.value}{ex.hasWeight ? '' : 'r'}
                                      </text>
                                      <text x={p.x} y={chartH + 20} textAnchor="middle" fontSize="9" fill="var(--mid)" fontFamily="Barlow, sans-serif" transform={"rotate(-45," + p.x + "," + (chartH + 20) + ")"}>
                                        {p.s.date ? p.s.date.slice(5) : ""}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 10, color: "var(--mid)", letterSpacing: "0.06em", marginTop: 4 }}>
                                Gold dot = all-time PR · {ex.metricLabel} shown
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Body Weight section */}
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Body Weight</div>

              {/* Log weight */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-label">Log Today's Weight</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <input
                    type="number"
                    placeholder="Weight (lbs)"
                    value={weightInput}
                    onChange={function(e) { setWeightInput(e.target.value); }}
                    style={{ background: "white", border: "1.5px solid var(--border)", padding: "10px 14px", fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 300, color: "var(--charcoal)", outline: "none", width: 140 }}
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={weightNote}
                    onChange={function(e) { setWeightNote(e.target.value); }}
                    style={{ background: "white", border: "1.5px solid var(--border)", padding: "10px 14px", fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 300, color: "var(--charcoal)", outline: "none", flex: 1, minWidth: 160 }}
                  />
                  <button
                    onClick={saveWeight}
                    disabled={weightSaving || !weightInput}
                    style={{ background: "var(--maroon)", color: "white", border: "none", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 20px", opacity: (!weightInput) ? 0.4 : 1 }}
                  >
                    {weightSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Weight chart */}
              {weightLogs.length > 0 ? (
                <div className="card">
                  <div className="card-label">Weight Over Time</div>
                  <div style={{ overflowX: "auto" }}>
                    {(function() {
                      var weights = weightLogs.map(function(l) { return parseFloat(l.weight_lbs); });
                      var minW = Math.min.apply(null, weights) - 2;
                      var maxW = Math.max.apply(null, weights) + 2;
                      var range = maxW - minW || 1;
                      var chartH = 140;
                      var chartW = Math.max(400, weightLogs.length * 48);
                      var pts = weightLogs.map(function(l, i) {
                        var x = (i / Math.max(weightLogs.length - 1, 1)) * (chartW - 40) + 20;
                        var y = chartH - ((parseFloat(l.weight_lbs) - minW) / range) * (chartH - 20) - 10;
                        return { x: x, y: y, w: l.weight_lbs, date: l.logged_at };
                      });
                      var pathD = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y; }).join(' ');
                      return (
                        <svg width={chartW} height={chartH + 40} style={{ display: "block" }}>
                          <path d={pathD} fill="none" stroke="var(--maroon)" strokeWidth="2" />
                          {pts.map(function(p, i) {
                            return (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="4" fill="var(--maroon)" />
                                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="var(--charcoal)" fontFamily="Barlow, sans-serif">{p.w}</text>
                                <text x={p.x} y={chartH + 20} textAnchor="middle" fontSize="10" fill="var(--mid)" fontFamily="Barlow, sans-serif" transform={"rotate(-45," + p.x + "," + (chartH + 20) + ")"}>
                                  {p.date ? p.date.slice(5) : ""}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Stats */}
                  {(function() {
                    if (weightLogs.length < 2) return null;
                    var first = parseFloat(weightLogs[0].weight_lbs);
                    var last = parseFloat(weightLogs[weightLogs.length - 1].weight_lbs);
                    var diff = Math.round((last - first) * 10) / 10;
                    var sign = diff > 0 ? "+" : "";
                    return (
                      <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 2 }}>Starting</div>
                          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 900, color: "var(--charcoal)" }}>{first} lbs</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 2 }}>Current</div>
                          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 900, color: "var(--charcoal)" }}>{last} lbs</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 2 }}>Total Change</div>
                          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 900, color: diff < 0 ? "var(--maroon)" : diff > 0 ? "var(--gold)" : "var(--charcoal)" }}>{sign}{diff} lbs</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Log history */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mid)", marginBottom: 8 }}>History</div>
                    {weightLogs.slice().reverse().slice(0, 10).map(function(log, i) {
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                          <span style={{ fontWeight: 300, color: "var(--mid)" }}>{log.logged_at}</span>
                          <span style={{ fontWeight: 600, color: "var(--charcoal)" }}>{log.weight_lbs} lbs</span>
                          {log.note && <span style={{ fontWeight: 300, color: "var(--mid)", fontSize: 12 }}>{log.note}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body">Log your first weight entry above to start tracking your progress.</div>
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

      {prCelebration && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: 'var(--gold)', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.25)', animation: 'fadeIn 0.3s ease', minWidth: 280, maxWidth: 480 }}>
          <div style={{ fontSize: 28 }}>🏆</div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>New Personal Record</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 2 }}>{prCelebration.exerciseName}</div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{prCelebration.metricLabel}: {prCelebration.value}{prCelebration.metricLabel === 'Est. 1RM' ? ' lbs' : ' reps'}</div>
          </div>
          <button onClick={function() { setPrCelebration(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18, marginLeft: 'auto', padding: '0 4px' }}>&#x2715;</button>
        </div>
      )}

      {videoModal && (
        <div onClick={function() { setVideoModal(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: '#1a1a1a', width: '100%', maxWidth: 720, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white' }}>{videoModal.exerciseName}</div>
              <button onClick={function() { setVideoModal(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>&#x2715;</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={'https://www.youtube.com/embed/' + videoModal.youtubeId.split('?')[0] + '?autoplay=1&rel=0&modestbranding=1'}
                title={videoModal.exerciseName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
