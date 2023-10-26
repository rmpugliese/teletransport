const Robot = require('../models/robot');
const Mission = require('../models/mission');
const Event = require('../models/event');
const Schedule = require('../models/schedule');
const Telepresence = require('../models/telepresence');
const fs = require('fs');
const child_process = require('child_process');
const nodemailer = require('nodemailer');
const requestPromise = require("request-promise");
const jwt = require("jsonwebtoken");
const git = require('git-last-commit');

require("dotenv").config();

const transporter = nodemailer.createTransport({
 port: process.env.MAIL_PORT,
 host: process.env.MAIL_HOST,
});

function TTsendMail(mailfrom, mailto, mailsubject, mailtext) {
  var mailOptions = {
    from: mailfrom,
    to: mailto,
    subject: mailsubject,
    text: mailtext,
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports.showConnect = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    }
    if (robot.model == 'viqi') {
    	  res.render('knobots/viqi', { robot });
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobot', { robot });
    } else if (robot.connecturl.startsWith("http")) {
	    res.redirect(robot.connecturl);
    } else {
        req.flash('error', 'Cannot find that robot driver!');
        return res.redirect('/robots');
    }
}

module.exports.showMedia = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotMedia', { robot });
    } else {
        req.flash('error', 'Cannot find that robot media driver!');
        return res.redirect('/robots');
    }
}

module.exports.showTelepresence = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotTelepresence', { robot });
    } else {
        req.flash('error', 'Cannot find that robot telepresence driver!');
        return res.redirect('/robots');
    }
}

module.exports.showTele = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotTele', { robot });
    } else {
        req.flash('error', 'Cannot find that robot tele driver!');
        return res.redirect('/robots');
    }
}

module.exports.showConference = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotConference', { robot });
    } else {
        req.flash('error', 'Cannot find that robot conference driver!');
        return res.redirect('/robots');
    }
}

module.exports.showVision = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotVision', { robot });
    } else {
        req.flash('error', 'Cannot find that robot camera driver!');
        return res.redirect('/robots');
    }
}

module.exports.showControl = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	     res.render('knobots/jobotControl', { robot });
    } else {
        req.flash('error', 'Cannot find that robot control driver!');
        return res.redirect('/robots');
    }
}

module.exports.showMapper = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	     res.render('knobots/jobotMapper', { robot });
    } else {
        req.flash('error', 'Cannot find that robot mapper driver!');
        return res.redirect('/robots');
    }
}

module.exports.showVoice = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	    res.render('knobots/jobotVoice', { robot });
    } else {
        req.flash('error', 'Cannot find that robot voice driver!');
        return res.redirect('/robots');
    }
}

module.exports.showNav = async (req, res,) => {
    const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
	     res.render('knobots/jobotNav', { robot });
    } else {
        req.flash('error', 'Cannot find that robot navigation driver!');
        return res.redirect('/robots');
    }
}

module.exports.showStat = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotStat', { robot });
    } else {
        req.flash('error', 'Cannot find that robot statisticts driver!');
        return res.redirect('/robots');
    }
}

module.exports.showMap = async (req, res,) => {
    const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotMap', { robot });
    } else {
        req.flash('error', 'Cannot find that robot map driver!');
        return res.redirect('/robots');
    }
}
// saves the map file in map.jpg
module.exports.saveMap = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('saveMap: '+req.params.id);
    tempmap = req.file.path;
    // req.file.path, filename: req.file.filename
    console.log('Copy in map.jpg tempmap: '+tempmap);
    fs.rename(tempmap, 'public/maps/map.jpg', (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("temp map file saved successfully");
      }
    });
    // await robot.save();
    // robot = await Robot.findById(req.params.id).populate([missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

// saves the media file in media folder
module.exports.saveMedia = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('saveMedia: '+req.params.id);
    tempmedia = req.file.path;
    newmedia = 'public/media/'+req.file.originalname;
    // req.file.path, filename: req.file.filename
    console.log('Copy in media tempmap: '+tempmedia);
    fs.rename(tempmedia, newmedia, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("temp media file moved successfully");
      }
    });
    res.render('knobots/jobotMedia', { robot });
}

// saves the map json file in map.json
module.exports.saveJsonMap = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('saveJsonMap: '+req.params.id);
    const map = req.body;
    let data = JSON.stringify(map);
    let filepath = '';
    filepath = 'public/maps/map.json';
    console.log('filepath: '+filepath);
    console.log('map data: '+data);
    try {
      fs.writeFileSync(filepath, data);
    } catch(err) {
      console.error(err);
    }
    res.json(data);
}

// saves the map json file in map_name.json
module.exports.saveJsonMapName = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('saveJsonMapName: '+req.params.id);
    const map_name = req.params.name;
    let filepath = '';
    if (map_name != '')
      filepath = 'public/maps/'+map_name+'.json';
    else
     filepath = 'public/maps/map.json';
    const map = req.body;
    let data = JSON.stringify(map);
    console.log('filepath: '+filepath);
    console.log('map data: '+data);
    try {
      fs.writeFileSync(filepath, data);
    } catch(err) {
      console.error(err);
    }
    res.json(data);
}

// execute script get-map
module.exports.getMap = async (req, res,) => {
  console.log('getMap: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const exec = child_process.exec;
  mycommand = '/util/scripts/get-map';
  console.log(mycommand);
  const command = mycommand;

  exec(command, function(error, stdout, stderr) {
      console.log('getMap start');
      if (error) {
          console.log('getMap error:'+error);
          res.sendStatus(500);
      } else {
          let out = stdout.toString();
          console.log('getMap end');
          res.json(JSON.stringify(out));
      }
  });
}

// execute script load-map with the specific map_name
module.exports.loadMapName = async (req, res,) => {
  console.log('laodMap: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const map_name = req.params.name;
  const exec = child_process.exec;
  mycommand = '/util/scripts/load-map '+map_name;
  console.log(mycommand);
  const command = mycommand;

  exec(command, function(error, stdout, stderr) {
      console.log('laodMap start');
      if (error) {
          console.log('laodMap error:'+error);
          res.sendStatus(500);
      } else {
          let out = stdout.toString();
          console.log('laodMap end');
          res.json(JSON.stringify(out));
      }
  });
}

// return the content of the json file as a json
module.exports.readMap = async (req, res,) => {
  console.log('readMap: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  let filepath = '';
  // filepath = '/opt/teletransport-main/public/maps/map.json';
  filepath = 'public/maps/map.json';
  fs.readFile(filepath, (error, data) => {
    console.log('readMap start file: '+filepath);
    if (error) {
      console.log('readMap error:'+error);
      res.sendStatus(500);
    } else {
      let map = JSON.parse(data);
      console.log('readMap end map: '+map);
      res.json(JSON.stringify(map));
    }
  });
}

// return the content of the json file name as a json
module.exports.readMapName = async (req, res,) => {
  console.log('readMapName: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const map_name = req.params.name;
  let filepath = '';
  if (map_name != '')
    filepath = 'public/maps/'+map_name+'.json';
  else
   filepath = 'public/maps/map.json';
  fs.readFile(filepath, (error, data) => {
    console.log('readMapName start file: '+filepath);
    if (error) {
      console.log('readMapName error:'+error);
      res.sendStatus(500);
    } else {
      let map = JSON.parse(data);
      console.log('readMap end map: '+map);
      res.json(JSON.stringify(map));
    }
  });
}

// return the list of available maps
module.exports.listMaps = async (req, res,) => {
  console.log('listMaps: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const mapsFolder = 'public/maps';
  let mapnames = [];

  fs.readdir(mapsFolder, (error, files) => {
    if (error) {
      console.log('listMaps error:'+error);
      res.sendStatus(500);
    } else {
      files.forEach(file => {
       if (file.indexOf('.json') >= 0) {
         mapnames.push(file.split('.')[0]);
       }
      });
      console.log('listMaps end map: '+mapnames);
      res.json(JSON.stringify(mapnames));
    }
  });
}

// return the list of available media (0 text, 1 image, 2 audio, 3 video, 4 vconf call, 5 vconf hang, -1 unknown)
module.exports.listMedia = async (req, res,) => {
  console.log('listMedia: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const mediaFolder = 'public/media';
  let media = [];

  fs.readdir(mediaFolder, (error, files) => {
    if (error) {
      console.log('listMedia error:'+error);
      res.sendStatus(500);
    } else {
      files.forEach(file => {
       if ((file.indexOf('.jpeg') >= 0) || file.indexOf('.png') >= 0) {
         media.push({name: file, type: 1,});
       } else if ((file.indexOf('.mp3') >= 0) || file.indexOf('.wav') >= 0) {
         media.push({name: file, type: 2,});
       } else if ((file.indexOf('.mp4') >= 0) || file.indexOf('.wmv') >= 0) {
         media.push({name: file, type: 3,});
       } else if ((file.indexOf('.txt') >= 0) || file.indexOf('.html') >= 0) {
         media.push({name: file, type: 0,});
       } else {
         media.push({name: file, type: -1,});
       }
      });
      console.log('listMedia end: ');
      // console.dir(media);
      res.json(JSON.stringify(media));
    }
  });
}

// return the list of available chatbot files
module.exports.listChatbots = async (req, res,) => {
  console.log('listChatbots: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const chatbotsFolder = 'public/chatbots';
  let chatfiles = [];

  fs.readdir(chatbotsFolder, (error, files) => {
    if (error) {
      console.log('listChatbots error:'+error);
      res.sendStatus(500);
    } else {
      files.forEach(file => {
       if ((file.indexOf('.yml') >= 0) || file.indexOf('.py') >= 0) {
         chatfiles.push(file);
       }
      });
      console.log('listChatbots end');
      // console.dir(media);
      res.json(JSON.stringify(chatfiles));
    }
  });
}

// return the content of the chatbot file
module.exports.readChatbot = async (req, res,) => {
  console.log('readChatbot: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const chatbotname = req.params.name;
  console.log(chatbotname);
  let filepath = '';
  filepath = 'public/chatbots/'+chatbotname;
  console.log(filepath);
  fs.readFile(filepath, (error, data) => {
    console.log('readChatbot start file: '+filepath);
    if (error) {
      console.log('readChatbot error:'+error);
      res.sendStatus(500);
    } else {
      let txt = data.toString();
      let chatbotfile = {
          name: chatbotname,
          content: txt,
      };
      let jscbf = JSON.stringify(chatbotfile);
      res.json(jscbf);
    }
  });
}

// saves the chatbot file
module.exports.saveChatbot = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('saveChatbot: '+req.params.id);
    const chatbot = req.body;
    console.dir(chatbot);
    let filepath = '';
    filepath = 'public/chatbots/'+chatbot.name;
    console.log('filepath: '+filepath);
    console.log('chatfile content: '+chatbot.content);
    try {
      fs.writeFileSync(filepath, chatbot.content);
    } catch(err) {
      console.error(err);
    }
    res.json(filepath);
}

// execute script chatbot-train
module.exports.trainChatbots = async (req, res,) => {
  console.log('trainChatbots: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const map_name = req.params.name;
  const exec = child_process.exec;
  mycommand = '/util/scripts/chatbot-train';
  console.log(mycommand);
  const command = mycommand;

  exec(command, function(error, stdout, stderr) {
      console.log('trainChatbots start');
      if (error) {
          console.log('trainChatbots error:'+error);
          res.sendStatus(500);
      } else {
          let out = stdout.toString();
          console.log('trainChatbot end');
          res.json(JSON.stringify(out));
      }
  });
}

// execute script chatbot-run
module.exports.runChatbots = async (req, res,) => {
  console.log('runChatbots: '+req.params.id);
  robot = await Robot.findById(req.params.id);
  const map_name = req.params.name;
  const exec = child_process.exec;
  mycommand = '/util/scripts/chatbot-run';
  console.log(mycommand);
  const command = mycommand;

  exec(command, function(error, stdout, stderr) {
      console.log('runChatbots start');
      if (error) {
          console.log('runChatbots error:'+error);
          res.sendStatus(500);
      } else {
          let out = stdout.toString();
          console.log('runChatbots end');
          res.json(JSON.stringify(out));
      }
  });
}

module.exports.addMission = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('addMission: '+req.params.id);
    const mission = new Mission(req.body);
    robot.missions.push(mission);
    await mission.save();
    await robot.save();
    // console.dir(mission);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.deleteMission = async (req, res,) => {
    const { id, missionId } = req.params;
    console.log('deleteMission: '+id+'/'+missionId);
    robot = await Robot.findByIdAndUpdate(id, { $pull: { missions: missionId } });
    await Mission.findByIdAndDelete(missionId);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.updateMission = async (req, res,) => {
    const { id, missionId } = req.params;
    console.log('updateMission: '+id+'/'+missionId);
    robot = await Robot.findByIdAndUpdate(id, { $pull: { missions: missionId } });
    await Mission.findByIdAndDelete(missionId);
    const mission = new Mission(req.body);
    robot.missions.push(mission);
    await mission.save();
    await robot.save();
    // console.dir(mission);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.addSched = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('addSched: '+req.params.id);
    const sched = new Schedule(req.body);
    robot.schedules.push(sched);
    await sched.save();
    await robot.save();
    //console.dir(sched);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.deleteSched = async (req, res,) => {
    const { id, schedId } = req.params;
    console.log('deleteSched: '+id+'/'+schedId);
    robot = await Robot.findByIdAndUpdate(id, { $pull: { schedules: schedId } });
    await Schedule.findByIdAndDelete(schedId);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.updateSched = async (req, res,) => {
    const { id, schedId } = req.params;
    console.log('updateSched: '+id+'/'+schedId);
    robot = await Robot.findByIdAndUpdate(id, { $pull: { schedules: schedId } });
    await Schedule.findByIdAndDelete(schedId);
    const sched = new Schedule(req.body);
    robot.schedules.push(sched);
    await sched.save();
    await robot.save();
    // console.dir(sched);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.createTelepresence = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('createTelepresence: '+req.params.id);
    const telepres = new Telepresence(req.body);
    // console.dir(telepres);
    var email = process.env.ZOOM_ACCONT_ID; // your zoom developer email account
    const payload = {
      iss: process.env.API_KEY, //your API KEY
      exp: new Date().getTime() + 3600,
    };
    const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE
    var topic = "ViQi Zoom Meeting ["+telepres.who+" -> "+telepres.whom+" @ "+telepres.where+"]";
    var options = {
      method: "POST",
      uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
      body: {
        topic: topic, //meeting title
        duration: telepres.duration,
        type: 2, // 1 instant meeting
        start_time: telepres.when,
        // jbh_time: true,
        settings: {
          host_video: "true",
          participant_video: "true",
        },
      },
      auth: {
        bearer: token,
      },
      headers: {
        "User-Agent": "Zoom-api-Jwt-Request",
        "content-type": "application/json",
      },
      json: true, //Parse the JSON string in the response
    };
    // console.dir(options);
    requestPromise(options)
      .then(function (response) {
        console.log("response is: ", response.topic);
        console.log("zoom is: ", response.id);
        telepres.zoom = response.id;
        console.log("start is: ", response.start_url);
        telepres.start = response.start_url;
        console.log("join is: ", response.join_url);
        telepres.join = response.join_url;
        const jsresponse = JSON.stringify(telepres);
        res.json(jsresponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log("API call failed, reason ", err);
      });
}

module.exports.addTelepresence = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('addTelepresence: '+req.params.id);
    const telepres = new Telepresence(req.body);
    robot.telepresences.push(telepres);
    await telepres.save();
    await robot.save();
    const mailtext = 'telepresence on '+telepres.when.toString()+' zoom link: '+telepres.join;
    const mailto = telepres.email;
    // const mailfrom = 'no-reply@teletransport.visionqub.it';
    const mailfrom = process.env.MAIL_FROM;
    const mailsubject = 'Telepresence Notification';
    console.log('sending');
    TTsendMail(mailfrom, mailto, mailsubject, mailtext);
    //console.dir(sched);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.deleteTelepresence = async (req, res,) => {
    const { id, telepresenceId } = req.params;
    console.log('deleteTelepresence: '+id+'/'+telepresenceId);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    var telepres = robot.telepresences.find(tp => tp._id == telepresenceId );
    // console.dir(telepres);
    var email = process.env.ZOOM_ACCONT_ID; // your zoom developer email account
    const payload = {
      iss: process.env.API_KEY, //your API KEY
      exp: new Date().getTime() + 3600,
    };
    const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE
    var options = {
      method: "DELETE",
      uri: "https://api.zoom.us/v2/meetings/"+telepres.zoom,
      body: {
      },
      auth: {
        bearer: token,
      },
      headers: {
        "User-Agent": "Zoom-api-Jwt-Request",
        "content-type": "application/json",
      },
      json: true, //Parse the JSON string in the response
    };
    // console.dir(options);
    requestPromise(options)
      // API call successful ...
      .then(function (response) {
        console.log("API call successful: deleted meeting ",telepres.zoom);
      })
      .catch(function (err) {
        // API call failed...
        console.log("API call failed, reason ", err);
      });
    robot = await Robot.findByIdAndUpdate(id, { $pull: { telepresences: telepresenceId } });
    await Telepresence.findByIdAndDelete(telepresenceId);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.listTelepresences = async (req, res,) => {
  console.log('listTelepresences: '+req.params.id);
  const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
  let d = new Date();
  // console.log(d.getYear(),d.getMonth(),d.getDate());
  let telepresences = robot.telepresences;
  // console.log(robot.telepresences[0].when.getYear(),robot.telepresences[0].when.getMonth(),robot.telepresences[0].when.getDate());
  let telepres = telepresences.filter((el) => el.when.getYear() == d.getYear() &&
                                              el.when.getMonth() == d.getMonth() &&
                                              el.when.getDate() == d.getDate() );
  res.json(JSON.stringify(telepres));
}

module.exports.setDestinations = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('setDestinations: '+req.params.id);
    const destinations = req.body;
    console.dir(destinations);
    robot.destinations = destinations
    await robot.save();
    //console.dir(sched);
    robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.listDestinations = async (req, res,) => {
    console.log('listDestinations: '+req.params.id);
    const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot.destinations);
    res.json(jsrobot);
}

module.exports.createConference = async (req, res,) => {
    robot = await Robot.findById(req.params.id);
    console.log('createConference: '+req.params.id);
    const telepres = new Telepresence();
    // console.dir(telepres);
    var email = process.env.ZOOM_ACCONT_ID; // your zoom developer email account
    const payload = {
      iss: process.env.API_KEY, //your API KEY
      exp: new Date().getTime() + 3600,
    };
    const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE
    var topic = "Instant Zoom Meeting @["+robot.serial+"]";
    var options = {
      method: "POST",
      uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
      body: {
        topic: topic, //meeting title
        type: 1, // 1 instant meeting
        // jbh_time: true,
        settings: {
          host_video: "true",
          participant_video: "true",
        },
      },
      auth: {
        bearer: token,
      },
      headers: {
        "User-Agent": "Zoom-api-Jwt-Request",
        "content-type": "application/json",
      },
      json: true, //Parse the JSON string in the response
    };
    // console.dir(options);
    requestPromise(options)
      .then(function (response) {
        console.log("response is: ", response.topic);
        console.log("zoom is: ", response.id);
        telepres.zoom = response.id;
        console.log("start is: ", response.start_url);
        telepres.start = response.start_url;
        console.log("join is: ", response.join_url);
        telepres.join = response.join_url;
        const jsresponse = JSON.stringify(telepres);
        res.json(jsresponse);
      })
      .catch(function (err) {
        // API call failed...
        console.log("API call failed, reason ", err);
      });
}

module.exports.getInfo = async (req, res,) => {
    console.log('getInfo: '+req.params.id);
    const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    const jsrobot = JSON.stringify(robot);
    res.json(jsrobot);
}

module.exports.getGit = async (req, res,) => {
    console.log('getGit: '+req.params.id);
    git.getLastCommit(function(err, commit) {
      // read commit object properties
      const jsgit = JSON.stringify(commit);
      console.log(commit);
      res.json(jsgit);
    });
}

module.exports.getLog = async (req, res,) => {
    console.log('getLog: '+req.params.id);
    const events = await Event.find({ robot: req.params.id });
    res.json(JSON.stringify(events));
}

module.exports.setLog = async (req, res,) => {
  console.log('setLog: '+req.params.id);
  console.dir(req.body);
  const event = new Event(req.body);
  console.dir(event);
  await event.save();
  const jsevent = JSON.stringify(event);
  console.log('setLog jsevent: '+jsevent)
  res.json(jsevent);
}

module.exports.showSched = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotSched', { robot });
    } else {
        req.flash('error', 'Cannot find that robot scheduling driver!');
        return res.redirect('/robots');
    }
}

module.exports.showEdit = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotEdit', { robot });
    } else {
        req.flash('error', 'Cannot find that robot editing driver!');
        return res.redirect('/robots');
    }
}

module.exports.getNet = async (req, res,) => {
    console.log('getNet start: '+req.params.id);
    const exec = child_process.exec;
    // const command = 'nmcli -t --fields SSID device wifi list|sort|uniq';
    // const mycommand = 'nmcli -t -fields SSID,SIGNAL dev wifi list';
    // const mycommand = 'sudo /sbin/iw dev wlp58s0 scan|grep SSID|sort|uniq';
    const mycommand = '/util/scripts/list-wifi';
    console.log(mycommand);
    const command = mycommand;
    // const command = 'pwd';
    exec(command, function(error, stdout, stderr) {
        console.log('getNet exec start');
        if (error) {
            console.log('getNet error:'+error);
            res.sendStatus(500);
        } else {
            let wifilist = stdout.toString().split("\n");
            let wl = wifilist.length -1 ;
            if (wifilist[wl] == '') { wifilist.length = wl; }
            console.log('getNet exec end');
            console.dir(wifilist);
            res.json(JSON.stringify(wifilist));
        }
    });
}

module.exports.setNet = async (req, res,) => {
    console.log('setNet start: '+req.params.id);
    console.log('setNet body: ');
    console.dir(req.body);
    const exec = child_process.exec;
    // const mycommand = 'sudo nmcli dev wifi connect '+req.body.ssid+' password '+req.body.password;
    const mycommand = '/util/scripts/set-wifi '+req.body.ssid+' '+req.body.password;
    console.log(mycommand);
    // const command = 'pwd';
    const command = mycommand;
    exec(command, function(error, stdout, stderr) {
        console.log('setNet exec start');
        if (error) {
            console.log('setNet error:'+error);
            res.sendStatus(500);
        } else {
            let out = stdout.toString();
            console.log('setNet exec end');
            res.json(JSON.stringify(out));
        }
    });
}

module.exports.delNet = async (req, res,) => {
    console.log('delNet start: '+req.params.id);
    console.log('delNet body: ');
    console.dir(req.body);
    const exec = child_process.exec;
    // const mycommand = 'sudo nmcli c down '+req.body.ssid;
    const mycommand = '/util/scripts/del-wifi '+req.body.ssid;
    console.log(mycommand);
    // const command = 'pwd';
    const command = mycommand;
    exec(command, function(error, stdout, stderr) {
        console.log('delNet exec start');
        if (error) {
            console.log('delNet error:'+error);
            res.sendStatus(500);
        } else {
            let out = stdout.toString();
            console.log('delNet exec end');
            res.json(JSON.stringify(out));
        }
    });
}

module.exports.getMacAddr = async (req, res,) => {
    console.log('getMacAddr start: '+req.params.id);
    const exec = child_process.exec;
    const mycommand = '/util/scripts/get-wifi-mac';
    console.log(mycommand);
    const command = mycommand;
    // const command = 'pwd';
    exec(command, function(error, stdout, stderr) {
        console.log('getMacAddr exec start');
        if (error) {
            console.log('getMacAddr error:'+error);
            res.sendStatus(500);
        } else {
            let macaddr = stdout.toString();
            console.log('getMacAddr exec end'+macaddr);
            res.json(JSON.stringify(macaddr));
        }
    });
}

module.exports.getIpAddr = async (req, res,) => {
    console.log('getIpAddr start: '+req.params.id);
    const exec = child_process.exec;
    const mycommand = '/util/scripts/get-wifi-ipv4';
    console.log(mycommand);
    const command = mycommand;
    // const command = 'pwd';
    exec(command, function(error, stdout, stderr) {
        console.log('getIpAddr exec start');
        if (error) {
            console.log('getIpAddr error:'+error);
            res.sendStatus(500);
        } else {
            let ipaddr = stdout.toString();
            console.log('getIpAddr exec end'+ipaddr);
            res.json(JSON.stringify(ipaddr));
        }
    });
}

module.exports.getNameAddr = async (req, res,) => {
    console.log('getNameAddr start: '+req.params.id);
    const exec = child_process.exec;
    const mycommand = '/util/scripts/get-fqdn';
    console.log(mycommand);
    const command = mycommand;
    // const command = 'pwd';
    exec(command, function(error, stdout, stderr) {
        console.log('getNameAddr exec start');
        if (error) {
            console.log('getNameAddr error:'+error);
            res.sendStatus(500);
        } else {
            let nameaddr = stdout.toString();
            console.log('getNameAddr exec end'+nameaddr);
            res.json(JSON.stringify(nameaddr));
        }
    });
}

module.exports.showConfig = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotConfig', { robot });
    } else {
        req.flash('error', 'Cannot find that robot configuration driver!');
        return res.redirect('/robots');
    }
}

module.exports.showMission = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotMission', { robot });
    } else {
        req.flash('error', 'Cannot find that robot scheduling driver!');
        return res.redirect('/robots');
    }
}

module.exports.showSched = async (req, res,) => {
    const robot = await Robot.findById(req.params.id).populate(['missions','schedules','telepresences']);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotSched', { robot });
    } else {
        req.flash('error', 'Cannot find that robot scheduling driver!');
        return res.redirect('/robots');
    }
}

module.exports.showScreen = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotScreen', { robot });
    } else {
        req.flash('error', 'Cannot find that robot scheduling driver!');
        return res.redirect('/robots');
    }
}

module.exports.showTouch = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotTouch', { robot });
    } else {
        req.flash('error', 'Cannot find that robot scheduling driver!');
        return res.redirect('/robots');
    }
}

module.exports.showApps = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotApps', { robot });
    } else {
        req.flash('error', 'Cannot find that robot apps driver!');
        return res.redirect('/robots');
    }
}

module.exports.showAppRobotMedia = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotAppRobotMedia', { robot });
    } else {
        req.flash('error', 'Cannot find that robot App Robot Media driver!');
        return res.redirect('/robots');
    }
}

module.exports.showAppDelivery = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotAppDelivery', { robot });
    } else {
        req.flash('error', 'Cannot find that robot App Delivery driver!');
        return res.redirect('/robots');
    }
}

module.exports.showAppFollowMe = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotAppFollowMe', { robot });
    } else {
        req.flash('error', 'Cannot find that robot App Follow Me driver!');
        return res.redirect('/robots');
    }
}

module.exports.showSaratoga = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotSaratoga', { robot });
    } else {
        req.flash('error', 'Cannot find that Saratoga robot driver!');
        return res.redirect('/robots');
    }
}

module.exports.showChatbot = async (req, res,) => {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
        req.flash('error', 'Cannot find that robot!');
        return res.redirect('/robots');
    } else if (robot.model == 'jobot') {
        res.render('knobots/jobotChatbot', { robot });
    } else {
        req.flash('error', 'Cannot find that robot Chatbot driver!');
        return res.redirect('/robots');
    }
}

module.exports.execSysCmd = async (req, res,) => {
    console.log('execSysCmd: '+req.params.id);
    robot = await Robot.findById(req.params.id);
    const cmdname = req.params.cmdId;
    const exec = child_process.exec;
    const mycommand = '/util/scripts/'+cmdname;
    console.log(mycommand);
    exec(mycommand, function(error, stdout, stderr) {
        console.log('execSysCmd start');
        if (error) {
            console.log('execSysCmd error:'+error);
            res.sendStatus(500);
        } else {
            let out = stdout.toString();
            console.log('execSysCmd end '+cmdname);
            res.json(JSON.stringify(out));
        }
    });
}
