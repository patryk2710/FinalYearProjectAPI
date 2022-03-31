// firebase information

let firebaseConfig = [
  {
    apiKey: process.env.apikey,
    authDomain: process.env.authdomain,
    databaseURL: process.env.databaseurl,
    projectId: process.env.projectid,
    storageBucket: process.env.storagebucket,
    messagingSenderId: process.env.senderid,
    appId: process.env.appid
  }
];

module.exports = {
  getConfig: () => firebaseConfig[0]
}
