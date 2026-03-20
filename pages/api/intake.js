import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var data = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  var supabase = getSupabase();

  try {
    // Upsert profile server-side
    if (data.user_id && data.email) {
      var profileResult = await supabase.from('profiles').upsert({
        id: data.user_id,
        email: data.email,
        full_name: data.first_name || null,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      });
      if (profileResult.error) {
        console.error('Profile upsert error:', JSON.stringify(profileResult.error));
      }
    }

    // Only include columns that exist in intake_submissions
    var payload = {
      user_id: data.user_id || null,
      first_name: data.first_name || null,
      age: data.age || null,
      sex: data.sex || null,
      height_ft: data.height_ft || null,
      height_in: data.height_in || null,
      current_weight_lbs: data.current_weight_lbs || null,
      ideal_weight_lbs: data.ideal_weight_lbs || null,
      goal_primary: data.goal_primary || null,
      goal_secondary: data.goal_secondary || null,
      experience_level: data.experience_level || null,
      training_days_per_week: data.training_days_per_week || null,
      session_length_mins: data.session_length_mins || null,
      equipment: data.equipment || null,
      equipment_detail: data.equipment_detail || null,
      burnout_history: data.burnout_history || null,
      injuries_limitations: data.injuries_limitations || null,
      weight_management_goal: data.weight_management_goal || null,
      nutrition_approach: data.nutrition_approach || null,
      travel_frequency: data.travel_frequency || null,
      dietary_restrictions: data.dietary_restrictions || null,
      food_preferences: data.food_preferences || null,
      foods_to_avoid: data.foods_to_avoid || null,
      avg_sleep_hours: data.avg_sleep_hours || null,
      sleep_issue: data.sleep_issue || null,
      typical_bedtime: data.typical_bedtime || null,
      typical_wake_time: data.typical_wake_time || null,
      caffeine_after_noon: data.caffeine_after_noon || false,
      phone_in_bedroom: data.phone_in_bedroom || false,
      filters_water: data.filters_water || false,
      morning_sunlight: data.morning_sunlight || false,
      nonstick_cookware: data.nonstick_cookware || false,
      conventional_cleaning: data.conventional_cleaning || false,
      phone_in_bedroom_sleeping: data.phone_in_bedroom_sleeping || false,
      success_vision: data.success_vision || null,
      submitted_at: new Date().toISOString()
    };

    console.log('Inserting intake for user_id:', payload.user_id);
    var result = await supabase.from('intake_submissions').insert(payload);

    if (result.error) {
      console.error('Intake insert error:', JSON.stringify(result.error));
      return res.status(500).json({ error: result.error.message });
    }

    console.log('Intake saved successfully for user:', payload.user_id);

    // Trigger generation
    if (data.user_id) {
      var appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rallisregimen.com';
      fetch(appUrl + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user_id })
      }).catch(function(e) { console.error('Generate trigger error:', e.message); });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Intake API error:', err.message, err.stack);
    return res.status(500).json({ error: 'Failed to save intake: ' + err.message });
  }
}
