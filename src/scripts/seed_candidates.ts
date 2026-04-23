import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const candidates = [
  {
    id: 'CID100',
    email: 'dheerajgottiparthi99@gmail.com',
    ps_jurisdiction: 'Chinnakodur',
    name: 'GOTTIPARTHI DHEERAJ GOUD',
    gender: 'Male',
    father_name: 'GOTTIPARTHI SUDHARSHAN GOUD',
    age: '32',
    village: 'CHINNAKODUR',
    mandal: 'CHINNAKODUR',
    district: 'SIDDIPET',
    education_qualification: 'B.TECH',
    preferred_location: 'SIDDIPET, GAJWEL, HUSNABAD, ANYWHERE',
    languages: 'TELUGU, ENGLISH, HINDI',
    driving_license: 'YES',
    experience: 'ABOVE 4 YEARS',
    field_of_work: '',
    aadhar_number: '971405578493',
    phone: '9121322969',
    remarks: 'I have 5 years experience as Administrator & Tutor, I have 2 years experience in Banking Financial services as a Digital Banking , Cash management, Network.',
    preferred_sector: 'IT, PHARMA, MANUFACTURING, MEDICAL, TECHNICAL, SECURITY, Administration, Recieptionist'
  },
  {
    id: 'CID101',
    email: 'mamathaesampelli@gmail.com',
    ps_jurisdiction: 'Siddipet 3 town',
    name: 'CHETTI MAMATHA',
    gender: 'Female',
    father_name: 'Mallaiah',
    age: '32',
    village: 'Maruthinagar, Rangadhampally, Siddipet Town',
    mandal: 'SIDDIPET',
    district: 'SIDDIPET',
    education_qualification: 'DEGREE OR EQUIVALENT',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU',
    driving_license: 'No',
    experience: 'FRESHER',
    field_of_work: '',
    aadhar_number: '876123640898',
    phone: '9492279430',
    remarks: '',
    preferred_sector: 'PHARMA, MANUFACTURING, LOGISTICS'
  },
  {
    id: 'CID102',
    email: 'haribhooshanvanam@gmail.com',
    ps_jurisdiction: 'Mirdoddi',
    name: 'Haribhooshan',
    gender: 'Male',
    father_name: 'Narsimulu',
    age: '26',
    village: 'Rudraram',
    mandal: 'AKBARPET BHOOMPALLY',
    district: 'SIDDIPET',
    education_qualification: 'SSC',
    preferred_location: 'ANYWHERE',
    languages: 'TELUGU, ENGLISH, HINDI',
    driving_license: 'YES',
    experience: '1 TO 2 YEARS',
    field_of_work: 'MANUFACTURING, SALES, MARKETING',
    aadhar_number: '237462383888',
    phone: '8096169480',
    remarks: 'Nothing',
    preferred_sector: ''
  },
  {
    id: 'CID103',
    email: 'vjay726866@gmail.com',
    ps_jurisdiction: 'Chinnakodur',
    name: 'Vijay kumar',
    gender: 'Male',
    father_name: 'Shankar',
    age: '26',
    village: 'Chandlapur',
    mandal: 'CHINNAKODUR',
    district: 'SIDDIPET',
    education_qualification: 'DEGREE OR EQUIVALENT',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU, ENGLISH, HINDI',
    driving_license: 'YES',
    experience: '1 TO 2 YEARS',
    field_of_work: '',
    aadhar_number: '762892397239',
    phone: '9603758735',
    remarks: '',
    preferred_sector: 'IT, PHARMA, MANUFACTURING, SALES, MEDICAL'
  },
  {
    id: 'CID104',
    email: 'venugoudthallapally7@gmail.com',
    ps_jurisdiction: 'Bhoompally',
    name: 'Thallapally venugoud',
    gender: 'Male',
    father_name: 'Swamy goud',
    age: '31',
    village: 'Bopppaur',
    mandal: 'AKBARPET BHOOMPALLY',
    district: 'SIDDIPET',
    education_qualification: 'DEGREE OR EQUALENT',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU, HINDI',
    driving_license: 'No',
    experience: '1 TO 2 YEARS',
    field_of_work: '',
    aadhar_number: '639063429538',
    phone: '8766404374',
    remarks: 'No',
    preferred_sector: ''
  },
  {
    id: 'CID105',
    email: 'yellambadikela19@gmail.com',
    ps_jurisdiction: 'Bhoompally',
    name: 'Yellam badikala',
    gender: 'Male',
    father_name: 'Mallaiah',
    age: '09051994',
    village: 'Rudraram',
    mandal: 'AKBARPET BHOOMPALLY',
    district: 'SIDDIPET',
    education_qualification: 'DEGREE OR EQUALENT',
    preferred_location: 'ANYWHERE',
    languages: 'TELUGU',
    driving_license: 'No',
    experience: 'FRESHER',
    field_of_work: '',
    aadhar_number: '660192654909',
    phone: '9182030357',
    remarks: '',
    preferred_sector: ''
  },
  {
    id: 'CID106',
    email: 'dharavathsunitha1998@gmail.com',
    ps_jurisdiction: 'Siddipet 1 town',
    name: 'DHARAVATH SUNITHA',
    gender: 'Female',
    father_name: 'DHARAVATH NAGULU',
    age: '28',
    village: 'SIDDIPET',
    mandal: 'SIDDIPET',
    district: 'SIDDIPET',
    education_qualification: 'B.TECH',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU, ENGLISH',
    driving_license: 'No',
    experience: 'FRESHER',
    field_of_work: '',
    aadhar_number: '349552911016',
    phone: '9618192740',
    remarks: '',
    preferred_sector: ''
  },
  {
    id: 'CID107',
    email: 'sharathbabupatharla@gmail.com',
    ps_jurisdiction: 'Siddipet 3 town',
    name: 'Patharla Sharathbabu',
    gender: 'Male',
    father_name: 'Yadagiri',
    age: '29',
    village: 'Duddeda',
    mandal: 'KONDAPAKA',
    district: 'SIDDIPET',
    education_qualification: 'SSC',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU, ENGLISH',
    driving_license: 'YES',
    experience: 'FRESHER',
    field_of_work: '',
    aadhar_number: '732617401758',
    phone: '9100024732',
    remarks: '',
    preferred_sector: ''
  },
  {
    id: 'CID108',
    email: 'shravanithallapally812@gmail.com',
    ps_jurisdiction: 'Bhoompally',
    name: 'Thallapally sravani',
    gender: 'Female',
    father_name: 'Dubbarajam goud',
    age: '25',
    village: 'Boppapur',
    mandal: 'AKBARPET BHOOMPALLY',
    district: 'SIDDIPET',
    education_qualification: 'DEGREE OR EQUALENT',
    preferred_location: 'SIDDIPET',
    languages: 'TELUGU',
    driving_license: 'No',
    experience: 'FRESHER',
    field_of_work: '',
    aadhar_number: '744746934953',
    phone: '7995295764',
    remarks: 'No',
    preferred_sector: ''
  }
];

async function seed() {
  console.log('Starting seed: 9 candidates...');
  
  const { data, error } = await supabase
    .from('candidates')
    .upsert(candidates, { onConflict: 'id' });

  if (error) {
    console.error('Seed error:', error);
  } else {
    console.log('Successfully seeded 9 candidates.');
  }
}

seed();
