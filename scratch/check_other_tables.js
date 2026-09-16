const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function check() {
  // Let's test tables from phone/call records
  const names = [
    'time_records', 'time_entries', 'phone_time_records', 'punches',
    'punch_logs', 'shift_punches', 'attendance', 'flow_hub_tasks',
    'flow_hub_pomodoro_sessions', 'flow_hub_habits', 'flow_hub_notes'
  ];

  for (const n of names) {
    const { data, error } = await supabase.from(n).select('*').limit(2);
    if (!error && data !== null) {
      console.log(`Table ${n} exists! Count: ${data.length}`);
    } else {
      // console.log(`Table ${n}: ${error?.message}`);
    }
  }
}

check();
