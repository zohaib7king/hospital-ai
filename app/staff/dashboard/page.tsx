'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut,
  Activity,
  Search,
  Bell,
  User
} from 'lucide-react';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        router.replace('/staff/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    }
    getSession();
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace('/staff/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Activity className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg">City Care</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Calendar size={20} />} label="Appointments" />
          <NavItem icon={<Users size={20} />} label="Patients" />
          <NavItem icon={<ClipboardList size={20} />} label="Triage Queue" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search patients, appointments..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'Staff Member'}</p>
                <p className="text-xs text-slate-500 capitalize">Clinical Staff</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/10">
                <User size={20} className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0]}</h1>
            <p className="text-slate-400">Here's what's happening at City Care Hospital today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Appointments" value="24" change="+12%" />
            <StatCard label="Pending Triage" value="8" change="-2" />
            <StatCard label="Active Doctors" value="12" />
            <StatCard label="New Patients" value="5" change="+3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
              <div className="text-slate-500 text-center py-12">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No appointments scheduled for the next hour.</p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Triage Priority</h3>
              <div className="space-y-4">
                <PriorityItem name="John Doe" level="Emergency" time="2m ago" />
                <PriorityItem name="Jane Smith" level="Urgent" time="15m ago" />
                <PriorityItem name="Robert Brown" level="Routine" time="45m ago" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-xl transition ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ label, value, change }: { label: string, value: string, change?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <div className="flex items-end gap-3">
        <h4 className="text-2xl font-bold">{value}</h4>
        {change && (
          <span className={`text-xs font-medium mb-1 ${change.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function PriorityItem({ name, level, time }: { name: string, level: string, time: string }) {
  const colors = {
    Emergency: 'bg-red-500/10 text-red-400 border-red-500/20',
    Urgent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Routine: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${colors[level as keyof typeof colors]}`}>
        {level}
      </span>
    </div>
  );
}
