// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Use environment variables

const app = express();
const PORT = process.env.PORT || 5000; // Use Render's dynamic port, fallback to 5000 for local

// Enable CORS for local development
app.use(cors());

// Define a route to handle the authentication
app.get('/api/authenticate', async (req, res) => {
  try {
    // Get credentials from environment variables
    const username = process.env.API_USER;
    const password = process.env.API_PASSWORD;
    const apiKey = process.env.API_KEY;

    // Make the request to the Aurora Vision API
    const response = await axios.get(`${process.env.API_AUTH_URL}`, {
      headers: {
        'X-AuroraVision-ApiKey': apiKey,
      },
      auth: {
        username: username,
        password: password,
      },
    });

    // Forward the response to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Aurora Vision API:", error);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Route to fetch data from Aurora Vision API based on parameters
app.get('/api/fetchData', async (req, res) => {
  try {
    // Extract parameters from query string
    const { resource, dataType, valueType, startDate, endDate } = req.query;

    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    const username = process.env.API_USER;
    const password = process.env.API_PASSWORD;

    // Construct the request URL
    const requestUrl = `${process.env.API_BASE_URL}/${resource}/aggregated/${process.env.API_ENTITY_ID}/${dataType}/${valueType}?startDate=${startDate}&endDate=${endDate}&timeZone=Asia/Singapore`;

    // Make the request to the Aurora Vision API with the token
    const response = await axios.get(requestUrl, {
      headers: {
        'X-AuroraVision-Token': token, // Attach the token here
      },
      auth: {
        username: username, // Basic auth username
        password: password, // Basic auth password
      },
    });

    // Forward the response to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Aurora Vision API:', error);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
