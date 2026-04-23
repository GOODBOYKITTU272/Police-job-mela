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
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export type CompanyLoginResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_credentials' | 'no_visible_company_rows' };

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

export async function getAdminStats() {
  const { data: candidates } = await supabase.from('candidates').select('id');
  const { data: applications } = await supabase.from('applications').select('*');

  const apps = applications || [];
  const totalCandidates = candidates?.length || 0;
  const totalApplications = apps.length;

  const statusBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  
  apps.forEach(a => {
    statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
    if (a.category) {
      categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
    }
  });

  // Multi-pipeline candidates
  const candidateApps: Record<string, number> = {};
  apps.forEach(a => {
    candidateApps[a.candidate_id] = (candidateApps[a.candidate_id] || 0) + 1;
  });
  const multiPipeline = Object.values(candidateApps).filter(c => c > 1).length;

  // Top candidates by match
  const candidateBestMatch: Record<string, { name: string; match: number; apps: number }> = {};
  apps.forEach(a => {
    if (!candidateBestMatch[a.candidate_id] || a.match_percent > candidateBestMatch[a.candidate_id].match) {
      candidateBestMatch[a.candidate_id] = {
        name: '',
        match: a.match_percent,
        apps: candidateApps[a.candidate_id],
      };
    }
  });

  return {
    totalCandidates,
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
