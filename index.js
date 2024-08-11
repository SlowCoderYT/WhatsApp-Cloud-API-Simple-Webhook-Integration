const { default: axios } = require('axios');
var express = require('express')
    , bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


const token = "EAAcWWZBU7uaoBOZC26rY7tZC2Yp5EucUmblpO8S5MZAZCjCImgvXqIYZC2nZBCKtPrzi41gY4XFRyUqvZCXrgB6O1dQWxxvt5LABiPbrrJic374uaq696fUsuZC2mHZAkne4hK0zqde0VWco4N690TnknjEPlqQpuoMvDknsZArNSUN7B3pFb8qvKmt7aKKSHZA1IueLsCk4YE7iKmWPtBJs1DJqa3uKEUV02vEak87s"

app.get("/", function (request, response) {
    response.send('Simple WhatsApp Webhook tester</br>There is no front-end, see server.js for implementation!');
});

app.get('/webhook', function (req, res) {
    if (
        req.query['hub.mode'] == 'subscribe' &&
        req.query['hub.verify_token'] == 'token'
    ) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});

app.post("/webhook", function (request, response) {
    const waId = request.body.entry[0].changes[0].value.contacts[0].wa_id;
    const contactName = request.body.entry[0].changes[0].value.contacts[0].profile.name;
    const messageBody = request.body.entry[0].changes[0].value.messages[0].text.body;
    const messageType = request.body.entry[0].changes[0].value.messages[0].type;
    const phoneNumberId = request.body.entry[0].changes[0].value.metadata.phone_number_id;

    console.log("===========================")
    console.log('Phone Number From:', waId);
    console.log('Contact Name:', contactName);
    console.log('Message Body:', messageBody);
    console.log('Message Type:', messageType);

    // Define the payload
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: waId,
        type: "text",
        text: {
            preview_url: false,
            body: `Hello ${contactName}, Your message received`
        }
    };

    // Define the headers
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    axios.post(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, payload, { headers })
        .then(response => {
            console.log('Message sent successfully:', response?.data);

            // Safely access the first contact in the contacts array
            const contact = response?.data?.contacts && response?.data?.contacts[0];

            if (contact) {
                console.log(`Message sent to: ${contact?.input}`);
                // Perform any other operations with contact here
            } else {
                console.error('No contacts returned in the response');
            }
        })
        .catch(error => {
            console.error('Error sending message:', error?.response ? error?.response.data : error.message);
        });

    response.sendStatus(200);
});

var listener = app.listen(3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});