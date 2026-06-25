'use client';

import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useUser } from '../context/UserContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu size={22} />
          </button>

          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none flex-1 text-gray-600 placeholder-gray-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-xs">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>
        </header>

        {/* Page Content — scrollable for normal pages, flex for copilot */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}


// 'use client';

// import { useEffect, useState, type ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { Bell, Menu, Search } from 'lucide-react';
// import Sidebar from './Sidebar';
// import { useUser } from '../context/UserContext';

// export default function DashboardLayout({ children }: { children: ReactNode }) {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { user } = useUser() as { user: any };
//   const router = useRouter();

//   // Guard: if nobody is logged in (and nothing in storage either), bounce to login.
//   useEffect(() => {
//     const stored = typeof window !== 'undefined' ? localStorage.getItem('hrms_user') : null;
//     if (!user && !stored) {
//       router.replace('/login');
//     }
//   }, [user, router]);

//   function initials(name?: string) {
//     if (!name) return '—';
//     return name
//       .split(' ')
//       .map((n) => n[0])
//       .slice(0, 2)
//       .join('')
//       .toUpperCase();
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

//       <div className="flex min-w-0 flex-1 flex-col">
//         {/* Topbar */}
//         <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
//           <button
//             onClick={() => setMobileOpen(true)}
//             className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
//             aria-label="Open menu"
//           >
//             <Menu size={20} />
//           </button>

//           <div className="relative max-w-md flex-1">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               placeholder="Search..."
//               className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none"
//             />
//           </div>

//           <div className="ml-auto flex items-center gap-3">
//             <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-50" aria-label="Notifications">
//               <Bell size={20} />
//               <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
//             </button>
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
//               {initials(user?.name)}
//             </div>
//           </div>
//         </header>

//         {/* Page content — this is the padding that was missing on Attendance */}
//         <main className="flex-1 p-4 sm:p-6 lg:p-8">
//           <div className="mx-auto max-w-7xl">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }


// // 'use client';

// // import { useState } from 'react';
// // import { Menu, Bell, Search } from 'lucide-react';
// // import Sidebar from './Sidebar';
// // import { useUser } from '../context/UserContext';

// // export default function DashboardLayout({ children }: { children: React.ReactNode }) {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const { user } = useUser();

// //   return (
// //     <div className="flex h-screen bg-gray-50 overflow-hidden">
// //       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

// //       {/* Main content */}
// //       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

// //         {/* Top Header */}
// //         <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 flex-shrink-0">
// //           <button
// //             onClick={() => setSidebarOpen(true)}
// //             className="lg:hidden text-gray-500 hover:text-gray-700"
// //           >
// //             <Menu size={22} />
// //           </button>

// //           {/* Search */}
// //           <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
// //             <Search size={16} className="text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search..."
// //               className="bg-transparent text-sm outline-none flex-1 text-gray-600 placeholder-gray-400"
// //             />
// //           </div>

// //           <div className="ml-auto flex items-center gap-3">
// //             {/* Notifications */}
// //             <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500">
// //               <Bell size={20} />
// //               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
// //             </button>

// //             {/* Avatar */}
// //             {user && (
// //               <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-xs">
// //                 {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
// //               </div>
// //             )}
// //           </div>
// //         </header>

// //         {/* Page Content */}
// //         <main className="flex-1 overflow-y-auto p-4 sm:p-6">
// //           {children}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }