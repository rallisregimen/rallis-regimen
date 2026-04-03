import { useState, useEffect } from "react";

var styles = [
  "@import url(https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500&display=swap);",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ":root{--maroon:#7B1A38;--maroon-dark:#5C1229;--maroon-light:#F2E8EC;--off-white:#F7F4EF;--charcoal:#1A1A1A;--mid:#4A4A4A;--gold:#B8943A;--border:rgba(123,26,56,0.12);}",
  "body{background:var(--off-white);font-family:'Barlow',sans-serif;font-weight:300;}",

  // Layout
  ".admin-wrap{max-width:1200px;margin:0 auto;padding:40px 24px 80px;}",
  ".admin-header{margin-bottom:40px;}",
  ".admin-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;color:var(--charcoal);}",
  ".admin-title em{font-style:italic;color:var(--maroon);}",
  ".admin-sub{font-size:14px;font-weight:300;color:var(--mid);margin-top:6px;}",
  ".admin-stats{display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;}",
  ".stat-badge{background:white;border:1px solid var(--border);padding:14px 20px;display:flex;flex-direction:column;align-items:center;min-width:120px;}",
  ".stat-num{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--maroon);}",
  ".stat-label{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--mid);margin-top:4px;}",

  // Login gate
  ".login-gate{display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:20px;}",
  ".login-gate-title{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--charcoal);}",
  ".login-row{display:flex;gap:8px;}",
  ".login-input{border:1.5px solid var(--border);padding:10px 14px;font-size:14px;font-weight:300;outline:none;width:240px;}",
  ".login-input:focus{border-color:var(--maroon);}",
  ".login-btn{background:var(--maroon);color:white;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:none;cursor:pointer;padding:10px 20px;transition:background 0.2s;}",
  ".login-btn:hover{background:var(--maroon-dark);}",
  ".login-error{font-size:12px;color:#c0392b;font-weight:400;}",

  // Member cards
  ".member-card{background:white;border:1px solid var(--border);margin-bottom:16px;}",
  ".member-head{padding:18px 24px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s;}",
  ".member-head:hover{background:rgba(123,26,56,0.02);}",
  ".member-head-left{display:flex;align-items:center;gap:16px;}",
  ".member-avatar{width:40px;height:40px;background:var(--maroon);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:white;}",
  ".member-name{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--charcoal);}",
  ".member-email{font-size:12px;font-weight:300;color:var(--mid);margin-top:2px;}",
  ".member-meta{display:flex;gap:10px;align-items:center;}",
  ".member-status{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:4px 10px;}",
  ".status-active{background:rgba(39,174,96,0.1);color:#27ae60;}",
  ".status-inactive{background:rgba(74,74,74,0.1);color:var(--mid);}",
  ".status-cancelled{background:rgba(192,57,43,0.1);color:#c0392b;}",
  ".member-toggle{font-size:20px;color:var(--mid);transition:transform 0.2s;user-select:none;}",
  ".member-toggle.open{transform:rotate(45deg);}",

  // Member detail
  ".member-detail{padding:0;}",
  ".detail-tabs{display:flex;gap:2px;background:var(--off-white);padding:2px;}",
  ".detail-tab{flex:1;padding:10px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border:none;background:transparent;cursor:pointer;color:var(--mid);transition:all 0.15s;text-align:center;}",
  ".detail-tab.active{background:white;color:var(--maroon);}",
  ".detail-content{padding:24px;}",

  // Intake summary
  ".intake-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}",
  ".intake-section{background:var(--off-white);padding:16px;border:1px solid var(--border);}",
  ".intake-section-title{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}",
  ".intake-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;}",
  ".intake-label{color:var(--mid);font-weight:300;}",
  ".intake-value{color:var(--charcoal);font-weight:500;text-align:right;max-width:60%;}",

  // Program view
  ".program-banner{background:var(--charcoal);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}",
  ".program-banner-name{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:white;}",
  ".program-banner-meta{font-size:11px;font-weight:300;color:rgba(255,255,255,0.5);}",
  ".day-block{background:var(--off-white);border:1px solid var(--border);margin-bottom:8px;}",
  ".day-head{padding:12px 16px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;}",
  ".day-head:hover{background:rgba(123,26,56,0.03);}",
  ".day-head-left{display:flex;align-items:center;gap:10px;}",
  ".day-label{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--charcoal);}",
  ".day-type-badge{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:var(--maroon-light);color:var(--maroon);padding:2px 8px;}",
  ".day-toggle-sm{font-size:16px;color:var(--mid);transition:transform 0.2s;}",
  ".day-toggle-sm.open{transform:rotate(45deg);}",

  // Exercise table
  ".ex-table{width:100%;border-collapse:collapse;}",
  ".ex-table th{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--mid);padding:8px 12px;text-align:left;background:white;border-bottom:1px solid var(--border);}",
  ".ex-table td{padding:8px 12px;font-size:13px;font-weight:300;color:var(--charcoal);border-bottom:1px solid var(--border);vertical-align:top;}",
  ".ex-table tr:last-child td{border-bottom:none;}",
  ".ex-name{font-weight:500;color:var(--charcoal);}",
  ".ex-note{font-size:11px;color:var(--mid);margin-top:2px;font-style:italic;}",

  // Meal plan
  ".meal-day{margin-bottom:16px;}",
  ".meal-day-label{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--charcoal);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border);}",
  ".meal-item{background:var(--off-white);padding:12px 14px;margin-bottom:6px;border:1px solid var(--border);}",
  ".meal-item-name{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--maroon);margin-bottom:4px;}",
  ".meal-item-desc{font-size:12px;font-weight:300;color:var(--mid);line-height:1.5;}",
  ".meal-item-macros{display:flex;gap:12px;margin-top:6px;font-size:11px;color:var(--mid);}",
  ".meal-item-macros strong{color:var(--charcoal);font-weight:600;}",

  // Workout logs
  ".log-summary{font-size:13px;font-weight:300;color:var(--mid);margin-bottom:16px;}",
  ".log-day-group{margin-bottom:16px;}",
  ".log-day-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--charcoal);margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border);}",
  ".log-entry{display:grid;grid-template-columns:1fr 80px 60px 60px auto;gap:8px;padding:5px 0;font-size:12px;font-weight:300;color:var(--mid);border-bottom:1px solid rgba(123,26,56,0.06);}",
  ".log-entry-head{font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);padding-bottom:4px;}",

  // Responsive
  "@media(max-width:900px){.admin-wrap{padding:20px 16px;}.intake-grid{grid-template-columns:1fr;}.member-head{flex-direction:column;align-items:flex-start;gap:10px;}.member-meta{flex-wrap:wrap;}.admin-stats{flex-direction:column;}}"
].join(" ");

// Helpers
function formatGoal(g) {
  if (!g) return "—";
  return g.replace(/_/g, " ").replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

function formatDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch (e) { return d; }
}

function getInitials(name, email) {
  if (name) {
    var parts = name.trim().split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

function statusClass(s) {
  if (s === "active") return "member-status status-active";
  if (s === "cancelled" || s === "past_due") return "member-status status-cancelled";
  return "member-status status-inactive";
}

// ─── Intake Panel ───
function IntakePanel(props) {
  var intake = props.intake;
  if (!intake) return React.createElement("div", { className: "detail-content", style: { color: "var(--mid)", fontSize: 13 } }, "No intake submitted yet.");

  function row(label, value) {
    return React.createElement("div", { className: "intake-row", key: label },
      React.createElement("span", { className: "intake-label" }, label),
      React.createElement("span", { className: "intake-value" }, value || "—")
    );
  }

  return React.createElement("div", { className: "detail-content" },
    React.createElement("div", { className: "intake-grid" },

      React.createElement("div", { className: "intake-section" },
        React.createElement("div", { className: "intake-section-title" }, "Profile"),
        row("Name", intake.first_name),
        row("Age", intake.age),
        row("Sex", intake.sex),
        row("Height", intake.height_ft ? intake.height_ft + "'" + (intake.height_in || 0) + "\"" : "—"),
        row("Current Weight", intake.current_weight_lbs ? intake.current_weight_lbs + " lbs" : "—"),
        row("Ideal Weight", intake.ideal_weight_lbs ? intake.ideal_weight_lbs + " lbs" : "—")
      ),

      React.createElement("div", { className: "intake-section" },
        React.createElement("div", { className: "intake-section-title" }, "Goals & Training"),
        row("Primary Goal", formatGoal(intake.goal_primary)),
        row("Secondary Goal", formatGoal(intake.goal_secondary)),
        row("Experience", formatGoal(intake.experience_level)),
        row("Days/Week", intake.training_days_per_week),
        row("Session Length", intake.session_length_mins ? intake.session_length_mins + " min" : "—"),
        row("Equipment", formatGoal(intake.equipment)),
        row("Injuries", intake.injuries_limitations || "None")
      ),

      React.createElement("div", { className: "intake-section" },
        React.createElement("div", { className: "intake-section-title" }, "Nutrition & Sleep"),
        row("Weight Goal", formatGoal(intake.weight_management_goal)),
        row("Approach", formatGoal(intake.nutrition_approach)),
        row("Restrictions", intake.dietary_restrictions && intake.dietary_restrictions.length > 0 ? intake.dietary_restrictions.join(", ") : "None"),
        row("Avg Sleep", intake.avg_sleep_hours ? intake.avg_sleep_hours + " hrs" : "—"),
        row("Sleep Issue", formatGoal(intake.sleep_issue)),
        row("Bedtime", intake.typical_bedtime || "—"),
        row("Wake", intake.typical_wake_time || "—")
      )
    ),
    React.createElement("div", { style: { fontSize: 11, color: "var(--mid)", marginTop: 12 } }, "Submitted: " + formatDate(intake.submitted_at))
  );
}

// ─── Program Panel ───
function ProgramPanel(props) {
  var program = props.program;
  var openDays = props.openDays;
  var setOpenDays = props.setOpenDays;

  if (!program) return React.createElement("div", { className: "detail-content", style: { color: "var(--mid)", fontSize: 13 } }, "No program generated yet.");

  var tp = program.training_program;
  var block = tp && tp.blocks ? tp.blocks[0] : null;
  var days = block ? block.days : (tp && tp.days ? tp.days : []);

  function toggleDay(idx) {
    setOpenDays(function(prev) {
      var copy = Object.assign({}, prev);
      copy[idx] = !copy[idx];
      return copy;
    });
  }

  return React.createElement("div", { className: "detail-content", style: { padding: 0 } },
    // Banner
    React.createElement("div", { className: "program-banner" },
      React.createElement("div", null,
        React.createElement("div", { className: "program-banner-name" }, (program.program_name || "Program").replace(/_/g, " ")),
        React.createElement("div", { className: "program-banner-meta" },
          "Type: " + (program.program_type || "—") + "  ·  Block " + (program.block_number || 1) + "  ·  " + (tp && tp.split ? tp.split : "") + "  ·  Generated " + formatDate(program.generated_at)
        )
      ),
      React.createElement("div", { style: { fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: program.status === "ready" ? "#27ae60" : "var(--gold)" } }, program.status || "—")
    ),

    // Days
    React.createElement("div", { style: { padding: "16px 24px" } },
      days.length === 0
        ? React.createElement("div", { style: { color: "var(--mid)", fontSize: 13 } }, "No training days found in program JSON.")
        : days.map(function(day, di) {
            var isOpen = openDays[di];
            return React.createElement("div", { className: "day-block", key: di },
              React.createElement("div", { className: "day-head", onClick: function() { toggleDay(di); } },
                React.createElement("div", { className: "day-head-left" },
                  React.createElement("div", { className: "day-label" }, day.day + " — " + (day.focus || "")),
                  day.type && React.createElement("div", { className: "day-type-badge" }, day.type)
                ),
                React.createElement("div", { className: isOpen ? "day-toggle-sm open" : "day-toggle-sm" }, "+")
              ),
              isOpen && day.exercises && React.createElement("table", { className: "ex-table" },
                React.createElement("thead", null,
                  React.createElement("tr", null,
                    React.createElement("th", null, "Exercise"),
                    React.createElement("th", null, "Sets"),
                    React.createElement("th", null, "Reps"),
                    React.createElement("th", null, "RIR Wk1"),
                    React.createElement("th", null, "RIR Wk2"),
                    React.createElement("th", null, "RIR Wk3"),
                    React.createElement("th", null, "Rest"),
                    React.createElement("th", null, "Note")
                  )
                ),
                React.createElement("tbody", null,
                  day.exercises.map(function(ex, ei) {
                    return React.createElement("tr", { key: ei },
                      React.createElement("td", null,
                        React.createElement("div", { className: "ex-name" }, ex.name),
                        ex.note && React.createElement("div", { className: "ex-note" }, ex.note)
                      ),
                      React.createElement("td", null, ex.sets || "—"),
                      React.createElement("td", null, ex.reps || "—"),
                      React.createElement("td", null, ex.rir_week1 || "—"),
                      React.createElement("td", null, ex.rir_week2 || "—"),
                      React.createElement("td", null, ex.rir_week3 || "—"),
                      React.createElement("td", null, ex.rest || "—"),
                      React.createElement("td", { style: { fontSize: 11, color: "var(--mid)", maxWidth: 140 } }, ex.note || "")
                    );
                  })
                )
              )
            );
          })
    )
  );
}

// ─── Meal Plan Panel ───
function MealPanel(props) {
  var program = props.program;
  if (!program || !program.meal_plan) return React.createElement("div", { className: "detail-content", style: { color: "var(--mid)", fontSize: 13 } }, "No meal plan generated.");

  var mp = program.meal_plan;
  var dailyMacros = mp.daily_macros || mp.dailyMacros || null;
  var mealPlanArr = mp.meal_plan || mp.meals || [];

  return React.createElement("div", { className: "detail-content" },
    // Daily macros summary
    dailyMacros && React.createElement("div", { style: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" } },
      ["calories", "protein", "carbs", "fat", "fiber"].map(function(k) {
        var val = dailyMacros[k] || dailyMacros[k + "_g"] || dailyMacros[k.charAt(0).toUpperCase() + k.slice(1)];
        if (!val) return null;
        return React.createElement("div", { key: k, className: "stat-badge", style: { minWidth: 80 } },
          React.createElement("div", { style: { fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 900, color: "var(--maroon)" } }, val),
          React.createElement("div", { className: "stat-label" }, k)
        );
      })
    ),

    // Meals by day
    Array.isArray(mealPlanArr) && mealPlanArr.map(function(dayPlan, di) {
      var dayLabel = dayPlan.day || dayPlan.day_label || ("Day " + (di + 1));
      var meals = dayPlan.meals || [];
      return React.createElement("div", { className: "meal-day", key: di },
        React.createElement("div", { className: "meal-day-label" }, dayLabel),
        meals.map(function(meal, mi) {
          return React.createElement("div", { className: "meal-item", key: mi },
            React.createElement("div", { className: "meal-item-name" }, meal.meal || meal.name || meal.label || ("Meal " + (mi + 1))),
            React.createElement("div", { className: "meal-item-desc" }, meal.description || meal.food || meal.items || ""),
            (meal.protein || meal.calories) && React.createElement("div", { className: "meal-item-macros" },
              meal.calories && React.createElement("span", null, React.createElement("strong", null, meal.calories), " cal"),
              meal.protein && React.createElement("span", null, React.createElement("strong", null, meal.protein), "g P"),
              meal.carbs && React.createElement("span", null, React.createElement("strong", null, meal.carbs), "g C"),
              meal.fat && React.createElement("span", null, React.createElement("strong", null, meal.fat), "g F")
            )
          );
        })
      );
    }),

    !Array.isArray(mealPlanArr) && React.createElement("div", { style: { fontSize: 13, color: "var(--mid)" } }, "Meal plan data is present but in an unrecognized format.")
  );
}

// ─── Workout Logs Panel ───
function LogsPanel(props) {
  var logs = props.logs || [];
  if (logs.length === 0) return React.createElement("div", { className: "detail-content", style: { color: "var(--mid)", fontSize: 13 } }, "No workout logs recorded yet.");

  // Group by day_label
  var grouped = {};
  logs.forEach(function(log) {
    var key = log.day_label || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  return React.createElement("div", { className: "detail-content" },
    React.createElement("div", { className: "log-summary" }, logs.length + " total sets logged"),
    Object.keys(grouped).map(function(dayKey) {
      var dayLogs = grouped[dayKey];
      return React.createElement("div", { className: "log-day-group", key: dayKey },
        React.createElement("div", { className: "log-day-label" }, dayKey),
        // Header
        React.createElement("div", { className: "log-entry log-entry-head" },
          React.createElement("span", null, "Exercise"),
          React.createElement("span", null, "Weight"),
          React.createElement("span", null, "Reps"),
          React.createElement("span", null, "RIR"),
          React.createElement("span", null, "Date")
        ),
        dayLogs.map(function(log, li) {
          return React.createElement("div", { className: "log-entry", key: li },
            React.createElement("span", { style: { fontWeight: 400, color: "var(--charcoal)" } }, log.exercise_name),
            React.createElement("span", null, log.weight_lbs ? log.weight_lbs + " lbs" : "—"),
            React.createElement("span", null, log.reps || "—"),
            React.createElement("span", null, log.rir != null ? log.rir : "—"),
            React.createElement("span", null, formatDate(log.logged_at))
          );
        })
      );
    })
  );
}

// ─── Single Member Card ───
function MemberCard(props) {
  var profile = props.profile;
  var intake = props.intake;
  var program = props.program;
  var logs = props.logs;
  var isOpen = props.isOpen;
  var onToggle = props.onToggle;
  var detailTab = props.detailTab;
  var setDetailTab = props.setDetailTab;
  var openDays = props.openDays;
  var setOpenDays = props.setOpenDays;

  var tabs = [
    { id: "intake", label: "Intake" },
    { id: "program", label: "Training Program" },
    { id: "meals", label: "Meal Plan" },
    { id: "logs", label: "Workout Logs" },
  ];

  return React.createElement("div", { className: "member-card" },
    // Header row
    React.createElement("div", { className: "member-head", onClick: onToggle },
      React.createElement("div", { className: "member-head-left" },
        React.createElement("div", { className: "member-avatar" }, getInitials(profile.full_name, profile.email)),
        React.createElement("div", null,
          React.createElement("div", { className: "member-name" }, profile.full_name || "No Name"),
          React.createElement("div", { className: "member-email" }, profile.email)
        )
      ),
      React.createElement("div", { className: "member-meta" },
        React.createElement("span", { className: statusClass(profile.subscription_status) }, profile.subscription_status || "inactive"),
        profile.subscription_tier && React.createElement("span", { style: { fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" } }, profile.subscription_tier),
        React.createElement("span", { style: { fontSize: 11, color: "var(--mid)" } }, "Joined " + formatDate(profile.created_at)),
        React.createElement("span", { className: isOpen ? "member-toggle open" : "member-toggle" }, "+")
      )
    ),

    // Detail panel
    isOpen && React.createElement("div", { className: "member-detail" },
      React.createElement("div", { className: "detail-tabs" },
        tabs.map(function(t) {
          return React.createElement("button", {
            key: t.id,
            className: detailTab === t.id ? "detail-tab active" : "detail-tab",
            onClick: function(e) { e.stopPropagation(); setDetailTab(t.id); }
          }, t.label);
        })
      ),
      detailTab === "intake" && React.createElement(IntakePanel, { intake: intake }),
      detailTab === "program" && React.createElement(ProgramPanel, { program: program, openDays: openDays, setOpenDays: setOpenDays }),
      detailTab === "meals" && React.createElement(MealPanel, { program: program }),
      detailTab === "logs" && React.createElement(LogsPanel, { logs: logs })
    )
  );
}

// ─── Main Admin Page ───
export default function AdminPage() {
  var _s = useState("");
  var password = _s[0], setPassword = _s[1];
  var _a = useState(false);
  var authed = _a[0], setAuthed = _a[1];
  var _l = useState(true);
  var loading = _l[0], setLoading = _l[1];
  var _e = useState("");
  var error = _e[0], setError = _e[1];
  var _d = useState(null);
  var data = _d[0], setData = _d[1];
  var _o = useState(-1);
  var openMember = _o[0], setOpenMember = _o[1];
  var _t = useState({});
  var detailTabs = _t[0], setDetailTabs = _t[1];
  var _od = useState({});
  var openDaysMap = _od[0], setOpenDaysMap = _od[1];
  var _f = useState("all");
  var filter = _f[0], setFilter = _f[1];

  // Check for stored session
  useEffect(function() {
    var stored = typeof window !== 'undefined' && sessionStorage.getItem('rr_admin');
    if (stored) {
      fetchData(stored);
    } else {
      setLoading(false);
    }
  }, []);

  function fetchData(pw) {
    setLoading(true);
    setError("");
    fetch("/api/admin-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw })
    })
      .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
      .then(function(res) {
        if (!res.ok) {
          setError(res.data.error || "Access denied");
          setLoading(false);
          return;
        }
        setData(res.data);
        setAuthed(true);
        setLoading(false);
        if (typeof window !== 'undefined') sessionStorage.setItem('rr_admin', pw);
      })
      .catch(function() {
        setError("Network error");
        setLoading(false);
      });
  }

  function handleLogin(e) {
    if (e) e.preventDefault();
    fetchData(password);
  }

  function getDetailTab(uid) { return detailTabs[uid] || "intake"; }
  function setMemberTab(uid, tab) { setDetailTabs(function(prev) { var c = Object.assign({}, prev); c[uid] = tab; return c; }); }
  function getOpenDays(uid) { return openDaysMap[uid] || {}; }
  function setMemberOpenDays(uid, fn) {
    setOpenDaysMap(function(prev) {
      var c = Object.assign({}, prev);
      c[uid] = fn(prev[uid] || {});
      return c;
    });
  }

  // Login gate
  if (!authed) {
    return React.createElement("div", null,
      React.createElement("style", null, styles),
      React.createElement("div", { className: "login-gate" },
        React.createElement("div", { style: { fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 900, color: "var(--charcoal)", marginBottom: 4 } },
          React.createElement("em", { style: { color: "var(--maroon)" } }, "Rallis"), " Admin"
        ),
        React.createElement("div", { className: "login-gate-title" }, "Enter admin password"),
        React.createElement("div", { className: "login-row" },
          React.createElement("input", {
            className: "login-input",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: function(e) { setPassword(e.target.value); },
            onKeyDown: function(e) { if (e.key === "Enter") handleLogin(); }
          }),
          React.createElement("button", { className: "login-btn", onClick: handleLogin, disabled: loading }, loading ? "..." : "Enter")
        ),
        error && React.createElement("div", { className: "login-error" }, error)
      )
    );
  }

  if (loading || !data) {
    return React.createElement("div", null,
      React.createElement("style", null, styles),
      React.createElement("div", { className: "login-gate" }, "Loading...")
    );
  }

  // Build lookup maps
  var intakeMap = {};
  (data.intakes || []).forEach(function(i) { if (!intakeMap[i.user_id]) intakeMap[i.user_id] = i; });

  var programMap = {};
  (data.programs || []).forEach(function(p) { if (!programMap[p.user_id]) programMap[p.user_id] = p; });

  var logsMap = {};
  (data.workoutLogs || []).forEach(function(l) {
    if (!logsMap[l.user_id]) logsMap[l.user_id] = [];
    logsMap[l.user_id].push(l);
  });

  var profiles = data.profiles || [];

  // Stats
  var activeCount = profiles.filter(function(p) { return p.subscription_status === "active"; }).length;
  var withProgram = profiles.filter(function(p) { return !!programMap[p.id]; }).length;
  var totalLogs = (data.workoutLogs || []).length;

  // Filter
  var filteredProfiles = profiles;
  if (filter === "active") filteredProfiles = profiles.filter(function(p) { return p.subscription_status === "active"; });
  else if (filter === "inactive") filteredProfiles = profiles.filter(function(p) { return p.subscription_status !== "active"; });
  else if (filter === "has_program") filteredProfiles = profiles.filter(function(p) { return !!programMap[p.id]; });

  return React.createElement("div", null,
    React.createElement("style", null, styles),
    React.createElement("div", { className: "admin-wrap" },

      // Header
      React.createElement("div", { className: "admin-header" },
        React.createElement("div", { className: "admin-title" },
          React.createElement("em", null, "Rallis Regimen"), " — Admin"
        ),
        React.createElement("div", { className: "admin-sub" }, "All members, programs, and workout data at a glance."),

        // Stats bar
        React.createElement("div", { className: "admin-stats" },
          React.createElement("div", { className: "stat-badge" },
            React.createElement("div", { className: "stat-num" }, profiles.length),
            React.createElement("div", { className: "stat-label" }, "Total Members")
          ),
          React.createElement("div", { className: "stat-badge" },
            React.createElement("div", { className: "stat-num" }, activeCount),
            React.createElement("div", { className: "stat-label" }, "Active")
          ),
          React.createElement("div", { className: "stat-badge" },
            React.createElement("div", { className: "stat-num" }, withProgram),
            React.createElement("div", { className: "stat-label" }, "With Program")
          ),
          React.createElement("div", { className: "stat-badge" },
            React.createElement("div", { className: "stat-num" }, totalLogs),
            React.createElement("div", { className: "stat-label" }, "Sets Logged")
          )
        )
      ),

      // Filter tabs
      React.createElement("div", { style: { display: "flex", gap: 2, background: "var(--border)", padding: 2, marginBottom: 20 } },
        [
          { id: "all", label: "All Members (" + profiles.length + ")" },
          { id: "active", label: "Active (" + activeCount + ")" },
          { id: "inactive", label: "Inactive" },
          { id: "has_program", label: "Has Program (" + withProgram + ")" },
        ].map(function(f) {
          return React.createElement("button", {
            key: f.id,
            className: filter === f.id ? "detail-tab active" : "detail-tab",
            onClick: function() { setFilter(f.id); }
          }, f.label);
        })
      ),

      // Member list
      filteredProfiles.map(function(profile, idx) {
        var uid = profile.id;
        return React.createElement(MemberCard, {
          key: uid,
          profile: profile,
          intake: intakeMap[uid] || null,
          program: programMap[uid] || null,
          logs: logsMap[uid] || [],
          isOpen: openMember === idx,
          onToggle: function() { setOpenMember(openMember === idx ? -1 : idx); },
          detailTab: getDetailTab(uid),
          setDetailTab: function(tab) { setMemberTab(uid, tab); },
          openDays: getOpenDays(uid),
          setOpenDays: function(fn) { setMemberOpenDays(uid, fn); },
        });
      }),

      filteredProfiles.length === 0 && React.createElement("div", { style: { textAlign: "center", padding: 40, color: "var(--mid)", fontSize: 14 } }, "No members match this filter.")
    )
  );
}
