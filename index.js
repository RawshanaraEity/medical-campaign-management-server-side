const express = require('express');
const app = express()
const cors = require('cors')
require("dotenv").config();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkpsd7x.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const campCollection = client.db('medicalCampDB').collection('camps')
    const reviewCollection = client.db('medicalCampDB').collection('reviews')
    const userCollection = client.db('medicalCampDB').collection('users')
    const registerCollection = client.db('medicalCampDB').collection('register')

    // camp related api
    app.post('/camps',  async(req, res) =>{
        const camp = req.body;
        const result = await campCollection.insertOne(camp)
        res.send(result)
    })


    app.get('/camps', async(req, res) =>{
        const result = await campCollection.find().toArray();
        res.send(result)
    })
   

    app.get('/camps/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await campCollection.findOne(query);
        res.send(result)
    })

    app.delete('/camps/:id',  async(req, res) =>{
        const id = req.params.id
        const query = {_id:new ObjectId (id)}
        const result = await campCollection.deleteOne(query)
        res.send(result)
    })

    app.patch('/camps/:id', async (req, res) =>{
        const item = req.body;
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updatedDoc = {
            $set: {
              campName: item.campName,
              campFees: item.campFees,
              scheduledDate: item.scheduledDate,
              scheduledTime: item.scheduledTime,
              venueLocation: item.venueLocation,
              specializedServices: item.specializedServices,
              healthcareProfessionals: item.healthcareProfessionals,
              benefits: item.benefits,
              targetAudience: item.targetAudience,
              participantCount: item.participantCount,
              description: item.description,
              image: item.image
            }
        }
        const result = await campCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })


    // user related api

    app.get('/users', async(req, res) =>{
        const result = await userCollection.find().toArray();
        res.send(result)
    })


    app.get('/users/organizer/:email', async (req, res) => {
        const email = req?.params?.email;
        // console.log('user email', email);
    
        const query = { email: email }
        const user = await userCollection.findOne(query);
        // console.log(user);
        if(user) {
            const organizer = user?.role === 'organizer'; 
            res.send({ success: true, organizer });
        } else {
          
            res.status(404).send({ success: false, message: 'User not found' });
        }
    });


    app.get('/users/participant/:email', async (req, res) => {
        const email = req?.params?.email;
        // console.log('user email', email);
    
        const query = { email: email }
        const user = await userCollection.findOne(query);
        // console.log(user);
        if (user) {
            const participant = user?.role === 'participant'; 
            res.send({ success: true, participant });
        } else {
            
            res.status(404).send({ success: false, message: 'User not found' });
        }
    });

    app.get('/users/professional/:email', async (req, res) => {
        const email = req?.params?.email;
        // console.log('user email', email);
    
        const query = { email: email }
        const user = await userCollection.findOne(query);
        // console.log(user);
        if (user) {
            const professional = user?.role === 'healthcareProfessional'; 
            res.send({ success: true, professional });
        } else {
            
            res.status(404).send({ success: false, message: 'User not found' });
        }
    });


    
    app.post('/users', async(req, res) =>{
        const user = req.body;
        const query = {email : user.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser){
            return res.send({message: 'user already exists',insertedId: null})
        }
        const result = await userCollection.insertOne(user);
        res.send(result)
    })

   

    // register related api
    app.get('/register', async(req, res) =>{
        const result = await registerCollection.find().toArray();
        res.send(result)
    })


    app.post('/register', async(req, res) =>{
        const registeredUser = req.body;
        console.log(registeredUser);
        const result = await registerCollection.insertOne(registeredUser);
        await campCollection.updateOne(
            { _id: new ObjectId(registeredUser.campId) },
            { $inc: {  participantCount: 1 } }
        );
        res.send(result)
    })


    // reviews retated api
    app.get('/reviews', async(req, res) =>{
        const result = await reviewCollection.find().sort({date: -1}).toArray();
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



app.get('/', (req,res) =>{
    res.send('medicamp is running')
})

app.listen(port, () =>{
    console.log(`medicamp is running on ${port}`);
})