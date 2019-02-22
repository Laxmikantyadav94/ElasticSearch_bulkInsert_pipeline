var express= require("express");
var router= express.Router();
var services = require('./services.js');

router.get('/bulk',services.bulkInsert)

module.exports=router;