import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates an address for display purposes
 * @param address - The full address
 * @param length - Number of characters to show on each side (default: 4)
 * @returns Truncated address like "0x1234...5678"
 */
export function truncateAddress(address: string, length: number = 4): string {
  if (!address) return '';
  if (address.length <= 2 + length * 2) return address;
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
}
