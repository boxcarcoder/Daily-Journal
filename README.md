# Daily-Journal
A front end and back end development of a daily journal. 

I use the Express module for my server to load up EJS templates to the client. 

The homepage loaded by the server will consist of an introduction, as well as all journal entries truncated and listed.
Each entry will have the option to be displayed in full in its own web page.

I use MongoDB and mongoose to create a database which will contain a collection of posts. Journal entries are now stored into a database. 

On each post's page, there is an option to delete the post.

To-Do:
* Add database to store entries. [X]
* Give option to edit posts on each post's page. [X]
* Give option to edit home, about me, and contact pages. [X]
* Develop API to handle communication between the server and database.[ ]

