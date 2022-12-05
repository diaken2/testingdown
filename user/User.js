const{Schema, model} = require("mongoose")
const schema=new Schema({
    
        email:{
              type:String
        },
        password:{
            type:String
        }
      
})
module.exports=model('User',schema)