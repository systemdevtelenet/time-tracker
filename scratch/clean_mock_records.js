const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function cleanMockRecords() {
  console.log('Cleaning up Charles Espinosa and Badz from phone_time_tracker...');
  
  const { data: d1, error: e1 } = await supabase
    .from('phone_time_tracker')
    .delete()
    .or('name.ilike.%Charles%,name.ilike.%Badz%');

  if (e1) {
    console.error('Delete error:', e1);
  } else {
    console.log('Successfully deleted Charles and Badz entries.');
  }

  const { data: remaining, error: e2 } = await supabase.from('phone_time_tracker').select('*');
  console.log('Remaining records:', remaining);
}

cleanMockRecords();
