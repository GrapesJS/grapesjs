export class RateLimiter<T> {
  private threshold: number;
  private lastArgs: T | undefined;
  private timeout: NodeJS.Timeout | null = null;

  constructor(threshold: number) {
    this.threshold = threshold;
  }

  updateArgs(args: T) {
    this.lastArgs = args;
  }

  execute(callback: (args: T) => void) {
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        if (this.lastArgs) {
          callback(this.lastArgs);
        }
        this.timeout = null;
      }, this.threshold);
    }
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    delete this.lastArgs;
  }
}
