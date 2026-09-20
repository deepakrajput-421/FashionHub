const AddData = require('../model/AddModel')
const GetProduct=async(req,res)=>{
  try{
    const product=await AddData.findById(req.params.id);
    if(!product){
      return res.status(404).json({message:"Product not found"});
    }
    res.json(product);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};

const GetProductByCategory=async(req,res)=>{
  try{
    const products=await AddData.find({
      category:req.params.category
    });
    res.json(products);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};
module.exports={ GetProduct,GetProductByCategory};