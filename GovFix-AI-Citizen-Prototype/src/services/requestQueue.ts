export interface QueueSnapshot {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  capacity: number;
}

interface QueueTask<T> {
  sequence: number;
  priority: number;
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Fair, bounded client-side gateway queue. It prevents several portal requests
 * from competing for the same browser connection and provides one place to add
 * retry/load-balancing policy when more gateway nodes are available.
 */
class GatewayRequestQueue {
  private readonly capacity = 3;
  private active = 0;
  private sequence = 0;
  private completed = 0;
  private failed = 0;
  private waiting: QueueTask<unknown>[] = [];
  private listeners = new Set<(snapshot: QueueSnapshot) => void>();

  enqueue<T>(run: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.waiting.push({
        sequence: this.sequence++,
        priority,
        run,
        resolve,
        reject,
      });
      this.waiting.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
      this.publish();
      this.drain();
    });
  }

  subscribe(listener: (snapshot: QueueSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): QueueSnapshot {
    return {
      active: this.active,
      waiting: this.waiting.length,
      completed: this.completed,
      failed: this.failed,
      capacity: this.capacity,
    };
  }

  private drain() {
    while (this.active < this.capacity && this.waiting.length > 0) {
      const task = this.waiting.shift();
      if (!task) return;

      this.active += 1;
      this.publish();
      void task
        .run()
        .then((value) => {
          this.completed += 1;
          task.resolve(value);
        })
        .catch((error: unknown) => {
          this.failed += 1;
          task.reject(error);
        })
        .finally(() => {
          this.active -= 1;
          this.publish();
          this.drain();
        });
    }
  }

  private publish() {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const gatewayRequestQueue = new GatewayRequestQueue();
