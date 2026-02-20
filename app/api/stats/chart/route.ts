import { NextResponse } from 'next/server';
import { getDailySnapshots, getPools, getLatestStats } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  try {
    const [snapshots, pools, latest] = await Promise.all([
      getDailySnapshots(days),
      getPools(),
      getLatestStats()
    ]);

    return NextResponse.json({
      labels: snapshots.map(s => new Date(s.date).toLocaleDateString('zh-CN')),
      newStake: snapshots.map(s => s.newStake),
      newUnstake: snapshots.map(s => s.newUnstake),
      activeStake: snapshots.map(s => s.activeStake),
      cumulativeStake: latest.cumulativeStake,
      latestActiveStake: latest.activeStake,
      totalUsers: latest.totalUsers,
      unlockedNext1Day: latest.unlockedNext1Day,
      unlockedNext2Days: latest.unlockedNext2Days,
      unlockedNext7Days: latest.unlockedNext7Days,
      unlockedNext15Days: latest.unlockedNext15Days,
      unlockedNext30Days: latest.unlockedNext30Days,
      dataPoints: snapshots.length,
      pools: pools,
      details: snapshots.slice(-10).reverse().map(s => ({
        date: new Date(s.date).toLocaleDateString('zh-CN'),
        newStake: s.newStake,
        newUnstake: s.newUnstake,
        activeStake: s.activeStake,
      }))
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
