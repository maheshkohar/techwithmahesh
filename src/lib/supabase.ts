import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'admin' | 'manager' | 'technician' | 'client';
  avatar_url: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  duration_days: number;
  status: 'active' | 'inactive' | 'draft';
  icon: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  client_name: string;
  client_email: string | null;
  description: string | null;
  service_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  location: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  color: string;
  sort_order: number;
  created_at: string;
};

export type Task = {
  id: string;
  milestone_id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
};

export type ServiceRequest = {
  id: string;
  user_id: string;
  service_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  service_name: string;
  description: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string | null;
  location: string | null;
  amount: number | null;
  created_at: string;
  updated_at: string;
};

export type ServiceHistory = {
  id: string;
  user_id: string;
  project_id: string | null;
  client_name: string;
  service_name: string;
  category: string | null;
  technician: string | null;
  completed_date: string | null;
  amount: number | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
};

export type Vendor = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  total_orders: number;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
};
