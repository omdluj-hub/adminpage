import { getServiceSupabase } from './supabase';

export async function getDashboardStats() {
  const supabase = getServiceSupabase();
  const now = new Date();
  
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel fetching for performance
  const [
    { count: todayCount },
    { count: sevenDaysCount },
    { count: thirtyDaysCount },
    { count: totalCount },
    { count: botCount },
  ] = await Promise.all([
    supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('site_visits').select('*', { count: 'exact', head: true }),
    supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('is_bot', true),
  ]);

  return {
    today: todayCount || 0,
    sevenDays: sevenDaysCount || 0,
    thirtyDays: thirtyDaysCount || 0,
    total: totalCount || 0,
    bots: botCount || 0,
    humans: (totalCount || 0) - (botCount || 0),
  };
}

export async function getRecentVisits(limit = 10) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('site_visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) return [];
  return data;
}
