import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Class } from '@/types';
import { ObjectId } from 'mongodb';

// GET /api/classes - Get all classes
export async function GET() {
  try {
    const db = await getDatabase();
    const classes = await db.collection('classes').find({ isVisible: true }).toArray();
    
    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class (admin only)
export async function POST(request: NextRequest) {
  try {
    const classData: Omit<Class, '_id' | 'createdAt' | 'updatedAt'> = await request.json();
    
    // Validate required fields
    if (!classData.name || !classData.schedule || !classData.ageCategory) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newClass = {
      ...classData,
      currentEnrollment: 0,
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('classes').insertOne(newClass);
    
    return NextResponse.json({
      success: true,
      data: { ...newClass, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create class' },
      { status: 500 }
    );
  }
}

// PUT /api/classes - Update an existing class (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, name, schedule, ageCategory, description, isVisible, maxCapacity, currentEnrollment, showOnWeb } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const queryId = ObjectId.isValid(_id) ? new ObjectId(_id) : _id;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (ageCategory !== undefined) updateData.ageCategory = ageCategory;
    if (description !== undefined) updateData.description = description;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
    if (currentEnrollment !== undefined) updateData.currentEnrollment = currentEnrollment;
    if (showOnWeb !== undefined) updateData.showOnWeb = showOnWeb;

    const result = await db.collection('classes').updateOne(
      { _id: queryId as any },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    const updatedClass = await db.collection('classes').findOne({ _id: queryId as any });

    return NextResponse.json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes - Delete a class (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const queryId = ObjectId.isValid(_id) ? new ObjectId(_id) : _id;

    const result = await db.collection('classes').deleteOne({ _id: queryId as any });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
