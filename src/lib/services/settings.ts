import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function updateUserSettings(userId: string, updates: Record<string, number>) {
    await dbConnect();

    // Transform keys for embedded update, e.g., 'workDuration' -> 'settings.workDuration'
    const setQuery: Record<string, number> = {};
    for (const [key, value] of Object.entries(updates)) {
        setQuery[`settings.${key}`] = value;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: setQuery },
        { new: true, runValidators: true } // Return updated document
    ).lean() as { _id: { toString(): string }; email: string; name?: string; settings?: any } | null;

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        settings: updatedUser.settings,
    };
}
