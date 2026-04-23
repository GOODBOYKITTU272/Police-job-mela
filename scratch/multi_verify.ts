
import { getCandidateById, getCandidateRouting } from '../src/lib/supabase';

async function verifyCandidates() {
  const testPhones = ['9121322969', '8096725632', '6300106629'];
  console.log('🚀 Starting Multi-Candidate Verification...\n');
  
  for (const phone of testPhones) {
    console.log(`🔍 Checking Candidate with Phone: ${phone}`);
    const candidates = await getCandidateById(phone);
    
    if (candidates && candidates.length > 0) {
      const c = candidates[0];
      const routing = await getCandidateRouting(c);
      
      console.log(`👤 Name: ${c.name}`);
      console.log(`🎓 Education: ${c.education_qualification || 'N/A'}`);
      console.log(`🏛️  Assigned Sector: ${routing.assigned_sector}`);
      console.log(`🏢 Top Matching Companies:`);
      routing.companies.forEach((comp, i) => {
        console.log(`   ${i+1}. ${comp.company_name} (Vacancy: ${comp.vacancy})`);
      });
      console.log('-------------------------------------------\n');
    } else {
      console.log(`❌ Candidate with phone ${phone} not found.\n`);
    }
  }
}

verifyCandidates();
