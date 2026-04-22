import { getRecentVisits } from '@/lib/stats';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Globe, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SiteVisit } from '@/lib/types';

export default async function TrafficPage() {
  const visits: SiteVisit[] = await getRecentVisits(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">방문자 로그</h1>
          <p className="text-muted-foreground">연동된 모든 사이트의 실시간 접속 기록입니다.</p>
        </div>
        <BarChart3 className="h-8 w-8 text-primary/20" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="IP 또는 경로 검색..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          필터링
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 접속 기록 (최대 50건)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>접속 시간</TableHead>
                <TableHead>사이트 ID</TableHead>
                <TableHead>IP 주소</TableHead>
                <TableHead>방문 경로</TableHead>
                <TableHead>유입 경로</TableHead>
                <TableHead>구분</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    수집된 방문 기록이 없습니다. 트래커 설정을 확인해 주세요.
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
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
                      <Badge variant="outline" className="bg-slate-50">
                        <Globe className="mr-1 h-3 w-3" />
                        {visit.site_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{visit.ip_address}</TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">
                      {visit.visited_path}
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate text-muted-foreground">
                      {visit.referrer}
                    </TableCell>
                    <TableCell>
                      {visit.is_bot ? (
                        <Badge variant="secondary" className="text-blue-700 border-blue-200">
                          {visit.bot_name || 'Bot'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          User
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
