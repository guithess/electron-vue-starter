const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const url = require("url");
const pkjson = require("./package.json");

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow(pkjson.window);
    Menu.setApplicationMenu(null);

    // and load the index.html of the app.
    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:3000/");

        // Enable Vue DevTools
        require("vue-devtools").install();

        // Open the DevTools.
        win.webContents.openDevTools();
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        }));

        // Begin checking for updates
        autoUpdater.checkForUpdates();
    }

    win.on("ready-to-show", () => {
        win.show();
    });

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


// -----------------------------------------------------------------------
// Auto Update

function sendStatusToWindow(text) { console.log(text); }
autoUpdater.on('checking-for-update', () => { sendStatusToWindow('Checking for update...'); });
autoUpdater.on('update-available', (ev, info) => { sendStatusToWindow('Update available.'); });
autoUpdater.on('update-not-available', (ev, info) => { sendStatusToWindow('Update not available.'); });
autoUpdater.on('error', (ev, err) => { sendStatusToWindow('Error in auto-updater.'); });
autoUpdater.on('download-progress', (ev, progressObj) => { sendStatusToWindow('Download progress...'); });
autoUpdater.on('update-downloaded', (ev, info) => { sendStatusToWindow('Update downloaded; will install in 5 seconds'); });
autoUpdater.on('update-downloaded', (ev, info) => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    setTimeout(function () {
        autoUpdater.quitAndInstall();
    }, 5000);
});
