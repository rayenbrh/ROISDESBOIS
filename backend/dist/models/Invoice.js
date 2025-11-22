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
exports.Invoice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const invoiceSchema = new mongoose_1.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    commercialId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    amountDue: {
        type: Number,
        required: true,
        min: 0
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false,
        index: true
    },
    dueDate: {
        type: Date
    },
    payments: [
        {
            date: { type: Date, required: true, default: Date.now },
            amount: { type: Number, required: true, min: 0 },
            method: { type: String, required: true },
            note: String,
            recordedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    pdfPath: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ isPaid: 1 });
invoiceSchema.index({ createdAt: -1 });
exports.Invoice = mongoose_1.default.model('Invoice', invoiceSchema);
//# sourceMappingURL=Invoice.js.map