import { _decorator } from 'cc';

export class TaskQueue {
    private tasks: (() => Promise<void>)[] = [];
    private isProcessing = false;

    public async add(task: () => Promise<void>): Promise<void> {
        this.tasks.push(task);
        if (!this.isProcessing) {
            await this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        this.isProcessing = true;
        while (this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (task) {
                await task();
            }
        }
        this.isProcessing = false;
    }

    public async processParallel(): Promise<void> {
        this.isProcessing = true;
        await Promise.all(this.tasks);
        this.tasks = [];
        this.isProcessing = false;
    }
}
