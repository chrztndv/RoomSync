import { GoogleGenAI, Type } from "@google/genai";
import { Room, ScheduleItem } from '../types';

let ai: GoogleGenAI | null = null;

try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (e) {
    console.error("Failed to initialize Gemini Client", e);
}

export const askRoomSyncAI = async (
    question: string, 
    rooms: Room[], 
    schedule: ScheduleItem[]
): Promise<string> => {
    if (!ai) return "AI Assistant is not configured (Missing API Key).";

    const contextData = {
        rooms: rooms.map(r => ({ id: r.id, name: r.name, capacity: r.capacity, building: r.building })),
        schedule: schedule.map(s => ({
            subject: s.subject,
            teacher: s.teacher,
            room: rooms.find(r => r.id === s.roomId)?.name || s.roomId,
            day: s.dayOfWeek,
            time: `${s.startTime}-${s.endTime}`
        }))
    };

    const systemPrompt = `
    You are RoomSync AI, a helpful assistant for a university classroom scheduling app.
    
    Here is the current database of rooms and schedules in JSON format:
    ${JSON.stringify(contextData)}

    Rules:
    1. Answer users' questions about where a class is, if a room is free, or who teaches a subject.
    2. If a user asks to book a room, politely inform them that you cannot perform actions, only the Admin can via the dashboard.
    3. Be concise and friendly.
    4. If the data doesn't contain the answer, say you don't know based on the current schedule.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: question,
            config: {
                systemInstruction: systemPrompt,
                thinkingConfig: { thinkingBudget: 0 } // Low latency preferred for chat
            }
        });
        return response.text || "I couldn't process that request.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I'm having trouble connecting to the smart assistant right now.";
    }
};