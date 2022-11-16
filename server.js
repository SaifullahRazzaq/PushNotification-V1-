const express = require("express");
const https = require("https");
var googleAuth = require("googleapis");
var admin = require("firebase-admin");

const PROJECT_ID = "notificationtest-cad7d";
const HOST = "fcm.googleapis.com";
const PATH = "/v1/projects/" + PROJECT_ID + "/messages:send";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

var serviceAccount = require("./config/notificationtest-cad7d-firebase-adminsdk-osuwj-8e0a3794de.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

(app = express()),
  (bodyParser = require("body-parser")),
  (port = process.env.PORT || 3002);

app.listen(port);

console.log(`API server started on: http://localhost:${port}`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

function getToken() {
  return new Promise(function (resolve, reject) {
    const key = require("./config/notificationtest-cad7d-firebase-adminsdk-osuwj-8e0a3794de.json");
    const jwtClient = new googleAuth.google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log("Error====>", err);
        reject(err);
        return;
      }
      console.log("tokens.access_token===>", tokens);
      resolve(tokens.access_token);
    });
  });
}
app.post(`/Login`, (req, res) => {
  getToken().then(function (accessToken) {
    console.log("body===>",req)
    // console.log("acces==>", req.params);
    const options = {
      hostname: HOST,
      path: PATH,
      method: "POST",
      // [START use_access_token]
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      // [END use_access_token]
    };

    const request = https.request(options, function (resp) {
      resp.setEncoding("utf8");
      resp.on("data", function (data) {
        res.send({ message: "Notification Send Successfully", code: 200 });
        // console.log("Message sent to Firebase for delivery, response:");
        // console.log("data===>", data);
      });
    });

    request.on("error", function (err) {
      console.log("Unable to send message to Firebase");
      console.log(err);
    });

    request.write(
      JSON.stringify({
        message: {
          token: req.body?.fcmtoken,
          data: {
            title: req.body?.data.title,
            body: req.body?.data.body,
          },
          android: {
            direct_boot_ok: true,
          },
        },
      })
    );
    request.end();
  });
});
