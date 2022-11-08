const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3b6qmgb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


app.get('/', (req, res) => {
    res.send('Photography Server Running');
});


//GqGCjiTH0N4mQTwl--password
//hlwmongo---usrName


app.listen(port, () => {
    console.log(`Photography server running on port ${port}`);
})