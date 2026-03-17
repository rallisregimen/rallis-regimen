// pages/api/generate.js
// Generates personalized programs from intake data using Claude

import { getServerSupabase } from '../../lib/supabase'

const GENERATION_PROMPT = (intake, profile) => `You are the Rallis Regimen program generator. Based on the member profile below, generate a complete personalized program in valid JSON format.

MEMBER PROFILE:
Name: ${profile.first_name}
Age: ${intake.age}
Sex: ${intake.sex}
Current weight: ${intake.current_weight_lbs} lbs
Ideal weight: ${intake.ideal_weight_lbs} lbs
Primary goal: ${intake.goal_primary}
Secondary goal: ${intake.goal_secondary}
Experience level: ${intake.experience_level}
Equipment: ${intake.equipment}
Training days per week: ${intake.training_days_per_week}
Session length: ${intake.session_length_mins} minutes
Injuries/limitations: ${intake.injuries_limitations || 'none'}
Weight management goal: ${intake.weight_management_goal}
Dietary restrictions: ${intake.dietary_restrictions?.join(', ') || 'none'}
Foods to avoid: ${intake.foods_to_avoid || 'none'}
Nutrition approach: ${intake.nutrition_approach}
Avg sleep hours: ${intake.avg_sleep_hours}
Sleep issues: ${intake.sleep_issue}
Caffeine after noon: ${intake.caffeine_after_noon}
Phone in bedroom: ${intake.phone_in_bedroom}
Filters water: ${intake.filters_water}
Morning sunlight: ${intake.morning_sunlight}
Non-stick cookware: ${intake.nonstick_cookware}

PROGRAM REQUIREMENTS:
- Apply Mifflin-St Jeor equation to calculate daily calorie target
- Protein: 1g per lb of ideal bodyweight
- 12-week program with 3 blocks of 4 weeks
- RIR progression: Week 1=3-4, Week 2=2-3, Week 3=1-2, Week 4=7-8 (deload)
- Match equipment constraints strictly
- Apply stability-power principle to all exercise selection
- Full gym = Upper/Lower or Push/Pull/Lower split based on days available
- Home/bands = Full body 3x per week with rep/iso/band day rotation
- Include warm-up and recovery protocols
- Generate meal plan matching their calorie target, weight goal, and dietary restrictions
- Apply carb cycling (high on training days, low on rest days)
- Generate sleep protocol based on their specific sleep data
- Generate environment priority list based on their audit answers

Respond ONLY with valid JSON matching this exact structure:
{
  "program_name": "string",
  "program_type": "string",
  "write_up": {
    "greeting": "string",
    "goals": ["string"],
    "approach": ["string"]
  },
  "nutrition": {
    "daily_calories": number,
    "protein_g": number,
    "carbs_g_training": number,
    "carbs_g_rest": number,
    "fat_g": number,
    "approach": "string",
    "sample_training_day": {
      "breakfast": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "shake": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "lunch": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "dinner": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "dessert": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number}
    },
    "sample_rest_day": {
      "breakfast": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "shake": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "lunch": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "dinner": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number},
      "dessert": {"description": "string", "protein_g": number, "carbs_g": number, "fat_g": number, "calories": number}
    }
  },
  "training": {
    "split": "string",
    "weekly_schedule": {
      "day_1": "string",
      "day_2": "string",
      "day_3": "string",
      "day_4": "string",
      "day_5": "string",
      "day_6": "string",
      "day_7": "string"
    },
    "blocks": [
      {
        "block": 1,
        "weeks": "1-4",
        "days": [
          {
            "day": "string",
            "focus": "string",
            "exercises": [
              {
                "name": "string",
                "sets": number,
                "reps": "string",
                "rir_week1": "string",
                "rir_week2": "string",
                "rir_week3": "string",
                "rir_week4": "string",
                "rest": "string",
                "note": "string",
                "superset_with": "string or null"
              }
            ]
          }
        ]
      }
    ]
  },
  "sleep_protocol": {
    "morning": ["string"],
    "evening": ["string"],
    "sleep_environment": ["string"],
    "priority_fixes": ["string"]
  },
  "environment_protocol": {
    "immediate_wins": ["string"],
    "short_term": ["string"],
    "long_term": ["string"]
  }
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' })
  }

  const supabase = getServerSupabase()

  try {
    // Fetch member data
    const [profileRes, intakeRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('intake_submissions').select('*').eq('user_id', userId).single()
    ])

    if (intakeRes.error || !intakeRes.data) {
      return res.status(404).json({ error: 'Intake not found' })
    }

    const intake = intakeRes.data
    const profile = profileRes.data || {}

    // Create program record with generating status
    const { data: programRecord, error: createError } = await supabase
      .from('generated_programs')
      .insert({
        user_id: userId,
        status: 'generating',
        generation_month: new Date().toISOString().slice(0, 7)
      })
      .select()
      .single()

    if (createError) throw createError

    // Call Claude to generate the program
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: GENERATION_PROMPT(intake, profile)
        }]
      })
    })

    if (!response.ok) throw new Error('Generation API failed')

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const generated = JSON.parse(jsonMatch[0])

    // Save generated program
    await supabase
      .from('generated_programs')
      .update({
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
      })
      .eq('id', programRecord.id)

    return res.status(200).json({ success: true, programId: programRecord.id })

  } catch (error) {
    console.error('Generation error:', error)

    // Mark as failed
    if (userId) {
      await supabase
        .from('generated_programs')
        .update({ status: 'failed' })
        .eq('user_id', userId)
        .eq('status', 'generating')
    }

    return res.status(500).json({ error: 'Program generation failed' })
  }
}
