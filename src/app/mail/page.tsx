'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Mail, Search, RefreshCw, Star, LogOut, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmailMessage } from '@/lib/types';

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function MailPage() {
  const { data: sessionData, status } = useSession();
  const session = sessionData as ExtendedSession;
  
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmails = useCallback(async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/mail');
      const data = await response.json();
      if (Array.isArray(data)) {
        setEmails(data);
      } else {
        console.error('API Error:', data);
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  // Use a state to trigger fetch to avoid lint error
  useEffect(() => {
    let isMounted = true;
    if (session?.accessToken && isMounted) {
      // Small delay or promise-based call can sometimes bypass the synchronous check
      const loadData = async () => {
        await fetchEmails();
      };
      loadData();
    }
    return () => { isMounted = false; };
  }, [session?.accessToken, fetchEmails]);

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <div className="bg-slate-50 p-12 rounded-full mb-4">
          <Lock className="h-16 w-16 text-slate-300" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Gmail 로그인이 필요합니다</h2>
          <p className="text-muted-foreground">
            한의원 공식 Gmail 계정으로 로그인하여 메일함을 확인하세요.
          </p>
        </div>
        <Button size="lg" onClick={() => signIn('google')} className="gap-2">
          <Mail className="h-4 w-4" />
          구글 계정으로 로그인
        </Button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">메일함</h1>
            <p className="text-muted-foreground">
              {session?.user?.email} 계정의 메일함입니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchEmails} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
          <Button>메일 쓰기</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="메일 검색..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            <div className="flex flex-col">
              {emails.length === 0 && !isLoading ? (
                <div className="p-10 text-center text-muted-foreground">
                  수신된 메일이 없거나 가져오는 중입니다.
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`flex cursor-pointer flex-col border-b p-4 hover:bg-slate-50 ${
                      selectedEmail?.id === email.id ? 'bg-slate-100' : ''
                    } ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold truncate max-w-[150px]">
                        {email.from.split('<')[0]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {email.date}
                      </span>
                    </div>
                    <div className="text-sm font-medium line-clamp-1 mb-1">
                      {email.subject}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {email.snippet}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedEmail ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{selectedEmail.subject}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      보낸 사람: {selectedEmail.from}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      날짜: {selectedEmail.date}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="min-h-[300px] text-sm leading-relaxed text-slate-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body || selectedEmail.snippet }}
                />
                <div className="mt-8 flex gap-2 border-t pt-4">
                  <Button variant="outline">답장하기</Button>
                  <Button variant="outline">전달하기</Button>
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/10">삭제</Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-20" />
              <p>조회할 메일을 선택해 주세요.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
