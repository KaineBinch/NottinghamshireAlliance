export const getNextEventDate = (teeTimes) => {
  const today = new Date();

  const upcomingEvents = teeTimes?.data.filter(
    (entry) => new Date(entry.event?.eventDate) >= today
  );
  let sortedEvents = []
  if (!upcomingEvents) {
    const previousEvents = teeTimes?.data.filter(
      (entry) => new Date(entry.event?.eventDate) <= today
    );
    sortedEvents = previousEvents.sort(
      (a, b) => new Date(b.event?.eventDate) - new Date(a.event?.eventDate)
    );
  } else {
    sortedEvents = upcomingEvents.sort(
      (a, b) => new Date(a.event?.eventDate) - new Date(b.event?.eventDate)
    );
  }
  return sortedEvents[0].event.eventDate;
}