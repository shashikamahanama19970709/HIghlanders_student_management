import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDatabase } from '@/lib/mongodb';
import { Master } from '@/types';
import { ObjectId } from 'mongodb';
import { BackblazeService } from '@/lib/backblaze';

// GET /api/masters - Fetch all masters
export async function GET() {
  try {
    const db = await getDatabase();
    const masters = await db.collection('masters').find({}).toArray();
    
    // Generate fresh signed URLs for B2 image keys
    const processedMasters = await Promise.all(
      masters.map(async (master) => {
        if (master.image && master.image.fileKey) {
          try {
            const signedUrl = await BackblazeService.getSignedUrl(master.image.fileKey);
            return {
              ...master,
              image: {
                ...master.image,
                url: signedUrl
              }
            };
          } catch (urlError) {
            console.error(`Failed to sign URL for master image key ${master.image.fileKey}:`, urlError);
            return master; // Return original master as fallback
          }
        }
        return master;
      })
    );

    return NextResponse.json({
      success: true,
      data: processedMasters,
    });
  } catch (error) {
    console.error('Error fetching masters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch masters' },
      { status: 500 }
    );
  }
}

// POST /api/masters - Create a new master
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, bio, rank, certifications, image, showOnWeb } = body;

    // Validation
    if (!name || !title || !bio) {
      return NextResponse.json(
        { success: false, error: 'Name, title, and bio are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const master: Omit<Master, '_id' | 'createdAt' | 'updatedAt'> = {
      name,
      title,
      bio,
      rank: rank || '',
      certifications: certifications || [],
      image: image || undefined,
      showOnWeb: showOnWeb || false,
    };

    const result = await db.collection('masters').insertOne({
      ...master,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdMaster = await db.collection('masters').findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      data: createdMaster,
    });
  } catch (error) {
    console.error('Error creating master:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create master' },
      { status: 500 }
    );
  }
}

// PUT /api/masters - Update a master
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, name, title, bio, rank, certifications, image, showOnWeb } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Master ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (title) updateData.title = title;
    if (bio) updateData.bio = bio;
    if (rank !== undefined) updateData.rank = rank;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (image !== undefined) updateData.image = image;
    if (showOnWeb !== undefined) updateData.showOnWeb = showOnWeb;

    const result = await db.collection('masters').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Master not found' },
        { status: 404 }
      );
    }

    const updatedMaster = await db.collection('masters').findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      data: updatedMaster,
    });
  } catch (error) {
    console.error('Error updating master:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update master' },
      { status: 500 }
    );
  }
}

// DELETE /api/masters - Delete a master
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Master ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const result = await db.collection('masters').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Master not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Master deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting master:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete master' },
      { status: 500 }
    );
  }
}
