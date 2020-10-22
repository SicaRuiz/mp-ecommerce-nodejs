var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago')
var app = express();
app.use(express.json())

require('dotenv').config()


mercadopago.configure({
    access_token: process.env.MPTOKEN,
    integrator_id: process.env.INTID
}); 


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
})
app.get('/pending', function (req, res) {
    res.render('pending');
})
app.get('/failure', function (req, res) {
    res.render('failure');
})

app.post('/webhook', (req, res) => {
    res.send({ success: true, data: req.body });
    console.log("Request body:", req.body)
})

app.post('/makePayment', async function (req, res) {

    console.log(req.query)

    let preference = {
        items: [
            {
                id: 1234,
                title: req.query.titulo,
                unit_price: parseInt(req.query.unit_price),
                quantity: 1,
                description: "Dispositivo móvil de Tienda e-commerce",
                picture_url: "https://i.blogs.es/addc23/samsung-galaxy-s10/1366_2000.jpg",
            }
        ],
        external_reference: "juliocrcr91@gmail.com",
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_63274575@testuser.com',
            phone: {
                area_code: "11",
                number: 22223333
            },
            address: {
                street_name: 'False',
                street_number: 123,
                zip_code: "1111"
            }
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: 'amex'
                }
            ],
            excluded_payment_types: [
                {
                    id: 'atm'
                }
            ],
            installments: 6
        },
        back_urls: {
            success: "https://sicaruiz-mp-ecommerce-nodejs.herokuapp.com//success",
            pending: "https://sicaruiz-mp-ecommerce-nodejs.herokuapp.com//pending",
            failure: "https://sicaruiz-mp-ecommerce-nodejs.herokuapp.com//failure",
        },
        auto_return: "approved",
        notification_url: "https://sicaruiz-mp-ecommerce-nodejs.herokuapp.com//webhook?source_news=webhooks",
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {
            // Este valor reemplazará el string "$$init_point$$" en tu HTML
            console.log(response.body.init_point)
            res.redirect(response.body.init_point)
        }).catch(function (err) {
            res.send({ success: false, err })
        });

}); 

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));


app.listen(process.env.PORT || 3000);