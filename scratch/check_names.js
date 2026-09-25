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
  const { data, error } = await supabase.from('phone_time_tracker').select('*');
  console.log('Total records in phone_time_tracker:', data ? data.length : 0);
  if (data) {
    const names = [...new Set(data.map(d => d.name.trim()))];
    console.log('Unique names in phone_time_tracker:', names);
  }
}
run();
