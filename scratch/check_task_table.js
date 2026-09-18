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

async function test() {
  const checkTables = [
    'flowhub_tasks', 'tasks', 'flow_hub_tasks', 'kanban_tasks', 
    'flow_hub_data', 'todos', 'task_items', 'supervisor_notes',
    'phone_time_tracker', 'attendance_logs', 'team_roster', 'employees'
  ];
  for (const t of checkTables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(2);
      if (!error) {
        console.log(`[EXISTS] Table: "${t}" - Rows: ${data ? data.length : 0}`);
      } else {
        console.log(`[NOT FOUND] Table: "${t}" - Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`[EXCEPTION] Table "${t}": ${err.message}`);
    }
  }
}

test();
