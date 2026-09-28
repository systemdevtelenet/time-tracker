const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: logs, error } = await supabase
    .from('time_tracker_logs')
    .select('*')
    .or('employee_id.eq.1597,"EMPLOYEE ID".eq.1597,employee_id.eq.1597');

  console.log('Total for 1597:', logs ? logs.length : 0);
  if (logs) {
    const todayLogs = logs.filter(l => {
      const ts = l.TIMESTAMP || l.timestamp;
      return ts && (ts.startsWith('9/28/2026') || ts.startsWith('2026-09-28'));
    });
    console.log('Today (9/28) logs:', todayLogs);
  }
}
run();
