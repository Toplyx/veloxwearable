const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('pk_test_51RBbEUQ5LEQiTTFxItmW9KjLnpyNBOTBBzoqnanY9YxEuphNFGlUUViCHYMBykCAwqwS9HXXgczRA53L9r9wi7G900hymrqJ8r'); // Tvůj Stripe secret key
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 4242;

app.use(cors());
app.use(bodyParser.json());

// Nodemailer konfigurace pro odesílání emailů
const transporter = nodemailer.createTransport({
  service: 'gmail', // Můžeš použít jiný SMTP server
  auth: {
    user: 'veloxwearable@gmail.com', // Tvoje emailová adresa
    pass: 'neptof-pevzyc-3Topfbo'   // Tvoje heslo k emailu nebo app password
  }
});

// Route pro vytvoření platby
app.post('/create-payment-intent', async (req, res) => {
  const { payment_method, email, amount } = req.body;

  try {
    // Vytvoření payment intentu
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // částka v centích
      currency: 'eur',
      payment_method: payment_method,
      confirmation_method: 'manual',
      confirm: true
    });

    if (paymentIntent.status === 'succeeded') {
      // Odeslání potvrzovacího emailu
      const mailOptions = {
        from: 'veloxwearable@gmail.com',
        to: email,
        subject: 'Payment Confirmation',
        text: `Thank you for your purchase! Your payment of ${amount / 100} EUR has been successfully processed.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Payment failed.' });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

