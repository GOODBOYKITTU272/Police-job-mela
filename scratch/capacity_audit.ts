
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function capacityAudit() {
  console.log('🏛️  MELA CAPACITY AUDIT: Sector Breakdown');
  
  const sectors = [
    'Hospitality & Support',
    'Manufacturing / Logistics',
    'IT / Software',
    'Healthcare'
  ];

  for (const s of sectors) {
    const { data: companies, error } = await supabase
      .from('Company_details')
      .select('vacancy')
      .eq('sector', s);
      
    const totalVacancy = (companies || []).reduce((acc, curr) => acc + (Number(curr.vacancy) || 0), 0);
    const count = (companies || []).length;
    
    console.log(`📍 Sector: ${s}`);
    console.log(`   🏢 Companies: ${count}`);
    console.log(`   🎟️  Total Vacancies: ${totalVacancy}`);
    if (totalVacancy === 0) console.log(`   ⚠️  WARNING: NO VACANCIES IN THIS SECTOR!`);
    console.log('------------------------------------------');
  }
  
  // Check candidate distribution (Estimated)
  const { count: totalCandidates } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
  console.log(`\n👥 Total Registered Candidates: ${totalCandidates}`);
}

capacityAudit();
