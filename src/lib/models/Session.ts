import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true },
    mode: { type: String, required: true, enum: ['focus', 'shortBreak', 'longBreak'] },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
