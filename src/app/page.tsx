import { getDashboardStats, getRecentVisits, getDailyStats } from '@/lib/stats';
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
import { VisitorChart } from '@/components/dashboard/visitor-chart';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentVisits = await getRecentVisits(8);
  const dailyData = await getDailyStats();

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
            <CardTitle>최근 7일 방문 트렌드</CardTitle>
            <CardDescription>
              일별 실제 사용자 및 AI 봇 방문 추이입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart data={dailyData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>방문자 유형 분포</CardTitle>
            <CardDescription>
              누적 데이터 기준
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
             <div className="text-center space-y-4">
               <div className="space-y-1">
                 <div className="text-5xl font-bold text-emerald-500">{stats.humans}</div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Actual Users</p>
               </div>
               <div className="w-full h-px bg-slate-100" />
               <div className="space-y-1">
                 <div className="text-3xl font-bold text-blue-500">{stats.bots}</div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">AI Agents / Bots</p>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
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
                  <TableHead>사이트</TableHead>
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
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {visit.site_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{visit.ip_address}</TableCell>
                    <TableCell className="text-xs truncate max-w-[150px]">
                      {visit.referrer}
                    </TableCell>
                    <TableCell>
                      {visit.is_bot ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                          {visit.bot_name || 'Bot'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
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
      </div>
    </div>
  );
}
