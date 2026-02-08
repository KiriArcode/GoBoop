/**
 * Generate a Google Calendar "Add Event" URL
 * No OAuth needed — opens Google Calendar in browser/app
 */
export function googleCalendarUrl(event: {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:MM
  location?: string | null;
  description?: string | null;
  durationMinutes?: number;
}): string {
  const { title, date, time, location, description, durationMinutes = 60 } = event;

  // Format: YYYYMMDD or YYYYMMDDTHHmmSS
  const dateClean = date.replace(/-/g, "");

  let startDate: string;
  let endDate: string;

  if (time) {
    // Normalize time: "15:00:00" → "15:00", "15:00" → "15:00"
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    startDate = `${dateClean}T${hh}${mm}00`;
    // Calculate end time
    const endMinutes = hours * 60 + minutes + durationMinutes;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
    const endM = (endMinutes % 60).toString().padStart(2, "0");
    endDate = `${dateClean}T${endH}${endM}00`;
  } else {
    // All-day event
    startDate = dateClean;
    // Next day for end
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    endDate = d.toISOString().split("T")[0].replace(/-/g, "");
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startDate}/${endDate}`,
  });

  if (location) params.set("location", location);
  if (description) params.set("details", description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an .ics file content for universal calendar support
 */
export function generateICS(event: {
  title: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description?: string | null;
}): string {
  const { title, date, time, location, description } = event;
  const dateClean = date.replace(/-/g, "");
  const dtStart = time
    ? (() => {
        const parts = time.split(":");
        return `${dateClean}T${parts[0].padStart(2, "0")}${parts[1].padStart(2, "0")}00`;
      })()
    : dateClean;
  const dtEnd = time
    ? (() => {
        const [h, m] = time.split(":").map(Number);
        const endM = h * 60 + m + 60;
        return `${dateClean}T${Math.floor(endM / 60).toString().padStart(2, "0")}${(endM % 60).toString().padStart(2, "0")}00`;
      })()
    : (() => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0].replace(/-/g, "");
      })();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GoBoop//Pet Care//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : "",
    description ? `DESCRIPTION:${description}` : "",
    `ORGANIZER:GoBoop`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
