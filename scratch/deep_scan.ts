
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deepScan() {
  console.log('🔍 DEEP SCAN: Fetching all companies...');
  
  // Try with and without quotes
  const { data: q1 } = await supabase.from('Company_details').select('*').limit(5);
  const { data: q2 } = await supabase.from('"Company_details"').select('*').limit(5);
  
  console.log('Results (No Quotes):', q1 ? q1.length : 'Error');
  console.log('Results (With Quotes):', q2 ? q2.length : 'Error');
  
  if (q2 && q2.length > 0) {
    console.log('Sample Data from "Company_details":');
    console.log(JSON.stringify(q2[0], null, 2));
    
    // Check all unique sectors
    const { data: allSectors } = await supabase.from('"Company_details"').select('sector');
    if (allSectors) {
      const sectors = [...new Set(allSectors.map(s => s.sector))];
      console.log('🌍 ALL SECTORS IN DB:', sectors.map(s => `[${s}]`));
    }
  }
}

deepScan();
