//登录和注册需要的User类
var User = require('../models/user');
//发表需要的Post类
var Post = require('../models/post');
//引入留言需要的Comment类
var Comment = require('../models/comment');
var Picture = require('../models/pictures');
//需要引入一个加密的模块
var crypto = require('crypto');
//引入multer插件
var multer = require('multer');
//插件的配置信息
var storage = multer.diskStorage({
  //这个是上传图片的地址.
  destination:function(req,file,cb){
    cb(null,'public/images/picture')
  },
  //上传到服务器上图片的名字.
  filename:function(req,file,cb){
    cb(null,file.originalname)
  }
})
var storage1 = multer.diskStorage({
  //这个是上传图片的地址.
  destination:function(req,file,cb){
    cb(null,'public/images/idpicture')
  },
  //上传到服务器上图片的名字.
  filename:function(req,file,cb){
    cb(null,file.originalname)
  }
})
var upload = multer({storage:storage,size:10225});
var upload1 = multer({storage:storage1,size:10225});

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/
function checkLogin(req,res,next) {
  if (!req.session.user) {
    req.flash('error', '未登录!');
    res.redirect('/');
  }
  next();
}
//如果登录了，是无法访问登录和注册页面的
function checkNotLogin(req,res,next) {
  if (req.session.user) {
    req.flash('error', '已登录!');
    res.redirect('back');//返回之前的页面
  }
  next();
}

module.exports = function (app) {
  app.get('/',function (req,res) {
    Post.getAll(null,function(err,posts,total){
      if(err){
        posts = [];
      }
      var date = new Date();
      //保存当前时间的各种格式
      var time = {
        date:date,
        year:date.getFullYear(),
        month:(date.getMonth() + 1),
        day:date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      };
      if(req.session.user){
        User.get(req.session.user.name,function (err,user) {
          if(err){
            req.flash('error','错误');
            return res.redirect('/');
          }
          res.render('index',{
            title:'新浪微博',
            user:user,
            posts:posts,
            time:time,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
          })
        })
      }else {
        res.render('index',{
          title:'新浪微博',
          user:req.session.user,
          posts:posts,
          time:time,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      }
    })
  })
  app.post('/',checkNotLogin);
  app.post('/',function (req,res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name,function(err,user){
      if(!user){
        //说明用户名不存在
        req.flash('error','用户名不存在');
        return res.redirect('/');
      }
      //检查两次密码是否一样
      if(user.password != password){
        req.flash('error','密码错误');
        return res.redirect('/');
      }
      req.session.user = user;
      res.redirect('/');
    })
  })
  app.get('/regist',checkNotLogin);
  app.get('/regist',function (req,res) {
    res.render('regist',{
      title:'微博注册',
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  })
  app.post('/regist',function (req,res) {
    var name = req.body.name;
    var password = req.body.password;
    var password_re = req.body['password-repeat'];
    var email = req.body.email;
    var tel = req.body.tel;
    if(name == '' || password == '' || password_re == '' || email == ''){
      req.flash('error','所有信息必填');
      return res.redirect('/regist');
    }
    // 检查两次密码是否一致
    if(password_re != password){
      req.flash('error','两次输入密码不一致');
      return res.redirect('/regist');
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    
    var newUser = new User({
      name:name,
      password:password,
      email:email,
      tel:tel,
      trueName:'',
      jiguan:'',
      nowPlace:'',
      sex:'',
      birth:'',
      jianjie:'',
      qq:'',
      idpicture:'',
    })
    User.get(newUser.name,function (err,user) {
      if(err){
        req.flash('error',err);
        return res.redirect('/regist');
      }
      if(user){
        req.flash('error','用户名已存在');
        return res.redirect('/regist');
      }
      newUser.save(function (err,use) {
        if(err){
          req.flash('error',err);
        }
        req.flash('success','注册成功');
        res.redirect('/regist');
      })
    })
  })
  // 退出
  app.get('/logout',checkLogin);
  app.get('/logout',function(req,res){
    //1.清除session
    //2.给用户提示
    //3.跳转到首页
    req.session.user = null;
    res.redirect('/');
  })
  // 发布微博
  app.post('/report',checkLogin);
  app.post('/report',upload.array('pic',5),function (req,res) {
    var date = new Date();
    //保存当前时间的各种格式
    var time = {
      date:date,
      year:date.getFullYear(),
      month:(date.getMonth() + 1),
      day:date.getFullYear() + (date.getMonth() + 1) + date.getDate(),
      minute: date.getHours() + ':' +
      (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var currentUser = req.session.user;
      User.get(currentUser.name,function (err,user) {
        var idpicture = user.idpicture;

        var post = new Post(currentUser.name,idpicture,req.body.textarea,req.body.picture);
        var picMessage = {
          time:time,
          picture:req.body.picture
        }
        var picture = new Picture(currentUser.name,picMessage);
        // 保存发布的信息
        post.save(function(err){
          if(err){
            req.flash('error',err);
            return res.redirect('/');
          }
          picture.save(function () {
            if(err){
              req.flash('error',err);
              return res.redirect('/');
            }
            req.flash('success','发布成功');
            res.redirect('/');
          })
        })
      })
  })
  // 评论(微博详情)
  app.get('/comment/:name/:minute',function(req,res){
    Post.getOne(req.params.name,req.params.minute,function(err,post){
      if(err){
        req.flash('error','找不到当前文章');
        return res.redirect('/');
      }
      var date = new Date();
      //保存当前时间的各种格式
      var time = {
        date:date,
        year:date.getFullYear(),
        month:(date.getMonth() + 1),
        day:date.getDate(),
        minute: date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      };
      if(req.session.user){
        User.get(req.session.user.name,function (err,user) {
          if(err){
            req.flash('error','错误');
            return res.redirect('/');
          }
          res.render('comment',{
            title:'新浪微博',
            user:user,
            post:post,
            time:time,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
          })
        })
      }else {
        res.render('comment',{
          title:'新浪微博',
          user:req.session.user,
          post:post,
          time:time,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      }
    })
  })
  // 评论行为
  app.post('/comment/:name/:minute',checkLogin);
  app.post('/comment/:name/:minute',function (req,res) {
    var date = new Date();
    var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = {
      name:req.session.user.name,
      time:time,
      content:req.body.textarea,
      idpicture:req.session.user.idpicture
    }
    var newCommnet = new Comment(req.params.name,req.params.minute,comment);
    newCommnet.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','发布成功');
      res.redirect('back');
    })
  })
  // 删除微博
  app.get('/del/:name/:minute',checkLogin);
  app.get('/del/:name/:minute',function (req,res) {
    Post.remove(req.params.name,req.params.minute,function (err) {
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      res.redirect('back')
    })
  })
  // 个人中心主页
  app.get('/self/index/:name',function (req,res) {
    Post.getAll(req.params.name,function(err,posts,total){
      if(err){
        posts = [];
      }
      var date = new Date();
      //保存当前时间的各种格式
      var time = {
        date:date,
        year:date.getFullYear(),
        month:(date.getMonth() + 1),
        day:date.getDate(),
        minute: date.getHours() + ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      };
      User.get(req.params.name,function (err,user) {
        if(err){
          req.flash('error',err);
          return res.redirect('back');
        }
        res.render('self',{
          title:'新浪微博',
          user:req.session.user,
          name:user,
          kind:'index',
          posts:posts,
          time:time,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      })
    })
  })
  // 个人中心资料页面
  app.get('/self/message/:name',function (req,res) {
    User.get(req.params.name,function (err,user) {
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      res.render('self',{
        title:'新浪微博',
        user:req.session.user,
        kind:'message',
        name:user,
        do:'see',
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })
  // 保存编辑的资料
  app.post('/messageSave',checkLogin);
  app.post('/messageSave',function (req,res) {
    var trueName = req.body.trueName;
    var jiguan = req.body.birthSheng +'-'+ req.body.birthShi;
    var nowPlace = req.body.nowSheng +'-'+ req.body.nowShi;
    var sex = req.body.sex;
    var birth = req.body.birthYear +'-'+ req.body.birthMonth +'-'+ req.body.birthDay;
    var jianjie = req.body.jianjie;
    var email = req.body.email;
    var QQ = req.body.qq;
    var tel = req.body.tel;
    var newMessage = {
      trueName:trueName,
      jiguan:jiguan,
      nowPlace:nowPlace,
      sex:sex,
      birth:birth,
      jianjie:jianjie,
      email:email,
      qq:QQ,
      tel:tel,
    }
    User.edit(req.session.user.name,newMessage,function(err){
      if(err){
        req.flash('error',err);
      }
      req.flash('success','修改成功');
      res.redirect('back');
    })
  })
  // 进入编辑页面
  app.get('/self/message/edit/:name',checkLogin)
  app.get('/self/message/edit/:name',function (req,res) {
    var trueName = req.body.trueName;
    var jiguan = req.body.birthSheng +'-'+ req.body.birthShi;
    var nowPlace = req.body.nowSheng +'-'+ req.body.nowShi;
    var sex = req.body.sex;
    var birth = req.body.birthYear +'-'+ req.body.birthMonth +'-'+ req.body.birthDay;
    var jianjie = req.body.jianjie;
    var email = req.body.email;
    var QQ = req.body.qq;
    var tel = req.body.tel;
    var newMessage = {
      trueName:trueName,
      jiguan:jiguan,
      nowPlace:nowPlace,
      sex:sex,
      birth:birth,
      jianjie:jianjie,
      email:email,
      qq:QQ,
      tel:tel,
    }
    User.edit(req.session.user.name,newMessage,function(err){
      if(err){
        req.flash('error',err);
      }
      res.render('self',{
        title:'新浪微博',
        user:req.session.user,
        kind:'message',
        name:user,
        do:'edit',
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })
  // 个人中心相册
  app.get('/self/picture/:name',function (req,res) {
    Post.getAll(req.params.name,function(err,posts,total){
      if(err){
        posts = [];
      }
      User.get(req.params.name,function (err,user) {
        if(err){
          req.flash('error',err);
          return res.redirect('back');
        }
        res.render('self',{
          title:'新浪微博',
          user:req.session.user,
          name:user,
          kind:'Picture',
          posts:posts,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      })
    })
  })
  // 更改头像
  app.post('/idpicture',checkLogin);
  app.post('/idPicture',upload1.array('idpic',1),function (req,res) {
    var date = new Date();
    //保存当前时间的各种格式
    var time = {
      date:date,
      year:date.getFullYear(),
      month:(date.getMonth() + 1),
      day:date.getFullYear() + (date.getMonth() + 1) + date.getDate(),
      minute: date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var picMessage = {
      time:time,
      picture:req.body.idpicture
    }
    User.idpicture(req.session.user.name,req.body.idpicture,function (err) {
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      Post.getAll(req.session.user.name,function (err,posts,total) {
        if(err){
          req.flash('error',err);
          return res.redirect('back');
        }
        /*for(var i=0;i<total;i++){
          var eachName = posts[i]._id;
          Post.idpicture(eachName,req.body.idpicture,function (err) {
            if(err){
              req.flash('error',err);
            }
          })
        }*/
        posts.forEach(function (post,index) {
          Post.idpicture(post.name,req.body.idpicture,function (err) {
            if(err){
              req.flash('error',err);
            }
          })
        })
        res.redirect('/');
      })
    })
  })
  // 点赞
  app.get('/like/:name/:time',checkLogin)
  app.get('/like/:name/:time',function (req,res) {
    Post.like(req.params.name,req.params.time,req.session.user.name,function (err) {
      if(err){

      }
      var likePost = {
        name:req.params.name,
        time:req.params.time
      }
      User.like(req.session.user.name,likePost,function (err) {
        if(err){

        }
        res.redirect('/');
      })
    })
  })
  // 取消点赞
  app.get('/unlike/:name/:time',checkLogin)
  app.get('/unlike/:name/:time',function (req,res) {
    res.redirect('/');
  })
  app.get('/allLike',checkLogin)
  app.get('/allLike',function (req,res) {
    res.redirect('/')
  })
};
