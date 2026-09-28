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
    .order('LOG ID', { ascending: false })
    .limit(20);

  console.log('Latest 20 by LOG ID:');
  console.log(logs);

  const { data: nissiLogs } = await supabase
    .from('time_tracker_logs')
    .select('*')
    .ilike('TIMESTAMP', '%9/28%');
  console.log('9/28 logs:', nissiLogs);
}
run();
