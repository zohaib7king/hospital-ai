'use client';

import { useState } from 'react';
import { Search, X, Check, Activity } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Shortness of breath', 'Chest pain', 'Headache',
  'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain', 'Back pain',
  'Joint pain', 'Muscle ache', 'Fatigue', 'Dizziness', 'Sore throat',
  'Rash', 'Itching', 'Swelling', 'Numbness', 'Vision changes'
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
}

export default function SymptomSelector({ selectedSymptoms, onSymptomToggle }: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSymptoms.includes(s)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Search symptoms (e.g. fever, headache)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSymptoms.map(symptom => (
            <button
              key={symptom}
              onClick={() => onSymptomToggle(symptom)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-xs font-medium transition hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              {symptom}
              <X size={14} />
            </button>
          ))}
        </div>
      )}

      {/* Suggested Symptoms */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity size={14} />
          {searchTerm ? 'Search Results' : 'Common Symptoms'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(searchTerm ? filteredSymptoms : COMMON_SYMPTOMS.filter(s => !selectedSymptoms.includes(s))).slice(0, 12).map(symptom => (
            <button
              key={symptom}
              onClick={() => onSymptomToggle(symptom)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-sm text-zinc-600 dark:text-zinc-400 transition text-left"
            >
              <span>{symptom}</span>
              <Check size={14} className="opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
        
        {searchTerm && filteredSymptoms.length === 0 && (
          <div className="text-center py-6 text-zinc-500 text-sm italic">
            No matching symptoms found. You can still describe it in the notes.
          </div>
        )}
      </div>
    </div>
  );
}
