const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('car is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cardoctos.sqztv.mongodb.net/?retryWrites=true&w=majority&appName=carDoctos`;

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

     const serviceCollection=client.db("carDoctor").collection("services")
     const checkoutCollection=client.db("carDoctor").collection("booking")

     app.get("/service",async(req,res)=>{
        const cursor = serviceCollection.find();
        const result=await cursor.toArray()
        res.send(result)

     })


    

     app.get("/service/:id",async(req,res)=>{
        const id=req.params.id
        const query = { _id: new ObjectId(id)}
        const options = {
          
      
            
            // Include only the `title` and `imdb` fields in the returned document
            projection: { price: 1 ,description:1,service_id:1,img:1,title:1,},
          };
        const result=await serviceCollection.findOne(query,options)
        res.send(result)
     })

    //   filter email user
    // http://localhost:5000/booking?email=sirajulll1213@gmail.com&sort=1  (finding formula) 
     app.get('/booking',async(req,res)=>{
        let query={}
        if(  req.query?.email){
            query={email: req.query?.email}
        }
        const result=await checkoutCollection.find(query).toArray()
        res.send(result)
     })
           
     app.post('/booking',async(req,res)=>{
           const data=req.body
           console.log(data)
           const result = await checkoutCollection.insertOne(data);
           res.send(result)
     })

     app.put('/booking/:id',async(req,res)=>{
        const updateBooking=req.body
        const id=req.params.id
        const filter={ _id: new ObjectId(id)}
        console.log(updateBooking)
        const updateDoc = {
            $set: {
              status:updateBooking.status
            },
          };
          const result = await checkoutCollection.updateOne(filter, updateDoc);
          res.send(result)

     })

     app.delete('/booking/:id',async(req,res)=>{
        const id=req.params.id
        const query = { _id: new ObjectId(id) };
         const result = await checkoutCollection.deleteOne(query);
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



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})