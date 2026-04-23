import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, count, error } = await supabase
    .from('candidates')
    .select('id, name', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total Candidates in Supabase:', count);
  console.log('First 5 names:', data?.slice(0, 5).map(c => c.name));
}

check();
