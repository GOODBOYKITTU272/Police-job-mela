
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlignment() {
  console.log('🔍 AUDIT: Checking if B.TECH jobs exist in SSC sectors...');
  
  const { data, error } = await supabase
    .from('Company_details')
    .select('company_name, sector, education')
    .in('sector', ['Manufacturing / Logistics', 'Hospitality & Support']);
    
  if (data) {
    const btechInSsc = data.filter(d => (d.education || '').toUpperCase().includes('B.TECH'));
    if (btechInSsc.length > 0) {
      console.log('⚠️  FOUND B.TECH JOBS IN SSC SECTORS:');
      console.table(btechInSsc);
    } else {
      console.log('✅ CLEAN: No B.TECH jobs found in the SSC halls.');
    }
  }
}

checkAlignment();
