'use strict'

import express from 'express'
import http from 'http'
import API_KEY from '../../apiKey'
// import { dialogflow } from 'actions-on-google'

const server = express.Router({mergeParams: true})

server.post('/get-movie-details', (req, res) => {

  console.log(req.body)
  let contexts
  if (req.body.queryResult.outputContexts) {
    req.body.queryResult.outputContexts.forEach(element => {
      contexts += JSON.stringify(element)
   })
  }
  console.log(contexts)

  if (req.body.queryResult && req.body.queryResult.intent && req.body.queryResult.intent.displayName === 'movie-intent - yes') {
    return getMoreMovieDetails(req, res)
  }
  return getMovieDetails(req, res)

/*
  const req = {body: 
    { responseId: '097bac51-1d9c-475c-befa-533adf2a878d',
    queryResult:
    { queryText: 'tell me about the dark knight',
    parameters: { movie: 'The Dark Knight' },
    allRequiredParamsPresent: true,
    fulfillmentMessages: [ [Object] ],
    intent:
    { name: 'projects/dialogflow-elective-moviedb-dn/agent/intents/569f4239-9fc5-4d38-b92e-386c6ee94256',
    displayName: 'movie-intent' },
    intentDetectionConfidence: 1,
    languageCode: 'en' },
    originalDetectIntentRequest: { payload: {} },
    session: 'projects/dialogflow-elective-moviedb-dn/agent/sessions/d1d15d2c-d7eb-58cd-8232-0239fed42277' }
   }
*/
  
 
})            

const getMovieDetails = (req, res) => {
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
          dataToSend += `${movie.Title} starring ${movie.Actors} is a ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}. Would you like to know more?`

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
                  "param": "movie"
                }
              }
              ]
            })
      })
  })
}

const getMoreMovieDetails = (req, res) => {

  const movieParams = req.body.queryResult.outputContexts.filter(x => x.name.includes('movie-intent-followup'))
  const movieToSearch = movieParams[0].parameters.movie
  console.log("movie to search", movieToSearch)
  console.log(JSON.stringify(req.body.queryResult))

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
export default server

