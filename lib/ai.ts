import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AITriageResponse } from './types';

// Initialize clients if keys exist and are not placeholders
const getAnthropicClient = () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && key !== 'your_anthropic_api_key' && key.trim() !== '') {
    return new Anthropic({ apiKey: key });
  }
  return null;
};

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (key && key !== 'your_gemini_api_key' && key.trim() !== '') {
    return new GoogleGenerativeAI(key);
  }
  return null;
};

// Returns which AI provider to use
export type AIProvider = 'anthropic' | 'gemini' | 'deepseek' | 'mock';

export function getSelectedProvider(): AIProvider {
  const explicitProvider = process.env.AI_PROVIDER?.toLowerCase();
  
  if (explicitProvider === 'anthropic' && getAnthropicClient()) return 'anthropic';
  if (explicitProvider === 'gemini' && getGeminiClient()) return 'gemini';
  if (explicitProvider === 'deepseek' && process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key') return 'deepseek';
  
  // Auto-detect based on configured keys
  if (getGeminiClient()) return 'gemini';
  if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key' && process.env.DEEPSEEK_API_KEY.trim() !== '') return 'deepseek';
  if (getAnthropicClient()) return 'anthropic';
  
  return 'mock';
}

export async function runAITriage(triageData: {
  chief_complaint: string;
  symptoms: string[];
  symptom_duration?: string;
  pain_scale?: number;
  fever?: boolean;
  temperature_celsius?: number;
  existing_conditions?: string[];
  current_medications?: string;
}): Promise<AITriageResponse> {
  const provider = getSelectedProvider();
  
  const prompt = `You are a clinical triage AI assistant for a hospital in Pakistan.
Analyze the patient's symptoms and return a JSON triage assessment.
This is for STAFF GUIDANCE only — not a medical diagnosis for the patient.

Patient Data:
${JSON.stringify(triageData, null, 2)}

Return ONLY a valid JSON object with this exact structure:
{
  "triage_level": "emergency" | "urgent" | "semi_urgent" | "routine",
  "triage_score": 1-100,
  "ai_assessment": "2-3 sentence clinical summary of the presentation",
  "recommended_department": "department name",
  "recommended_doctor_specialization": "specialization needed",
  "red_flags": ["list of concerning symptoms that need immediate attention"],
  "ai_questions_for_doctor": ["important questions the doctor should ask this patient"],
  "estimated_wait_minutes": 0-120,
  "ai_instructions_for_patient": "What the patient should do while waiting. Friendly, clear, in simple English.",
  "differential_considerations": ["possible conditions to consider — for doctor's awareness only"]
}

Triage levels:
- EMERGENCY (score 80-100): Life threatening, needs immediate attention. Chest pain, stroke symptoms, severe breathing difficulty, major trauma, unconsciousness.
- URGENT (score 60-79): Needs attention within 1 hour. High fever, severe pain, moderate injury, significant distress.
- SEMI_URGENT (score 30-59): Can wait 2-4 hours. Moderate symptoms, stable condition, needs care today.
- ROUTINE (score 0-29): Non-urgent, can be scheduled normally. Chronic condition review, mild symptoms, checkups.

Always err on the side of caution. If in doubt, assign a higher triage level.`;

  console.log(`Running AI Triage using provider: ${provider.toUpperCase()}`);

  try {
    if (provider === 'anthropic') {
      const client = getAnthropicClient();
      if (!client) throw new Error('Anthropic client initialization failed');
      
      const response = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      });

      const contentBlock = response.content[0];
      const textContent = contentBlock.type === 'text' ? contentBlock.text : '';
      return parseJsonText(textContent);
    } 
    
    if (provider === 'gemini') {
      const client = getGeminiClient();
      if (!client) throw new Error('Gemini client initialization failed');
      
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });
      
      const response = await model.generateContent(prompt);
      const textContent = response.response.text();
      return parseJsonText(textContent);
    }
    
    if (provider === 'deepseek') {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const modelName = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: {
            type: 'json_object'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API returned status ${response.status}`);
      }

      const data = await response.json();
      const textContent = data.choices[0].message.content;
      return parseJsonText(textContent);
    }

    // Default mock fallback
    return getMockTriageResponse(triageData);
  } catch (error) {
    console.error(`AI triage failed for provider ${provider}. Falling back to mock.`, error);
    return getMockTriageResponse(triageData);
  }
}

// Utility to extract and parse JSON from model output
function parseJsonText(text: string): AITriageResponse {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Response did not contain a valid JSON block: ' + text);
  }
  const jsonStr = text.slice(jsonStart, jsonEnd);
  return JSON.parse(jsonStr) as AITriageResponse;
}

function getMockTriageResponse(triageData: {
  chief_complaint: string;
  symptoms: string[];
  symptom_duration?: string;
  pain_scale?: number;
  fever?: boolean;
  temperature_celsius?: number;
  existing_conditions?: string[];
  current_medications?: string;
}): AITriageResponse {
  const complaint = (triageData.chief_complaint || '').toLowerCase();
  const pain = Number(triageData.pain_scale || 1);
  const hasFever = triageData.fever === true;

  if (
    complaint.includes('chest') || 
    complaint.includes('heart') || 
    complaint.includes('breathing') || 
    complaint.includes('shortness of breath') || 
    complaint.includes('stroke') ||
    complaint.includes('unconscious') ||
    pain >= 9
  ) {
    return {
      triage_level: 'emergency',
      triage_score: 95,
      ai_assessment: "Patient presents with symptoms highly suggestive of acute cardiovascular or respiratory compromise. Immediate clinical assessment and stabilizing interventions are warranted.",
      recommended_department: "Emergency",
      recommended_doctor_specialization: "Emergency Care Specialist / Cardiologist",
      red_flags: ["Crushing chest pain radiating to jaw or left arm", "Acute dyspnea", "Diaphoresis", "Cyanosis"],
      ai_questions_for_doctor: [
        "What is the exact onset and character of the chest/respiratory symptom?",
        "Are there cardiac risk factors (diabetes, hypertension, family history)?",
        "Perform immediate ECG, check oxygen saturation, and establish IV access."
      ],
      estimated_wait_minutes: 0,
      ai_instructions_for_patient: "Please inform the front desk nurse immediately. Do not attempt to walk. Sit back, stay calm, and a nurse will attend to you in a few seconds.",
      differential_considerations: ["Acute Coronary Syndrome (ACS)", "Pulmonary Embolism", "Aortic Dissection", "Pneumothorax"]
    };
  }

  if (
    hasFever || 
    complaint.includes('severe') || 
    complaint.includes('broken') || 
    complaint.includes('fracture') || 
    pain >= 7
  ) {
    return {
      triage_level: 'urgent',
      triage_score: 75,
      ai_assessment: "Patient shows signs of acute infection or significant localized trauma. Needs priority evaluation to check vitals and administer analgesia or initial therapies within 60 minutes.",
      recommended_department: "General Medicine",
      recommended_doctor_specialization: "General Physician / Orthopedist",
      red_flags: ["High temperature (> 39 C)", "Inability to tolerate oral fluids", "Signs of localized cellulitis or sepsis"],
      ai_questions_for_doctor: [
        "What is the duration and pattern of the fever?",
        "Are there signs of meningism or peritonitis?",
        "Obtain complete blood count (CBC) and urine analysis if indicated."
      ],
      estimated_wait_minutes: 30,
      ai_instructions_for_patient: "Sit down in the waiting area. Sip water if you can. Alert the nursing staff if you feel faint, start shivering, or if your pain level increases.",
      differential_considerations: ["Pyelonephritis", "Pneumonia", "Acute Appendicitis", "Fracture"]
    };
  }

  if (
    complaint.includes('cough') || 
    complaint.includes('throat') || 
    complaint.includes('stomach') || 
    complaint.includes('vomit') || 
    pain >= 4
  ) {
    return {
      triage_level: 'semi_urgent',
      triage_score: 45,
      ai_assessment: "Patient presents with stable, moderate symptoms. Vitals are likely stable, and there is no immediate threat of decompensation. Review within 2-4 hours is appropriate.",
      recommended_department: "General Medicine",
      recommended_doctor_specialization: "General Practitioner / ENT Specialist",
      red_flags: ["Progression to high fever", "Development of shortness of breath", "Inability to swallow liquids"],
      ai_questions_for_doctor: [
        "Are there any associated gastrointestinal or upper respiratory tract symptoms?",
        "Has the patient been exposed to anyone with similar symptoms?",
        "Perform physical examination of abdomen / throat as indicated."
      ],
      estimated_wait_minutes: 90,
      ai_instructions_for_patient: "Please wear a surgical mask if you have a cough. Keep yourself hydrated. A receptionist will call your name when the doctor is ready.",
      differential_considerations: ["Acute Gastroenteritis", "Pharyngitis / Tonsillitis", "Upper Respiratory Tract Infection (URTI)"]
    };
  }

  return {
    triage_level: 'routine',
    triage_score: 15,
    ai_assessment: "Patient presents with mild or chronic, stable complaints. Routine scheduled consultation is appropriate as there are no red flags or acute distress.",
    recommended_department: "General Medicine",
    recommended_doctor_specialization: "General Practitioner",
    red_flags: ["Acute worsening of baseline symptoms", "Development of severe pain"],
    ai_questions_for_doctor: [
      "Is this a follow-up of a pre-existing condition?",
      "Are current medication dosages effective and tolerated?",
      "Review baseline blood work and vitals tracker."
    ],
    estimated_wait_minutes: 120,
    ai_instructions_for_patient: "Thank you for your patience. Your scheduled slot is being prepared. Feel free to wait in the main lobby or visit the cafe.",
    differential_considerations: ["Chronic Disease Management", "Routine Wellness Screening", "Medication Refill Evaluation"]
  };
}
