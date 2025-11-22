import { Request, Response, NextFunction } from 'express';
/**
 * Get sales statistics
 * GET /api/admin/analytics/sales
 */
export declare const getSalesStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get sales over time (daily/weekly/monthly)
 * GET /api/admin/analytics/sales-over-time
 */
export declare const getSalesOverTime: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get top products by sales
 * GET /api/admin/analytics/top-products
 */
export declare const getTopProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get top clients by revenue
 * GET /api/admin/analytics/top-clients
 */
export declare const getTopClients: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get commercial performance
 * GET /api/admin/analytics/commercial-performance
 */
export declare const getCommercialPerformance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get low stock products
 * GET /api/admin/analytics/low-stock
 */
export declare const getLowStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get inventory statistics
 * GET /api/admin/analytics/inventory
 */
export declare const getInventoryStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get payment statistics
 * GET /api/admin/analytics/payments
 */
export declare const getPaymentStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get dashboard summary
 * GET /api/admin/analytics/dashboard
 */
export declare const getDashboardSummary: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map