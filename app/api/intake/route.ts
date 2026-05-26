import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { runAITriage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      dob,
      gender,
      symptoms,
      chiefComplaint,
      doctorId,
      departmentId,
      date,
      time
    } = body;

    // 1. Find or create patient
    // In a real app, we'd check by phone or CNIC. Here we'll just create a new one for simplicity.
    const mrn = `MRN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        full_name: fullName,
        phone,
        email,
        date_of_birth: dob,
        gender,
        mrn
      })
      .select()
      .single();

    if (patientError) {
      console.error('Patient creation error:', patientError);
      return NextResponse.json({ error: 'Failed to create patient record' }, { status: 500 });
    }

    // 2. Create appointment
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id: patient.id,
        doctor_id: doctorId || null,
        department_id: departmentId || null,
        appointment_date: date,
        appointment_time: time,
        chief_complaint: chiefComplaint,
        status: 'scheduled'
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Appointment creation error:', appointmentError);
      return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
    }

    // 3. Run AI Triage
    const triageAssessment = await runAITriage({
      chief_complaint: chiefComplaint,
      symptoms: symptoms
    });

    // 4. Save Triage Record
    const { error: triageError } = await supabaseAdmin
      .from('triage_records')
      .insert({
        patient_id: patient.id,
        appointment_id: appointment.id,
        chief_complaint: chiefComplaint,
        symptoms: symptoms,
        triage_level: triageAssessment.triage_level,
        triage_score: triageAssessment.triage_score,
        ai_assessment: triageAssessment.ai_assessment,
        recommended_department: triageAssessment.recommended_department,
        recommended_doctor_specialization: triageAssessment.recommended_doctor_specialization,
        red_flags: triageAssessment.red_flags,
        ai_questions_for_doctor: triageAssessment.ai_questions_for_doctor,
        estimated_wait_minutes: triageAssessment.estimated_wait_minutes,
        ai_instructions_for_patient: triageAssessment.ai_instructions_for_patient,
        raw_ai_response: triageAssessment as any
      });

    if (triageError) {
      console.error('Triage record error:', triageError);
      // We don't fail the whole request if triage fails to save, but it's not ideal
    }

    return NextResponse.json({ 
      success: true, 
      appointmentId: appointment.id,
      triage: triageAssessment 
    });

  } catch (error: any) {
    console.error('Intake API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
