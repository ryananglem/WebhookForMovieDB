'use strict'

import express from 'express'
import http from 'http'

import config from '../../config'

const router = express.Router({mergeParams: true})

router.post('/get-movie-details', getMovieCommands)            

export default router


export function getMovieCommands (req, res, next) {  

  if (req.body.queryResult && req.body.queryResult.intent && req.body.queryResult.intent.displayName === 'movie-intent - yes') {
    return getMoreMovieDetails(req, res)
  }
  return getMovieDetails(req, res)
}

const getMovieDetails = (req, res) => {
  const movieToSearch = req.body.queryResult && req.body.queryResult.queryText && req.body.queryResult.parameters ? req.body.queryResult.parameters.movie : 'The Godfather'
 
  const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${config.movieApiKey}`)
  http.get(reqUrl, (responseFromAPI) => {
      let completeResponse = ''
      responseFromAPI.on('data', (chunk) => {
          completeResponse += chunk
      });
      responseFromAPI.on('end', () => {
          const movie = JSON.parse(completeResponse)
          let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : ''
          dataToSend += `${movie.Title} starring ${movie.Actors} is a ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}. Would you like to know more?`

          if (movie.Title !== undefined)  {
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
              },
              "outputContexts": [{
                "name": "projects/Dialogflow-elective-MovieDBAgent/agent/sessions/testid/contexts/movie-intent-followup",
                "lifespanCount": 5,
                "parameters": {
                  "param": config.dialogFlow.movieIntent.actionParameter
                }
              }
              ]
            })
          } else {
            return res.json({
              "payload": {
                "google": {
                  "expectUserResponse": false,
                  "richResponse": {
                    "items": [
                      {
                        "simpleResponse": {
                          "textToSpeech": "Sorry I didn't find any information about that film",
                          "displayText": "Sorry I didn't find any information about that film"
                        }
                      }
                    ]
                  }
                }
              }
            })
          }
      }) 
  })
}

const getMoreMovieDetails = (req, res) => {

  const movieParams = req.body.queryResult.outputContexts.filter(x => x.name.includes(config.dialogFlow.movieIntent.outputContext))
  const movieToSearch = movieParams[0].parameters.movie

  const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${config.movieApiKey}`)
  http.get(reqUrl, (responseFromAPI) => {
      let completeResponse = ''
      responseFromAPI.on('data', (chunk) => {
          completeResponse += chunk
      });
      responseFromAPI.on('end', () => {
          const movie = JSON.parse(completeResponse);
          
          let dataToSend
          if (movie.Awards && movie.Awards !== 'N/A') {
              dataToSend =`${movie.Title} has won the following awards, ${movie.Awards}` 
            } else {
              if (movie.Ratings && movie.Ratings.length > 0) { 
                dataToSend = `${movie.Title} scored ${movie.Ratings[0].Value} by ${movie.Ratings[0].Source}`
              } else {
                dataToSend = `I dont have any awards or rating data for ${movie.Title}`
              }
          }               
          dataToSend += '. Thank you for using this service'
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
}


