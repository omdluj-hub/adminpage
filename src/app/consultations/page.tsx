import { getConsultations } from '@/lib/data';
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
import { Consultation } from '@/lib/types';

export default async function ConsultationsPage() {
  const consultations: Consultation[] = await getConsultations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">상담 신청 관리</h1>
        <p className="text-muted-foreground">홈페이지를 통해 접수된 상담 신청 내역입니다.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 신청 ({consultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신청일</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상담 내용</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    접수된 상담 신청이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                consultations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'completed' ? 'secondary' : 'default'}>
                        {item.status === 'completed' ? '완료' : '대기중'}
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
