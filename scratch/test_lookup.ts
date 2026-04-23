import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLookup(query: string) {
  console.log(`Searching for: ${query}`);
  
  // 1. Try ID
  let { data: candidate, error: cErr } = await supabase
    .from('candidates')
    .select('*')
    .ilike('id', query)
    .maybeSingle();

  console.log('ID Match:', candidate ? 'YES' : 'NO');

  // 2. Try Phone
  if (!candidate) {
    const { data: phoneCandidate, error: pErr } = await supabase
      .from('candidates')
      .select('*')
      .eq('phone', query)
      .maybeSingle();
    
    if (phoneCandidate) {
      candidate = phoneCandidate;
      console.log('Phone Match: YES');
    } else {
      console.log('Phone Match: NO');
    }
  }

  if (candidate) {
    console.log('Candidate found in Supabase:', candidate.name);
  } else {
    console.log('Final Result: NOT FOUND');
  }
}

testLookup('7997832837');
