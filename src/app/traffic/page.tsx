'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { BarChart3, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SiteVisit } from '@/lib/types';

// 명시적으로 관리할 사이트 목록 (데이터가 없어도 메뉴에 보임)
const PREDEFINED_SITES = ['ipwon', 'autohtml', 'board', 'viral', 'skin', 'event'];

export default function TrafficPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<SiteVisit[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats?limit=100');
      const data = await response.json();
      if (Array.isArray(data)) {
        setVisits(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  const handleSiteChange = (value: string | null) => {
    setSelectedSite(value || 'all');
  };

  // 데이터 기반 사이트 ID 목록 + 미리 정의된 목록 합치기 (중복 제거)
  const dynamicSiteIds = Array.from(new Set(visits.map(v => v.site_id)));
  const allSiteIds = Array.from(new Set([...PREDEFINED_SITES, ...dynamicSiteIds])).sort();

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
          <Select value={selectedSite} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="모든 사이트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 사이트</SelectItem>
              {allSiteIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedSite} onValueChange={handleSiteChange}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            전체
          </TabsTrigger>
          {allSiteIds.map(id => (
            <TabsTrigger key={id} value={id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {id}
            </TabsTrigger>
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
                    {selectedSite === 'all' 
                      ? '수집된 방문 기록이 없습니다. 트래커 설정을 확인해 주세요.' 
                      : `${selectedSite} 사이트의 방문 기록이 아직 없습니다.`}
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
