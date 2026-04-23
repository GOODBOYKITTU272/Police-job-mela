
-- 1. Update candidates table for tracking
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS assigned_sector TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create company allocation table
CREATE TABLE IF NOT EXISTS public.company_allocation (
    company_name TEXT PRIMARY KEY,
    sector TEXT NOT NULL,
    vacancy INTEGER NOT NULL DEFAULT 0,
    assigned_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Seed some initial company data for the 4 sectors
INSERT INTO public.company_allocation (company_name, sector, vacancy, assigned_count)
VALUES 
    ('Kalpratech Solutions', 'IT / Software', 300, 0),
    ('ApplyWizz Tech', 'IT / Software', 150, 0),
    ('Citrux Systems', 'IT / Software', 80, 0),
    ('Hospira Healthcare', 'Healthcare', 200, 0),
    ('Apollo Medics', 'Healthcare', 120, 0),
    ('Hetero Drugs', 'Healthcare', 250, 0),
    ('Foxconn Manufacturing', 'Manufacturing / Logistics', 500, 0),
    ('Amazon Logistics', 'Manufacturing / Logistics', 400, 0),
    ('Tata Motors', 'Manufacturing / Logistics', 150, 0),
    ('Marriott International', 'Hospitality & Support', 100, 0),
    ('Taj Group', 'Hospitality & Support', 80, 0),
    ('QuickSupport Services', 'Hospitality & Support', 200, 0)
ON CONFLICT (company_name) DO UPDATE 
SET vacancy = EXCLUDED.vacancy, sector = EXCLUDED.sector;
