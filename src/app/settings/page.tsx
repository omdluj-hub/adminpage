import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">관리자 대시보드 및 서비스 환경 설정입니다.</p>
        </div>
        <Settings className="h-8 w-8 text-primary/20" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
          <CardDescription>현재 연동된 서비스 및 버전 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">대시보드 버전</span>
            <span className="text-muted-foreground">v1.0.0</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Supabase 연동 상태</span>
            <span className="text-green-600">정상 연결됨</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Gmail API 상태</span>
            <span className="text-green-600">활성화됨</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
