const express          = require("express"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose");

//APP CONFIG 
mongoose.connect("mongodb://ivan:database1@ds135305.mlab.com:35305/blogappp",{useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//MONGOOSE CONFIG
const   blogSchema = new mongoose.Schema({
        title :"String",
        body  :"String",
        created: {type: Date , default: Date.now},
});

const Blog = mongoose.model("Blog", blogSchema);

//INDEX ROUTES
app.get("/", (req,res)=>{
    res.redirect("/blogs");    
});

app.get("/blogs",  (req, res)=>{
    Blog.find({},(err, blogs)=>{
       if(err){
           console.log("WE HAVE A PROBLEM");
       } else {
          res.render("index", {blog:blogs});    
       }
    });
});

// NEW ROUTE 
app.get("/blogs/new", (req,res)=>{
   res.render("new"); 
});
// CREATE ROUTE
app.post("/blogs", (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err,newBlog)=>{
        if(err){
            res.render("new");
            console.log(`ERROR CREATING A NEW BLOG, ${err}`);
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
app.get("/blogs/:id/edit",(req, res) =>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
       if(err){
           res.send("made a mistake");
       } else {
           res.render("edit", {blog : foundBlog});
       }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
});
//DELETE ROUTE
app.delete("/blogs/:id",(req, res)=>{
   Blog.findByIdAndRemove(req.params.id, (err)=>{
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