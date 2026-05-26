'use client';

import { useState } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Stethoscope, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse
} from 'lucide-react';
import SymptomSelector from './SymptomSelector';
import AppointmentSlotPicker from './AppointmentSlotPicker';

type Step = 'personal' | 'symptoms' | 'appointment' | 'confirming' | 'success';

export default function PatientIntakeForm() {
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    symptoms: [] as string[],
    chiefComplaint: '',
    doctorId: '',
    departmentId: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (step === 'personal') setStep('symptoms');
    else if (step === 'symptoms') setStep('appointment');
  };

  const handleBack = () => {
    if (step === 'symptoms') setStep('personal');
    else if (step === 'appointment') setStep('symptoms');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setStep('confirming');

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit intake form');
      }

      setStep('success');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message);
      setStep('appointment'); // Go back to allow retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== 'success' && step !== 'confirming' && (
        <div className="mb-8 flex items-center justify-between px-2">
          <ProgressStep active={step === 'personal'} completed={step !== 'personal'} label="Personal" icon={<User size={16} />} />
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-4" />
          <ProgressStep active={step === 'symptoms'} completed={step === 'appointment'} label="Symptoms" icon={<Stethoscope size={16} />} />
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-4" />
          <ProgressStep active={step === 'appointment'} completed={false} label="Booking" icon={<Calendar size={16} />} />
        </div>
      )}

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          {step === 'personal' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <header>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Patient Information</h2>
                <p className="text-zinc-500 text-sm mt-1">Please provide your basic details to get started.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                <InputGroup label="Full Name" icon={<User size={18} />}>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => updateFormData({ fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </InputGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Phone Number" icon={<Phone size={18} />}>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => updateFormData({ phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </InputGroup>
                  <InputGroup label="Date of Birth" icon={<Calendar size={18} />}>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => updateFormData({ dob: e.target.value })}
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </InputGroup>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gender</label>
                  <div className="flex gap-3">
                    {['male', 'female', 'other'].map(g => (
                      <button
                        key={g}
                        onClick={() => updateFormData({ gender: g })}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition ${
                          formData.gender === g 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-200 dark:hover:border-blue-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.fullName || !formData.phone || !formData.dob || !formData.gender}
                className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continue to Symptoms
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 'symptoms' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <header>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">How are you feeling?</h2>
                <p className="text-zinc-500 text-sm mt-1">Select your symptoms and describe your main concern.</p>
              </header>

              <SymptomSelector 
                selectedSymptoms={formData.symptoms}
                onSymptomToggle={(symptom) => {
                  const newSymptoms = formData.symptoms.includes(symptom)
                    ? formData.symptoms.filter(s => s !== symptom)
                    : [...formData.symptoms, symptom];
                  updateFormData({ symptoms: newSymptoms });
                }}
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chief Complaint</label>
                <textarea
                  rows={3}
                  value={formData.chiefComplaint}
                  onChange={e => updateFormData({ chiefComplaint: e.target.value })}
                  placeholder="Tell us more about why you're visiting today..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.symptoms.length === 0 && !formData.chiefComplaint}
                  className="flex-[2] bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule Appointment
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 'appointment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <header>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Book Your Slot</h2>
                <p className="text-zinc-500 text-sm mt-1">Choose a convenient time for your visit.</p>
              </header>

              <AppointmentSlotPicker 
                onSelect={(data) => {
                  updateFormData(data);
                  handleSubmit();
                }}
              />

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleBack}
                className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition mt-4"
              >
                <ArrowLeft size={20} />
                Back to Symptoms
              </button>
            </div>
          )}

          {step === 'confirming' && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <Activity className="h-16 w-16 text-blue-500 animate-spin mx-auto relative" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Processing Intake</h2>
                <p className="text-zinc-500 max-w-xs mx-auto mt-2">
                  Our AI is analyzing your symptoms and preparing your clinical record...
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Appointment Confirmed!</h2>
                <p className="text-zinc-500 max-w-xs mx-auto mt-2">
                  We've sent a confirmation message to your phone. Please arrive 15 minutes before your slot.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold rounded-xl hover:opacity-90 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      {step !== 'success' && (
        <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <HeartPulse size={16} />
            HIPAA Compliant
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Activity size={16} />
            AI-Driven Triage
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressStep({ active, completed, label, icon }: { active: boolean, completed: boolean, label: string, icon: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-center gap-2 transition-opacity ${active || completed ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
        completed 
          ? 'bg-emerald-500 border-emerald-500 text-white' 
          : active 
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
            : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
      }`}>
        {completed ? <CheckCircle2 size={20} /> : icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InputGroup({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
        <span className="text-zinc-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
