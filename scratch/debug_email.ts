
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmail(email: string) {
  console.log(`Searching for: ${email}`);
  
  // Try exact
  const { data: exact } = await supabase
    .from('candidates')
    .select('*')
    .eq('email', email);
    
  // Try case-insensitive
  const { data: insensitive } = await supabase
    .from('candidates')
    .select('*')
    .ilike('email', email);

  // Try partial
  const { data: partial } = await supabase
    .from('candidates')
    .select('*')
    .ilike('email', `%chintu%`);

  console.log('Exact Match:', exact?.length || 0);
  console.log('Case-Insensitive Match:', insensitive?.length || 0);
  console.log('Partial Match (chintu):', partial?.length || 0);
  
  if (partial && partial.length > 0) {
    console.log('Sample matches:', partial.map(p => p.email));
  }
}

checkEmail('CHINTUHANMANTHU19@GMAIL.COM');
