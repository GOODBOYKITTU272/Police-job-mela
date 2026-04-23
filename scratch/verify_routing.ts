
import { getCandidateById, getCandidateRouting } from '../src/lib/supabase';

async function testRouting() {
  const cid = 'CID101'; // Adjust if you have a specific test ID
  console.log(`🔍 Testing Routing for ${cid}...`);
  
  const candidates = await getCandidateById(cid);
  if (!candidates || candidates.length === 0) {
    console.log('❌ Candidate not found.');
    return;
  }

  const result = await getCandidateRouting(candidates[0]);
  console.log('✅ Sector Assigned:', result.assigned_sector);
  console.log('🏢 Top Companies:');
  result.companies.forEach((c, i) => {
    console.log(`${i+1}. ${c.company_name} (Vacancy: ${c.vacancy}, Remaining: ${c.remaining})`);
  });
}

testRouting();
