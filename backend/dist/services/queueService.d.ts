import Bull from 'bull';
interface CompositeJobData {
    productId: string;
    mapping: Record<string, string>;
}
export declare const compositeQueue: any;
/**
 * Add composite image generation job to queue
 */
export declare const queueCompositeGeneration: (productId: string, mapping: Record<string, string>) => Promise<Bull.Job<CompositeJobData>>;
/**
 * Get job status
 */
export declare const getJobStatus: (jobId: string) => Promise<any>;
export default compositeQueue;
//# sourceMappingURL=queueService.d.ts.map