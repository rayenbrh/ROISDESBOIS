"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    commercialId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    source: {
        type: String,
        enum: Object.values(types_1.OrderSource),
        default: types_1.OrderSource.ADMIN
    },
    lines: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productTitle: {
                ar: { type: String, required: true }
            },
            variantId: String,
            componentSelections: {
                type: mongoose_1.Schema.Types.Mixed // { componentKey: subProductId }
            },
            unitPrice: { type: Number, required: true, min: 0 },
            qty: { type: Number, required: true, min: 1 },
            lineTotal: { type: Number, required: true, min: 0 },
            costPerUnit: { type: Number, min: 0 }
        }
    ],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    remise: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    costTotal: {
        type: Number,
        min: 0
    },
    netIncome: {
        type: Number
    },
    status: {
        type: String,
        enum: Object.values(types_1.OrderStatus),
        default: types_1.OrderStatus.NEW,
        index: true
    },
    invoiceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    shippingDate: {
        type: Date
    },
    productionSheetPath: {
        type: String
    },
    notes: {
        type: String
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: Object.values(types_1.OrderStatus),
                required: true
            },
            changedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            changedAt: {
                type: Date,
                default: Date.now
            },
            note: String
        }
    ]
}, {
    timestamps: true
});
// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ clientId: 1 });
orderSchema.index({ commercialId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ source: 1 });
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map