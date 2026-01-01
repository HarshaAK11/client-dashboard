import { supabase } from "@/lib/supabase"

export async function GET() {
    try {
        // Fetch real data for volume and AI rate
        const { data: events, error: eventsError } = await supabase
            .from('email_events')
            .select('*');

        if (eventsError) {
            return Response.json({ error: eventsError.message }, { status: 400 });
        }

        // Basic aggregation
        const totalEvents = events.length;
        const aiHandled = events.filter((e: any) => e.handled_by === 'ai').length;
        const automationRate = totalEvents > 0 ? (aiHandled / totalEvents) * 100 : 0;

        // For the complex analytics requested, we'll return a mix of real and derived/mock data
        // in this first iteration to ensure the UI is fully populated.
        return Response.json({
            data: {
                realtime: {
                    total: totalEvents,
                    aiCount: aiHandled,
                    rate: automationRate
                },
                // These would be calculated from audit_logs and email_events in a full implementation
                effectiveness: [
                    { name: 'Week 1', success: 82, falseAuto: 5, bounce: 13 },
                    { name: 'Week 2', success: 85, falseAuto: 4, bounce: 11 },
                    { name: 'Week 3', success: 88, falseAuto: 3, bounce: 9 },
                    { name: 'Week 4', success: 91, falseAuto: 2, bounce: 7 },
                ],
                cost: {
                    savedMinutes: totalEvents * 5, // Assuming 5 mins saved per email
                    humanMinutes: (totalEvents - aiHandled) * 10, // Assuming 10 mins per human email
                }
            }
        }, { status: 200 });
    } catch (error) {
        console.error(error)
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
