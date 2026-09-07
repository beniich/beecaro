import mongoose, { Schema, Document } from 'mongoose';

export enum RequisitionStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IN_PREPARATION = 'in_preparation',
    READY = 'ready',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export interface IRequisition extends Document {
    requesterId: mongoose.Types.ObjectId;
    complaintId?: mongoose.Types.ObjectId;
    items: Array<{
        description: string;
        quantity: number;
        justification?: string;
    }>;
    status: RequisitionStatus;
    notes?: string;
    history: Array<{
        status: RequisitionStatus;
        action: string;
        userId: mongoose.Types.ObjectId;
        comment?: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const RequisitionSchema: Schema = new Schema(
    {
        requesterId: { type: Schema.Types.ObjectId, required: true }, // Decoupled
        complaintId: { type: Schema.Types.ObjectId },
        items: [
            {
                description: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                justification: { type: String }
            }
        ],
        status: {
            type: String,
            enum: Object.values(RequisitionStatus),
            default: RequisitionStatus.DRAFT
        },
        notes: { type: String },
        history: [
            {
                status: { type: String, required: true },
                action: { type: String, required: true },
                userId: { type: Schema.Types.ObjectId, required: true },
                comment: { type: String },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

export const Requisition = mongoose.model<IRequisition>('Requisition', RequisitionSchema);
