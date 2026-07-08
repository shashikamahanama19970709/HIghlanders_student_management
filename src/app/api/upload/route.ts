import { NextRequest, NextResponse } from 'next/server';
import { BackblazeService } from '@/lib/backblaze';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Backblaze
    const uploadResult = await BackblazeService.uploadFile(
      buffer,
      file.name,
      file.type
    );

    // Generate signed URL for immediate frontend preview
    try {
      const signedUrl = await BackblazeService.getSignedUrl(uploadResult.fileKey);
      uploadResult.url = signedUrl;
    } catch (urlError) {
      console.warn('Failed to generate preview signed URL:', urlError);
    }

    return NextResponse.json({
      success: true,
      data: uploadResult,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Get signed URL for a file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('fileKey');
    
    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: 'File key is required' },
        { status: 400 }
      );
    }

    const signedUrl = await BackblazeService.getSignedUrl(fileKey);
    
    return NextResponse.json({
      success: true,
      data: { url: signedUrl },
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
