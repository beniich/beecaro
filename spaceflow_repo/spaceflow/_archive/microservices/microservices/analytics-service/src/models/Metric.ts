import mongoose, { Schema, Document } from 'mongoose';

export interface IMetric extends Document {
    key: string; // e.g., 'complaints_total', 'complaints_by_status_new'
    value: number;
    metadata?: any; // e.g., { category: 'voirie' }
    lastUpdated: Date;
}

const MetricSchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: Number, default: 0 },
        metadata: { type: Schema.Types.Mixed },
        lastUpdated: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const Metric = mongoose.model<IMetric>('Metric', MetricSchema);
