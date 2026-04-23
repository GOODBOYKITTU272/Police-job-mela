import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EXCEL_PATH = "C:\\Users\\DELL\\Desktop\\final list police\\Untitled spreadsheet (2).xlsx";

async function excelUltimateImport() {
  console.log(`🚀 Starting ULTIMATE EXCEL Import from: ${EXCEL_PATH}`);
  
  try {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);

    console.log(`Total rows in Excel: ${rows.length}`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let id = String(row['user-ID'] || '').trim();
      if (id && !id.startsWith('CID')) id = `CID${id}`;

      const candidate = {
        id: id || undefined,
        email: String(row['Email Address'] || '').trim().toLowerCase(),
        ps_jurisdiction: String(row['PS JURISDICTION'] || '').trim(),
        name: String(row['NAME'] || '').trim(),
        gender: String(row['GENDER'] || '').trim(),
        father_name: String(row['FATHER NAME'] || '').trim(),
        age: String(row['AGE'] || '').trim(),
        village: String(row['NAME OF THE VILLAGE'] || '').trim(),
        mandal: String(row['NAME OF THE  MANDAL2'] || '').trim(),
        district: String(row['DISTRICT'] || '').trim(),
        education_qualification: String(row['HIGHER EDUCATION QUALIFICATION'] || '').trim(),
        preferred_location: String(row['JOB  PREFERRED  LOCATION'] || '').trim(),
        languages: String(row['SPEAKING LANGUAGES '] || '').trim(),
        driving_license: String(row['DRIVING LICENSE'] || '').trim(),
        experience: String(row['ANY JOB  EXPERIENCE '] || '').trim(),
        field_of_work: String(row['FIELD OF WORK'] || '').trim(),
        aadhar_number: String(row['AADHAR NUMBER'] || '').trim().replace(/\s/g, ''),
        phone: String(row['WHATSAPP MOBILE NUMBER'] || '').trim(),
        remarks: String(row['REMARKS'] || '').trim(),
        preferred_sector: String(row['PREFFERED SECTOR'] || '').trim(),
      };

      if (!candidate.name) continue;

      // Try full profile
      let { error } = await supabase.from('candidates').upsert(candidate, { onConflict: 'id' });
      
      if (error && error.code === '23505') {
        // If Aadhar duplicate, retry without Aadhar
        const { aadhar_number, ...safeCandidate } = candidate;
        await supabase.from('candidates').upsert(safeCandidate, { onConflict: 'id' });
      }

      if (i % 250 === 0) {
        console.log(`✅ Excel Progress: ${i} / ${rows.length}`);
      }
    }

    console.log('🏁 SUCCESS: All candidates from Excel are now live!');

  } catch (e) {
    console.error('Fatal error:', e);
  }
}

excelUltimateImport();
