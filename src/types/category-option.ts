import { FeedbackCategory } from './feedback';

/** One entry in FeedbackModal's category picker grid. */
export interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  emoji: string;
}
