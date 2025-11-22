import { Request, Response, NextFunction } from 'express';
/**
 * Get all orders with pagination and filtering
 * GET /api/admin/orders
 */
export declare const getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get order by ID
 * GET /api/admin/orders/:id
 */
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create new order
 * POST /api/admin/orders
 */
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update order
 * PUT /api/admin/orders/:id
 */
export declare const updateOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Change order status
 * PUT /api/admin/orders/:id/status
 */
export declare const changeOrderStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Assign commercial to order
 * PUT /api/admin/orders/:id/assign-commercial
 */
export declare const assignCommercial: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Generate production sheet for order
 * POST /api/admin/orders/:id/production-sheet
 */
export declare const generateOrderProductionSheet: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete order
 * DELETE /api/admin/orders/:id
 */
export declare const deleteOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get order statistics
 * GET /api/admin/orders/stats
 */
export declare const getOrderStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map