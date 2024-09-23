This is a link uptime monitoring app using nodeJS and File System.
User libraries and modules:
1. http, https
2. fs
3. path
4. twilio (for notify user by sending SMS)
5. JSON
6. Requests: GET, POST, PUT, DELETE
7. crypto (to hash passwords);

All devided sections:
1. creating user with first name, last name, phone, password, terms of service agreement. We can perform CRUD operations on user. Here I am using phone as unique ID. 
2. creating token using a unique ID as name that last for one hour. The data we can set to tokens: phone, ID and expire time. When we will poerdorm operations RUD operations on users we need to verified using tokens as headers object.
3. Then user can set check data to check their desired state of website

Request process:
1. Create user (POST request):
     route: http://localhost:3000/user
             request body :
                   {
                      "firstName" : "Naime",
                      "lastName" : "Islam",
                      "password" : "1235",
                      "phone" : "01303617193",
                      "tosAgreement" : true
                   }
2. Read User (GET request):
    route: http://localhost:3000/user?phone=01************ (phone as query string object)
    to authorized using phone and token user have to pass the token in header object
             header object
   ____________________________________
     token : *******************
3. Update the user (PUT request):
     route: http://localhost:3000/user
    to authorized using token user have to pass the token in header object
             header object
   ____________________________________
     token : *******************
             request body :
                   {
                      "firstName" : "Naime",
                      "lastName" : "Imran",
                      "password" : "1234",
                      "phone" : "01303617193",
                      "tosAgreement" : true
                   }
4. Delete the user (DELETE Request):
   route: http://localhost:3000/user?phone=01************ (phone as query string object)
     to authorized using token user have to pass the token in header object
             header object
   ____________________________________
     token : *******************
   
   
   
