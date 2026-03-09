import User from '../models/User';
import dbConnect from '../db';

export async function updateUserSettings(userId: string, updates: Partial<Record<string, number>>) {
    await dbConnect();

    // We update only the fields provided in the updates object by using dotted notation
    const setQuery: Record<string, number> = {};
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            setQuery[`settings.${key}`] = value;
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: setQuery },
        { new: true, runValidators: true }
    ).lean() as { settings?: Record<string, number> } | null;

    if (!user) {
        throw new Error('User not found');
    }

    return user.settings as Record<string, number>;
}
