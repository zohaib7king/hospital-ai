import Image from "next/image";
import PatientIntakeForm from "@/components/PatientIntakeForm";
import { Activity, Phone, MapPin, Clock } from "lucide-react";

export default function Home() {
  const hospitalName = process.env.NEXT_PUBLIC_HOSPITAL_NAME || "City Care Hospital";
  const hospitalPhone = process.env.NEXT_PUBLIC_HOSPITAL_PHONE || "+92 300 0000000";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-600 text-white">
              <Activity size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">{hospitalName}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href={`tel:${hospitalPhone}`} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition flex items-center gap-2">
              <Phone size={16} />
              {hospitalPhone}
            </a>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <a href="/staff/login" className="text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition">
              Staff Portal
            </a>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Smart Patient Intake
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Skip the waiting room.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Our AI-powered triage system helps you book the right doctor in minutes. 
            Tell us how you feel, and we'll handle the rest.
          </p>
        </div>

        {/* Intake Form */}
        <PatientIntakeForm />

        {/* Info Grid */}
        <div className="max-w-4xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard 
            icon={<MapPin className="text-blue-600" />} 
            title="Location" 
            desc="123 Clinical Way, Medical District, City" 
          />
          <InfoCard 
            icon={<Clock className="text-emerald-600" />} 
            title="Hours" 
            desc="Open 24/7 for Emergencies. OPD: 9AM - 9PM" 
          />
          <InfoCard 
            icon={<Phone className="text-indigo-600" />} 
            title="Emergency" 
            desc="Call 911 or our direct line for urgent care." 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500">
            © 2026 {hospitalName}. All rights reserved. Built with Next.js and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center space-y-2">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
