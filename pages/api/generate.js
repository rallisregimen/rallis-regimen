import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const config = {
  maxDuration: 60
};

var PROMPT = function(intake, profile) {
  var name = profile.full_name || profile.first_name || 'Member';
  var days = parseInt(intake.training_days_per_week) || 4;
  var equipment = intake.equipment || 'full_gym';
  var sleepTime = intake.typical_bedtime || 'not specified';
  var wakeTime = intake.typical_wake_time || 'not specified';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var sunlight = intake.morning_sunlight;
  var successVision = intake.success_vision || 'not provided';
  var restrictions = (intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none';
  var idealWeight = parseFloat(intake.ideal_weight_lbs) || parseFloat(intake.current_weight_lbs) || 180;
  var currentWeight = parseFloat(intake.current_weight_lbs) || idealWeight;
  var proteinTarget = Math.round(idealWeight);

  var splitType, splitDesc;
  if (days <= 3) {
    splitType = 'FULL BODY';
    splitDesc = 'Full body every session. Each session: 1 compound lower (squat or hinge), 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 2-3 accessories. Hit every major muscle group at least once across the week.';
  } else if (days === 4) {
    splitType = 'UPPER LOWER';
    splitDesc = 'Alternate Upper and Lower. Upper = chest, back, shoulders, biceps, triceps. Lower = quads, hamstrings, glutes, calves, abs. Schedule: Upper-Lower-rest-Upper-Lower-rest-rest. Never same muscle group back-to-back.';
  } else {
    splitType = 'LOWER PULL PUSH';
    splitDesc = 'LOWER = quads, hamstrings, glutes, calves, abs. PULL = lats, traps, rear delts, biceps (rows + pulldowns). PUSH = chest, front delts, triceps (bench + overhead press). For ' + days + ' days: ' + (days === 5 ? 'Lower-Pull-Push-rest-Lower-rest-rest' : 'Lower-Pull-Push-Lower-Pull-Push-rest') + '. IMPORTANT: The same muscle group (e.g. Pull and Pull) must have at least 2 days between them, not 1. Lower-Pull-Push is fine back to back since they target different muscles. But Pull day cannot be followed by another Pull day until 2 days have passed.';
  }

  // Build dynamic 7-day meal plan schema based on actual training days
  // Training days come first in the week
  var restDays = 7 - days;
  var dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var mealTemplate = function(dayName, type) {
    var meal = function(name) { return '"' + name + '":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0}'; };
    return '{"day":"' + dayName + '","type":"' + type + '",' + meal('breakfast') + ',' + meal('shake') + ',' + meal('lunch') + ',' + meal('dinner') + ',' + meal('dessert') + ',"day_total":0}';
  };

  var mealPlanDays = [];
  // Spread training days across the week with rest days in between
  for (var d = 0; d < 7; d++) {
    var isTraining = d < days;
    mealPlanDays.push(mealTemplate(dayNames[d], isTraining ? 'training' : 'rest'));
  }

  var memberBlock = 'MEMBER: ' + name + ', Age ' + intake.age + ', ' + intake.sex + '. Current weight: ' + currentWeight + 'lbs. Ideal weight: ' + idealWeight + 'lbs. Goal: ' + intake.goal_primary + '/' + intake.goal_secondary + '. Vision: ' + successVision + '. Experience: ' + intake.experience_level + '. Equipment: ' + equipment + '. TRAINING DAYS: ' + days + ' (EXACTLY ' + days + ' training days, no more, no less). Session: ' + intake.session_length_mins + 'min. Injuries: ' + (intake.injuries_limitations || 'none') + '. Diet: ' + (intake.nutrition_approach || 'flexible') + ', restrictions: ' + restrictions + ', avoid: ' + (intake.foods_to_avoid || 'none') + '. Sleep: ' + intake.avg_sleep_hours + 'hrs, bedtime: ' + sleepTime + ', wake: ' + wakeTime + ', issues: ' + sleepIssue + '. caffeine_after_noon=' + caffeine + ', phone_bedroom=' + phone + ', morning_sunlight=' + sunlight;

  var proteinPerMeal = Math.round(proteinTarget / 5);
  // Pre-calculate calorie targets so Claude doesn't have to do math
  // These get filled in after TDEE calculation but we give Claude the per-meal protein floor
  var rules = 'RULES:\n\nTRAINING:\n1. Generate EXACTLY ' + days + ' training days in the blocks array. Count them. Non-negotiable.\n2. Split: ' + splitType + '. ' + splitDesc + '\n3. Equipment ' + equipment + ': home_bands/bodyweight_only = zero machines; dumbbells_only = zero barbells/machines.\n4. Rotate horizontal/vertical push and pull. Rotate quad-dominant/hip-dominant for lower.\n5. Each lower day: quads + hamstrings + glutes + (calves or abs). Each pull day: lats + traps + rear delts + biceps. Each push day: chest + front delts + triceps.\n6. RIR: W1=3-4, W2=2-3, W3=1-2, W4=7-8 deload.\n7. Reflect success vision: ' + successVision + '\n\nNUTRITION:\n1. Mifflin-St Jeor TDEE adjusted for goal.\n2. PROTEIN: Total daily protein = ' + proteinTarget + 'g. Spread across 5 meals = ~' + proteinPerMeal + 'g per meal minimum. Every single meal must have at least ' + Math.round(proteinPerMeal * 0.7) + 'g protein. The 5 meals combined must total ' + proteinTarget + 'g protein.\n3. Training days: higher carbs, less fat. Rest days: lower carbs, more fat. Total calories same both days.\n4. Every meal: non-zero values for all macros. Sum of 5 meals must match daily_calories within 30cal.\n5. Vary meals across days.\n\nSLEEP:\n1. Recommend times within 30min of actual: bedtime=' + sleepTime + ', wake=' + wakeTime + '.\n2. Melatonin ONLY if trouble falling asleep. Issue=' + sleepIssue + '.\n3. Cold exposure: 1-3 minutes max.\n4. Only flag caffeine if true (' + caffeine + '). Only flag phone if true (' + phone + ').\n5. Min 3 items per category.';

  var jsonSchema = '{"program_name":"string","program_type":"string","write_up":{"greeting":"string","goals":["string"],"approach":["string"]},"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]},"nutrition":{"daily_calories":0,"protein_g":' + proteinTarget + ',"carbs_g_training":0,"carbs_g_rest":0,"fat_g_training":0,"fat_g_rest":0,"approach":"string","meal_plan":[' + mealPlanDays.join(',') + ']},"training":{"split":"' + splitType + '","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]}]}}';

  return 'Generate a Rallis Regimen program as valid JSON only. No text outside JSON. No apostrophes in strings.\n\n' + memberBlock + '\n\n' + rules + '\n\nOutput ONLY this JSON:\n' + jsonSchema;
};

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
    if (c === '{' || c === '[') { opens.push(c); }
    if (c === '}' || c === ']') { opens.pop(); lastGoodPos = i + 1; }
    if (c !== ' ' && c !== '\n' && c !== '\r' && c !== '\t') lastGoodPos = i + 1;
  }
  var result = str.substring(0, lastGoodPos).replace(/,\s*$/, '');
  for (var j = opens.length - 1; j >= 0; j--) {
    result += opens[j] === '{' ? '}' : ']';
  }
  return result;
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

    var insertResult = await supabase.from('generated_programs').insert({
      user_id: userId,
      status: 'generating',
      generation_month: new Date().toISOString().slice(0, 7)
    }).select().single();

    var programId = insertResult.data ? insertResult.data.id : null;

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 7000,
        messages: [{ role: 'user', content: PROMPT(intake, profile) }]
      })
    });

    if (!response.ok) {
      var errText = await response.text();
      throw new Error('Generation API failed: ' + errText);
    }

    var data = await response.json();
    var rawText = data.content && data.content[0] ? data.content[0].text : '';

    var jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    var jsonStr = jsonMatch[0]
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/,(\s*[}\]])/g, '$1');

    var generated;
    try {
      generated = JSON.parse(jsonStr);
    } catch(e) {
      try { generated = JSON.parse(repairJson(jsonStr)); }
      catch(e2) { throw new Error('JSON parse failed: ' + e.message); }
    }

    var updateData = {
      program_name: generated.program_name,
      program_type: generated.program_type,
      block_number: 1,
      write_up: generated.write_up,
      training_program: generated.training,
      meal_plan: generated.nutrition,
      sleep_protocol: generated.sleep_protocol,
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
