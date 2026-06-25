import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional + conflicting Tailwind classes (shadcn convention). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
