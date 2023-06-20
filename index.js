
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
var morgan = require('morgan')
const port = process.env.PORT || 5000;

// YOIgtE0PsoKuds0R
// sogoUser

// middleware 
app.use(express.json());
app.use(cors());
app.use (morgan('dev'))




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.SOGO_USER}:${process.env.SOGO_PASS}@cluster0.ysrfscy.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// verifyJWT
const verifyJWT = (req, res, next) =>{
  const authorization = req.headers.authorization;
  if(!authorization){
   return res.status(401).send({ error: true, message: 'Unauthorized Access' })
  }
  console.log(authorization)
  const token = authorization.split(' ')[1]
  console.log(token)
  // token verify
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded)=>{
    if (error){
      return res.status(401).send({ error: true, message: 'Unauthorized Access' })
    }
    req.decoded = decoded
    next()
  })


}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('sogoHotel').collection('users');
    const roomCollection = client.db('sogoHotel').collection('rooms');
    const bookingCollection = client.db('sogoHotel').collection('bookings');


    // generate jwt token
    app.post('/jwt', (req, res) => {
     const email = req.body;
     const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'})
     res.send({token});
    })



//   save user email and role in db
app.put('/users/:email', async(req, res) =>{
  const email = req.params.email;

  const user = req.body
  const query = { email: email}
  const options = { upsert: true }
  const updateDoc = {
    $set: user
  }
  const result = await userCollection.updateOne(query, updateDoc ,options);
  res.send(result)
})

// get user
app.get('/users/:email', async(req, res) =>{
  const email = req.params.email;
  const query = {email: email};
  const result = await userCollection.findOne(query)
  res.send(result)
})




// get all rooms
app.get('/rooms', async(req, res) =>{
  const result = await roomCollection.find().toArray();
  res.send(result)
})



// get a single by email of host
app.get('/rooms/:email', verifyJWT,  async(req, res) =>{
  const decodedEmail = req.decoded.email
  console.log(decodedEmail)
  const email = req.params.email;
  if (decodedEmail !== email) {
    return res.status(403).send({ error: true, message: 'Forbidden Access' })
  }
  const query = { 'host.email' : email };
  const result = await roomCollection.find(query).toArray();
  res.send(result)
})


// get a single room
app.get('/room/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await roomCollection.findOne(query)
  res.send(result)
})


// save a room in database
app.post('/rooms', async(req, res) =>{
  const room = req.body
  const result = await roomCollection.insertOne(room)
  res.send(result)
})


// delete rooms
app.delete('/room/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await roomCollection.deleteOne(query)
  res.send(result)
})



// update room booking status
app.patch('/rooms/status/:id', async(req, res) =>{
  const status = req.body.status
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const updateDoc = {
    $set: {
      booked: status,
    },
  }
  const update = await roomCollection.updateOne(query, updateDoc)
  res.send(update)
});




// save a booking in database
app.post('/bookings', async(req, res) =>{
  const booking = req.body
  const result = await bookingCollection.insertOne(booking)
  res.send(result)
})




// get bookings for guest
app.get('/bookings', async(req, res) =>{
  const email = req.query.email

  if (!email) {
    res.send([])
  }
  const query = {'guest.email': email}
  const result = await bookingCollection.find(query).toArray()
  res.send(result)
})



// get bookings for host
app.get('/bookings/host', async(req, res) =>{
  const email = req.query.email

  if (!email) {
    res.send([])
  }
  const query = {host: email}
  const result = await bookingCollection.find(query).toArray()
  res.send(result)
})




app.delete('/bookings/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await bookingCollection.deleteOne(query)
  res.send(result)
});




    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);













app.get('/', (req, res) => {
  res.send('hotel is running!')
})

app.listen(port, () => {
  console.log(`hotel is running  on port ${port}`)
})