const{Schema, model} = require("mongoose")
const schema=new Schema({
    videoId:{
          type:String
    },
    mRSS:{
          type:String
    },
    mRSS2:{
          type:String
    },
        data:{
              type:Object  
        }

      
})
module.exports=model('Video',schema)