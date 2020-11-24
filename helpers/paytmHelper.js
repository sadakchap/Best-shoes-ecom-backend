const PaytmChecksum = require('paytmchecksum');
const axios = require('axios').default;

const MERCHANT_ID = process.env.PAYTM_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;

const getTxnToken = (orderId, userId, amount) => {
    const txnAmount = amount.toFixed(2);
    var paytmParams = {};
    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : MERCHANT_ID,
        "websiteName"   : "WEBSTAGING",
        "orderId"       : orderId,
        "callbackUrl"   : `${process.env.API_URL}/api/payment/callback`,
        "txnAmount"     : {
            "value"     : txnAmount,
            "currency"  : "INR",
        },
        "userInfo"      : {
            "custId"    : userId,
        },
    };

    return new Promise((resolve, reject) => {
        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), MERCHANT_KEY).then((checksum) => {
            paytmParams.head = {
                "signature"    : checksum
            };

            const url = `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${MERCHANT_ID}&orderId=${orderId}`;
            axios.post(url, paytmParams).then(response => {
                const data = response.data;
                if(data.body.resultInfo.resultStatus === 'S'){
                    resolve({
                        orderId,
                        txnToken: data.body.txnToken
                    })
                }
                resolve({
                    ...response.data
                })
            }).catch(err => {
                console.log(err);
                reject(err);
            })
        })
    })

};

// getTxnToken(`ORDER_ID${new Date().getTime()}`, "CUST_0001", 29).then(res => console.log(res));

module.exports = { getTxnToken };
