import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Count total approved members (users with role 'student')
    const totalMembers = await db.collection('users').countDocuments({ role: 'student' });

    // Count active/visible classes
    const activeClasses = await db.collection('classes').countDocuments({ isVisible: true });

    // Count pending applications
    const pendingApplications = await db.collection('memberRequests').countDocuments({ status: 'pending' });

    // Calculate monthly revenue from payments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = await db.collection('payments').aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $in: ['completed', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

    // Get recent applications (last 5)
    const recentApplications = await db.collection('memberRequests')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get today's classes
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];
    
    // Fetch all visible classes and filter for today's schedule
    const allClasses = await db.collection('classes')
      .find({ isVisible: true })
      .toArray();

    const todaysClasses = allClasses.filter((cls: any) => {
      if (!cls.schedule) return false;
      // schedule can be a string like "Monday, Wednesday 4:00 PM - 5:30 PM"
      // or an object with days array
      if (typeof cls.schedule === 'string') {
        return cls.schedule.toLowerCase().includes(todayName.toLowerCase());
      }
      if (cls.schedule.days && Array.isArray(cls.schedule.days)) {
        return cls.schedule.days.some((d: string) => d.toLowerCase() === todayName.toLowerCase());
      }
      if (cls.schedule.day) {
        return cls.schedule.day.toLowerCase() === todayName.toLowerCase();
      }
      return false;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeClasses,
        pendingApplications,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentApplications: recentApplications.map((app: any) => ({
          id: app._id.toString(),
          firstName: app.firstName,
          lastName: app.lastName,
          email: app.email,
          selectedClass: app.selectedClass || app.className || 'General',
          status: app.status,
          createdAt: app.createdAt,
        })),
        todaysClasses: todaysClasses.map((cls: any) => ({
          id: cls._id.toString(),
          name: cls.name,
          schedule: cls.schedule,
          currentEnrollment: cls.currentEnrollment || 0,
          maxCapacity: cls.maxCapacity || 0,
          ageCategory: cls.ageCategory,
        })),
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
