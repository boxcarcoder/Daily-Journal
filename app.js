//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

var postArr = [];
var currentPostTitle;
var currentPostBody;

// default content if no edits are saved in the writer collection
var homeContent = "Welcome to my personal blog. The webpages you see here, as well as the database to store blog posts, are all set up by me! I am an aspiring software engineer, on the journey to better myself every day. Whether it's honing my programming skills, practicing photo compositions, or reading books on my hobbies, it is time to improve myself on a regular basis. I created this blog website to keep track of my progress on all facets. ";
var aboutContent = "My name is Brendan Cheng and I am currently 24 years of age. Professionally, I am a software engineer currently in the aerospace industry, primarily programming in C++. I am currently putting my focus into web development, learning full stack development. The thought of being able to create my own web applications is very exciting! The possibilities seem endless to what I can create. \n\n Outside of software engineering, I am developing a passion for media, with a focus on photo composition and film composition. Memories are precious, so why not take the best photos? I am also interested in film composition so I can create videos that I can share. Sharing is caring after all!"
var contactContent = "Email: brendancheng333@gmail.com \n\n Portfolio: https://github.com/boxcarcoder";

// create the schema for new posts
const postSchema = new mongoose.Schema({
  title: String,
  body: String
});

// create a model of a post & create a posts collection
const Post = mongoose.model("Post", postSchema);

// create schema, model, and collection for writer info (home, about me, contact)
const writerSchema = new mongoose.Schema({
  title: String,
  body: String
});

const Writer = new mongoose.model("Writer", writerSchema);

mongoose.connect('mongodb://localhost:27017/blogDB', {useNewUrlParser: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res) {

  // call find() on posts collection to return all docs in the collection
  Post.find({}, function(err, returnedPosts) {
    if (err) {
      console.log("Error in returning posts from the collection.");
    }
    else if (returnedPosts.length === 0) {
      // if there are no posts, display the homepage. postArr will be empty.
      res.render("home", {homePage: homeContent, totalPosts: postArr});
    }
    else {
      // if there are posts in the collection, display them
      returnedPosts.forEach(function(posts){
        postArr.push(posts);
      });

      //as soon as server is loaded, we get here. Find home content from writer collection
      Writer.findOne({"title": "Home"}, {}, { sort:{'_id': -1} }, function(err, homeInfo) { //find the latest Home entry in writers collection
        if (err) {
          console.log("Error in getting home content from the writer collection.");
        }
        else if (homeInfo == null) { //if there are no saved home entries, display default home entry
          res.render("home", {homePage: homeContent, totalPosts: postArr});
          postArr = []; //to prevent repeated docs being displayed every time we redirect to home page
        }
        else {
          homeContent = homeInfo.body;
          res.render("home", {homePage: homeContent, totalPosts: postArr});
          postArr = []; //to prevent repeated docs being displayed every time we redirect to home page
        }
      });
    }
  });
});

//post requests to /composeBtn are from the form action in home.ejs
app.post("/composeBtn", function(req,res) {
  //when there is a post request to /composeBtn (defined in home.ejs), redirect to compose page
  res.redirect("/compose");
});

//access /about thru href defined in header.ejs
app.get("/about", function(req,res) {
  Writer.findOne({"title": "About"}, {}, { sort:{'_id': -1} }, function(err, aboutInfo) { //find the latest about me entry in writers collection
    if (err) {
      console.log("Error in getting about content from the writer collection.");
    }
    else if (aboutInfo == null) { //if there are no saved about me entries, display default about me entry
      res.render("about", {aboutPage: aboutContent});
    }
    else {
      aboutContent = aboutInfo.body;
      res.render("about", {aboutPage: aboutContent});
    }
  });
});

//access /contact thru href defined in header.ejs
app.get("/contact", function(req,res) {
  Writer.findOne({"title": "Contact"}, {}, { sort:{'_id': -1} }, function(err, contactInfo) {
    if (err) {
      console.log("Error in getting contact content from the writer collection.");
    }
    else if (contactInfo == null) {
      res.render("contact", {contactPage: contactContent});
    }
    else {
      contactContent = contactInfo.body;
      res.render("contact", {contactPage: contactContent});
    }
  });
});

//access /compose thru href defined in header.ejs
app.get("/compose", function(req, res) {
  res.render("compose");
});

//post requests to /compose are from the form action in compose.ejs
app.post("/compose", function(req,res) {

  // use the Post model to create a new post document
  let post = new Post({
    title: req.body.inputTitle,
    body: req.body.inputPost
  });

  // save into posts collection
  post.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

//access /posts/:postID thru hrefs defined in home.ejs
app.get("/posts/:postID", function(req,res) {
  // console.log(req.params.postID)

  // search thru Post collection for an ID of the requested id (req.params.postID)
  // req.params is for route paramaters (express routing), not form data. Req.body is form data
  Post.findOne({_id: req.params.postID}, function(err, foundPost){
    if (!err) {
      //console.log(foundPost.title);
      res.render("post", {postTitle: foundPost.title, postContent: foundPost.body});
      currentPostTitle = foundPost.title; //get the post title of the corresponding post ID
      currentPostBody = foundPost.body;
    }
  });
});

//post requests to /deletePost are from the form action in post.ejs
//when delete is pressed, delete from collection and redirect to home page
app.post("/deletePost", function(req,res) {
  //currentPostTitle is found when we go to a post's individual page
  Post.findOneAndDelete({"title" : currentPostTitle}, function(err) {
    if (!err) {
      res.redirect("/");
    }
    else {
      console.log("Error while deleting document from collection");
    }
  });

});

//post requests to /editPost are from the form action in post.ejs
app.post("/editPost", function(req, res) {
  //currentPostTitle is found when we go to a post's individual page
  res.render("editPost", {postTitle: currentPostTitle, postContent: currentPostBody});

});

// now that editPost page is rendered, it will provide a post method to /editPost
//post requests to /editPost2 are from the form action in editPost.ejs
app.post("/editPost2", function(req,res) {

  //update the document specified by the post title from Post collection
  //update the body field of the document with currentPostTitle as its title
  Post.findOneAndUpdate({"title": currentPostTitle}, {"body": req.body.inputPost },  function(err) {
    if (!err) {
      console.log("Successfully updated document in collection");
      res.redirect("/");
    }
    else {
      console.log("Error while deleting document from collection");
    }
  });
});

// access /editHome from home.ejs's href tag
app.get("/editHome", function(req,res) {
  res.render("editHome");
});

// post requests to /editHome are from editHome.ejs
app.post("/editHome", function(req,res) {
  // use the writer model to create a new writerInfo document
  let writer = new Writer ({
    title: "Home",
    body: req.body.inputHome
  });

  // save into writerInfo collection
  writer.save(function(err) {
    if (!err) {
      homeContent = req.body.inputHome;
      res.redirect("/");
    }
  });
});

// post requests to /editAbout are from about.ejs's form action
app.post("/editAbout", function(req, res) {
  res.render("editAbout");
});

// post requests to /editAbout are from editAbout.ejs
app.post("/editAbout2", function(req,res) {
  let writer = new Writer ({
    title: "About",
    body: req.body.inputAbout
  });

  writer.save(function(err) {
    if (!err) {
      aboutContent = req.body.inputAbout;
      res.redirect("/about");
    }
  });
});


// post requests to /editContact are from contact.ejs
app.post("/editContact", function(req, res) {
  res.render("editContact");
});

// post requests to /editContact2 is from editContact.ejs
app.post("/editContact2", function(req, res) {
  let writer = new Writer ({
    title: "Contact",
    body: req.body.inputContact
  });

  writer.save(function(err) {
    if (!err) {
      contactContent = req.body.inputContact;
      res.redirect("/contact");
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
