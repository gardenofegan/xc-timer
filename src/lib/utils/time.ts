export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseTime(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return 0;
}

export function isValidTimeFormat(timeString: string): boolean {
  const regex = /^\d{1,2}:\d{2}$/;
  if (!regex.test(timeString)) return false;
  
  const parts = timeString.split(':');
  const secs = parseInt(parts[1], 10);
  return secs >= 0 && secs < 60;
}