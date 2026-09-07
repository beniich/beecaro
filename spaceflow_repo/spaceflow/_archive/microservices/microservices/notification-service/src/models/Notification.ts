import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: string;
    type: 'EMAIL' | 'SMS' | 'PUSH';
    subject: string;
    content: string;
    status: 'SENT' | 'FAILED';
    relatedEntityId?: string; // e.g. complaintId
    relatedEntityType?: string;
    timestamp: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        recipient: { type: String, required: true },
        type: { type: String, enum: ['EMAIL', 'SMS', 'PUSH'], default: 'EMAIL' },
        subject: { type: String, required: true },
        content: { type: String, required: true },
        status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
        relatedEntityId: { type: String },
        relatedEntityType: { type: String },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
