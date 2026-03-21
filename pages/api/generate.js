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
  var sleepTime = intake.typical_bedtime || 'not provided';
  var wakeTime = intake.typical_wake_time || 'not provided';
  var sleepIssue = intake.sleep_issue || 'none';
  var caffeine = intake.caffeine_after_noon;
  var phone = intake.phone_in_bedroom;
  var water = intake.filters_water;
  var sunlight = intake.morning_sunlight;
  var cookware = intake.nonstick_cookware;
  var cleaning = intake.conventional_cleaning;
  var successVision = intake.success_vision || 'not provided';

  return 'Generate a Rallis Regimen program as valid JSON only. No text outside JSON. No apostrophes in string values.\n\nMEMBER PROFILE:\nName: ' + name + '\nAge: ' + intake.age + ', Sex: ' + intake.sex + '\nWeight: ' + intake.current_weight_lbs + ' lbs, Goal weight: ' + intake.ideal_weight_lbs + ' lbs\nGoal: ' + intake.goal_primary + ' / ' + intake.goal_secondary + '\nSuccess vision: ' + successVision + '\nExperience: ' + intake.experience_level + '\nEquipment: ' + equipment + '\nTraining days/week: ' + days + '\nSession length: ' + intake.session_length_mins + ' min\nInjuries: ' + (intake.injuries_limitations || 'none') + '\nNutrition approach: ' + (intake.nutrition_approach || 'flexible') + '\nDietary restrictions: ' + ((intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none') + '\nFoods to avoid: ' + (intake.foods_to_avoid || 'none') + '\nSleep hours: ' + intake.avg_sleep_hours + '\nBedtime: ' + sleepTime + '\nWake time: ' + wakeTime + '\nSleep issues: ' + sleepIssue + '\nCaffeine after noon: ' + caffeine + '\nPhone in bedroom: ' + phone + '\nFilters water: ' + water + '\nMorning sunlight: ' + sunlight + '\nNon-stick cookware: ' + cookware + '\nConventional cleaning products: ' + cleaning + '\n\nTRAINING RULES - FOLLOW EXACTLY:\n1. Generate EXACTLY ' + days + ' training days. No more, no less.\n2. EQUIPMENT RULE: If equipment is "home_bands" or "bodyweight_only", use ZERO machine exercises. If "dumbbells_only", use ZERO barbell or machine exercises. Only use equipment the member actually has.\n3. SPLIT SELECTION:\n   - 2-3 days/week: Full body each session. Hit every major muscle group at least once across the week. Each session: 1 compound lower, 1 horizontal push, 1 horizontal pull, 1 vertical push or pull, 1-2 accessories.\n   - 4 days/week: Upper/Lower split. Upper days hit chest, back, shoulders, biceps, triceps. Lower days hit quads, hamstrings, glutes, calves, abs.\n   - 5-6 days/week: Lower/Pull/Push split (LPP). PUSH days = chest, front delts, triceps. PULL days = lats, traps, rear delts, biceps. LOWER days = quads, hamstrings, glutes, calves, abs. For 6 days run LPP twice.\n4. MOVEMENT PATTERN ROTATION: Rotate through movement patterns across the week. Push days: include both horizontal push (bench press) and vertical push (overhead press). Pull days: include both horizontal pull (rows) and vertical pull (pulldowns, pull-ups). Lower days: include both quad-dominant (squat pattern) and hip-dominant (hinge pattern like deadlift or RDL).\n5. REST DAY SPACING: Never schedule the same muscle group on back-to-back days. For LPP: sequence is Lower-Pull-Push-rest or Lower-Pull-Push-Lower-Pull-Push-rest.\n6. BODY PART COMPLETENESS: Every push day must include chest, front delts, AND triceps. Every pull day must include lats, traps, rear delts, AND biceps. Every lower day must include quads, hamstrings, glutes, AND either calves or abs.\n7. Reflect the success vision in exercise selection - if athletic performance is mentioned, include power or speed work.\n\nNUTRITION RULES:\n1. Use Mifflin-St Jeor to calculate TDEE, then adjust for goal (cut -300 to -500 for fat loss, +200 to +300 for muscle gain).\n2. Protein: 1g per lb of ideal bodyweight.\n3. Training days: higher carbs. Rest days: lower carbs, HIGHER fat to maintain similar total calories.\n4. Provide breakfast, pre-workout shake, lunch, dinner, and dessert for BOTH training and rest days.\n5. Each meal must list protein_g, carbs_g, fat_g, calories. All meals must sum to within 50 calories of the daily target.\n\nSLEEP RULES:\n1. Use the member actual bedtime (' + sleepTime + ') and wake time (' + wakeTime + ') - do not suggest drastically different times.\n2. Only suggest melatonin if the member has trouble falling asleep. Sleep issue is: ' + sleepIssue + '.\n3. Cold exposure recommendation: 1-3 minutes only, never 5 minutes.\n4. Only flag caffeine after noon as an issue if caffeine_after_noon is true.\n5. Only flag phone in bedroom if phone_in_bedroom is true.\n\nENVIRONMENT RULES:\n1. This section is REQUIRED. Always generate at least 3 items per category.\n2. Base recommendations on actual audit answers: water=' + water + ', cookware=' + cookware + ', cleaning=' + cleaning + ', sunlight=' + sunlight + '.\n3. immediate_wins = changes they can make today. short_term = within 30 days. long_term = 90+ days.\n\nJSON STRUCTURE (respond with this and nothing else):\n{"program_name":"string","program_type":"string","write_up":{"greeting":"string","goals":["string"],"approach":["string"]},"nutrition":{"daily_calories":0,"protein_g":0,"carbs_g_training":0,"carbs_g_rest":0,"fat_g_training":0,"fat_g_rest":0,"approach":"string","sample_training_day":{"breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0}},"sample_rest_day":{"breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0}}},"training":{"split":"string","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rir_week2":"string","rir_week3":"string","rir_week4":"string","rest":"string","note":"string"}]}]}]},"sleep_protocol":{"morning":["string"],"evening":["string"],"sleep_environment":["string"],"priority_fixes":["string"]},"environment_protocol":{"immediate_wins":["string"],"short_term":["string"],"long_term":["string"]}}';
};

function repairJson(str) {
  // Remove trailing incomplete items and close open structures
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

  // Truncate to last complete structure and close open brackets
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
    // Get intake from DB if not passed directly
    var intake = intakeData;
    var profile = {};

    if (!intake) {
      var intakeRes = await supabase.from('intake_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).single();
      if (intakeRes.error || !intakeRes.data) return res.status(404).json({ error: 'Intake not found' });
      intake = intakeRes.data;
    }

    var profileRes = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileRes.data) profile = profileRes.data;

    // Create pending program record
    var insertResult = await supabase.from('generated_programs').insert({
      user_id: userId,
      status: 'generating',
      generation_month: new Date().toISOString().slice(0, 7)
    }).select().single();

    var programId = insertResult.data ? insertResult.data.id : null;

    // Call Claude
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

    // Extract JSON with robust parsing
    var jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    var jsonStr = jsonMatch[0];

    // Clean common issues: smart quotes, control characters
    jsonStr = jsonStr
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/,(\s*[}\]])/g, '$1'); // trailing commas

    var generated;
    try {
      generated = JSON.parse(jsonStr);
    } catch(parseErr) {
      // Try to repair truncated JSON by closing open brackets
      try {
        var repaired = repairJson(jsonStr);
        generated = JSON.parse(repaired);
        console.log('JSON repaired successfully');
      } catch(repairErr) {
        console.error('JSON repair also failed:', repairErr.message);
        throw new Error('JSON parse failed: ' + parseErr.message);
      }
    }

    // Save to DB
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
