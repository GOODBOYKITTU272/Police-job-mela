
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('📋 AUDIT: Listing all tables in public schema...');
  
  // Using an RPC or a known table to probe
  const { data, error } = await supabase.from('candidates').select('id').limit(1);
  if (error) console.log('Candidates Error:', error.message);
  else console.log('✅ Candidates table found.');

  // Try to find Company_details variants
  const variants = ['Company_details', 'company_details', 'COMPANY_DETAILS', '"Company_details"'];
  for (const v of variants) {
    const { data: d, error: e } = await supabase.from(v).select('*').limit(1);
    if (!e) console.log(`🎯 SUCCESS: Found table using name: [${v}]`);
    else console.log(`❌ FAILED: [${v}] -> ${e.message}`);
  }
}

listTables();
