'use strict'

import express from 'express'
import http from 'http'
import API_KEY from '../../apiKey'
// import { dialogflow } from 'actions-on-google'

const server = express.Router({mergeParams: true})

server.post('/get-movie-details', (req, res) => {

  const movieToSearch = req.body.queryResult && req.body.queryResult.queryText && req.body.queryResult.parameters ? req.body.queryResult.parameters.movie : 'The Godfather'
    
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${API_KEY}`)
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(completeResponse);
            let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : ''
            dataToSend += `${movie.Title} staring ${movie.Actors} is a ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}. Would you like to know more?`

            return res.json({
                "payload": {
                  "google": {
                    "expectUserResponse": true,
                    "richResponse": {
                      "items": [
                        {
                          "simpleResponse": {
                            "textToSpeech": dataToSend,
                            "displayText": dataToSend
                          }
                        }
                      ]
                    }
                  }
                }
              })
        })
    })
})            

server.post('/get-more-movie-details', (req, res) => {

  const movieToSearch = req.body.queryResult && req.body.queryResult.queryText && req.body.queryResult.parameters ? req.body.queryResult.parameters.movie : 'The Godfather'
    
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${API_KEY}`)
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(completeResponse);
            
            let dataToSend
            if (movie.Awards) {
                dataToSend =`${movie.Title} has won the following awards, ${movie.Awards}` 
              } else {
                if (movie.Ratings && movie.Ratings.length > 0) { 
                  dataToSend = `${movie.Title} scored ${movie.Ratings[0].Value} by ${movie.Ratings[0].Source}`
                } else {
                  dataToSend = `I dont have any awards or rating data for ${movie.Title}`
                }
            }               
            
            return res.json({
                "payload": {
                  "google": {
                    "expectUserResponse": false,
                    "richResponse": {
                      "items": [
                        {
                          "simpleResponse": {
                            "textToSpeech": dataToSend,
                            "displayText": dataToSend
                          }
                        }
                      ]
                    }
                  }
                }
              })
        })
    })
})

export default server

