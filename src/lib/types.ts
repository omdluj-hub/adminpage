export interface SiteVisit {
  id: string;
  site_id: string;
  ip_address: string;
  referrer: string;
  user_agent: string;
  is_bot: boolean;
  bot_name: string | null;
  visited_path: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface TelemedicineChart {
  id: string;
  patient_name: string;
  gender: string;
  age: number;
  symptoms: string;
  status: 'pending' | 'treated';
  created_at: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  body?: string;
}
