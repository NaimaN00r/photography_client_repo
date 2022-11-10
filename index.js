const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt=require('jsonwebtoken');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3b6qmgb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;

  if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'Forbidden access'});
      }
      req.decoded = decoded;
      next();
  })
}

async function run(){
    try{
        const serviceCollection = client.db('photography').collection('services');
        const reviewCollection = client.db('photography').collection('reviews');
        app.post('/jwt',(req,res)=>{
            const user=req.body;
            const token=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
            res.send({token})
        })
        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/allservices', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post("/services", async (req, res) => {
            try {
              const result = await serviceCollection.insertOne(req.body);
          
              if (result.insertedId) {
                res.send({
                  success: true,
                  message: `Successfully created the ${req.body.title} with id ${result.insertedId}`,
                });
              } else {
                res.send({
                  success: false,
                  error: "Couldn't create the product",
                });
              }
            } catch (error) {
              console.log(error.name.bgRed, error.message.bold);
              res.send({
                success: false,
                error: error.message,
              });
            }
          });
       
      app.get('/reviews',verifyJWT, async (req, res) => {
        const decoded = req.decoded;
        
        if(decoded.email !== req.query.email){
            res.status(403).send({message: 'unauthorized access'})
        }

        let query = {};
        if (req.query.service) {
              query = {
                  service: req.query.service
              }
          }
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }

        const cursor = reviewCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
    });
          app.post('/reviews',  async (req, res) => {
            const order = req.body;
            const result = await reviewCollection.insertOne(order);
            res.send(result);
        });

        app.delete('/reviews/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await reviewCollection.deleteOne(query);
          res.send(result);
      })
    }
    finally{

    }

}
run().catch(err=>console.log(err));

app.get('/', (req, res) => {
    res.send('Photography Server Running');
});

app.listen(port, () => {
    console.log(`Photography server running on port ${port}`);
})