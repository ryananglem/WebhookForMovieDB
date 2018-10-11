'use strict'

import express from 'express'
import http from 'http'
import API_KEY from '../../apiKey'
// import { dialogflow } from 'actions-on-google'

const server = express.Router({mergeParams: true})

server.post('/get-movie-details', (req, res) => {

    const movieToSearch = req.body.queryResult && req.body.queryResult.queryText && req.body.queryResult.parameters ? req.body.queryResult.parameters.movie : 'The Godfather'
    console.log(req.body)
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${API_KEY}`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(completeResponse);
            let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : '';
            dataToSend += `${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;

            return res.json({
                "fulfillmentText": dataToSend,
                "fulfillmentMessages": [
                  {
                    "card": {
                      "title": "card title",
                      "subtitle": "card text",
                      "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
                      "buttons": [
                        {
                          "text": "button text",
                          "postback": "https://assistant.google.com/"
                        }
                      ]
                    }
                  }
                ],
                "source": "example.com",
                "payload": {
                  "google": {
                    "expectUserResponse": true,
                    "richResponse": {
                      "items": [
                        {
                          "simpleResponse": {
                            "textToSpeech": "this is a simple response"
                          }
                        }
                      ]
                    }
                  },
                  "facebook": {
                    "text": "Hello, Facebook!"
                  },
                  "slack": {
                    "text": "This is a text response for Slack."
                  }
                },
                "outputContexts": [
                  {
                    "name": "projects/${PROJECT_ID}/agent/sessions/${SESSION_ID}/contexts/context name",
                    "lifespanCount": 5,
                    "parameters": {
                      "param": "param value"
                    }
                  }
                ],
                "followupEventInput": {
                  "name": "event name",
                  "languageCode": "en-US",
                  "parameters": {
                    "param": "param value"
                  }
                }
              })
        })
    })
})            

export default server

