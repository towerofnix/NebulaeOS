const {
   app,
   BrowserWindow
} = require('electron')
const url = require('url')
const path = require('path')
const colors = require('colors')
const fs = require('fs')

const setup = () => {
   let windows = []
   let screen = require("electron").screen
   let displays = screen.getAllDisplays()

   // Fix for https://github.com/electron/electron/issues/18397

   app.allowRendererProcessReuse = true

   for (let i = 0; i < displays.length; i++) {
      let {
         width,
         height
      } = displays[i].workAreaSize
      let {
         x,
         y
      } = displays[i].bounds
      let win = new BrowserWindow({
         width,
         height,
         x,
         y,
         backgroundColor: "#000",
         show: false,
         webPreferences: {
            nodeIntegration: true,
            experimentalFeatures: true
         },
         contextIsolation: true,
         frame: false
      })

      if (fs.existsSync(path.join(__dirname, "/data/users.sys"))) {
         win.loadURL(url.format({
            pathname: path.join(__dirname, 'ui/frame.htm'),
            protocol: 'file:',
            slashes: true
         }));
      } else {
         win.loadURL(url.format({
            pathname: path.join(__dirname, 'ui/setup.htm'),
            protocol: 'file:',
            slashes: true
         }));
      }

      win.on('ready-to-show', () => {
         let ready = 0
         win.ready = true
         for (let i = 0; i < windows.length; i++) {
            if (windows[i].ready) {
               ready++
               if (ready === windows.length) {
                  for (let i = 0; i < windows.length; i++) {
                     windows[i].show()
                  }
               }
            }
         }
      })
      win.on('closed', () => {
         win = null;
      })

      win.setFullScreen(true)

      windows.push(win)
   }
}

app.on("ready", setup);