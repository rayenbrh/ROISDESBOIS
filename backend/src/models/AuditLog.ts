import mongoose, { Schema } from 'mongoose';
import { IAuditLog, AuditAction } from '../types';

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    actionType: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: Schema.Types.ObjectId
    },
    details: {
      type: Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
