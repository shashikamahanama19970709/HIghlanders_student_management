import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';

// Helper to authenticate student and get user document
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = AuthService.extractTokenFromHeaders(authHeader || undefined);
  if (!token) return null;
  return await AuthService.getUserFromToken(token);
}

// GET /api/student/profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let profileImage = (user.profile as any)?.profileImage || '/images/default-avatar.png';
    if (profileImage && profileImage.startsWith('uploads/')) {
      try {
        const { BackblazeService } = await import('@/lib/backblaze');
        profileImage = await BackblazeService.getSignedUrl(profileImage);
      } catch (err) {
        console.error('Failed to get signed URL for profileImage:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.email,
        phone: user.profile?.phone || '',
        dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
        address: (user.profile as any)?.address || '',
        emergencyContact: (user.profile as any)?.emergencyContact || { name: '', phone: '', relationship: '' },
        medicalInfo: (user.profile as any)?.medicalInfo || '',
        profileImage,
        classIds: (user.profile as any)?.classIds || [],
        subscription: (user as any).subscription || null,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/student/profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, dateOfBirth, address, emergencyContact, medicalInfo, profileImage, classIds } = body;

    const db = await getDatabase();

    let finalProfileImage = profileImage;
    if (finalProfileImage && typeof finalProfileImage === 'string' && finalProfileImage.includes('uploads/')) {
      const parts = finalProfileImage.split('uploads/');
      finalProfileImage = 'uploads/' + parts[parts.length - 1].split('?')[0];
    }

    // Prepare profile update
    const updatedProfile = {
      ...user.profile,
      firstName: firstName || user.profile?.firstName,
      lastName: lastName || user.profile?.lastName,
      phone: phone || user.profile?.phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user.profile?.dateOfBirth,
      address: address !== undefined ? address : (user.profile as any)?.address,
      emergencyContact: emergencyContact || (user.profile as any)?.emergencyContact,
      medicalInfo: medicalInfo !== undefined ? medicalInfo : (user.profile as any)?.medicalInfo,
      profileImage: finalProfileImage || (user.profile as any)?.profileImage,
      classIds: classIds !== undefined ? classIds : (user.profile as any)?.classIds || [],
    };

    // Update user document
    await db.collection('users').updateOne(
      { email: user.email },
      { 
        $set: { 
          profile: updatedProfile,
          updatedAt: new Date()
        } 
      }
    );

    // Also keep memberRequests in sync (if there is a request matching by email)
    await db.collection('memberRequests').updateOne(
      { email: user.email },
      { 
        $set: { 
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phone: updatedProfile.phone,
          dateOfBirth: updatedProfile.dateOfBirth,
          emergencyContact: updatedProfile.emergencyContact,
          medicalInfo: updatedProfile.medicalInfo,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
