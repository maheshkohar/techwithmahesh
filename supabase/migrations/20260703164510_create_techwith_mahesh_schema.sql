/*
# TechWith Mahesh - Full Platform Schema

## Summary
Creates all tables required for the TechWith Mahesh IT Services platform.

## New Tables
1. `profiles` - Extended user profile data (name, role, avatar, company)
2. `services` - IT service catalog (CCTV, networking, surveillance, etc.)
3. `projects` - Client projects tracking installation/service work
4. `project_milestones` - Gantt chart milestones per project
5. `project_tasks` - Individual tasks within milestones
6. `service_requests` - Client service requests / bookings
7. `service_history` - Completed service records
8. `vendors` - Vendor / supplier management
9. `notifications` - In-app notifications per user

## Security
- RLS enabled on all tables
- Authenticated users can only read/write their own data
- Profiles are auto-created via trigger on auth.users insert
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  role text DEFAULT 'client' CHECK (role IN ('admin','manager','technician','client')),
  avatar_url text,
  company text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Services catalog
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  price numeric(10,2),
  duration_days integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','draft')),
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select" ON services;
CREATE POLICY "services_select" ON services FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "services_insert" ON services;
CREATE POLICY "services_insert" ON services FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "services_update" ON services;
CREATE POLICY "services_update" ON services FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "services_delete" ON services;
CREATE POLICY "services_delete" ON services FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  description text,
  service_type text NOT NULL DEFAULT 'CCTV Installation',
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled','on_hold')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  start_date date,
  end_date date,
  budget numeric(12,2),
  location text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','blocked')),
  color text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_select" ON project_milestones;
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "milestones_insert" ON project_milestones;
CREATE POLICY "milestones_insert" ON project_milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "milestones_update" ON project_milestones;
CREATE POLICY "milestones_update" ON project_milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "milestones_delete" ON project_milestones;
CREATE POLICY "milestones_delete" ON project_milestones FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Project Tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee text,
  status text DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','blocked')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select" ON project_tasks;
CREATE POLICY "tasks_select" ON project_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert" ON project_tasks;
CREATE POLICY "tasks_insert" ON project_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update" ON project_tasks;
CREATE POLICY "tasks_update" ON project_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete" ON project_tasks;
CREATE POLICY "tasks_delete" ON project_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Service Requests
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  service_name text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  scheduled_date date,
  location text,
  amount numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select" ON service_requests;
CREATE POLICY "requests_select" ON service_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "requests_insert" ON service_requests;
CREATE POLICY "requests_insert" ON service_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "requests_update" ON service_requests;
CREATE POLICY "requests_update" ON service_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "requests_delete" ON service_requests;
CREATE POLICY "requests_delete" ON service_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Service History
CREATE TABLE IF NOT EXISTS service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id),
  client_name text NOT NULL,
  service_name text NOT NULL,
  category text,
  technician text,
  completed_date date,
  amount numeric(10,2),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select" ON service_history;
CREATE POLICY "history_select" ON service_history FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_insert" ON service_history;
CREATE POLICY "history_insert" ON service_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_update" ON service_history;
CREATE POLICY "history_update" ON service_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_delete" ON service_history;
CREATE POLICY "history_delete" ON service_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  category text,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  rating numeric(3,1) DEFAULT 4.0,
  total_orders integer DEFAULT 0,
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendors_select" ON vendors;
CREATE POLICY "vendors_select" ON vendors FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vendors_insert" ON vendors;
CREATE POLICY "vendors_insert" ON vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vendors_update" ON vendors;
CREATE POLICY "vendors_update" ON vendors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vendors_delete" ON vendors;
CREATE POLICY "vendors_delete" ON vendors FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON project_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_history_user_id ON service_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
