/**
 * Created by hama on 2016/11/22.
 */
var mongo = require('./db');
//设计处理对象
function Picture(name,picture){
    //发布照片的用户
    this.name = name;
    //以上是查询的条件

    //下面才是真正的存储内容.
    this.picture = picture;
}
//保存照片到个人相册的方法
Picture.prototype.save = function(callback){
    var name = this.name;
    var picture = this.picture;
    //搜集一下信息
    mongo.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongo.close();
                return callback(err);
            }
            //保存照片到对应的用户的pictures字段里面去.
            collection.update({
                "name":name,
            },{
                $push:{"pictures":picture}
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
module.exports = Picture;