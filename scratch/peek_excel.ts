import * as XLSX from 'xlsx';

const EXCEL_PATH = "C:\\Users\\DELL\\Desktop\\final list police\\Untitled spreadsheet (2).xlsx";

function peek() {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const rows = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);
  console.log('Headers found:', Object.keys(rows[0] || {}));
  console.log('First row:', rows[0]);
}

peek();
