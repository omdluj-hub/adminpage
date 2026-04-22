import { getTelemedicineCharts } from '@/lib/data';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { TelemedicineChart } from '@/lib/types';

export default async function ChartsPage() {
  const charts: TelemedicineChart[] = await getTelemedicineCharts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">비대면 차트 관리</h1>
          <p className="text-muted-foreground">접수된 비대면 진료 신청 및 차트 목록입니다.</p>
        </div>
        <Stethoscope className="h-8 w-8 text-primary/20" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 차트 ({charts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>접수일</TableHead>
                <TableHead>환자명</TableHead>
                <TableHead>성별/나이</TableHead>
                <TableHead>주요 증상</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    접수된 비대면 차트가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                charts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{item.patient_name}</TableCell>
                    <TableCell>{item.gender} / {item.age}세</TableCell>
                    <TableCell className="max-w-xs truncate">{item.symptoms}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'treated' ? 'secondary' : 'outline'}>
                        {item.status === 'treated' ? '진료완료' : '대기중'}
                      </Badge>
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
