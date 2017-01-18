/**
 * Created by Administrator on 2016/12/30.
 */
var mongo = require('./db');
var markdown = require('markdown').markdown;
function Post(name,idpicture,post,picture) {
    this.name = name;
    this.post = post;
    this.picture = picture;
    this.idpicture = idpicture;
}
module.exports = Post;
//保存文章
Post.prototype.save  = function(callback){
    var date = new Date();
    //保存当前时间的各种格式
    var time = {
        date:date,
        year:date.getFullYear() + '-' +
        (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() + ':' + date.getSeconds()),
        month:(date.getMonth() + 1),
        day:date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    //我们要保存的数据
    var post = {
        name:this.name,
        time:time,
        post:this.post,
        //新增的留言字段
        comments:[],
        picture:this.picture,
        idpicture:this.idpicture,
        likes:[],
        //点赞
        // pv:0
    }
    //接下来就是常规的打开数据库->读取posts集合->内容插入->关闭数据库
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                //如果没有错的情况下,保存文章，不需要返回数据.
                callback(null);
            })
        })
    })
}
Post.idpicture = function (name,idpicture,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
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
            },{multi:true},function(err){
                mongo.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
Post.getAll = function(name,callback){
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //查询
            collection.count(query,function(err,total){
                //total是查询的文章总数量
                collection.find(query,{
                    //根据当前的页数算出每页开始的位置pageStart
                    skip: 0,
                    //pageSize 理解为步长
                    limit:10
                }).sort({
                    time:-1
                }).toArray(function(err,docs){
                    mongo.close();
                    if(err){
                        return callback(err);
                    }
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null,docs,total);
                })
            })
        })
    })
}
//可以根据用户名、发布时间、文章标题来查询某一篇具体的文章
Post.getOne = function(name,minute,callback){
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "time.year":minute,
            },function(err,doc){
                if(err){
                    mongo.close();
                    return callback(err);
                }
                mongo.close();
                //markdown解析一下
                doc.post = markdown.toHTML(doc.post);
                //把留言的内容用markdown解析一下
                doc.comments.forEach(function(comment){
                    comment.content = markdown.toHTML(comment.content);
                })
                callback(null,doc);
            })
        })
    })
}
Post.remove = function(name,minute,callback){
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            collection.remove({
                "name":name,
                "time.year":minute,
            },{
                w:1
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
// 点赞
Post.like = function (name,time,likeName,callback) {
    mongo.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('posts',function (err,collection) {
            if(err){
                return callback(err);
            }
            collection.update({
                "name":name,
                "time.year":time,
            },{
                $push:{"likes":likeName}
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
// 取消点赞