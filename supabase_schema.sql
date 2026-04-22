-- 방문 통계 테이블 생성
CREATE TABLE site_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id text NOT NULL, -- 웹사이트 식별 아이디 (예: 'main-homepage')
  ip_address text,
  referrer text,
  user_agent text,
  is_bot boolean DEFAULT false,
  bot_name text,
  visited_path text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX idx_site_visits_site_id ON site_visits(site_id);

-- RLS 설정 (Service Role만 insert 가능하게 하거나, Public Insert 허용 - 필요에 따라 조정)
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Service Role에게 모든 권한 부여
CREATE POLICY "Service Role full access" ON site_visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
