const __debug__ = true;

type KeyListener = (event: "on" | "off", velocity?: number) => void;
const listeners: Record<number, KeyListener[]> = {};

export const removeListener = (key: number, listener: KeyListener) => {
  const list = listeners[key] || [];
  listeners[key] = list.filter((a) => a !== listener);
};
export const addListener = (key: number, listener: KeyListener) => {
  const list = listeners[key] || [];
  listeners[key] = [...list, listener];
  return () => removeListener(key, listener);
};
const midiAccess = await navigator.requestMIDIAccess();
const input = midiAccess.inputs.values().next().value;
if (input) {
  console.log("midi connected");

  input.onmidimessage = (event: any) => {
    if (__debug__) {
      var str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
      for (var i = 0; i < event.data.length; i++) {
        str += "0x" + event.data[i].toString(16) + " ";
      }
      console.log(str);
    }

    const Midi = { ON: 0x90, OFF: 0x80 };
    const command = event.data[0];
    const key = event.data[1];
    const ls = listeners[key] || [];
    if (command === Midi.ON) {
      ls.forEach((l) => l("on", event.data[2]));
    } else if (event.data[0] === Midi.OFF) {
      ls.forEach((l) => l("off", event.data[2]));
    }
  };
}
