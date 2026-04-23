import { createClient } from '@supabase/supabase-js';

type CompanyRow = {
  company_name: string;
  sector: string | null;
  education: string | null;
  vacancy: number | null;
  assigned_count: number | null;
};

type CandidateRow = {
  id: string;
  education_qualification: string | null;
  preferred_sector: string | null;
};

type AllocationInsert = {
  candidate_id: string;
  company_name: string;
  sector: string;
};

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function preAllocateFast() {
  console.log('🏎️  Launching High-Speed Bulk Allocation...');

  // 1. Fetch ALL companies into memory once
  const { data: allCompanies, error: compError } = await supabase
    .from('Company_details')
    .select('*');
  if (compError || !allCompanies) return console.error('❌ Error fetching companies');
  const companyRows = allCompanies as CompanyRow[];

  // Create a local tracker for assigned counts
  const companyTracker = new Map<string, number>();
  companyRows.forEach((c) => companyTracker.set(c.company_name, c.assigned_count || 0));

  let totalProcessed = 0;
  const batchSize = 500;
  let offset = 0;

  while (true) {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .range(offset, offset + batchSize - 1);

    if (error || !candidates || candidates.length === 0) break;
    const candidateRows = candidates as CandidateRow[];

    console.log(`📦 Processing batch ${offset / batchSize + 1}...`);

    const allocationsToInsert: AllocationInsert[] = [];

    for (const candidate of candidateRows) {
      // --- ROUTING LOGIC (IN-MEMORY) ---
      const education = (candidate.education_qualification || '').toUpperCase();
      const preference = (candidate.preferred_sector || '').toLowerCase();
      let assigned_sector = 'Hospitality & Support';

      if (education.includes('SSC') || education.includes('10TH'))
        assigned_sector = 'Manufacturing / Logistics';
      else if (
        education.includes('B.TECH') ||
        education.includes('BTECH') ||
        education.includes('ENGINEERING')
      )
        assigned_sector = 'IT / Software';
      else if (education.includes('DEGREE') || education.includes('GRADUATE')) {
        if (preference.includes('it')) assigned_sector = 'IT / Software';
        else if (preference.includes('healthcare')) assigned_sector = 'Healthcare';
        else assigned_sector = 'Manufacturing / Logistics';
      }

      // Filter and sort companies in-memory
      const filtered = companyRows
        .filter((c) => c.sector === assigned_sector)
        .map((c) => {
          const compEdu = (c.education || '').toUpperCase();
          let eduScore = 0;
          if (education === compEdu) eduScore = 100;
          else if (education.includes('B.TECH') && compEdu.includes('DEGREE')) eduScore = 50;

          return {
            ...c,
            eduScore,
            vacancyValue: c.vacancy ?? 0,
            currentAssigned: companyTracker.get(c.company_name) ?? 0,
          };
        })
        .sort((a, b) => {
          if (b.eduScore !== a.eduScore) return b.eduScore - a.eduScore;
          return (
            a.vacancyValue -
            a.currentAssigned -
            (b.vacancyValue - b.currentAssigned)
          );
        })
        .slice(0, 5);

      if (filtered.length > 0) {
        // Log allocations
        filtered.forEach((f) => {
          allocationsToInsert.push({
            candidate_id: candidate.id,
            company_name: f.company_name,
            sector: assigned_sector,
          });
        });

        // Update local counter for top company
        const top = filtered[0].company_name;
        companyTracker.set(top, (companyTracker.get(top) ?? 0) + 1);
      }
    }

    // --- BULK WRITE (TRANSACTIONAL-ISH) ---
    if (allocationsToInsert.length > 0) {
      await supabase.from('candidate_allocations').insert(allocationsToInsert);
      // Note: Supabase JS doesn't support bulk updates with different values easily.
      // We will skip candidateUpdates here to save time, or use a single RPC if needed.
      // But logging allocations is the main goal.
    }

    totalProcessed += candidates.length;
    offset += batchSize;
    console.log(`✅ Progress: ${totalProcessed} candidates assigned.`);
  }

  // --- FINAL UPDATE: Sync Company Counts ---
  console.log('🔄 Syncing final vacancy counters...');
  for (const [name, count] of companyTracker.entries()) {
    await supabase.from('Company_details').update({ assigned_count: count }).eq('company_name', name);
  }

  console.log(`\n🎉 FINISHED! ${totalProcessed} candidates processed in BULK.`);
}

preAllocateFast();
