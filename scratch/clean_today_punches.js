const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clean() {
  const { data: records, error } = await supabase
    .from('time_tracker_logs')
    .select('*')
    .ilike('TIMESTAMP', '%9/28/2026%');

  console.log('Found:', records ? records.length : 0);
  if (records && records.length > 0) {
    for (const r of records) {
      const logId = r['LOG ID'];
      const { error: delErr } = await supabase
        .from('time_tracker_logs')
        .delete()
        .eq('LOG ID', logId);
      if (delErr) console.error('Delete error for', logId, delErr);
      else console.log('Deleted:', logId);
    }
  }
}
clean();
