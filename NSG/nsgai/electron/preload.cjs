const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // ✅ Test connection
  ping: () => 'Electron connected',

  // 🔔 Example: send message to main process
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },

  // 👂 Example: receive message from main process
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  }
})
