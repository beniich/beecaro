import mongoose, { Schema, Document } from 'mongoose';

export type TeamStatus = 'disponible' | 'intervention' | 'repos';

export interface ITeam extends Document {
    name: string;
    color: string;
    status: TeamStatus;
    location?: {
        lat: number;
        lng: number;
    };
    baseLocation?: {
        latitude: number;
        longitude: number;
    };
    specialization?: string;
    isActive: boolean;
    members: mongoose.Types.ObjectId[];
    leaderId?: mongoose.Types.ObjectId;
}

const TeamSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        color: { type: String, default: '#3b82f6' },
        status: {
            type: String,
            enum: ['disponible', 'intervention', 'repos'],
            default: 'disponible'
        },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
        baseLocation: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        specialization: { type: String },
        isActive: { type: Boolean, default: true },
        members: [{ type: Schema.Types.ObjectId }], // IDs only, no ref constraint to User service DB
        leaderId: { type: Schema.Types.ObjectId }
    },
    { timestamps: true }
);

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
