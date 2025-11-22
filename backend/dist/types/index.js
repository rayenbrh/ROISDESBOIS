"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.OrderSource = exports.OrderStatus = exports.StockPolicy = exports.CompositeMode = exports.UserRole = void 0;
// ============================================================================
// USER TYPES
// ============================================================================
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["COMMERCIAL"] = "commercial";
    UserRole["STORE"] = "store";
    UserRole["CLIENT"] = "client";
    UserRole["CASHIER"] = "cashier";
})(UserRole || (exports.UserRole = UserRole = {}));
var CompositeMode;
(function (CompositeMode) {
    CompositeMode["AUTO"] = "auto";
    CompositeMode["MANUAL"] = "manual";
    CompositeMode["BOTH"] = "both";
})(CompositeMode || (exports.CompositeMode = CompositeMode = {}));
var StockPolicy;
(function (StockPolicy) {
    StockPolicy["BY_PRODUCT"] = "byProduct";
    StockPolicy["BY_VARIANT"] = "byVariant";
    StockPolicy["BY_COMPONENT"] = "byComponent";
})(StockPolicy || (exports.StockPolicy = StockPolicy = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "new";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["READY"] = "ready";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderSource;
(function (OrderSource) {
    OrderSource["CATALOG"] = "catalog";
    OrderSource["POS"] = "pos";
    OrderSource["ADMIN"] = "admin";
})(OrderSource || (exports.OrderSource = OrderSource = {}));
// ============================================================================
// AUDIT LOG TYPES
// ============================================================================
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "create";
    AuditAction["UPDATE"] = "update";
    AuditAction["DELETE"] = "delete";
    AuditAction["LOGIN"] = "login";
    AuditAction["LOGOUT"] = "logout";
    AuditAction["STATUS_CHANGE"] = "status_change";
    AuditAction["PAYMENT"] = "payment";
    AuditAction["STOCK_ADJUSTMENT"] = "stock_adjustment";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=index.js.map