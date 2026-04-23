
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function initOfficialTable() {
  console.log('🚀 Synchronizing Routing with Company_details...');
  
  // Note: We can't run ALTER TABLE directly from JS client without RPC.
  // We will try to update the first row to see if the column exists.
  const { data: test, error: testError } = await supabase
    .from('Company_details')
    .select('assigned_count')
    .limit(1);

  if (testError && testError.message.includes('column "assigned_count" does not exist')) {
    console.log('⚠️ Column "assigned_count" is missing. Please add it via Supabase SQL Editor:');
    console.log('ALTER TABLE "Company_details" ADD COLUMN assigned_count INTEGER DEFAULT 0;');
  } else {
    // Column exists, let's reset it to ensure a fresh start
    console.log('✅ Column exists. Resetting counters for all 61 companies...');
    const { error: resetError } = await supabase
      .from('Company_details')
      .update({ assigned_count: 0 })
      .gt('vacancy', -1); // Match all rows with a vacancy

    if (resetError) console.error('❌ Error resetting counters:', resetError.message);
    else console.log('🎯 Official Table Sync Complete.');
  }
}

initOfficialTable();
