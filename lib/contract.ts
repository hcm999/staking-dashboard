import { ethers } from 'ethers';

// 合约ABI - 从环境变量获取
export const CONTRACT_ABI = JSON.parse(process.env.STAKING_CONTRACT_ABI || '[]');

// 合约地址
export const CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS!;

// RPC URL
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

// 锁仓天数映射
export const LOCK_DAYS_MAP: { [key: number]: number } = {
  0: 1,   // index 0 锁仓1天
  1: 15,  // index 1 锁仓15天
  2: 30   // index 2 锁仓30天
};

// 获取Provider
export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// 获取Contract实例
export function getContract(provider?: ethers.Provider) {
  const _provider = provider || getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _provider);
}
