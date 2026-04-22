import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { EmailMessage } from '@/lib/types';
import { authOptions } from '@/lib/auth';

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET() {
  try {
    // authOptions를 명시적으로 전달하여 세션을 가져옵니다.
    const session = await getServerSession(authOptions) as ExtendedSession;

    if (!session || !session.accessToken) {
      console.error('Session check failed:', session ? 'No access token' : 'No session');
      return NextResponse.json({ error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    // 전체 메일을 가져오기 위해 카테고리 필터 제거 (더 확실하게!)
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 15,
      // q: 'category:primary', // 필터 제거하여 모든 메일 확인
    });

    const messages = response.data.messages || [];
    const emailData: EmailMessage[] = [];

    if (messages.length === 0) {
      return NextResponse.json([]);
    }

    await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const headers = detail.data.payload?.headers || [];
          const subject = headers.find((h) => h.name === 'Subject')?.value || '(제목 없음)';
          const from = headers.find((h) => h.name === 'From')?.value || '(발신자 정보 없음)';
          const dateRaw = headers.find((h) => h.name === 'Date')?.value || '';
          
          const date = new Date(dateRaw).toLocaleString('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          emailData.push({
            id: msg.id!,
            threadId: detail.data.threadId!,
            from,
            subject,
            snippet: detail.data.snippet || '',
            date,
            isRead: !detail.data.labelIds?.includes('UNREAD'),
            body: detail.data.snippet || '',
          });
        } catch (e) {
          console.error(`Error fetching message ${msg.id}:`, e);
        }
      })
    );

    emailData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(emailData);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gmail API Error 상세:', error);
    return NextResponse.json({ error: 'Failed to fetch emails', details: error.message }, { status: 500 });
  }
}
