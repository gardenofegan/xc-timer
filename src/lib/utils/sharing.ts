import QRCode from 'qrcode';
import type { TimingSession } from '../types';

export async function shareData(session: TimingSession) {
  const data = {
    title: `${session.name} - Cross Country Times`,
    text: `Times for ${session.runners.length} runners`,
    url: createShareableData(session)
  };

  if (navigator.share && navigator.canShare && navigator.canShare(data)) {
    try {
      console.log('am I here?');
      await navigator.share(data);
      return true;
    } catch (err) {
      console.log('Error sharing:', err);
      return false;
    }
  }
  
  // Fallback: copy to clipboard
  try {
    console.log('Copied to clipboard');
    await navigator.clipboard.writeText(JSON.stringify(session, null, 2));
    return true;
  } catch (err) {
    console.log('Error copying to clipboard:', err);
    return false;
  }
}

export function createShareableData(session: TimingSession): string {
  return `data:application/json;base64,${btoa(JSON.stringify(session))}`;
}

export async function generateQRCode(session: TimingSession): Promise<string> {
  const data = JSON.stringify(session);
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

export function downloadJSON(session: TimingSession) {
  const dataStr = JSON.stringify(session, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `xc-times-${session.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}