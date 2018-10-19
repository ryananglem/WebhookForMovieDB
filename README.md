# MovieDB Webhook - Get details of a movie from this webhook.

A very simple Dialogflow webhook that gets you the details of a specified movie and using that context asks if you would like some more information. Forked and enhanced from the repo by SiddAjmera

Deployed to Dialogflow-elective-MovieDBAgent in dialogflow

Handles both v1 and v2 of the Dialogflow API

# dialogflow

The Dialogflow agent is stored as a zip in the root of the repo, and can be imported into your dialogflow project. The movie-intent is described as:

request: "use the test app"

response: "How can I be of assistance?"

request: "Give me some information on a movie <movie title>"
  
response: "Here is some information on <movie> would you like to know more?
  
request: "Yes or No"

response if yes: "The ratings scores for this film were <x>"
  
response if no: "Ok. Thanks for using this service"


# to run in development

`npm i`

`npm start`

server runs on port 8000

endpoints are:

`/v1/get-movie-details` (deprecated)

`/v2/get-movie-details`


# deploy
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
