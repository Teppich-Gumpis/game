export interface Audio {
  arrayBuffer: ArrayBuffer;
  audioBuffer: AudioBuffer;
}

const audioUrls = {
  short: '/assets/short.aac',
  long: '/assets/long.aac',
  background: '/assets/background.aac'
};

const audioCtx = new AudioContext();

async function loadAndConnect(url: string): Promise<Audio> {
  const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  return {
    arrayBuffer,
    audioBuffer
  };
}

export const sounds: Record<keyof typeof audioUrls, Promise<Audio>> = Object.entries(audioUrls)
  .reduce((sounds, [name, url]) => {
    sounds[name as unknown as keyof typeof audioUrls] = loadAndConnect(url);
    return sounds;
  }, {} as Record<keyof typeof audioUrls, Promise<Audio>>);

export async function play(name: keyof typeof audioUrls, options: {loop?: boolean; detune?: number} = {}) {
  const sound = await sounds[name];
  const source = audioCtx.createBufferSource();
  source.buffer = sound.audioBuffer;
  source.connect(audioCtx.destination);

  if (options.loop) {
    source.loop = true;
  }

  if (options.detune) {
    source.detune.value = options.detune;
  }

  source.start();
  source.addEventListener('ended', () => source.disconnect(audioCtx.destination));
  return source;
}

