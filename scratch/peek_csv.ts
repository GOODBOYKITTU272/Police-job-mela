import * as fs from 'fs';

const CSV_PATH = "C:\\Users\\DELL\\Desktop\\final list police\\candaiates  - Cleaned_Candidates (1).csv";

function peek() {
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const firstLine = content.split('\n')[0];
  const secondLine = content.split('\n')[1];
  console.log('Headers:', firstLine);
  console.log('Sample Row:', secondLine);
}

peek();
