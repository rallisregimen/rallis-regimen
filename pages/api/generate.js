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

  // Rep scheme based on goal
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
  if (days <= 3) {
    structureGuide = 'FULL BODY STRUCTURE (' + days + ' days/week):\nEach session hits every major muscle group either as a primary or supplemental movement. Rotate emphasis across days so that across the week, both horizontal and vertical push/pull patterns are trained, and both quad-dominant and hip-dominant lower patterns are trained.\n\nExample structure:\n- Day 1: Horizontal push emphasis + hip-dominant lower + supplemental vertical pull + accessories\n- Day 2: Vertical push/pull emphasis + quad-dominant lower + supplemental horizontal pull + accessories\n- Day 3: Horizontal pull emphasis + hip-dominant lower + supplemental horizontal push + accessories\n\nThe specific exercises depend on the goal and equipment. A strength-focused member might do barbell bench + barbell RDL + weighted pull-ups. A hypertrophy-focused member might do dumbbell incline + cable RDL + lat pulldown. An athletic member might do explosive push press + trap bar deadlift + pull-ups. The movement pattern structure stays the same; the implementation varies.';
  } else if (days === 4) {
    structureGuide = 'UPPER/LOWER STRUCTURE (4 days/week):\nAlternate upper and lower days. Each upper day has a push/pull emphasis that rotates between sessions.\n\n- Upper A: Horizontal push/pull emphasis. Primary movements are a horizontal press and a horizontal row. Supplemental movements include vertical pull, vertical push or front delt work, and isolation work for shoulders, biceps, triceps.\n- Upper B: Vertical push/pull emphasis. Primary movements are a vertical press and a vertical pull. Supplemental movements include horizontal press variation or chest/lat isolation, plus shoulders, biceps, triceps accessories.\n- Lower A: Hip-dominant emphasis. Primary movement is a hip-hinge (deadlift, RDL, or variation). Supplemental: quad movement (press or squat variation), glute isolation. Accessories: hamstring, adductors, calves, abs.\n- Lower B: Quad-dominant emphasis. Primary movement is a squat variation. Supplemental: hip-hinge variation, glute work. Accessories: hamstring, adductors, calves, abs.\n\nThe specific exercises depend entirely on the member goal and equipment. Bench + barbell row for horizontal emphasis could become dumbbell press + chest-supported row, or cable fly + cable row. Pull-ups + overhead press for vertical emphasis could become lat pulldown + landmine press or close-grip pulldown + Arnold press. The principle is the emphasis pattern; the execution varies.';
  } else {
    structureGuide = 'LOWER/PULL/PUSH STRUCTURE (' + days + ' days/week):\nEach day type has two versions that alternate emphasis:\n\nPUSH days alternate between:\n- Push A: Horizontal emphasis. Primary: horizontal press. Supplemental: vertical press or front delt movement, lateral raise, tricep work.\n- Push B: Vertical emphasis. Primary: vertical press. Supplemental: horizontal press variation or chest work, lateral raise, tricep work.\n\nPULL days alternate between:\n- Pull A: Horizontal emphasis. Primary: horizontal row. Supplemental: vertical pull, rear delt/trap work, bicep work.\n- Pull B: Vertical emphasis. Primary: vertical pull (pulldown or pull-up). Supplemental: horizontal row variation, rear delt/trap work, bicep work.\n\nLOWER days alternate between:\n- Lower A: Hip-dominant emphasis. Primary: hip-hinge movement. Supplemental: quad movement, glute isolation. Accessories: hamstring, adductors, calves, abs.\n- Lower B: Quad-dominant emphasis. Primary: squat variation. Supplemental: hip-hinge variation, glute work. Accessories: hamstring, adductors, calves, abs.\n\nFor 6 days: Lower A - Pull A - Push A - Lower B - Pull B - Push B - rest.\nFor 5 days: Lower A - Pull A - Push A - rest - Lower B - rest - rest.\n\nSpecific exercises always match the member goal and equipment. Heavy barbell movements for strength. Moderate dumbbell/cable work for hypertrophy. Explosive variations for athletic goals. Higher rep, shorter rest for conditioning.';
  }

  var blockProgression = 'BLOCK PROGRESSION (generate all 3 blocks):\n- Block 1 (weeks 1-4): Establish baseline. Select exercises that fit the emphasis pattern and goal. RIR W1=3-4, W2=2-3, W3=1-2, W4=deload.\n- Block 2 (weeks 5-8): Rotate emphasis within each day type. If Block 1 Upper A was horizontal push primary, Block 2 Upper A keeps the horizontal push/pull structure but may shift the primary exercise (e.g., barbell bench becomes incline dumbbell press) or adjust supplemental emphasis. Lower days swap which pattern is primary. RIR same progression.\n- Block 3 (weeks 9-12): Further variation. Can return to Block 1 exercise selection but with increased load targets, or introduce new variations. The general movement pattern template stays consistent across all 3 blocks; what changes is the specific exercise, implement, or rep scheme.\n\nThis creates indefinite progression: each monthly regeneration rotates through the same principles with fresh exercise variation.';

  return 'Generate ONLY the training section of a fitness program as valid JSON. No text outside JSON.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + ', ' + intake.experience_level + '. Equipment: ' + equipment + '. Goal: ' + goal + '. Vision: ' + successVision + '. Session: ' + intake.session_length_mins + 'min. Injuries: ' + (intake.injuries_limitations || 'none') + '.\n\nREP SCHEME: ' + repScheme + '\n\n' + structureGuide + '\n\n' + blockProgression + '\n\nCRITICAL RULES:\n1. Generate EXACTLY ' + days + ' unique training day templates. Count them.\n2. Equipment ' + equipment + ': home_bands/bodyweight_only=zero machines; dumbbells_only=zero barbells/machines.\n3. Never repeat the same exercise variation more than once per session.\n4. Same muscle group needs 2+ days rest between sessions targeting it as primary.\n5. Reflect success vision in exercise selection: ' + successVision + '\n6. For 2-3 day full body programs: hit each major muscle group at least once per week even if not every session.\n7. BAND EXERCISES: resistance bands = minimum 12-15 reps, typically 20-30 reps. Never program bands for low-rep strength work.
8. BANDS + BODYWEIGHT: If equipment is home_bands, use a MIX of band exercises and bodyweight exercises. Not every exercise should use a band. Use bands for resistance where it adds value (rows, pull-aparts, curls, deadlifts), and bodyweight for movements that work well without resistance (push-ups, dips, lunges, step-ups, glute bridges, planks, core work). Aim for roughly half and half.
9. COMPOUND CAP: Maximum 3 compound/multi-joint exercises per training day. Exceptions: full body days and bodyweight-only days may have up to 4. Fill remaining slots with isolation and accessory work.\n\nOutput ONLY this JSON:\n{"split":"' + splitType + '","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]},{"block":2,"weeks":"5-8","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]},{"block":3,"weeks":"9-12","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]}]}';
}

function buildNutritionSleepPrompt(intake, profile, days, proteinTarget, proteinPerMeal) {
  var name = profile.full_name || profile.first_name || 'Member';
  var idealWeight = parseFloat(intake.ideal_weight_lbs) || parseFloat(intake.current_weight_lbs) || 180;
  var sleepTime = intake.typical_bedtime || 'not specified';
  var wakeTime = intake.typical_wake_time || 'not specified';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var restrictions = (intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none';
  var restDays = 7 - days;
  var minProteinPerMeal = Math.round(proteinPerMeal * 0.7);

  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var mealTemplate = function(dayName, type) {
    return '{"day":"' + dayName + '","type":"' + type + '","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0}';
  };

  var mealPlanDays = [];
  for (var d = 0; d < 7; d++) {
    mealPlanDays.push(mealTemplate(dayNames[d], d < days ? 'training' : 'rest'));
  }

  return 'Generate ONLY the nutrition and sleep sections of a fitness program as valid JSON. No text outside JSON.\n\nMEMBER: ' + name + ', ' + intake.age + 'yo ' + intake.sex + '. Current: ' + intake.current_weight_lbs + 'lbs. Ideal: ' + idealWeight + 'lbs. Goal: ' + intake.goal_primary + '. Diet: ' + (intake.nutrition_approach || 'flexible') + ', restrictions: ' + restrictions + ', avoid: ' + (intake.foods_to_avoid || 'none') + '. Training ' + days + ' days/week. Sleep: ' + intake.avg_sleep_hours + 'hrs, bedtime: ' + sleepTime + ', wake: ' + wakeTime + ', issues: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_bedroom=' + phone + '.\n\nNUTRITION RULES:\n1. Mifflin-St Jeor TDEE adjusted for goal (-300-500 cut, +200-300 bulk).\n2. PROTEIN = ' + proteinTarget + 'g total per day. Across 5 meals = ' + proteinPerMeal + 'g each. Every meal must have AT LEAST ' + minProteinPerMeal + 'g protein. 5 meals combined MUST total ' + proteinTarget + 'g.\n3. Training days: high carb, moderate fat. Rest days: low carb, high fat. Same total calories both days.\n4. CALORIE MATH: daily_calories is your target. Every single day in the meal plan MUST have all 5 meals summing to within 30cal of daily_calories. Calculate each meal carefully. day_total must equal the sum of all 5 meals.\n5. Every macro value must be non-zero.\n6. Vary meals across 7 days.\n7. BREAKFAST: Traditional morning food only. Eggs (any style), oatmeal with protein, Greek yogurt parfait, cottage cheese bowl, protein pancakes, avocado toast with eggs. Never plain whey, rice, or chicken breast for breakfast.\n8. SHAKE: Protein shake or smoothie only. Ingredients: whey/casein protein, fruit (banana/berries/mango), almond/oat milk, nut butter, Greek yogurt, spinach, cocoa powder, or oats. NEVER white rice, cooked rice, or non-blendable ingredients in a shake.\n\nSLEEP RULES:\n1. Recommend times within 30min of: bedtime=' + sleepTime + ', wake=' + wakeTime + '.\n2. Melatonin ONLY if trouble falling asleep. Issue=' + sleepIssue + '.\n3. Cold exposure 1-3 min only.\n4. Flag caffeine ONLY if true (' + caffeine + '). Flag phone ONLY if true (' + phone + ').\n5. Min 3 items per category.\n\nOutput ONLY this JSON:\n{"nutrition":{"daily_calories":0,"protein_g":' + proteinTarget + ',"carbs_g_training":0,"carbs_g_rest":0,"fat_g_training":0,"fat_g_rest":0,"approach":"string","meal_plan":[' + mealPlanDays.join(',') + ']},"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]}}';
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
    var idealWeight = parseFloat(intake.ideal_weight_lbs) || parseFloat(intake.current_weight_lbs) || 180;
    var proteinTarget = Math.round(idealWeight);
    var proteinPerMeal = Math.round(proteinTarget / 5);

    var splitType, splitDesc;
    if (days <= 3) {
      splitType = 'FULL BODY';
      splitDesc = 'Full body every session. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories.';
    } else if (days === 4) {
      splitType = 'UPPER LOWER';
      splitDesc = 'Alternate Upper (chest/back/shoulders/biceps/triceps) and Lower (quads/hamstrings/glutes/calves/abs). Upper-Lower-rest-Upper-Lower-rest-rest.';
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
    var nutritionPrompt = buildNutritionSleepPrompt(intake, profile, days, proteinTarget, proteinPerMeal);

    var results = await Promise.all([
      callClaude(trainingPrompt),
      callClaude(nutritionPrompt)
    ]);

    var trainingData = cleanAndParse(results[0]);
    var nutritionData = cleanAndParse(results[1]);

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
