#!/usr/bin/env node
// Connection to MongoDB
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const mongoose = require('mongoose');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/teletransport';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const rid = process.env.ROBOT_ID || '';
console.log('Robot ID:'+rid);

const Robot = require('./models/robot');
const Mission = require('./models/mission');
const Event = require('./models/event');
const Schedule = require('./models/schedule');

// Connecting to ROS
var ROSLIB = require('roslib');
const axios = require('axios');
const THREE = require('three');
const child_process = require('child_process');
const fs = require('fs');

var appconnecturl = 'http://localhost:3000';
var rosconnecturl = 'ws://localhost:9090';
var robot_id = rid;
var user_id = '';
var robot = null;
var workflow_topic = null;
var current_workflow_name = '';
var battery_capacity_topic = null;
var battery_topic = null;
var current_battery_voltage = 0.0;
var battery_capacity_topic = null;
var current_battery_capacity = 0;
var hardware_topic = null;
var pose_topic = null;
var current_map = {
  map_info: null,
  goals: [],
  vwalls: [],
};
var current_hardware = {
  st_Ros_BumpFront: false,
  st_Ros_BumpRear: false,
  st_Ros_Recharge_On: false,
  st_Ros_Recharge_Ok: false,
  st_Ros_Emergenza: false
};
var pose = {
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  orientation: {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  }
};
var current_docking = '';
var docking_action = {
    goal: { },
    feedback: { },
    result: { },
    status: { },
};
var docking_goal = null;
var docking_action_client = null;
var docking_action_result_topic = null;
var joystick =  {
 vertical: 0,
 horizontal: 0,
};
var oak_detections_target = '';
var oak_detected_action = '';
var oak_detected_action_pars = '';
var oak_detected_delay = 0;
var oak_detected_target = false;
var oak_detected_when = null;
var oak_detections_topic = null;
var oak_detections = null;
var oak_detected_name = '';
var oak_detected_confidence = 0;
var oak_detected_x = 0;
var oak_detected_y = 0;
var oak_detected_z = 0;
var oak_detected_area = 0;
var action = {
 aux: { x: 0, y: 0, z: 0 },
 goal: { pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 0 } } },
 feedback: { position: 0, state: 'idle' },
 result: { success: false },
 status: { status: 0, text: '' },
};
var goal = null;
var action_client = null;
var action_result_topic = null;
var robot_goal_distance = 0.0;
var current_status = false;
var current_mission = {
  name: '',
  tasks: []
};
var running_mission_workflow = false;
var current_mission_par = '';
var running_mission_docking = false;
var running_mission = false;
var running_mission_error = false;
var running_mission_goal = false;
var current_event = {
  robot: '',
  user: '',
  mission: '',
  goal: '',
  action: '',
  parameters: '',
  distance: 0,
  result: 0,
  start: null,
  end: null,
};
var current_mission_start = null;
var current_action_start = null;
var current_action_timeout = 0;
var current_action_timeout_magin = 0;
var current_mission_task = 0;
var current_mission_task_status = -1;
var current_subroutines = [];
var current_subroutine_return = 0;
var current_parameters_values = [];
var current_fallback_action = '';
var robot_locked = false;
var app = { }; // for local variables
// start ROS bridge
var ros = new ROSLIB.Ros({
    url : rosconnecturl
});
ros.on('connection', function() {
  console.log('Connected to ROS bridge: '+rosconnecturl);
});
ros.on('error', function(error) {
  console.log('Error connecting to ROS bridge: ', error);
});
ros.on('close', function() {
  console.log('Connection to ROS bridge closed.');
});

// set mission control topic and subscribe
var mission_control = new ROSLIB.Topic({
  ros : ros,
  name : '/mission_control',
  messageType : 'std_msgs/String'
});

mission_control.subscribe(function(message) {
 var msn = message.data.split('#');
 var idr = msn[0];
 var idu = msn[1];
 var cmd = msn[2];
 user_id = idu;
 console.log('/mission_control: robot_id |'+idr+'| user_id |'+idu+'|');
 // if (robot_id.localeCompare(idr))
 if (robot != null && robot.serial.localeCompare(idr)) {
   if (cmd.localeCompare('unlock') == 0) {
     robot_locked = false;
     robotLog('robot unlocked');
   } else if (cmd.localeCompare('lock') == 0) {
     robot_locked = true;
     robotLog('robot locked');
   } else if (cmd.localeCompare('cancel') == 0) {
     robotLog('robot cancel mission');
     if (running_mission) cancelMission();
   } else if (cmd.localeCompare('tele') == 0) {
     robotLog('tele#'+msn[3]);
   } else {
     robotLog('invalid command');
   }
 } else {
   robotLog(idr+'#invalid robot');
 }
});

// create topic to publish mission execution log
var mission_log = new ROSLIB.Topic({
  ros : ros,
  name : '/mission_log',
  messageType : 'std_msgs/String'
});

// helper function to use in condition ... return distance from goal location
function distanceFromLocation(location) {
  var distance = 1000.0;
  var found = false;
  var x = 0.0;
  var y = 0.0;
  var z = 0.0;
  var gid = '';
  for (let goal of current_map.goals) {
    if (goal.name.localeCompare(location) == 0) {
      found = true;
      x = goal.x;
      y = goal.y;
      z = goal.z;
      gid = goal._id;
    }
  }
  if (found ) {
    console.log('pose x: '+pose.position.x);
    console.log('pose y: '+pose.position.y);
    console.log('x: '+x);
    console.log('y: '+y);
    var difx = pose.position.x - x;
    var dify = pose.position.y - y;
    distance = Math.sqrt( difx*difx + dify*dify);
  }
  console.log('distance from goal: '+distance);
  return(distance);
}

// helper function to to get goal type of a location
function goalType(location) {
  var found = false;
  var type = -1;
  for (let goal of current_map.goals) {
    if (goal.name.localeCompare(location) == 0) {
      found = true;
      type = goal.type;
    }
  }
  if (found ) {
    console.log('goal type: '+type);
  } else {
    console.log('goal not found: '+type);
  }
  return(type);
}

// helper function ... returns battery level in percentage 0-100
function batteryLevel() {
  return(current_battery_capacity);
}

// helper function ... returns if the robot is recharging
function isRecharging() {
  return(current_hardware.st_Ros_Recharge_On);
}

// helper function ... returns if the robot has bumped against something
function isBumped() {
  return(current_hardware.st_Ros_BumpFront || app.current_hardware.st_Ros_BumpRear);
}
// helper function ... returns if the robot is the emergency button is pressed
function isEmergency() {
  return(current_hardware.st_Ros_Emergenza);
}

// sleep using premises in milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// robot log helper function
function robotLog(text) {
  var user = 'anonymous';
  if (user_id != '')
    user = user_id;
  if (robot != null) {
    var ttext = robot.serial +'#'+user+'#'+text;
    var message = new ROSLIB.Message({data: ttext});
    mission_log.publish(message);
    console.log('robotLog: '+text);
  }
}

// mission log helper function
function missionLog(text) {
  var ttext = robot_id+'#'+user_id+'#'+current_mission.name+'#'+text;
  var message = new ROSLIB.Message({data: ttext});
  mission_log.publish(message);
  console.log('missionLog: '+text);
}

// stops mission execution and sets error status and log message
function missionError(text) {
  var ttext = robot_id+'#'+user_id+'#'+current_mission.name+'#'+text;
  running_mission = false;
  running_mission_error = true;
  var message = new ROSLIB.Message({data: ttext});
  mission_log.publish(message);
  console.log('missionError: '+text);
}

// activates a play audio via service call the audio file path is passed as parameter
// if isTask set current mission status when completed
function playAudio(audioFilePath,isTask) {
  if (ros != null) {
    var service = new ROSLIB.Service({
      ros : ros,
      name : '/play_audio',
      serviceType : 'jobot_msgs/set_string'
    });
    var request = new ROSLIB.ServiceRequest({
      data: audioFilePath
    });
    if (isTask) {
      service.callService(request, function(result) {
        console.log('Result for service call for play audio '+audioFilePath+': '+result);
        current_mission_task_status = 1;
        return(result);
      });
    } else {
      service.callService(request, function(result) {
        console.log('Result for service call for play audio '+audioFilePath+': '+result);
        return(result);
      });
    }
  }
}
// activates the tts interface via service call ... the text is passed as parameter
// if isTask set current mission status when completed
function sayText(text,isTask) {
  if (ros != null) {
    var service = new ROSLIB.Service({
      ros : ros,
      name : '/say_text',
      serviceType : 'jobot_msgs/set_string'
    });
    var request = new ROSLIB.ServiceRequest({
      data: text
    });
    if (isTask) {
      service.callService(request, function(result) {
        console.log('Result for service call for say text '+text+': '+result);
        current_mission_task_status = 1;
        return(result);
      });
    } else {
      service.callService(request, function(result) {
        console.log('Result for service call for say text '+text+': '+result);
        return(result);
      });
    }
  }
}

// play audio executor
function execPlayAudio(par) {
  console.log('executing audio: '+par);
  var result = playAudio(par,true);
  console.log('audio call: completed '+par);
}
// text to speack (say) action executor
function execSayText(par) {
  console.log('executing say: '+par);
  var result = sayText(par,true);
  console.log('say call: completed '+par);
}

// text to speack (say) action executor
function execMap(par) {
  console.log('executing map: '+par);
  if (loadMap(par)) {
    current_mission_task_status = 1;
  } else {
    current_mission_task_status = 2;
  }
  console.log('map call: completed '+par);
}

function loadMap(name) {
  console.log('laodMap: '+name);
  const map_name = name;
  const exec = child_process.exec;
  var mycommand = '/util/scripts/load-map '+map_name;
  console.log(mycommand);
  const command = mycommand;
  var done = false;
  exec(command, function(error, stdout, stderr) {
      console.log('laodMap start');
      if (error) {
          console.log('laodMap error:'+error);
          done = false;
      } else {
          console.log('laodMap end');
          done = true;
      }
  });
  return done;
}

// executing tele control actions
function execTele(par) {
  console.log('executing tele: '+par);
  var pars = par.split(':');
  if (pars.length == 2) {
    robotLog('tele#'+par);
    current_mission_task_status = 1;
  } else {
    current_mission_task_status = 2;
  }
  console.log('exec tele: completed '+par);
}

// subscribe to get the current workflow and monitor workflow action completion status
function currentWorkflow() {
  if (ros != null) {
    workflow_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/current_workflow_name',
      messageType : 'std_msgs/String'
    });
    workflow_topic.subscribe(function(message) {
      current_workflow_name = message.data;
      // console.log('current workflow name '+current_workflow_name);
      if (running_mission_workflow) {
        var workflowName = current_mission_par;
        if (workflowName.localeCompare(message.data) == 0) {
          running_mission_workflow = false;
          current_mission_task_status = 1;
          console.log('workflow: completed '+workflowName)
        } else {
          console.log('workflow: '+workflowName+' <> '+current_workflow_name);
        }
      }
    });
  }
}
// subscribe to get current battery voltage
function currentBatteryVoltage() {
  if (ros != null) {
     battery_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/battery',
      messageType : 'jobot_msgs/battery'
    });
    battery_topic.subscribe(function(message) {
      current_battery_voltage = message.level;
    });
  }
}
// subscribe to get current battery capacity
function currentBatteryCapacity() {
  if (ros != null) {
     battery_capacity_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/battery_capacity',
      messageType : 'std_msgs/Int16'
    });
    battery_capacity_topic.subscribe(function(message) {
      current_battery_capacity = message.data;
    });
  }
}
// subscribe to get current robot hardware status
function currentHardware() {
  if (ros != null) {
     hardware_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/hardware_status',
      messageType : 'jobot_msgs/hardware_status'
    });
    hardware_topic.subscribe(function(message) {
      current_hardware = message;
    });
  }
}

// activates the action client to monitor navigation goal execution
function setDockingClient() {
  if (ros != null) {
    docking_action_client = new ROSLIB.ActionClient({
        ros: ros,
        serverName: '/docking_controller',
        actionName: 'jobot_charger_autodock/dockingAction'
    });
    docking_action_result_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/docking_controller/result',
      messageType : 'jobot_charger_autodock/dockingActionResult'
    });
    docking_action_result_topic.subscribe(function(message) {
      // console.dir(message);
      var result = message.result.result;
      var success = message.result.success;
      var code = message.status.status;
      var status = message.status.text;
      var message = 'Result '+result+' | Success: '+success+' | Status: '+status+' ('+code+')';
      console.log('docking: '+message);
      current_docking = message;
      // docking_goal.cancel();
      if (running_mission_docking) {
        if (success) {
          running_mission_docking = false;
          console.log('docking: completed '+current_mission_par);
          current_mission_task_status = 1;
        } else {
          running_mission_docking = false;
          console.log('docking: not completed '+current_mission_par);
          current_mission_task_status = 2;
        }
      }
    });
  }
}
// sends a docking goal sent from the mission interface
function sendActionDock(command) {
  if (ros != null) {
    console.log('sendActionDock: '+command);
    var d = new Date();
    var s = d.getSeconds();
    var u = d.getMilliseconds();
    docking_goal = new ROSLIB.Goal({
        actionClient: docking_action_client,
        goalMessage: {
            dock: command
        }
    });
    docking_goal.on('status', (status) => {
        docking_action.status = status;
    });
    docking_goal.on('feedback', (feedback) => {
        docking_action.feedback = feedback
    });
    docking_goal.on('result', (result) => {
        docking_action.result = result;
    });
    docking_goal.send();
    console.log('sendActionDock: goal sent');
  }
}
// cancels a docking goal sent from the mission interface
function cancelActionDock() {
    docking_goal.cancel()
}

// activates and deactivates follow me behaviour via service call
function followAction(par) {
  if (ros != null) {
    var service = new ROSLIB.Service({
      ros : ros,
      name : '/toggle_followme',
      serviceType : 'std_srvs/SetBool'
    });
    console.log('followme: '+par);
    var cmd = par;
    var request = new ROSLIB.ServiceRequest({
      data: cmd
    });
    service.callService(request, function(result) {
      console.log('Result for follow me call '+cmd);
      console.log('Success: '+result.success+' Message: '+result.message);
    });
  }
}

// subscribes to the pose topic and moves the jobot icon in the map
function setPoseTracker() {
  if (ros != null) {
    pose_topic = new ROSLIB.Topic({
      ros: ros,
      name: '/tracked_pose',
      messageType: 'geometry_msgs/PoseStamped'
    });
    pose_topic.subscribe(function(message) {
      pose.position = message.pose.position;
      pose.orientation = message.pose.orientation;
      pose.rotation = new THREE.Euler().setFromQuaternion( pose.orientation, "XYZ" );
      var difx = pose.position.x - action.aux.x;
      var dify = pose.position.y - action.aux.y;
      robot_goal_distance = Math.sqrt( difx*difx + dify*dify);
    });
  }
}

function currentStatus() {
  currentWorkflow();
  currentBatteryVoltage();
  currentBatteryCapacity();
  currentHardware();
  setPoseTracker();
  setDockingClient();
  setActionClient();
  current_status = true;
}
// stops the current status update
function currentStatusStop() {
  if (workflow_topic != null)
    workflow_topic.unsubscribe();
  if (battery_capacity_topic != null)
    battery_capacity_topic.unsubscribe();
  if (battery_topic != null)
    battery_topic.unsubscribe();
  if (hardware_topic != null)
    hardware_topic.unsubscribe();
  if (pose_topic != null)
    pose_topic.unsubscribe();
  if (docking_action_result_topic != null)
    docking_action_result_topic.unsubscribe();
  if (action_result_topic != null)
    action_result_topic.unsubscribe();
  current_status = false;
}

currentStatus();

function workflowAction(par) {
  if (ros != null) {
    var service = new ROSLIB.Service({
      ros : ros,
      name : '/change_workflow',
      serviceType : 'jobot_msgs/set_string'
    });
    var workflowName = par;
    console.log('workflowAction: workflow '+workflowName);
    var request = new ROSLIB.ServiceRequest({
      data: workflowName
    });
    service.callService(request, function(result) {
      console.log('Result for service call on '+workflowName);
      console.log(result);
    });
  }
}
// activates a vision control action via service call
function visionAction(par) {
  if (ros != null) {
    var service = new ROSLIB.Service({
      ros : ros,
      name : '/depthai_control',
      serviceType : 'jobot_msgs/set_string'
    });
    console.log('vison: '+par);
    var request = new ROSLIB.ServiceRequest({
      data: par
    });
    service.callService(request, function(result) {
      console.log('Result for vision call '+result);
      current_mission_task_status = 1;
    });
  }
}


function autoDock(action) {
  console.log('autoDock: start '+action);
  if (action.localeCompare('undock') == 0) {
    sendActionDock(false);
  } else if (action.localeCompare('dock') == 0) {
    sendActionDock(true);
  } else if (action.localeCompare('cancel') == 0) {
    cancelActionDock();
  } else {
    console.log('autoDock: wrong command');
  }
  console.log('autoDock: end '+action);
}

// waits action executor pars seconds
async function execWait(par) {
  console.log('executing wait: '+par);
  var towait = parseInt(par)*1000;
  await sleep(towait);
  console.log('wait: current waited '+towait);
  current_mission_task_status = 1;
}

// followme action executor
function execFollowMe(par) {
  console.log('executing followme: '+par);
  if (par.localeCompare('on') ==0) {
    followAction(true);
  } else {
    followAction(false);
  }
  console.log('executed followme: '+par);
  current_mission_task_status = 1;
}

// goto action executor
function execGoto(par) {
  console.log('executing goto: '+par);
  var idx = -1;
  for (let i = 0; i < current_mission.tasks.length; i++) {
    if (current_mission.tasks[i].label.localeCompare(par) == 0) {
      idx = i;
      break;
    }
  }
  if (idx >= 0) {
    current_mission_task = idx;
    current_mission_task_status = -1;
  } else {
    console.log('goto: label not found '+par);
    current_fallback_action = '';
    current_mission_task_status = 2;
  }
}

// move action executor
function execMove(par) {
  console.log('executing move: '+par);
  var pars = par.split(':');
  if (pars.length == 2) {
    var h = parseFloat(pars[0]);
    var v = parseFloat(pars[1]);
    if (isNaN(h) || isNaN(v) || (h < -0.5) || (h > 0.5) || (v < -0.5) || (v > 0.5)) {
      console.log('move: error '+par);
      current_mission_task_status = 2;
    } else {
      sendMove(h,v);
      console.log('move: done '+par);
      current_mission_task_status = 1;
    }
  } else {
    console.log('move: error '+par);
    current_mission_task_status = 2;
  }
}

// velocoty action executor
function execVelocity(par) {
  console.log('velocity: started '+par);
  var pars = par.split(':');
  if (pars.length == 2) {
    var x = parseFloat(pars[0]);
    var z = parseFloat(pars[1]);
    if (isNaN(x) || isNaN(z) || (x < -0.5) || (x > 0.5) || (z < -0.5) || (z > 0.5)) {
      console.log('velocity: error '+par);
      current_mission_task_status = 2;
    } else {
      sendVelocity(x,z);
      console.log('velocity: done '+par);
      current_mission_task_status = 1;
    }
  } else {
    console.log('velocity: error '+par);
    current_mission_task_status = 2;
  }
}

// sends a movement command using the cmd_vel interface
function sendVelocity(x,z) {
  if (ros != null) {
    var cmdVel = new ROSLIB.Topic({
         ros : ros,
         name : '/cmd_vel',
         messageType : 'geometry_msgs/Twist'
       });
    var twist = new ROSLIB.Message({
         linear : {
           x : 0.0,
           y : 0.0,
           z : 0.0
         },
         angular : {
           x : 0.0,
           y : 0.0,
           z : 0.0
         }
      });
    twist.linear.x = x;
    twist.angular.z = z;
    cmdVel.publish(twist);
  }
}

// used by the move action
function sendMove(h,v) {
  joystick.vertical = h;
  joystick.horizontal = v;
  sendCommand();
}

// sends a movement command using the joystick interface
function sendCommand() {
  if (ros != null) {
    var topic = new ROSLIB.Topic({
        ros: ros,
        name: '/joy',
        messageType: 'sensor_msgs/Joy'
    });
    var message = new ROSLIB.Message({
        axes: [-2*joystick.horizontal, 0.0, 0.0, 2*joystick.vertical, 0.0, 0.0],
        buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });
    topic.publish(message);
  }
}

// workflow action executor
function execWorkflow(par) {
  console.log('executing workflow: '+par);
  if (current_workflow_name.localeCompare(par) != 0) {
    running_mission_workflow = true;
    workflowAction(par);
    current_mission_task_status = 0;
  } else {
    console.log('workflow: completed '+current_mission_par);
    current_mission_task_status = 1;
  }
}
// docking action executor
function execDocking(par) {
  console.log('executing docking: '+par);
  if ((par.localeCompare('dock')==0) || (par.localeCompare('undock')==0) || (par.localeCompare('cancel')==0)) {
    running_mission_docking = true;
    autoDock(par);
    console.log('docking: launched '+current_mission_par);
    current_mission_task_status = 0;
  } else {
    console.log('docking: completed wrong parameter '+par);
    current_mission_task_status = 2;
  }
}
// vision action executor
function execVision(par) {
  console.log('executing vision: '+par);
  visionAction(par);
  console.log('vision: completed '+par);
  current_mission_task_status = 0;
}

// detection action executor
function execDetect(par) {
  console.log('executing detect: '+par);
  // target:action:par:delay
  var pars = par.split(':');
  if (pars.length != 4) {
    console.log('detect: error '+par);
    current_mission_task_status = 2;
  } else {
    oak_detections_target = pars[0];
    oak_detected_action = pars[1];
    oak_detected_action_pars = pars[2];
    oak_detected_delay = parseInt(pars[3])*1000;
    oak_detected_target = false;
    oak_detected_when = Date.now();
    setOak();
    console.log('detect: completed '+par);
    current_mission_task_status = 1;
  }
}

// activates the Oak camera detections stream
function setOak() {
  if (ros != null) {
    console.log('setOak');
    oak_detections_topic = new ROSLIB.Topic({
      ros: ros,
      name: '/depthai_detections',
      messageType: 'std_msgs/String'
    });
    oak_detections_topic.subscribe(function(message) {
      oak_detections = JSON.parse(message.data);
      // [] detections [{detection_x,detection_y,detection_z,min_x,min_y,max_x,max_y,label_index,confidence,name}]
      oak_detections.filter((a) => { return (a.name.localeCompare(oak_detections_target) == 0); });
      oak_detections.sort((a, b) => { return a.confidence - b.confidence; });
      // console.log(app.oak_detections);
      if (oak_detections.length > 0) {
        console.log(oak_detections);
        oak_detected_target = true;
        oak_detected_name = oak_detections[0].name;
        oak_detected_confidence = oak_detections[0].confidence;
        oak_detected_x = oak_detections[0].detection_x;
        oak_detected_y = oak_detections[0].detection_y;
        oak_detected_z = oak_detections[0].detection_z;
        oak_detected_area = (oak_detections[0].max_x - oak_detections[0].min_x) * (oak_detections[0].max_y - oak_detections[0].min_y);
      } else {
        oak_detected_target = false;
        oak_detected_name = '---';
      }
      if (oak_detected_target) {
          whenDetected();
      }
    });
  }
}

function unsetOak() {
  oak_detections_target = '';
  oak_detected_action = '';
  oak_detected_action_pars = '';
  oak_detected_delay = 0;
  oak_detected_target = false;
  oak_detected_when = null;
  oak_detections = null;
  oak_detected_name = '';
  oak_detected_confidence = 0;
  oak_detected_x = 0;
  oak_detected_y = 0;
  oak_detected_z = 0;
  oak_detected_area = 0;
  if (oak_detections_topic != null)
    oak_detections_topic.unsubscribe();
}

// completes the detection action execution, when detection message is received handles the response action
function whenDetected() {
  oak_detected_target = false;
  var now = Date.now();
  if (now - oak_detected_when > oak_detected_delay) {
    if (oak_detected_action.localeCompare('audio') == 0) {
      console.log('detected target: playing audio '+oak_detected_action_pars);
      playAudio(oak_detected_action_pars,false);
    } else if (oak_detected_action.localeCompare('say') == 0) {
      console.log('detected target: saying text '+oak_detected_action_pars);
      sayText(oak_detected_action_pars,false);
    } else if (oak_detected_action.localeCompare('eval') == 0) {
      console.log('detected target: evaluating '+oak_detected_action_pars);
      eval(oak_detected_action_pars);
    }
    oak_detected_when = Date.now();
  }
}

// navigation goal executor ... completed by goal topic
function execGoal(par) {
  console.log('executing navigation goal: '+par);
  console.log('goal: started '+par);
  var found = false;
  var x = 0.0;
  var y = 0.0;
  var z = 0.0;
  var gid = '';
  for (let goal of current_map.goals) {
    if (goal.name == par) {
      console.log('goal: '+par+' found ('+goal.x+','+goal.y+','+goal.z+')');
      found = true;
      x = goal.x;
      y = goal.y;
      z = goal.z;
      gid = goal._id;
    }
  }
  if (found ) {
    console.log('goal: found ('+x+','+y+','+z+')');
    action.aux.x = x;
    action.aux.y = y;
    action.aux.z = z;
    running_mission_goal = true;
    current_event.goal = gid;
    current_action_start = Date.now();
    sendActionGoal();
    current_event.distance = robot_goal_distance;
  } else {
    current_mission_task_status = 2;
    console.log('goal: completed '+par+' not found!');
  }
}

// sends a navigation goal sent from the mission interface
function sendActionGoal() {
  if (ros != null) {
    let z = new THREE.Euler(0, 0, action.aux.z, 'XYZ');
    let oz = new THREE.Quaternion();
    oz.setFromEuler(z);
    action.goal.pose.position.x = action.aux.x;
    action.goal.pose.position.y = action.aux.y;
    action.goal.pose.position.z = 0;
    action.goal.pose.orientation.x = oz.x;
    action.goal.pose.orientation.y = oz.y;
    action.goal.pose.orientation.z = oz.z;
    action.goal.pose.orientation.w = oz.w;
    console.log(action.goal.pose.position.x,action.goal.pose.position.y,action.goal.pose.position.z);
    console.log(action.goal.pose.orientation.x,action.goal.pose.orientation.y,action.goal.pose.orientation.z, action.goal.pose.orientation.w);
    var d = new Date();
    var s = d.getSeconds();
    var u = d.getMilliseconds();
    goal = new ROSLIB.Goal({
        actionClient: action_client,
        goalMessage: {
          target_pose : {
                    header : {
                      seq : 0,
                      stamp: {
                        secs: s,
                        nsecs: u
                      },
                      frame_id : 'map'
                    },
                    pose : action.goal.pose
                  }
        }
    });
    goal.on('status', (status) => {
        action.status = status;
    });
    goal.on('feedback', (feedback) => {
        action.feedback = feedback
    });
    goal.on('result', (result) => {
        action.result = result;
    });
    goal.send();
    console.log('sendActionGoal: goal sent');
  }
}

// cancels a navigation goal sent from the mission interface
function cancelActionGoal() {
    goal.cancel();
}

// activates the action client to monitor navigation goal execution
function setActionClient() {
  if (ros != null) {
    action_client = new ROSLIB.ActionClient({
        ros: ros,
        serverName: '/move_base',
        actionName: 'move_base_msgs/MoveBaseActionGoal'
    });
    action_result_topic = new ROSLIB.Topic({
      ros : ros,
      name : '/move_base/result',
      messageType : 'move_base_msgs/MoveBaseActionResult'
    });
    action_result_topic.subscribe(function(message) {
      console.log('action result');
      console.dir(message);
      var status = message.status.status;
      console.log('result status'+status);
      // action_client.cancel();
      if (running_mission_goal) {
          running_mission_goal = false;
          current_event.start = current_action_start;
          current_event.end = Date.now();
          current_event.action = 'goal';
          current_event.parameters = current_mission_par;
          current_event.result = status;
          sendEvent();
          if (status > 0 && status < 4) {
            console.log('goal: completed with success '+current_mission_par);
            current_mission_task_status = 1;
          } else {
            console.log('goal: completed with error code '+status);
            current_mission_task_status = 2;
          }
      }
    });
  }
}

async function runMission() {
  console.log('executing run mission');
  running_mission = true;
  running_mission_error = false;
  running_mission_goal = false;
  running_mission_workflow = false;
  running_mission_docking = false;
  current_mission_task = 0;
  current_mission_par = '';
  current_mission_task_status = -1; // -1, 0, 1, 2 (not started, started, finished success, finished error)
  current_mission_start = Date.now();
  unsetOak();
}

// cancels a mission
function cancelMission() {
  console.log('executing cancel mission');
  var cmt = current_mission_task;
  var cmtl = current_mission.tasks.length - 1;
  running_mission = false;
  running_mission_error = false;
  running_mission_goal = false;
  running_mission_workflow = false;
  running_mission_docking = false;
  unsetOak();
  current_mission_task = 0;
  current_mission_par = '';
  current_mission_task_status = -1;
  current_event.start = current_mission_start;
  // setting mission cancel event
  current_event.end = Date.now();
  current_event.action = 'mission';
  current_event.goal = '000000000000000000000000';
  current_event.parameters = '';
  current_event.distance = 0;
  current_event.result = 2;
  sendEvent();
  missionLog('runtask: run mission cancelled with success: '+cmt+'/'+cmtl);
}

// loads a mission ready to be executed
function loadMission(midx) {
  console.log('loadMission:'+midx);
  console.log(robot.missions[midx].name);
  current_event.mission = robot.missions[midx]._id;
  current_mission.name = robot.missions[midx].name;
  console.log(robot.missions[midx].tasks);
  const lines = robot.missions[midx].tasks.split(";");
  var el = '';
  current_mission.tasks.splice(0,current_mission.tasks.length);
  console.log('lines'+lines.length);
  for (var i = 0; i < lines.length - 1; i++) {
      var line = lines[i].split(",");
      if (line.length != 6) {
        el = el + '['+i.toString() + '] wrong structure \n';
      } else if (
          line[2].localeCompare('wait') != 0 &&
          line[2].localeCompare('goto') != 0 &&
          line[2].localeCompare('sub') != 0 &&
          line[2].localeCompare('end') != 0 &&
          line[2].localeCompare('call') != 0 &&
          line[2].localeCompare('move') != 0 &&
          line[2].localeCompare('velocity') != 0 &&
          line[2].localeCompare('goal') != 0 &&
          line[2].localeCompare('eval') != 0 &&
          line[2].localeCompare('vision') != 0 &&
          line[2].localeCompare('detect') != 0 &&
          line[2].localeCompare('followme') != 0 &&
          line[2].localeCompare('say') != 0 &&
          line[2].localeCompare('map') != 0 &&
          line[2].localeCompare('tele') != 0 &&
          line[2].localeCompare('workflow') != 0 &&
          line[2].localeCompare('docking') != 0 &&
          line[2].localeCompare('audio') != 0 ) {
            el = el + '['+i.toString() + '] wrong command \n';
      } else {
          current_mission.tasks.push(
            { label: line[0].replace(/\s+/g, ' ').trim(),
              condition: line[1].replace(/\s+/g, ' ').trim(),
              type: line[2].replace(/\s+/g, ' ').trim(),
              parameters: line[3].replace(/\s+/g, ' ').trim(),
              timeout: line[4].replace(/\s+/g, ' ').trim(),
              fallback: line[5].replace(/\s+/g, ' ').trim()
            });
      }
  }
  if (el != '') {
    console.log('loadMission error in lines '+el);
  } else {
    console.log('loadMission ok');
  }
  console.log('loadMission load completed');
}

async function sendEvent() {
  const event = new Event(current_event);
  await event.save();
}

// If At <> 0 will be executed at that date; If At == 0 will be executed only once
// If Repeat <> 0 will be rescheduled after mins minutes
async function updateSchedule(scheduleidx) {
  console.log('updateSchedule started: '+scheduleidx);
  var schedId = robot.schedules[scheduleidx]._id;
  console.log('updateSchedule schedID: '+schedId);
  if (robot.schedules[scheduleidx].repeat > 0) {
    console.log('old at'+robot.schedules[scheduleidx].at);
    robot.schedules[scheduleidx].at.setTime(robot.schedules[scheduleidx].at.getTime() + robot.schedules[scheduleidx].repeat*60000);
    console.log('new at'+robot.schedules[scheduleidx].at);
    await Schedule.findByIdAndUpdate(schedId, { at: robot.schedules[scheduleidx].at } );
  } else {
    robot = await Robot.findByIdAndUpdate(robot_id, { $pull: { schedules: schedId } });
    await Schedule.findByIdAndDelete(schedId);
  }
  console.log('updateSchedule completed: '+scheduleidx);
}

// main function of the mission controller ... traverse behavioural tree sequence
function runTasks() {
  var cmtl = current_mission.tasks.length - 1;
  missionLog('runtask: ['+current_mission_task+'/'+cmtl+']('+current_action_timeout_magin+')');
  if (current_mission_task_status < 0 ) { // execute the action
    current_mission_task_status = 0;
    launchTask();
  } else if (current_mission_task_status > 1) { // mission completed error
    unsetOak();
    if (current_fallback_action != '')
      execGoto(current_fallback_action);
    else {
      running_mission = false;
      current_event.start = current_mission_start;
      // setting mission completed event
      current_event.end = Date.now();
      current_event.action = 'mission';
      current_event.goal = '000000000000000000000000';
      current_event.parameters = '';
      current_event.distance = 0;
      current_event.result = 2;
      sendEvent();
      missionError('runtask: mission completed with error: '+current_mission_task+'/'+cmtl);
    }
  } else if (current_mission_task_status > 0) { // task completed with success
    if (current_mission_task >= current_mission.tasks.length - 1) { // mission complete with success
      unsetOak();
      running_mission = false;
      current_event.start = current_mission_start;
      // setting mission completed event
      current_event.end = Date.now();
      current_event.action = 'mission';
      current_event.goal = '000000000000000000000000';
      current_event.parameters = '';
      current_event.distance = 0;
      current_event.result = 1;
      sendEvent();
      missionLog('runtask: run mission completed with success: '+current_mission_task+'/'+cmtl);
    } else {
      current_mission_task = current_mission_task + 1;
      current_mission_task_status = -1;
    }
  } else { // action == 0 check timeout and if expired mission failed
    checkTimeout();
  }
}

// checks timeout and in case activates the fallback action if present ... if not task fails
function checkTimeout() {
  var now = Date.now();
  current_action_timeout_magin = (now - current_action_timeout)/1000.0;
  if (now > current_action_timeout) {
  // if (current_action_timeout_magin > 0) {
    running_mission_goal = false;
    running_mission_workflow = false;
    running_mission_docking = false;
    if (current_fallback_action != '')
      execGoto(current_fallback_action);
    else
      current_mission_task_status = 2;
  }
}

function launchTask() {
    spec = current_mission.tasks[current_mission_task];
    current_action_start = Date.now();
    console.log('launchTask ['+current_mission_task+'] lbl:['+spec.label+'] cond:['+spec.condition+'] type:['+spec.type+'] pars:['+spec.parameters+'] tout:['+spec.timeout+'] flb:['+spec.fallback+']');
    // if pars start with @ it is a variable and we get the value
    if (spec.parameters.startsWith('@')) {
      spec.parameters = eval(spec.parameters.substring(1));
    }
    if (spec.parameters.startsWith('#')) {
      spec.parameters = current_parameters_values[parseInt(spec.parameters.substring(1))];
    }
    var condition = true;
    if (spec.condition != '') {
      if (spec.condition.indexOf('#') >= 0) {
        var newspec = '';
        var si = spec.condition.indexOf('#');
        var id = parseInt(spec.condition.substring(si+1,si+2));
        newspec = spec.condition.substring(0,si)+current_parameters_values[id]+spec.condition.substring(si+2);
        condition = eval(newspec);
        console.log('launchTask evaluated condition '+newspec+' as '+condition);
      } else {
        condition = eval(spec.condition);
        console.log('launchTask evaluated condition '+spec.condition+' as '+condition);
      }
    }
    if (spec.timeout != '') {
      var delta = parseInt(spec.timeout);
      if (!isNaN(delta))
        current_action_timeout = current_action_start + delta*1000;
    } else current_action_timeout = current_action_start + 10000;
    current_fallback_action = spec.fallback;
    if (condition) { // the action is executed if condition is true
      current_mission_par = spec.parameters;
      if (spec.type.localeCompare('wait') == 0)
        execWait(spec.parameters);
      else if (spec.type.localeCompare('goto') == 0)
        execGoto(spec.parameters);
      else if (spec.type.localeCompare('move') == 0)
        execMove(spec.parameters);
      else if (spec.type.localeCompare('velocity') == 0)
        execVelocity(spec.parameters);
      else if (spec.type.localeCompare('workflow') == 0)
        execWorkflow(spec.parameters);
      else if (spec.type.localeCompare('audio') == 0)
        execPlayAudio(spec.parameters);
      else if (spec.type.localeCompare('followme') ==0)
        execFollowMe(spec.parameters);
      else if (spec.type.localeCompare('say') == 0)
        execSayText(spec.parameters);
      else if (spec.type.localeCompare('map') == 0)
        execMap(spec.parameters);
      else if (spec.type.localeCompare('tele') == 0)
        execTele(spec.parameters);
      else if (spec.type.localeCompare('goal') == 0)
        execGoal(spec.parameters);
      else if (spec.type.localeCompare('vision') == 0)
        execVision(spec.parameters);
      else if (spec.type.localeCompare('detect') == 0)
        execDetect(spec.parameters);
      else if (spec.type.localeCompare('docking') == 0)
        execDocking(spec.parameters);
      else if (spec.type.localeCompare('eval') == 0) {
        console.log('eval: called '+spec.parameters);
        eval(spec.parameters);
        console.log('eval: completed '+spec.parameters);
        current_mission_task_status = 1;
      } else if (spec.type.localeCompare('sub') == 0) { // start sub
        if (current_subroutine_return <= 0) { // sub declaration
          current_subroutines.push({ name: spec.parameters, start: current_mission_task});
          current_mission_task = current_mission_task + 1;
          while (current_mission.tasks[current_mission_task].type.localeCompare('end') != 0)
            current_mission_task = current_mission_task + 1;
          current_mission_task_status = 1;
        } else {
          current_mission_task_status = 1;
        }
      } else if (spec.type.localeCompare('end') == 0) { // end sub return
         current_mission_task = current_subroutine_return;
         current_subroutine_return = 0;
         current_mission_task_status = 1;
      } else if (spec.type.localeCompare('call') == 0) {
        if (current_subroutine_return <= 0) { // execute sub
          var subid = -1;
          for (var i = 0; i < current_subroutines.length; i++) {
            if (current_subroutines[i].name.localeCompare(spec.parameters) == 0)
              subid = i;
          }
          if (subid >= 0) {
            current_subroutine_return = current_mission_task;
            current_mission_task = current_subroutines[subid].start;
            current_mission_task_status = 1;
          } else {
            console.log('launchTask runtime error call not found#'+current_mission_task);
            current_mission_task_status = 2;
          }
        } else { // error nested call
          console.log('launchTask runtime error nested call at line#'+current_mission_task);
          current_mission_task_status = 2;
        }
      } else {
        console.log('launchTask unknown type '+spec.type);
        current_mission_task_status = 2;
      }
    } else {
      current_mission_task_status = 1;
    }
}

async function getRobot() {
  // getting robot info from db
  if (robot_id != '') {
    robot = await Robot.findById(robot_id).populate(['missions','schedules']);
    if (robot == null)
      console.log('cannot find robot:'+robot_id);
    else {
      ;
    }
  }
}

function getMap() {
  let filepath = '';
  filepath = 'public/maps/map.json';
  fs.readFile(filepath, (error, data) => {
    // console.log('getMap start file: '+filepath);
    if (error) {
      console.log('getMap error:'+error);
    } else {
      current_map = JSON.parse(data);
      // console.log('getMap end map: '+current_map);
    }
  });
}

async function executeMissionControl() {
  console.log('Executing mission control ...');
  // Sleep in loop
  while (true) {
    getRobot();
    getMap();
    if (running_mission) { // keep running
      runTasks();
    } else if (robot_locked) {
      missionLog('locked ...');
    } else { // check schedule
      if (robot != null) {
        var now = Date.now();
        robot.schedules.sort((a, b) => { return a.at - b.at; });
        for (var i = 0; i < robot.schedules.length; i++) {
          // console.dir(robot.schedules[i]);
          if (robot.schedules[i].at < now) { // expired
            updateSchedule(i);
            for (var j = 0; j < robot.missions.length; j++) { // is mission valid
              if (robot.missions[j].name.localeCompare(robot.schedules[i].mission) == 0) {
                loadMission(j);
                current_subroutines.splice(0,current_subroutines.length);
                current_parameters_values.splice(0,current_parameters_values.length);
                if (robot.schedules[i].parameters != null)
                  current_parameters_values = robot.schedules[i].parameters.split(':');
                current_event.robot = robot_id;
                current_event.user = robot.schedules[i].user._id;
                runMission();
                break;
              }
            }
            break;
          }
        }
      }
    }
    await sleep(1000);
  }
  console.log('Exiting mission control ...');
}

executeMissionControl();
