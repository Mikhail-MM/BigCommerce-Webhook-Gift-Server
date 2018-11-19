const express = require('express');
const bodyParser = require('body-parser')
const rp = require('request-promise');

const app = express();

app.use(bodyParser.json())

const specialGift = {

};

const initailizeHooks = () => {

}

const storeHash = 'h3sfhsws7q'
app.post('/webhooks', async (req, res, next) => {
	try {
		console.log("Hook Received.");
		console.log(req.body);
		const cartID = req.body.data.cartId

		const switchBoard = {
			cartLookUp: {
				method: 'GET',
				headers: {
					['X-Auth-Client']: process.env.X_AUTH_CLIENT,
					['X-Auth-Token']: process.env.X_AUTH_TOKEN,
				},
				uri: `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}`,
			}
		}

		const cartOnDeck = await rp(switchBoard.cartLookUp);
		const totalPrice = cartOnDeck.data.cart_amount;
		const gift = cartOnDeck.data.custom_items[0]
		console.log(`Cart has ${totalPrice}`)
		console.log(`Gift: ${gift}`)
		res.send('OK')
	} catch(err) { console.log(err); }
});

app.get('*', (req, res) => {
	console.log("Catch-All Handler");
	res.status(200).send("All Clear Chief.");
});

const port = process.env.PORT || 3000;

app.listen(port);

console.log(`Webhook Gift Server listening on ${port}`);


/*

Sample Request Options

	var options = {
	    method: 'POST',
	    uri: 'http://api.posttestserver.com/post',
	    body: {
	        some: 'payload'
	    },
	    json: true // Automatically stringifies the body to JSON
	};

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