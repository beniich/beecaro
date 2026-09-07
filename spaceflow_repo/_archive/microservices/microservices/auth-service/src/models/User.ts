import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name?: string;
    email: string;
    password?: string;
    role: 'admin' | 'dispatcher' | 'staff' | 'citizen' | 'technician';
    googleId?: string;
    avatar?: string;
    isEmailVerified?: boolean;
    authProvider?: 'local' | 'google';
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: {
            type: String,
            required: function (this: any) {
                return !this.googleId;
            }
        },
        role: {
            type: String,
            enum: ['admin', 'dispatcher', 'staff', 'citizen', 'technician'],
            default: 'staff'
        },
        googleId: { type: String, unique: true, sparse: true },
        avatar: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
    },
    { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidate: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
