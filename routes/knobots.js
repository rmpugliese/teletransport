const express = require('express');
const router = express.Router();
const knobots = require('../controllers/knobots');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRobot, validateGoal } = require('../middleware');
const multer = require('multer');
const upload = multer({ dest: 'public/maps/' })

const Robot = require('../models/robot');

router.route('/:id')
    .get(catchAsync(knobots.showConnect))

router.route('/:id/media')
    .get(catchAsync(knobots.showMedia))
    .post(upload.single('file'),catchAsync(knobots.saveMedia))

router.route('/:id/media/list')
    .get(catchAsync(knobots.listMedia))

router.route('/:id/chat/list')
    .get(catchAsync(knobots.listChatbots))
router.route('/:id/chat/train')
    .get(catchAsync(knobots.trainChatbots))
router.route('/:id/chat/run')
    .get(catchAsync(knobots.runChatbots))
router.route('/:id/chat/:name')
    .get(catchAsync(knobots.readChatbot))
router.route('/:id/chat/:name')
    .post(catchAsync(knobots.saveChatbot))

router.route('/:id/telepresence')
    .get(catchAsync(knobots.showTelepresence))

router.route('/:id/conference')
    .get(catchAsync(knobots.showConference))
    .post(catchAsync(knobots.createConference))

router.route('/:id/control')
    .get(catchAsync(knobots.showControl))

router.route('/:id/nav')
    .get(catchAsync(knobots.showNav))

router.route('/:id/mapper')
    .get(catchAsync(knobots.showMapper))

router.route('/:id/map')
    .get(catchAsync(knobots.showMap))
    .put(upload.single('file'),catchAsync(knobots.saveMap))
    .post(catchAsync(knobots.saveJsonMap))

router.route('/:id/map/get')
    .get(catchAsync(knobots.getMap))

router.route('/:id/map/read')
    .get(catchAsync(knobots.readMap))
router.route('/:id/map/:name/read')
    .get(catchAsync(knobots.readMapName))

router.route('/:id/map/:name/save')
    .post(catchAsync(knobots.saveJsonMapName))
router.route('/:id/map/:name/load')
    .get(catchAsync(knobots.loadMapName))

router.route('/:id/map/list')
    .get(catchAsync(knobots.listMaps))

router.route('/:id/info')
    .get(catchAsync(knobots.getInfo))

router.route('/:id/git')
    .get(catchAsync(knobots.getGit))

router.route('/:id/sys/:cmdId')
    .get(catchAsync(knobots.execSysCmd))

router.route('/:id/mission')
    .get(catchAsync(knobots.showMission))
    .post(catchAsync(knobots.addMission))

router.route('/:id/mission/:missionId')
    .delete(catchAsync(knobots.deleteMission))
    .put(catchAsync(knobots.updateMission))

router.route('/:id/voice')
    .get(catchAsync(knobots.showVoice))

router.route('/:id/stat')
    .get(catchAsync(knobots.showStat))

router.route('/:id/apps')
    .get(catchAsync(knobots.showApps))

router.route('/:id/chatbot')
    .get(catchAsync(knobots.showChatbot))

router.route('/:id/appRobotMedia')
    .get(catchAsync(knobots.showAppRobotMedia))

router.route('/:id/appDelivery')
    .get(catchAsync(knobots.showAppDelivery))

router.route('/:id/appFollowMe')
    .get(catchAsync(knobots.showAppFollowMe))

router.route('/:id/saratoga')
    .get(catchAsync(knobots.showSaratoga))

router.route('/:id/sched')
    .get(catchAsync(knobots.showSched))
    .post(catchAsync(knobots.addSched))

router.route('/:id/sched/:schedId')
    .delete(catchAsync(knobots.deleteSched))
    .put(catchAsync(knobots.updateSched))

router.route('/:id/telepresence')
    .post(catchAsync(knobots.addTelepresence))
    .put(catchAsync(knobots.createTelepresence))

router.route('/:id/destinations')
    .post(catchAsync(knobots.setDestinations))
    .get(catchAsync(knobots.listDestinations))

router.route('/:id/telepresence/:telepresenceId')
    .delete(catchAsync(knobots.deleteTelepresence))

router.route('/:id/telepresences')
    .get(catchAsync(knobots.listTelepresences))

router.route('/:id/edit')
    .get(catchAsync(knobots.showEdit))

router.route('/:id/config')
    .get(catchAsync(knobots.showConfig))

router.route('/:id/net')
    .get(catchAsync(knobots.getNet))
    .put(catchAsync(knobots.setNet))

router.route('/:id/macaddr')
  .get(catchAsync(knobots.getMacAddr))

router.route('/:id/delnet')
  .put(catchAsync(knobots.delNet))

router.route('/:id/ipaddr')
  .get(catchAsync(knobots.getIpAddr))

router.route('/:id/nameaddr')
  .get(catchAsync(knobots.getNameAddr))

router.route('/:id/log')
    .get(catchAsync(knobots.getLog))
    .post(catchAsync(knobots.setLog))

router.route('/:id/vision')
    .get(catchAsync(knobots.showVision))

router.route('/:id/screen')
    .get(catchAsync(knobots.showScreen))

router.route('/:id/touch')
    .get(catchAsync(knobots.showTouch))

router.route('/:id/tele')
    .get(catchAsync(knobots.showTele))

module.exports = router;
