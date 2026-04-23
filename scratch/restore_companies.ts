
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreCompanies() {
  console.log('🚀 Restoring Company Data from Screenshot...');
  
  const companies = [
    { company_name: 'Dubbak School', sector: 'Hospitality & Support', vacancy: 4, education: 'SSC', assigned_count: 0 },
    { company_name: 'Dxn2u', sector: 'Manufacturing / Logistics', vacancy: 18, education: 'SSC', assigned_count: 0 },
    { company_name: 'Applywizz', sector: 'IT / Software', vacancy: 8, education: 'B.TECH', assigned_count: 0 },
    { company_name: 'Citrux', sector: 'IT / Software', vacancy: 5, education: 'B.TECH', assigned_count: 0 },
    { company_name: 'Isnap', sector: 'IT / Software', vacancy: 2, education: 'B.TECH', assigned_count: 0 },
    { company_name: 'Kalpratech', sector: 'IT / Software', vacancy: 300, education: 'B.TECH', assigned_count: 0 },
    { company_name: 'Surabbhi Medical College', sector: 'Hospitality & Support', vacancy: 9, education: 'SSC', assigned_count: 0 },
    { company_name: 'Your volta services private limited', sector: 'IT / Software', vacancy: 4, education: 'DEGREE OR EQUIVALENT', assigned_count: 0 },
    { company_name: 'Gmail', sector: 'Manufacturing / Logistics', vacancy: 2, education: 'SSC', assigned_count: 0 },
    { company_name: 'Neospark Drugs and Chemicals Private Li', sector: 'Healthcare', vacancy: 3, education: 'DEGREE OR EQUIVALENT', assigned_count: 0 }
  ];

  const { error } = await supabase
    .from('Company_details')
    .insert(companies);

  if (error) console.error('❌ Error:', error.message);
  else console.log('✅ Successfully restored 10 companies to Company_details.');
}

restoreCompanies();
