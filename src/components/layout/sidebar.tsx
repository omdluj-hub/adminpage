'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Stethoscope, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: '대시보드', href: '/', icon: LayoutDashboard },
  { name: '방문자 로그', href: '/traffic', icon: BarChart3 },
  { name: '상담 신청', href: '/consultations', icon: Users },
  { name: '비대면 차트', href: '/charts', icon: Stethoscope },
  { name: '설정', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50/50">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold text-primary">한의원 관리자</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
