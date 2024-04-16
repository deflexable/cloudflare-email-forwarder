# cloudflare-email-forwarder
Forward/redirect email sent to your cloudflare worker to your server

## Getting Started!

1. Visit (Email/Email Routing) on your cloudflare dashboard account
2. Create an email workers
3. Copy the content at [index.js](https://github.com/deflexable/cloudflare-email-forwarder/blob/main/index.js) to your email worker code editor
4. Save and deployed
5. Now add two environmental variable for your `apiUrl` and `apiSecret`. Do this by clicking manage worker and navigate to the settings tab then click variable.

## Environment variable 
- `apiUrl`: your server webhook url that will be called everytime email is sent to your cloudflare email worker. e.g `https://api.brainbehindx.com/log_email`
- `apiSecret`: the secret for securing your `apiUrl` endpoint. this would be sent along the header of apiUrl request as `x-api-secret`

## Request sample
you should receive a request like this on your server
```json
{
   "to": "john@example.com",
   "from": "me@example.com",
   "forwarded": {
       "header": { }, // this is the header data forwarded from client sending the email
       "body": "base64-string" // this is the body data forwarded from client sending the email
   }
}
```

## Responses sample
you can acknownlegde if client email was accepted or rejected as follows

```js
// email was accepted
res.sendStatus(200); // or res.status(200).send('OK');

// email was rejected/blocked
res.status(403 || any_status_code_aside_200).send('Forbidden' || 'Your custom rejection message'); 
```

### Parsing `forwarded.body`
you need to parse `forwarded.body` inorder to utilize it. this can be done in nodejs as follows or [visiting mailparser](https://nodemailer.com/extras/mailparser/)

```js
import { simpleParser } from 'mailparser';

simpleParser(Buffer.from(forwarded.body, 'base64')).then(r => {
    console.log('parsed mail: ', r);
}, err => {
    console.error('parsed err:', err);
});
```

N/B: at the time of writing this, the [raw](https://developers.cloudflare.com/workers/runtime-apis/streams/readablestream) variable is not populated while testing it on the simulator but it should be populated when sending real email in production
