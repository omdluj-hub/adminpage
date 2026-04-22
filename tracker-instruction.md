# 외부 웹사이트 트래킹 적용 방법

기존에 운영 중인 한의원 홈페이지(Next.js 또는 일반 HTML/JS)에 아래 코드를 추가하여 방문 통계를 수집할 수 있습니다.

### 1. Next.js 프로젝트 (App Router 예시)

`layout.tsx` 또는 공통 컴포넌트에 추가하세요.

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('https://your-admin-domain.vercel.app/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id: 'main-homepage', // 웹사이트 구분 아이디
            visited_path: pathname,
            referrer: document.referrer,
          }),
          mode: 'no-cors', // CORS 이슈 방지 (로그만 남기는 용도)
        });
      } catch (err) {
        console.error('Tracking failed', err);
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
```

### 2. 일반 HTML/JS 사이트

`</body>` 태그 직전에 추가하세요.

```html
<script>
  (function() {
    fetch('https://your-admin-domain.vercel.app/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: 'legacy-homepage',
        visited_path: window.location.pathname,
        referrer: document.referrer
      }),
      mode: 'no-cors'
    });
  })();
</script>
```

**주의**: `https://your-admin-domain.vercel.app` 부분을 실제 배포된 관리자 페이지 주소로 변경해야 합니다.
