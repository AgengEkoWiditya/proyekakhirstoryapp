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
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pushServerPublicKey),
    });

    console.log('✅ Subscribed to push notifications:', subscription);

    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Token tidak ditemukan. Anda harus login dulu.');

    // Hapus properti expirationTime sebelum dikirim
    const subscriptionJson = subscription.toJSON();
    delete subscriptionJson.expirationTime;

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionJson),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gagal mengirim subscription: ${response.status} - ${errorData.message}`);
    }

    alert('Berhasil subscribe notifikasi!');
    return subscription;
  } catch (error) {
    console.error('❌ Gagal subscribe:', error);
    alert('Gagal subscribe notifikasi: ' + error.message);
    return null;
  }
};

export const unsubscribePush = async (subscription) => {
  try {
    await subscription.unsubscribe();
    console.log('✅ Unsubscribed dari push notifications');

    alert('Berhasil unsubscribe notifikasi!');
    return true;
  } catch (error) {
    console.error('❌ Gagal unsubscribe:', error);
    alert('Gagal unsubscribe dari notifikasi.');
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
    button.textContent = isSubscribed
      ? 'Unsubscribe dari Notifikasi'
      : 'Subscribe ke Notifikasi';
  };

  (async () => {
    if (!('serviceWorker' in navigator)) {
      button.disabled = true;
      button.textContent = 'Browser tidak mendukung Push';
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    updateButtonText(!!subscription);

    button.addEventListener('click', async () => {
      if (button.disabled) return;

      if (!subscription) {
        subscription = await subscribePush(registration);
        if (subscription) updateButtonText(true);
      } else {
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
