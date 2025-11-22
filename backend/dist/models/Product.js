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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const productSchema = new mongoose_1.Schema({
    title: {
        ar: { type: String, required: true, trim: true }
    },
    description: {
        ar: { type: String, trim: true }
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    images: [
        {
            path: { type: String, required: true },
            thumbPath: { type: String, required: true },
            width: Number,
            height: Number,
            alt: {
                ar: String,
                en: String
            }
        }
    ],
    variants: [
        {
            color: {
                ar: { type: String, required: true }
            },
            sku: { type: String, required: true },
            image: String,
            stock: { type: Number, default: 0, min: 0 }
        }
    ],
    price: {
        retail: { type: Number, required: true, min: 0 },
        bulkPrices: [
            {
                minQty: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 }
            }
        ]
    },
    cost: {
        type: Number,
        min: 0
    },
    categories: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category'
        }
    ],
    isSpecial: {
        type: Boolean,
        default: false
    },
    specialConfig: {
        components: [
            {
                componentKey: { type: String, required: true },
                label: {
                    ar: { type: String, required: true }
                },
                subProductIds: [
                    {
                        type: mongoose_1.Schema.Types.ObjectId,
                        ref: 'SubProduct'
                    }
                ],
                required: { type: Boolean, default: true }
            }
        ],
        combinationImages: [
            {
                mapping: { type: mongoose_1.Schema.Types.Mixed, required: true },
                imagePath: { type: String, required: true }
            }
        ],
        compositeMode: {
            type: String,
            enum: Object.values(types_1.CompositeMode),
            default: types_1.CompositeMode.MANUAL
        }
    },
    stockPolicy: {
        type: String,
        enum: Object.values(types_1.StockPolicy),
        default: types_1.StockPolicy.BY_PRODUCT
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    meta: {
        title: {
            ar: String,
            en: String
        },
        description: {
            ar: String,
            en: String
        },
        keywords: {
            ar: String,
            en: String
        }
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ 'title.ar': 'text', 'description.ar': 'text' });
productSchema.index({ categories: 1 });
productSchema.index({ isSpecial: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ stock: 1 });
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map