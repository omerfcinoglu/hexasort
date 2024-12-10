export class TaskQueue {
    private tasks: (() => Promise<void>)[] = [];
    private isProcessing = false;

    public add(task: () => Promise<void>): void {
        this.tasks.push(task);
        if (!this.isProcessing) {
            this.processQueue(); // Kendi içinde çalıştırılır
        }
    }

    private async processQueue(): Promise<void> {
        this.isProcessing = true;
        while (this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (task) {
                try {
                    await task();
                } catch (error) {
                    console.error('Task failed:', error);
                }
            }
        }
        this.isProcessing = false;
    }

    public async start(): Promise<void> {
        if (!this.isProcessing) {
            await this.processQueue();
        }
    }
}
