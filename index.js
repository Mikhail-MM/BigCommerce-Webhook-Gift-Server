const express = require('express');
const rp = require('request-promise');

const app = express();

const specialGift = {

};

const initailizeHooks = () => {

}

app.post('/webhooks', (req, res, next) => {
	console.log("Hook Received.");
	console.log(req.body);
	console.log(req)
	res.end()
});

app.get('*', (req, res) => {
	console.log("Catch-All Handler");
	res.status(200).send("All Clear Chief.");
});

const port = process.env.PORT || 3000;

app.listen(port);

console.log(`Webhook Gift Server listening on ${port}`);


/*

Hook Initializer Request

{
 "scope": "store/cart/lineItem/*",
 "destination": "https://bigcommerce-webhooks.herokuapp.com/webhooks",
 "is_active": true
}

Hook Initializer Response

{
    "id": 15353127,
    "client_id": "1uxt9bl7pozqbdhsswyt0bt7h6q0fo2",
    "store_hash": "h3sfhsws7q",
    "scope": "store/cart/lineItem/*",
    "destination": "https://bigcommerce-webhooks.herokuapp.com/webhooks",
    "headers": null,
    "is_active": true,
    "created_at": 1542580553,
    "updated_at": 1542580553
}

*/