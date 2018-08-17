'use strict';

// Buttplug Module for Yiffspot
//
// This module wraps the buttplug-js library and provides Yiffspot users with
// the ability to
//
// - Enumerate hardware
// - Share hardware
// - Control hardware shared by other users.
//
// In comments for this module, "Local user" refers to the user running the
// Buttplug server, who has devices they want to share and have others control.
// "Remote user" refers to the user who will be controlling the device upon
// successful sharing.
//
// Buttplug access is completely client-side, there's nothing in the server
// specific to buttplug. The only thing the server is used for is to relay
// messages, as we encode buttplug messages and fly them over the chat
// connection in a way that does not need server intervention otherwise.

const util = require('./util.js');
const Slider = require('nouislider');
const chat = require('./chat');

// If true, allow user to share their devices. Usually reflects status of local
// user being connected to a remote user.
let shouldEnableSharing = false;

// Actual buttplug client object. Type is undefined | ButtplugClient. Assume
// client is connected if it is not undefined.
let bpClient = undefined;

// Whether or not the Buttplug Client is currently scanning for devices. Can be
// removed once https://github.com/metafetish/buttplug-js/issues/93 is resolved.
let isScanning = false;

// Devices currently selected and shared by the local user. Allows us to make
// sure that if rogue commands are sent to IDs of unshared devices, commands
// will not be passed on.
//
// Devices are stored as an <int, Device> map. Integer key is generated randomly
// on share, so that if a device is shared then unshared, it cannot be accessed
// at the same index again.
let selectedDevices = new Map();

// Main connection websocket, passed in from main program.
let mainSocket = undefined;

let isInitialized = false;

// Used for debugging. Uncomment if you want everything buttplug does to be logged in the console.
// Buttplug.ButtplugLogger.Logger.maximumConsoleLogLevel = Buttplug.ButtplugLogLevel.Debug;

// Disconnects client from server, and cleans up side panel GUI/shared devices.
async function disconnect() {
  if (bpClient.Connected) {
    await bpClient.StopAllDevices();
    bpClient.Disconnect();
  }
  bpClient = undefined;
  const simPanel = document.getElementById('buttplug-test-device-manager-panel');
  if (simPanel) {
    simPanel.parentNode.removeChild(simPanel);
  }
  document.getElementById('buttplugConnect').classList.remove('buttplug-hide');
  document.getElementById('buttplugDevice').classList.add('buttplug-hide');
  document.getElementById('buttplugSimulator').classList.add('buttplug-hide');
  unshareAllDevices();
  // Clear out device list, we'll rebuild on reconnect if need be
  const devices = document.getElementById("buttplugDeviceList");
  while (devices.firstChild) {
    devices.removeChild(devices.firstChild);
  }
}

// Clear shared devices
function unshareAllDevices() {
  // If we somehow got here without being initialized, just bail.
  if (!isInitialized) {
    return;
  }
  for (const device of selectedDevices.values()) {
    onDeviceUnselected(device, true);
  }
}

// After successful connection of any kind, close connect panel and bring up
// device panel.
function finishConnection() {
  document.getElementById('buttplugConnect').classList.add('buttplug-hide');
  document.getElementById('buttplugDevice').classList.remove('buttplug-hide');
}

// Whenever a device is selected in the GUI, add it to our list and tell the
// remote user.
function onDeviceSelected(device) {
  const shareIndex = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  selectedDevices.set(shareIndex, device);
  chat.sendStatusMessage(mainSocket, 'Partner has shared control of device ' + device.Name);
  chat.sendButtplugMessage(mainSocket, `/buttplug share ${shareIndex} ${device.Name}`);
}

// Whenever a device is selected in the GUI:
//
// - Stop the device from moving
// - Remove it from the share list
// - Tell remote user
// - Make sure GUI reflects status
function onDeviceUnselected(device, shouldStop) {
  if (Array.from(selectedDevices.values()).indexOf(device) === -1) {
    return;
  }
  if (bpClient && bpClient.Connected && shouldStop) {
    bpClient.SendDeviceMessage(device, new Buttplug.StopDeviceCmd());
  }
  const el = document.getElementById(`buttplugdevice${device.Index}`);
  // This can be called either via manual or programmatic change, so make sure
  // we uncheck either way.
  if (el !== null) {
    el.checked = false;
  }
  const removableDevices = [];
  for (const item of selectedDevices.entries()) {
    if (item[1] === device) {
      removableDevices.push(item[0]);
    }
  }
  for (const i of removableDevices) {
    selectedDevices.delete(i);
    chat.sendStatusMessage(mainSocket, 'Partner has stopped sharing control of device ' + device.Name);
    chat.sendButtplugMessage(mainSocket, `/buttplug unshare ${i}`);
  }
}

// Adds devices found by the server (either during scanning or having already
// connected in a prior session) to the GUI
function onDeviceAdded(device) {
  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.disabled = !shouldEnableSharing;
  checkbox.id = `buttplugdevice${device.Index}`;
  checkbox.type = "checkbox";
  //checkbox.style.display = "inline";
  checkbox.addEventListener("change", function(e) {
    if (e.target.checked) {
      onDeviceSelected(device);
    } else {
      onDeviceUnselected(device, true);
    }
  });
  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(device.Name));
  li.appendChild(checkbox);
  li.appendChild(label);
  document.getElementById('buttplugDeviceList').appendChild(li);
}

// When a device is removed from the server (usually via disconnection or power
// off), unselect it if it is selected/shared, then update the GUI.
function onDeviceRemoved(device) {
  for (const d of selectedDevices.values()) {
    if (d.Index === device.Index) {
      onDeviceUnselected(d, false);
      break;
    }
  }
  const checkbox = document.getElementById(`buttplugdevice${device.Index}`);
  if (!checkbox) {
    return;
  }
  checkbox.parentNode.remove(checkbox);
}

// Creates device control UI for a remote user when a device is shared to them.
// Currently only work with vibrating toys. Creates a slider with the device
// name as a label, which is added to the "buttplug-controls" div above the text
// entry.
function onDeviceShared(device) {
  const sliderDiv = document.createElement("div");
  sliderDiv.classList.add("buttplug-device-slider");
  const sliderLabel = document.createElement("label");
  sliderLabel.classList.add("buttplug-device-slider-label");
  sliderLabel.innerHTML = device.Name;
  sliderLabel.for = `buttplug-device-${device.Index}`;
  const rangeSlider = Slider.create(sliderDiv, {
    start: [0],
    orientation: "horizontal",
    behavior: 'tap-drag',
	  range: {
      // 20 increments
		  'min': [0, 0.05],
		  'max': [1]
	  }
  });
  rangeSlider.on('change', function(values, handle) {
    chat.sendStatusMessage(mainSocket, `Partner sent speed ${values[handle]} to ${device.Name}`);
    chat.sendButtplugMessage(mainSocket, `/buttplug vibrate ${device.Index} ${values[handle]}`);
  });
  sliderDiv.id = `buttplug-device-${device.Index}`;
  const sliderContainerDiv = document.createElement("div");
  sliderContainerDiv.id = `buttplug-device-${device.Index}-container`;
  sliderContainerDiv.appendChild(sliderLabel);
  sliderContainerDiv.appendChild(sliderDiv);
  document.getElementById('buttplug-controls').appendChild(sliderContainerDiv);
}

// Destroys control UI for a devices that has been unshared for a remote user.
function onDeviceUnshared(deviceIndex) {
  const container = document.getElementById(`buttplug-device-${deviceIndex}-container`);
  if (container === undefined || container === null) {
    return;
  }
  container.parentNode.removeChild(container);
}

// Cleans up the device controls in the buttplug-controls div. Usually happens
// on partner disconnect/leaving/change.
function removeDeviceControls() {
  // If we somehow got here without being initialized, just bail.
  if (!isInitialized) {
    return;
  }

  const devices = document.getElementById("buttplug-controls");
  while (devices.firstChild) {
    devices.removeChild(devices.firstChild);
  }
}

// Set whether devices can be shared. We only want to be able to share devices
// when connected to a remote user, otherwise we should list them but not allow
// them to be shared.
function setDeviceSharing(enabled) {
  // If we somehow got here without being initialized, just bail.
  if (!isInitialized) {
    return;
  }

  const devicelist = document.querySelectorAll('#buttplugDeviceList > li > input');
  for (const node of devicelist) {
    node.disabled = !enabled;
  }
  shouldEnableSharing = enabled;
}

// Enable device sharing for local user (on connection to remote user)
function enableDeviceSharing() {
  setDeviceSharing(true);
}

// Enable device sharing for local user (on disconnection from remote user)
function disableDeviceSharing() {
  setDeviceSharing(false);
  unshareAllDevices();
}

// Update button text when device scanning is finished.
function onScanningFinished() {
  document.getElementById('buttplugScanning').innerHTML = "Start Scanning";
}

// Tell server to start discovering devices.
async function startScanning() {
  if (bpClient === undefined || !bpClient.Connected) {
  }
  // Due to the way WebBluetooth events work, order matters here. We need to
  // change the button text before calling startScanning, otherwise event order
  // messes up and we end up in the wrong state.
  document.getElementById('buttplugScanning').innerHTML = "Stop Scanning";
  await bpClient.StartScanning();
}

// Tell server to stop discovering devices. Useful when connected to a native
// (non-browser) server that has long-polling bluetooth scanning.
async function stopScanning() {
  if (bpClient === undefined || !bpClient.Connected) {
  }
  await bpClient.StopScanning();
  onScanningFinished();
}

// Toggle status of scanning.
async function toggleScanning() {
  if (bpClient === undefined || !bpClient.Connected) {
  }
  if (document.getElementById('buttplugScanning').innerHTML === "Start Scanning") {
    await startScanning();
  } else {
    stopScanning();
  }
}

// Create device manager panel for simulator, which shows devices that can be
// animated (versus requiring real hardware for testing)
function createSimulatorPanel() {
  ButtplugDevTools.CreateDeviceManagerPanel(bpClient.Connector.Server);
}

// Set up event listeners on a new client.
function prepareConnection() {
  bpClient.addListener('disconnect', disconnect);
  bpClient.addListener('deviceadded', onDeviceAdded);
  bpClient.addListener('deviceremoved', onDeviceRemoved);
  bpClient.addListener('scanningfinished', onScanningFinished);
}

// Connect to the developer tools server, aka "the simulator". This is an
// in-browser server that has the Test Device Manager hooked up, meaning it will
// present software only devices that can be used for testing. This is used with
// the Simulator Panel to visualize device state via animations.
async function connectDevTools() {
  // Using the CreateDevToolsClient helper function, we get back a Buttplug
  // client that's already connected to an in-browser server with Test Device
  // capabilities, so it's basically returned to us ready to use. No connection
  // calls or error handling required.
  bpClient = await ButtplugDevTools.CreateDevToolsClient(Buttplug.ButtplugLogger.Logger);
  prepareConnection();
  finishConnection();
  document.getElementById('buttplugSimulator').classList.remove('buttplug-hide');
}

// Connect to the in-browser server. Only useful is a browser has WebBluetooth
// capabilities (Chrome on Mac/Linux/Android/Chrome OS). The in-browser server
// is a full featured server, using WebBluetooth to talk to Bluetooth hardware
// supported by the Buttplug library.
async function connectLocal() {
  if (bpClient && bpClient.Connected) {
    await bpClient.Disconnect();
  }
  bpClient = new Buttplug.ButtplugClient();
  prepareConnection();
  try {
    await bpClient.ConnectLocal();
    finishConnection();
  } catch (e) {
    disconnect();
  }
}

// Connect to a Websocket server. The Buttplug project distributes multiple
// native server that use WebSockets to connect webbrowsers to
// bluetooth/usb/serial hardware. This function creates an outgoing websocket
// connection to those servers.
async function connectWebsocket() {
  if (bpClient && bpClient.Connected) {
    await bpClient.Disconnect();
  }
  bpClient = new Buttplug.ButtplugClient();
  // This is the only place where prepareConnection NEEDS to happen before
  // connect. Due to some windows idiocy, once we connect to devices on windows
  // we can't disconnect until we restart the server process. This means devices
  // can be already connected when we connect, and the server will fire
  // deviceadded events to signify that on connect. So we need to have the
  // deviceadded handler ready to go to cover that.
  prepareConnection();
  try {
    await bpClient.ConnectWebsocket(document.getElementById('buttplug-websocket-address').value);
    finishConnection();
  } catch (e) {
    disconnect();
    alert("It looks like connecting to Buttplug via websocket failed! It could be that the server is down, \
or that the SSL certificate hasn't been accepted yet. If you keep having issues, check the \
tutorial (the oWo link) to make sure things are correct, or post a reply there if you can't \
figure out the issue.");
  }
}

// Parse messages coming in from remote users. Messages are of the format
//
// /buttplug [command] [arguments]
//
// Tokens are ASCII space (' ') delimited. With the following commands:
//
// share [index] [name] - Share a device with a user. index is an identifier,
// name is rest of tokens. Example:
//
// /buttplug share a8d8217c Lovense Hush
//
// unshare [index] - Unshare a device with a user. Example:
//
// /buttplug unshare a8d8217c
//
// vibrate [index] [speed] - Cause a device that supports vibration to vibrate
// at the given speed. Speed is expressed as a double, range 0.0-1.0. Example:
//
// /buttplug vibrate a8d8217c 0.2
//
async function parseMessage(message) {
  if (!isInitialized) {
    return false;
  }
  var msg = util.linkify(util.strip_tags(message));
  var msgToken = msg.split(" ");
  if (msgToken[0] !== "/buttplug") {
    return false;
  }
  switch(msgToken[1]) {
  case "vibrate": {
    if (bpClient === undefined || !bpClient.Connected) {
      return false;
    }

    const index = parseInt(msgToken[2]);
    const device = selectedDevices.get(index);
    if (device === undefined || device.AllowedMessages.indexOf("VibrateCmd") === -1) {
      return false;
    }

    const speed = parseFloat(msgToken[3]);
    if (speed === NaN) {
      return false;
    }

    bpClient.SendDeviceMessage(device, Buttplug.CreateSimpleVibrateCmd(device, speed));
    return true;
  }
  case "share": {
    onDeviceShared({
      Index: msgToken[2],
      Name: msgToken.slice(3).join(" ")
    });
    return true;
  }
  case "unshare": {
    onDeviceUnshared(msgToken[2]);
    return true;
  }
  }
  return false;
}

// Initialize the buttplug panel. This function must be called in order for
// anything Buttplug related to show up or work.
//
// Takes the main websocket connection as an argument.
function init(socket) {

  mainSocket = socket;

  document.getElementById('buttplugPanel').classList.remove('buttplug-hide');

  document.getElementById('buttplugConnectWebsocket').addEventListener('click', function(e) {
    e.preventDefault();
    connectWebsocket();
  });

  document.getElementById('buttplugConnectLocal').addEventListener('click', function(e) {
    e.preventDefault();
    connectLocal();
  });

  document.getElementById('buttplugConnectDevTools').addEventListener('click', function(e) {
    e.preventDefault();
    connectDevTools();
  });

  document.getElementById('buttplugDisconnect').addEventListener('click', async function(e) {
    e.preventDefault();
    await disconnect();
  });

  document.getElementById('buttplugScanning').addEventListener('click', async function(e) {
    e.preventDefault();
    await toggleScanning();
  });

  document.getElementById('buttplugShowSimulator').addEventListener('click', function(e) {
    e.preventDefault();
    createSimulatorPanel();
  });

  if (typeof(window) === "undefined" ||
      typeof(window.navigator) === "undefined" ||
      !(navigator.bluetooth)) {
    document.getElementById('buttplugConnectLocal').disabled = true;
  }

  isInitialized = true;
}

module.exports = {
  init,
  enableDeviceSharing,
  disableDeviceSharing,
  removeDeviceControls,
  parseMessage
};
