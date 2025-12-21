// src/lib/utils.js
export const formatThaiDate = (dateString, includeTime = true) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      dateStyle: 'medium',
      timeStyle: includeTime ? 'short' : undefined,
    });
  };
  
  export const toLocalISOString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // สำหรับใส่ใน <input type="datetime-local">
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  };