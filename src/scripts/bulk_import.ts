import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CSV_PATH = "C:\\Users\\DELL\\Desktop\\final list police\\candaiates  - Cleaned_Candidates (1).csv";

async function ultimateImport() {
  console.log(`🚀 Starting ULTIMATE Import from: ${CSV_PATH}`);
  
  try {
    const content = fs.readFileSync(CSV_PATH, 'utf8');
    const rows = parse(content, { columns: true, skip_empty_lines: true });

    console.log(`Total rows to process: ${rows.length}`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let id = String(row['user_id'] || '').trim();
      if (id && !id.startsWith('CID')) id = `CID${id}`;

      const candidate = {
        id: id || undefined,
        email: String(row['email'] || '').trim().toLowerCase(),
        ps_jurisdiction: String(row['ps_jurisdiction'] || '').trim(),
        name: String(row['name'] || '').trim(),
        gender: String(row['gender'] || '').trim(),
        father_name: String(row['father_name'] || '').trim(),
        age: String(row['age'] || '').trim(),
        village: String(row['village'] || '').trim(),
        mandal: String(row['mandal'] || '').trim(),
        district: String(row['district'] || '').trim(),
        education_qualification: String(row['education_qualification'] || '').trim(),
        preferred_location: String(row['preferred_location'] || '').trim(),
        languages: String(row['languages'] || '').trim(),
        driving_license: String(row['driving_license'] || '').trim(),
        experience: String(row['experience'] || '').trim(),
        field_of_work: String(row['field_of_work'] || '').trim(),
        aadhar_number: String(row['aadhar_number'] || '').trim().replace(/\s/g, ''),
        phone: String(row['phone'] || '').trim(),
        remarks: String(row['remarks'] || '').trim(),
        preferred_sector: String(row['preferred_sector'] || '').trim(),
      };

      if (!candidate.name) continue;

      // ATTEMPT 1: Full profile
      let { error } = await supabase.from('candidates').upsert(candidate, { onConflict: 'id' });
      
      if (error && error.code === '23505') {
        // ATTEMPT 2: If Aadhar duplicate, remove Aadhar and try again
        console.log(`⚠️ Row ${i} (${candidate.name}): Duplicate Aadhar found. Retrying without Aadhar...`);
        const { aadhar_number, ...safeCandidate } = candidate;
        const { error: retryErr } = await supabase.from('candidates').upsert(safeCandidate, { onConflict: 'id' });
        if (retryErr) console.error(`❌ Row ${i} Failed even without Aadhar: ${retryErr.message}`);
      } else if (error) {
        console.error(`❌ Row ${i} Failed: ${error.message}`);
      }

      if (i % 200 === 0) {
        console.log(`✅ Milestone: ${i} / ${rows.length} candidates processed.`);
      }
    }

    console.log('🏁 MISSION COMPLETE: Every possible candidate is now live!');

  } catch (e) {
    console.error('Fatal error:', e);
  }
}

ultimateImport();
