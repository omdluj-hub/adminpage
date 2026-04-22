'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, RefreshCw, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmailMessage } from '@/lib/types';

// 임시 더미 데이터
const DUMMY_EMAILS: EmailMessage[] = [
  {
    id: '1',
    threadId: 't1',
    from: '환자 김철수 <chulsoo@example.com>',
    subject: '진료 예약 문의드립니다.',
    snippet: '안녕하세요, 원장님. 다름이 아니라 다음 주 월요일 오후 2시에...',
    date: '2024-04-22 14:30',
    isRead: false,
  },
  {
    id: '2',
    threadId: 't2',
    from: '구글 비즈니스 <no-reply@google.com>',
    subject: '귀하의 한의원 리뷰가 업데이트되었습니다.',
    snippet: '새로운 별점 5점 리뷰가 등록되었습니다. 확인해보세요.',
    date: '2024-04-22 10:15',
    isRead: true,
  },
  {
    id: '3',
    threadId: 't3',
    from: '제약회사 박대리 <park@pharm.com>',
    subject: '[공지] 신규 약재 입고 안내',
    snippet: '이번에 새롭게 입고된 경옥고 성분 분석표 및 단가표 송부드립니다.',
    date: '2024-04-21 16:45',
    isRead: true,
  },
];

export default function MailPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">메일함</h1>
          <p className="text-muted-foreground">Gmail API를 통해 수신된 메일을 확인합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>메일 쓰기</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메일 목록 섹션 */}
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
          <CardContent className="p-0">
            <div className="flex flex-col">
              {DUMMY_EMAILS.map((email) => (
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
                      {email.date.split(' ')[1]}
                    </span>
                  </div>
                  <div className="text-sm font-medium line-clamp-1 mb-1">
                    {email.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {email.snippet}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 메일 본문 섹션 */}
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
                <div className="min-h-[300px] text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {selectedEmail.snippet}
                  {"\n\n"}
                  --- 본문 내용은 실제 Gmail API 연동 후 표시됩니다 ---
                  {"\n\n"}
                  안녕하세요, {"\n"}
                  시스템에 연동된 메일 본문이 이곳에 출력됩니다. 
                  HTML 형식의 메일도 깔끔하게 렌더링될 예정입니다.
                </div>
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
