const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofwxe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const electronicsCollection = client.db('electronics').collection('product');

        //electronics api
        app.get('/inventoryitems', async (req, res)=>{
            const query = {};
            const cursor = electronicsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        //prodcutId api
        app.get('/update/:id',async(req,res) =>{
            const id =req.params.id;
            const query ={_id: ObjectId(id)};
            const update= await electronicsCollection.findOne(query);
            res.send(update);
        });

        // update quantity

        app.put('/quantity/:id',async(req,res)=>{
            const id = req.params.id;
            const user = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                ...user
               
              },
            };
            const result = await electronicsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
          })

          //restock quantity

          app.put('/restock/:id',async(req,res)=>{
            const id = req.params.id;
            const user = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                ...user
               
              },
            };
            const result = await electronicsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
          })

    }
    finally {

    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Server is running');
});
app.listen(port, () => {
    console.log('crud is running');
})