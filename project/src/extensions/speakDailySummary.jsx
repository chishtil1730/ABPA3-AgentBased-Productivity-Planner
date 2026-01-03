import { speakWithPiper } from "../voice-assistant/piperTTS";
import { getKanbanTaskSummary } from "../kanban_components/CustomKanban";
import { getUpcomingTaskSummary } from "../calender-components/UpcomingPanel";

export async function speakDailySummary() {
    const { doing, todo } = getKanbanTaskSummary();
    const upcoming = getUpcomingTaskSummary();

    const inProgressText = doing
        ? `You have a task called ${doing} that is currently going on`
        : `You currently have no tasks in progress`;

    const upcomingText = upcoming
        ? `an upcoming task ${upcoming.title} at ${upcoming.time}`
        : `no upcoming scheduled tasks`;

    const todoText = todo
        ? `and ${todo} to-do today`
        : `and no tasks in your to-do list today`;

    const finalText = `
I hope you are having a great-day.
Here is the summary of the tasks you have today.
${inProgressText},
${upcomingText},
${todoText}.
Hope you finish all your goals today.
    `.trim();

    await speakWithPiper(finalText);
}
