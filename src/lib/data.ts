import { getServiceSupabase } from './supabase';

export async function getConsultations() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching consultations:', error);
    return [];
  }
  return data;
}

export async function getTelemedicineCharts() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('telemedicine_charts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching charts:', error);
    return [];
  }
  return data;
}

export async function updateStatus(table: string, id: string, status: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', id);
    
  return { success: !error, error };
}
