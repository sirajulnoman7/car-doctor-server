const express = require('express')
const cors = require('cors')
const jwt=require('jsonwebtoken')

const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()

app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


require('dotenv').config()



const port = process.env.PORT || 5000

// middleware
app.use(cookieParser());
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
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


// authentication jwt


// Set the JWT as an HTTP-only cookie


// app.post('/jwt',async(req,res)=>{
//     const user=req.body

//     console.log(user)
    
//     const token=  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
//     res.cookie('token',token,{
//       secure: false,
//      httpOnly: true,
//      sameSite:'lax'
//     }).send({success:true})
// })

// ({
//   origin: 'http://localhost:5173',  // Allow requests from your React app
//   credentials: true  // Allow cookies to be sent with requests
// })



app.post('/jwt',(req,res)=>{
  const user=req.body
  console.log(user)
  const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
  res.cookie('token',token,{
    secure:false,
    httpOnly:true,
    sameSite:'lax'
  }).send({success:true})
})


  // middleware create 
  
  const verifyToken= async(req,res,next)=>{
     const token=req.cookies?.token;
    //  console.log('verify middleware',token)
     if(!token){
      return res.status(401).send({message:'Unauthorized'})
     }

     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        // error 
        if(err){
          console.log(err)
          return res.status(401).send({message:'Unauthorized you have not any access'})
        }
        // decoded
        console.log('verify token jwt',decoded)
        req.user=decoded;
        next()
     })
    
    
  }

  const logger= async(req,res,next)=>{
        // console.log('my middleware',req.host, req.originalUrl)
    next()

  }
 
     app.get("/service",logger, async(req,res)=>{
        const cursor = serviceCollection.find();
        const result=await cursor.toArray()
        res.send(result)

     })


    

     app.get("/service/:id",logger, async(req,res)=>{
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
     app.get('/booking',logger, verifyToken, async(req,res)=>{
      // console.log("cookie token ",req.cookies.token)
      
      // jwt verify access token and user 
      console.log('form valid token user',req.user)
      if(req.query.email !==req.user.email){
        return res.status(403).send({message:"permission not alow "})
      }
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