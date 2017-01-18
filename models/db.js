/**
 * Created by Administrator on 2016/12/28.
 */

// 引入数据库配置文件
var settings = require('../setting');
// 引入连接数据库的mongodb模块
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
// 创建数据库连接对象
module.exports = new Db(settings.db,new Server(settings.host,settings.port),{safe:true})