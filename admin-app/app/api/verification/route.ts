import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    
    // Extract form values
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const alternatePhone = formData.get('alternatePhone') as string;
    const idType = formData.get('idType') as string;
    const idNumber = formData.get('idNumber') as string;
    const hostelProofType = formData.get('hostelProofType') as string;
    const termsAccepted = formData.get('termsAccepted') === 'true';
    
    // Get files
    const idFiles = formData.getAll('idDocuments') as File[];
    const hostelProofFiles = formData.getAll('hostelProofDocuments') as File[];
    
    // Validate data (should match frontend validation)
    if (!firstName || !lastName || !mobileNumber || !idType || !idNumber || !hostelProofType || !termsAccepted) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare data for NestJS
    const verificationData = {
      firstName,
      lastName,
      mobileNumber,
      alternatePhone,
      idType,
      idNumber,
      hostelProofType,
      termsAccepted,
      documents: {
        idFiles: idFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        hostelProofFiles: hostelProofFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      }
    };
    
    // Send to NestJS backend
    const nestResponse = await fetch(`${process.env.NEST_API_URL}/admin/verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationData)
    });
    
    if (!nestResponse.ok) {
      throw new Error('NestJS API request failed');
    }
    
    return NextResponse.json(
      { success: true, message: 'Verification request submitted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}