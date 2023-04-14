const express = require("express");
const axios = require("axios");

const app = express();

app.get("/numbers", async (req, res) => {
  const urls = req.query.url;

  const requests = urls.map((url) =>
    axios.get(url, { timeout: 500 }).catch((err) => null)
  );

 const responses = await Promise.all(requests);
  const numbers = responses
    .filter((response) => response && response.data && response.data.numbers)
    .flatMap((response) => response.data.numbers);

  const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);

  res.json({ numbers: uniqueNumbers });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});