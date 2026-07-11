import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BackblazeService } from '@/lib/backblaze';

const DEFAULT_SETTINGS = {
  clubName: 'Highlanders Amateur Taekwondo CIC',
  vision: 'To be the leading Taekwondo community in Scotland',
  mission: 'To provide high-quality Taekwondo instruction in a safe, inclusive environment',
  description: 'Professional Taekwondo training and community development',
  masters: [],
  contactInfo: {
    address: '123 Highland Avenue, Edinburgh, EH1 2YZ, Scotland',
    phone: '+44 131 234 5678',
    email: 'info@highlanderstaekwondo.club',
  },
  socialMedia: [
    { platform: 'Facebook', icon: 'facebook', url: 'https://facebook.com/highlanderstkd', isEnabled: true },
    { platform: 'Instagram', icon: 'instagram', url: 'https://instagram.com/highlanderstkd', isEnabled: true },
    { platform: 'Twitter', icon: 'twitter', url: 'https://twitter.com/highlanderstkd', isEnabled: true },
    { platform: 'YouTube', icon: 'youtube', url: 'https://youtube.com/highlanderstkd', isEnabled: true },
  ],
  operatingHours: {
    monday: '16:00 - 21:30',
    tuesday: '16:00 - 21:30',
    wednesday: '16:00 - 21:30',
    thursday: '16:00 - 21:30',
    friday: '16:00 - 21:30',
    saturday: '09:00 - 14:00',
    sunday: 'Closed',
  },
  membershipFees: {
    monthly: 45,
    quarterly: 125,
    yearly: 450,
  },
  history: 'Founded in 2015, Highlanders Amateur Taekwondo CIC has grown from a small class of 10 students to a thriving community of over 150 members. Our commitment to excellence and community development has earned us recognition as one of the premier Taekwondo schools in Scotland. We continue to grow while maintaining the personal touch and family atmosphere that makes us special.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// GET /api/settings - Fetch global website settings
export async function GET() {
  try {
    const db = await getDatabase();
    let settings = await db.collection('settings').findOne({});

    if (!settings) {
      console.log('[Settings API] No settings document found. Initializing with defaults...');
      const insertResult = await db.collection('settings').insertOne({ ...DEFAULT_SETTINGS });
      settings = await db.collection('settings').findOne({ _id: insertResult.insertedId });
    }

    if (settings) {
      // Sign hero video URL if it exists
      if (settings.heroVideo?.fileKey) {
        try {
          const signedUrl = await BackblazeService.getSignedUrl(settings.heroVideo.fileKey, 86400); // 24 hours
          settings.heroVideo.url = signedUrl;
        } catch (error) {
          console.error('Error signing heroVideo URL:', error);
        }
      }

      // Sign logo URL if it exists
      if (settings.logo?.fileKey) {
        try {
          const signedUrl = await BackblazeService.getSignedUrl(settings.logo.fileKey, 86400); // 24 hours
          settings.logo.url = signedUrl;
        } catch (error) {
          console.error('Error signing logo URL:', error);
        }
      }

      // Format _id as string
      (settings as any)._id = settings._id.toString();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update global settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    // We update the first available settings document or insert if none exists
    const settingsDoc = await db.collection('settings').findOne({});

    const updateFields = {
      clubName: body.clubName,
      vision: body.vision,
      mission: body.mission,
      description: body.description,
      logo: body.logo,
      heroVideo: body.heroVideo,
      contactInfo: body.contactInfo,
      socialMedia: body.socialMedia,
      operatingHours: body.operatingHours,
      membershipFees: body.membershipFees,
      history: body.history,
      updatedAt: new Date(),
    };

    if (settingsDoc) {
      await db.collection('settings').updateOne(
        { _id: settingsDoc._id },
        { $set: updateFields }
      );
    } else {
      await db.collection('settings').insertOne({
        ...DEFAULT_SETTINGS,
        ...updateFields,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
