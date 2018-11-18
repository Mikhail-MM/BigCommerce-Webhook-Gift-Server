const express = require('express');
const rp = require('request-promise');

const app = express();

const specialGift = {

};

app.post('/webhooks', (req, res, next) => {
	console.log("Hook Received.");
	console.log(req.body);
});

app.get('*', (req, res) => {
	console.log("Catch-All Handler");
	res.status(200).send("All Clear Chief.");
});

const port = process.env.PORT || 3000;

app.listen(port);

console.log(`Webhook Gift Server listening on ${port}`);