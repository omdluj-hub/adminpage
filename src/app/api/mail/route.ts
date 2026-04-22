import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { EmailMessage } from '@/lib/types';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  accessToken?: string;
}

export async function GET() {
  try {
    const session = await getServerSession() as ExtendedSession;

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 15,
      q: 'category:primary',
    });

    const messages = response.data.messages || [];
    const emailData: EmailMessage[] = [];

    await Promise.all(
      messages.map(async (msg) => {
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

        const body = detail.data.snippet || '';
        
        emailData.push({
          id: msg.id!,
          threadId: detail.data.threadId!,
          from,
          subject,
          snippet: detail.data.snippet || '',
          date,
          isRead: !detail.data.labelIds?.includes('UNREAD'),
          body: body,
        });
      })
    );

    emailData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(emailData);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gmail API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails', details: error.message }, { status: 500 });
  }
}
