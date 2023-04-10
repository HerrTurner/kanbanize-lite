const express = require('express');
const router = express.Router();
const boardController = require('../controller/boardController');

router.get('/boards/:host/:userid', boardController.boards);
router.get('/boardDetails/:host/:boardid', boardController.boardDetails);

module.exports = router;