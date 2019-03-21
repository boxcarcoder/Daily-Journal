//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

var postArr = [];

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// create the schema for new posts
const postSchema = new mongoose.Schema({
  title: String,
  body: String
});

// create a model of a post
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
      // if there are no posts in the collection, simply redirect to home page again
      res.redirect("/");
    }
    else {
      // if there are posts in the collection, display them
      returnedPosts.forEach(function(posts){
        postArr.push(posts);
      });

      res.render("home", {homePage: homeStartingContent, totalPosts: postArr});
    }
  });
});

app.get("/about", function(req,res) {
  res.render("about", {aboutPage: aboutContent});
});

app.get("/contact", function(req,res) {
  res.render("contact", {contactPage: contactContent});
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req,res) {

  // use the Post model to create a new post document
  const post = new Post({
    title: req.body.inputTitle,
    body: req.body.inputPost
  });

  // save into posts collection
  post.save();

  res.redirect("/");
});

app.get("/posts/:postID", function(req,res) {
  //if requested post's ID is in post[], meaning it exists
  posts.forEach(function(entry) {
    if(lodash.lowerCase(entry.title) === lodash.lowerCase(req.params.postID)) {//when looking if requested post is in post[], ignore casing and spaces with lodash
      res.render("post", {postTitle: entry.title, postContent: entry.body});
    }
  });
});












app.listen(3000, function() {
  console.log("Server started on port 3000");
});
