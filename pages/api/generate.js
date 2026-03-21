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
  var days = intake.training_days_per_week || 4;
  var equipment = intake.equipment || 'full_gym';
  var sleepTime = intake.typical_bedtime || 'not specified';
  var wakeTime = intake.typical_wake_time || 'not specified';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var water = intake.filters_water;
  var sunlight = intake.morning_sunlight;
  var cookware = intake.nonstick_cookware;
  var cleaning = intake.conventional_cleaning;
  var successVision = intake.success_vision || 'not provided';
  var restrictions = (intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none';

  var memberBlock = 'MEMBER: ' + name + ', Age ' + intake.age + ', ' + intake.sex + ', ' + intake.current_weight_lbs + 'lbs -> ' + intake.ideal_weight_lbs + 'lbs goal. Goal: ' + intake.goal_primary + '/' + intake.goal_secondary + '. Vision: ' + successVision + '. Experience: ' + intake.experience_level + '. Equipment: ' + equipment + '. ' + days + ' days/week, ' + intake.session_length_mins + 'min sessions. Injuries: ' + (intake.injuries_limitations || 'none') + '. Diet: ' + (intake.nutrition_approach || 'flexible') + ', restrictions: ' + restrictions + ', avoid: ' + (intake.foods_to_avoid || 'none') + '. Sleep: ' + intake.avg_sleep_hours + 'hrs, bedtime: ' + sleepTime + ', wake: ' + wakeTime + ', issues: ' + sleepIssue + '. Audit: caffeine_after_noon=' + caffeine + ', phone_bedroom=' + phone + ', filters_water=' + water + ', morning_sunlight=' + sunlight + ', nonstick=' + cookware + ', conventional_cleaning=' + cleaning;

  var trainingRules = 'TRAINING: Generate EXACTLY ' + days + ' days. Equipment rule: home_bands/bodyweight_only = zero machines; dumbbells_only = zero barbells/machines. Split: 2-3 days = full body (compound lower + horiz push + horiz pull + vert push/pull each session); 4 days = Upper/Lower (upper=chest/back/shoulders/biceps/triceps, lower=quads/hams/glutes/calves/abs); 5-6 days = Lower/Pull/Push (PUSH=chest+front delts+triceps, PULL=lats+traps+rear delts+biceps, LOWER=quads+hams+glutes+calves+abs, 6 days=LPP twice). Movement patterns: push days include horizontal AND vertical push; pull days include horizontal AND vertical pull; lower days include quad-dominant AND hip-dominant. Rest spacing: never same muscle group back-to-back. LPP sequence: Lower-Pull-Push-rest. Success vision in exercise selection: ' + successVision;

  var nutritionRules = 'NUTRITION: Mifflin-St Jeor TDEE, adjust for goal (-300-500 cut, +200-300 bulk). Protein=1g/lb ideal bodyweight. Training days: high carb, moderate fat. Rest days: low carb, HIGH fat (same total calories). 7-day meal plan, 5 meals/day (breakfast/shake/lunch/dinner/dessert). Every meal: protein_g, carbs_g, fat_g, calories all as real numbers never 0 or null. 5 meals per day MUST sum within 30cal of daily target. Vary meals across days.';

  var sleepRules = 'SLEEP: Use actual bedtime ' + sleepTime + ' and wake ' + wakeTime + ' (stay within 30min). Melatonin ONLY if sleep_issue includes trouble falling asleep (issue=' + sleepIssue + '). Cold exposure 1-3min only. Flag caffeine only if caffeine_after_noon=true (' + caffeine + '). Flag phone only if phone_bedroom=true (' + phone + '). Min 3 items per category.';

  var envRules = 'ENVIRONMENT: REQUIRED, never empty. Min 3 items each. Base on: water=' + water + ', cookware=' + cookware + ', cleaning=' + cleaning + ', sunlight=' + sunlight + '. immediate_wins=today, short_term=30 days, long_term=90+ days.';

  var jsonSchema = '{"program_name":"string","program_type":"string","write_up":{"greeting":"string","goals":["string"],"approach":["string"]},"sleep_protocol":{"morning":["string","string","string"],"evening":["string","string","string"],"sleep_environment":["string","string","string"],"priority_fixes":["string","string"]},"environment_protocol":{"immediate_wins":["string","string","string"],"short_term":["string","string","string"],"long_term":["string","string","string"]},"nutrition":{"daily_calories":0,"protein_g":0,"carbs_g_training":0,"carbs_g_rest":0,"fat_g_training":0,"fat_g_rest":0,"approach":"string","meal_plan":[{"day":"Monday","type":"training","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Tuesday","type":"rest","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Wednesday","type":"training","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Thursday","type":"training","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Friday","type":"rest","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Saturday","type":"training","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0},{"day":"Sunday","type":"rest","breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"day_total":0}]},"training":{"split":"string","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]}]}}';

  return 'Generate a Rallis Regimen program as valid JSON only. No text outside JSON. No apostrophes in strings.\n\n' + memberBlock + '\n\n' + trainingRules + '\n\n' + nutritionRules + '\n\n' + sleepRules + '\n\n' + envRules + '\n\nOutput ONLY this JSON structure:\n' + jsonSchema;
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
      console.error('Claude error:', errText);
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
    } catch(parseErr) {
      try {
        generated = JSON.parse(repairJson(jsonStr));
        console.log('JSON repaired successfully');
      } catch(repairErr) {
        throw new Error('JSON parse failed: ' + parseErr.message);
      }
    }

    var updateData = {
      program_name: generated.program_name,
      program_type: generated.program_type,
      block_number: 1,
      write_up: generated.write_up,
      training_program: generated.training,
      meal_plan: generated.nutrition,
      sleep_protocol: generated.sleep_protocol,
      environment_audit: generated.environment_protocol,
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
