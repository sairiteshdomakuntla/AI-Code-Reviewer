const express=require('express');
const aiRoutes=require('./routes/ai.routes');
const app=express();
const cors=require('cors'); 

app.get('/',(req,res)=>{
    res.send('Hello World!');
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('/ai',aiRoutes);

module.exports=app;