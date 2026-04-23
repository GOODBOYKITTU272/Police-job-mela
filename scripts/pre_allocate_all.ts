import { createClient } from '@supabase/supabase-js';
import { getCandidateRouting } from '../src/lib/supabase';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function preAllocateAll() {
  console.log('🚀 Starting Pre-Allocation for all candidates...');

  // 1. Fetch all candidates in batches
  const batchSize = 500;
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('❌ Error fetching candidates:', error.message);
      break;
    }

    if (!candidates || candidates.length === 0) break;

    console.log(
      `📦 Processing batch ${offset / batchSize + 1} (${candidates.length} candidates)...`
    );

    for (const candidate of candidates) {
      // getCandidateRouting handles checking for existing allocations + inserting new ones + updating counts
      try {
        await getCandidateRouting(candidate);
        totalProcessed++;
      } catch (e) {
        console.error(`❌ Failed for ${candidate.id}:`, e);
      }
    }

    offset += batchSize;
    console.log(`✅ Progress: ${totalProcessed} candidates allocated.`);
  }

  console.log(`\n🎉 FINISHED! Total candidates pre-allocated: ${totalProcessed}`);
}

preAllocateAll();
