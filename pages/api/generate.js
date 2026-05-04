import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const config = { maxDuration: 300 };

function buildTrainingPrompt(intake, profile, days, splitType, splitDesc, hasCardio, previousPrimaries, blockNum, previousBlockExercises) {
  blockNum = blockNum || 1;
  var name = profile.full_name || profile.first_name || 'Member';
  var equipment = intake.equipment || 'full_gym';
  var equipmentDetail = (intake.equipment_detail && intake.equipment_detail.length > 0)
    ? ' Specific equipment available: ' + intake.equipment_detail.join(', ') + '.'
    : '';
  var goal = intake.goal_primary || 'build_muscle';
  var goalSecondary = intake.goal_secondary || '';

  // Build equipment exclusion note
  var equipmentExclusions = '';
  if (intake.equipment_to_avoid && intake.equipment_to_avoid.length > 0) {
    equipmentExclusions = ' EQUIPMENT NOT AVAILABLE (do not program these even in a full gym): ' + intake.equipment_to_avoid.join(', ') + '.';
  }
  if (equipment === 'full_gym' && intake.equipment_detail && intake.equipment_detail.length > 0) {
    var specialtyItems = ['Trap Bar', 'Safety Squat Bar'];
    var missing = specialtyItems.filter(function(item) {
      return intake.equipment_detail.indexOf(item) === -1;
    });
    if (missing.length > 0) {
      equipmentExclusions += ' Member does NOT have access to: ' + missing.join(', ') + '. Do not program exercises requiring these specific bars.';
    }
  }

  // Rep scheme — block-specific ranges
  var repScheme;
  var hasStrengthSecondary = goalSecondary === 'build_strength';
  var hasMuscleSecondary = goalSecondary === 'build_muscle';
  var hasAthleticSecondary = goalSecondary === 'athletic_performance';

  if (goal === 'build_strength') {
    var accReps = hasMuscleSecondary ? '12-15' : '10-15';
    var primReps = blockNum === 1 ? '4-6' : blockNum === 2 ? '3-5' : '2-4';
    var suppReps = blockNum === 1 ? '6-10' : blockNum === 2 ? '6-8' : '5-8';
    repScheme = 'REP SCHEME (BLOCK ' + blockNum + '): Compound primaries ' + primReps + ' reps, supplementals ' + suppReps + ' reps, accessories ' + accReps + ' reps. Full rest 3-5 min on primaries.';

  } else if (goal === 'athletic_performance') {
    var athPrim = blockNum === 1 ? '5-8' : blockNum === 2 ? '4-6' : '3-5';
    var athSupp = blockNum === 1 ? '8-12' : blockNum === 2 ? '8-10' : '6-8';
    var athAcc = blockNum === 3 && hasMuscleSecondary ? '15-20' : '12-15';
    repScheme = 'REP SCHEME (BLOCK ' + blockNum + '): Speed/power opener 2-3 exercises at start (1-6 reps, max speed). Then compound primaries ' + athPrim + ' reps, supplementals ' + athSupp + ' reps, accessories ' + athAcc + ' reps.';

  } else if (goal === 'conditioning' || goal === 'general_health' || goal === 'lose_fat') {
    var condPrim = blockNum === 3 && hasStrengthSecondary ? '6-8' : hasStrengthSecondary ? '8-10' : null;
    var condAll = blockNum === 1 ? '12-15' : blockNum === 2 ? '15-20' : '15-20';
    if (hasStrengthSecondary) {
      repScheme = 'REP SCHEME (BLOCK ' + blockNum + '): First compound ' + condPrim + ' reps, all others ' + condAll + ' reps, 30-60 sec rest.';
    } else if (hasAthleticSecondary) {
      repScheme = 'REP SCHEME (BLOCK ' + blockNum + '): Speed/power opener 2 exercises. All remaining lifting ' + condAll + ' reps, 30-60 sec rest.';
    } else {
      repScheme = 'REP SCHEME (BLOCK ' + blockNum + '): All exercises ' + condAll + ' reps, moderate weight, 30-60 sec rest.';
    }

  } else {
    // build_muscle
    var primaryReps, suppReps2, isoReps;
    if (hasStrengthSecondary) {
      primaryReps = blockNum === 1 ? '5-8' : blockNum === 2 ? '4-6' : '3-5';
    } else if (hasAthleticSecondary) {
      primaryReps = blockNum === 1 ? '5-8' : '4-6';
    } else {
      primaryReps = blockNum === 1 ? '6-10' : blockNum === 2 ? '5-8' : '4-6';
    }
    suppReps2 = blockNum === 3 ? '8-10' : '8-12';
    isoReps = blockNum === 1 ? '12-15' : blockNum === 2 ? '15-20' : '15-25';

    var athleticRepNote = hasAthleticSecondary
      ? ' Speed/power block (2-3 exercises at start, 1-6 reps, max speed) precedes the hypertrophy work.'
      : '';

    repScheme = 'REP SCHEME (BLOCK ' + blockNum + '):' + athleticRepNote + '\n- Compound primaries (first 1-2 exercises): ' + primaryReps + ' reps, 2-3 min rest.\n- Compound supplementals: ' + suppReps2 + ' reps, 90 sec rest.\n- Isolation accessories (flys, raises, curls, extensions, etc.): ' + isoReps + ' reps minimum — NEVER below 12. 60-90 sec rest.\nISOLATION REP FLOOR: 12 reps absolute minimum for any isolation. Flys at 8 reps, curls at 8 reps = violation.';
  }

  // Block context note — what came before, so exercises can be rotated
  var blockContextNote = '';
  if (blockNum > 1 && previousBlockExercises && previousBlockExercises.length > 0) {
    var blockLabel = blockNum === 2 ? 'Block 1' : 'Blocks 1 and 2';
    blockContextNote = '\n\nEXERCISE ROTATION (BLOCK ' + blockNum + '): Rotate primary compound exercises from ' + blockLabel + ' to provide new stimulus. Previously used primaries: ' + previousBlockExercises.join(', ') + '. Do NOT repeat these as primary (first) exercises on any day in this block. Supplemental and accessory exercises may overlap freely.';
  }

  // Speed/power note for athletic performance
  var speedPowerNote = '';
  if (goal === 'athletic_performance' || goalSecondary === 'athletic_performance') {
    speedPowerNote = '\n\nSPEED & POWER (2-3 exercises at the START of each lifting day, before any other work):\n- 30-70% 1RM, move as fast as possible, 1-6 reps/set, 3-6 sets, 1-3 min rest\n- Exercises: power clean, hang clean, push press, speed squat, speed deadlift, KB swing, box jump, broad jump, med ball throw, plyo push-up\n- After speed/power work: complete the FULL lifting session at normal volume. Do not shorten the session.';
  }

  // Cardio day programming note — applies whenever cardio is in the program
  var cardioNote = '';
  if (hasCardio || splitType === 'UPPER LOWER CARDIO') {
    cardioNote = '\n\nCARDIO PROGRAMMING — Format each cardio modality as a separate exercise using EXACTLY these set/rep/rest conventions:\n- Zone 2 (aerobic base): sets=1, reps="20-40 min", rest="--", note="Conversational pace, 70-80% max HR. Incline walk, bike, or row."\n- VO2 Max (aerobic intervals): sets=number of intervals (e.g. 4), reps="4 min on", rest="4 min easy", note="85-95% max HR. Bike or rower."\n- Anaerobic (max effort intervals): sets=number of intervals (e.g. 8), reps="30 sec", rest="90 sec", note="Max effort, 95-100% max HR. Air bike, sled, or sprints."\nCRITICAL RULE: NEVER put VO2 Max intervals AND Anaerobic intervals on the same day — both are high intensity. A day may pair Zone 2 with EITHER VO2 Max OR Anaerobic, never both high-intensity modalities together.';
  }

  // Structure guide — only exercise patterns, no day counts (splitDesc handles that)
  var structureGuide;
  if (splitType === 'FULL BODY') {
    structureGuide = 'FULL BODY STRUCTURE: Each session hits every major muscle group. Rotate emphasis across days:\n- Day A emphasis: Horizontal push + hip-dominant lower + vertical pull. Accessories: 1 bicep (supinated curl or hammer curl), 1 tricep (pushdown or overhead extension — not both), 1 shoulder isolation.\n- Day B emphasis: Vertical push + quad-dominant lower + horizontal pull. Accessories: 1 bicep (different pattern from Day A), 1 tricep (different pattern from Day A), abs.\n- Day C emphasis (if 3+ days): Horizontal pull + hip-dominant lower + horizontal push. Accessories: 1 shoulder, 1 bicep, 1 tricep, abs.\nDIVERSITY RULE: No two accessories in the same session can use the same movement pattern. Bicep exercises must use different angles/grips from each other. Tricep exercises must use different angles (pushdown vs overhead) from each other.';
  } else if (splitType === 'UPPER LOWER' || splitType === 'UPPER LOWER CARDIO') {
    structureGuide = 'UPPER/LOWER STRUCTURE:\n- Upper A: Horizontal push/pull emphasis. Primary: 1 horizontal press + 1 horizontal row. Supplemental: 1 vertical pull, 1 front delt or lateral raise. Accessories: 1 bicep (supinated curl pattern), 1 tricep (pushdown pattern). Do NOT include rear delt work on Upper A.\n- Upper B: Vertical push/pull emphasis. Primary: 1 vertical press + 1 vertical pull. Supplemental: 1 horizontal press or chest isolation, 1 lateral raise. Accessories: 1 bicep (hammer curl or incline curl — different from Upper A), 1 tricep (overhead extension — different from Upper A). Do NOT include rear delt work on Upper B.\n- Lower A: Hip-dominant. Primary: 1 hip hinge (RDL, deadlift). Supplemental: 1 quad movement, 1 glute isolation. Accessories: 1 hamstring isolation, calves, 1 ab movement. NO sled or carries if a lunge variation is already programmed.\n- Lower B: Quad-dominant. Primary: 1 squat variation. Supplemental: 1 hip hinge variation, 1 glute work. Accessories: 1 leg extension or step-up, 1 hamstring curl, calves, abs.\nDIVERSITY RULE: On any given day, bicep accessories must use different movement patterns from each other, and tricep accessories must use different movement patterns from each other. Max 2 pressing movements per upper day total.';
  } else {
    // LOWER PULL PUSH — only used for 6 days no conditioning
    structureGuide = 'LOWER/PULL/PUSH STRUCTURE (6 days) — follow this composition exactly for each day:\n\n- Lower A (Hip-dominant): Primary = 1 hip hinge (deadlift, RDL, Romanian deadlift). Supplemental = 1 quad movement (leg press, hack squat, or lunge). Accessories = hamstring isolation, glute isolation, 1 ab movement, calves. NO sled, carries, or loaded locomotion on the same day as lunges.\n\n- Lower B (Quad-dominant): Primary = 1 squat variation (back squat, front squat, goblet squat). Supplemental = 1 hip hinge variation (lighter — RDL, good morning, or hip thrust). Accessories = leg extension or step-up, hamstring curl, calves, abs.\n\n- Pull A (Horizontal emphasis): Primary = 1 horizontal row (barbell row, cable row, chest-supported row, DB row). Supplemental = 1 vertical pull (lat pulldown or pull-up). Accessories = rear delt work, 1 trap movement, 2 bicep exercises (use DIFFERENT movement patterns — e.g. supinated curl + hammer curl, NOT two overhead or two cable curls).\n\n- Pull B (Vertical emphasis): Primary = 1 vertical pull (pull-ups or lat pulldown). Supplemental = 1 horizontal row variation (different from Pull A). Accessories = cable pullover or straight-arm pulldown, face pulls or rear delt fly, 2 bicep exercises (different patterns from each other and from Pull A accessories).\n\n- Push A (Horizontal emphasis): Primary = 1 horizontal press (bench press, DB press, or incline press). Supplemental = 1 additional chest movement at different angle (incline or decline). Accessories = lateral raises, 2 tricep exercises (use DIFFERENT movement patterns — e.g. pushdown + overhead extension is fine; two pushdowns or two overhead variations is NOT). Do NOT fill Push A with overhead or vertical pressing movements.\n\n- Push B (Vertical emphasis): Primary = 1 vertical press (overhead press or dumbbell shoulder press). Supplemental = 1 chest or horizontal push movement (flat DB press, cable press, or push-up variation — NOT another overhead press). Accessories = lateral raises, rear delt work, 2 tricep exercises (different patterns). Push B is NOT an all-shoulder day — it must include chest/horizontal push work in the supplemental slot.\n\nOrder: Lower A, Pull A, Push A, Lower B, Pull B, Push B.';
  }

  var injuryNote = intake.injuries_limitations ? '\nInjuries/limitations: ' + intake.injuries_limitations + ' — avoid these movements.' : '';
  var successNote = intake.success_vision ? '\nMember\'s personal goal: "' + intake.success_vision + '"' : '';

  // Session length → exercise count cap
  var sessionMins = parseInt(intake.session_length_mins) || 60;
  var exerciseCap;
  if (sessionMins <= 30) exerciseCap = '4-5';
  else if (sessionMins <= 45) exerciseCap = '5-6';
  else if (sessionMins <= 60) exerciseCap = '6-8';
  else if (sessionMins <= 90) exerciseCap = '8-10';
  else exerciseCap = '10-12';

  // Plyometric requirement for athletic performance
  var plyoNote = (goal === 'athletic_performance' || goalSecondary === 'athletic_performance')
    ? '\n8. PLYOMETRICS: Every lifting day must include at least 1 plyometric or explosive movement exercise (box jump, broad jump, lateral bound, med ball slam, med ball throw, plyo push-up, jump squat). These count as part of the speed/power block at the start of the session.'
    : '';

  var namingRule = '\n9. EXERCISE NAMES: Use only standard, widely-recognized exercise names. Never invent names by prepending equipment modifiers to existing exercises — "Ab Wheel Rollout" is always called "Ab Wheel Rollout" regardless of assistance used. If programming a variation, put the variation detail in the note field, not the exercise name.'
    + '\n10. MOVEMENT PATTERN DIVERSITY: Never program two exercises that are the same movement pattern performed with different implements in the same session. Examples of violations: overhead tricep extension + rope overhead extension (same pattern), pushdown + cable pushdown (same), two dumbbell curl variations (same plane), two lateral raise variations (same). Each exercise slot must train a distinct movement pattern or angle.'
    + '\n11. LOWER DAY LOCOMOTION: Never combine lunges (or any lunge variation) with sled push, sled pull, or loaded carries in the same session. These are all locomotive movements — pick one type per day. Sled work goes on its own as a finisher only if no lunge variation is already programmed.'
    + '\n12. PRESS STACKING: Maximum 2 pressing exercises per push day total — primary + one supplemental press at a different angle. All remaining slots must be non-press movements (triceps isolation, lateral raises, or other accessories). Machine press, dips, and cable press all count as press variations. A day with bench press + incline DB + machine press + dips has 4 presses — this is a hard violation regardless of session length.'
    + '\n13. DIPS CLASSIFICATION: Dips are a compound press movement, not a tricep isolation. They count toward the 2-press maximum and cannot be programmed on a day that already has 2 pressing movements. If dips are used, they replace the supplemental press slot, not an accessory slot.'
    + '\n14. NO REAR DELTS ON PUSH DAYS: Rear delt raises, face pulls, and rear delt flys are pulling movements. They belong exclusively on pull days. Never program them on push days under any circumstances.'
    + '\n15. ROW DIVERSITY: Maximum 2 rowing exercises per pull day. If 2 rows are programmed they must be from distinctly different angles or grips (e.g. barbell row + chest-supported row is acceptable; barbell row + cable row + DB row is a violation). A third row is never acceptable regardless of grip variation.'
    + '\n16. CROSS-DAY EXERCISE UNIQUENESS: No exercise name may appear on more than one day within the same block. If lateral raises appear on Push A, they cannot appear on Push B — use a different shoulder isolation (cable lateral raise, front raise, or upright row). If barbell bench appears on Push A, it cannot appear on Push B — use a different horizontal press (incline DB, cable press, etc.). This applies to all exercises across all days in the block.'
    + '\n17. CROSS-DAY MOVEMENT PATTERN VARIETY: Even when exercise names differ, avoid programming the same movement pattern on two push days or two pull days. For example: DB lateral raise on Push A and cable lateral raise on Push B is a violation — both are lateral raise patterns. Instead Push B should use a different shoulder movement entirely (front raise, upright row, or face pull). Vary the movement pattern, not just the implement.';

  var previousPrimariesNote = '';
  if (previousPrimaries && previousPrimaries.length > 0) {
    previousPrimariesNote = '\n\nEXERCISE VARIETY — NEW PROGRAM: This member just completed a full 12-week program. Do NOT use these exercises as primary compound movements — rotate to fresh variations: ' + previousPrimaries.join(', ') + '. Supplemental and accessory work may overlap freely.';
  }

  var weekLabel = blockNum === 1 ? '1-4' : blockNum === 2 ? '5-8' : '9-12';

  return 'Generate ONLY Block ' + blockNum + ' training as valid JSON. No text outside JSON.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + ', ' + (intake.experience_level || 'intermediate') + '. Equipment: ' + equipment + '.' + equipmentDetail + equipmentExclusions + ' Primary goal: ' + goal + '. Secondary goal: ' + (goalSecondary || 'none') + '. Session length: ' + (intake.session_length_mins || 60) + ' min.' + injuryNote + successNote + previousPrimariesNote + blockContextNote + '\n\nSPLIT INSTRUCTIONS (follow exactly):\n' + splitDesc + '\n\n' + repScheme + speedPowerNote + '\n\n' + structureGuide + cardioNote + '\n\nRULES:\n1. The "days" array must have EXACTLY ' + days + ' objects — count before outputting.\n2. Day names must be descriptive: "Upper A", "Lower B", "Cardio", "Full Body". Never "string" or "-".\n3. ' + equipment + ': home_bands/bodyweight_only = no machines; dumbbells_only = no barbells or machines.\n4. No repeated exercises within the same session.\n5. Bands = 12-30 reps minimum.\n6. Max 3 compound exercises per day (4 for full body/bodyweight days).\n7. SESSION LENGTH IS ' + sessionMins + ' MINUTES. Each day must have exactly ' + exerciseCap + ' exercises total — no more. Hard limit.\n8. Rest times: conditioning goal = 30-60 sec; hypertrophy = 60-90 sec isolation / 2-3 min compounds; strength = 3-5 min main lifts.' + plyoNote + namingRule + '\n\nOutput ONLY this JSON (no extra text):\n{"block":' + blockNum + ',"weeks":"' + weekLabel + '","days":[/* EXACTLY ' + days + ' day objects */]}\n\nDay object format: {"day":"Upper A","focus":"Horizontal push and pull","exercises":[{"name":"Barbell Bench Press","sets":4,"reps":"6-8","rir_week1":"3-4","rir_week2":"2-3","rir_week3":"1-2","rir_week4":"7-8 deload","rest":"2 min","note":"Control the descent"}]}';
}

// INGREDIENT LOOKUP TABLE — [protein_g, carbs_g, fat_g] per unit
// Unit is defined in the key name (per egg, per oz, per cup, per scoop, per tbsp, per link, per slice, per medium)
var INGREDIENTS = {
  // protein sources — per oz unless noted
  'egg':              { unit:'each',  p:6,    c:0.4,  f:5   },
  'egg_white':        { unit:'each',  p:3.6,  c:0.2,  f:0   },
  'chicken_breast':   { unit:'oz',    p:8.5,  c:0,    f:0.6 },
  'turkey_breast':    { unit:'oz',    p:8.0,  c:0,    f:0.7 },
  'salmon':           { unit:'oz',    p:7.0,  c:0,    f:2.2 },
  'ground_beef_90':   { unit:'oz',    p:7.0,  c:0,    f:2.5 },
  'tuna_canned':      { unit:'oz',    p:6.6,  c:0,    f:0.3 },
  'shrimp':           { unit:'oz',    p:6.0,  c:0,    f:0.3 },
  'turkey_sausage':   { unit:'link',  p:7.0,  c:0.5,  f:4.0 },
  'chicken_sausage':  { unit:'link',  p:6.0,  c:1.0,  f:3.5 },
  'lean_bacon':       { unit:'slice', p:3.0,  c:0,    f:2.5 },
  'whey_scoop':       { unit:'scoop', p:24,   c:3,    f:1   },
  'egg_protein_scoop':{ unit:'scoop', p:24,   c:2,    f:0.5 },
  'greek_yogurt':     { unit:'cup',   p:20,   c:8,    f:5   },
  'cottage_cheese':   { unit:'cup',   p:25,   c:6,    f:5   },
  // carb sources
  'oats':             { unit:'cup',   p:10,   c:54,   f:5   },
  'oats_half':        { unit:'half',  p:5,    c:27,   f:2.5 },
  'brown_rice':       { unit:'cup',   p:5,    c:45,   f:2   },
  'sweet_potato':     { unit:'med',   p:2,    c:26,   f:0   },
  'white_potato':     { unit:'med',   p:3,    c:37,   f:0   },
  'bread_wg':         { unit:'slice', p:4,    c:15,   f:1   },
  'banana':           { unit:'each',  p:1,    c:27,   f:0   },
  'berries':          { unit:'cup',   p:1,    c:14,   f:0.5 },
  'apple':            { unit:'each',  p:0.5,  c:25,   f:0   },
  'honey':            { unit:'tbsp',  p:0,    c:17,   f:0   },
  'granola':          { unit:'qcup',  p:3,    c:20,   f:4   },
  // fat sources
  'avocado_half':     { unit:'half',  p:1,    c:6,    f:11  },
  'peanut_butter':    { unit:'tbsp',  p:3.5,  c:3.5,  f:8   },
  'almond_butter':    { unit:'tbsp',  p:3,    c:3,    f:9   },
  'olive_oil':        { unit:'tbsp',  p:0,    c:0,    f:14  },
  'whole_milk':       { unit:'cup',   p:8,    c:12,   f:8   },
  'almond_milk':      { unit:'cup',   p:1,    c:1,    f:3   },
  'cheese_oz':        { unit:'oz',    p:7,    c:0.5,  f:9   },
  'spinach':          { unit:'cup',   p:1,    c:1,    f:0   },
  'broccoli':         { unit:'cup',   p:2.5,  c:6,    f:0   },
  'asparagus':        { unit:'cup',   p:2.5,  c:4,    f:0   }
};

function calcMacros(ingredients) {
  // ingredients is array of {id, qty}
  var p = 0, c = 0, f = 0;
  ingredients.forEach(function(ing) {
    var item = INGREDIENTS[ing.id];
    if (!item) return;
    p += item.p * ing.qty;
    c += item.c * ing.qty;
    f += item.f * ing.qty;
  });
  return {
    protein_g: Math.round(p),
    carbs_g:   Math.round(c),
    fat_g:     Math.round(f),
    calories:  Math.round(p*4 + c*4 + f*9)
  };
}

function buildDescription(ingredients) {
  var unitLabels = {
    'egg':             function(q) { return q + (q===1?' egg':' eggs'); },
    'egg_white':       function(q) { return q + (q===1?' egg white':' egg whites'); },
    'chicken_breast':  function(q) { return q + 'oz chicken breast'; },
    'turkey_breast':   function(q) { return q + 'oz turkey breast'; },
    'salmon':          function(q) { return q + 'oz salmon'; },
    'ground_beef_90':  function(q) { return q + 'oz ground beef (90/10)'; },
    'tuna_canned':     function(q) { return q + 'oz canned tuna'; },
    'shrimp':          function(q) { return q + 'oz shrimp'; },
    'turkey_sausage':  function(q) { return q + (q===1?' turkey sausage link':' turkey sausage links'); },
    'chicken_sausage': function(q) { return q + (q===1?' chicken sausage link':' chicken sausage links'); },
    'lean_bacon':      function(q) { return q + (q===1?' slice lean bacon':' slices lean bacon'); },
    'whey_scoop':      function(q) { return q + (q===1?' scoop whey protein':' scoops whey protein'); },
    'egg_protein_scoop': function(q) { return q + (q===1?' scoop egg white protein':' scoops egg white protein'); },
    'greek_yogurt':    function(q) { return q + (q===1?' cup Greek yogurt':' cups Greek yogurt'); },
    'cottage_cheese':  function(q) { return q + (q===1?' cup cottage cheese':' cups cottage cheese'); },
    'oats':            function(q) { return q + (q===1?' cup oats':' cups oats'); },
    'oats_half':       function(q) { return '1/2 cup oats'; },
    'brown_rice':      function(q) { return q + (q===1?' cup cooked brown rice':' cups cooked brown rice'); },
    'sweet_potato':    function(q) { return q + (q===1?' medium sweet potato':' medium sweet potatoes'); },
    'white_potato':    function(q) { return q + (q===1?' medium potato':' medium potatoes'); },
    'bread_wg':        function(q) { return q + (q===1?' slice whole grain bread':' slices whole grain bread'); },
    'banana':          function(q) { return q + (q===1?' banana':' bananas'); },
    'berries':         function(q) { return q + (q===1?' cup berries':' cups berries'); },
    'apple':           function(q) { return q + (q===1?' apple':' apples'); },
    'honey':           function(q) { return q + (q===1?' tbsp honey':' tbsp honey'); },
    'granola':         function(q) { return q + ' 1/4 cup granola'; },
    'avocado_half':    function(q) { return q===1 ? '1/2 avocado' : q + ' avocado halves'; },
    'peanut_butter':   function(q) { return q + (q===1?' tbsp peanut butter':' tbsp peanut butter'); },
    'almond_butter':   function(q) { return q + (q===1?' tbsp almond butter':' tbsp almond butter'); },
    'olive_oil':       function(q) { return q + (q===1?' tbsp olive oil':' tbsp olive oil'); },
    'whole_milk':      function(q) { return q + (q===1?' cup whole milk':' cups whole milk'); },
    'almond_milk':     function(q) { return q + (q===1?' cup almond milk':' cups almond milk'); },
    'cheese_oz':       function(q) { return q + 'oz cheese'; },
    'spinach':         function(q) { return q + (q===1?' cup spinach':' cups spinach'); },
    'broccoli':        function(q) { return q + (q===1?' cup broccoli':' cups broccoli'); },
    'asparagus':       function(q) { return q + (q===1?' cup asparagus':' cups asparagus'); }
  };
  return ingredients.map(function(ing) {
    var fn = unitLabels[ing.id];
    if (fn) return fn(ing.qty);
    return ing.qty + ' ' + ing.id;
  }).join(' + ');
}


function buildNutritionSleepPrompt(intake, profile, days, proteinTarget, calorieTarget, carbsTraining, carbsRest, fatTraining, fatRest) {
  var name = profile.full_name || profile.first_name || 'Member';
  var sleepTime = intake.typical_bedtime || 'not specified';
  var wakeTime = intake.typical_wake_time || 'not specified';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var restrictions = (intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none';
  var foodsToAvoid = intake.foods_to_avoid || 'none';
  var foodPreferences = intake.food_preferences ? ' Food preferences: ' + intake.food_preferences + '.' : '';

  // Build restricted ingredient set so we never offer them to Claude
  var restrictedIds = [];
  var restrictionStr = restrictions.toLowerCase();
  if (restrictionStr.includes('dairy')) {
    restrictedIds = restrictedIds.concat(['greek_yogurt','cottage_cheese','whole_milk','cheese_oz']);
  }
  if (restrictionStr.includes('vegan') || restrictionStr.includes('vegetarian')) {
    restrictedIds = restrictedIds.concat(['chicken_breast','turkey_breast','salmon','ground_beef_90',
      'tuna_canned','shrimp','turkey_sausage','chicken_sausage','lean_bacon','whey_scoop','egg_protein_scoop']);
  }
  if (restrictionStr.includes('no red meat')) {
    restrictedIds = restrictedIds.concat(['ground_beef_90']);
  }
  if (restrictionStr.includes('no pork')) {
    restrictedIds = restrictedIds.concat(['lean_bacon']);
  }
  if (restrictionStr.includes('pescatarian')) {
    restrictedIds = restrictedIds.concat(['chicken_breast','turkey_breast','ground_beef_90',
      'turkey_sausage','chicken_sausage','lean_bacon']);
  }
  // Also parse foods_to_avoid freetext for common dairy/restriction terms
  var avoidLower = foodsToAvoid.toLowerCase();
  // If whey is avoided, restrict it and use egg protein instead
  if (avoidLower.includes('whey') || avoidLower.includes('protein powder')) {
    restrictedIds = restrictedIds.concat(['whey_scoop']);
  }
  if (avoidLower.includes('dairy') || avoidLower.includes('milk') || avoidLower.includes('yogurt') || avoidLower.includes('cheese')) {
    restrictedIds = restrictedIds.concat(['greek_yogurt','cottage_cheese','whole_milk','cheese_oz']);
  }

  // Per-meal protein targets
  var pBreakfast = Math.round(proteinTarget * 0.20);
  var pShake     = Math.round(proteinTarget * 0.18);
  var pLunch     = Math.round(proteinTarget * 0.27);
  var pDinner    = Math.round(proteinTarget * 0.28);
  var pDessert   = proteinTarget - pBreakfast - pShake - pLunch - pDinner;

  // Per-meal carb targets (training day)
  var cBT  = Math.round(carbsTraining * 0.28); // breakfast
  var cST  = Math.round(carbsTraining * 0.22); // shake
  var cLT  = Math.round(carbsTraining * 0.28); // lunch
  var cDT  = Math.round(carbsTraining * 0.14); // dinner
  var cDeT = carbsTraining - cBT - cST - cLT - cDT; // dessert

  // Per-meal carb targets (rest day)
  var cBR  = Math.round(carbsRest * 0.30);
  var cSR  = Math.round(carbsRest * 0.20);
  var cLR  = Math.round(carbsRest * 0.25);
  var cDR  = Math.round(carbsRest * 0.15);
  var cDeR = carbsRest - cBR - cSR - cLR - cDR;

  // Per-meal fat targets (training day)
  var fBT  = Math.round(fatTraining * 0.25);
  var fST  = Math.round(fatTraining * 0.15);
  var fLT  = Math.round(fatTraining * 0.20);
  var fDT  = Math.round(fatTraining * 0.30);
  var fDeT = fatTraining - fBT - fST - fLT - fDT;

  // Per-meal fat targets (rest day — higher fat overall)
  var fBR  = Math.round(fatRest * 0.22);
  var fSR  = Math.round(fatRest * 0.12);
  var fLR  = Math.round(fatRest * 0.25);
  var fDR  = Math.round(fatRest * 0.32);
  var fDeR = fatRest - fBR - fSR - fLR - fDR;

  // Carb quantity guidance
  var oatsCupsBreakfast  = Math.round(cBT / 54 * 10) / 10;  // approx cups oats
  var riceCupsLunch      = Math.round(cLT / 45 * 10) / 10;  // approx cups rice
  var pbTbspShake        = Math.round(fST / 8);              // approx tbsp peanut butter

  // All ingredients with macros
  var allIngredientLines = [
    '  egg (each): 6p/0c/5f',
    '  egg_white (each): 4p/0c/0f',
    '  chicken_breast (oz): 8.5p/0c/0.6f',
    '  turkey_breast (oz): 8p/0c/0.7f',
    '  salmon (oz): 7p/0c/2.2f',
    '  ground_beef_90 (oz): 7p/0c/2.5f',
    '  tuna_canned (oz): 6.6p/0c/0.3f',
    '  shrimp (oz): 6p/0c/0.3f',
    '  turkey_sausage (link): 7p/0.5c/4f',
    '  chicken_sausage (link): 6p/1c/3.5f',
    '  lean_bacon (slice): 3p/0c/2.5f',
    '  whey_scoop (scoop): 24p/3c/1f',
    '  egg_protein_scoop (scoop): 24p/2c/0.5f',
    '  greek_yogurt (cup): 20p/8c/5f',
    '  cottage_cheese (cup): 25p/6c/5f',
    '  oats (cup): 10p/54c/5f',
    '  oats_half (half): 5p/27c/2.5f',
    '  brown_rice (cup): 5p/45c/2f',
    '  sweet_potato (med): 2p/26c/0f',
    '  white_potato (med): 3p/37c/0f',
    '  bread_wg (slice): 4p/15c/1f',
    '  banana (each): 1p/27c/0f',
    '  berries (cup): 1p/14c/0.5f',
    '  apple (each): 0.5p/25c/0f',
    '  honey (tbsp): 0p/17c/0f',
    '  granola (qcup): 3p/20c/4f',
    '  avocado_half (half): 1p/6c/11f',
    '  peanut_butter (tbsp): 3.5p/3.5c/8f',
    '  almond_butter (tbsp): 3p/3c/9f',
    '  olive_oil (tbsp): 0p/0c/14f',
    '  whole_milk (cup): 8p/12c/8f',
    '  almond_milk (cup): 1p/1c/3f',
    '  cheese_oz (oz): 7p/0.5c/9f',
    '  spinach (cup): 1p/1c/0f',
    '  broccoli (cup): 2.5p/6c/0f',
    '  asparagus (cup): 2.5p/4c/0f'
  ];

  // Filter out restricted ingredients from the list Claude sees
  var ingredientLines = allIngredientLines.filter(function(line) {
    return !restrictedIds.some(function(id) { return line.trim().startsWith(id + ' '); });
  });

  // Pick safe defaults for example templates based on restrictions
  var safeYogurt   = restrictedIds.indexOf('greek_yogurt') === -1 ? 'greek_yogurt' : 'cottage_cheese';
  var safeMilk     = restrictedIds.indexOf('whole_milk') === -1 ? 'whole_milk' : 'almond_milk';
  var safeChicken  = restrictedIds.indexOf('chicken_breast') === -1 ? 'chicken_breast' : 'salmon';
  var safeSalmon   = restrictedIds.indexOf('salmon') === -1 ? 'salmon' : 'tuna_canned';
  // If both dairy and whey are restricted (vegan), use egg_white as protein base for shake
  var shakeProtein = restrictedIds.indexOf('whey_scoop') === -1 ? '{"id":"whey_scoop","qty":2}' : '{"id":"egg_protein_scoop","qty":2}';
  var shakeYogurt  = restrictedIds.indexOf('greek_yogurt') === -1 ? ',{"id":"greek_yogurt","qty":0.5}' : '';

  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Richer example templates
  var dayTemplate = function(d, type) {
    var isT = type === 'training';
    return '{"day":"' + d + '","type":"' + type + '",' +
      '"breakfast":[{"id":"egg","qty":4},{"id":"turkey_sausage","qty":2}' + (isT ? ',{"id":"oats_half","qty":1},{"id":"berries","qty":1}' : ',{"id":"avocado_half","qty":1}') + '],' +
      '"shake":[' + shakeProtein + ',{"id":"' + safeMilk + '","qty":1},{"id":"banana","qty":1},{"id":"peanut_butter","qty":1}' + shakeYogurt + '],' +
      '"lunch":[{"id":"' + safeChicken + '","qty":8}' + (isT ? ',{"id":"brown_rice","qty":1},{"id":"broccoli","qty":1}' : ',{"id":"avocado_half","qty":1},{"id":"spinach","qty":2},{"id":"olive_oil","qty":1}') + '],' +
      '"dinner":[{"id":"' + safeSalmon + '","qty":8},{"id":"asparagus","qty":1}' + (isT ? ',{"id":"sweet_potato","qty":1}' : ',{"id":"olive_oil","qty":1}') + '],' +
      '"dessert":[{"id":"' + safeYogurt + '","qty":1},{"id":"berries","qty":1},{"id":"honey","qty":1}]}';
  };
  var dayTemplates = [];
  // Training day schedule by day count
  // Index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  var trainingSchedules = {
    2: [true, false, false, true, false, false, false],   // Mon, Thu
    3: [true, false, true, false, true, false, false],    // Mon, Wed, Fri
    4: [true, true, false, true, true, false, false],     // Mon, Tue, Thu, Fri
    5: [true, true, true, true, true, false, false],      // Mon-Fri
    6: [true, true, true, true, true, true, false]        // Mon-Sat
  };
  var schedule = trainingSchedules[days] || trainingSchedules[4];

  for (var d = 0; d < 7; d++) dayTemplates.push(dayTemplate(dayNames[d], schedule[d] ? 'training' : 'rest'));

  var restrictionWarning = restrictedIds.length > 0
    ? '\n\nHARD RESTRICTION — NEVER USE THESE INGREDIENTS: ' + restrictedIds.join(', ') + '. These are excluded due to dietary restrictions. Do not include them in any meal on any day.'
    : '';

  return 'Choose ingredients for a 7-day meal plan. Return ONLY valid JSON, no other text.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + '. Goal: ' + intake.goal_primary + '. Restrictions: ' + restrictions + '. Avoid: ' + foodsToAvoid + '.' + foodPreferences + restrictionWarning + '\n\nDAILY TARGETS: ' + proteinTarget + 'g protein | Training: ' + carbsTraining + 'g carbs / ' + fatTraining + 'g fat | Rest: ' + carbsRest + 'g carbs / ' + fatRest + 'g fat\n\nPER-MEAL TARGETS (training day / rest day):\n  breakfast:  ~' + pBreakfast + 'g protein | ~' + cBT + 'g carbs (T) / ~' + cBR + 'g carbs (R) | ~' + fBT + 'g fat (T) / ~' + fBR + 'g fat (R)\n  shake:      ~' + pShake + 'g protein | ~' + cST + 'g carbs (T) / ~' + cSR + 'g carbs (R) | ~' + fST + 'g fat (T) / ~' + fSR + 'g fat (R)\n  lunch:      ~' + pLunch + 'g protein | ~' + cLT + 'g carbs (T) / ~' + cLR + 'g carbs (R) | ~' + fLT + 'g fat (T) / ~' + fLR + 'g fat (R)\n  dinner:     ~' + pDinner + 'g protein | ~' + cDT + 'g carbs (T) / ~' + cDR + 'g carbs (R) | ~' + fDT + 'g fat (T) / ~' + fDR + 'g fat (R)\n  dessert:    ~' + pDessert + 'g protein | ~' + cDeT + 'g carbs (T) / ~' + cDeR + 'g carbs (R) | ~' + fDeT + 'g fat (T) / ~' + fDeR + 'g fat (R)\n\nAVAILABLE INGREDIENT IDs (macros per unit, format p/c/f) — ONLY use IDs from this list:\n' + ingredientLines.join('\n') + '\n\nQUANTITY GUIDANCE — use these as starting points for hitting targets:\nPROTEIN: ' + pLunch + 'g at lunch = chicken_breast qty ' + Math.round(pLunch/8.5) + ', or salmon qty ' + Math.round(pLunch/7) + ', or ground_beef_90 qty ' + Math.round(pLunch/7) + '. ' + pDinner + 'g at dinner = similar. ' + pBreakfast + 'g at breakfast = ' + Math.round(pBreakfast/6) + ' eggs, or eggs + turkey_sausage combo.\nCARBS (training): ' + cBT + 'g at breakfast = oats qty ' + Math.round(cBT/54*10)/10 + ' cup' + (cBT > 54 ? 's' : '') + (cBT > 27 ? '' : ' (use oats_half for ~27g)') + '. ' + cLT + 'g at lunch = brown_rice qty ' + Math.round(cLT/45*10)/10 + ' cup' + (cLT > 45 ? 's' : '') + ', or sweet_potato qty ' + Math.round(cLT/26) + '. ' + cST + 'g in shake = banana qty ' + Math.round(cST/27) + (cST > 40 ? ' + berries qty 1' : '') + '.\nFAT (training): ' + fBT + 'g at breakfast comes from eggs naturally, or add avocado_half (11f) or peanut_butter (8f per tbsp). ' + fDT + 'g at dinner = salmon naturally has fat, or add olive_oil qty ' + Math.round(fDT/14) + '.\nFAT (rest day): ' + fLR + 'g at lunch = avocado_half (11f) + olive_oil qty ' + Math.round((fLR-11)/14) + '. ' + fDR + 'g at dinner = fatty fish or add olive_oil.\n\nRULES:\n1. For each meal output an array of {id, qty} objects — qty is always a positive number. Only use ingredient IDs from the list above.\n2. BUILD COMPLETE MEALS with 3-5 ingredients each: protein source + carb source (training days) + vegetable or fruit + fat source + optional flavor item.\n3. VARY every day: rotate protein sources (chicken one day, salmon next, beef next), rotate carbs (rice vs sweet potato vs oats), rotate vegetables.\n4. BREAKFAST: eggs and/or ' + (restrictedIds.indexOf('greek_yogurt') === -1 ? 'greek_yogurt' : 'cottage_cheese') + ' required. Add turkey_sausage or chicken_sausage for more protein. Training days: oats or bread_wg for carbs + fruit. Rest days: avocado or nut butter instead of starch.\n5. SHAKE: ' + (restrictedIds.indexOf('whey_scoop') === -1 ? 'whey_scoop' : 'egg_protein_scoop') + ' qty 1-2 + ' + safeMilk + ' + banana or berries + peanut_butter or almond_butter.\n6. LUNCH: big protein qty to hit target + starchy carb on training days (brown_rice, sweet_potato, white_potato) + vegetable (broccoli, asparagus, spinach). Rest days: replace starch with avocado_half and olive_oil.\n7. DINNER: big protein + vegetable + small carb on training days. Rest days: more fat, no starch.\n8. DESSERT: ' + (restrictedIds.indexOf('greek_yogurt') === -1 ? 'greek_yogurt' : 'berries') + ' or cottage_cheese base + berries + honey or granola.\n\nSLEEP PROTOCOL — one consistent protocol:\nBedtime: ' + sleepTime + '. Wake: ' + wakeTime + '. Issue: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_in_bedroom=' + phone + '.\nMorning: get up immediately, outdoor sunlight 10-30 min, early movement, cold shower 1-3 min morning only if sleep issues.\nEvening: lower lights after sunset, limit electronics 1-2hr before bed, hot bath/shower 60-90min before bed, stretching, slow exhale breathing, no large meals 2-3hr before bed.\nEnvironment: 60-68F, complete darkness, fan.\nSupplements if sleep issues: magnesium glycinate or apigenin. NEVER melatonin.\n\nOutput ONLY this JSON (replace all example ingredient arrays with your actual picks for each day):\n{"meal_ingredients":[' + dayTemplates.join(',') + '],"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]}}';
}


// Convert Claude ingredient picks into full meal plan with JS-calculated macros
function buildMealPlanFromIngredients(mealIngredients, days, proteinTarget, calorieTarget) {
  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var mealKeys = ['breakfast', 'shake', 'lunch', 'dinner', 'dessert'];
  var trainingSchedules = {
    2: [true, false, false, true, false, false, false],
    3: [true, false, true, false, true, false, false],
    4: [true, true, false, true, true, false, false],
    5: [true, true, true, true, true, false, false],
    6: [true, true, true, true, true, true, false]
  };
  var schedule = trainingSchedules[days] || trainingSchedules[4];

  return mealIngredients.map(function(day, i) {
    var isTraining = schedule[i] !== undefined ? schedule[i] : i < days;
    var meals = {};
    var dayTotal = 0;

    mealKeys.forEach(function(meal) {
      var ingredients = day[meal] || [];
      if (!Array.isArray(ingredients)) ingredients = [];
      var macros = calcMacros(ingredients);
      var desc = buildDescription(ingredients);
      meals[meal] = {
        description: desc,
        protein_g:   macros.protein_g,
        carbs_g:     macros.carbs_g,
        fat_g:       macros.fat_g,
        calories:    macros.calories
      };
      dayTotal += macros.calories;
    });

    return {
      day:       day.day || dayNames[i],
      type:      isTraining ? 'training' : 'rest',
      breakfast: meals.breakfast,
      shake:     meals.shake,
      lunch:     meals.lunch,
      dinner:    meals.dinner,
      dessert:   meals.dessert,
      day_total: dayTotal
    };
  });
}



function repairJson(str) {
  var opens = [];
  var inString = false;
  var escape = false;
  var lastGoodPos = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; if (!inString) lastGoodPos = i + 1; continue; }
    if (inString) continue;
    if (c === '{' || c === '[') opens.push(c);
    if (c === '}' || c === ']') { opens.pop(); lastGoodPos = i + 1; }
    if (c !== ' ' && c !== '\n' && c !== '\r' && c !== '\t') lastGoodPos = i + 1;
  }
  var result = str.substring(0, lastGoodPos).replace(/,\s*$/, '');
  for (var j = opens.length - 1; j >= 0; j--) result += opens[j] === '{' ? '}' : ']';
  return result;
}

function cleanAndParse(text) {
  var match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  var str = match[0]
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/,(\s*[}\]])/g, '$1');
  try { return JSON.parse(str); }
  catch(e) {
    try { return JSON.parse(repairJson(str)); }
    catch(e2) { throw new Error('JSON parse failed: ' + e.message); }
  }
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function callClaude(prompt, attempt) {
  attempt = attempt || 1;
  var response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  // Handle rate limit with one automatic retry after 65 seconds
  if (response.status === 429 && attempt < 3) {
    console.log('Rate limit hit, waiting 65 seconds before retry (attempt ' + attempt + ')...');
    await sleep(65000);
    return callClaude(prompt, attempt + 1);
  }

  if (!response.ok) {
    var err = await response.text();
    throw new Error('API failed: ' + err);
  }
  var data = await response.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}

async function getPreviousPrimaryExercises(supabase, userId) {
  try {
    // Fetch last 2 completed programs (excludes current generating one)
    var result = await supabase
      .from('generated_programs')
      .select('training_program, program_type, generated_at')
      .eq('user_id', userId)
      .eq('status', 'ready')
      .order('generated_at', { ascending: false })
      .limit(2);

    if (result.error || !result.data || result.data.length === 0) return null;

    var allPrimaries = [];

    result.data.forEach(function(prog) {
      try {
        var tp = prog.training_program;
        if (!tp || !tp.blocks) return;
        tp.blocks.forEach(function(block) {
          if (!block.days) return;
          block.days.forEach(function(day) {
            if (!day.exercises || day.exercises.length === 0) return;
            // First exercise per day = primary compound
            var primary = day.exercises[0];
            if (primary && primary.name && allPrimaries.indexOf(primary.name) === -1) {
              allPrimaries.push(primary.name);
            }
          });
        });
      } catch(e) {}
    });

    return allPrimaries.length > 0 ? allPrimaries : null;
  } catch(e) {
    console.error('Error fetching previous exercises:', e);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var userId = req.body.userId;
  var intakeData = req.body.intake;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  var supabase = getSupabase();

  try {
    var intake = intakeData;
    var profile = {};

    if (!intake) {
      var intakeRes = await supabase.from('intake_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).single();
      if (intakeRes.error || !intakeRes.data) return res.status(404).json({ error: 'Intake not found' });
      intake = intakeRes.data;
    }

    var profileRes = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileRes.data) profile = profileRes.data;

    var days = parseInt(intake.training_days_per_week) || 4;
    var currentWeight = parseFloat(intake.current_weight_lbs) || 180;
    var idealWeight = parseFloat(intake.ideal_weight_lbs) || currentWeight;
    var proteinTarget = Math.round(idealWeight);
    var proteinPerMeal = Math.round(proteinTarget / 5);

    // Mifflin-St Jeor TDEE calculation
    var weightKg = currentWeight * 0.453592;
    var heightFt = parseFloat(intake.height_ft) || 5;
    var heightIn = parseFloat(intake.height_in) || 10;
    var heightCm = ((heightFt * 12) + heightIn) * 2.54;
    var age = parseFloat(intake.age) || 30;
    var sex = intake.sex || 'male';

    var bmr;
    if (sex === 'female') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    }

    // Activity multiplier based on training days
    var activityMultiplier;
    if (days <= 2) activityMultiplier = 1.375;
    else if (days <= 3) activityMultiplier = 1.465;
    else if (days <= 4) activityMultiplier = 1.55;
    else if (days <= 5) activityMultiplier = 1.637;
    else activityMultiplier = 1.725;

    var tdee = Math.round(bmr * activityMultiplier);

    // Calorie adjustment — weight_management_goal takes priority over goal inference
    var calorieTarget;
    var weightMgmtGoal = intake.weight_management_goal || '';
    if (weightMgmtGoal === 'cut') calorieTarget = tdee - 400;
    else if (weightMgmtGoal === 'bulk') calorieTarget = tdee + 300;
    else if (weightMgmtGoal === 'maintain') calorieTarget = tdee;
    else if (goal === 'lose_fat') calorieTarget = tdee - 400;
    else if (goal === 'build_muscle' || goal === 'build_strength') calorieTarget = tdee + 300;
    else if (goal === 'conditioning' || goal === 'general_health') calorieTarget = tdee;
    else calorieTarget = tdee + 200;

    var calorieFloor = (sex === 'female') ? 1200 : 1500;
    calorieTarget = Math.max(calorieTarget, calorieFloor);
    var proteinCals = proteinTarget * 4;
    var remainingCals = calorieTarget - proteinCals;

    // Training day: 50% remaining to carbs, 50% to fat
    // Rest day: 30% to carbs, 70% to fat (same total calories)
    var carbsTraining = Math.round((remainingCals * 0.55) / 4);
    var carbsRest = Math.round((remainingCals * 0.30) / 4);
    var fatTraining = Math.round((remainingCals * 0.45) / 9);
    var fatRest = Math.round((remainingCals * 0.70) / 9);

    var goal = intake.goal_primary || 'build_muscle';
    var goalSecondary = intake.goal_secondary || '';
    var conditioningGoals = ['conditioning', 'general_health', 'lose_fat'];
    var isPrimaryConditioning = conditioningGoals.indexOf(goal) !== -1;
    var isSecondaryConditioning = conditioningGoals.indexOf(goalSecondary) !== -1;
    var isAnyConditioning = isPrimaryConditioning || isSecondaryConditioning;
    var isBeginner = (intake.experience_level || '') === 'beginner';

    var splitType, splitDesc;
    var isAthletic = goal === 'athletic_performance' || goalSecondary === 'athletic_performance';
    var athleticSuffix = isAthletic ? ' IMPORTANT: Each lifting day must start with 2-3 speed/power exercises (power clean, hang clean, KB swing, push press, box jump, speed squat, speed deadlift, med ball throw — pick appropriate ones). These go FIRST before any strength work. After speed/power, complete the full normal session at regular volume.' : '';

    if (days <= 2) {
      splitType = 'FULL BODY';
      if (isAnyConditioning) {
        splitDesc = 'GENERATE EXACTLY 2 DAY OBJECTS per block. Full body lifting both days, each ending with a 15 min cardio finisher. Day 1 finisher: Zone 2 (15 min incline walk or bike). Day 2 finisher: VO2 Max (3 x 4 min hard / 4 min easy). Structure per day: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2 accessories.';
      } else {
        splitDesc = 'GENERATE EXACTLY 2 DAY OBJECTS per block. Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
      }
    } else if (days === 3) {
      if (isPrimaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        if (isBeginner) {
          splitDesc = 'GENERATE EXACTLY 3 DAY OBJECTS per block: Day 1 = Full Body lifting, Day 2 = Cardio only (no lifting), Day 3 = Full Body lifting. Cardio day: 30 min Zone 2 + 3 x 4 min VO2 Max (Zone 2 first, then VO2 Max intervals). Full body: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2-3 accessories.';
        } else {
          splitDesc = 'GENERATE EXACTLY 3 DAY OBJECTS per block: Day 1 = Upper body lifting, Day 2 = Cardio only (no lifting), Day 3 = Lower body lifting. Cardio day: 30 min Zone 2 followed by 4 x 4 min VO2 Max intervals (4 min easy between). Do NOT include anaerobic/sprint intervals on this day.';
        }
      } else if (isSecondaryConditioning) {
        splitType = 'FULL BODY';
        splitDesc = 'GENERATE EXACTLY 3 DAY OBJECTS per block. Full body lifting all 3 days, each ending with a 15 min cardio finisher. Day 1 finisher: Zone 2. Day 2 finisher: VO2 Max. Day 3 finisher: Anaerobic. Structure: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2-3 accessories.';
      } else {
        splitType = 'FULL BODY';
        splitDesc = 'GENERATE EXACTLY 3 DAY OBJECTS per block. Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
      }
    } else if (days === 4) {
      if (isPrimaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 4 DAY OBJECTS per block: Day 1 = Upper lifting, Day 2 = Lower lifting, Day 3 = Cardio only (no lifting), Day 4 = Cardio only (no lifting). Cardio day 3: 30 min Zone 2 + 4 x 4 min VO2 Max intervals (Zone 2 first). Cardio day 4: 8 x 30 sec Anaerobic max effort / 90 sec rest. Days 3 and 4 must use different modalities — no VO2 Max and Anaerobic on the same day.';
      } else if (isSecondaryConditioning) {
        splitType = 'UPPER LOWER';
        splitDesc = 'GENERATE EXACTLY 4 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Upper B, Day 4 = Lower B. Each session ends with a 15 min cardio finisher (Upper A = Zone 2, Lower A = VO2 Max, Upper B = Zone 2, Lower B = Anaerobic). Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      } else {
        splitType = 'UPPER LOWER';
        splitDesc = 'GENERATE EXACTLY 4 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Upper B, Day 4 = Lower B. Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      }
    } else if (days === 5) {
      // 5-day NEVER uses Lower/Pull/Push — always Upper/Lower/Cardio or Full Body/Cardio
      if (isPrimaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 5 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Cardio only (no lifting), Day 4 = Upper B, Day 5 = Lower B. Cardio day 3: 30 min Zone 2 + 4 x 4 min VO2 Max intervals. Do NOT include anaerobic/sprint intervals on the same day as VO2 Max intervals — they must be on separate days.';
      } else if (isSecondaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 5 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Cardio only (no lifting), Day 4 = Upper B, Day 5 = Lower B. Cardio day: 30 min Zone 2 + 3 x 4 min VO2 Max. Each lifting day ends with a 10 min cardio finisher.';
      } else {
        splitType = 'UPPER LOWER';
        splitDesc = 'GENERATE EXACTLY 5 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Upper B, Day 4 = Lower B, Day 5 = Full Body (lighter, higher rep accessory focus). Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      }
    } else {
      // 6 days
      if (isAnyConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 6 DAY OBJECTS per block: Day 1 = Upper A, Day 2 = Lower A, Day 3 = Cardio only (no lifting), Day 4 = Upper B, Day 5 = Lower B, Day 6 = Cardio only (no lifting). Cardio day 3: Zone 2 + VO2 Max. Cardio day 6: Anaerobic intervals.';
      } else {
        splitType = 'LOWER PULL PUSH';
        splitDesc = 'GENERATE EXACTLY 6 DAY OBJECTS per block: Day 1 = Lower A, Day 2 = Pull A, Day 3 = Push A, Day 4 = Lower B, Day 5 = Pull B, Day 6 = Push B. LOWER = quads/hamstrings/glutes/calves/abs. PULL = lats/traps/rear delts/biceps. PUSH = chest/front delts/triceps.';
      }
    }

    splitDesc = splitDesc + athleticSuffix;

    // Create pending record
    var insertResult = await supabase.from('generated_programs').insert({
      user_id: userId, status: 'generating', generation_month: new Date().toISOString().slice(0, 7)
    }).select().single();
    var programId = insertResult.data ? insertResult.data.id : null;

    // Fetch previous primary exercises for variety — only when explicitly requested (new program after block 3)
    var isNewProgram = req.body.isNewProgram || false;
    var previousPrimaries = null;
    if (isNewProgram) {
      previousPrimaries = await getPreviousPrimaryExercises(supabase, userId);
      console.log('Previous primaries found:', previousPrimaries ? previousPrimaries.length : 0);
    }

    var nutritionPrompt = buildNutritionSleepPrompt(intake, profile, days, proteinTarget, calorieTarget, carbsTraining, carbsRest, fatTraining, fatRest);

    // Generate 3 blocks sequentially — one API call per block to prevent truncation
    function extractPrimaries(blockData) {
      var primaries = [];
      if (!blockData || !blockData.days) return primaries;
      blockData.days.forEach(function(day) {
        if (day.exercises && day.exercises[0] && day.exercises[0].name) {
          if (primaries.indexOf(day.exercises[0].name) === -1) {
            primaries.push(day.exercises[0].name);
          }
        }
      });
      return primaries;
    }

    var block1Prompt = buildTrainingPrompt(intake, profile, days, splitType, splitDesc, isAnyConditioning, previousPrimaries, 1, []);
    var block1Result = await callClaude(block1Prompt);
    var block1Data = cleanAndParse(block1Result);
    var block1Primaries = extractPrimaries(block1Data);

    await sleep(1000);

    var block2Prompt = buildTrainingPrompt(intake, profile, days, splitType, splitDesc, isAnyConditioning, null, 2, block1Primaries);
    var block2Result = await callClaude(block2Prompt);
    var block2Data = cleanAndParse(block2Result);
    var block2Primaries = block1Primaries.concat(extractPrimaries(block2Data));

    await sleep(1000);

    var block3Prompt = buildTrainingPrompt(intake, profile, days, splitType, splitDesc, isAnyConditioning, null, 3, block2Primaries);
    var block3Result = await callClaude(block3Prompt);
    var block3Data = cleanAndParse(block3Result);

    // Build weekly schedule from block 1 day names
    var weeklySchedule = {};
    var dayNames = block1Data && block1Data.days ? block1Data.days.map(function(d) { return d.day; }) : [];
    for (var i = 0; i < 7; i++) {
      weeklySchedule['day_' + (i + 1)] = dayNames[i] || (i < days ? 'Training' : 'Rest');
    }

    var trainingData = {
      split: splitType,
      weekly_schedule: weeklySchedule,
      blocks: [
        { block: 1, weeks: '1-4', days: block1Data ? block1Data.days || [] : [] },
        { block: 2, weeks: '5-8', days: block2Data ? block2Data.days || [] : [] },
        { block: 3, weeks: '9-12', days: block3Data ? block3Data.days || [] : [] }
      ]
    };

    await sleep(1000);
    var nutritionResult = await callClaude(nutritionPrompt);
    var nutritionRaw = cleanAndParse(nutritionResult);

    // JS calculates all macros from Claude's ingredient picks — no Claude math
    var mealPlan = buildMealPlanFromIngredients(
      nutritionRaw.meal_ingredients || [],
      days, proteinTarget, calorieTarget
    );

    var nutritionData = {
      nutrition: {
        daily_calories:    calorieTarget,
        protein_g:         proteinTarget,
        carbs_g_training:  carbsTraining,
        carbs_g_rest:      carbsRest,
        fat_g_training:    fatTraining,
        fat_g_rest:        fatRest,
        approach:          'Carb cycling — high carb training days, low carb rest days',
        meal_plan:         mealPlan
      },
      sleep_protocol: nutritionRaw.sleep_protocol || {}
    };

    var updateData = {
      program_name: intake.goal_primary + ' Program - ' + splitType,
      program_type: splitType,
      block_number: 1,
      write_up: { greeting: 'Your program is ready.', goals: [intake.goal_primary], approach: [splitType + ' split, ' + days + ' days/week'] },
      training_program: trainingData,
      meal_plan: nutritionData.nutrition,
      sleep_protocol: nutritionData.sleep_protocol,
      environment_audit: null,
      status: 'ready',
      generated_at: new Date().toISOString()
    };

    if (programId) {
      await supabase.from('generated_programs').update(updateData).eq('id', programId);
    } else {
      updateData.user_id = userId;
      await supabase.from('generated_programs').insert(updateData);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Generation error:', error);
    if (userId) {
      await supabase.from('generated_programs').update({ status: 'failed' }).eq('user_id', userId).eq('status', 'generating');
    }
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
}
