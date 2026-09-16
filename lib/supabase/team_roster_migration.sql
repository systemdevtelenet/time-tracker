-- ==============================================================================
-- SQL MIGRATION: CREATE AND POPULATE team_roster TABLE
-- Description: Creates a dedicated table for TQA Team Roster with all 13 columns.
-- Safe: Does NOT modify, touch, or drop any existing tables.
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/zhdmsmwrskxowvytedgh/sql
-- ==============================================================================

-- 1. Create the dedicated team_roster table
CREATE TABLE IF NOT EXISTS public.team_roster (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User',
    shift VARCHAR(100),
    shift_type VARCHAR(50),
    position VARCHAR(150),
    account VARCHAR(100),
    supervisor VARCHAR(255),
    department VARCHAR(100) DEFAULT 'TQA',
    hire_date VARCHAR(50),
    tenure INTEGER,
    traffic_light_status VARCHAR(50) DEFAULT 'GREEN',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.team_roster ENABLE ROW LEVEL SECURITY;

-- 3. Create public read/write policy for the time tracker app
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'team_roster' 
        AND policyname = 'Allow full access to team_roster'
    ) THEN
        CREATE POLICY "Allow full access to team_roster"
        ON public.team_roster
        FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 4. Insert / Upsert all 21 team members from the Google Sheet
INSERT INTO public.team_roster (
    employee_id,
    password,
    name,
    role,
    shift,
    shift_type,
    position,
    account,
    supervisor,
    department,
    hire_date,
    tenure,
    traffic_light_status
) VALUES
('1597', '1597', 'Nissi-Jeh Reguero', 'Admin', '9:00 PM to 6:00 AM', 'Night Shift', 'Head of Training', 'Corporate', 'June Babe Caballes', 'TQA', '1/3/2024', 32, 'GREEN'),
('1108', '1108', 'Raymundo Alasagas III', 'Admin', '9:00 PM to 6:00 AM', 'Night Shift', 'Head of Quality', 'Corporate', 'June Babe Caballes', 'TQA', '6/29/2023', 38, 'GREEN'),
('1021', '1021', 'Jerico Leyson', 'Admin', '9:00 PM to 6:00 AM', 'Night Shift', 'Process Improvement Specialist - RM', 'Rocket Money', 'Julvic Malabat', 'TQA', '11/11/2023', 34, 'GREEN'),
('1772', '1772', 'Bianca Kaye Ernestine Colonia', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '5/2/2024', 28, 'GREEN'),
('2385', '2385', 'Michelle Yncierto', 'User', '5:00 PM to 2:00 AM', 'Mid Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '9/17/2025', 12, 'GREEN'),
('1035', '1035', 'Rommel Mendoza', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '11/24/2022', 45, 'GREEN'),
('1820', '1820', 'Ronelyn Baguio', 'User', '11:00 AM to 8:00 PM', 'Mid Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '6/3/2024', 27, 'GREEN'),
('836', '836', 'Krisland Pepito', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Rocket Money', 'Nissi-Jeh Reguero', 'TQA', '7/20/2022', 49, 'GREEN'),
('1006', '1006', 'Niño Elijah R. Reyes', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Rocket Money', 'Nissi-Jeh Reguero', 'TQA', '11/7/2022', 46, 'GREEN'),
('1880', '1880', 'Kier Ariola', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Experian', 'Nissi-Jeh Reguero', 'TQA', '7/18/2024', 25, 'GREEN'),
('946', '946', 'Vincent Luis Celdran', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Experian', 'Nissi-Jeh Reguero', 'TQA', '10/5/2022', 47, 'GREEN'),
('2298', '2298', 'Nina Joy Briones', 'User', '8:00 PM to 5:00 AM', 'Night Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '4/8/2026', 5, 'GREEN'),
('1954', '1954', 'Matt Riner Balaba', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '4/8/2026', 5, 'GREEN'),
('2610', '2610', 'Maegan Marie Cabardo', 'User', '8:00 PM to 5:00 AM', 'Night Shift', 'Trainer', 'Corporate', 'Nissi-Jeh Reguero', 'TQA', '6/2/2026', 3, 'GREEN'),
('1898', '1898', 'Hezel Mae Domo', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Rocket Money', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('1671', '1671', 'Janine Codilla', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Rocket Money', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('518', '518', 'Darin Vic Ecle', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Rocket Money', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('770', '770', 'Jeffrey Verallo', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Rocket Money', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('745', '745', 'Steffany Cagape', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Experian', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('892', '892', 'Hanazaira Peleno', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Experian', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL),
('1708', '1708', 'Jhonmel Commedador', 'User', '9:00 PM to 6:00 AM', 'Night Shift', 'Quality Assurance Analyst', 'Experian', 'Raymundo Alasagas III', 'TQA', NULL, NULL, NULL)
ON CONFLICT (employee_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    shift = EXCLUDED.shift,
    shift_type = EXCLUDED.shift_type,
    position = EXCLUDED.position,
    account = EXCLUDED.account,
    supervisor = EXCLUDED.supervisor,
    department = EXCLUDED.department,
    hire_date = EXCLUDED.hire_date,
    tenure = EXCLUDED.tenure,
    traffic_light_status = EXCLUDED.traffic_light_status,
    updated_at = NOW();
