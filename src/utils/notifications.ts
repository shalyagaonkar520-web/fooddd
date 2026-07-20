export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const triggerBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const options: any = {
      body,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
    };
    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

let sirenAudio: HTMLAudioElement | null = null;

export const playSiren = () => {
  if (!sirenAudio) {
    // A high-pitched, urgent double beep (data URI for reliability so it works offline immediately)
    sirenAudio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    sirenAudio.loop = true;
  }
  
  sirenAudio.play().catch(e => {
    console.warn('Audio playback blocked by browser policy until user interacts with the page.', e);
  });
};

export const stopSiren = () => {
  if (sirenAudio) {
    sirenAudio.pause();
    sirenAudio.currentTime = 0;
  }
};

export const triggerVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
};
