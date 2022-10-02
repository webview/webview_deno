declare function __broadcast_recv(): [string, string];

export function __broadcast_patch() {
  const channels = [];
  let initialized = false;
  
  async function recv() {
    while (channels.length > 0) {
      const message = await __broadcast_recv();

      if (message === null) {
        break;
      }

      const [name, data] = message;
      console.log(message);
    }
  }

  globalThis.BroadcastChannel = class BroadcastChannel
    extends globalThis.BroadcastChannel {
    constructor(channelName: string) {
      super(channelName);

      channels.push(this);

      if (!initialized) {
        initialized = true;
        recv();
      }
    }
  };
}
