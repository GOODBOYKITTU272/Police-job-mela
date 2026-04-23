
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSectors() {
  console.log('🔍 Checking exact sector strings in Company_details...');
  const { data, error } = await supabase
    .from('Company_details')
    .select('sector');
    
  if (data) {
    const sectors = [...new Set(data.map(d => d.sector))];
    console.log('🌍 Exact Sector Values found:');
    sectors.forEach(s => console.log(`[${s}]`));
  }
}

checkSectors();
