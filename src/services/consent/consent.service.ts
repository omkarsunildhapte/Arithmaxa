import { Service, signal, computed } from '@angular/core';

export interface ConsentChoices {
  essential: boolean;
  functional: boolean;
  aiProcessing: boolean;
}

@Service()
export class ConsentService {
  private readonly KEY = 'arithmaxa_consent_v1';

  readonly hasConsented = signal<boolean>(false);
  readonly choices = signal<ConsentChoices>({ essential: true, functional: false, aiProcessing: false });
  readonly canUseAI = computed(() => this.choices().aiProcessing);

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentChoices;
        this.choices.set({ ...parsed, essential: true });
        this.hasConsented.set(true);
      }
    } catch {
      /* ignore parse errors */
    }
  }

  acceptAll(): void {
    this.save({ essential: true, functional: true, aiProcessing: true });
  }

  acceptEssentialOnly(): void {
    this.save({ essential: true, functional: false, aiProcessing: false });
  }

  save(choices: ConsentChoices): void {
    const safe: ConsentChoices = { ...choices, essential: true };
    localStorage.setItem(this.KEY, JSON.stringify(safe));
    this.choices.set(safe);
    this.hasConsented.set(true);
  }

  withdraw(): void {
    localStorage.removeItem(this.KEY);
    this.hasConsented.set(false);
    this.choices.set({ essential: true, functional: false, aiProcessing: false });
  }

  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('arithmaxa'));
    keys.forEach(k => localStorage.removeItem(k));
    this.withdraw();
  }
}
