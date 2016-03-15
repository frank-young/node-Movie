var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')	
var _ = require('underscore')
var Movie = require('./models/movie')	//引入模型
var port = process.env.PORT || 3000	//设置端口
var app = express()		//启动一个web服务器

mongoose.connect('mongodb://localhost/moviedb')

app.set('views','./views/pages')	//设置视图根目录
app.set('view engine','jade')	//设置默认的模板引擎
app.use(bodyParser.urlencoded({ extended: true }))  //输入信息转换
app.use(express.static(path.join(__dirname,'public')))
app.locals.moment = require('moment')
app.listen(port)	//监听这个端口

console.log('nodetest start on port '+port)

//添加路由
//index page
app.get('/',function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err)
		}
		res.render('index',{
			title:'我的电影',
			movies: movies
		})
	})
	
})
//detail page
app.get('/movie/:id',function(req,res){
	var id = req.params.id 		//拿到id的值
	Movie.findById(id,function(err,movie){
		res.render('detail',{
			title:'Myweb --',
			movie:movie
		})
	})
	
})
//list page
app.get('/admin/list',function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err)
		}
		res.render('list',{
			title:'这是列表',
			movies:movies
		})
	})
})

//list delete movie
app.delete('/admin/list',function(req,res){
	var id = req.query.id
	if(id){
		Movie.remove({_id: id},function(err,movie){
			if(err){
				console.log(err)
			}else{
				res.json({success: 1})
			}
		})
	}
})

//admin page
app.get('/admin/movie',function(req,res){
	res.render('admin',{
		title:'后台页面',
		movie:{
			title:'',
			doctor:'',
			country:'',
			year:'',
			poster:'',
			flash:'',
			summary:'',
			language:''
		}
	})
})

//admin update movie
app.get('/admin/update/:id',function(req,res){
	var id = req.params.id 	//从路由传过来的 _id
	if(id){
		Movie.findById(id,function(err,movie){
			res.render('admin',{
				title: '网站后台更新页面',
				movie:movie
			})
		})
	}
})


//admin post movie
app.post('/admin/movie/new',function(req,res){	//一定要记得 /admin 前面的斜杠
	var id = req.body.movie._id
	var movieObj = req.body.movie 	//从路由传过来的 movie对象
	var _movie
	if(id !== 'undefined'){
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err)
			}
			_movie = _.extend(movie,movieObj)	//复制对象的所有属性到目标对象上，覆盖已有属性 ,用来覆盖以前的数据，起到更新作用
			_movie.save(function(err,movie){
				if(err){
					console.log(err)
				}

				res.redirect('/movie/'+movie._id)	//重定向
			})
		})
	}else{	//没有id,那么就添加数据到 _movie上
		_movie = new Movie({
			doctor: movieObj.doctor,	//将传递过来的movie对象的属性赋值到新对象上
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		})
		_movie.save(function(err,movie){
			if(err){
				console.log(err)
			}
			res.redirect('/movie/'+movie._id)
		})
	}

})