var express          = require("express"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose");

//APP CONFIG    
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//MONGOOSE CONFIG
var blogSchema = new mongoose.Schema({
    title :"String",
    body  :"String",
    created: {type: Date , default: Date.now},
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title : "Test Blog",
//     image : "https://privacyblogdotcom.files.wordpress.com/2018/09/kolab_now.png?w=700",
//     body: "HELLO THIS IS A BLOG POST!",
    
// });
//

//INDEX ROUTES
app.get("/", function(req,res){
    res.redirect("/blogs");    
});

app.get("/blogs", function (req, res){
    Blog.find({}, function (err, blogs){
       if(err){
           console.log("WE HAVE A PROBLEM");
       } else {
          res.render("index", {blog:blogs});    
       }
    });
});

// NEW ROUTE 
app.get("/blogs/new", function(req,res){
   res.render("new"); 
});
// CREATE ROUTE
app.post("/blogs", function(req,res){
    //CREATE BLOG
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err,newBlog){
        if(err){
            res.render("new");
            console.log("WHOOPS");
//REDIRECT
        } else{
           res.redirect("/blogs"); 
        }
    });
   
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err,foundBlog){
      if(err){
          res.send(`ERROR FINDING THE BLOG BY ID, ${err}`);
      } else {
          res.render("show", {blog : foundBlog});
      }
   });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.send("made a mistake");
       } else {
           res.render("edit", {blog : foundBlog});
       }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
});
//DELETE ROUTE
app.delete("/blogs/:id",function(req, res){
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
            res.send("ERROR");
       } else {
           res.redirect("/blogs");
       }
   }); 
});




app.listen(process.env.PORT, process.env.IP,() => {
    console.log("The server is running");
});