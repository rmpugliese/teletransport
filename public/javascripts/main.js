// used to save a map in a file
// var contentType = 'image/jpg';
// var b64Data = '/9j/...';
// var blob = b64toBlob(b64Data, contentType);
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;
  var byteCharacters = atob(b64Data);
  var byteArrays = [];
  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);
    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

// helper function to use in condition ... return distance from goal location
function distanceFromLocation(location) {
  var distance = 1000.0;
  var found = false;
  var x = 0.0;
  var y = 0.0;
  var z = 0.0;
  for (let goal of app.current_map.goals) {
    if (goal.name.localeCompare(location) == 0) {
      found = true;
      x = goal.x;
      y = goal.y;
      z = goal.z;
    }
  }
  if (found ) {
    console.log('pose x: '+app.pose.position.x);
    console.log('pose y: '+app.pose.position.y);
    console.log('x: '+x);
    console.log('y: '+y);
    var difx = app.pose.position.x - x;
    var dify = app.pose.position.y - y;
    distance = Math.sqrt( difx*difx + dify*dify);
  }
  console.log('distance from goal: '+distance);
  return(distance);
}

// helper function to to get goal type of a location
function goalType(location) {
  var found = false;
  var type = -1;
  for (let goal of app.current_map.goals) {
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
  return(app.current_battery_capacity);
}

// helper function ... returns if the robot is recharging
function isRecharging() {
  return(app.current_hardware.st_Ros_Recharge_On);
}

// helper function ... returns if the robot has bumped against something
function isBumped() {
  return(app.current_hardware.st_Ros_BumpFront || app.current_hardware.st_Ros_BumpRear);
}
// helper function ... returns if the robot is the emergency button is pressed
function isEmergency() {
  return(app.current_hardware.st_Ros_Emergenza);
}

// helper function ... returns true if the two points are close to
function pointselected(x1, y1, x2, y2) {
  if (Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2)) <= 0.5) {
    return true;
  } else {
    return false;
  }
}

// helper function ... returns true if point is close to poly [x1,y1,x2,y2,x3,y3,...]
function polyselected(x1, y1, p) {
  var res = false;
  for (let i = 0; i < p.length; i = i + 2) {
    if (pointselected(x1,y1,p[i],p[i+1]))
      res = true;
  }
  return res;
}

// vue app
var app = new Vue({
    el: '#app',
    components: {
      vuejsDatepicker
    },
    // storing the state of the vue app
    data: {
        connected: false,
        ros: null,
        logs: [],
        loading: false,
        isImage: false,
        isImageOnce: false,
        isOak: false,
        isMap: false,
        isStatus: false,
        isTele: false,
        isScreen: false,
        isPose: false,
        isNav: false,
        isTouch: false,
        g2dcontext: null,
        rosbridge_address: '',
        robot_id: '',
        user_id: '',
        robot: {
          missions: [],
          schedules: [],
          telepresences: [],
          destinations: [],
        },
        current_map: {
          map_info: null,
          goals: [],
          vwalls: [],
          zwalls: [],
          vpaths: [],
        },
        mapnames: [],
        selected_map_index: 0,
        map_image: {
          width: 0,
          height: 0
        },
        chatbotfiles: [],
        selected_chatbotfile_index: 0,
        current_chatbotfile_name: '',
        current_chatbotfile: {
          name: '',
          content: '',
        },
        robot_goal_distance: 0,
        robot_goal: { name: '', x: 0, y: 0, z: 0, type: 0},
        selected_date: Date.now(),
        selected_repeat: 0,
        selected_mission: '',
        selected_parameters: '',
        map_file: '',
        map_name: '',
        temporary_goal: false,
        goal: null,
        docking_goal: null,
        action: {
            aux: { x: 0, y: 0, z: 0 },
            goal: { pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 0 } } },
            feedback: { position: 0, state: 'idle' },
            result: { success: false },
            status: { status: 0, text: '' },
        },
        action_client: null,
        docking_action: {
            goal: { },
            feedback: { },
            result: { },
            status: { },
        },
        docking_action_client: null,
        mission: {
          name: '',
          tasks: ''
        },
        selected_mission_index: 0,
        current_mission: {
          name: '',
          tasks: []
        },
        current_mission_task: 0,
        current_mission_par: '',
        running_mission: false,
        running_mission_error: false,
        running_mission_log: '',
        tele_control_message: '',
        running_mission_goal: false,
        running_mission_workflow: false,
        running_mission_docking: false,
        current_mission_parameters: '',
        current_parameters_values: [],
        running_temporary_goal: false,
        // dragging data
        dragging: false,
        x: 'no',
        y: 'no',
        pose: {
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
        },
        dragCircleStyle: {
            margin: '0px',
            top: '0px',
            left: '0px',
            display: 'none',
            width: '75px',
            height: '75px',
        },
        joystick: {
            vertical: 0,
            horizontal: 0,
        },
        current_workflow_name: '---',
        current_battery_voltage: 0.0,
        current_battery_capacity: 0,
        current_hardware: {
          st_Ros_BumpFront: false,
          st_Ros_BumpRear: false,
          st_Ros_Recharge_On: false,
          st_Ros_Recharge_Ok: false,
          st_Ros_Emergenza: false
        },
        current_docking: '',
        image_topic: null,
        map_topic: null,
        oak_topic: null,
        oak_detections_topic: null,
        oak_detections: null,
        aok_detections_target: '',
        oak_detected_action: '',
        oak_detected_action_pars: '',
        oak_detected_when: null,
        oak_detected_delay: null,
        oak_detected_target: false,
        oak_detected_name: '',
        oak_detected_person_standing: false,
        oak_detected_confidence: 0,
        oak_detected_x: 0,
        oak_detected_y: 0,
        oak_detected_z: 0,
        oak_detected_area: 0,
        pose_topic: null,
        workflow_topic: null,
        battery_topic: null,
        battery_capacity_topic: null,
        hardware_topic: null,
        map_info_topic: null,
        map_update_interval: null,
        image_update_interval: null,
        map_draw_interval: null,
        action_result_topic: null,
        docking_action_result_topic: null,
        mission_control_topic: null,
        mission_log_topic: null,
        current_status: false,
        selected_point_index: 0,
        selected_point_type: 0,
        point_name: '',
        selected_goal_index: -1,
        selected_vwall_index: -1,
        selected_zwall_index: -1,
        selected_vpath_index: -1,
        current_poly: {
          name: '',
          polygon: [],
        },
        poly: false,
        newpoly: false,
        show_history: false,
        markers_history: [],
        marker_history_interval: null,
        map_info: {
          width: 0,
          height: 0,
          resolution: 0,
          origin: {
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            orientation: {
              x: 0,
              y: 0,
              z: 0,
              w: 0,
            },
          }
        },
        // networks: [ { ssid: 'Network', signal: 100 } ],
        networks: [],
        selected_network_index: 0,
        network_ssid: '',
        network_password: '',
        network_mac: '',
        network_ip: '',
        network_name: '',
        current_event: {
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
        },
        current_mission_start: null,
        current_action_start: null,
        current_action_timeout: null,
        current_subroutine_return: 0,
        current_subroutines: [],
        current_action_fallback: '',
        all_events: [],
        events: [],
        // apps variables
        delivery_message: '',
        face_nick_name: '---',
        syscmd_feedback: '---',
        selected_media_index: 0,
        selected_media_type: 0,
        selected_media_name: '',
        media: [],
        draw_face_interval: null,
        selected_telepresence_who: '',
        selected_telepresence_whom: '',
        selected_telepresence_email: '',
        selected_telepresence_where: '',
        selected_telepresence_when: null,
        selected_telepresence_zoom: '',
        selected_telepresence_start: '',
        selected_telepresence_join: '',
        selected_telepresence_slot: '',
        selected_telepresence_duration: 0,
        telepresence_durations: [15,30,45],
        telepresence_slots: ['08','09','10','11','12','14','15','16','17'],
        telepresence_guests: [],
        telepresence_destinations: [],
        conference_window: null,
    },
    // helper methods to connect to ROS
    methods: {
        // this connects to ROS
        connect: function () {
            this.loading = true
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            });
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!');
                this.connected = true;
                this.loading = false;
                // this.setCamera();
                if (this.isImage) this.setCamera();
                if (this.isImageOnce) this.startCamera();
                if (this.isOak) this.setOakAnnotated();
                if (this.isStatus) {
                  this.currentStatus();
                }
                if (this.isScreen) {
                  this.currentStatus();
                  this.playMedium();
                  this.draw_face_interval = setInterval(this.drawFace,1000);
                }
                if (this.isTele) {
                  // this.telecontrol();
                  this.currentStatus();
                }
                if (this.isPose) {
                  this.setPoseTracker();
                  this.setActionClient();
                }
                if (this.isNav) {
                  this.readMapImage();
                  this.readMapInfo();
                  this.map_draw_interval = setInterval(this.showMap,1000);
                }
                if (this.isTouch) {
                  this.readMapInfo();
                }
             });
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
            });
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!');
                this.connected = false;
                this.loading = false;
                this.image_topic = null;
                // document.getElementById('my_image').innerHTML = '';
            });
        },
        // this disconnect from ROS
        disconnect: function () {
          this.ros.close();
          this.goal = null
        },
        remote: function () {
          if (this.robot.connectremoteurl != null)
            this.rosbridge_address = this.robot.connectremoteurl;
        },
        git: function () {
          const url = '/knobots/'+this.robot_id+'/git';
          axios.get( url
          ).then(resp => {
            var gitinfo = resp.data;
            console.log('git: ',gitinfo);
            alert(gitinfo);
          });
        },
        // this gets info about the map occupancy grid from ROS
        getMapInfo: function () {
          console.log('getMapInfo Called');
          if (this.ros != null) {
            this.map_info_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/map',
              messageType: 'nav_msgs/OccupancyGrid'
            });
            this.map_info_topic.subscribe(function(message) {
              app.current_map.map_info = message.info;
              console.log('map_info: width '+app.current_map.map_info.width+' height '+app.current_map.map_info.height+' resolution '+app.current_map.map_info.resolution);
            });
          }
        },
        // this mounts the map image on the page
        setMapDimensions: function () {
            console.log('setMapDimensions Called');
            var img = document.getElementById('my_map');
            this.map_image.width = img.width;
            this.map_image.height = img.height;
        },
        // set graphics context
        getContext: function () {
          console.log('getContext Called');
          var img = document.getElementById("my_map");
          var cnvs = document.getElementById("my_map_canvas");
          cnvs.style.position = "absolute";
          cnvs.style.left = img.offsetLeft + "px";
          cnvs.style.top = img.offsetTop + "px";
          cnvs.width = img.width;
          cnvs.height = img.height;
          this.g2dcontext = cnvs.getContext("2d");
          this.g2dcontext.clearRect(0, 0, cnvs.width, cnvs.height);
          this.g2dcontext.strokeStyle = "#FF0000";
          this.g2dcontext.lineWidth = 4;
        },
        // sets a specific goal coordinates ready to be sent
        setGoal: function() {
          console.log(this.selected_point_index);
          console.log(this.current_map.goals[this.selected_point_index]);
          this.action.aux.x = this.current_map.goals[this.selected_point_index].x;
          this.action.aux.y = this.current_map.goals[this.selected_point_index].y;
          this.action.aux.z = this.current_map.goals[this.selected_point_index].z;
        },
        setPoint: function (event,selectedIndex) {
          this.selected_point_index = selectedIndex;
        },
        setPointType: function (event) {
          this.robot_goal.type = event.target.value;
        },
        // just to select a specific virtual wall
        setVWallIndex: function (event,selectedIndex) {
          this.selected_vwall_index = selectedIndex;
          console.log('setVWallIndex:'+this.selected_vwall_index);
        },
        // just to select a specific zone wall
        setZWallIndex: function (event,selectedIndex) {
          this.selected_zwall_index = selectedIndex;
          console.log('setZWallIndex:'+this.selected_zwall_index);
        },
        // just to select a specific virtual wall
        setVPathIndex: function (event,selectedIndex) {
          this.selected_vpath_index = selectedIndex;
          console.log('setVPathIndex:'+this.selected_vpath_index);
        },
        // just to select a specific goal
        setGoalIndex: function (event,selectedIndex) {
          this.selected_goal_index = selectedIndex;
          console.log('setGoalIndex:'+this.selected_goal_index);
          console.log('setGoalIndex:'+this.current_map.goals[selectedIndex].name);
        },
        // just to select a specific mission
        setMissionIndex: function (event,selectedIndex) {
          this.selected_mission_index = selectedIndex;
          console.log('setMissionIndex:'+this.selected_mission_index);
          this.selected_mission = this.robot.missions[selectedIndex].name;
        },
        // just to select a specific network to configure
        setNetworkIndex: function (event,selectedIndex) {
          this.selected_network_index = selectedIndex;
          this.network_ssid = this.networks[this.selected_network_index];
          console.log('setNetworkIndex:'+selectedIndex);
        },
        // just to select a specific map
        setMapIndex: function(event,selectedIndex) {
          this.selected_map_index = selectedIndex;
          this.map_name = this.mapnames[this.selected_map_index];
          console.log('setMapIndex:'+selectedIndex);
        },
        // just to select a specific media
        setMediaIndex: function(event,selectedIndex) {
          this.selected_media_index = selectedIndex;
          this.selected_media_type = this.media[this.selected_media_index].type;
          this.selected_media_name = this.media[this.selected_media_index].name;
          console.log('setMediaIndex:'+selectedIndex);
        },
        // just to select a specific map
        setChatbotfileIndex: function(event,selectedIndex) {
          this.selected_chatbotfile_index = selectedIndex;
          this.current_chatbotfile_name = this.chatbotfiles[this.selected_chatbotfile_index];
          console.log('setChatbotfileIndex:'+selectedIndex);
        },
        // selects a specific mission
        setMission: function () {
          console.log('setMission:'+this.selected_mission_index);
          this.mission.name = this.robot.missions[this.selected_mission_index].name;
          this.mission.tasks = this.robot.missions[this.selected_mission_index].tasks;
        },
        // loads a mission ready to be executed
        loadMission: function () {
          console.log('loadMission:'+this.selected_mission_index);
          console.log(this.robot.missions[this.selected_mission_index].name);
          this.current_event.mission = this.robot.missions[this.selected_mission_index]._id;
          this.current_mission.name = this.robot.missions[this.selected_mission_index].name;
          console.log(this.robot.missions[this.selected_mission_index].tasks);
          const lines = this.robot.missions[this.selected_mission_index].tasks.split(";");
          var el = '';
          this.current_mission.tasks.splice(0,this.current_mission.tasks.length);
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
                  this.current_mission.tasks.push(
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
            alert('loadMission error in lines '+el);
          } else {
            alert('loadMission ok');
          }
          console.log('loadMission load completed');
        },
        // checks mission syntax
        checkMission: function () {
          console.log('checkMission called');
          const lines = this.mission.tasks.split(";");
          var el = '';
          console.log('lines'+lines.length);
          for (var i = 0; i < lines.length - 1; i++) {
              var line = lines[i].split(",");
              if (line.length != 6)
                el = el + '['+i.toString() + '] wrong structure \n';
              if (line[2].localeCompare('wait') != 0 &&
                  line[2].localeCompare('move') != 0 &&
                  line[2].localeCompare('velocity') != 0 &&
                  line[2].localeCompare('goto') != 0 &&
                  line[2].localeCompare('sub') != 0 &&
                  line[2].localeCompare('end') != 0 &&
                  line[2].localeCompare('call') != 0 &&
                  line[2].localeCompare('goal') != 0 &&
                  line[2].localeCompare('vision') != 0 &&
                  line[2].localeCompare('detect') != 0 &&
                  line[2].localeCompare('eval') != 0 &&
                  line[2].localeCompare('followme') != 0 &&
                  line[2].localeCompare('say') != 0 &&
                  line[2].localeCompare('map') != 0 &&
                  line[2].localeCompare('tele') != 0 &&
                  line[2].localeCompare('workflow') != 0 &&
                  line[2].localeCompare('docking') != 0 &&
                  line[2].localeCompare('audio') != 0 )
                el = el + '['+i.toString() + '] wrong command \n';
          }
          if (el != '') {
            alert('checkMission error in lines '+el);
          } else {
            alert('checkMission ok');
          }
          console.log('checkMission parse completed');
        },
        // adds a mission to the database
        addMission: function () {
          console.log('addMission called');
          this.selected_mission_index = this.robot.missions.length;
          this.robot.missions.push(this.mission);
          var url = '/knobots/'+this.robot_id+'/mission';
          axios.post(url, this.mission
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // saves a mission to the database
        saveMission: function () {
          console.log('saveMission called');
          console.log('saveMission:'+this.selected_mission_index);
          const url = '/knobots/'+this.robot_id+'/mission/'+this.robot.missions[this.selected_mission_index]._id;
          console.log('saveMission:'+url);
          axios.put(url, this.mission
            ).then(resp => {
              this.robot = JSON.parse(resp.data);
              console.log('SUCCESS!!');
            }).catch(function() {
                console.log('FAILURE!!');
            });
        },
        // deletes a mission from the database
        delMission: function () {
          console.log('delMission called');
          console.log('delMission:'+this.selected_mission_index);
          const url = '/knobots/'+this.robot_id+'/mission/'+this.robot.missions[this.selected_mission_index]._id;
          console.log('delMission:'+url);
          axios
            .delete(url)
            .then(resp => {
              this.robot = JSON.parse(resp.data);
              console.log('SUCCESS!!');
            }).catch(function() {
                console.log('FAILURE!!');
            });
        },
        // adds a schedule to the database
        addSchedule: function () {
          console.log('addSchedule called');
          var url = '/knobots/'+this.robot_id+'/sched';
          var sched = {
            robot: this.robot_id,
            user: this.user_id,
            mission: this.robot.missions[this.selected_mission_index].name,
            parameters: this.selected_parameters,
            at: this.selected_date,
            repeat: this.selected_repeat
          };
          axios.post(url, sched
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // saves a schedule to the database
        saveSchedule: function () {
          console.log('saveSchedule called');
          console.log('saveSchedule:'+this.selected_schedule_id);
          const url = '/knobots/'+this.robot_id+'/sched/'+this.selected_schedule_id;
          console.log('saveSched:'+url);
          var sched = {
            robot: this.robot_id,
            user: this.user_id,
            mission: this.robot.missions[this.selected_mission_index].name,
            parameters: this.selected_parameters,
            at: this.selected_date,
            repeat: this.selected_repeat
          };
          axios.put(url, sched
            ).then(resp => {
              this.robot = JSON.parse(resp.data);
              console.log('SUCCESS!!');
            }).catch(function() {
              console.log('FAILURE!!');
            });
        },
        // deletes a schedule from the database
        delSchedule: function () {
          console.log('delSchedule called');
          console.log('delSchedule:'+this.selected_schedule_id);
          const url = '/knobots/'+this.robot_id+'/sched/'+this.selected_schedule_id;
          console.log('delSchedule:'+url);
          axios
            .delete(url)
            .then(resp => {
              this.robot = JSON.parse(resp.data);
              console.log('SUCCESS!!');
            }).catch(function() {
              console.log('FAILURE!!');
            });
        },
        // selects a schedule from the list
        selectSchedule: function(schedule) {
          console.log('selectSchedule called'+schedule._id);
          this.selected_schedule_id = schedule._id;
          this.selected_repeat = schedule.repeat;
          this.selected_date = schedule.at;
          this.selected_parameters = schedule.parameters;
          this.selected_mission = schedule.mission;
          var midx = -1;
          for (var i = 0; i < this.robot.missions.length; i++)
            if (this.robot.missions[i].name.localeCompare(schedule.mission) == 0)
              midx = i;
          if (midx >= 0) {
            console.log('found: '+midx);
            this.selected_mission_index = midx;
          }
        },
        // adds a telepresence session
        setTelepresenceDestinations: function () {
          console.log('setDestinations called');
          var url = '/knobots/'+this.robot_id+'/destinations';
          var dest = this.telepresence_destinations;
          axios.post(url, dest).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // create a telepresence session
        createTelepresence: function () {
          console.log('createTelepresence called');
          var url = '/knobots/'+this.robot_id+'/telepresence';
          this.selected_telepresence_when.setHours(this.selected_telepresence_slot);
          var telepresence = {
            robot: this.robot_id,
            user: this.user_id,
            who: this.selected_telepresence_who,
            where: this.selected_telepresence_where,
            whom: this.selected_telepresence_whom,
            email: this.selected_telepresence_email,
            when: this.selected_telepresence_when,
            duration: this.selected_telepresence_duration,
            zoom: this.selected_telepresence_zoom,
            start: this.selected_telepresence_start,
            join: this.selected_telepresence_join,
          };
          axios.put(url, telepresence
          ).then(resp => {
            telepresence = JSON.parse(resp.data);
            this.selected_telepresence_zoom = telepresence.zoom;
            this.selected_telepresence_start = telepresence.start;
            this.selected_telepresence_join = telepresence.join;
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // adds a telepresence session
        addTelepresence: function () {
          console.log('addTelepresence called');
          var url = '/knobots/'+this.robot_id+'/telepresence';
          this.selected_telepresence_when.setHours(this.selected_telepresence_slot);
          var telepresence = {
            robot: this.robot_id,
            user: this.user_id,
            who: this.selected_telepresence_who,
            where: this.selected_telepresence_where,
            whom: this.selected_telepresence_whom,
            email: this.selected_telepresence_email,
            when: this.selected_telepresence_when,
            duration: this.selected_telepresence_duration,
            zoom: this.selected_telepresence_zoom,
            start: this.selected_telepresence_start,
            join: this.selected_telepresence_join,
          };
          if (! this.telepresence_guests.includes(this.selected_telepresence_whom))
            this.telepresence_guests.push(this.selected_telepresence_whom);
          if (! this.telepresence_destinations.includes(this.selected_telepresence_where))
            this.telepresence_destinations.push(this.selected_telepresence_where);
          axios.post(url, telepresence
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // deletes a telepresence session
        delTelepresence: function () {
          console.log('delTelepresence called');
          console.log('delTelepresence:'+this.selected_telepresence_id);
          const url = '/knobots/'+this.robot_id+'/telepresence/'+this.selected_telepresence_id;
          console.log('delTelepresence:'+url);
          axios
            .delete(url)
            .then(resp => {
              this.robot = JSON.parse(resp.data);
              console.log('SUCCESS!!');
            }).catch(function() {
              console.log('FAILURE!!');
            });
        },
        // selects a telepresence session from the table
        selectTelepresence: function (telepresence) {
          console.log('selectTelepresence called'+telepresence._id);
          this.selected_telepresence_id = telepresence._id;
          this.selected_telepresence_who = telepresence.who;
          this.selected_telepresence_where = telepresence.where;
          this.selected_telepresence_whom = telepresence.whom;
          this.selected_telepresence_email = telepresence.email;
          this.selected_telepresence_when = new Date(telepresence.when);
          this.selected_telepresence_zoom = telepresence.zoom;
          this.selected_telepresence_start = telepresence.start;
          this.selected_telepresence_join = telepresence.join;
        },
        // just to show the list of telepresences
        listTelepresences: function () {
          const url = '/knobots/'+this.robot_id+'/info';
          axios.get( url
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
          });
          this.telepresence_destinations = this.robot.destinations;
        },
        // just to select a specific telepresence slot
        setTelepresenceSlotIndex: function (event,selectedIndex) {
          this.selected_telepresence_slot = this.telepresence_slots[selectedIndex];
        },
        // just to select a specific telepresence duration
        setTelepresenceDurationIndex: function (event,selectedIndex) {
          this.selected_telepresence_duration = this.telepresence_durations[selectedIndex];
        },
        // just to select a specific telepresence guest
        setTelepresenceGuests: function (event,selectedIndex) {
          this.selected_telepresence_whom = this.telepresence_guests[selectedIndex];
        },
        // just to select a specific telepresence guest
        setDestinations: function (event,selectedIndex) {
          this.selected_telepresence_where = this.telepresence_destinations[selectedIndex];
        },
        launchTelepresence: function() {
          window.open(this.selected_telepresence_join,'_blank');
        },
        // adds a goal to the database
        addGoal: function () {
            var color = 'red';
            if (this.robot_goal.type == 1) color = 'green';
            if (this.robot_goal.type == 2) color = 'blue';
            if (this.robot_goal.name.length == 0) {
                this.robot_goal.name = 'goal-'+this.current_map.goals.length;
            }
            this.current_map.goals.push(JSON.parse(JSON.stringify(this.robot_goal)));
            this.temporary_goal = false;
        },
        // deletes a goal from the database
        delGoal: function () {
          console.log('delGoal:'+this.selected_goal_index);
          console.log('delGoal:'+this.current_map.goals[this.selected_goal_index].name);
          this.current_map.goals.splice(this.selected_goal_index,1);
        },
        // shows the goals on the map using map_image, current_map, g2dcontext
        showMapVGoals: function () {
          // console.log('showMapVGoals started');
          // var marker = new Image();
          // marker.src = '/images/marker.png';
          // this.g2dcontext.drawImage(marker,300,300);
          // this.showVMarker(-10.0,5.0);
          // this.showVMarker(30.0,30.0);
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0;
          var y = 0;
          var xx = 0;
          var yy = 0;
          var radius = 8;
          for (let i = 0; i < this.current_map.goals.length; i++) {
            x = this.current_map.goals[i].x;
            y = this.current_map.goals[i].y;
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            // console.log('x '+x+' y '+y+' xx '+xx+' yy '+yy);
            var color = 'red';
            if (this.current_map.goals[i].type == 1) color = 'green';
            if (this.current_map.goals[i].type == 2) color = 'blue';
            this.g2dcontext.beginPath();
            this.g2dcontext.arc(xx, yy, radius, 0, 2 * Math.PI, false);
            // this.g2dcontext.fillStyle = color;
            // this.g2dcontext.fill();
            this.g2dcontext.font = '10px courier';
            this.g2dcontext.fillText(this.current_map.goals[i].name, xx, yy, 120);
            this.g2dcontext.save();
            this.g2dcontext.translate(xx,yy);
            this.g2dcontext.rotate(this.current_map.goals[i].z);
            this.g2dcontext.lineWidth = 2;
            if (this.selected_goal_index == i)
              this.g2dcontext.lineWidth *= 2;
            this.g2dcontext.strokeStyle = color;
            this.g2dcontext.stroke();
            this.g2dcontext.beginPath();
            // this.g2dcontext.moveTo(xx, yy);
            // this.g2dcontext.lineTo(xx, yy+radius);
            this.g2dcontext.moveTo(0, 0);
            this.g2dcontext.lineTo(0+radius, 0);
            this.g2dcontext.stroke();
            this.g2dcontext.restore();
          }
          // console.log('showMapVGoals completed');
        },
        // shows the vwalls on the map using map_image, current_map, g2dcontext
        showMapVWalls: function () {
          // console.log('showMapVWalls started');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0;
          var y = 0;
          var xx = 0;
          var yy = 0;
          for (let i = 0; i < this.current_map.vwalls.length; i++) {
            x = this.current_map.vwalls[i].polygon[0];
            y = this.current_map.vwalls[i].polygon[1];
            // console.log('x '+x+' y '+y);
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            // console.log('xx '+xx+' yy '+yy);
            if (this.selected_vwall_index == i)
              this.g2dcontext.lineWidth *= 2;
            this.g2dcontext.beginPath();
            this.g2dcontext.moveTo(xx, yy);
            for (let j = 2; j < this.current_map.vwalls[i].polygon.length; j+=2) {
              x = this.current_map.vwalls[i].polygon[j];
              y = this.current_map.vwalls[i].polygon[j+1];
              // console.log('x '+x+' y '+y);
              xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
              yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
              // console.log('xx '+xx+' yy '+yy);
              this.g2dcontext.lineTo(xx, yy);
              this.g2dcontext.stroke();
            }
            if (this.selected_vwall_index == i)
              this.g2dcontext.lineWidth /= 2;
          }
          // console.log('showMapVWalls completed');
        },
        // shows the zwalls on the map using map_image, current_map, g2dcontext
        showMapZWalls: function () {
          // console.log('showMapZWalls started');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0;
          var y = 0;
          var xx = 0;
          var yy = 0;
          for (let i = 0; i < this.current_map.zwalls.length; i++) {
            x = this.current_map.zwalls[i].polygon[0];
            y = this.current_map.zwalls[i].polygon[1];
            // console.log('x '+x+' y '+y);
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            // console.log('xx '+xx+' yy '+yy);
            if (this.selected_zwall_index == i)
              this.g2dcontext.lineWidth *= 2;
            this.g2dcontext.beginPath();
            this.g2dcontext.moveTo(xx, yy);
            for (let j = 2; j < this.current_map.zwalls[i].polygon.length; j+=2) {
              x = this.current_map.zwalls[i].polygon[j];
              y = this.current_map.zwalls[i].polygon[j+1];
              // console.log('x '+x+' y '+y);
              xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
              yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
              // console.log('xx '+xx+' yy '+yy);
              this.g2dcontext.lineTo(xx, yy);
              this.g2dcontext.stroke();
            }
            if (this.selected_zwall_index == i)
              this.g2dcontext.lineWidth /= 2;
          }
          // console.log('showMapzWalls completed');
        },
        // shows the goals on the map using map_image, current_map, g2dcontext
        showMapTemporaryPoly: function () {
          // console.log('showMapTemporaryPolystarted');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0;
          var y = 0;
          var xx = 0;
          var yy = 0;
          x = this.current_poly.polygon[0];
          y = this.current_poly.polygon[1];
          xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
          yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            // console.log('xx '+xx+' yy '+yy);
          this.g2dcontext.beginPath();
          this.g2dcontext.moveTo(xx, yy);
          for (let j = 2; j < this.current_poly.polygon.length; j+=2) {
            x = this.current_poly.polygon[j];
            y = this.current_poly.polygon[j+1];
            // console.log('x '+x+' y '+y);
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
              // console.log('xx '+xx+' yy '+yy);
            this.g2dcontext.lineTo(xx, yy);
            this.g2dcontext.stroke();
          }
          // console.log('showMapTemporaryPoly completed');
        },
        // shows the goals on the map using map_image, current_map, g2dcontext
        showMapVPaths: function () {
          // console.log('showMapVpaths started');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0;
          var y = 0;
          var xx = 0;
          var yy = 0;
          for (let i = 0; i < this.current_map.vpaths.length; i++) {
            x = this.current_map.vpaths[i].polygon[0];
            y = this.current_map.vpaths[i].polygon[1];
            // console.log('x '+x+' y '+y);
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            // console.log('xx '+xx+' yy '+yy);
            if (this.selected_vpath_index == i)
              this.g2dcontext.lineWidth *= 2;
            this.g2dcontext.beginPath();
            this.g2dcontext.moveTo(xx, yy);
            for (let j = 2; j < this.current_map.vpaths[i].polygon.length; j+=2) {
              x = this.current_map.vpaths[i].polygon[j];
              y = this.current_map.vpaths[i].polygon[j+1];
              // console.log('x '+x+' y '+y);
              xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
              yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
              // console.log('xx '+xx+' yy '+yy);
              this.g2dcontext.lineTo(xx, yy);
              this.g2dcontext.stroke();
            }
            if (this.selected_vpath_index == i)
              this.g2dcontext.lineWidth /= 2;
          }
          // console.log('showMapVPaths completed');
        },
        showMapVMarker: function () {
          // console.log('showMapVMarker Called');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = app.pose.position.x;
          var y = app.pose.position.y;
          var xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
          var yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
          var radius = 8;
          // console.log('x '+x+' y '+y+' xx '+xx+' yy '+yy);
          this.g2dcontext.beginPath();
          this.g2dcontext.arc(xx, yy, radius, 0, 2 * Math.PI, false);
          this.g2dcontext.fillStyle = 'orange';
          this.g2dcontext.fill();
          this.g2dcontext.lineWidth = 2;
          this.g2dcontext.strokeStyle = 'black';
          this.g2dcontext.stroke();
          this.g2dcontext.save();
          this.g2dcontext.translate(xx,yy);
          this.g2dcontext.rotate(app.pose.rotation.z);
          this.g2dcontext.beginPath();
          this.g2dcontext.moveTo(0, 0);
          this.g2dcontext.lineTo(0+radius, 0);
          // this.g2dcontext.moveTo(xx, yy);
          // this.g2dcontext.lineTo(xx, yy+radius);
          this.g2dcontext.stroke();
          this.g2dcontext.restore();
        },
        showMapVTemporaryMarker: function () {
          // console.log('showMapVTemporaryMarker Called');
          if (this.temporary_goal) {
            var scalex = this.map_image.width / this.current_map.map_info.width;
            var scaley =  this.map_image.height / this.current_map.map_info.height;
            var resolution = this.current_map.map_info.resolution;
            var x = this.robot_goal.x;
            var y = this.robot_goal.y;
            var xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            var yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            var radius = 8;
            console.log('x '+x+' y '+y+' xx '+xx+' yy '+yy);
            this.g2dcontext.beginPath();
            this.g2dcontext.arc(xx, yy, radius, 0, 2 * Math.PI, false);
            this.g2dcontext.fillStyle = 'yellow';
            this.g2dcontext.fill();
            this.g2dcontext.lineWidth = 2;
            this.g2dcontext.strokeStyle = 'black';
            this.g2dcontext.stroke();
            this.g2dcontext.save();
            this.g2dcontext.translate(xx,yy);
            this.g2dcontext.rotate(this.robot_goal.z);
            this.g2dcontext.beginPath();
            this.g2dcontext.moveTo(0, 0);
            this.g2dcontext.lineTo(0+radius, 0);
            // this.g2dcontext.moveTo(xx, yy);
            // this.g2dcontext.lineTo(xx, yy+radius);
            this.g2dcontext.stroke();
            this.g2dcontext.save();
          }
        },
        addMarkersHistory: function () {
          this.markers_history.push([app.pose.position.x,app.pose.position.y,app.pose.rotation.z]);
        },
        showHistory: function (par) {
          this.show_history = par;
          if (this.show_history === false) {
            // clean up the position history array
            this.markers_history.splice(0,this.markers_history.length);
            if (this.marker_history_interval != null)
              clearInterval(this.marker_history_interval);
          } else {
            this.marker_history_interval = setInterval(this.addMarkersHistory,2000);
          }
        },
        showMapVMarkerHistory: function () {
          // console.log('showMapVMarkerHistory Called');
          var scalex = this.map_image.width / this.current_map.map_info.width;
          var scaley =  this.map_image.height / this.current_map.map_info.height;
          var resolution = this.current_map.map_info.resolution;
          var x = 0; var y = 0; var z = 0;
          var xx = 0; var yy = 0; var radius = 8;
          for (let i = 0; i < this.markers_history.length; i++) {
            x = this.markers_history[i][0];
            y = this.markers_history[i][1];
            xx = ((x - this.current_map.map_info.origin.position.x) / resolution) * scalex;
            yy = this.map_image.height  - ((y - this.current_map.map_info.origin.position.y ) / resolution) *scaley;
            this.g2dcontext.beginPath();
            this.g2dcontext.arc(xx, yy, radius, 0, 2 * Math.PI, false);
            this.g2dcontext.fillStyle = 'lightgrey';
            this.g2dcontext.fill();
            this.g2dcontext.lineWidth = 2;
            this.g2dcontext.strokeStyle = 'grey';
            this.g2dcontext.stroke();
            this.g2dcontext.save();
            this.g2dcontext.translate(xx,yy);
            this.g2dcontext.rotate(this.markers_history[i][2]);
            this.g2dcontext.beginPath();
            this.g2dcontext.moveTo(0, 0);
            this.g2dcontext.lineTo(0+radius, 0);
            this.g2dcontext.stroke();
            this.g2dcontext.restore();
          }
        },
        // activates the action client to monitor navigation goal execution
        setActionClient: function () {
          if (this.ros != null) {
            this.action_client = new ROSLIB.ActionClient({
                ros: this.ros,
                serverName: '/move_base',
                actionName: 'move_base_msgs/MoveBaseAction'
            });
            this.action_result_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/move_base/result',
              messageType : 'move_base_msgs/MoveBaseActionResult'
            });
            this.action_result_topic.subscribe(function(message) {
              console.log('action result');
              console.dir(message);
              var status = message.status.status;
              console.log('result status'+status);
              // app.action_client.cancel();
              if (app.running_mission_goal) {
                  app.running_mission_goal = false;
                  app.current_event.start = this.current_action_start;
                  app.current_event.end = Date.now();
                  app.current_event.action = 'goal';
                  app.current_event.parameters = app.current_mission_par;
                  app.current_event.result = status;
                  app.sendEvent();
                  if (status > 0 && status < 4) {
                    console.log('goal: completed with success '+app.current_mission_par);
                    app.runTask();
                  } else {
                    app.missionError('goal: completed with error code '+status);
                    console.log('goal: completed with error code '+status);
                    var now = Date.now();
                    if (now > app.current_action_timeout) {
                        app.execGoto(app.current_action_fallback);
                    }
                  }
              }
              if (app.running_temporary_goal) {
                  app.running_temporary_goal = false;
                  app.current_event.end = Date.now();
                  app.current_event.result = status;
                  app.sendEvent();
                  if (status > 0 && status < 4) {
                    console.log('temporary goal: completed with success');
                  } else {
                    console.log('temporary goal: completed with error code '+status);
                  }
              }
            });
          }
        },
        // sends a goal navigation action from the interactive interface
        sendGoal: function () {
          if (this.ros != null) {
            let z = new THREE.Euler(0, 0, this.action.aux.z, 'XYZ');
            let oz = new THREE.Quaternion();
            oz.setFromEuler(z);
            this.action.goal.pose.position.x = this.action.aux.x;
            this.action.goal.pose.position.y = this.action.aux.y;
            this.action.goal.pose.position.z = 0;
            this.action.goal.pose.orientation.x = oz.x;
            this.action.goal.pose.orientation.y = oz.y;
            this.action.goal.pose.orientation.z = oz.z;
            this.action.goal.pose.orientation.w = oz.w;
            console.log(this.action.goal.pose.position.x,this.action.goal.pose.position.y,this.action.goal.pose.position.z);
            console.log(this.action.goal.pose.orientation.x,this.action.goal.pose.orientation.y,this.action.goal.pose.orientation.z, this.action.goal.pose.orientation.w);
            var d = new Date();
            var s = d.getSeconds();
            var u = d.getMilliseconds();
            this.goal = new ROSLIB.Goal({
                actionClient: this.action_client,
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
                            pose : this.action.goal.pose
                          }
                }
            });
            this.goal.on('status', (status) => {
              this.action.status = status;
            });
            this.goal.on('feedback', (feedback) => {
                this.action.feedback = feedback
            });
            this.goal.on('result', (result) => {
                this.action.result = result;
            });
            this.running_temporary_goal = true;
            this.current_event.action = 'goal';
            this.current_event.mission = '';
            this.current_event.goal = '000000000000000000000000';
            this.current_event.parameters = 'temporary';
            this.goal.send();
            this.current_event.distance = this.robot_goal_distance;
            console.log('sendGoal: goal sent');
          }
        },
        // cancels a navigation goal sent from the interactive interface
        cancelGoal: function () {
            this.goal.cancel()
        },
        // sends a navigation goal sent from the mission interface
        sendActionGoal: function () {
          if (this.ros != null) {
            let z = new THREE.Euler(0, 0, this.action.aux.z, 'XYZ');
            let oz = new THREE.Quaternion();
            oz.setFromEuler(z);
            this.action.goal.pose.position.x = this.action.aux.x;
            this.action.goal.pose.position.y = this.action.aux.y;
            this.action.goal.pose.position.z = 0;
            this.action.goal.pose.orientation.x = oz.x;
            this.action.goal.pose.orientation.y = oz.y;
            this.action.goal.pose.orientation.z = oz.z;
            this.action.goal.pose.orientation.w = oz.w;
            console.log(this.action.goal.pose.position.x,this.action.goal.pose.position.y,this.action.goal.pose.position.z);
            console.log(this.action.goal.pose.orientation.x,this.action.goal.pose.orientation.y,this.action.goal.pose.orientation.z, this.action.goal.pose.orientation.w);
            var d = new Date();
            var s = d.getSeconds();
            var u = d.getMilliseconds();
            this.goal = new ROSLIB.Goal({
                actionClient: this.action_client,
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
                            pose : this.action.goal.pose
                          }
                }
            });
            this.goal.on('status', (status) => {
                app.action.status = status;
            });
            this.goal.on('feedback', (feedback) => {
                app.action.feedback = feedback
            });
            this.goal.on('result', (result) => {
                app.action.result = result;
            });
            this.goal.send();
            console.log('sendActionGoal: goal sent');
          }
        },
        // cancels a navigation goal sent from the mission interface
        cancelActionGoal: function () {
            this.goal.cancel()
        },
        // activates the action client to monitor navigation goal execution
        setDockingClient: function () {
          if (this.ros != null) {
            this.docking_action_client = new ROSLIB.ActionClient({
                ros: this.ros,
                serverName: '/docking_controller',
                actionName: 'jobot_charger_autodock/dockingAction'
            });
            this.docking_action_result_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/docking_controller/result',
              messageType : 'jobot_charger_autodock/dockingActionResult'
            });
            this.docking_action_result_topic.subscribe(function(message) {
              // console.dir(message);
              var result = message.result.result;
              var success = message.result.success;
              var code = message.status.status;
              var status = message.status.text;
              var message = 'Result '+result+' | Success: '+success+' | Status: '+status+' ('+code+')';
              console.log('docking: '+message);
              app.current_docking = message;
              // app.docking_goal.cancel();
              if (app.running_mission_docking) {
                if (success) {
                  app.running_mission_docking = false;
                  console.log('docking: completed '+app.current_mission_par);
                  app.runTask();
                } else {
                  console.log('docking: not completed ');
                  var now = Date.now();
                  if (now > app.current_action_timeout) {
                      app.execGoto(app.current_action_fallback);
                  }
                }
              }
            });
          }
        },
        // sends a docking goal sent from the mission interface
        sendActionDock: function (command) {
          if (this.ros != null) {
            console.log('sendActionDock: '+command);
            var d = new Date();
            var s = d.getSeconds();
            var u = d.getMilliseconds();
            app.docking_goal = new ROSLIB.Goal({
                actionClient: this.docking_action_client,
                goalMessage: {
                    dock: command
                }
            });
            app.docking_goal.on('status', (status) => {
                app.docking_action.status = status;
            });
            app.docking_goal.on('feedback', (feedback) => {
                app.docking_action.feedback = feedback
            });
            app.docking_goal.on('result', (result) => {
                app.docking_action.result = result;
            });
            this.docking_goal.send();
            console.log('sendActionDock: goal sent');
          }
        },
        // cancels a docking goal sent from the mission interface
        cancelActionDock: function () {
            app.docking_goal.cancel();
        },
        // activates the jobot camera stream
        setCamera: function () {
          if (this.ros != null) {
            this.image_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/camera/image_raw/compressed',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.image_topic.subscribe(function(message) {
              document.getElementById('my_image').src = "data:image/png;base64," + message.data;
            });
          }
        },
        // activates the jobot camera once
        setCameraOnce: function () {
          if (this.ros != null) {
            this.image_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/camera/image_raw/compressed',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.image_topic.subscribe(function(message) {
              document.getElementById('my_image_once').src = "data:image/png;base64," + message.data;
              app.image_topic.unsubscribe();
            });
          }
        },
        startCamera: function () {
          console.log('startCamera start');
          this.image_update_interval = setInterval(this.setCameraOnce,500);
        },
        stopCamera: function () {
          console.log('stopCamera start');
          clearInterval(this.image_update_interval);
          this.image_update_interval = null;
        },
        // activates the Oak camera detections stream
        setOak: function () {
          if (this.ros != null) {
            console.log('setOak');
            this.oak_detections_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/depthai_detections',
              messageType: 'std_msgs/String'
            });
            this.oak_detections_topic.subscribe(function(message) {
              app.oak_detections = JSON.parse(message.data);
              // [] detections [{detection_x,detection_y,detection_z,min_x,min_y,max_x,max_y,label_index,confidence,name}]
              app.oak_detections.filter((a) => { return (a.name.localeCompare(app.oak_detections_target) == 0); });
              app.oak_detections.sort((a, b) => { return a.confidence - b.confidence; });
              // console.log(app.oak_detections);
              if (app.oak_detections.length > 0) {
                app.oak_detected_target = true;
                app.oak_detected_name = app.oak_detections[0].name;
                app.oak_detected_confidence = app.oak_detections[0].confidence;
                app.oak_detected_x = app.oak_detections[0].detection_x;
                app.oak_detected_y = app.oak_detections[0].detection_y;
                app.oak_detected_z = app.oak_detections[0].detection_z;
                app.oak_detected_person_standing = app.oak_detections[0].person_standing;
                app.oak_detected_area = (app.oak_detections[0].max_x - app.oak_detections[0].min_x) * (app.oak_detections[0].max_y - app.oak_detections[0].min_y);
              } else {
                app.oak_detected_target = false;
                app.oak_detected_name = '---';
              }
              if (app.oak_detected_target) {
                  app.whenDetected();
              }
            });
          }
        },
        // unsets oak detection
        unsetOak: function () {
          this.oak_detections_target = '';
          this.oak_detected_action = '';
          this.oak_detected_action_pars = '';
          this.oak_detected_delay = 0;
          this.oak_detected_target = false;
          this.oak_detected_when = null;
          this.oak_detections = null;
          this.oak_detected_name = '';
          this.oak_detected_confidence = 0;
          this.oak_detected_x = 0;
          this.oak_detected_y = 0;
          this.oak_detected_z = 0;
          this.oak_detected_area = 0;
          if (this.oak_detections_topic != null)
            this.oak_detections_topic.unsubscribe();
        },
        // activates the Oak camera raw stream
        setOakRaw: function () {
          if (this.ros != null) {
            console.log('setOakRaw');
            if (this.oak_topic != null) {
              this.oak_topic.unsubscribe();
            }
            this.oak_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/depthai_raw',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.oak_topic.subscribe(function(message) {
              document.getElementById('my_oak').src = "data:image/png;base64," + message.data;
            });
          }
        },
        // activates the Oak camera annotated stream
        setOakAnnotated: function () {
          if (this.ros != null) {
            console.log('setOakAnnotated');
            if (this.oak_topic != null) {
              this.oak_topic.unsubscribe();
            }
            this.oak_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/depthai_annotated',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.oak_topic.subscribe(function(message) {
              document.getElementById('my_oak').src = "data:image/png;base64," + message.data;
            });
          }
        },
        // activates the Oak camera depth stream
        setOakDepth: function () {
          if (this.ros != null) {
            console.log('Depth');
            if (this.oak_topic != null) {
              this.oak_topic.unsubscribe();
            }
            this.oak_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/depthai_depth',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.oak_topic.subscribe(function(message) {
              document.getElementById('my_oak').src = "data:image/png;base64," + message.data;
            });
          }
        },
        // subscribes to the ROS pose topic and moves the jobot icon in the map using showMapVMarker
        setPoseTracker: function () {
          console.log('setPoseTracker: started');
          if (this.ros != null && this.pose_topic == null) {
            this.pose_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/tracked_pose',
              messageType: 'geometry_msgs/PoseStamped'
            });
            this.pose_topic.subscribe(function(message) {
              app.pose.position = message.pose.position;
              app.pose.orientation = message.pose.orientation;
              app.pose.rotation = new THREE.Euler().setFromQuaternion( app.pose.orientation, "XYZ" );
              var difx = app.pose.position.x - app.action.aux.x;
              var dify = app.pose.position.y - app.action.aux.y;
              app.robot_goal_distance = Math.sqrt( difx*difx + dify*dify);
            });
          }
          console.log('setPoseTracker: completed');
        },
        // used to click a point in the map ... gets positions and trasformes them in a potential goal
        mapClick: function(event) {
          // console.dir(event);
          console.log('mapClick Called');
          if (this.ros != null) {
            var scalex = this.map_image.width / this.current_map.map_info.width;
            var scaley =  this.map_image.height / this.current_map.map_info.height;
            var resolution = this.current_map.map_info.resolution;
            var x = event.offsetX;
            var y = event.offsetY;
            var posx = 0.0;
            var poxy = 0.0;
            posx = this.current_map.map_info.origin.position.x + resolution * (x / scalex);
            posy = this.current_map.map_info.origin.position.y + resolution * ((this.map_image.height - y) / scaley );
            console.log('map image click: x='+posx+' y='+posy);
            if (this.poly) {
              console.log('poly add: '+posx+','+posy);
              this.current_poly.polygon.push(posx,posy);
              if (this.newpoly) {
                this.temporary_goal = false;
                this.newpoly = false;
              }
            } else {
              this.action.aux.x = posx;
              this.action.aux.y = posy;
              // this.action.aux.z = 0;
              this.robot_goal.x = posx;
              this.robot_goal.y = posy;
              this.temporary_goal = true;
            }
            this.checkSelected(posx,posy);
          }
        },
        checkSelected: function (posx,posy) {
          // goals: [],
          this.selected_goal_index = -1;
          this.selected_vwall_index = -1;
          this.selected_vpath_index = -1;
          this.selected_zwall_index = -1;
          var found = false;
          if (!found) {
            for (var i=0; i < this.current_map.goals.length; i++) {
              if (pointselected(posx,posy,this.current_map.goals[i].x,this.current_map.goals[i].y)) {
                this.selected_goal_index = i;
                console.log('checkSelected: goal '+this.selected_goal_index);
                found = true;
                break;
              }
            }
          }
          // vwalls: [],
          if (!found) {
            for (var i=0; i < this.current_map.vwalls.length; i++) {
              if (polyselected(posx,posy,this.current_map.vwalls[i].polygon)) {
                this.selected_vwall_index = i;
                console.log('checkSelected: vwall '+this.selected_vwall_index);
                found = true;
                break;
              }
            }
          }
          // zwalls: [],
          if (!found) {
            for (var i=0; i < this.current_map.zwalls.length; i++) {
              if (polyselected(posx,posy,this.current_map.zwalls[i].polygon)) {
                this.selected_zwall_index = i;
                console.log('checkSelected: zwall '+this.selected_zwall_index);
                found = true;
                break;
              }
            }
          }
          // vpaths: [],
          if (!found) {
            for (var i=0; i < this.current_map.vpaths.length; i++) {
              if (polyselected(posx,posy,this.current_map.vpaths[i].polygon)) {
                this.selected_vpath_index = i;
                console.log('checkSelected: vpath '+this.selected_vpath_index);
                found = true;
                break;
              }
            }
          }
        },
        newPoly: function() {
          console.log('newPoly');
          this.poly = true;
          this.newpoly = true;
          this.current_poly.name = 'poly';
          this.current_poly.polygon.splice(0,this.current_poly.polygon.length);
        },
        cancelPoly: function() {
          console.log('cancelPoly');
          this.poly = false;
          this.current_poly.name = '';
          this.current_poly.polygon.splice(0,this.current_poly.polygon.length);
        },
        delSelectedObiect: function() {
          if (this.selected_goal_index >= 0) {
            this.delGoal();
            this.selected_goal_index = -1;
          }
          if (this.selected_vwall_index >= 0) {
            this.delVWall();
            this.selected_vwall_index = -1;
          }
          if (this.selected_vpath_index >= 0) {
            this.delVPath();
            this.selected_vpath_index = -1;
          }
          if (this.selected_zwall_index >= 0) {
            this.delZWall();
            this.selected_zwall_index = -1;
          }            
        },
        addVWall: function() {
          console.log('addVWall');
          this.poly = false;
          this.current_map.vwalls.push(JSON.parse(JSON.stringify(this.current_poly)));
        },
        delVWall: function() {
          console.log('delVWall: '+this.selected_vwall_index);
          this.current_map.vwalls.splice(this.selected_vwall_index,1);
        },
        addZWall: function() {
          console.log('addZWall');
          this.poly = false;
          this.current_map.zwalls.push(JSON.parse(JSON.stringify(this.current_poly)));
        },
        delZWall: function() {
          console.log('delZWall: '+this.selected_zwall_index);
          this.current_map.zwalls.splice(this.selected_zwall_index,1);
        },
        addVPath: function() {
          console.log('addVPath');
          this.poly = false;
          this.current_map.vpaths.push(JSON.parse(JSON.stringify(this.current_poly)));
        },
        delVPath: function() {
          console.log('delVPath: '+this.selected_vpath_index);
          this.current_map.vpaths.splice(this.selected_vpath_index,1);
        },
        // executes a system command sent as a parameter ... used to reboot or restart components
        execSysCmd: function(cmdId) {
          var url = '/knobots/'+this.robot_id+'/sys/'+cmdId;
          axios.get(url
          ).then(resp => {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('FAILURE!!');
          });
        },
        // sends a movement command using the joystick interface
        sendCommand: function () {
          if (this.ros != null) {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/joy',
                messageType: 'sensor_msgs/Joy'
            });
            let message = new ROSLIB.Message({
                axes: [-2*this.joystick.horizontal, 0.0, 0.0, 2*this.joystick.vertical, 0.0, 0.0],
                buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            });
            topic.publish(message);
          }
        },
        // virtual joystick start drag
        startDrag: function () {
            this.dragging = true
            this.x = this.y = 0
        },
        // virtual joystick stop drag
        stopDrag: function () {
            this.dragging = false;
            this.x = this.y = 0;
            this.dragCircleStyle.display = 'none';
            this.resetJoystickVals();
            this.sendCommand();
        },
        // virtual joystick translates joystick position in movement commands
        doDrag: function (event) {
            if (this.dragging) {
                this.x = event.offsetX
                this.y = event.offsetY
                // console.log('x '+this.x+' y '+this.y);
                let ref = document.getElementById('dragstartzone')
                this.dragCircleStyle.display = 'inline-block'

                let minTop = ref.offsetTop - parseInt(this.dragCircleStyle.height) / 2
                let maxTop = minTop + 200
                let top = this.y + minTop
                this.dragCircleStyle.top = `${top}px`

                let minLeft = ref.offsetLeft - parseInt(this.dragCircleStyle.width) / 2
                let maxLeft = minLeft + 200
                let left = this.x + minLeft
                this.dragCircleStyle.left = `${left}px`

                this.setJoystickVals();
                this.sendCommand();
            }
        },
        // used bythe virtual joystic to convert positions in horizontal and vertical velocity
        setJoystickVals: function () {
            this.joystick.vertical = -1 * ((this.y / 200) - 0.5);
            this.joystick.horizontal = +1 * ((this.x / 200) - 0.5);
        },
        // used bythe virtual joystic to convert positions in horizontal and vertical velocity and send to jobot
        sendJoystick: function (x,y) {
            if (x >= 0 && x < 200 && y >=0 && y < 200) {
              this.joystick.vertical = -1 * ((y / 200) - 0.5);
              this.joystick.horizontal = +1 * ((x / 200) - 0.5);
              this.sendCommand();
            }
        },
        // used bythe virtual joystic to reset horizontal and vertical velocity
        resetJoystickVals: function () {
            this.joystick.vertical = 0
            this.joystick.horizontal = 0
        },
        // used by the move action
        sendMove: function (h,v) {
          this.joystick.vertical = h;
          this.joystick.horizontal = v;
          this.sendCommand();
        },
        // sends a movement command using the joystick interface
        sendVelocity: function (x,z) {
          if (this.ros != null) {
            var cmdVel = new ROSLIB.Topic({
                 ros : this.ros,
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
        },
        // subscribe to get the current workflow and monitor workflow action completion status
        currentWorkflow: function() {
          if (this.ros != null) {
            this.workflow_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/current_workflow_name',
              messageType : 'std_msgs/String'
            });
            this.workflow_topic.subscribe(function(message) {
              app.current_workflow_name = message.data;
              if (app.running_mission_workflow) {
                var workflowName = app.current_mission_par;
                if (workflowName.localeCompare(message.data) == 0) {
                  app.running_mission_workflow = false;
                  console.log('workflow: completed '+workflowName);
                  app.runTask();
                } else {
                  console.log('workflow: '+workflowName+' <> '+app.current_workflow_name);
                  var now = Date.now();
                  if (now > app.current_action_timeout) {
                      app.execGoto(app.current_action_fallback);
                  }
                }
              }
            });
          }
        },
        // subscribe to get current battery voltage
        currentBatteryVoltage: function() {
          if (this.ros != null) {
             this.battery_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/battery',
              messageType : 'jobot_msgs/battery'
            });
            this.battery_topic.subscribe(function(message) {
              app.current_battery_voltage = message.level;
            });
          }
        },
        // subscribe to get current battery capacity
        currentBatteryCapacity: function() {
          if (this.ros != null) {
             this.battery_capacity_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/battery_capacity',
              messageType : 'std_msgs/Int16'
            });
            this.battery_capacity_topic.subscribe(function(message) {
              app.current_battery_capacity = message.data;
            });
          }
        },
        // subscribe to get current robot hardware status
        currentHardware: function() {
          if (this.ros != null) {
             this.hardware_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/hardware_status',
              messageType : 'jobot_msgs/hardware_status'
            });
            this.hardware_topic.subscribe(function(message) {
              app.current_hardware = message;
            });
          }
        },
        // to get the list of available wireless networks
        getNet: function () {
          console.log('getNet start');
          const url = '/knobots/'+this.robot_id+'/net';
           axios.get( url
          ).then(resp => {
            this.networks = JSON.parse(resp.data);
            console.dir(this.networks);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('getNet end');
        },
        // to get the mac address of the jobot
        getMacAddr: function () {
          console.log('getMacAddr start');
          const url = '/knobots/'+this.robot_id+'/macaddr';
           axios.get( url
          ).then(resp => {
            this.network_mac = JSON.parse(resp.data);
            console.log(this.network_mac);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('getMacAddr end');
        },
        // to get the IP address of the jobot
        getIpAddr: function () {
          console.log('getIpAddr start');
          const url = '/knobots/'+this.robot_id+'/ipaddr';
           axios.get( url
          ).then(resp => {
            this.network_ip = JSON.parse(resp.data);
            console.log(this.network_ip);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('getIpAddr end');
        },
        // to get the name address of the jobot
        getNameAddr: function () {
          console.log('getNameAddr start');
          const url = '/knobots/'+this.robot_id+'/nameaddr';
           axios.get( url
          ).then(resp => {
            this.network_name = JSON.parse(resp.data);
            console.log(this.network_name);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('getNameAddr end');
        },
        // to set the network password on the selected network and connect
        setNet: function () {
          console.log('setNet start');
          const url = '/knobots/'+this.robot_id+'/net';
          const pass = { ssid: this.network_ssid, password: this.network_password };
          axios.put( url, pass
          ).then(resp => {
            console.log('SUCCESS!!'+resp.data);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('setNet end');
        },
        // to set the network password on the selected network and connect
        delNet: function () {
          console.log('delNet start');
          const url = '/knobots/'+this.robot_id+'/delnet';
          const pass = { ssid: this.network_ssid };
          axios.put( url, pass
          ).then(resp => {
            console.log('SUCCESS!!'+resp.data);
          }).catch(function() {
            console.log('FAILURE!!');
          });
          console.log('delNet end');
        },
        // toggle as hidden/play the passwork content
        setHidden: function () {
          var x = document.getElementById("netpass");
          var e = document.getElementById("eye");
          var eo = document.getElementById("eye-off");
          if (x.type === "password") {
            x.type = "text";
            e.style.visibility = "hidden";
            eo.style.visibility = "visible";
          } else {
            x.type = "password";
            e.style.visibility = "visible";
            eo.style.visibility = "hidden";
          }
        },
        // calls the current status update
        currentStatus: function () {
          this.currentWorkflow();
          this.currentBatteryVoltage();
          this.currentBatteryCapacity();
          this.currentHardware();
          this.setDockingClient();
          this.selfcontrol();
          this.current_status = true;
        },
        // stops the current status update
        currentStatusStop: function () {
          if (this.workflow_topic != null)
            this.workflow_topic.unsubscribe();
          if (this.battery_capacity_topic != null)
            this.battery_capacity_topic.unsubscribe();
          if (this.battery_topic != null)
            this.battery_topic.unsubscribe();
          if (this.hardware_topic != null)
            this.hardware_topic.unsubscribe();
          if (this.docking_action_result_topic != null)
            this.docking_action_result_topic.unsubscribe();
          if (this.mission_control_topic != null)
            this.mission_control_topic.unsubscribe();
          if (this.mission_log_topic != null)
            this.mission_log_topic.unsubscribe();
          this.current_status = false;
        },
        // gets the image of the map
        getMap: function() {
          console.log('getMap');
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/map_img',
              serviceType : 'sensor_msgs/CompressedImage'
            });
            this.request = new ROSLIB.ServiceRequest({
              arguments: 'getMap'
            });
            this.service.callService(this.request, function(result) {
              console.dir(result);
              app.map_file = result.map.data;
              document.getElementById('my_map').src = "data:image/jpeg;base64," + this.map_file;
              app.showMap();
            });
          }
        },
        // activates the jobot camera stream
        setMap: function () {
          if (this.ros != null) {
            this.map_topic = new ROSLIB.Topic({
              ros: this.ros,
              name: '/map_converted_img',
              messageType: 'sensor_msgs/CompressedImage'
            });
            this.map_topic.subscribe(function(message) {
              document.getElementById('my_map').src = "data:image/png;base64," + message.data;
            });
          }
        },
        startMapper: function () {
          console.log('startMapper start');
          this.workflowAction('JobotDefaultMappingWorkflow');
          console.log('updateMap: start');
          this.getMapInfo();
          // this.map_update_interval = setInterval(this.getMap,10000);
          this.setMap();
        },
        stopMapper: function () {
          console.log('stopMapper start');
          this.workflowAction('JobotDefaultIdleWorkflow');
          console.log('updateMap: stop');
          clearInterval(this.map_update_interval);
          this.map_update_interval = null;
        },
        cancelMapper: function () {
          console.log('cancelMapper start');
          this.map_name = '';
          this.map_info_topic.unsubscribe();
          this.loadMap();
        },
        saveMapper: function () {
          console.log('saveMapper start');
          this.map_info_topic.unsubscribe();
          // save jpg file
          // generate json file with only map_info in current_map
          this.savingMapper();
          // call get-map script
          this.gettingMapper();
        },
        // saves the map image in the jobot image folder and in the json file
        savingMapper: function() {
            console.log('Saving Map Called');
            var url = '/knobots/'+this.robot_id+'/map';
            let formData = new FormData();
            let mymap = document.getElementById('my_map');
            let imageData = mymap.src.split(',');
            let contentType = 'image/jpg';
            var blob = b64toBlob(imageData[1], contentType);
            formData.append('file',blob);
            // save map
            axios.put( url,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            ).then(function() {
                console.log('SUCCESS!!');
            }).catch(function() {
                console.log('FAILURE!!');
            });
            // save json
            axios.post( url, this.current_map
            ).then(function() {
                console.log('SUCCESS!!');
            }).catch(function() {
                console.log('FAILURE!!');
            });
        },
        // calls get-map script
        gettingMapper: function() {
          var url = '/knobots/'+this.robot_id+'/map/get';
          var out = '';
          axios.get(url
          ).then(resp => {
            var out = JSON.parse(resp.data);
            console.log('SUCCESS!!'+out);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // loads map information in current_map and map image info in map_image
        readMap: function() {
          console.log('readMap');
          if (this.map_draw_interval != null)
            clearInterval(this.map_draw_interval);
          this.readMapImage();
          this.readMapInfo();
          this.map_draw_interval = setInterval(this.showMap,1000);
          this.setPoseTracker();
        },
        showMap: function() {
          this.setMapDimensions();
          this.getContext();
          this.showMapVGoals();
          this.g2dcontext.strokeStyle = "red";
          this.showMapVWalls();
          this.g2dcontext.strokeStyle = "yellow";
          this.showMapZWalls();
          this.g2dcontext.strokeStyle = "green";
          this.showMapVPaths();
          this.g2dcontext.strokeStyle = "grey";
          this.showMapTemporaryPoly();
          this.showMapVMarkerHistory();
          this.showMapVMarker();
          this.showMapVTemporaryMarker();
        },
        // this is to load current_map with JSON map file content
        readMapInfo: function() {
          console.log('readMapInfo Called');
          if (this.map_name != '')
            var url = '/knobots/'+this.robot_id+'/map/'+this.map_name+'/read';
          else
            var url = '/knobots/'+this.robot_id+'/map/read';
          var out = '';
          axios.get(url
          ).then(resp => {
            this.current_map = JSON.parse(resp.data);
            if (this.current_map.vwalls == null) this.current_map.vwalls = [];
            if (this.current_map.zwalls == null) this.current_map.zwalls = [];
            if (this.current_map.vpaths == null) this.current_map.vpaths = [];
            console.log('readMapInfo SUCCESS!!'+this.map_name);
          }).catch(function() {
            console.log('readMapInfo FAILURE!!');
          });
        },
        // this to read and display the image of the map
        readMapImage: function() {
          console.log('readMapImage Called');
          var img = document.getElementById('my_map');
          if (this.map_name != '')
            img.src = "/maps/"+this.map_name+".jpg";
          else
            img.src = "/maps/map.jpg";
          this.map_image.width = img.width;
          this.map_image.height = img.height;
        },
        listMaps: function() {
          console.log('listMaps Called');
          var url = '/knobots/'+this.robot_id+'/map/list';
          var out = '';
          axios.get(url
          ).then(resp => {
            this.mapnames = JSON.parse(resp.data);
            console.log('SUCCESS!!'+this.mapnames);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // saves the map json in the jobot map folder
        saveMap: function() {
            console.log('Save Map Called');
            if (this.map_name != '')
              var url = '/knobots/'+this.robot_id+'/map/'+this.map_name+'/save';
            else
              var url = '/knobots/'+this.robot_id+'/map';
            // save json
            axios.post( url, this.current_map
              ).then(function() {
                console.log('SUCCESS!!');
              }).catch(function() {
                console.log('FAILURE!!');
              });
        },
        // load map name to the jobot map folder
        loadMap: function() {
            var done = false;
            console.log('Loadl Map Called');
            if (this.map_name != '')
              var url = '/knobots/'+this.robot_id+'/map/'+this.map_name+'/load';
            else
              var url = '/knobots/'+this.robot_id+'/map/map/load';
            // laod map
            axios.get( url
              ).then(function() {
                console.log('SUCCESS!!');
                done = true;
              }).catch(function() {
                console.log('FAILURE!!');
                done = false;
              });
              return done;
        },
        // uploads the map on the cloud
        uploadMap: function() {
          if (this.map_name != '')
            var msg = 'upload map '+this.map_name+' on the cloud - coming soon';
          else
            var msg = 'upload current map on the cloud - coming soon';
          alert(msg);
        },
        // downloads the map from the cloud
        downloadMap: function() {
          if (this.map_name != '')
            var msg = 'download map '+this.map_name+' from the cloud - coming soon';
          else
            var msg = 'download current map from the cloud - coming soon';
          alert(msg);
        },
        listChatbotfiles: function() {
          console.log('listChatbotfiles Called');
          var url = '/knobots/'+this.robot_id+'/chat/list';
          var out = '';
          axios.get(url
          ).then(resp => {
            this.chatbotfiles = JSON.parse(resp.data);
            console.log('SUCCESS!!'+this.chatbotfiles);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        readChatbot: function() {
          console.log('readChatbot Called');
          var url = '/knobots/'+this.robot_id+'/chat/'+this.current_chatbotfile_name;
          var out = '';
          axios.get(url
          ).then(resp => {
            this.current_chatbotfile = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // saves the chatbot file
        saveChatbot: function() {
          console.log('saveChatbot Called');
          // saves the map json in the jobot map folder
          if (this.current_chatbotfile_name != '') {
            var url = '/knobots/'+this.robot_id+'/chat/'+this.current_chatbotfile_name;
            this.current_chatbotfile.name = this.current_chatbotfile_name;
            axios.post( url, this.current_chatbotfile
              ).then(function() {
                console.log('SUCCESS!!');
              }).catch(function() {
                console.log('FAILURE!!');
              });
          }
        },
        trainChatbot: function() {
          console.log('trainChatbot Called');
          var url = '/knobots/'+this.robot_id+'/chat/train';
          axios.get(url
          ).then(resp => {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('FAILURE!!');
          });
        },
        runChatbot: function() {
          console.log('runChatbot Called');
          var url = '/knobots/'+this.robot_id+'/chat/run';
          axios.get(url
          ).then(resp => {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            this.syscmd_feedback = JSON.parse(resp.data);
            console.log('FAILURE!!');
          });
        },
        listMedia: function() {
          console.log('listMedia Called');
          var url = '/knobots/'+this.robot_id+'/media/list';
          var out = '';
          axios.get(url
          ).then(resp => {
            this.media = JSON.parse(resp.data);
            console.log('SUCCESS!!'+this.media);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        playMedium: function() {
          console.log('playMedium Called');
          var div = document.getElementById('mediaplace');
          if (this.draw_face_interval != null)
            clearInterval(this.draw_face_interval);
          console.log('playing Medium: '+this.selected_media_index+'/'+this.selected_media_type);
          if (div != null) {
            while (div.firstChild) {
              div.removeChild(div.firstChild);
            }
            if (this.selected_media_name != '') {
              if (this.selected_media_type == 1) {
                var img = document.createElement("img");
                img.src = '/media/'+this.selected_media_name;
                img.width = '600';
                div.appendChild(img);
              } else if (this.selected_media_type == 2) {
                var audio = document.createElement("audio");
                audio.src = '/media/'+this.selected_media_name;
                audio.width = '600';
                audio.controls = 'true';
                div.appendChild(audio);
                audio.play();
              } else if (this.selected_media_type == 3) {
                var video = document.createElement("video");
                video.src = '/media/'+this.selected_media_name;
                video.width = '600';
                video.controls = 'true';
                div.appendChild(video);
                video.play();
              } else if (this.selected_media_type == 0) {
                var iframe = document.createElement("iframe");
                iframe.src = '/media/'+this.selected_media_name;
                iframe.width = '600';
                div.appendChild(iframe);
              } else if (this.selected_media_type == 4) {
                console.log('launcing tele');
                var url = "/knobots/"+this.robot._id+"/tele";
                window.location.replace(url);
              } else if (this.selected_media_type == 5) {
                console.log('closing tele');
                var url = "/knobots/"+this.robot._id+"/screen";
                window.location.replace(url);
              } else if (this.selected_media_type == 6) {
                console.log('launcing vconf');
                this.conference_window = window.open(this.selected_media_name,'_zoom')
                window.location.replace(url);
              } else if (this.selected_media_type == 7) {
                console.log('closing vconf');
                this.conference_window.close();
              }
            } else {
              var canvas = document.createElement("canvas");
              canvas.setAttribute("id", "face_canvas");
              canvas.width = 800;
              canvas.height = 600;
              div.appendChild(canvas);
            }
          }
        },
        drawFace: function() {
          var canvas = document.getElementById('face_canvas');
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var capacity = this.current_battery_capacity;
          var text = '('+capacity+'%)';
          var color = 'back';
          if (capacity > 70) {
            color = 'green';
          } else if (capacity > 50) {
            color = 'blue';
          } else {
            color = 'red';
          }
          context.font = "20px Arial Black";
          context.fillStyle = color;
          context.fillText(text, 360, 200);
          //smiley
          context.strokeStyle = color;
          context.lineWidth = 5;
          context.beginPath();
          context.arc(400, 200, 180, 0, 2 * Math.PI);
          // context.fill();
          context.stroke();
          context.closePath();
          //eyes
          // context.fillStyle = 'white';
          context.beginPath();
          context.arc(330, 100, 30, 0, 2 * Math.PI);
          // context.fill();
          context.stroke();
          context.closePath();
          context.beginPath();
          context.arc(470, 100, 30, 0, 2 * Math.PI);
          // context.fill();
          context.stroke();
          context.closePath();
          //mouth
          context.strokeStyle = color;
          context.lineWidth = 5;
          context.beginPath();
          if (capacity > 70) {
            context.arc(400, 200, 100, 1/3, Math.PI - 1/3);
          } else if (capacity > 50) {
            context.moveTo(320, 280);
            context.lineTo(480, 280);
          } else {
            context.arc(400, 350, 100, 1/3 + Math.PI, 2* Math.PI - 1/3);
          }
          context.stroke();
          context.closePath();
        },
        telePlayMedium: function() {
          console.log('telePlayMedium Called');
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          console.log('tele Playing Medium: '+this.selected_media_index+'/'+this.selected_media_type);
          if (this.selected_media_name != '') {
            let txt = this.robot_id+'#'+user+'#tele#'+this.selected_media_type+':'+this.selected_media_name;
            let mission = new ROSLIB.Message({data: txt});
            this.mission_control_topic.publish(mission);
            console.log('sent tele message: '+txt)
          }
        },
        telepresenceCall: function() {
          console.log('telepresenceCall Called');
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          let txt = this.robot_id+'#'+user+'#tele#4:'+user;
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          console.log('sent tele message: '+txt)
        },
        telepresenceOff: function() {
          console.log('telepresenceOff Called');
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          let txt = this.robot_id+'#'+this.user_id+'#tele#5:'+user;
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          console.log('sent tele message: '+txt)
        },
        videoconferenceCall: function() {
          console.log('videoconferenceCall Called');
          console.log('createVideoconference called');
          var url = '/knobots/'+this.robot_id+'/conference';
          var telepresence = null;
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          axios.post(url,
          ).then(resp => {
            telepresence = JSON.parse(resp.data);
            console.log('SUCCESS!!');
            let txt = this.robot_id+'#'+user+'#tele#6:'+telepresence.start;
            let mission = new ROSLIB.Message({data: txt});
            this.mission_control_topic.publish(mission);
            console.log('sent tele message: '+txt)
            this.conference_window = window.open(telepresence.join,telepresence.zoom);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        videoconferenceOff: function() {
          console.log('videoconferenceOff Called');
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          let txt = this.robot_id+'#'+this.user_id+'#tele#7:'+user;
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          console.log('sent tele message: '+txt)
          this.conference_window.close();
        },
        // launches the workflow passed as parameter via service call
        workflowAction: function(par) {
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/change_workflow',
              serviceType : 'jobot_msgs/set_string'
            });
            var workflowName = par;
            console.log('workflowAction: workflow '+workflowName);
            this.request = new ROSLIB.ServiceRequest({
              data: workflowName
            });
            this.service.callService(this.request, function(result) {
              console.log('Result for service call on '+workflowName);
              // console.dir(result);
              console.log(result);
            });
          }
        },
        // activates a vision control action via service call
        visionAction: function(par) {
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/depthai_control',
              serviceType : 'jobot_msgs/set_string'
            });
            console.log('vision: '+par);
            var cmd = par;
            if (par.localeCompare('start|flrn') == 0)
              cmd = cmd + '|' + this.face_nick_name;
            this.request = new ROSLIB.ServiceRequest({
              data: cmd
            });
            this.service.callService(this.request, function(result) {
              console.log('Result for vision call '+cmd);
              // console.dir(result);
              console.log(result);
            });
          }
        },
        // activates and deactivates follow me behaviour via service call
        followAction: function(par) {
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/toggle_followme',
              serviceType : 'std_srvs/SetBool'
            });
            console.log('followme: '+par);
            var cmd = par;
            this.request = new ROSLIB.ServiceRequest({
              data: cmd
            });
            this.service.callService(this.request, function(result) {
              console.log('Result for follow me call '+cmd);
              console.log('Success: '+result.success+' Message: '+result.message);
            });
          }
        },
        // activates a play audio via service call the audio file path is passed as parameter
        playAudio: function(audioFilePath) {
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/play_audio',
              serviceType : 'jobot_msgs/set_string'
            });
            this.request = new ROSLIB.ServiceRequest({
              data: audioFilePath
            });
            this.service.callService(this.request, function(result) {
              console.log('Result for service call for play audio '+audioFilePath+': '+result);
              return(result);
            });
          }
        },
        // activates the tts interface via service call ... the text is passed as parameter
        sayText: function(text) {
          if (this.ros != null) {
            this.service = new ROSLIB.Service({
              ros : this.ros,
              name : '/say_text',
              serviceType : 'jobot_msgs/set_string'
            });
            this.request = new ROSLIB.ServiceRequest({
              data: text
            });
            this.service.callService(this.request, function(result) {
              console.log('Result for service call for say text '+text+': '+result);
              return(result);
            });
          }
        },
        autoDock: function(action) {
          console.log('autoDock: start '+action);
          if (action.localeCompare('undock') == 0) {
            this.sendActionDock(false);
          } else if (action.localeCompare('dock') == 0) {
            this.sendActionDock(true);
          } else if (action.localeCompare('cancel') == 0) {
            this.cancelActionDock();
          } else {
            console.log('autoDock: wrong command');
          }
          console.log('autoDock: end '+action);
        },
        // waits action executor pars milliseconds
        execWait: function(par) {
          this.missionLog('executing wait: '+par);
          var towait = parseInt(par);
          if (isNaN(towait))
            this.runTask();
          else {
            setTimeout(() => {
                    console.log('wait: current waited '+towait);
                    this.runTask();
              },towait*1000);
          }
        },
        // activates follow me behaviour if par is on else deactivates the behaviour
        execFollowMe: function(par) {
          this.missionLog('executing followme: '+par);
          if (par.localeCompare('on') ==0) {
            followAction(true);
          } else {
            followAction(false);
          }
          this.runTask();
        },
        // goto action executor
        execGoto: function(par) {
          this.missionLog('executing goto: '+par);
          console.log('goto: label '+par);
          var idx = -1;
          for (let i = 0; i < this.current_mission.tasks.length; i++) {
            if (this.current_mission.tasks[i].label.localeCompare(par) ==0 )
              idx = i;
          }
          if (idx >= 0) {
            this.current_mission_task = idx - 1;
            this.runTask();
          } else {
            console.log('goto: label not found '+par);
            current_fallback_action = '';
            missionError('goto: label not found '+par);
          }
        },
        // move action executor
        execMove: function(par) {
          this.missionLog('executing move: '+par);
          console.log('move: started '+par);
          var pars = par.split(':');
          if (pars.length == 2) {
            var h = parseFloat(pars[0]);
            var v = parseFloat(pars[1]);
            if (isNaN(h) || isNaN(v) || (h < -0.5) || (h > 0.5) || (v < -0.5) || (v > 0.5)) {
              this.missionError('move: error '+par);
              console.log('move: error '+par);
            } else {
              this.sendMove(h,v);
              console.log('move: done '+par);
            }
          } else {
            this.missionError('move: error '+par);
            console.log('move: error '+par);
          }
          this.runTask();
        },
        // velocoty action executor
        execVelocity: function(par) {
          this.missionLog('executing velocity: '+par);
          console.log('velocity: started '+par);
          var pars = par.split(':');
          if (pars.length == 2) {
            var x = parseFloat(pars[0]);
            var z = parseFloat(pars[1]);
            if (isNaN(x) || isNaN(z) || (x < -0.5) || (x > 0.5) || (z < -0.5) || (z > 0.5)) {
              this.missionError('velocity: error '+par);
              console.log('velocity: error '+par);
            } else {
              this.sendVelocity(x,z);
              console.log('velocity: done '+par);
            }
          } else {
            this.missionError('velocity: error '+par);
            console.log('velocity: error '+par);
          }
          this.runTask();
        },
        // workflow action executor
        execWorkflow: function(par) {
          this.missionLog('executing workflow: '+par);
          console.log('workflow: called '+par);
          if (app.current_workflow_name.localeCompare(par) != 0) {
            app.running_mission_workflow = true;
            this.workflowAction(par);
          } else {
            console.log('workflow: completed '+app.current_mission_par);
            app.runTask();
          }
        },
        // docking action executor
        execDocking: function(par) {
          this.missionLog('executing docking: '+par);
          console.log('docking: called '+par);
          if ((par.localeCompare('dock') == 0) || (par.localeCompare('undock') == 0) || (par.localeCompare('cancel') ==0)) {
            this.running_mission_docking = true;
            this.autoDock(par);
            console.log('docking: launched '+app.current_mission_par);
          } else {
            console.log('docking: completed wrong parameter '+par);
            app.runTask();
          }
        },
        // vision action executor
        execVision: function(par) {
          this.missionLog('executing vision: '+par);
          console.log('vision: called '+par);
          this.visionAction(par);
          console.log('vision: completed '+par);
          this.runTask();
        },
        // detection action executor
        execDetect: function(par) {
          this.missionLog('executing detect: '+par);
          console.log('detect: called '+par);
          // target:action:par:delay
          var pars = par.split(':');
          if (pars.length != 4) {
            this.missionError('detect: error '+par);
            console.log('detect: error '+par);
          } else {
            this.oak_detections_target = pars[0];
            this.oak_detected_action = pars[1];
            this.oak_detected_action_pars = pars[2];
            this.oak_detected_delay = parseInt(pars[3])*1000;
            this.oak_detected_target = false;
            this.oak_detected_when = Date.now();
            this.setOak();
            console.log('detect: completed '+par);
          }
          app.runTask();
        },
        // completes the detection action execution, when detection message is received handles the response action
        whenDetected: function () {
          this.oak_detected_target = false;
          var now = Date.now();
          if (now - this.oak_detected_when > this.oak_detected_delay) {
            if (this.oak_detected_action.localeCompare('audio') == 0) {
              this.missionLog('detected target: playing audio '+this.oak_detected_action_pars);
              this.playAudio(this.oak_detected_action_pars);
            } else if (this.oak_detected_action.localeCompare('say') == 0) {
              this.missionLog('detected target: saying text '+this.oak_detected_action_pars);
              this.sayText(this.oak_detected_action_pars);
            } else if (this.oak_detected_action.localeCompare('eval') == 0) {
              this.missionLog('detected target: evaluating'+this.oak_detected_action_pars);
              eval(this.oak_detected_action_pars);
            }
            this.oak_detected_when = Date.now();
          }
        },
        // play audio executor
        execPlayAudio: function(par) {
          this.missionLog('executing audio: '+par);
          console.log('audio: called '+par);
          var result = this.playAudio(par);
          console.log('audio: completed '+par);
          app.runTask();
        },
        // text to speack (say) action executor
        execSayText: function(par) {
          this.missionLog('executing say: '+par);
          console.log('say: called '+par);
          var result = this.sayText(par);
          console.log('say: completed '+par);
          app.runTask();
        },
        execMap: function(par) {
          this.missionLog('executing map: '+par);
          this.current_map = par;
          if (this.loadMap()) {
            this.readMapInfo();
            app.runTask();
          } else {
            this.missionError('executing map: error cannot load map');
          }
        },
        execTele: function(par) {
          this.missionLog('executing tele: '+par);
          var user = 'anonymous';
          if (this.user_id != '')
            user = this.user_id;
          var pars = par.split(':');
          if (pars.length == 2) {
            let txt = this.robot_id+'#'+user+'#tele#'+pars[0]+':'+pars[1];
            let mission = new ROSLIB.Message({data: txt});
            this.mission_control_topic.publish(mission);
            console.log('sent tele message: '+txt);
            app.runTask();
          } else {
            this.missionError('executing tele: error in parameters');
          }
        },
        // navigation goal executor ... completed by goal topic
        execGoal: function(par) {
          this.missionLog('executing navigation goal: '+par);
          console.log('goal: started '+par);
          var found = false;
          var x = 0.0;
          var y = 0.0;
          var z = 0.0;
          for (let goal of this.current_map.goals) {
            if (goal.name == par) {
              console.log('goal: '+par+' found ('+goal.x+','+goal.y+','+goal.z+')');
              found = true;
              x = goal.x;
              y = goal.y;
              z = goal.z;
            }
          }
          if (found ) {
            console.log('goal: found ('+x+','+y+','+z+')');
            this.action.aux.x = x;
            this.action.aux.y = y;
            this.action.aux.z = z;
            app.running_mission_goal = true;
            this.current_event.goal = par;
            this.current_action_start = Date.now();
            this.sendActionGoal();
            this.current_event.distance = this.robot_goal_distance;
          } else {
            console.log('goal: completed '+par+' not found!');
            this.runTask();
          }
        },
        // main function of the mission controller ... run a single task
        runTask: function () {
          this.current_mission_task = this.current_mission_task + 1;
          this.missionLog('runtask : '+this.current_mission_task);
          // this.execWhens();
          if ( !this.running_mission || (this.current_mission_task < 0) ||
            (this.current_mission_task >= this.current_mission.tasks.length)) {
            this.running_mission = false;
            this.current_event.start = this.current_mission_start;
            this.unsetOak();
            // setting mission completed event
            this.current_event.end = Date.now();
            this.current_event.action = 'mission';
            this.current_event.goal = '000000000000000000000000';
            this.current_event.parameters = '';
            this.current_event.distance = 0;
            this.current_event.result = 2;
            this.sendEvent();
            console.log('run mission completed');
          } else {
            spec = this.current_mission.tasks[this.current_mission_task];
            this.current_action_start = Date.now();
            console.log('runTask ['+this.current_mission_task+']');
            console.log('runTask label:['+spec.label+']');
            console.log('runTask condition:['+spec.condition+']');
            console.log('runTask type:['+spec.type+']');
            console.log('runTask parameters:['+spec.parameters+']');
            console.log('runTask timeout:['+spec.timeout+']');
            console.log('runTask parameters:['+spec.fallback+']');
            // if pars start with @ it is a variable and we get the value
            if (spec.parameters.startsWith('@')) {
              spec.parameters = eval(spec.parameters.substring(1));
            }
            if (spec.parameters.startsWith('#')) {
              spec.parameters = this.current_parameters_values[parseInt(spec.parameters.substring(1))];
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
                this.current_action_timeout = this.current_action_start + delta*1000;
            } else this.current_action_timeout = 0;
            this.current_action_fallback = spec.fallback;
            if (condition) { // the action is not executed if condition is already met
              this.current_mission_par = spec.parameters;
              if (spec.type.localeCompare('wait') ==0)
                this.execWait(spec.parameters);
              else if (spec.type.localeCompare('goto') ==0)
                this.execGoto(spec.parameters);
              else if (spec.type.localeCompare('move') ==0)
                this.execMove(spec.parameters);
              else if (spec.type.localeCompare('velocity') ==0)
                this.execVelocity(spec.parameters);
              else if (spec.type.localeCompare('workflow') ==0)
                this.execWorkflow(spec.parameters);
              else if (spec.type.localeCompare('audio') ==0)
                this.execPlayAudio(spec.parameters);
              else if (spec.type.localeCompare('goal') ==0)
                this.execGoal(spec.parameters);
              else if (spec.type.localeCompare('vision') ==0)
                this.execVision(spec.parameters);
              else if (spec.type.localeCompare('detect') ==0)
                this.execDetect(spec.parameters);
              else if (spec.type.localeCompare('docking') ==0)
                this.execDocking(spec.parameters);
              else if (spec.type.localeCompare('followme') ==0)
                this.execFollowMe(spec.parameters);
              else if (spec.type.localeCompare('say') ==0)
                this.execSayText(spec.parameters);
              else if (spec.type.localeCompare('map') ==0)
                this.execMap(spec.parameters);
              else if (spec.type.localeCompare('tele') ==0)
                this.execTele(spec.parameters);
              else if (spec.type.localeCompare('eval') ==0) {
                console.log('eval: called '+spec.parameters);
                eval(spec.parameters);
                console.log('eval: completed '+spec.parameters);
                this.runTask();
              } else if (spec.type.localeCompare('sub') ==0) { // start sub
                if (this.current_subroutine_return <= 0) { // sub declaration
                  this.current_subroutines.push({ name: spec.parameters, start: this.current_mission_task});
                  this.current_mission_task = this.current_mission_task + 1;
                  while (this.current_mission.tasks[this.current_mission_task].type.localeCompare('end') != 0)
                    this.current_mission_task = this.current_mission_task + 1;
                  this.runTask();
                } else {
                  this.runTask();
                }
              } else if (spec.type.localeCompare('end') ==0) { // end sub return
                 this.current_mission_task = this.current_subroutine_return;
                 this.current_subroutine_return = 0;
                 this.runTask();
              } else if (spec.type.localeCompare('call') ==0) {
                if (this.current_subroutine_return <= 0) { // execute sub
                  var subid = -1;
                  for (var i = 0; i < this.current_subroutines.length; i++) {
                    if (this.current_subroutines[i].name.localeCompare(spec.parameters) == 0)
                      subid = i;
                  }
                  if (subid >= 0) {
                    this.current_subroutine_return = this.current_mission_task;
                    this.current_mission_task = this.current_subroutines[subid].start;
                    this.runTask();
                  } else console.log('runTask runtime error call not found '+this.current_mission_task);
                } else { // error nested call
                  console.log('runTask runtime error nested call at line '+this.current_mission_task);
                }
              } else
                console.log('runTask unknown type '+spec.type);
            } else {
              this.runTask();
            }
          }
        },
        // stops mission execution
        pauseMission: function() {
          this.missionLog('executing pause: '+this.current_mission_task);
          this.running_mission = false;
        },
        // restarts mission execution
        playMission: function() {
          this.missionLog('executing play: '+this.current_mission_task);
          this.running_mission = true;
          this.current_action_start = Date.now();
          this.current_mission_task -= 1;
          this.runTask();
        },
        // stops mission execution and sets error status and log message
        missionError: function(text) {
          this.running_mission = false;
          this.running_mission_error = true;
          this.running_mission_log = text;
        },
        // logs message from mission
        missionLog: function(text) {
          this.running_mission_log = text;
        },
        // runs a mission
        runMission: function() {
          this.missionLog('executing run mission');
          this.readMapInfo();
          console.log('run mission started');
          this.running_mission_error = false;
          this.running_mission = true;
          this.current_mission_task = -1;
          this.running_mission_goal = false;
          this.running_mission_workflow = false;
          this.running_mission_docking = false;
          this.unsetOak();
          this.current_mission_par = '';
          this.current_mission_start = Date.now();
          this.current_subroutines.splice(0,this.current_subroutines.length);
          this.current_parameters_values.splice(0,this.current_parameters_values.length);
          if (this.current_mission_parameters != null)
            this.current_parameters_values = this.current_mission_parameters.split(':');
          this.runTask();
        },
        // cancels a mission
        cancelMission: function() {
          this.missionLog('executing cancel mission');
          console.log('cancel mission started');
          this.running_mission = false;
          this.running_mission_error = false;
          this.running_mission_goal = false;
          this.running_mission_workflow = false;
          this.running_mission_docking = false;
          this.unsetOak();
          this.current_mission_par = '';
          this.current_mission_task = -1;
          // this.action_client.cancel();
          this.current_event.start = this.current_mission_start;
          // setting mission cancel event
          this.current_event.end = Date.now();
          this.current_event.action = 'mission';
          this.current_event.goal = '000000000000000000000000';
          this.current_event.parameters = '';
          this.current_event.distance = 0;
          this.current_event.result = 1;
          this.sendEvent();
          console.log('cancel mission completed');
        },
        // setting up communication channel with selfcontrol
        selfcontrol: function () {
          if (this.mission_control_topic == null) {
            this.mission_control_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/mission_control',
              messageType : 'std_msgs/String'
            });
          }
          if (this.mission_log_topic == null) {
            this.mission_log_topic = new ROSLIB.Topic({
              ros : this.ros,
              name : '/mission_log',
              messageType : 'std_msgs/String'
            });
            this.mission_log_topic.subscribe(function(message) {
              if (app.isScreen || app.isTele) {
                app.tele_control_message = message.data;
                console.log('telecontrol received: '+message.data);
                var msg = app.tele_control_message.split('#');
                if (msg.length == 4 && (msg[2].localeCompare('tele') == 0)) {
                  var med = msg[3].split(':');
                  app.selected_media_index = 0;
                  app.selected_media_type = med[0];
                  app.selected_media_name = med[1]+':'+med[2]; // to pass urls like https://something/?...
                  console.log('calling tele');
                  app.playMedium();
                }
              }
              app.missionLog(message.data);
            });
          }
        },
        // sends mission to the robot via database
        robotSend: function () {
          this.missionLog('sending robot mission');
          var url = '/knobots/'+this.robot_id+'/sched';
          var now = Date.now();
          var sched = {
            robot: this.robot_id,
            user: this.user_id,
            mission: this.current_mission.name,
            parameters: this.current_mission_parameters,
            at: now,
            repeat: 0
          };
          axios.post(url, sched
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
          this.missionLog('robot mission sent');
        },
        // sends lock to the robot ... now you can safely interact
        robotLock: function () {
          this.missionLog('sending robot lock');
          let txt = this.robot_id+'#'+this.user_id+'#lock';
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          this.missionLog('robot lock sent');
        },
        // sends unlock to the robot ... now you cannot safely interact
        robotUnlock: function () {
          this.missionLog('sending robot unlock');
          let txt = this.robot_id+'#'+this.user_id+'#unlock';
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          this.missionLog('robot unlock sent');
        },
        // sends cancel mission to the robot
        robotCancel: function () {
          this.missionLog('sending robot cancel');
          let txt = this.robot_id+'#'+this.user_id+'#cancel';
          let mission = new ROSLIB.Message({data: txt});
          this.mission_control_topic.publish(mission);
          this.missionLog('robot cancel sent');
        },
        // sends a log event
        sendEvent: function() {
          var url = '/knobots/'+this.robot_id+'/log';
          axios.post(url, this.current_event
          ).then(resp => {
            console.log('SUCCESS!!');
            console.dir(JSON.parse(resp.data));
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        // gets all the events registered in a database (need some filter)
        getEvents: function() {
          var url = '/knobots/'+this.robot_id+'/log';
          axios.get(url
          ).then(resp => {
            this.all_events = JSON.parse(resp.data);
            console.log('SUCCESS!!');
            console.dir(this.events);
          }).catch(function() {
            console.log('FAILURE!!');
          });
        },
        selectEvents: function() {
          console.log('selectEvents started');
          var sdate = new Date(this.selected_date);
          var sday = sdate.getDate();
          var smonth = sdate.getMonth();
          var syear = sdate.getFullYear();
          this.events.splice(0,this.events.length);
          for (var i = 0; i <this.all_events.length; i++) {
              var eventdate = new Date(this.all_events[i].start);
              if (eventdate.getDate() === sday && eventdate.getMonth() === smonth && eventdate.getFullYear() === syear)
                this.events.push(this.all_events[i]);
          }
          console.log('selectEvents ended');
        },
        // apps methods
        delivery_action: function() {
          console.log('delivery action called');
          var url = '/knobots/'+this.robot_id+'/sched';
          var now = Date.now();
          var usr = '000000000000000000000000';
          if (this.user_id != null)
            usr = this.user_id;
          var pars = this.current_map.goals[this.selected_point_index].name+':'+this.delivery_message;
          var sched = {
            robot: this.robot_id,
            user: usr,
            mission: 'AppDelivery',
            parameters: pars,
            at: now,
            repeat: 0
          };
          axios.post(url, sched
          ).then(resp => {
            this.robot = JSON.parse(resp.data);
            console.log('SUCCESS!!');
          }).catch(function() {
            console.log('FAILURE!!');
          });
          this.running_mission_log = 'Going to '+this.current_map.goals[this.selected_point_index].name+' to say: "'+this.delivery_message+'"';
        },
        followme_action: function() {
          this.workflowAction('JobotDefaultNavigationWorkflow');
          this.followAction(true);

        }
    },
    // when vuejs mounted sets all the important stuff depending on page content and connects
    mounted: function() {
        window.addEventListener('mouseup', this.stopDrag);
        const robot_id = document.getElementById('robot_id');
        this.robot_id = robot_id.value;
        this.current_event.robot = this.robot_id;
        const user_id = document.getElementById('current_user_id');
        if (user_id != null) {
          this.user_id = user_id.value;
          this.current_event.user = user_id.value;
        }
        const connecturl = document.getElementById('connecturl');
        this.rosbridge_address = connecturl.value;
        const myimage = document.getElementById('my_image');
        this.isImage = (myimage != null);
        const myimageonce = document.getElementById('my_image_once');
        this.isImageOnce = (myimageonce != null);
        const oakimage = document.getElementById('my_oak');
        this.isOak = (oakimage != null);
        const mymap = document.getElementById('my_map');
        this.isMap = (mymap != null);
        const status = document.getElementById('status');
        this.isStatus = (status != null);
        const screen = document.getElementById('screen');
        this.isScreen = (screen != null);
        const tele = document.getElementById('tele');
        this.isTele = (tele != null);
        const pose = document.getElementById('pose');
        this.isPose = (pose != null);
        const nav= document.getElementById('mapnavigator');
        this.isNav = (nav != null);
        const touch= document.getElementById('touchscreen');
        this.isTouch = (touch != null);
        const url = '/knobots/'+this.robot_id+'/info';
        axios.get( url
        ).then(resp => {
          this.robot = JSON.parse(resp.data);
          console.log('robot: ');
          console.dir(this.robot);
        });
        this.connect();
    },
    // before unmount disconnects
    beforeUnmount: function() {
      this.disconnect();
    }
})
