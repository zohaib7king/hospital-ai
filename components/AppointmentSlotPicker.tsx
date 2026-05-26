'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Calendar as CalendarIcon, Clock, User, Building2, CheckCircle2 } from 'lucide-react';
import { Department, Doctor } from '@/lib/types';

interface AppointmentSlotPickerProps {
  onSelect: (data: { doctorId: string; departmentId: string; date: string; time: string }) => void;
}

export default function AppointmentSlotPicker({ onSelect }: AppointmentSlotPickerProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: depts } = await supabaseBrowser.from('departments').select('*').eq('is_active', true);
        const { data: docs } = await supabaseBrowser.from('doctors').select('*, departments(*)').eq('is_active', true);
        
        if (depts) setDepartments(depts);
        if (docs) setDoctors(docs as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredDoctors = selectedDept 
    ? doctors.filter(d => d.department_id === selectedDept)
    : doctors;

  const handleConfirm = () => {
    if (selectedDoctor && selectedDept && selectedDate && selectedTime) {
      onSelect({
        doctorId: selectedDoctor,
        departmentId: selectedDept,
        date: selectedDate,
        time: selectedTime
      });
    }
  };

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Simple time slots
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
      <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={14} />
            Department
          </label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedDoctor('');
            }}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Doctor Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} />
            Preferred Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">Any Available Doctor</option>
            {filteredDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.full_name} ({doc.specialization})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon size={14} />
          Select Date
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dates.map(date => {
            const d = new Date(date);
            const isSelected = selectedDate === date;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-60">
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">{d.getDate()}</span>
                <span className="text-[10px] uppercase font-bold opacity-60">
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} />
            Select Time
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {timeSlots.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-xl border text-sm font-medium transition ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDoctor && selectedDate && selectedTime && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Slot Selected</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' })} at {selectedTime}
              </p>
            </div>
          </div>
          <button 
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            Confirm Slot
          </button>
        </div>
      )}
    </div>
  );
}
