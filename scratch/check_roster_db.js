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
  const { data: roster, error: rErr } = await supabase.from('team_roster').select('*');
  console.log('team_roster rows count:', roster ? roster.length : 0, rErr ? rErr.message : '');
  if (roster) {
    roster.forEach(r => console.log(`${r.employee_id}: ${r.name} | ${r.role} | ${r.position} | ${r.shift}`));
  }

  // Check all tables in database
  const checkNames = [
    'punch_logs', 'shift_punches', 'punches', 'attendance', 'phone_time_records',
    'time_records', 'user_punches', 'daily_attendance', 'shifts', 'schedules'
  ];

  for (const name of checkNames) {
    const { data, error } = await supabase.from(name).select('*').limit(2);
    if (!error && data !== null) {
      console.log(`FOUND table ${name}: ${data.length} rows`);
    }
  }
}

check();
