const keys = require('./keys');

//express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//postgres setup
const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    password: keys.pgPassword,
    database: keys.pgDatabase,
    host: keys.pgHost,
    port: keys.pgPort
    // log: console.log,
    // ssl: false,
    // connectionTimeoutMillis: 10000
});

// console.log("connecting to pg")
pgClient.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('postgres connected')
    }
  });

pgClient.on('error',(err,client)=>console.log(err));

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err=>console.log(err));

//redis client setup

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: ()=> 1000
});

const redisPublisher = redisClient.duplicate();

//define routes
app.get('/',(req,res)=>{
    res.send('Hi');
});

app.get('/values/all',async (req,res)=>{
    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
});

app.get('/values/current',async (req,res)=>{

    // console.log("Redis Host :"+);
    redisClient.hgetall('values',(err,values)=> {
        // console.log("connected "+redisClient.connected);
        // console.log(err+" "+values);
        res.send(values);
    });
    
});

app.post('/values',async (req,res)=>{
    
    const index = req.body.index;
    // console.log(index);
    if(parseInt(index)>40)
        return res.status(422).send('index too high');


    redisClient.hset('values',index,'Nothing yet!!',(err,reply)=>{
        // console.log(err+" "+reply);
    });
    redisPublisher.publish('insert',index);
    await pgClient.query('INSERT INTO values(number) VALUES($1)',[index]);
    
    res.send({working:true});

});

app.listen(5000,()=>{
    console.log('listening on port 5000');
});