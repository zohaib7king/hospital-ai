-- Enable uuid extension if not enabled
create extension if not exists "uuid-ossp";

-- Departments
create table if not exists departments (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- 'Cardiology', 'General Medicine', 'Emergency', etc.
  code text not null unique,
  is_active boolean default true
);

-- Doctors
create table if not exists doctors (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  full_name text not null,
  specialization text not null,
  department_id uuid references departments(id) on delete set null,
  email text,
  phone text,
  available_days text[],        -- ['monday','tuesday','wednesday']
  slot_duration_minutes integer default 20,
  max_patients_per_day integer default 30,
  is_active boolean default true,
  bio text
);

-- Patients
create table if not exists patients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  mrn text unique,              -- Medical Record Number (auto-generated)
  full_name text not null,
  date_of_birth date,
  age integer,
  gender text,                  -- 'male' | 'female' | 'other'
  phone text not null,
  whatsapp text,
  email text,
  cnic text,                    -- National ID (Pakistan)
  address text,
  city text,
  blood_group text,
  known_allergies text,
  chronic_conditions text[],    -- ['diabetes', 'hypertension']
  current_medications text,
  emergency_contact_name text,
  emergency_contact_phone text,
  insurance_provider text,
  insurance_number text
);

-- Appointments
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  doctor_id uuid references doctors(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  duration_minutes integer default 20,
  type text default 'consultation',   -- 'consultation' | 'follow_up' | 'emergency' | 'checkup'
  status text default 'scheduled',    -- 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  chief_complaint text,
  notes text,
  reminder_sent boolean default false,
  reminder_sent_at timestamptz
);

-- AI Triage Records
create table if not exists triage_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete cascade,

  -- Symptoms reported by patient
  chief_complaint text not null,
  symptoms text[] not null,
  symptom_duration text,
  pain_scale integer,           -- 1–10
  fever boolean default false,
  temperature_celsius numeric,
  existing_conditions text[],
  current_medications text,

  -- AI output
  triage_level text,            -- 'emergency' | 'urgent' | 'semi_urgent' | 'routine'
  triage_score integer,         -- 1–100
  ai_assessment text,
  recommended_department text,
  recommended_doctor_specialization text,
  red_flags text[],
  ai_questions_for_doctor text[],
  estimated_wait_minutes integer,
  ai_instructions_for_patient text,
  raw_ai_response jsonb
);

-- Staff (for auth)
create table if not exists staff (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now(),
  full_name text not null,
  role text not null,           -- 'admin' | 'receptionist' | 'nurse' | 'doctor'
  department_id uuid references departments(id) on delete set null,
  doctor_id uuid references doctors(id) on delete set null,
  is_active boolean default true
);

-- Seed departments (using insert on conflict do nothing to avoid errors if run multiple times)
insert into departments (name, code) values
  ('Emergency', 'ER'),
  ('General Medicine', 'GM'),
  ('Cardiology', 'CARD'),
  ('Orthopedics', 'ORTH'),
  ('Gynecology', 'GYN'),
  ('Pediatrics', 'PED'),
  ('Dermatology', 'DERM'),
  ('ENT', 'ENT')
on conflict (code) do update set name = excluded.name;

-- Seed mock doctors for availability testing
do $$
declare
  er_id uuid;
  gm_id uuid;
  card_id uuid;
  ped_id uuid;
begin
  select id into er_id from departments where code = 'ER';
  select id into gm_id from departments where code = 'GM';
  select id into card_id from departments where code = 'CARD';
  select id into ped_id from departments where code = 'PED';

  -- General Physician
  if not exists (select 1 from doctors where email = 'dr.ahmed@citycare.com') then
    insert into doctors (full_name, specialization, department_id, email, phone, available_days, slot_duration_minutes, max_patients_per_day, bio)
    values (
      'Dr. Ahmed Ali',
      'General Medicine Practitioner',
      gm_id,
      'dr.ahmed@citycare.com',
      '+923001234567',
      array['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      20,
      25,
      'Senior medical officer with over 12 years of experience in primary healthcare.'
    );
  end if;

  -- Cardiologist
  if not exists (select 1 from doctors where email = 'dr.sara@citycare.com') then
    insert into doctors (full_name, specialization, department_id, email, phone, available_days, slot_duration_minutes, max_patients_per_day, bio)
    values (
      'Dr. Sara Khan',
      'Consultant Cardiologist',
      card_id,
      'dr.sara@citycare.com',
      '+923007654321',
      array['monday', 'wednesday', 'friday'],
      30,
      15,
      'Specialist in interventional cardiology and cardiovascular diseases.'
    );
  end if;

  -- Pediatrician
  if not exists (select 1 from doctors where email = 'dr.usman@citycare.com') then
    insert into doctors (full_name, specialization, department_id, email, phone, available_days, slot_duration_minutes, max_patients_per_day, bio)
    values (
      'Dr. Usman Shah',
      'Pediatric Consultant',
      ped_id,
      'dr.usman@citycare.com',
      '+923009876543',
      array['tuesday', 'thursday', 'friday'],
      20,
      30,
      'Dedicated to providing compassionate and comprehensive pediatric care.'
    );
  end if;

  -- Emergency Doctor
  if not exists (select 1 from doctors where email = 'dr.zainab@citycare.com') then
    insert into doctors (full_name, specialization, department_id, email, phone, available_days, slot_duration_minutes, max_patients_per_day, bio)
    values (
      'Dr. Zainab Bukhari',
      'Emergency Care Specialist',
      er_id,
      'dr.zainab@citycare.com',
      '+923001122334',
      array['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      15,
      40,
      'Emergency medicine specialist handling acute traumas and urgent conditions.'
    );
  end if;
end $$;
