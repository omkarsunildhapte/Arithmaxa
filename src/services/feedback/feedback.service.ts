import { Service } from '@angular/core';

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'design' | 'performance';

export interface FeedbackEntry {
  id: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
  timestamp: string;
}

@Service()
export class FeedbackService {
  private readonly KEY = 'arithmaxa_feedback_v1';

  submit(rating: number, category: FeedbackCategory, message: string): void {
    const entry: FeedbackEntry = {
      id: `fb_${Date.now()}`,
      rating,
      category,
      message: message.trim().slice(0, 600),
      timestamp: new Date().toISOString(),
    };
    const all = this.getAll();
    all.push(entry);
    localStorage.setItem(this.KEY, JSON.stringify(all.slice(-20)));
  }

  getAll(): FeedbackEntry[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) ?? '[]') as FeedbackEntry[];
    } catch {
      return [];
    }
  }
}
