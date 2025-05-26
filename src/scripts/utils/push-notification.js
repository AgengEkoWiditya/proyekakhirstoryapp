const pushServerPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; // Ganti dengan VAPID key dari API

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const raw = atob(base64);
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
};

export const initPushNotification = async () => {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    try {
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pushServerPublicKey),
      });

      console.log('Subscribed to push notifications:', newSubscription);
      // Kirim subscription ke server jika perlu
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }
};
