
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedRouting() {
  console.log('🚀 Seeding Operational Routing Data...');
  
  const companies = [
    { company_name: 'Kalpratech Solutions', sector: 'IT / Software', vacancy: 300, assigned_count: 0 },
    { company_name: 'ApplyWizz Tech', sector: 'IT / Software', vacancy: 150, assigned_count: 0 },
    { company_name: 'Citrux Systems', sector: 'IT / Software', vacancy: 80, assigned_count: 0 },
    { company_name: 'Hospira Healthcare', sector: 'Healthcare', vacancy: 200, assigned_count: 0 },
    { company_name: 'Apollo Medics', sector: 'Healthcare', vacancy: 120, assigned_count: 0 },
    { company_name: 'Hetero Drugs', sector: 'Healthcare', vacancy: 250, assigned_count: 0 },
    { company_name: 'Foxconn Manufacturing', sector: 'Manufacturing / Logistics', vacancy: 500, assigned_count: 0 },
    { company_name: 'Amazon Logistics', sector: 'Manufacturing / Logistics', vacancy: 400, assigned_count: 0 },
    { company_name: 'Tata Motors', sector: 'Manufacturing / Logistics', vacancy: 150, assigned_count: 0 },
    { company_name: 'Marriott International', sector: 'Hospitality & Support', vacancy: 100, assigned_count: 0 },
    { company_name: 'Taj Group', sector: 'Hospitality & Support', vacancy: 80, assigned_count: 0 },
    { company_name: 'QuickSupport Services', sector: 'Hospitality & Support', vacancy: 200, assigned_count: 0 }
  ];

  for (const company of companies) {
    const { error } = await supabase
      .from('company_allocation')
      .upsert(company, { onConflict: 'company_name' });
      
    if (error) console.error(`❌ Error seeding ${company.company_name}:`, error.message);
    else console.log(`✅ Seeded ${company.company_name}`);
  }

  console.log('🎯 Operational Routing Seed Complete.');
}

seedRouting();
