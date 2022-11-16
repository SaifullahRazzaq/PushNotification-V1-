// var googleAuth = require("google-auth-library");
// const { initializeApp } = require("firebase-admin/app");
// module.exports.Sender = function (projectId = "notificationtest-cad7d", key) {
//   //   import { initializeApp } from "firebase/app";
//   //   import { getAnalytics } from "firebase/analytics";
//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
//   const firebaseConfig = {
//     apiKey: "AIzaSyDuvspqBnBCVwzTwmxnwv53Qji3xJNV4z0",
//     authDomain: "notificationtest-cad7d.firebaseapp.com",
//     projectId: "notificationtest-cad7d",
//     storageBucket: "notificationtest-cad7d.appspot.com",
//     messagingSenderId: "510426676165",
//     appId: "1:510426676165:web:4d955a7fd89277e9cb69ac",
//     measurementId: "G-DK7BFMRM9X",
//   };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   //   const analytics = getAnalytics(app);

//   var _projectId = projectId;
//   var _jwtClient = new googleAuth.JWT(
//     key.client_email,
//     null,
//     key.private_key,
//     ["https://www.googleapis.com/auth/firebase.messaging"],
//     null
//   );

//   var _init = function () {
//     return new Promise(function (resolve, reject) {
//       _jwtClient.authorize(function (error, tokens) {
//         if (error) {
//           reject(error);
//           return;
//         }
//         resolve();
//       });
//     });
//   };

//   var _sendMessage = function (message) {
//     return _jwtClient.request({
//       method: "post",
//       url:
//         "https://fcm.googleapis.com/v1/projects/" +
//         _projectId +
//         "/messages:send",
//       data: message,
//     });
//   };

//   return {
//     init: _init,
//     sendMessage: _sendMessage,
//   };
// };



// var request = require('request');
var googleAuth = require('google-auth-library');

module.exports.Sender = function(projectId="notificationtest-cad7d", key) {

  var _projectId = projectId;
  var _key = key;
  var _tokens = {};

  var _jwtClient = new googleAuth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/firebase.messaging'],
    null
  );

  var _getAccessToken = function() {

    return new Promise(function(resolve, reject) {
      _jwtClient.authorize(function(error, tokens) {
        if (error) {
          reject(error);
          return;
        }
        _tokens = tokens;
        resolve(tokens.access_token);
      });
    });
  };

  var _sendMessage = function(message) {

    return new Promise(function(resolve, reject) {
      fetch({
        method: 'POST',
        url: 'https://fcm.googleapis.com/v1/projects/' + _projectId + '/messages:send',
        headers: {
          'Content-type': 'application/json',
          'Authorization': 'Bearer ' + _tokens.access_token
        },
        body: message,
        json: true
      }, function(error, response, body) {
        if(error) reject(error);
        else {
          resolve(response);
        }
      });
    });
  };

  return {
    getAccessToken: _getAccessToken,
    sendMessage: _sendMessage
  }
}