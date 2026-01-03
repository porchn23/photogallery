export default function AddToCalendarBtn({ event, className }) {
    if (!event || !event.start) return null;
  
    const createGoogleCalendarLink = () => {
      const startDate = new Date(event.start);
      const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
      const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  
      const url = new URL('https://www.google.com/calendar/render');
      url.searchParams.append('action', 'TEMPLATE');
      url.searchParams.append('text', event.title || 'Rooplife Event');
      url.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
      
      const details = `View your photos at: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nPowered by Rooplife AI`;
      url.searchParams.append('details', details);
      
      if (event.location) url.searchParams.append('location', event.location);
  
      return url.toString();
    };
  
    return (
      <a
        href={createGoogleCalendarLink()}
        target="_blank"
        rel="noopener noreferrer"
        title="Save to Google Calendar"
        className={`group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors ${className}`}
      >
        {/* ใช้รูป Official SVG จาก Wikimedia (ไฟล์จริงจาก Google) */}
        <div className="relative w-5 h-5 transition-transform group-hover:scale-110">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
            alt="Google Calendar" 
            className="w-full h-full object-contain drop-shadow-sm"
            loading="lazy"
          />
        </div>
        <span className="hidden sm:inline group-hover:underline decoration-blue-200 underline-offset-4">Add to Calendar</span>
      </a>
    );
  }