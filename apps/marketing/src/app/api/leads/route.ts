import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  plan: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadData = await request.json();
    
    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log lead data (in production, this would be stored in database)
    console.log('New lead received:', {
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
      phone: leadData.phone,
      plan: leadData.plan,
      message: leadData.message,
      timestamp: new Date().toISOString(),
      source: 'website'
    });

    // In production, you would:
    // 1. Store in database
    // 2. Send to CRM (Salesforce, HubSpot, etc.)
    // 3. Send notification email
    // 4. Create support ticket

    // For now, just return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead received successfully',
        leadId: `lead_${Date.now()}`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
