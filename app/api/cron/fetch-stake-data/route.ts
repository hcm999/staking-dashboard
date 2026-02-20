import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
    
    // 先检查表是否存在
    await sql`
      CREATE TABLE IF NOT EXISTS stake_pools (
        id INTEGER PRIMARY KEY,
        lock_days INTEGER NOT NULL,
        rate_per_sec DECIMAL(30, 18) NOT NULL,
        min_stake DECIMAL(20, 2) NOT NULL,
        max_stake DECIMAL(20, 2) NOT NULL,
        total_staked DECIMAL(30, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS stake_records (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        stake_index INTEGER NOT NULL,
        amount DECIMAL(30, 2) NOT NULL,
        stake_time BIGINT NOT NULL,
        unlock_time BIGINT NOT NULL,
        lock_days INTEGER NOT NULL,
        status VARCHAR(10) DEFAULT 'active',
        tx_hash VARCHAR(66) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS daily_stake_snapshots (
        date DATE PRIMARY KEY,
        new_stake DECIMAL(20, 2) NOT NULL DEFAULT 0,
        new_unstake DECIMAL(20, 2) NOT NULL DEFAULT 0,
        active_stake DECIMAL(20, 2) NOT NULL DEFAULT 0,
        cumulative_stake DECIMAL(30, 2) NOT NULL DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        unlocked_next_1day DECIMAL(20, 2) DEFAULT 0,
        unlocked_next_2days DECIMAL(20, 2) DEFAULT 0,
        unlocked_next_7days DECIMAL(20, 2) DEFAULT 0,
        unlocked_next_15days DECIMAL(20, 2) DEFAULT 0,
        unlocked_next_30days DECIMAL(20, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 初始化质押池数据
    await sql`
      INSERT INTO stake_pools (id, lock_days, rate_per_sec, min_stake, max_stake)
      VALUES 
        (0, 1, 0.000000000000000001, 100, 1000000),
        (1, 15, 0.000000000000000002, 100, 1000000),
        (2, 30, 0.000000000000000003, 100, 1000000)
      ON CONFLICT (id) DO NOTHING
    `;

    // 生成一些模拟数据（为了能显示）
    const mockNewStake = Math.random() * 100000;
    const mockUnstake = Math.random() * 50000;
    const mockActiveStake = 5647941 + (Math.random() * 100000);
    const mockCumulativeStake = 11903931 + (Math.random() * 100000);

    // 保存今日快照
    await sql`
      INSERT INTO daily_stake_snapshots (
        date, new_stake, new_unstake, active_stake, cumulative_stake, total_users,
        unlocked_next_1day, unlocked_next_2days, unlocked_next_7days, 
        unlocked_next_15days, unlocked_next_30days
      ) VALUES (
        ${today},
        ${mockNewStake},
        ${mockUnstake},
        ${mockActiveStake},
        ${mockCumulativeStake},
        156,
        1291225,
        1864640,
        3401889,
        4500000,
        6800000
      )
      ON CONFLICT (date) 
      DO UPDATE SET
        new_stake = EXCLUDED.new_stake,
        new_unstake = EXCLUDED.new_unstake,
        active_stake = EXCLUDED.active_stake,
        cumulative_stake = EXCLUDED.cumulative_stake,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ 
      success: true, 
      message: '数据初始化成功',
      data: {
        today,
        newStake: mockNewStake,
        unstake: mockUnstake,
        activeStake: mockActiveStake
      }
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
