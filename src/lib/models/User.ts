import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    settings: {
        workDuration: { type: Number, default: 25 },
        shortBreakDuration: { type: Number, default: 5 },
        longBreakDuration: { type: Number, default: 15 },
        dailyFocusThreshold: { type: Number, default: 100 },
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
