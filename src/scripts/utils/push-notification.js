const pushServerPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const raw = atob(base64);
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
};

export const subscribePush = async (registration) => {
  try {
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pushServerPublicKey),
    });
    console.log('Subscribed to push notifications:', newSubscription);

    // Kirim subscription ke server
    const response = await fetch('/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSubscription),
    });

    if (!response.ok) {
      throw new Error('Gagal mengirim subscription ke server');
    }

    alert('Subscribed to push notifications!');
    return newSubscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    alert('Failed to subscribe to push notifications.');
    return null;
  }
};

export const unsubscribePush = async (subscription) => {
  try {
    await subscription.unsubscribe();
    console.log('Unsubscribed from push notifications');

    // Inform server tentang unsubscribe (opsional)
    await fetch('/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    alert('Unsubscribed from push notifications!');
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    alert('Failed to unsubscribe from push notifications.');
    return false;
  }
};

export const createPushNotificationButton = () => {
  const button = document.createElement('button');
  button.id = 'subscribePushBtn';
  button.className = 'push-button';
  button.style.padding = '10px';
  button.style.marginTop = '1rem';

  const updateButtonText = (isSubscribed) => {
    button.textContent = isSubscribed ? 'Unsubscribe from Push Notification' : 'Subscribe to Push Notification';
  };

  (async () => {
    if (!('serviceWorker' in navigator)) {
      button.disabled = true;
      button.textContent = 'Push Not Supported';
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    updateButtonText(!!subscription);

    button.addEventListener('click', async () => {
      if (button.disabled) return;

      if (!subscription) {
        // Subscribe
        subscription = await subscribePush(registration);
        if (subscription) updateButtonText(true);
      } else {
        // Unsubscribe
        const success = await unsubscribePush(subscription);
        if (success) {
          subscription = null;
          updateButtonText(false);
        }
      }
    });
  })();

  return button;
};
