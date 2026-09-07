export function createRadio(onUpdate = () => {}) {
  const audio = new Audio('/assets/community-radio.wav');
  audio.preload = 'metadata';
  for (const event of ['timeupdate', 'loadedmetadata', 'play', 'pause', 'ended', 'ratechange']) audio.addEventListener(event, () => onUpdate(audio));
  audio.addEventListener('error', () => onUpdate(audio, new Error('音频加载失败，请刷新后重试')));
  const toggle = async () => {
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } else audio.pause();
  };
  const seek = value => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration, value)); };
  window.addEventListener('pagehide', () => audio.pause());
  return { audio, toggle, seek };
}
