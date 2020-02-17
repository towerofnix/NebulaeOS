const fs = require("fs")
const path = require("path")
const extract = require("extract-zip")
const {
    remote
} = require("electron")
const glob = require("glob")

const timeDisplay = document.querySelector("#time")
const dateDisplay = document.querySelector("#date")
const windowsContainer = document.querySelector("#windows")
const programsDir = rootFolder + "/programs/"

const desktop = {
    uiVersion: "1.0",
    width: remote.getCurrentWindow().getBounds().width,
    height: remote.getCurrentWindow().getBounds().height,
    windows: [

    ],
    desktopShortcuts: [

    ],
    reloadWindows: () => {
        for (let i = 0; i < desktop.windows.length; i++) {
            let currItem = desktop.windows[i]
            if (desktop.windows[i].windowElement === undefined) {
                let newWindow = document.createElement("div")
                let windowContents = document.createElement("iframe")
                newWindow.className = "window"
                newWindow.style.left = currItem.x + "px"
                newWindow.style.top = currItem.y + "px"
                newWindow.style.width = currItem.width + "px"
                newWindow.style.height = currItem.height + "px"
                windowContents.className = "windowContents"
                windowContents.style.left = "2px"
                windowContents.style.top = "30px"
                windowContents.style.width = currItem.width - 4 + "px"
                windowContents.style.height = currItem.height - 32 + "px"
                windowsContainer.appendChild(newWindow)
                newWindow.appendChild(windowContents)
                newWindow.windowContents = windowContents

                let windowControl = document.createElement("span", {
                    className: ""
                })
                //Event listeners
                let isMouseDown = false,
                    orgX = 0,
                    orgY = 0

                newWindow.addEventListener("mousedown", (e) => {
                    isMouseDown = true 
                    orgX = e.offsetX
                    orgY = e.offsetY
                    console.log(e)
                })

                newWindow.addEventListener("mousemove", (e) => {
                    if (isMouseDown) {
                        newWindow.style.top = (e.clientY-orgY) + "px"
                        newWindow.style.left = (e.clientX-orgX) + "px"
                    }
                })

                newWindow.addEventListener("mouseup", () => {
                    isMouseDown = false
                    console.log("Stop drag")
                })

                windowContents.addEventListener("mousemove", () => {
                    isMouseDown = false
                })

                document.addEventListener("mousemove", (e) => {
                    if (e.target !== newWindow) isMouseDown = false
                })
                currItem.windowElement = newWindow
            }
        }
    },
    createShortcut: (name, icon) => {
        
    }
}

let programsLoaded = []

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const getTime = () => {
    let d = new Date()
    let currentHour = d.getHours() > 12 ? Math.abs(d.getHours() - 12) : Math.abs(d.getHours())
    currentHour = d.getHours() === 0 ? Math.abs(d.getHours() + 12) : currentHour
    let ampm = d.getHours() < 12 ? "AM" : "PM"
    let currentMinute = d.getMinutes() < 10 ? "0" + d.getMinutes().toString() : d.getMinutes()
    timeDisplay.innerHTML = currentHour + ":" + currentMinute + " " + ampm
    dateDisplay.innerHTML = week[d.getDay()] + " " + months[d.getMonth()] + ". " + d.getDate()
}

const timeUpdate = setInterval(getTime, 1000)

const getPrograms = () => {
    let programs = fs.readdirSync(programsDir)
    for (let i = 0; i < programs.length; i++) {
        let name = programs[i]
        programs[i].replace(".japp", "")
        if (programs[i].endsWith(".japp")) {
            if (!fs.existsSync(programsDir + name.replace(".japp", ""))) fs.mkdirSync(programsDir + name.replace(".japp", ""))
            extract(programsDir + name, {
                dir: programsDir + name.replace(".japp", "")
            }, (err) => {
                if (err) console.error(err)
            })
        }
    }

    programsLoaded = programs
}

const runProgram = (name) => {
    if (programExists(name)) {
        let programInfo = JSON.parse(fs.readFileSync(path.join(programsDir + name, "programInfo.json"), {
            encoding: "utf-8"
        }))
        let data = fs.readFileSync(path.join(programsDir + name, programInfo.base), {
            encoding: "utf-8"
        })
        console.log(data)
        loader.runProgram(data, name, programInfo)
    }
}

const programExists = (val) => {
    for (let i = 0; i < programsLoaded.length; i++) {
        if (programsLoaded[i] === val) {
            return true
        }
    }
    return false
}

const loader = {
    runProgram: (readData, programName, programInfo) => {

        const programID = sha1(programName)

        const windows = [

        ]

        const __dirname = programsDir + programName
        const electron = undefined

        const toolkit = Object.freeze({
            createWindow: (options) => {
                let d = new Date()
                let id = sha1(d.getTime() + programName)
                options.id = id
                options.x = (desktop.width / 2) - (options.width / 2)
                options.y = (desktop.height / 2) - (options.height / 2)
                desktop.windows.push(options)
                windows.push(options)
                desktop.reloadWindows()
                let win = options
                win.loadURL = (url) => {
                    for (let i = 0; i < desktop.windows.length; i++) {
                        if (desktop.windows[i].id === win.id) {
                            console.log(url)
                            desktop.windows[i].windowElement.windowContents.src = url
                        }
                    }
                }

                win.loadHTML = (src) => {
                    for (let i = 0; i < desktop.windows.length; i++) {
                        if (desktop.windows[i].id === win.id) {
                            desktop.windows[i].windowContents.src = "data:text/html;charset=utf-8," + src
                        }
                    }
                }
                return win
            },
            createDesktopShortcut: (name, icon, callback) => {
                desktop.createShortcut(name, icon)
            },
            runProgram: (name, callback) => {
                if (programExists(name)) {
                    let programInfo = JSON.parse(fs.readFileSync(path.join(programsDir + name, "programInfo.json"), {
                        encoding: "utf-8"
                    }))
                    let data = fs.readFileSync(path.join(programsDir + name, programInfo.base), {
                        encoding: "utf-8"
                    })
                    loader.runProgram(data, name, programInfo)
                }
            }
        })

        try {
            eval(readData)
        } catch (ex) {
            console.error(ex)
        }
    }
}

getTime()
getPrograms()
runProgram("NebulaBrowser")