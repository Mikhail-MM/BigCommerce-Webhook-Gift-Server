const express = require('express');
const bodyParser = require('body-parser')
const rp = require('request-promise');

const app = express();

app.use(bodyParser.json())

const AuthHeaders = {
	['X-Auth-Client']: process.env.X_AUTH_CLIENT,
	['X-Auth-Token']: process.env.X_AUTH_TOKEN
}

const initailizeHooks = () => {

}

const storeHash = 'h3sfhsws7q'

app.post('/webhooks', async (req, res, next) => {
	try {
		const gift = {
			"line_items": {},
		    "custom_items": [
		        {
		            "name": "Miniature Home Terrarium",
		            "sku": "GIFT-AZXt",
		            "quantity": 1,
		            "list_price": 0
		        }
		    ]
		}

		console.log("Webhook Response");
		const cartID = req.body.data.cartId;
		const switchBoard = {
			cartLookUp: {
				method: 'GET',
				headers: AuthHeaders,
				uri: `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}`,
			},
			giftEntry: {
				method: 'POST',
				headers: {...AuthHeaders, ['Content-Type']: 'application/json'},
				uri: `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}/items`,
				body: JSON.stringify(gift),
				json: true,
			},
			giftRemoval: {
				method: 'DELETE',
				headers: AuthHeaders,
			},
		}

		const cartOnDeck = await rp(switchBoard.cartLookUp).json();
		
		const cartTotal = cartOnDeck.data.cart_amount;
		const giftItems = cartOnDeck.data.line_items.custom_items;
		
		if (giftItems.length > 0) {
			console.log("Logging Gift");
			console.log(giftItems[0]);
		}

		const eligibleForGift = (cartTotal >= 40 && giftItems.length === 0);
		const giftRemovalRequired = (cartTotal < 40 && giftItems.length > 0);
		
		console.log(`Cart total: ${cartTotal}`);
		
		if (eligibleForGift) {
			console.log("Cart Eligible for Gift.")
			const giftAddedCart = await rp(switchBoard.giftEntry).json();
			console.log("Cart updated with gift.")
			console.log(giftAddedCart.body.errors);
		} else if (giftRemovalRequired) {
			console.log("Need to remove gift.")
			const gift = giftItems[0];
				switchBoard.giftRemoval.uri = `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}/items/${gift.id}`;
				const giftRemovedCart = await rp(switchBoard.giftRemoval).json();
		} else {
			console.log("No post-webhook actions required.");
		}
		res.send('OK');

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