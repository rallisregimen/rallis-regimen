import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const config = { maxDuration: 60 };

function buildTrainingPrompt(intake, profile, days, splitType, splitDesc) {
  var name = profile.full_name || profile.first_name || 'Member';
  var equipment = intake.equipment || 'full_gym';
  var successVision = intake.success_vision || 'not provided';
  var goal = intake.goal_primary || 'build_muscle';

  // For cardio-hybrid splits, add cardio day instructions
  var cardioNote = '';
  if (splitType === 'UPPER LOWER CARDIO') {
    cardioNote = '\n\nCARDIO DAYS: Program cardio days as workout days in the blocks with specific prescriptions. Each cardio day should include 2-3 cardio modalities:\n- A Zone 2 component (30-45 min, 70-80% HR, continuous, e.g. incline treadmill walk at 3-4 mph 6-12% grade, bike, or row)\n- A Max Aerobic component (2-4 x 4-6 min at 85-95% HR with equal rest, e.g. run intervals, bike sprints, rower intervals)\n- OR a Max Anaerobic component on alternating cardio days (6-10 x 30 sec at max effort with 90 sec rest, e.g. sprints, air bike, sled, stairs)\nProgram cardio exercises with sets, reps/duration, and rest just like lifting exercises. Use "sets" for intervals and "reps" for duration (e.g. "45 min" or "4 min").';}

  var repScheme;
  if (goal === 'build_strength') {
    repScheme = 'REP SCHEME: Main lifts 3-5 sets x 3-6 reps, supplemental 3-4 sets x 6-10 reps, accessories 2-3 sets x 10-15 reps. Heavy loads, full rest.';
  } else if (goal === 'athletic_performance') {
    repScheme = 'REP SCHEME: Power movements 4-5 sets x 3-5 reps explosive, strength work 3-4 sets x 5-8 reps, conditioning accessories 3 sets x 10-15 reps.';
  } else if (goal === 'conditioning' || goal === 'general_health') {
    repScheme = 'REP SCHEME FOR LIFTING DAYS: 3-4 sets x 12-20 reps, moderate weight, 30-60 sec rest between sets. Higher rep ranges, shorter rest. Do NOT label lifting days as "conditioning circuit" — they are Upper, Lower, or Full Body days. Only dedicated cardio days get a cardio label.';
  } else {
    repScheme = 'REP SCHEME: Main lifts 3-4 sets x 6-10 reps, supplemental 3 sets x 8-12 reps, accessories 3 sets x 12-15 reps.';
  }

  var structureGuide;
  if (splitType === 'FULL BODY') {
    structureGuide = 'FULL BODY STRUCTURE (' + days + ' days/week):\nEach session hits every major muscle group either as a primary or supplemental movement. Rotate emphasis across days so that across the week, both horizontal and vertical push/pull patterns are trained, and both quad-dominant and hip-dominant lower patterns are trained.\n\nExample structure:\n- Day 1: Horizontal push emphasis + hip-dominant lower + supplemental vertical pull + accessories\n- Day 2: Vertical push/pull emphasis + quad-dominant lower + supplemental horizontal pull + accessories\n- Day 3: Horizontal pull emphasis + hip-dominant lower + supplemental horizontal push + accessories\n\nThe specific exercises depend on the goal and equipment.';
  } else if (splitType === 'UPPER LOWER' || splitType === 'UPPER LOWER CARDIO') {
    structureGuide = 'UPPER/LOWER STRUCTURE:\nAlternate upper and lower days. Each upper day has a push/pull emphasis that rotates between sessions.\n\n- Upper A: Horizontal push/pull emphasis. Primary movements are a horizontal press and a horizontal row. Supplemental: vertical pull, vertical push or front delt work, isolation work for shoulders, biceps, triceps.\n- Upper B: Vertical push/pull emphasis. Primary movements are a vertical press and a vertical pull. Supplemental: horizontal press variation or chest/lat isolation, plus shoulders, biceps, triceps accessories.\n- Lower A: Hip-dominant emphasis. Primary: hip-hinge (deadlift, RDL, or variation). Supplemental: quad movement, glute isolation. Accessories: hamstring, adductors, calves, abs.\n- Lower B: Quad-dominant emphasis. Primary: squat variation. Supplemental: hip-hinge variation, glute work. Accessories: hamstring, adductors, calves, abs.\n\nThe specific exercises depend on the member goal and equipment.';
  } else {
    structureGuide = 'LOWER/PULL/PUSH STRUCTURE (' + days + ' days/week):\nEach day type has two versions that alternate emphasis:\n\nPUSH days alternate between:\n- Push A: Horizontal emphasis. Primary: horizontal press. Supplemental: vertical press or front delt movement, lateral raise, tricep work.\n- Push B: Vertical emphasis. Primary: vertical press. Supplemental: horizontal press variation or chest work, lateral raise, tricep work.\n\nPULL days alternate between:\n- Pull A: Horizontal emphasis. Primary: horizontal row. Supplemental: vertical pull, rear delt/trap work, bicep work.\n- Pull B: Vertical emphasis. Primary: vertical pull (pulldown or pull-up). Supplemental: horizontal row variation, rear delt/trap work, bicep work.\n\nLOWER days alternate between:\n- Lower A: Hip-dominant emphasis. Primary: hip-hinge movement. Supplemental: quad movement, glute isolation. Accessories: hamstring, adductors, calves, abs.\n- Lower B: Quad-dominant emphasis. Primary: squat variation. Supplemental: hip-hinge variation, glute work. Accessories: hamstring, adductors, calves, abs.\n\nFor 6 days: Lower A - Pull A - Push A - Lower B - Pull B - Push B - rest.\nFor 5 days: Lower A - Pull A - Push A - rest - Lower B - rest - rest.\n\nSpecific exercises always match the member goal and equipment.';
  }
  var blockProgression = 'BLOCK PROGRESSION (generate all 3 blocks):\n- Block 1 (weeks 1-4): Establish baseline. Select exercises that fit the emphasis pattern and goal. RIR W1=3-4, W2=2-3, W3=1-2, W4=deload.\n- Block 2 (weeks 5-8): Rotate emphasis within each day type. If Block 1 Upper A was horizontal push primary, Block 2 Upper A keeps the horizontal push/pull structure but may shift the primary exercise (e.g., barbell bench becomes incline dumbbell press) or adjust supplemental emphasis. Lower days swap which pattern is primary. RIR same progression.\n- Block 3 (weeks 9-12): Further variation. Can return to Block 1 exercise selection but with increased load targets, or introduce new variations. The general movement pattern template stays consistent across all 3 blocks; what changes is the specific exercise, implement, or rep scheme.\n\nThis creates indefinite progression: each monthly regeneration rotates through the same principles with fresh exercise variation.';

  return 'Generate ONLY the training section of a fitness program as valid JSON. No text outside JSON.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + ', ' + intake.experience_level + '. Equipment: ' + equipment + '. Goal: ' + goal + '. Session: ' + intake.session_length_mins + 'min. Injuries: ' + (intake.injuries_limitations || 'none') + '.\n\n' + splitDesc + '\n\n' + repScheme + '\n\n' + structureGuide + '\n\n' + blockProgression + cardioNote + '\n\nCRITICAL RULES:\n1. The "days" array in each block must contain EXACTLY ' + days + ' day objects. Not ' + (days+1) + '. Not ' + (days+2) + '. Exactly ' + days + '.\n2. Name each day clearly: e.g. "Upper A", "Lower B", "Cardio", "Full Body". Never use "string" or "-" as a day name.\n3. Equipment ' + equipment + ': home_bands/bodyweight_only = no machines; dumbbells_only = no barbells or machines.\n4. Never repeat the same exercise in the same session.\n5. BAND EXERCISES: 12-30 reps minimum. Never low-rep band work.\n6. COMPOUND CAP: max 3 compound exercises per day (4 for full body or bodyweight).\n7. REST TIMES: Conditioning goal = 30-60 sec. Hypertrophy = 60-90 sec isolation, 2-3 min compounds. Strength = 3-5 min main lifts.\n\nOutput ONLY valid JSON in this exact structure:\n{"split":"' + splitType + '","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[EXACTLY ' + days + ' DAY OBJECTS]},{"block":2,"weeks":"5-8","days":[EXACTLY ' + days + ' DAY OBJECTS]},{"block":3,"weeks":"9-12","days":[EXACTLY ' + days + ' DAY OBJECTS]}]}\n\nEach day object: {"day":"Name","focus":"Focus","exercises":[{"name":"Exercise Name","sets":3,"reps":"10-12","rir_week1":"3-4","rir_week2":"2-3","rir_week3":"1-2","rir_week4":"7-8 deload","rest":"90 sec","note":"coaching cue"}]}';
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

  // Build restricted ingredient set so we never offer them to Claude
  var restrictedIds = [];
  var restrictionStr = restrictions.toLowerCase();
  if (restrictionStr.includes('dairy')) {
    restrictedIds = restrictedIds.concat(['greek_yogurt','cottage_cheese','whole_milk','cheese_oz']);
  }
  if (restrictionStr.includes('vegan') || restrictionStr.includes('vegetarian')) {
    restrictedIds = restrictedIds.concat(['chicken_breast','turkey_breast','salmon','ground_beef_90',
      'tuna_canned','shrimp','turkey_sausage','chicken_sausage','lean_bacon','whey_scoop']);
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
  // Also parse foods_to_avoid freetext for common dairy terms
  var avoidLower = foodsToAvoid.toLowerCase();
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
  var shakeProtein = restrictedIds.indexOf('whey_scoop') === -1 ? '{"id":"whey_scoop","qty":2}' : '{"id":"egg_white","qty":4}';
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

  return 'Choose ingredients for a 7-day meal plan. Return ONLY valid JSON, no other text.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + '. Goal: ' + intake.goal_primary + '. Restrictions: ' + restrictions + '. Avoid: ' + foodsToAvoid + '.' + restrictionWarning + '\n\nDAILY TARGETS: ' + proteinTarget + 'g protein | Training: ' + carbsTraining + 'g carbs / ' + fatTraining + 'g fat | Rest: ' + carbsRest + 'g carbs / ' + fatRest + 'g fat\n\nPER-MEAL TARGETS (training day / rest day):\n  breakfast:  ~' + pBreakfast + 'g protein | ~' + cBT + 'g carbs (T) / ~' + cBR + 'g carbs (R) | ~' + fBT + 'g fat (T) / ~' + fBR + 'g fat (R)\n  shake:      ~' + pShake + 'g protein | ~' + cST + 'g carbs (T) / ~' + cSR + 'g carbs (R) | ~' + fST + 'g fat (T) / ~' + fSR + 'g fat (R)\n  lunch:      ~' + pLunch + 'g protein | ~' + cLT + 'g carbs (T) / ~' + cLR + 'g carbs (R) | ~' + fLT + 'g fat (T) / ~' + fLR + 'g fat (R)\n  dinner:     ~' + pDinner + 'g protein | ~' + cDT + 'g carbs (T) / ~' + cDR + 'g carbs (R) | ~' + fDT + 'g fat (T) / ~' + fDR + 'g fat (R)\n  dessert:    ~' + pDessert + 'g protein | ~' + cDeT + 'g carbs (T) / ~' + cDeR + 'g carbs (R) | ~' + fDeT + 'g fat (T) / ~' + fDeR + 'g fat (R)\n\nAVAILABLE INGREDIENT IDs (macros per unit, format p/c/f) — ONLY use IDs from this list:\n' + ingredientLines.join('\n') + '\n\nQUANTITY GUIDANCE — use these as starting points for hitting targets:\nPROTEIN: ' + pLunch + 'g at lunch = chicken_breast qty ' + Math.round(pLunch/8.5) + ', or salmon qty ' + Math.round(pLunch/7) + ', or ground_beef_90 qty ' + Math.round(pLunch/7) + '. ' + pDinner + 'g at dinner = similar. ' + pBreakfast + 'g at breakfast = ' + Math.round(pBreakfast/6) + ' eggs, or eggs + turkey_sausage combo.\nCARBS (training): ' + cBT + 'g at breakfast = oats qty ' + Math.round(cBT/54*10)/10 + ' cup' + (cBT > 54 ? 's' : '') + (cBT > 27 ? '' : ' (use oats_half for ~27g)') + '. ' + cLT + 'g at lunch = brown_rice qty ' + Math.round(cLT/45*10)/10 + ' cup' + (cLT > 45 ? 's' : '') + ', or sweet_potato qty ' + Math.round(cLT/26) + '. ' + cST + 'g in shake = banana qty ' + Math.round(cST/27) + (cST > 40 ? ' + berries qty 1' : '') + '.\nFAT (training): ' + fBT + 'g at breakfast comes from eggs naturally, or add avocado_half (11f) or peanut_butter (8f per tbsp). ' + fDT + 'g at dinner = salmon naturally has fat, or add olive_oil qty ' + Math.round(fDT/14) + '.\nFAT (rest day): ' + fLR + 'g at lunch = avocado_half (11f) + olive_oil qty ' + Math.round((fLR-11)/14) + '. ' + fDR + 'g at dinner = fatty fish or add olive_oil.\n\nRULES:\n1. For each meal output an array of {id, qty} objects — qty is always a positive number. Only use ingredient IDs from the list above.\n2. BUILD COMPLETE MEALS with 3-5 ingredients each: protein source + carb source (training days) + vegetable or fruit + fat source + optional flavor item.\n3. VARY every day: rotate protein sources (chicken one day, salmon next, beef next), rotate carbs (rice vs sweet potato vs oats), rotate vegetables.\n4. BREAKFAST: eggs and/or ' + (restrictedIds.indexOf('greek_yogurt') === -1 ? 'greek_yogurt' : 'cottage_cheese') + ' required. Add turkey_sausage or chicken_sausage for more protein. Training days: oats or bread_wg for carbs + fruit. Rest days: avocado or nut butter instead of starch.\n5. SHAKE: whey_scoop qty 1-2 + ' + safeMilk + ' + banana or berries + peanut_butter or almond_butter.\n6. LUNCH: big protein qty to hit target + starchy carb on training days (brown_rice, sweet_potato, white_potato) + vegetable (broccoli, asparagus, spinach). Rest days: replace starch with avocado_half and olive_oil.\n7. DINNER: big protein + vegetable + small carb on training days. Rest days: more fat, no starch.\n8. DESSERT: ' + (restrictedIds.indexOf('greek_yogurt') === -1 ? 'greek_yogurt' : 'berries') + ' or cottage_cheese base + berries + honey or granola.\n\nSLEEP PROTOCOL — one consistent protocol:\nBedtime: ' + sleepTime + '. Wake: ' + wakeTime + '. Issue: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_in_bedroom=' + phone + '.\nMorning: get up immediately, outdoor sunlight 10-30 min, early movement, cold shower 1-3 min morning only if sleep issues.\nEvening: lower lights after sunset, limit electronics 1-2hr before bed, hot bath/shower 60-90min before bed, stretching, slow exhale breathing, no large meals 2-3hr before bed.\nEnvironment: 60-68F, complete darkness, fan.\nSupplements if sleep issues: magnesium glycinate or apigenin. NEVER melatonin.\n\nOutput ONLY this JSON (replace all example ingredient arrays with your actual picks for each day):\n{"meal_ingredients":[' + dayTemplates.join(',') + '],"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]}}';
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

async function callClaude(prompt) {
  var response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) {
    var err = await response.text();
    throw new Error('API failed: ' + err);
  }
  var data = await response.json();
  return data.content && data.content[0] ? data.content[0].text : '';
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

    // Adjust for goal
    var calorieTarget;
    var goal = intake.goal_primary || 'build_muscle';
    if (goal === 'lose_fat') calorieTarget = tdee - 400;
    else if (goal === 'build_muscle' || goal === 'build_strength') calorieTarget = tdee + 300;
    else if (goal === 'conditioning' || goal === 'general_health') calorieTarget = tdee;
    else calorieTarget = tdee + 200;

    // Macro split
    var proteinCals = proteinTarget * 4;
    var remainingCals = calorieTarget - proteinCals;

    // Training day: 50% remaining to carbs, 50% to fat
    // Rest day: 30% to carbs, 70% to fat (same total calories)
    var carbsTraining = Math.round((remainingCals * 0.55) / 4);
    var carbsRest = Math.round((remainingCals * 0.30) / 4);
    var fatTraining = Math.round((remainingCals * 0.45) / 9);
    var fatRest = Math.round((remainingCals * 0.70) / 9);

    var goalSecondary = intake.goal_secondary || '';
    var conditioningGoals = ['conditioning', 'general_health', 'lose_fat'];
    var isPrimaryConditioning = conditioningGoals.indexOf(goal) !== -1;
    var isSecondaryConditioning = conditioningGoals.indexOf(goalSecondary) !== -1;
    var isAnyConditioning = isPrimaryConditioning || isSecondaryConditioning;
    var isBeginner = (intake.experience_level || '') === 'beginner';

    var splitType, splitDesc;

    if (days <= 2) {
      splitType = 'FULL BODY';
      if (isAnyConditioning) {
        splitDesc = 'GENERATE EXACTLY 2 TRAINING DAY TEMPLATES. Full body lifting both days, each ending with a 15-20 min cardio finisher. Day 1 finisher: Zone 2 (15 min incline walk or bike). Day 2 finisher: VO2 Max intervals (3 x 4 min hard, 4 min easy). Full body structure per day: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2 accessories.';
      } else {
        splitDesc = 'GENERATE EXACTLY 2 TRAINING DAY TEMPLATES. Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
      }
    } else if (days === 3) {
      if (isPrimaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        if (isBeginner) {
          splitDesc = 'GENERATE EXACTLY 3 TRAINING DAY TEMPLATES in this order: (1) Full Body lifting, (2) Cardio only, (3) Full Body lifting. Cardio day: 30 min Zone 2 + 2 rounds VO2 Max intervals (4 min on / 4 min off). Full body structure: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2-3 accessories.';
        } else {
          splitDesc = 'GENERATE EXACTLY 3 TRAINING DAY TEMPLATES in this order: (1) Upper body, (2) Cardio only, (3) Lower body. Cardio day: 20 min Zone 2 + 3 x 4 min VO2 Max intervals + 1 round Anaerobic (6 x 30 sec sprints). Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
        }
      } else if (isSecondaryConditioning) {
        splitType = 'FULL BODY';
        splitDesc = 'GENERATE EXACTLY 3 TRAINING DAY TEMPLATES. Full body lifting all 3 days, each ending with a 15 min cardio finisher. Day 1 finisher: Zone 2. Day 2 finisher: VO2 Max intervals. Day 3 finisher: Anaerobic sprints. Full body structure: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical movement, 2-3 accessories.';
      } else {
        splitType = 'FULL BODY';
        splitDesc = 'GENERATE EXACTLY 3 TRAINING DAY TEMPLATES. Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
      }
    } else if (days === 4) {
      if (isPrimaryConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 4 TRAINING DAY TEMPLATES in this order: (1) Upper body lifting, (2) Lower body lifting, (3) Cardio only, (4) Cardio only. Cardio day 3: 30 min Zone 2 + 3 x 4 min VO2 Max intervals. Cardio day 4: Anaerobic only — 8 rounds of 30 sec max effort / 90 sec rest. Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      } else if (isSecondaryConditioning) {
        splitType = 'UPPER LOWER';
        splitDesc = 'GENERATE EXACTLY 4 TRAINING DAY TEMPLATES in this order: (1) Upper A, (2) Lower A, (3) Upper B, (4) Lower B. Each session is 50 min of lifting followed by a 15-20 min cardio finisher. Finishers: Upper A = Zone 2, Lower A = VO2 Max intervals, Upper B = Zone 2, Lower B = Anaerobic. Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      } else {
        splitType = 'UPPER LOWER';
        splitDesc = 'GENERATE EXACTLY 4 TRAINING DAY TEMPLATES in this order: (1) Upper A, (2) Lower A, (3) Upper B, (4) Lower B. Upper = chest/back/shoulders/arms. Lower = quads/hamstrings/glutes/calves/abs.';
      }
    } else if (days === 5) {
      if (isAnyConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 5 TRAINING DAY TEMPLATES in this order: (1) Upper A, (2) Lower A, (3) Cardio only, (4) Upper B, (5) Lower B. Cardio day: 20 min Zone 2 + 3 x 4 min VO2 Max + 1 round Anaerobic (6 x 30 sec). Upper A = horizontal push/pull emphasis. Upper B = vertical push/pull emphasis. Lower A = hip-dominant. Lower B = quad-dominant.';
      } else {
        splitType = 'LOWER PULL PUSH';
        splitDesc = 'GENERATE EXACTLY 5 TRAINING DAY TEMPLATES in this order: (1) Lower A, (2) Pull A, (3) Push A, (4) Lower B, (5) Pull B. LOWER = quads/hamstrings/glutes/calves/abs. PULL = lats/traps/rear delts/biceps. PUSH = chest/front delts/triceps.';
      }
    } else {
      if (isAnyConditioning) {
        splitType = 'UPPER LOWER CARDIO';
        splitDesc = 'GENERATE EXACTLY 6 TRAINING DAY TEMPLATES in this order: (1) Upper A, (2) Lower A, (3) Cardio only, (4) Upper B, (5) Lower B, (6) Cardio only. Cardio day 3: Zone 2 + VO2 Max. Cardio day 6: Anaerobic intervals. Upper A = horizontal push/pull emphasis. Upper B = vertical push/pull emphasis. Lower A = hip-dominant. Lower B = quad-dominant.';
      } else {
        splitType = 'LOWER PULL PUSH';
        splitDesc = 'GENERATE EXACTLY 6 TRAINING DAY TEMPLATES in this order: (1) Lower A, (2) Pull A, (3) Push A, (4) Lower B, (5) Pull B, (6) Push B. LOWER = quads/hamstrings/glutes/calves/abs. PULL = lats/traps/rear delts/biceps. PUSH = chest/front delts/triceps.';
      }
    }

    // Create pending record
    var insertResult = await supabase.from('generated_programs').insert({
      user_id: userId, status: 'generating', generation_month: new Date().toISOString().slice(0, 7)
    }).select().single();
    var programId = insertResult.data ? insertResult.data.id : null;

    // Run both calls in parallel
    var trainingPrompt = buildTrainingPrompt(intake, profile, days, splitType, splitDesc);
    var nutritionPrompt = buildNutritionSleepPrompt(intake, profile, days, proteinTarget, calorieTarget, carbsTraining, carbsRest, fatTraining, fatRest);

    var results = [
      await callClaude(trainingPrompt),
      await callClaude(nutritionPrompt)
    ];

    var trainingData = cleanAndParse(results[0]);
    var nutritionRaw = cleanAndParse(results[1]);

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
