import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDupPhones() {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, name, phone')
    .eq('phone', '7997832837');
  
  if (error) console.error('Error:', error);
  console.log('Count Found:', data?.length);
  console.log('Results:', data);
}

checkDupPhones();
