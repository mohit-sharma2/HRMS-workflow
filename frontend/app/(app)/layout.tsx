import type { ReactNode } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </DashboardLayout>
  );
}

// import type { ReactNode } from 'react';
// import DashboardLayout from '../../components/DashboardLayout';

// export default function AppLayout({ children }: { children: ReactNode }) {
//   return <DashboardLayout>{children}</DashboardLayout>;
// }