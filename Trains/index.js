const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
//To Register
app.post('/register', async (req, res) => {
  try {
    const { companyName } = req.body;
    const response = await axios.post('http://localhost:3000/register', { companyName });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering company' });
  }
});
//To get AUTH
app.post('/auth', async (req, res) => {
    try {
      const payload ={
        "companyName": req.body.companyName,
        "clientID": req.body.clientID,
        "clientSecret": req.body.clientSecret
      }
      const response = await axios.post('http://localhost:3000/auth', { companyName:payload.companyName , clientID: payload.clientID , clientSecret: payload.clientSecret });
      accessToken=response.data.access_token;
      res.json(response.data);
    } catch (error) {
    //   console.error(error);
      res.status(500).json({ message: 'Error registering company' });
    }
  });

//Get trains 
app.get('/trains', async (req, res) => {
    try {
      // Get real-time data for all trains departing in the next 12 hours
      const accessToken = req.headers.authorization.split(' ')[1];
      const response = await axios.get(`http://localhost:3000/trains?departure_time_within=720`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
          }
      });
      const trains = response.data;
      // Filter out trains departing in the next 30 minutes
      const now = new Date();
      const threshold = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      
      const filteredTrains = trains.filter(train => {
        const departureTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          train.departureTime.Hours,
          train.departureTime.Minutes,
          train.departureTime.Seconds
        );
        return departureTime > threshold;
      });
    
  
     
      const trainData = await Promise.all(filteredTrains);
      
      // Sort trains based on given criteria
      const sortedTrains = filteredTrains.sort((a, b) => {
        // Compare price
        if (a.price.sleeper !== b.price.sleeper) {
          return a.price.sleeper - b.price.sleeper;
        } else if (a.price.AC !== b.price.AC) {
          return a.price.AC - b.price.AC;
        }
        // Compare seats
        if (a.seatsAvailable.sleeper !== b.seatsAvailable.sleeper) {
          return b.seatsAvailable.sleeper - a.seatsAvailable.sleeper;
        } else if (a.seatsAvailable.AC !== b.seatsAvailable.AC) {
          return b.seatsAvailable.AC - a.seatsAvailable.AC;
        }
        // Compare departure time
        const aDeparture = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          a.departureTime.Hours,
          a.departureTime.Minutes + a.delayedBy,
          a.departureTime.Seconds
        );
        const bDeparture = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          b.departureTime.Hours,
          b.departureTime.Minutes + b.delayedBy,
          b.departureTime.Seconds
        );
        return bDeparture - aDeparture;
      });
      res.json({ trains: sortedTrains });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching train data' });
    }
  });
  
//Get Specific Train 
app.get('/trains/:trainNumber', async (req, res) => {
    try {
      const accessToken = req.headers.authorization.split(' ')[1];
      const trainNumber = req.params.trainNumber;
      const response = await axios.get(`http://localhost:3000/trains/${trainNumber}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting train details' });
    }
  });
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));