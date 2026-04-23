// Date utility helpers for Nexo

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const parseDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return {
    year: parseInt(y, 10),
    month: parseInt(m, 10) - 1, // 0-indexed
    day: parseInt(d, 10),
  };
};

export const formatEventTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};
