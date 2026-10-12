const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function listAll() {
  const candidateTables = [
    // Tracker & Punches
    'time_tracker_logs', 'time_tracker_employees', 'phone_time_tracker', 'activity_logs',
    'flowhub_tasks', 'accounts', 'team_roster', 'employees', 'trainers_profile', 'user_roles',
    'attendance_logs', 'trainees', 'roles', 'notifications',
    // Extra candidates
    'trainee_progress', 'trainer_ratings', 'batches', 'batch', 'training_batches',
    'classes', 'cohorts', 'daily_logs', 'attendance', 'evaluations', 'scores',
    'assessments', 'feedback', 'coaching_logs', 'coaching', 'coaching_sessions',
    'tickets', 'ticket_tags', 'tasks', 'pomodoro_sessions', 'flow_hub_tasks',
    'habits', 'notes', 'user_sessions', 'sessions', 'user_profiles', 'profiles',
    'departments', 'accounts_list', 'projects', 'logs', 'audit_logs', 'events',
    'system_events', 'announcements', 'broadcasts', 'app_settings', 'settings',
    'shifts', 'shift_schedules', 'rosters', 'agent_status', 'agent_state'
  ];
  
  const existing = [];
  for (const t of candidateTables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(1);
      if (!error) {
        existing.push({ table: t, rowCount: count ?? data?.length ?? 0 });
      }
    } catch(e) {}
  }
  console.log('TABLE_SCAN_RESULT:', JSON.stringify(existing, null, 2));
}

listAll();
