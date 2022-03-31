const express = require('express')
const users = require('./services/users');
const stations = require('./services/stations')
const config = require('./services/firebase');
const bodyParser = require('body-parser')
const Ajv = require('ajv').default
const jwt = require('jsonwebtoken')
const jwtStrategy = require('passport-jwt').Strategy
const extractJwt = require('passport-jwt').ExtractJwt
const firebase = require('firebase/app')
const database = require('firebase/database')

const app = express()
const port = process.env.PORT || 3000
const passport = require('passport')
const ajv = new Ajv()
const jsonSchemaPayment = require('./schemas/jsonSchemaPayment.json')

app.use(express.json())

// load firebase config
firebaseConfig = config.getConfig()
const wth = firebase.initializeApp(firebaseConfig)
const db = database.getDatabase();

// basic authorization for fetching JWT, this makes sure that the one authorizing the request is a real vending machine
const BasicStrategy = require('passport-http').BasicStrategy

passport.use(new BasicStrategy(
  function(id, password, done) {
    const station = stations.getMachine(id)

    if(station == undefined) {
      return done(null, false, { message: "FALSE: incorrect id"})
    }

    if((password === station.password) == false) {
      return done(null, false, {message: "FALSE: incorrect password"})
    }
    return done(null, station)
  }
))

/*
    MAIN API FUNCTIONALITY
*/
app.post('/payment', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body)

  // request gets validated against schema
  let validate = ajv.compile(jsonSchemaPayment)
  let valid = validate(req.body)
  
  if(valid == false) {
    res.status(400)
    res.send(validate.errors.map(err => err.message))
    return
  }

  let currUser = users.getUser(req.body.username,req.body.number)
  //console.log(currUser)

  // check that user is good
  if(currUser.length == 0) {
    return res.sendStatus(400)
  }

  // now debit user with the set amount - done by editing user account
  creditedUser = currUser[0]
  creditedUser.amount += parseFloat(req.body.amount)

  // get time for storing the log
  let now = new Date 
  console.log(now)
  console.log(now.toLocaleString())
  now = now.toLocaleString()
  now = now.replace(", ", ":")
  now = now.replace("/","-")
  now = now.replace("/","-")
  now = "LogT" + now
  console.log(now)
  // log completed transaction
  database.set(database.ref(db, now), {
    creditor: req.body.username,
    creditphoneno: req.body.number,
    amount: req.body.amount
  })

  console.log(users.getAll())
  res.status(200)
  res.send("User has been credited " + req.body.amount)
})

app.listen(port, () => {
  console.log(`Transaction API running on localhost:${port}`)
})


/*
  JWT implementation ;- this checks compares that the key is valid and not expired
*/
let settings = {}
let jwtKey = null

if(process.env.JWTKEY === undefined) {
  jwtKey = require('./jwtKey.json').secret
} else {
  jwtKey = process.env.JWTKEY
}

settings.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
settings.secretOrKey = jwtKey
passport.use(new jwtStrategy(settings, function(payload, done) {
  const time = Date.now() / 1000
  if(payload.exp > time) {
    done(null, payload.user)
  }
  else {
    done(null, false)
  }
}))

// login for machines; this will run on machine launch and fetch jwt
app.get('/stations/login', passport.authenticate('basic', { session: false}), (req,res) => {
  console.log(req.user)
  const body = {
    id: req.user.id,
    password: req.user.password
  }
  const contents = {
    user: body
  }
  const settings = {
    expiresIn: '2d'
  }

  const id = req.user.id

  //create JWT and send it back with the response
  const token = jwt.sign(contents, jwtKey, settings)

  return res.json({ token, id})
})