const {
   app,
   BrowserWindow
} = require('electron')
const url = require('url')
const path = require('path')
const colors = require('colors')
const fs = require('fs')
const sha1 = require('sha1')

const setup = () => {
   let windows = []
   let screen = require("electron").screen
   let displays = screen.getAllDisplays()
   //console.log(displays)
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

      if (fs.existsSync(path.join(__dirname, "users"))) {
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
         win.show()
      })
      win.on('closed', function () {
         win = null;
      });
      win.setFullScreen(true)

      windows.push(win)
   }
}

app.on('ready', setup);