import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var userId = req.body.userId;
  var suggestion = req.body.suggestion;

  if (!userId || !suggestion) return res.status(400).json({ error: 'userId and suggestion required' });

  var supabase = getSupabase();

  try {
    // Get current program
    var programRes = await supabase
      .from('generated_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ready')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (programRes.error || !programRes.data) {
      return res.status(404).json({ error: 'No program found' });
    }

    var program = programRes.data;

    if (suggestion.type === 'meal') {
      // Update a specific meal in the meal plan
      var mealPlan = program.meal_plan;
      if (mealPlan && mealPlan.meal_plan && Array.isArray(mealPlan.meal_plan)) {
        mealPlan.meal_plan = mealPlan.meal_plan.map(function(day) {
          // Update matching day type or specific day
          if (suggestion.day && day.day !== suggestion.day) return day;
          if (!suggestion.day && suggestion.day_type && day.type !== suggestion.day_type) return day;
          if (suggestion.meal && day[suggestion.meal]) {
            var updatedDay = Object.assign({}, day);
            updatedDay[suggestion.meal] = {
              description: suggestion.description,
              protein_g: suggestion.protein_g,
              carbs_g: suggestion.carbs_g,
              fat_g: suggestion.fat_g,
              calories: suggestion.calories
            };
            return updatedDay;
          }
          return day;
        });
      }

      await supabase
        .from('generated_programs')
        .update({ meal_plan: mealPlan })
        .eq('id', program.id);

    } else if (suggestion.type === 'exercise') {
      // Replace an exercise in the training program
      var training = program.training_program;
      if (training && training.blocks) {
        training.blocks = training.blocks.map(function(block) {
          if (block.days) {
            block.days = block.days.map(function(day) {
              if (day.exercises) {
                day.exercises = day.exercises.map(function(ex) {
                  if (ex.name && ex.name.toLowerCase() === suggestion.original_exercise.toLowerCase()) {
                    return Object.assign({}, ex, { name: suggestion.new_exercise, note: suggestion.note || ex.note });
                  }
                  return ex;
                });
              }
              return day;
            });
          }
          return block;
        });
      }

      await supabase
        .from('generated_programs')
        .update({ training_program: training })
        .eq('id', program.id);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save suggestion error:', err);
    return res.status(500).json({ error: err.message });
  }
}
