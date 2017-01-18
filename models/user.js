/**
 * Created by Administrator on 2016/12/28.
 */
// 首先引入数据库连接文件
var mongo = require('./db');
var markdown = require('markdown').markdown;
// 创建一个User类，进行登录和注册设计
function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.tel = user.tel;
}
module.exports = User;

// 保存用户信息的save方法
User.prototype.save = function (callback) {
    var user = {
        name:this.name,
        password:this.password,
        email:this.email,
        tel:this.tel,
        trueName:this.trueName,
        jiguan:this.jiguan,
        nowPlace:this.nowPlace,
        sex:this.sex,
        birth:this.birth,
        jianjie:this.jianjie,
        qq:this.qq,
        idpicture:this.idpicture,
        pictures:[],
        likes:[],
    }
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(user,{safe:true},function (err,user) {
                mongo.close();
                if(err){
                    return callback(err);
                }
                return callback(user);
            })
        })
    })
}
User.edit = function (name,newMessage,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.update({
                "name":name,
            },{
                $set:{
                    trueName:newMessage.trueName,
                    jiguan:newMessage.jiguan,
                    nowPlace:newMessage.nowPlace,
                    sex:newMessage.sex,
                    birth:newMessage.birth,
                    jianjie:newMessage.jianjie,
                    email:newMessage.email,
                    qq:newMessage.qq,
                    tel:newMessage.tel,
                }
            },function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
User.get = function(name,callback){
    //1.打开数据库
    mongo.open(function(err,db){
        //发生错误的时候
        if(err){
            return callback(err);
        }
        //2.还是读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            //查询用户名
            collection.findOne({name:name},function(err,user){
                if(err){
                    return callback(err);
                }
                callback(null,user);//成功返回查询的用户信息.
            })
        })
    })
}
User.idpicture = function (name,idpicture,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.update({
                "name":name,
            },{
                $set:{
                    idpicture:idpicture
                }
            },function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
User.like = function (name,likePost,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('users',function (err,collection) {
            if(err){
                return callback(err);
            }
            collection.update({
                "name":name,
            },{
                $push:{"likes":likePost}
            },function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}