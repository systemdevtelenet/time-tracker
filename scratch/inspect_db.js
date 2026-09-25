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
  const { data: records, error } = await supabase.from('phone_time_tracker').select('*');
  console.log('--- PHONE TIME TRACKER (Length: ' + (records ? records.length : 0) + ') ---');
  if (records) {
    console.log(records.map(r => ({ id: r.id, name: r.name, date_of_shift: r.date_of_shift, total_minutes: r.total_minutes })));
  }
}
run();
