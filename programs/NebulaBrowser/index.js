console.log(toolkit)

const win = toolkit.createWindow({
    width: 800,
    height: 600,
    title: "Nebula Browser"
})

win.loadURL(path.join(__dirname, "index.htm"))