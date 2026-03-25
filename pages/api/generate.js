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
    repScheme = 'Strength focus: main lifts 3-5 sets x 3-6 reps heavy, supplemental 3-4 sets x 6-10 reps, accessories 2-3 sets x 10-15 reps.';
  } else if (goal === 'athletic_performance') {
    repScheme = 'Athletic focus: power movements 4-5 sets x 3-5 reps explosive, strength work 3-4 sets x 5-8 reps, conditioning accessories 3 sets x 10-15 reps.';
  } else if (goal === 'conditioning') {
    repScheme = 'Conditioning focus: circuit-style 3-4 sets x 12-20 reps, shorter rest periods, higher volume accessories.';
  } else {
    repScheme = 'Hypertrophy focus: main lifts 3-4 sets x 6-10 reps, supplemental 3 sets x 8-12 reps, accessories 3 sets x 12-15 reps.';
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

  return 'Generate ONLY the training section of a fitness program as valid JSON. No text outside JSON.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + ', ' + intake.experience_level + '. Equipment: ' + equipment + '. Goal: ' + goal + '. Vision: ' + successVision + '. Session: ' + intake.session_length_mins + 'min. Injuries: ' + (intake.injuries_limitations || 'none') + '.\n\nRALLIS REGIMEN TRAINING PHILOSOPHY:\n1. STABILITY-POWER PRINCIPLE: More stability = more force safely generated. Never load unstable movements heavily. Barbell squat (high stability) = max strength loads. Bulgarian split squat (moderate) = moderate hypertrophy loads. Pistol squat (low stability) = light loads, movement quality only.\n2. ADAPTATION HIERARCHY within a session: Speed/Power first, then Strength, then Hypertrophy, then Endurance. Never pre-exhaust before strength or power work.\n3. EXERCISE INTENTION BY TYPE:\n   - Strength: Heavy, no missed reps. 3+ min rest. "Heavy weight, absolutely no missed reps."\n   - Hypertrophy: Control full ROM, mind-muscle connection. Slow eccentric. 60-90 sec rest for isolation, 2-3 min for compounds.\n   - Endurance: Higher reps 15-20+, moderate weight, never approaching failure.\n   - Power/Dynamic: Move the weight FAST. Should not be a struggle to complete.\n4. RIR PROGRESSION: W1=3-4, W2=2-3, W3=1-2, W4=7-8 (deload).\n5. EXERCISE CUES to include in notes: Back squat — "neutral spine, control throughout". RDL — "slight bend in knee, flat back, slow 2s tempo". Hip thrust — "tuck chin, squeeze glutes, do not arch back". Goblet squat — "feet flat, chest up, push knees out". Lat pulldown — "drive elbows down, squeeze at bottom".\n\n' + repScheme + '\n\n' + structureGuide + '\n\n' + blockProgression + cardioNote + '\n\nCRITICAL RULES:\n1. Generate EXACTLY ' + days + ' unique training day templates. Count them.\n2. Equipment ' + equipment + ': home_bands/bodyweight_only=zero machines; dumbbells_only=zero barbells/machines.\n3. Never repeat the same exercise variation more than once per session.\n4. Same muscle group needs 2+ days rest between sessions targeting it as primary.\n5. Reflect success vision in exercise selection: ' + successVision + '\n6. For 2-3 day full body programs: hit each major muscle group at least once per week even if not every session.\n7. BAND EXERCISES: resistance bands = minimum 12-15 reps, typically 20-30 reps. Never program bands for low-rep strength work.\n8. BANDS + BODYWEIGHT: If equipment is home_bands, use a MIX of band and bodyweight exercises. Use bands for rows, pull-aparts, curls, deadlifts. Use bodyweight for push-ups, dips, lunges, step-ups, glute bridges, planks, core work. Aim roughly half and half.\n9. COMPOUND CAP: Maximum 3 compound/multi-joint exercises per training day. Full body and bodyweight-only days may have up to 4. Fill remaining slots with isolation and accessory work.\n10. REST TIMES: Prescribe specific rest periods for every exercise based on goal and exercise type. Strength goal: 3-5 min for main compound lifts, 2-3 min for supplemental compounds, 90 sec for accessories. Hypertrophy goal: 2-3 min for main compounds, 60-90 sec for supplemental and isolation. Conditioning goal: 30-60 sec for all exercises. Athletic goal: 2-3 min for power movements, 60-90 sec for accessories. Cardio intervals: use work:rest ratios as prescribed (1:1, 1:2, or 1:3). Format rest as "2 min", "90 sec", "3 min", etc.\n\nOutput ONLY this JSON:\n{"split":"' + splitType + '","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]},{"block":2,"weeks":"5-8","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]},{"block":3,"weeks":"9-12","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]}]}';
}

function buildNutritionSleepPrompt(intake, profile, days, proteinTarget, proteinPerMeal, calorieTarget, carbsTraining, carbsRest, fatTraining, fatRest) {
  var name = profile.full_name || profile.first_name || 'Member';
  var sleepTime = intake.typical_bedtime || 'not specified';
  var wakeTime = intake.typical_wake_time || 'not specified';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var restrictions = (intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none';

  var p5 = Math.round(proteinTarget / 5);
  var ct5 = Math.round(carbsTraining / 5);
  var cr5 = Math.round(carbsRest / 5);
  var ft5 = Math.round(fatTraining / 5);
  var fr5 = Math.round(fatRest / 5);
  var cal5 = Math.round(calorieTarget / 5);

  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var mealT = function(d, type) {
    return '{"day":"' + d + '","type":"' + type + '","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0}';
  };
  var mealPlanDays = [];
  for (var d = 0; d < 7; d++) mealPlanDays.push(mealT(dayNames[d], d < days ? 'training' : 'rest'));

  return 'Generate ONLY the nutrition and sleep sections as valid JSON. No text outside JSON.\n\nPRE-CALCULATED TARGETS — USE EXACTLY THESE NUMBERS, DO NOT RECALCULATE:\ndaily_calories=' + calorieTarget + ', protein_g=' + proteinTarget + ', carbs_g_training=' + carbsTraining + ', carbs_g_rest=' + carbsRest + ', fat_g_training=' + fatTraining + ', fat_g_rest=' + fatRest + '\nThese numbers are mathematically calculated from Mifflin-St Jeor + activity level + goal adjustment. Do not override them.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + '. Goal: ' + intake.goal_primary + '. Diet: ' + (intake.nutrition_approach || 'flexible') + ', restrictions: ' + restrictions + ', avoid: ' + (intake.foods_to_avoid || 'none') + '. Sleep: ' + intake.avg_sleep_hours + 'hrs, bedtime: ' + sleepTime + ', wake: ' + wakeTime + ', issues: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_bedroom=' + phone + '.\n\nMACRO DISTRIBUTION:\nDo NOT give every meal the same macros. Vary meal sizes and macro splits naturally based on the food. A shake might have 50g protein and 60g carbs. Dinner might have 60g protein and 40g carbs. Dessert might have 25g protein and 20g carbs. What matters is that the SUM of all 5 meals equals the daily targets. Each meal should reflect what the food actually contains, not a rigid formula.\n\nNUTRITION REFERENCE (use these real values when building meals):\nChicken breast: 6oz = 53g protein, 0g carbs, 6g fat. Salmon: 6oz = 46g protein, 0g carbs, 13g fat. Ground beef 90/10: 6oz = 42g protein, 0g carbs, 14g fat. Ground beef 90/10: 8oz = 56g protein, 0g carbs, 18g fat. Turkey breast: 6oz = 50g protein, 0g carbs, 4g fat. Eggs: 1 large = 6g protein, 0g carbs, 5g fat. Greek yogurt 2%: 1 cup (227g) = 20g protein, 8g carbs, 5g fat. Cottage cheese: 1 cup = 25g protein, 6g carbs, 5g fat. Whey protein: 1 scoop (30g) = 24g protein, 3g carbs, 1g fat. Brown rice cooked: 1 cup (195g) = 5g protein, 45g carbs, 2g fat. Sweet potato: 1 medium (150g) = 2g protein, 26g carbs, 0g fat. Oats dry: 1 cup = 10g protein, 54g carbs, 5g fat. Banana: 1 medium = 1g protein, 27g carbs, 0g fat. Berries: 1 cup = 1g protein, 14g carbs, 0g fat. Almond milk: 1 cup = 1g protein, 1g carbs, 3g fat. Whole milk: 1 cup = 8g protein, 12g carbs, 8g fat. Peanut butter: 2 tbsp = 7g protein, 7g carbs, 16g fat. Olive oil: 1 tbsp = 0g protein, 0g carbs, 14g fat. Whole grain bread: 1 slice = 4g protein, 15g carbs, 1g fat. Avocado: 1/2 = 1g protein, 6g carbs, 11g fat.\n\nRULES:\n1. Use the exact numbers above for daily_calories and all macro fields. BUILD MEALS USING THE REFERENCE VALUES ABOVE — add up the actual ingredients to get real macro totals.\n2. Each day: 5 meals must sum to exactly ' + calorieTarget + ' cal and ' + proteinTarget + 'g protein.\n3. Every macro value must be non-zero.\n4. Vary meals across 7 days — no identical meals on consecutive days.\n5. QUANTITIES REQUIRED: Every food item must have a specific quantity. Write "6oz grilled chicken breast" not "chicken breast". Write "1 cup cooked brown rice (195g)" not "brown rice". Write "1 cup (227g) 2% Greek yogurt" not "Greek yogurt". Every ingredient needs a measured amount.\n6. EVERY MEAL MUST HAVE A COMPLETE PROTEIN SOURCE: eggs, Greek yogurt, cottage cheese, chicken, beef, salmon, turkey, tuna, or whey protein. Almond butter, nuts, and beans are NOT complete protein sources and cannot be the primary protein in a meal.\n7. BREAKFAST: Must anchor on eggs or Greek yogurt. Examples: "3 scrambled eggs + 2 slices whole grain toast + 1/2 avocado", "1 cup oats + 1 scoop whey + 1 tbsp almond butter + 1 banana", "1 cup (227g) 2% Greek yogurt + 1/2 cup granola + 1/2 cup berries", "3-egg omelette with spinach and feta + 1 slice toast". A bagel with only almond butter is NOT acceptable — must have eggs or Greek yogurt alongside.\n8. SHAKE: Whey only. MUST be a classic protein shake flavor — chocolate, vanilla, strawberry, or banana base. Do not mix incompatible flavors (no chocolate whey + apple, no vanilla whey + lime). Good combos: "1 scoop chocolate whey + 1 banana + 1 cup milk + 1 tbsp peanut butter", "1 scoop vanilla whey + 1 cup berries + 3/4 cup Greek yogurt + 1 cup almond milk", "1 scoop vanilla whey + 1 banana + 1 tbsp almond butter + 1 cup oat milk".\n9. LUNCH/DINNER: High protein meals with measured quantities — "6oz grilled chicken breast + 1 cup cooked brown rice + 1 cup steamed broccoli", "7oz salmon fillet + 1 medium sweet potato + side salad".\n10. DESSERT: Light protein option with quantities — "3/4 cup (170g) Greek yogurt + 1/2 cup blueberries + 1 tsp honey", "1/2 cup cottage cheese + 1 tbsp honey + cinnamon", "1 scoop whey mixed into 1/2 cup Greek yogurt with berries".\n\nSLEEP PROTOCOL - generate ONE consistent protocol for this person. Same specific values every time. Do not vary temperature ranges or timing between days.\nBedtime: within 30min of ' + sleepTime + '. Wake: within 30min of ' + wakeTime + '. Sleep issue: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_in_bedroom=' + phone + '.\n\nMORNING items (3-5):\n- Get up immediately upon waking\n- View morning sunlight 10-30 min outside without sunglasses\n- Early movement or exercise to boost cortisol\n- Cold shower 1-3 min (MORNING ONLY - never evening) if sleep issue present\n- Consistent wake time every day\n\nEVENING items (3-5):\n- Lower lights after sunset - no overhead lights, use dim lamps or salt lamp\n- Limit electronics 1-2 hours before bed\n- Stop work 1-2 hours before bed\n- Hyperthermic conditioning: hot bath or shower 60-90 min before bed (this is the evening warm stimulus - never cold in evening)\n- 10-15 min stretching or soft tissue work for relaxation\n- Slow breathing: exhale longer than inhale to activate parasympathetic system\n- No large meals 2-3 hours before bed\n- If caffeine_after_noon=true: flag no caffeine after 12pm\n\nSLEEP ENVIRONMENT items (3-5):\n- Temperature: 60-68 degrees Fahrenheit (use EXACTLY this range every time)\n- Room as dark as possible - blackout shades or eye mask\n- Fan for air circulation and white noise\n- If phone_in_bedroom=true: no electronics in room or airplane mode face down\n- Organic breathable sheets\n\nPRIORITY FIXES: 2 highest-impact changes for this specific person\nSUPPLEMENTS if sleep issues: magnesium glycinate and/or apigenin (chamomile extract). NEVER recommend melatonin.\n\nOutput ONLY this JSON:\n{"nutrition":{"daily_calories":' + calorieTarget + ',"protein_g":' + proteinTarget + ',"carbs_g_training":' + carbsTraining + ',"carbs_g_rest":' + carbsRest + ',"fat_g_training":' + fatTraining + ',"fat_g_rest":' + fatRest + ',"approach":"string","meal_plan":[' + mealPlanDays.join(',') + ']},"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]}}';
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
      max_tokens: 6000,
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
    var isConditioningFocused = conditioningGoals.indexOf(goal) !== -1 || conditioningGoals.indexOf(goalSecondary) !== -1;

    var splitType, splitDesc;
    if (days <= 3) {
      splitType = 'FULL BODY';
      splitDesc = 'Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
    } else if (days === 4) {
      splitType = 'UPPER LOWER';
      splitDesc = 'Alternate Upper (chest/back/shoulders/biceps/triceps) and Lower (quads/hamstrings/glutes/calves/abs). Upper-Lower-rest-Upper-Lower-rest-rest.';
    } else if ((days === 5 || days === 6) && isConditioningFocused) {
      splitType = 'UPPER LOWER CARDIO';
      var cardioCount = days - 4;
      splitDesc = 'Upper/Lower x2 lifting days plus ' + cardioCount + ' dedicated cardio day(s). Lifting: Upper A (horizontal push/pull emphasis), Lower A (hip-dominant), Upper B (vertical push/pull emphasis), Lower B (quad-dominant). Cardio days rotate through three energy systems:\n\n' +
        'ZONE 2 / AEROBIC CAPACITY: 30-60+ min continuous at 70-80% max HR. Just barely able to hold a conversation or nasal breathe. No rest intervals. Exercises: incline walk, hike, ruck, bike, swim, run at easy pace.\n\n' +
        'MAX AEROBIC CAPACITY (VO2 MAX): 80-100% max HR. Either 5-25 min continuous or 3-8 min repeat efforts with 1:1-1:2 work:rest ratio. Rest by heart rate dropping to 80% max or ability to nasal breathe. Exercises: run, bike, rower, jump rope, boxing, sled push/pull, kettlebell circuit.\n\n' +
        'MAX ANAEROBIC CAPACITY: Maximum effort under 2 min per interval, typically 30-60 sec. 1:1-1:3 work:rest. 1-6 min total work. Exercises: sprints, hill sprints, sled push/pull, air bike, stairs, burpees.\n\n' +
        'For ' + days + ' days: schedule Upper A - Lower A - Cardio - Upper B - Lower B' + (cardioCount > 1 ? ' - Cardio - rest' : ' - rest - rest') + '. Cardio day 1 = Zone 2 + Max Aerobic superset. Cardio day 2 (if applicable) = Max Anaerobic work.';
    } else {
      splitType = 'LOWER PULL PUSH';
      splitDesc = 'LOWER=quads+hamstrings+glutes+calves+abs, PULL=lats+traps+rear delts+biceps, PUSH=chest+front delts+triceps. ' + (days === 5 ? 'Lower-Pull-Push-rest-Lower-rest-rest' : 'Lower-Pull-Push-Lower-Pull-Push-rest') + '. Same muscle group needs 2+ days between sessions.';
    }

    // Create pending record
    var insertResult = await supabase.from('generated_programs').insert({
      user_id: userId, status: 'generating', generation_month: new Date().toISOString().slice(0, 7)
    }).select().single();
    var programId = insertResult.data ? insertResult.data.id : null;

    // Run both calls in parallel
    var trainingPrompt = buildTrainingPrompt(intake, profile, days, splitType, splitDesc);
    var nutritionPrompt = buildNutritionSleepPrompt(intake, profile, days, proteinTarget, proteinPerMeal, calorieTarget, carbsTraining, carbsRest, fatTraining, fatRest);

    var results = await Promise.all([
      callClaude(trainingPrompt),
      callClaude(nutritionPrompt)
    ]);

    var trainingData = cleanAndParse(results[0]);
    var nutritionData = cleanAndParse(results[1]);

    // Post-process: recalculate all meal calories from macros (protein*4 + carbs*4 + fat*9)
    // This corrects any math errors Claude made
    if (nutritionData.nutrition && nutritionData.nutrition.meal_plan) {
      nutritionData.nutrition.meal_plan = nutritionData.nutrition.meal_plan.map(function(day) {
        var mealKeys = ['breakfast', 'shake', 'lunch', 'dinner', 'dessert'];
        var dayTotal = 0;
        mealKeys.forEach(function(meal) {
          if (day[meal]) {
            var p = parseFloat(day[meal].protein_g) || 0;
            var c = parseFloat(day[meal].carbs_g) || 0;
            var f = parseFloat(day[meal].fat_g) || 0;
            var cal = Math.round((p * 4) + (c * 4) + (f * 9));
            day[meal].calories = cal;
            dayTotal += cal;
          }
        });
        day.day_total = dayTotal;
        return day;
      });
      // Also recalculate daily_calories as average of all days
      var totalCals = nutritionData.nutrition.meal_plan.reduce(function(sum, d) { return sum + d.day_total; }, 0);
      nutritionData.nutrition.daily_calories = calorieTarget; // keep the target
    }

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
