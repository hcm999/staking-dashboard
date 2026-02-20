import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 验证cron请求
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const authParam = url.searchParams.get('auth');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && authParam !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 返回模拟数据，不操作数据库
    const mockData = {
      today: today,
      newStake: 15234.56,
      unstake: 5678.90,
      netNewStake: 9555.66,
      activeStake: 5647941.00,
      cumulativeStake: 11903931.64,
      totalUsers: 156,
      unlockedNext1Day: 1291225.00,
      unlockedNext2Days: 1864640.00,
      unlockedNext7Days: 3401889.00,
      unlockedNext15Days: 4500000.00,
      unlockedNext30Days: 6800000.00
    };

    return NextResponse.json({ 
      success: true, 
      message: '数据获取成功（模拟数据）',
      data: mockData
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
