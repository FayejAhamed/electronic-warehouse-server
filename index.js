const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { send } = require('express/lib/response');
const { decode } = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();


//use middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofwxe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const electronicsCollection = client.db('electronics').collection('product');
        const orderCollection = client.db('electronics').collection('order');

        
        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

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
          });
          app.get('/myorder/:id',async(req,res) =>{
            const id =req.params.id;
            const query ={_id: ObjectId(id)};
            const update= await electronicsCollection.findOne(query);
            res.send(update);
        });

          // delete products
          app.delete('/update/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await electronicsCollection.deleteOne(query);
            res.send(result);
        })
          app.delete('/myorder/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        //add new items
        app.post('/inventoryitems', async (req, res) => {
            const newService = req.body;
            const result = await electronicsCollection.insertOne(newService);
            res.send(result);
        });


        //order collection api

       
        app.get('/order', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
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