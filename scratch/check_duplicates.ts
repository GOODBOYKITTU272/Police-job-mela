import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const CSV_PATH = "C:\\Users\\DELL\\Desktop\\final list police\\candaiates  - Cleaned_Candidates (1).csv";

function checkDuplicates() {
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true });
  
  const ids = new Set();
  const duplicateIds: string[] = [];
  
  rows.forEach((row: any) => {
    const id = row['user_id'];
    if (ids.has(id)) {
      duplicateIds.push(id);
    } else {
      ids.add(id);
    }
  });

  console.log('Total Rows in CSV:', rows.length);
  console.log('Unique IDs found:', ids.size);
  if (duplicateIds.length > 0) {
    console.log('Sample Duplicate IDs:', duplicateIds.slice(0, 5));
  }
}

checkDuplicates();
