
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// YOIgtE0PsoKuds0R
// sogoUser

// middleware 
app.use(express.json());
app.use(cors());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.SOGO_USER}:${process.env.SOGO_PASS}@cluster0.ysrfscy.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('sogoHotel').collection('users');
    const roomCollection = client.db('sogoHotel').collection('rooms');
    const bookingCollection = client.db('sogoHotel').collection('bookings');

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
  console.log(room)
  const result = await roomCollection.insertOne(room)
  res.send(result)
})



    
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