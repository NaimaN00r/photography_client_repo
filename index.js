const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3b6qmgb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const serviceCollection = client.db('photography').collection('services');
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