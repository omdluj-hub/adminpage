import { getDashboardStats, getRecentVisits } from '@/lib/stats';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { Users, Bot, Calendar, Globe } from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentVisits = await getRecentVisits(8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">한의원 웹사이트의 실시간 현황입니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 방문자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 7일</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sevenDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 방문자</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 봇 방문</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bots}</div>
            <p className="text-xs text-muted-foreground">
              전체 중 {((stats.bots / (stats.total || 1)) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>최근 방문 기록</CardTitle>
            <CardDescription>
              실시간으로 수집된 접속 로그입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>유입 경로</TableHead>
                  <TableHead>구분</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="text-xs">
                      {new Date(visit.created_at).toLocaleString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{visit.ip_address}</TableCell>
                    <TableCell className="text-xs truncate max-w-[150px]">
                      {visit.referrer}
                    </TableCell>
                    <TableCell>
                      {visit.is_bot ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                          {visit.bot_name || 'Bot'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          User
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI 봇 분석</CardTitle>
            <CardDescription>
              방문자 유형 분포
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-8">
             {/* Recharts는 Client Component에서 별도로 구현 추천 */}
             <div className="text-center">
               <div className="text-4xl font-bold text-primary">{stats.humans}</div>
               <p className="text-sm text-muted-foreground">실제 사용자</p>
               <div className="mt-4 text-2xl font-bold text-slate-400">{stats.bots}</div>
               <p className="text-sm text-muted-foreground">AI 에이전트 / 봇</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
