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
  const { data: logs } = await supabase.from('phone_time_records').select('*');
  console.log('Total phone_time_records:', logs ? logs.length : 0);
  if (logs) {
    logs.forEach(l => console.log(`Name: "${l.name}" | Account: ${l.account} | TotalMin: ${l.total_minutes}`));
  }
}
check();
