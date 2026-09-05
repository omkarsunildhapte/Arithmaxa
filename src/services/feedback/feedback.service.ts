import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';
import { FeedbackCategory, FeedbackResponse } from '@appTypes/index';
import { FEEDBACK_URL } from '@constants/index';
import { AnalyticsService } from '@services/analytics/analytics.service';

@Service()
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly analytics = inject(AnalyticsService);

  /**
   * Emails the feedback to the Arithmaxa team via arithmaxa-website's
   * /api/feedback relay — a Cloudflare Worker route that sends through
   * Resend (worker/routes/feedback.ts in that repo), not the Vercel/Gmail
   * function this originally pointed at. Resolves to whether the send
   * actually succeeded, so the caller can show real success/error state
   * instead of assuming it worked.
   */
  async submit(rating: number, category: FeedbackCategory, message: string): Promise<boolean> {
    const trimmed = message.trim().slice(0, 600);
    const res = await firstValueFrom(
      this.http.post<FeedbackResponse>(FEEDBACK_URL, { rating, category, message: trimmed }).pipe(catchError(() => of<FeedbackResponse>({ ok: false, error: 'Network error' }))),
    );
    if (res.ok) this.analytics.logEvent('feedback_submitted', { category, rating });
    return res.ok;
  }
}
