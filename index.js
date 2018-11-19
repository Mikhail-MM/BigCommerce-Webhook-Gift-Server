const express = require('express');
const axios = require('axios')
const rp = require('request-promise');
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json())

const AuthHeaders = {
	['X-Auth-Client']: process.env.X_AUTH_CLIENT,
	['X-Auth-Token']: process.env.X_AUTH_TOKEN
}

const storeHash = 'h3sfhsws7q'

app.post('/webhooks', async (req, res, next) => {
	try {

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

		const lineItems = cartOnDeck.data.line_items.physical_items;
		const giftFound = lineItems.find(el => el.product_id === 112);

		const eligibleForGift = (cartTotal >= 40 && !giftFound);
		const giftRemovalRequired = (cartTotal < 40 && giftFound);
		
		
		if (eligibleForGift) {
			const response = await axios({
				method: 'post',
				url: `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}/items`,
				headers: {...AuthHeaders, ['Content-Type']: 'application/json'},
				data: {
					"line_items": [
					    {
					    	"quantity": 1,
					    	"product_id": 112,
					    	"list_price": 0
					    }
					]
				}
			});
		} else if (giftRemovalRequired) {
				const giftReferenceID = giftFound.id;
				switchBoard.giftRemoval.uri = `https://api.bigcommerce.com/stores/${storeHash}/v3/carts/${cartID}/items/${giftReferenceID}`;
				const giftRemovedCart = await rp(switchBoard.giftRemoval).json();
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