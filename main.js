const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  Menu
} = require("electron");
const path = require("path");
const ejse = require("ejs-electron");
const Store = require("electron-store");
const express = require("express");
const http = require("http");
const fs = require("fs");
const os = require("os");
const store = new Store();

//let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
  });
  mainWindow.loadURL('file://' + path.join(__dirname, "index.ejs"))
}
Menu.setApplicationMenu(null)

function createServerFull(serv) {
  const app = express();
  const directoryPath = path.join(serv.path);

  app.set("port", serv.port);
  app.set("views", path.join(__dirname, "models"));
  app.set("view engine", "ejs");
  app.use(express.static(serv.path));
  var listfolders = [];

  function dirTree(filename) {
    var stats = fs.lstatSync(filename),
      info = {
        path: filename,
        name: path.basename(filename),
      };

    if (stats.isDirectory()) {
      info.type = "folder";
      listfolders.push(filename);
      info.children = fs.readdirSync(filename).map(function (child) {
        return dirTree(filename + "\\" + child);
      });
    } else {
      // Assuming it's a file. In real life it could be a symlink or
      // something else!
      info.type = "file";
    }

    return info;
  }

  var listfiles = dirTree(serv.path);
  console.log(listfiles);
  console.log(listfolders);

  console.log("root : " + listfiles.path);

  listfolders.forEach((el) => {
    let conc = el.slice(serv.path.length);
    let result = conc.replace(/\\/g, "/");
    console.log("build route " + result);
    // hurrayyy!!!!!!

    app.get(result, function (req, res) {
      res.render("indexfull", {
        url: req.hostname + ":" + serv.port,
        path: serv.path,
        files: dirTree(el),
      });
    });
  });

  app.get("/json", function (req, res) {
    res.json(listfiles);
  });
  ipcMain.on("stop-serv", (event, serv, type) => {
    server.close(() => {
      console.log("Closed out remaining connections");
    });
  });

  var server = http.createServer(app);
  server.listen(serv.port);
}

function createServerFileOnly(serv) {
  const app = express();
  const directoryPath = path.join(serv.path);

  app.set("port", serv.port);
  app.set("views", path.join(__dirname, "models"));
  app.set("view engine", "ejs");
  app.use(express.static(serv.path));

  app.get("/", function (req, res) {
    res.sendFile(serv.path, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Sent:", serv.path);
      }
    });
  });
  app.get("/json", function (req, res) {
    res.json(listfiles);
  });
  ipcMain.on("stop-serv", (event, serv, type) => {
    server.close(() => {
      console.log("Closed out remaining connections");
    });
  });
  var server = http.createServer(app);
  server.listen(serv.port);
}

function createServerFolderOnly(serv) {
  const app = express();
  const directoryPath = path.join(serv.path);

  app.set("port", serv.port);
  app.set("views", path.join(__dirname, "models"));
  app.set("view engine", "ejs");
  app.use(express.static(serv.path));
  let listfiles = [];
  function read(listfiles) {
    fs.readdir(directoryPath, function (err, files) {
      if (err) {
        console.log("Error getting directory information.");
      } else {
        files.forEach(function (file) {
          fs.stat(directoryPath + `/${file}`, function (err, stats) {
            if (stats.isFile()) {
              listfiles.push(file);
              console.log(file + " is file");
            }
          });
        });
      }
    });
  }
  read(listfiles);

  app.get("/", function (req, res) {
    res.render("indexfolder", {
      url: req.hostname + ":" + serv.port,
      path: serv.path,
      files: listfiles,
    });
  });
  app.get("/json", function (req, res) {
    res.json(listfiles);
  });
  ipcMain.on("stop-serv", (event, serv, type) => {
    server.close(() => {
      console.log("Closed out remaining connections");
    });
  });
  var server = http.createServer(app);
  server.listen(serv.port);
}

app.on("ready", () => {

  if (!store.has("createdDate")) {
    store.set("createdDate", new Date());
    store.set("serverlist", []);
    // wip
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === "IPv4" && !address.internal) {
          addresses.push(address.address);
        }
      }
    }
    console.log(addresses);
    store.set("ip", addresses[0]);
    let ip = store.get("ip");
    ejse.data({ ip: ip });
  } else {
    let ip = store.get("ip");
    ejse.data({ ip: ip });
  }
  ejse.data('appName', process.env.npm_package_name );
  createWindow();
  //mainWindow.webContents.openDevTools();

/*   const iconPath = path.join(__dirname, "icon.ico");
  tray = new Tray(iconPath);
  tray.setToolTip("AMP Notifier App");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
    },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.show();
  }); */
});

app.on("window-all-closed", function () {
  // macOS
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // macOS
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("choose-servtype", (event, arg) => {
  if (arg === "full") {
    addServFull(event);
  }
  if (arg === "onefolder") {
    addServFolderOnly(event);
  }
  if (arg === "onefile") {
    addServFileOnly(event);
  }
});

ipcMain.on("delete-serv", (event, arg) => {
  let serverlist = store.get("serverlist");
  serverlist.forEach((el) => {
    if (el.name === arg) {
      serverlist.splice(serverlist.indexOf(el), 1);
      let ip = store.get('ip')
      store.set("serverlist", serverlist);
      event.reply("res-fetch", serverlist, ip);
    }
  });
});

ipcMain.on("visit-serv", (event, port) => {
  let ip = store.get('ip')
  shell.openExternal('http://'+ip+':'+port)
});

ipcMain.on("update-serv", (event, id, name, path, port) => {
  let serverlist = store.get("serverlist");
  serverlist.forEach((el) => {
    if (el.name === id) {
      (el.name = name), (el.path = path), (el.port = Number(port));
    }
    store.set("serverlist", serverlist);
    event.reply("res-fetch", serverlist);
  });
});

ipcMain.on("launch-serv", (event, serv, type) => {
  let serverlist = store.get("serverlist");
  serverlist.forEach((el) => {
    if (serv === el.name) {
      let type = el.type;
      console.log(type);

      if (type === "full") {
        createServerFull(el);
      }
      if (type === "onefolder") {
        createServerFolderOnly(el);
      }
      if (type === "onefile") {
        createServerFileOnly(el);
      }
    }
  });
});

ipcMain.on("update-ip", (event, arg) => {
  store.set("ip", arg);
  let ip = store.get("ip")
  let serverlist = store.get("serverlist");
  event.reply("res-fetch",serverlist, ip);
});

ipcMain.on("clear-all", (event, [...args]) => {
  let serverlist = store.set("serverlist", []);
  event.reply("res-fetch", serverlist);
});

ipcMain.on("fetch", (event, arg) => {
  let ip = store.get("ip")
  console.log(ip);
  let serverlist = store.get("serverlist");
  event.reply("res-fetch", serverlist, ip);
});

function getName(serv) {
  let conc = serv.lastIndexOf("\\");
  return serv.substr(conc + 1);
}
function getPort(port) {
  let serverlist = store.get("serverlist");
  serverlist.forEach((el) => {
    if (port === el.port) {
      console.log("same");
      port = el.port + 1;
    }
  });
  return port;
}
function addServFull(event) {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    })
    .then((result) => {
      //console.log(result.canceled)
      //console.log(result.filePaths)
      if (!result.canceled) {
        // push new serv
        let serverlist = store.get("serverlist");
        let tempPort = 3000 + serverlist.length;
        serverlist.push({
          name: getName(result.filePaths.toString()),
          type: "full",
          path: result.filePaths.toString(),
          port: getPort(tempPort),
        });
        let ip = store.get('ip')
        store.set("serverlist", serverlist);
        event.reply("res-fetch", serverlist, ip);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function addServFolderOnly(event) {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    })
    .then((result) => {
      //console.log(result.canceled)
      //console.log(result.filePaths)
      if (!result.canceled) {
        // push new serv
        let serverlist = store.get("serverlist");
        let tempPort = 3000 + serverlist.length;
        serverlist.push({
          name: getName(result.filePaths.toString()),
          type: "onefolder",
          path: result.filePaths.toString(),
          port: getPort(tempPort),
        });
        let ip = store.get('ip')
        store.set("serverlist", serverlist);
        event.reply("res-fetch", serverlist, ip);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function addServFileOnly(event) {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openFile"],
    })
    .then((result) => {
      //console.log(result.canceled)
      //console.log(result.filePaths)
      if (!result.canceled) {
        // push new serv
        let serverlist = store.get("serverlist");
        let tempPort = 3000 + serverlist.length;
        serverlist.push({
          name: getName(result.filePaths.toString()),
          type: "onefile",
          path: result.filePaths.toString(),
          port: getPort(tempPort),
        });
        let ip = store.get('ip')
        store.set("serverlist", serverlist);
        event.reply("res-fetch", serverlist, ip);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
