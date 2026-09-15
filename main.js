const { app, BrowserWindow } = require('electron');
const path = require('path');

// Start the Express Server
require('./src/server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'MediFind Desktop',
    icon: path.join(__dirname, 'medifind_logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove the default Electron menu for a cleaner look
  mainWindow.setMenuBarVisibility(false);

  // Wait for the local server to fully boot up on port 5000, then load the app
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5000/index.html');
  }, 1000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
