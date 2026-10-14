import type { RevisionMessage } from '../data/database';

export type ConnectionState = 'live' | 'degraded' | 'reconnecting';

export function subscribeToCampaign(campaignId: string, onUpdate: () => void, onStatus: (status: ConnectionState) => void): () => void {
  let stopped = false;
  let channel: BroadcastChannel | undefined;
  let polling: ReturnType<typeof setInterval> | undefined;
  let lastRead = Date.now();

  const readAgain = () => {
    if (stopped) return;
    onStatus('reconnecting');
    onUpdate();
    lastRead = Date.now();
    onStatus(typeof BroadcastChannel === 'undefined' ? 'degraded' : 'live');
  };

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel('iraworks-commitment-counter');
      channel.onmessage = (event: MessageEvent<RevisionMessage>) => {
        const data = event.data;
        if (data && data.campaignId === campaignId && Number.isSafeInteger(data.revision)) readAgain();
      };
    } catch {
      onStatus('degraded');
    }
  }
  if (!channel) {
    onStatus('degraded');
    polling = setInterval(() => {
      if (Date.now() - lastRead >= 2000) readAgain();
    }, 2000);
  }

  const onResume = () => readAgain();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') onResume();
  };
  window.addEventListener('focus', onResume);
  window.addEventListener('pageshow', onResume);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stopped = true;
    if (polling) clearInterval(polling);
    channel?.close();
    window.removeEventListener('focus', onResume);
    window.removeEventListener('pageshow', onResume);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
