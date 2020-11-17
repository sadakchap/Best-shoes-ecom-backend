const { getTxnToken } = require("../helpers/paytmHelper");
const formidable = require('formidable');
const PaytmChecksum = require("paytmchecksum");
const jwt = require('jsonwebtoken');

// generate txnToken & send it
exports.getMeTxnToken = (req, res) => {
    const userId = req.profile.email;
    const orderId = `ORDER_ID_${new Date().getTime()}`;
    const amount = parseInt(req.query.amount);
    getTxnToken(orderId, userId, amount).then(data => {
        return res.status(200).json(data);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({
            msg: 'Sorry, something went wrong!'
        });
    })
};

exports.processPayment = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        // console.log(fields);
        const paytmChecksumHash = fields.CHECKSUMHASH;
        delete fields["CHECKSUMHASH"];
        
        console.log(fields);
        const isVerifySignature = PaytmChecksum.verifySignature(fields, process.env.PAYTM_MERCHANT_KEY, paytmChecksumHash);
        if (isVerifySignature) {
            console.log("Checksum Matched");
            const encodedData = jwt.sign({
                TXNID: fields.TXNID,
                TXNAMOUNT: fields.TXNAMOUNT,
                ORDERID: fields.ORDERID,
                STATUS: fields.STATUS,
                TXNDATE: fields.TXNDATE,
            }, process.env.JWT_PAYMENT_TOKEN, { expiresIn: '15m' });
            const renderData = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${process.env.STATUS === "TXN_SUCCESS" }</title>
                </head>
                <body>
                    <h1>Transaction is being processed,</h1>
                    <h2><strong style="color: blue;">Please wait</strong></h2>
                    <h2><strong>(Please do not press 'Refresh' or 'Back' button</strong></h2>

                    <a style={display: "none";} href="${process.env.CLIENT_URL}/payment/callback/${encodedData}"></a>

                    <script>
                        document.querySelector('a').click();
                    </script>
                </body>
                </html>
            `;
            return res.send(renderData);

        } else {
            const encodedData = jwt.sign({ msg: "Check did not matched!"}, process.env.JWT_PAYMENT_TOKEN, { expiresIn: '15m' });
            const renderData = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${process.env.STATUS === "TXN_SUCCESS" }</title>
                </head>
                <body>
                    <h1>CheckSum didn't matched</h1>
                    <h1><strong>Stop messing around with the Checksum</strong></h1>
                    
                    <a style={display: "none";} href="${process.env.CLIENT_URL}/payment/callback/${encodedData}"></a>

                    <script>
                        document.querySelector('a').click();
                    </script>
                </body>
                </html>
            `;
            return res.send(renderData)
        }    
    })
    // validate checksum & make transaction
};

// {
//   TXNID: '20201116111212800110168884902094069',
//   TXNAMOUNT: '178.00',
//   ORDERID: 'ORDER_ID_1605551100423',
//   STATUS: 'TXN_SUCCESS',
//   TXNDATE: '2020-11-16 23:55:03.0',
// }