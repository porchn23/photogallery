import { CalendarPlus } from 'lucide-react';

export default function AddToCalendarBtn({ event, className }) {
  if (!event || !event.start) return null;

  const createGoogleCalendarLink = () => {
    // กำหนดเวลาเริ่ม-จบ (ถ้าไม่มีเวลาจบ ให้บวกเพิ่ม 4 ชั่วโมงเป็น default)
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

    // Format วันที่ให้เป็น YYYYMMDDTHHmmSSZ (UTC)
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title || 'Rooplife Event');
    url.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
    
    // รายละเอียดเพิ่มเติม
    const details = `View your photos at: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nPowered by Rooplife AI`;
    url.searchParams.append('details', details);
    
    if (event.location) {
      url.searchParams.append('location', event.location);
    }

    return url.toString();
  };

  return (
    <a
      href={createGoogleCalendarLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-zinc-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm ${className}`}
    >
      <CalendarPlus size={16} />
      <span>Add to Calendar</span>
    </a>
  );
}