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
  return 'You are the Rallis Regimen program generator. Generate a complete personalized program as valid JSON only. No text before or after the JSON.\n\nMEMBER:\nName: ' + (profile.full_name || profile.first_name || 'Member') + '\nAge: ' + intake.age + '\nSex: ' + intake.sex + '\nCurrent weight: ' + intake.current_weight_lbs + ' lbs\nIdeal weight: ' + intake.ideal_weight_lbs + ' lbs\nPrimary goal: ' + intake.goal_primary + '\nSecondary goal: ' + intake.goal_secondary + '\nExperience: ' + intake.experience_level + '\nEquipment: ' + intake.equipment + '\nTraining days/week: ' + intake.training_days_per_week + '\nSession length: ' + intake.session_length_mins + ' min\nInjuries: ' + (intake.injuries_limitations || 'none') + '\nWeight goal: ' + intake.weight_management_goal + '\nDietary restrictions: ' + ((intake.dietary_restrictions && intake.dietary_restrictions.join) ? intake.dietary_restrictions.join(', ') : 'none') + '\nFoods to avoid: ' + (intake.foods_to_avoid || 'none') + '\nNutrition approach: ' + intake.nutrition_approach + '\nTravel frequency: ' + (intake.travel_frequency || 'rarely') + '\nFood preferences: ' + (intake.food_preferences || 'none') + '\nSleep hours: ' + intake.avg_sleep_hours + '\nSleep issues: ' + (intake.sleep_issue || 'none') + '\nCaffeine after noon: ' + intake.caffeine_after_noon + '\nPhone in bedroom: ' + intake.phone_in_bedroom + '\nFilters water: ' + intake.filters_water + '\nMorning sunlight: ' + intake.morning_sunlight + '\nNon-stick cookware: ' + intake.nonstick_cookware + '\nSuccess vision: ' + (intake.success_vision || 'not provided') + '\n\nGenerate a program following Rallis Regimen methodology. Use RIR progression (W1:3-4, W2:2-3, W3:1-2, W4:deload 7-8). Match equipment strictly. Apply Mifflin-St Jeor for calories. Protein 1g per lb ideal bodyweight. Carb cycle (high training days, low rest days).\n\nRespond with ONLY this JSON structure:\n{"program_name":"string","program_type":"string","write_up":{"greeting":"string","goals":["string"],"approach":["string"]},"nutrition":{"daily_calories":0,"protein_g":0,"carbs_g_training":0,"carbs_g_rest":0,"fat_g":0,"approach":"string","sample_training_day":{"breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0}},"sample_rest_day":{"breakfast":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"shake":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"lunch":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dinner":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0},"dessert":{"description":"string","protein_g":0,"carbs_g":0,"fat_g":0,"calories":0}}},"training":{"split":"string","weekly_schedule":{"day_1":"string","day_2":"string","day_3":"string","day_4":"string","day_5":"string","day_6":"string","day_7":"string"},"blocks":[{"block":1,"weeks":"1-4","days":[{"day":"string","focus":"string","type":"string","exercises":[{"name":"string","sets":3,"reps":"string","rir_week1":"string","rest":"string","note":"string"}]}]}]},"sleep_protocol":{"morning":["string"],"evening":["string"],"sleep_environment":["string"],"priority_fixes":["string"]},"environment_protocol":{"immediate_wins":["string"],"short_term":["string"],"long_term":["string"]}}';
};

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
        max_tokens: 4000,
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

    // Extract JSON
    var jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    var generated = JSON.parse(jsonMatch[0]);

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
