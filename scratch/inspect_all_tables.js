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
  console.log('Testing Supabase Connection to:', url);

  // Check information schema or common tables
  const tables = [
    'team_roster', 'employees', 'punch_logs', 'shift_punches', 'attendance',
    'phone_time_records', 'time_entries', 'users', 'roster', 'shifts',
    'schedules', 'attendance_logs', 'punch_history', 'time_logs',
    'employee_directory', 'workforce_roster', 'workforce', 'staff'
  ];
  
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(5);
      if (!error && data !== null) {
        console.log(`Table: ${t} - Count: ${data.length}`);
        if (data.length > 0) {
          console.log(`Sample from ${t}:`, JSON.stringify(data[0], null, 2));
        }
      } else if (error) {
        // console.log(`Table ${t} not found or error: ${error.message}`);
      }
    } catch (err) {
      console.log(`Err on ${t}:`, err.message);
    }
  }
}

check();
