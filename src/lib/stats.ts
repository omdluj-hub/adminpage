import { getServiceSupabase } from './supabase';

export async function getDashboardStats() {
  const supabase = getServiceSupabase();
  const now = new Date();
  
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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

export async function getDailyStats() {
  const supabase = getServiceSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('site_visits')
    .select('created_at, is_bot')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  // 날짜별 그룹화
  const statsMap = new Map();
  
  // 최근 7일 날짜 초기화
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    statsMap.set(dateStr, { date: dateStr, total: 0, users: 0, bots: 0 });
  }

  data.forEach((visit) => {
    const dateStr = new Date(visit.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    if (statsMap.has(dateStr)) {
      const current = statsMap.get(dateStr);
      current.total += 1;
      if (visit.is_bot) current.bots += 1;
      else current.users += 1;
    }
  });

  return Array.from(statsMap.values());
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
