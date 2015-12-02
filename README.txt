README.txt

This application is a nodejs application that was developed in an Ubuntu  Linux environment.

To run:
1. cd into the ex11 folder
2. start the server with "node server.js"
3. In a web browser, go to localhost:4000/index.html

Application features
1. You can login as anyone.  Currently password verification per user is not implemented.  
This was to aid with testing and development.  After typing the desired username, click 
"Login" and you will be shown a the main screen.  On the left is the list of posts, while 
on the right is the list of users currently logged in to the server.  Each of these will 
live update for everyone logged into the system as changes are made.

2. To make a post, just type a post name, and content and click the "Add Post" button.  
The post will be shown on the poster's screen, as well as all other users who have logged 
in.  If you are unhappy with your post, you can click the remove button and it will be 
removed from the posts feed.  Any other user logged in can remove posts as well.  Posts 
are stored in memory and are lost if the server is restarted.  Posts are shown in order 
from most recent at top and oldest at the bottom always.

3. When you want to logout, just click the logout button in the upper right corner, and 
you will be shown the login screen again.  The user who logged out will also be removed 
from the users logged in list for everyone else who is still logged in.
