'use client';

import { useState, useEffect } from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Globe, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SiteVisit } from '@/lib/types';

export default function TrafficPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<SiteVisit[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 가져오기 (Client-side fetch)
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // lib/stats의 getRecentVisits는 서버 사이드용이므로 API를 통해 가져오거나 
      // 현재는 간단하게 로직을 작성합니다.
      // (참고: 기존 stats.ts를 활용하는 별도 API를 만들거나 직접 연동)
      const response = await fetch('/api/stats?limit=100');
      const data = await response.json();
      setVisits(data);
      setFilteredVisits(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let result = visits;
    
    if (selectedSite !== 'all') {
      result = result.filter(v => v.site_id === selectedSite);
    }
    
    if (searchTerm) {
      result = result.filter(v => 
        v.ip_address.includes(searchTerm) || 
        v.visited_path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredVisits(result);
  }, [selectedSite, searchTerm, visits]);

  // 유니크한 사이트 ID 목록 추출
  const siteIds = Array.from(new Set(visits.map(v => v.site_id)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">방문자 로그</h1>
          <p className="text-muted-foreground">연동된 모든 사이트의 실시간 접속 기록입니다.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="icon" onClick={fetchLogs} disabled={isLoading}>
             <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
           </Button>
           <BarChart3 className="h-8 w-8 text-primary/20" />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="IP 또는 경로 검색..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">사이트별 보기:</span>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="모든 사이트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 사이트</SelectItem>
              {siteIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(val) => setSelectedSite(val)}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          {siteIds.map(id => (
            <TabsTrigger key={id} value={id}>{id}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>접속 로그 ({filteredVisits.length}건)</CardTitle>
          {selectedSite !== 'all' && (
            <Badge variant="secondary" className="px-3">
              {selectedSite} 사이트 집중 분석 중
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>접속 시간</TableHead>
                <TableHead>사이트</TableHead>
                <TableHead>IP 주소</TableHead>
                <TableHead>방문 경로</TableHead>
                <TableHead>구분</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    로그를 불러오는 중입니다...
                  </TableCell>
                </TableRow>
              ) : filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    해당 조건에 맞는 방문 기록이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit) => (
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
                        {visit.site_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{visit.ip_address}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {visit.visited_path}
                    </TableCell>
                    <TableCell>
                      {visit.is_bot ? (
                        <Badge variant="secondary" className="text-blue-700">
                          {visit.bot_name || 'Bot'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-700">
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
