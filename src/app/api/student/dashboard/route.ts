import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';

// Helper to authenticate student
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = AuthService.extractTokenFromHeaders(authHeader || undefined);
  if (!token) return null;
  return await AuthService.getUserFromToken(token);
}

const RANK_FLOW = [
  'White Belt',
  'Yellow Belt',
  'Green Belt',
  'Blue Belt',
  'Red Belt',
  'Black Belt'
];

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();

    // 1. Fetch user's subscription details
    const activeSub = (user as any).subscription || null;

    // 2. Determine belt rank values
    const currentRank = (user.profile as any)?.rank || 'Yellow Belt';
    const rankIndex = RANK_FLOW.indexOf(currentRank);
    const nextRank = rankIndex !== -1 && rankIndex < RANK_FLOW.length - 1 
      ? RANK_FLOW[rankIndex + 1] 
      : 'Black Belt';

    // 3. Fetch training classes for the schedules widget
    const dbClasses = await db.collection('classes').find({ isVisible: true }).limit(5).toArray();

    // Mapping db classes to dashboard schedule format
    const upcomingClasses = dbClasses.map(cls => ({
      id: cls._id.toString(),
      name: cls.name,
      days: cls.schedule?.days || [],
      time: `${cls.schedule?.startTime || ''} - ${cls.schedule?.endTime || ''}`,
      instructor: 'Master Highland',
      category: cls.ageCategory || 'All Ages'
    }));

    const studentName = user.profile ? `${(user.profile as any).firstName} ${(user.profile as any).lastName}`.trim() : 'Student';

    // 4. Compile stats response
    const dashboardStats = {
      membershipStatus: activeSub ? activeSub.status : 'inactive',
      nextPayment: activeSub && activeSub.nextPaymentDate ? new Date(activeSub.nextPaymentDate).toISOString().split('T')[0] : 'N/A',
      planName: activeSub ? activeSub.planName : 'No Active Plan',
      attendedClasses: (user.profile as any)?.attendedClasses || 24,
      totalClasses: (user.profile as any)?.totalClasses || 30,
      currentRank,
      nextRank,
      monthlyFee: activeSub ? activeSub.price : 0,
      studentName,
      upcomingClasses
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
