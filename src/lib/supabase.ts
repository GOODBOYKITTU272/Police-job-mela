import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnkadvphfswtzoltehpk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2FkdnBoZnN3dHpvbHRlaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzM5OTYsImV4cCI6MjA5MjUwOTk5Nn0.v764MJbNLF6xRJCd78VTSCvFnSl_1ppm1GUnUxv1eBQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ────────────────────────────────────────────────────

export type ApplicationStatus = 
  | 'Applied' 
  | 'Shortlisted' 
  | 'Interview Scheduled' 
  | 'Rejected' 
  | 'Offer'
  | 'Matched'
  | 'Under Review';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ps_jurisdiction?: string | null;
  gender?: string | null;
  father_name?: string | null;
  age?: string | null;
  village?: string | null;
  mandal?: string | null;
  district?: string | null;
  education_qualification?: string | null;
  preferred_location?: string | null;
  languages?: string | null;
  driving_license?: string | null;
  experience?: string | null;
  field_of_work?: string | null;
  aadhar_number?: string | null;
  remarks?: string | null;
  preferred_sector?: string | null;
  assigned_sector?: string | null;
  viewed_at?: string | null;
  created_at: string;
}

export interface Application {
  id: number;
  candidate_id: string;
  job_id: string;
  company_name: string;
  role: string;
  category: string;
  match_percent: number;
  status: ApplicationStatus;
  success_probability: number;
  next_step: string | null;
  reason: string | null;
  interview_date: string | null;
  recruiter_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateWithApplications extends Candidate {
  applications: Application[];
}

export interface HrCandidatePreview {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  village: string | null;
  mandal: string | null;
  district: string | null;
  education_qualification: string | null;
}

export interface HrAllocatedCandidatePreview extends HrCandidatePreview {
  allocated_company_name: string;
  intent: CandidateIntent;
  company_decision: CompanyDecision | null;
}

export interface RoutingCompany {
  company_name: string;
  sector?: string | null;
  education?: string | null;
  vacancy?: number | null;
  assigned_count?: number | null;
  remaining?: number | null;
  intent?: CandidateIntent;
}

export interface RoutingResult {
  assigned_sector: string;
  companies: RoutingCompany[];
}

export type CandidateIntent = 'Pending' | 'Not Interested' | 'Will Attend';
export type CompanyDecision = 'No Show' | 'Not Selected' | 'Selected';

// ── Intelligence Types ───────────────────────────────────────

export interface IntelligenceSummary {
  totalApplied: number;
  activeProcesses: number;
  interviewsScheduled: number;
  rejections: number;
  offers: number;
  bestMatch: Application | null;
  interviewConflicts: Application[][];
  successPredictions: { application: Application; probability: number }[];
  prioritySuggestion: string;
}

export interface Job {
  id: number;
  role: string;
  company_name: string;
  education: string;
  sector: string;
  created_at: string;
}

export interface CompanyDirectoryRow {
  company_name: string;
  sector?: string | null;
  education?: string | null;
  vacancy?: number | null;
  assigned_count?: number | null;
  no_show_count?: number;
  not_selected_count?: number;
  selected_count?: number;
}

function normalizeCompanyName(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function normalizeNumberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/,/g, '').trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

// ── API Functions ────────────────────────────────────────────

export async function getCandidateById(input: string): Promise<CandidateWithApplications[] | null> {
  const query = input.trim();
  let candidates: Candidate[] = [];
  
  // 1. Try match on ID, Phone, Email, or Aadhar (Case-Insensitive)
  const { data: matches } = await supabase
    .from('candidates')
    .select('*')
    .or(`id.ilike.${query},phone.ilike.${query},email.ilike.${query},aadhar_number.ilike.${query}`);

  if (matches && matches.length > 0) {
    candidates = matches;
  } else {
    // 2. If no direct match, try partial match
    const { data: partialMatch } = await supabase
      .from('candidates')
      .select('*')
      .or(`phone.ilike.%${query}%,email.ilike.%${query}%,aadhar_number.ilike.%${query}%`);
    
    if (partialMatch) {
      candidates = partialMatch;
    }
  }

  if (candidates.length === 0) return null;

  // Enhance all found candidates with their applications
  const results: CandidateWithApplications[] = [];
  for (const candidate of candidates) {
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', candidate.id);
    
    results.push({
      ...candidate,
      applications: applications || []
    });
  }

  return results;
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const pageSize = 1000;
  let from = 0;
  const allRows: Candidate[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) return allRows;

    const batch = (data || []) as Candidate[];
    allRows.push(...batch);

    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export type CompanyLoginResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_credentials' | 'no_visible_company_rows' };

export type AdminLoginResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_credentials' | 'admin_table_unreadable' };

function normalizeCredentialValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function getCredentialFromRow(
  row: Record<string, unknown>,
  target: 'email' | 'password'
): string {
  const normalizedTarget = target.toLowerCase();
  const keys = Object.keys(row);
  const key = keys.find((candidateKey) => {
    const simplified = candidateKey.toLowerCase().replace(/[^a-z]/g, '');
    return simplified === normalizedTarget;
  });

  if (!key) {
    return '';
  }
  return normalizeCredentialValue(row[key]);
}

export async function validateCompanyLogin(email: string, password: string): Promise<CompanyLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  // Preferred path: secure RPC that checks credentials server-side without exposing table rows.
  const { data: rpcData, error: rpcError } = await supabase.rpc('verify_company_login', {
    p_email: normalizedEmail,
    p_password: normalizedPassword,
  });

  if (!rpcError) {
    if (rpcData === true) {
      return { ok: true };
    }
    if (rpcData === false) {
      return { ok: false, reason: 'invalid_credentials' };
    }
  }

  const tableNames = ['Company_details', 'company_details'];
  let visibleRows: Record<string, unknown>[] = [];

  for (const tableName of tableNames) {
    const { data, error } = await supabase.from(tableName).select('*').limit(200);
    if (!error && data && data.length > 0) {
      visibleRows = data as Record<string, unknown>[];
      break;
    }
  }

  if (visibleRows.length === 0) {
    return { ok: false, reason: 'no_visible_company_rows' };
  }

  const found = visibleRows.some((row) => {
    const rowEmail = getCredentialFromRow(row, 'email').toLowerCase();
    const rowPassword = getCredentialFromRow(row, 'password');
    return rowEmail === normalizedEmail && rowPassword === normalizedPassword;
  });

  if (!found) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  return { ok: true };
}

export async function validateAdminLogin(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .ilike('email', normalizedEmail)
    .eq('password', normalizedPassword)
    .limit(1);

  if (error) {
    return { ok: false, reason: 'admin_table_unreadable' };
  }

  if (!data || data.length === 0) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  return { ok: true };
}

export async function getHrCandidatesPreview(limit = 3): Promise<HrCandidatePreview[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('id, name, email, phone, gender, village, mandal, district, education_qualification')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data || []) as HrCandidatePreview[];
}

export async function getHrAllocatedCandidatesByEmail(
  email: string
): Promise<HrAllocatedCandidatePreview[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return [];

  const tableNames = ['Company_details', 'company_details'];
  let companyNames: string[] = [];

  for (const tableName of tableNames) {
    const { data, error } = await supabase
      .from(tableName)
      .select('company_name')
      .ilike('email', normalizedEmail);

    if (!error && data && data.length > 0) {
      companyNames = data
        .map((row) => String(row.company_name || '').trim())
        .filter(Boolean);
      if (companyNames.length > 0) break;
    }
  }

  if (companyNames.length === 0) {
    return [];
  }

  const { data: allocations, error: allocationError } = await supabase
    .from('candidate_allocations')
    .select('candidate_id, company_name, intent, company_decision')
    .in('company_name', companyNames);

  if (allocationError || !allocations || allocations.length === 0) {
    return [];
  }

  const candidateIds = Array.from(
    new Set(
      allocations
        .map((row) => String(row.candidate_id || '').trim())
        .filter(Boolean)
    )
  );

  if (candidateIds.length === 0) {
    return [];
  }

  const { data: candidates, error: candidateError } = await supabase
    .from('candidates')
    .select('id, name, email, phone, gender, village, mandal, district, education_qualification')
    .in('id', candidateIds);

  if (candidateError || !candidates || candidates.length === 0) {
    return [];
  }

  const candidateMap = new Map<string, HrCandidatePreview>();
  (candidates as HrCandidatePreview[]).forEach((candidate) => {
    candidateMap.set(candidate.id, candidate);
  });

  const rows: HrAllocatedCandidatePreview[] = [];
  allocations.forEach((allocation) => {
    const candidateId = String(allocation.candidate_id || '').trim();
    const candidate = candidateMap.get(candidateId);
    if (!candidate) return;

    const rawIntent = String(allocation.intent || '').trim().toLowerCase();
    let normalizedIntent: CandidateIntent = 'Pending';
    if (rawIntent === 'not interested') normalizedIntent = 'Not Interested';
    if (rawIntent === 'will attend') normalizedIntent = 'Will Attend';

    const rawDecision = String(allocation.company_decision || '').trim().toLowerCase();
    let normalizedDecision: CompanyDecision | null = null;
    if (rawDecision === 'no show') normalizedDecision = 'No Show';
    if (rawDecision === 'not selected') normalizedDecision = 'Not Selected';
    if (rawDecision === 'selected') normalizedDecision = 'Selected';

    rows.push({
      ...candidate,
      allocated_company_name: String(allocation.company_name || '').trim(),
      intent: normalizedIntent,
      company_decision: normalizedDecision,
    });
  });

  return rows;
}

function inferSectorForCandidate(candidate: Candidate): string {
  const education = (candidate.education_qualification || '').toUpperCase();
  const preference = (candidate.preferred_sector || '').toLowerCase();

  if (education.includes('SSC') || education.includes('10TH')) {
    return 'Manufacturing / Logistics';
  }
  if (
    education.includes('B.TECH') ||
    education.includes('BTECH') ||
    education.includes('ENGINEERING')
  ) {
    return 'IT / Software';
  }
  if (education.includes('DEGREE') || education.includes('GRADUATE')) {
    if (preference.includes('it')) return 'IT / Software';
    if (preference.includes('healthcare')) return 'Healthcare';
    return 'Manufacturing / Logistics';
  }

  return 'Hospitality & Support';
}

function scoreByEducation(
  candidateEducation: string,
  companyEducation: string
): number {
  if (!candidateEducation || !companyEducation) return 0;
  if (candidateEducation === companyEducation) return 100;
  if (candidateEducation.includes('B.TECH') && companyEducation.includes('DEGREE')) return 50;
  return 0;
}

export async function getCandidateRouting(candidate: Candidate): Promise<RoutingResult> {
  const assigned_sector = inferSectorForCandidate(candidate);

  const tableNames = ['Company_details', 'company_details'];
  let rows: Record<string, unknown>[] = [];

  for (const tableName of tableNames) {
    const { data, error } = await supabase.from(tableName).select('*');
    if (!error && data && data.length > 0) {
      rows = data as Record<string, unknown>[];
      break;
    }
  }

  const education = (candidate.education_qualification || '').toUpperCase();
  const { data: allocationRows } = await supabase
    .from('candidate_allocations')
    .select('company_name, intent')
    .eq('candidate_id', candidate.id);

  const intentMap = new Map<string, CandidateIntent>();
  (allocationRows || []).forEach((row) => {
    const company = String(row.company_name || '').trim().toLowerCase();
    if (!company) return;

    const rawIntent = String(row.intent || '').trim().toLowerCase();
    let normalized: CandidateIntent = 'Pending';
    if (rawIntent === 'not interested') normalized = 'Not Interested';
    if (rawIntent === 'will attend') normalized = 'Will Attend';

    intentMap.set(company, normalized);
  });

  const companies = rows
    .map((row) => {
      const company_name = String(row.company_name || row.company || '').trim();
      const sector = String(row.sector || '').trim();
      const companyEdu = String(row.education || '').toUpperCase().trim();
      const vacancy = Number(row.vacancy || 0);
      const assigned_count = Number(row.assigned_count || 0);
      const eduScore = scoreByEducation(education, companyEdu);
      const available = vacancy - assigned_count;

      return {
        company_name,
        sector,
        education: companyEdu,
        vacancy,
        assigned_count,
        eduScore,
        available,
      };
    })
    .filter((company) => company.company_name && company.sector === assigned_sector)
    .sort((a, b) => {
      if (b.eduScore !== a.eduScore) return b.eduScore - a.eduScore;
      return b.available - a.available;
    })
    .slice(0, 5)
    .map((c) => ({
      company_name: c.company_name,
      sector: c.sector,
      education: c.education,
      vacancy: c.vacancy,
      assigned_count: c.assigned_count,
      intent: intentMap.get(c.company_name.toLowerCase()) || 'Pending',
    }));

  return { assigned_sector, companies };
}

export async function updateCandidateAllocationIntent(
  candidateId: string,
  companyName: string,
  intent: CandidateIntent
): Promise<boolean> {
  const { data, error } = await supabase
    .from('candidate_allocations')
    .update({ intent })
    .eq('candidate_id', candidateId)
    .eq('company_name', companyName)
    .select('candidate_id')
    .limit(1);

  if (error) return false;
  return Boolean(data && data.length > 0);
}

export async function updateCandidateAllocationDecision(
  candidateId: string,
  companyName: string,
  decision: CompanyDecision | null
): Promise<boolean> {
  const { data, error } = await supabase
    .from('candidate_allocations')
    .update({ company_decision: decision })
    .eq('candidate_id', candidateId)
    .eq('company_name', companyName)
    .select('candidate_id')
    .limit(1);

  if (error) return false;
  return Boolean(data && data.length > 0);
}

export async function getAdminStats() {
  const { count: candidateCount } = await supabase
    .from('candidates')
    .select('id', { count: 'exact', head: true });

  // Primary source: legacy applications table
  const { data: applications, count: applicationCount, error: applicationError } = await supabase
    .from('applications')
    .select('candidate_id, status, category', { count: 'exact' });

  const apps = applications || [];
  const hasReadableApplications = !applicationError && apps.length > 0;

  let totalApplications = applicationCount || 0;
  let statusBreakdown: Record<string, number> = {};
  let categoryBreakdown: Record<string, number> = {};
  let multiPipeline = 0;

  if (hasReadableApplications) {
    apps.forEach((app) => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
      if (app.category) {
        categoryBreakdown[app.category] = (categoryBreakdown[app.category] || 0) + 1;
      }
    });

    const candidateApps: Record<string, number> = {};
    apps.forEach((app) => {
      candidateApps[app.candidate_id] = (candidateApps[app.candidate_id] || 0) + 1;
    });
    multiPipeline = Object.values(candidateApps).filter((count) => count > 1).length;
    categoryBreakdown.Pending = 0;
  } else {
    // Fallback source: candidate_allocations (current workflow table)
    const { count: allocationCount } = await supabase
      .from('candidate_allocations')
      .select('candidate_id', { count: 'exact', head: true });
    totalApplications = allocationCount || 0;

    const candidateAllocations: Record<string, number> = {};
    const intentBreakdown: Record<string, number> = {};
    const decisionBreakdown: Record<string, number> = {};
    let pendingDecisionCount = 0;
    const willAttendCandidates = new Set<string>();

    let offset = 0;
    const pageSize = 1000;
    while (true) {
      const { data: allocationRows, error: allocationError } = await supabase
        .from('candidate_allocations')
        .select('candidate_id, intent, company_decision')
        .range(offset, offset + pageSize - 1);

      if (allocationError || !allocationRows || allocationRows.length === 0) {
        break;
      }

      allocationRows.forEach((row) => {
        const candidateId = String(row.candidate_id || '').trim();
        if (!candidateId) return;

        candidateAllocations[candidateId] = (candidateAllocations[candidateId] || 0) + 1;

        const intent = String(row.intent || 'Pending').trim() || 'Pending';
        intentBreakdown[intent] = (intentBreakdown[intent] || 0) + 1;
        if (intent.toLowerCase() === 'will attend') {
          willAttendCandidates.add(candidateId);
        }

        const decision = String(row.company_decision || '').trim();
        if (decision) {
          decisionBreakdown[decision] = (decisionBreakdown[decision] || 0) + 1;
        } else {
          pendingDecisionCount += 1;
        }
      });

      if (allocationRows.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    multiPipeline = Object.values(candidateAllocations).filter((count) => count > 1).length;
    statusBreakdown = {
      ...intentBreakdown,
      'Interview Scheduled': willAttendCandidates.size,
    };
    categoryBreakdown = {
      ...decisionBreakdown,
      Pending: pendingDecisionCount,
    };
  }

  return {
    totalCandidates: candidateCount || 0,
    totalApplications,
    statusBreakdown,
    categoryBreakdown,
    multiPipeline,
  };
}

export async function searchCandidates(query: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .or(`id.ilike.%${query}%,name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(50);

  if (error) return [];
  return data || [];
}

export async function updateApplicationStatus(appId: number, status: ApplicationStatus) {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appId);

  return !error;
}

export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('sector', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getAllCompanies(): Promise<CompanyDirectoryRow[]> {
  const tableNames = ['Company_details', 'company_details'];

  type AllocationRow = {
    company_name: string | null;
    candidate_id: string | null;
    company_decision: string | null;
  };

  const allocationRows: AllocationRow[] = [];
  const allocationPageSize = 1000;
  let allocationFrom = 0;
  while (true) {
    const { data, error } = await supabase
      .from('candidate_allocations')
      .select('company_name, candidate_id, company_decision')
      .range(allocationFrom, allocationFrom + allocationPageSize - 1);

    if (error) break;

    const batch = (data || []) as AllocationRow[];
    allocationRows.push(...batch);

    if (batch.length < allocationPageSize) break;
    allocationFrom += allocationPageSize;
  }

  const distinctCandidatesByCompany = new Map<string, Set<string>>();
  const liveAssignedCount = new Map<string, number>();
  const decisionBreakdown = new Map<
    string,
    { noShow: number; notSelected: number; selected: number }
  >();
  allocationRows.forEach((row) => {
    const companyKey = normalizeCompanyName(row.company_name);
    if (!companyKey) return;

    const candidateId = String(row.candidate_id || '').trim();
    if (candidateId) {
      const existingSet = distinctCandidatesByCompany.get(companyKey) || new Set<string>();
      existingSet.add(candidateId);
      distinctCandidatesByCompany.set(companyKey, existingSet);
    }

    const existing = decisionBreakdown.get(companyKey) || {
      noShow: 0,
      notSelected: 0,
      selected: 0,
    };

    const decision = String(row.company_decision || '').trim().toLowerCase();
    if (decision === 'no show') existing.noShow += 1;
    if (decision === 'not selected') existing.notSelected += 1;
    if (decision === 'selected') existing.selected += 1;

    decisionBreakdown.set(companyKey, existing);

  });

  distinctCandidatesByCompany.forEach((candidateSet, companyKey) => {
    liveAssignedCount.set(companyKey, candidateSet.size);
  });
  for (const tableName of tableNames) {
    const { data, error } = await supabase
      .from(tableName)
      .select('company_name, sector, education, vacancy, assigned_count, email')
      .order('company_name', { ascending: true });

    if (!error && data) {
      return (data as Record<string, unknown>[]).map((row) => {
        const companyKey = normalizeCompanyName(row.company_name);

        return {
          company_name: String(row.company_name || '').trim(),
          sector: row.sector ? String(row.sector) : null,
          education: row.education ? String(row.education) : null,
          vacancy: normalizeNumberValue(row.vacancy),
          assigned_count: liveAssignedCount.get(companyKey) || 0,
          no_show_count:
            decisionBreakdown.get(companyKey)?.noShow || 0,
          not_selected_count:
            decisionBreakdown.get(companyKey)?.notSelected || 0,
          selected_count:
            decisionBreakdown.get(companyKey)?.selected || 0,
        };
      });
    }
  }

  return [];
}

// ── Excel Upload & Dedup Logic ───────────────────────────────

export async function uploadExcelData(rows: ExcelRow[]): Promise<{ 
  candidatesCreated: number; 
  applicationsCreated: number;
  duplicatesSkipped: number;
}> {
  let candidatesCreated = 0;
  let applicationsCreated = 0;
  let duplicatesSkipped = 0;

  // Get existing candidates for dedup
  const { data: existingCandidates } = await supabase.from('candidates').select('*');
  const emailMap = new Map<string, string>();
  const phoneMap = new Map<string, string>();
  
  (existingCandidates || []).forEach(c => {
    if (c.email) emailMap.set(c.email.toLowerCase(), c.id);
    if (c.phone) phoneMap.set(c.phone, c.id);
  });

  // Get max CID number
  let maxCidNum = 100;
  (existingCandidates || []).forEach(c => {
    const num = parseInt(c.id.replace('CID', ''));
    if (num > maxCidNum) maxCidNum = num;
  });

  // Process rows in batches
  const candidateBatch: Record<string, { id: string; name: string; email: string; phone: string | null }> = {};
  const applicationBatch: { candidate_id: string; job_id: string; company_name: string; role: string; category: string; match_percent: number; status: ApplicationStatus; success_probability: number; next_step: string; reason: string }[] = [];

  for (const row of rows) {
    const email = (row.email || `user${row.user_id}@recruitment.local`).toLowerCase();
    const phone = row.phone || null;

    // Dedup: check email → phone → new
    let cid = emailMap.get(email) || (phone ? phoneMap.get(phone) : undefined);

    if (!cid) {
      // Check if we already created this candidate in this batch
      if (candidateBatch[email]) {
        cid = candidateBatch[email].id;
      } else {
        maxCidNum++;
        cid = `CID${maxCidNum}`;
        candidateBatch[email] = {
          id: cid,
          name: row.name || 'Unknown',
          email,
          phone,
        };
        emailMap.set(email, cid);
        if (phone) phoneMap.set(phone, cid);
      }
    }

    // Determine status from match%
    const matchPct = row.match_percent || 0;
    let status: ApplicationStatus = 'Applied';
    if (matchPct >= 80) status = 'Shortlisted';
    else if (matchPct >= 60) status = 'Applied';
    else if (matchPct >= 40) status = 'Matched';
    else status = 'Under Review';

    // Success probability
    const base = matchPct / 100;
    const boosts: Record<string, number> = { 'Under Review': 0, 'Matched': 0.05, 'Applied': 0.1, 'Shortlisted': 0.2, 'Interview Scheduled': 0.35, 'Offer': 0.5 };
    const probability = Math.min(Math.round((base * 0.6 + (boosts[status] || 0)) * 1000) / 10, 99);

    // Next step
    const nextSteps: Record<string, string> = {
      'Under Review': 'Profile screening in progress',
      'Matched': 'Awaiting employer review',
      'Applied': 'Application under processing',
      'Shortlisted': 'Awaiting HR call / Interview scheduling',
      'Interview Scheduled': 'Prepare for technical/HR round',
      'Offer': 'Review and accept offer',
    };

    applicationBatch.push({
      candidate_id: cid,
      job_id: row.job_id || 'UNKNOWN',
      company_name: row.company || 'Unknown',
      role: row.role || 'Unknown',
      category: row.category || 'General',
      match_percent: matchPct,
      status,
      success_probability: probability,
      next_step: nextSteps[status] || 'Awaiting update',
      reason: row.reason || '',
    });
  }

  // Insert candidates
  const newCandidates = Object.values(candidateBatch);
  if (newCandidates.length > 0) {
    const { error } = await supabase.from('candidates').upsert(newCandidates, { onConflict: 'email' });
    if (!error) candidatesCreated = newCandidates.length;
  }

  // Insert applications (with conflict handling)
  if (applicationBatch.length > 0) {
    // Insert in chunks of 500
    for (let i = 0; i < applicationBatch.length; i += 500) {
      const chunk = applicationBatch.slice(i, i + 500);
      const { data, error } = await supabase
        .from('applications')
        .upsert(chunk, { onConflict: 'candidate_id,job_id,company_name' })
        .select('id');
      
      if (!error && data) {
        applicationsCreated += data.length;
      }
    }
    duplicatesSkipped = applicationBatch.length - applicationsCreated;
  }

  return { candidatesCreated, applicationsCreated, duplicatesSkipped: Math.max(0, duplicatesSkipped) };
}

export interface ExcelRow {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  job_id: string;
  role: string;
  company: string;
  category: string;
  match_percent: number;
  reason: string;
}

// ── Intelligence Engine ──────────────────────────────────────

export function computeIntelligence(applications: Application[]): IntelligenceSummary {
  const totalApplied = applications.length;
  const activeProcesses = applications.filter(a => 
    ['Applied', 'Shortlisted', 'Interview Scheduled', 'Matched'].includes(a.status)
  ).length;
  const interviewsScheduled = applications.filter(a => a.status === 'Interview Scheduled').length;
  const rejections = applications.filter(a => a.status === 'Rejected').length;
  const offers = applications.filter(a => a.status === 'Offer').length;

  // Best match (highest priority job)
  const statusPriority: Record<string, number> = {
    'Offer': 5, 'Interview Scheduled': 4, 'Shortlisted': 3, 'Applied': 2, 'Matched': 1, 'Under Review': 0, 'Rejected': -1,
  };
  const sorted = [...applications].sort((a, b) => {
    const pa = statusPriority[a.status] ?? 0;
    const pb = statusPriority[b.status] ?? 0;
    if (pb !== pa) return pb - pa;
    return b.match_percent - a.match_percent;
  });
  const bestMatch = sorted[0] || null;

  // Interview conflict detection (same day)
  const interviewConflicts: Application[][] = [];
  const interviewApps = applications.filter(a => a.interview_date);
  const dateGroups: Record<string, Application[]> = {};
  interviewApps.forEach(a => {
    const day = a.interview_date!.split('T')[0];
    if (!dateGroups[day]) dateGroups[day] = [];
    dateGroups[day].push(a);
  });
  Object.values(dateGroups).forEach(group => {
    if (group.length > 1) interviewConflicts.push(group);
  });

  // Success predictions
  const successPredictions = applications
    .filter(a => a.status !== 'Rejected')
    .map(a => ({ application: a, probability: a.success_probability }))
    .sort((a, b) => b.probability - a.probability);

  // Priority suggestion
  let prioritySuggestion = 'No active applications — consider applying to more roles.';
  if (bestMatch) {
    if (bestMatch.status === 'Offer') {
      prioritySuggestion = `🎉 You have an offer from ${bestMatch.company_name}! Review and respond promptly.`;
    } else if (bestMatch.status === 'Interview Scheduled') {
      prioritySuggestion = `🎯 Prepare for your interview at ${bestMatch.company_name} for ${bestMatch.role}.`;
    } else if (bestMatch.status === 'Shortlisted') {
      prioritySuggestion = `⭐ Focus on ${bestMatch.role} at ${bestMatch.company_name} — ${bestMatch.match_percent}% match, highest probability.`;
    } else {
      prioritySuggestion = `📋 Best opportunity: ${bestMatch.role} at ${bestMatch.company_name} (${bestMatch.match_percent}% match).`;
    }
  }

  return {
    totalApplied,
    activeProcesses,
    interviewsScheduled,
    rejections,
    offers,
    bestMatch,
    interviewConflicts,
    successPredictions,
    prioritySuggestion,
  };
}

