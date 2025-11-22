import Bull from 'bull';
interface CompositeJobData {
    productId: string;
    mapping: Record<string, string>;
}
declare let compositeQueue: Bull.Queue<CompositeJobData> | null;
/**
 * Add composite image generation job to queue
 */
export declare const queueCompositeGeneration: (productId: string, mapping: Record<string, string>) => Promise<Bull.Job<CompositeJobData> | null>;
/**
 * Get job status
 */
export declare const getJobStatus: (jobId: string) => Promise<any>;
export { compositeQueue };
export default compositeQueue;
//# sourceMappingURL=queueService.d.ts.map