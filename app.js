//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

var postArr = [];
var currentPostTitle;
var currentPostBody;

const homeStartingContent = "Welcome to my personal blog. The webpages you see here, as well as the database to store blog posts, are all set up by me! I am an aspiring software engineer, on the journey to better myself every day. Whether it's honing my programming skills, practicing photo compositions, or reading books on my hobbies, it is time to improve myself on a regular basis. I created this blog website to keep track of my progress on all facets. ";
const aboutContent1 = "My name is Brendan Cheng and I am currently 24 years of age. Professionally, I am a software engineer currently in the aerospace industry, primarily programming in C++. I am currently putting my focus into web development, learning full stack development. The thought of being able to create my own web applications is very exciting! The possibilities seem endless to what I can create.";
const aboutContent2 = "Outside of software engineering, I am developing a passion for media, with a focus on photo composition and film composition. Memories are precious, so why not take the best photos? I am also interested in film composition so I can create videos that I can share. Sharing is caring after all!"
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// create the schema for new posts
const postSchema = new mongoose.Schema({
  title: String,
  body: String
});

// create a model of a post & create a posts collection
const Post = mongoose.model("Post", postSchema);

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
      res.render("home", {homePage: homeStartingContent, totalPosts: postArr});
    }
    else {
      // if there are posts in the collection, display them
      returnedPosts.forEach(function(posts){
        postArr.push(posts);
      });
      
      res.render("home", {homePage: homeStartingContent, totalPosts: postArr});
      postArr = []; //to prevent repeated docs being displayed every time we redirect to home page
    }
  });
});

//post requests on /composeBtn are from the form action in home.ejs
app.post("/composeBtn", function(req,res) {
  //when there is a post request to /composeBtn (defined in home.ejs), redirect to compose page
  res.redirect("/compose");
});

//access /about thru href defined in header.ejs
app.get("/about", function(req,res) {
  res.render("about", {aboutPage1: aboutContent1, aboutPage2: aboutContent2});
});

//access /contact thru href defined in header.ejs
app.get("/contact", function(req,res) {
  res.render("contact", {contactPage: contactContent});
});

//access /compose thru href defined in header.ejs
app.get("/compose", function(req, res) {
  res.render("compose");
});

//post requests on /compose are from the form action in compose.ejs
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

//post requests on /delete are from the form action in post.ejs
//when delete is pressed, delete from collection and redirect to home page
app.post("/delete", function(req,res) {

  //delete the document specified by the post title from Post collection
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

//post requests on /editBtn are from the form action in post.ejs
//when edit is pressed, render the edit page
app.post("/edit", function(req, res) {
  //currentPostTitle is found when we go to a post's individual page
  res.render("edit", {postTitle: currentPostTitle, postContent: currentPostBody});

});

// now that edit page is rendered, it will provide a post method to /editPost
//post requests on /editPost are from the form action in edit.ejs
app.post("/editPost", function(req,res) {

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


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
