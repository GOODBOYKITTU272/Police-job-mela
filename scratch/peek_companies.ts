
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function peekCompanies() {
  console.log('📊 Checking Company_details content...');
  const { data, error } = await supabase
    .from('Company_details')
    .select('company_name, sector, vacancy')
    .limit(10);
    
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.table(data);
    
    // Check distinct sectors
    const sectors = [...new Set(data.map(d => d.sector))];
    console.log('🌍 Unique Sectors found in DB:', sectors);
  }
}

peekCompanies();
