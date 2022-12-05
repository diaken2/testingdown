const express=require("express")
const app=express()
const body=require('body-parser')
const fs=require('fs')
const path=require('path')
const axios=require("axios")
var XMLHttpRequest = require('xhr2')
var FormData = require('form-data');
const mongoose=require('mongoose')
var json2xls = require('json2xls');
const Video=require('./video/Video')
const bcrypt = require('bcryptjs')
const fetch=require('node-fetch')
const jwt = require('jsonwebtoken')
const User=require("./user/User")
const Duble=require("./duble/Duble")
var ffprobe = require('ffprobe')
var ffprobeStatic = require('ffprobe-static');
const fileMiddleware=require("./multer/file")
const {check, validationResult} = require('express-validator')
app.use(express.static('mrssFiles'));


// app.use(function(req, res, next) {


//   res.header("Access-Control-Allow-Origin","https://viralbear.media"); // update to match the domain you will make the request from
//       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//       next();
  

  
//   });






var EasyYandexS3 = require('easy-yandex-s3');
var s3 = new EasyYandexS3({
  auth: {
    accessKeyId: 'YCAJE9VavEEX6lxxxmn5Zf9gf',
    secretAccessKey: 'YCNN8SqgPoEf14LAsSfeVL8hJqC-G6YDL2cwSHrQ',
  },
  Bucket: 'viralbear', // например, "my-storage",
  debug: false, // Дебаг в консоли, потом можете удалить в релизе
});


let PORT=process.env.PORT || 8888
const filePath2=path.join(__dirname,"localstorage","localstorage.txt")
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.json({extended:true}))
app.set('view engine','ejs')
app.set("views", path.resolve(__dirname,"ejs"))
app.use(express.static(path.join(__dirname, 'build')));
app.use('/form', body.urlencoded({
    extended: true
}));
app.use('/excel', body.urlencoded({
    extended: true
}));

let allxls=[]



app.post('/getVideo', fileMiddleware.fields([{
  name: 'fileVideo', maxCount: 1
}, {
  name: 'filePhoto', maxCount: 1
}]), async(req,res)=>{
// console.log(req.body)
// console.log(req.files)
// console.log(req.files.fileVideo[0].path)

var upload = await s3.Upload(
  [ {
     path:req.files.fileVideo[0].path,
   },
   {
      path:req.files.filePhoto[0].path
     
     }],
   '/images/'
 );
 console.log(upload)



})


let changedPhoto
let changedVideo
app.post('/changePhoto',fileMiddleware.single('photo'),async(req,res)=>{
  // if(req.file.originalname.substr(-3)=="jpg")
  if (req.file.originalname.substr(-3)=="jpg"){
  var upload = await s3.Upload(
    {
       path:req.file.path,
     },
     
     '/images/'
   );
    }
    else{
      return res.status(404).json({ message: 'НЕВЕРНЫЙ ФОРМАТ ФАЙЛА' })
    }
   changedPhoto=upload.Location
   console.log(upload)
   res.json(upload.Location)

})

app.post('/changeVideo',fileMiddleware.single('video'),async(req,res)=>{

  console.log(req.file.originalname.substr(-3))
if (req.file.originalname.substr(-3)=="mp4"){
  var upload = await s3.Upload(
    {
       path:req.file.path,
     },
     
     '/images/'
   );
    }
    else{
      return res.status(404).json({ message: 'НЕВЕРНЫЙ ФОРМАТ ФАЙЛА' })

    }
   changedVideo=upload.Location
   console.log(upload)
   res.json(upload.Location)
})












app.post('/changeData',(req,res)=>{
    console.log(req.body)
    const date=new Date()
    
   let changeDate

if(req.body.changeDate.includes('-')){
      const dateDeform=String(new Date(req.body.changeDate)).split(' ')
      changeDate=`${dateDeform[0]}, ${dateDeform[2]} ${dateDeform[1]} ${dateDeform[3]}`
}
else{
  changeDate=req.body.changeDate
}
    
    Video.updateOne({_id:req.body.id}, {data:{
      title:req.body.changeTitle,
     description:req.body.changeDescription,
      tags:req.body.changeTags,
      city:req.body.changeCity,
      country:req.body.changeCountry,
      category:req.body.changeCategory,
      date:changeDate,
      videoId:req.body.changeVideoId,
      videoLink:req.body.changeVideoLink,
      downloadPhoto:req.body.changeDownloadPhoto,
      downloadVideo:req.body.changeDownloadVideo,
      lastModif:date.toGMTString(),
      brandSafe:req.body.brandSafeUpdate,
      videoCreateDate:req.body.videoCreateDate
      
      
    }},()=>{
      console.log("Изменено")
    })

    Video.updateOne({_id:req.body.iq},{videoId:req.body.changeVideoId})

    Duble.updateOne({videoId:req.body.videoId},{videoId:req.body.changeVideoId})

    ffprobe(req.body.changeDownloadVideo, { path: ffprobeStatic.path }, async function (err, info) {
      if (err) return done(err);
     



      Duble.updateOne({videoId:req.body.videoId}, {data:{
        title:req.body.changeTitle,
       description:req.body.changeDescription,
        tags:req.body.changeTags,
        city:req.body.changeCity,
        country:req.body.changeCountry,
        category:req.body.changeCategory,
        date:changeDate,
        videoId:req.body.changeVideoId,
        videoLink:req.body.changeVideoLink,
        downloadPhoto:req.body.changeDownloadPhoto,
        downloadVideo:req.body.changeDownloadVideo,
        lastModif:date.toGMTString(),
        brandSafe:req.body.brandSafeUpdate,
        videoCreateDate:req.body.videoCreateDate,
        duration:Math.floor(info.streams[0].duration)
        
      }},()=>{
        console.log("Duble тоже изменено")
      })
  


      
        








        
   
    
    })











    if (req.body.brandSafeUpdate){
 
      Video.updateOne({_id:req.body.id},{mRSS:`        <item>          <media:title>${req.body.changeTitle.replace(/&/g,"&amp;")}</media:title>          <media:description>${req.body.changeDescription.replace(/&/g,"&amp;")}</media:description>          <media:keywords>${req.body.changeTags}</media:keywords>          <media:city>${req.body.changeCity}</media:city>          <media:country>${req.body.changeCountry}</media:country>          <media:category>${req.body.changeCategory}</media:category>          <media:filmingDate>${changeDate}</media:filmingDate>          <guid>${req.body.changeVideoId}</guid>          <media:youtubeLink>${req.body.changeVideoLink}</media:youtubeLink>          <pubDate>${req.body.videoCreateDate}</pubDate>          <media:thumbnail url="${req.body.changeDownloadPhoto}" />          <media:content url="${req.body.changeDownloadVideo}" />          <dfpvideo:lastModifiedDate>${date.toGMTString()}</dfpvideo:lastModifiedDate>                  </item>`},()=>{
        console.log("Изменено MRSS")
      })
      Video.updateOne({_id:req.body.id},{mRSS2:`        <item>          <media:title>${req.body.changeTitle.replace(/&/g,"&amp;")}</media:title>          <media:description>${req.body.changeDescription.replace(/&/g,"&amp;")}</media:description>          <media:keywords>${req.body.changeTags}</media:keywords>          <media:city>${req.body.changeCity}</media:city>          <media:country>${req.body.changeCountry}</media:country>          <media:category>${req.body.changeCategory}</media:category>          <media:filmingDate>${changeDate}</media:filmingDate>          <guid>${req.body.changeVideoId}</guid>          <media:youtubeLink>${req.body.changeVideoLink}</media:youtubeLink>          <pubDate>${req.body.videoCreateDate}</pubDate>          <media:thumbnail url="${req.body.changeDownloadPhoto}" />          <media:content url="${req.body.changeDownloadVideo}" />          <dfpvideo:lastModifiedDate>${date.toGMTString()}</dfpvideo:lastModifiedDate>                  </item>`},()=>{
        console.log("Изменено MRSS2")
      })


    }
    else{
      Video.updateOne({_id:req.body.id},{mRSS:`        <item>          <media:title>${req.body.changeTitle.replace(/&/g,"&amp;")}</media:title>          <media:description>${req.body.changeDescription.replace(/&/g,"&amp;")}</media:description>          <media:keywords>${req.body.changeTags}</media:keywords>          <media:city>${req.body.changeCity}</media:city>          <media:country>${req.body.changeCountry}</media:country>          <media:category>${req.body.changeCategory}</media:category>          <media:filmingDate>${changeDate}</media:filmingDate>          <guid>${req.body.changeVideoId}</guid>          <media:youtubeLink>${req.body.changeVideoLink}</media:youtubeLink>          <pubDate>${req.body.videoCreateDate}</pubDate>          <media:thumbnail url="${req.body.changeDownloadPhoto}" />          <media:content url="${req.body.changeDownloadVideo}" />          <dfpvideo:lastModifiedDate>${date.toGMTString()}</dfpvideo:lastModifiedDate>                  </item>`},()=>{
        console.log("Изменено MRSS")
      })
      Video.updateOne({_id:req.body.id},{mRSS2:''},()=>{
        console.log("Изменено MRSS2")
      })

    }
    res.json(req.body)
  })





app.get('/yandex',async(req,res)=>{

  var upload = await s3.Upload(
    {
      path: path.resolve(__dirname, './spectators.mp4'),
    },
    '/images/'
  );
  console.log(upload);


  
// Инициализация


})


  
app.post('/excel', async function(req, res, next) {
  console.log("Подключено к эксель")
    const videos=await Video.find({})
    console.log(videos)
    console.log(videos[videos.length-1].data.videoId)
    const {videoId,title,videoLink,description,date,city,country,tags}= videos[videos.length-1].data
    console.log(req.body)
    const filePathExcel=path.join(__dirname,"excel","data.xlsx")
    // Объект req.body содержит данные из переданной формы
    var json2xls = require('json2xls');
    let objectData=[{
        Id:videoId,
        TITLE:title,
        VideoLink:videoLink,
        STORY:description,
        DATE:date,
        CITY:city,
        COUNTRY:country,
        KEYWORDS:tags
    },{
         Id:'d',
        TITLE:"ds",
        VideoLink:"ds",
        STORY:"sd",
        DATE:"ssd",
        CITY:"sd",
        COUNTRY:"dsd",
        KEYWORDS:"sd"
    }]
    allxls.push(objectData)
    
var xls = json2xls(allxls);


fs.writeFileSync(filePathExcel, xls, 'binary');
allxls=[]

//     fs.readFile(filePath2,"utf-8",(err,content)=>{
//     if(err){
//         throw err
//     }
//     console.log(content)
//     filePath4=path.join(__dirname,"alldata",'alldata'+".xml" )
//      fs.writeFile(filePath4, content ,async (err)=>{
//         if(err){
//             throw err
//         }
//         else{
//             console.log("XML файл создан")
            
    setTimeout(()=>{
        fs.writeFile(filePath2, ``,(err)=>{ 
            if(err){
                throw err
            }
            else{
                console.log("Удалено")
                
            
            }
    })
    },2000)    
            
        
    
res.json("Успех")
    
// })
    
})

app.post('/exceldownload',async(req,res)=>{
 if (req.body.emptyDiapArray){
  const XLSX=require('xlsx')
  const columnList=[
    "ID",
    "TITLE",
    "VideoLink",
    "STORY",
    "DATE",
    "CITY",
    "COUNTRY",
    "KEYWORDS"
  ]
  const workSheetName='Videos'
  const filePathExcel=path.join(__dirname,"excel","data.xlsx")
  
  let videoList=[
  
  ]
  
  let listVid=[]
  for (u of req.body.emptyDiapArray){
    const videos=await Video.find({videoId : String(u)})
    let A=[]
    console.log(A[0]==false)
    if (videos[0]){
listVid.push(u)
    }
  
  }
  console.log(listVid)
  for (i of listVid){
    
    const videos=await Video.find({videoId : String(i)})
    
    
    console.log(videos)
    let objectExcel={
  id:videos[0].videoId,
  title:videos[0].data.title,
  videoLink:videos[0].data.videoLink,
  story:videos[0].data.description,
  date:videos[0].data.date,
  city:videos[0].data.city,
  country:videos[0].data.country,
  keywords:videos[0].data.tags
    }
    videoList.push(objectExcel)
  
    console.log(videoList)
  }
  const exportsVideoToExcel=(videoList, columnList, workSheetName, filePathExcel)=>{
  const data=videoList.map(video=>{
    return [video.id,video.title,video.videoLink,video.story,video.date,video.city,video.country,video.keywords]
  })
  const workBook=XLSX.utils.book_new()
  const workSheetData=[
    columnList,
    ...data
  ]
  const workSheet=XLSX.utils.aoa_to_sheet(workSheetData)
  XLSX.utils.book_append_sheet(workBook,workSheet,workSheetName)
  XLSX.writeFile(workBook,filePathExcel)
  return true
  
  
  
  
  
  }
  
  exportsVideoToExcel(videoList,columnList,workSheetName,filePathExcel)
}



else{
const videos=await Video.find({videoId : req.body.diap})

  console.log(req.body)
  const {videoId,title,videoLink,description,date,city,country,tags}= videos[videos.length-1].data



 
    console.log(req.body)
  const filePathExcel=path.join(__dirname,"excel","data.xlsx")
  // Объект req.body содержит данные из переданной формы
  var json2xls = require('json2xls');
  let objectData={
    Id:videoId,
    TITLE:title,
    VideoLink:videoLink,
    STORY:description,
    DATE:date,
    CITY:city,
    COUNTRY:country,
    KEYWORDS:tags
}
  allxls.push(objectData)
  
var xls = json2xls(allxls);


fs.writeFileSync(filePathExcel, xls, 'binary');
allxls=[]
}

//     fs.readFile(filePath2,"utf-8",(err,content)=>{
//     if(err){
//         throw err
//     }
//     console.log(content)
//     filePath4=path.join(__dirname,"alldata",'alldata'+".xml" )
//      fs.writeFile(filePath4, content ,async (err)=>{
//         if(err){
//             throw err
//         }
//         else{
//             console.log("XML файл создан")
          
  setTimeout(()=>{
      fs.writeFile(filePath2, ``,(err)=>{ 
          if(err){
              throw err
          }
          else{
              console.log("Удалено")
              
          
          }
  })
  },2000)   
        // const formData = new FormData();
        // formData.append('file', fs.createReadStream('excel/data.xlsx'));
        
        // formData.append('user', "hubot");
 







  res.download(path.resolve(__dirname,"excel","data.xlsx"))

})




app.post('/delete', (req,res)=>{
    console.log("Файл удален")
    console.log(req.body)
    Video.findOneAndDelete({_id:req.body.id},()=>{
      console.log("Всё удалилось")
    })
    Duble.findOneAndDelete({videoId:req.body.videoId},()=>{
      console.log("Всё удалилось")
    })
    res.json(req.body)
  })







 app.post(
    '/login',
    [
      check('email', 'Please enter a valid email').normalizeEmail().isEmail(),
      check('password', 'Enter password').exists()
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect login information'
        })
      }
  
      const {email, password} = req.body
  
      const user = await User.findOne({ email })
  
      if (!user) {
        return res.status(400).json({ message: 'User is not found' })
      }
  
      const isMatch = await bcrypt.compare(password, user.password)
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Wrong password, please try again' })
      }
  
      const token = jwt.sign(
        { userId: user.id },
        "admin video application",
        { expiresIn: '1h' }
      )
  
      res.json({ token, userId: user.id })
  
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong, please try again' })
    }
  })




 app.post(
    '/register',
    [
      check('email', 'Incorrect email').isEmail(),
      check('password', 'Minimum password length 6 characters')
        .isLength({ min: 6 })
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data during registration'
        })
      }
  
      const {email, password} = req.body
  
      const candidate = await User.findOne({ email })
  
      if (candidate) {
        return res.status(400).json({ message: 'This user already exists' })
      }
  
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({ email, password: hashedPassword })
  
      await user.save()
  
      res.status(201).json({ message: 'User created' })
  
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong, please try again' })
    }
  })
  





























































app.post('/getPages',async(req,res)=>{
  console.log("Подключено к getPages")
  const videos=await Video.find({})
  res.json(videos)
 
  

})

// app.post('/searchfilter',async(req,res)=>{
// console.log("Подключено к фильтру")
// console.log(req.body)
//   const videos=await Video.find({})
//   const filteredVideo=videos.filter(video=>{
//     //Добавить if ко всем фильтрам это важно!!!!!!!!!!!!!!!!!!!!!!! мозги блять включай мозги если есть параметр зачит по нему фильтруешь, если нет значит весь массив
//     return video.data.category.includes(req.body.searchCategory)
//   })
//   const filteredTitle=filteredVideo.filter(video=>{
//     return video.data.title.includes(req.body.searchTitle)
//   })
//   console.log(filteredTitle)
// })

// app.get('/createDuble',async(req,res)=>{
//   console.log("зАПУЩЕНО")
//   const videos=await Video.find({})
//   videos.sort((prev,next)=>{
//     return Number(prev.data.videoId)-Number(next.data.videoId)
//    })
//   videos.find((item)=>{
//     ffprobe(item.data.downloadVideo, { path: ffprobeStatic.path }, async function (err, info) {
//       if (err) return done(err);
     
//       const duble = new Duble({
//         videoId:item.videoId,
         
//         data:{
//             title:item.data.title,description:item.data.description,tags:item.data.tags,brandSafe:item.data.brandSafe,city:item.data.city,videoCreateDate:item.data.videoCreateDate,country:item.data.country,category:item.data.category,date:item.data.date,videoId:item.data.videoId,videoLink:item.data.videoLink,downloadVideo:item.data.downloadVideo,downloadPhoto:item.data.downloadPhoto,lastModif:item.data.lastModif,
           
//         },
//         duration:Math.floor(info.streams[0].duration)
//     })
//     await duble.save()
//     })
      
      
    
      
    
//     })



//   })
  


app.post('/allDubles', async(req,res)=>{
  const dubles=await Duble.find({})
  res.json(dubles)
})








const ITEMS_PER_PAGE=10

app.post('/allSite', async(req,res)=>{
  
 console.log(req.body)
 let itemsId=[]
req.body.find(e=>{
itemsId.push(e.videoId)
})
 

  
  const page = req.query.page || 1
const query={

}
  try{
    const skip = (page-1) * ITEMS_PER_PAGE
    
  console.log("Подключено к бэкэнду для viralbear")
  if(req.body[0]){
 
    const items=await Duble.find({ 
      videoId: {
          $in: itemsId
      }
  }).sort({videoId: -1 }).collation({locale: "en_US", numericOrdering: true}).limit(ITEMS_PER_PAGE).skip(skip);
  console.log(itemsId.length)
  pageCount = Math.ceil(itemsId.length / ITEMS_PER_PAGE)
  const count=itemsId.length
// console.log(videos)


res.json({
  pagination:{
    count,
    pageCount
  },
  items
})


  }
  else{



    


    const count = await Duble.estimatedDocumentCount(query)
  const items=await Duble.find(query).sort({videoId: -1 }).collation({locale: "en_US", numericOrdering: true}).limit(ITEMS_PER_PAGE).skip(skip)
  
  pageCount = Math.ceil(count / ITEMS_PER_PAGE)
// console.log(videos)


res.json({
  pagination:{
    count,
    pageCount
  },
  items
})


  //  await getVideoDuration(
  //   item.data.downloadVideo
  // ).then((duration) => {
  //   console.log(duration)
    // const ObjectDuration={
    //   _id:item._id,
    //   videoId:item.videoId,
     
    //   data:item.data,
    //   duration:Math.floor(duration)


    // }
    // durationObjects.push(ObjectDuration)
  
 



  }



  // res.json(videos)
  }
  catch(e){
    console.error(e);
  }
})



app.post("/alldata",async(req,res)=>{
    console.log("Подключено к бэкэнду для viralbear")
    const videos=await Video.find({})
    
  const filePath=path.join(__dirname,"mrssFiles","mrss.xml")
  const filePath2=path.join(__dirname,"mrssFiles","mrss2.xml")
  let A=[]
  for (let el of videos.slice(-50)){
    A.push(el.mRSS)
  }
  fs.writeFile(filePath,`<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/"
  xmlns:dfpvideo="http://api.google.com/dfpvideo"
  xmlns:tms="http://data.tmsapi.com/v1.1"
  version="2.0">
   <channel>
     <title>ViralBear videos</title>
     <dfpvideo:version>2</dfpvideo:version>${A.reverse().join(' ')}</channel>
     </rss>`,(err)=>{ 
       console.log("MRSS CREATED!")
     })






     let B=[]
     for (let el2 of videos.slice(-50)){
       B.push(el2.mRSS2)
     }
     fs.writeFile(filePath2,`<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/"
     xmlns:dfpvideo="http://api.google.com/dfpvideo"
     xmlns:tms="http://data.tmsapi.com/v1.1"
     version="2.0">
      <channel>
        <title>ViralBear videos</title>
        <dfpvideo:version>2</dfpvideo:version>${B.reverse().join(' ')}</channel>
        </rss>`,(err)=>{ 
          console.log("MRSS2 CREATED!")
        })







    res.json(videos)
    
    
})





app.post('/data',fileMiddleware.fields([{
  name: 'fileVideo', maxCount: 1
}, {
  name: 'filePhoto', maxCount: 1
}]),async(req,res)=>{
  
    try{
      if(req.files.filePhoto[0].originalname.substr(-3)=="jpg" && req.files.fileVideo[0].originalname.substr(-3)=="mp4"){
      console.log(req.files.fileVideo[0].originalname.substr(-3))
      console.log(req.files.filePhoto[0].originalname.substr(-3))
      var upload = await s3.Upload(
       [ {
          path:req.files.fileVideo[0].path,
          name:req.body.videoId+'.'+req.files.fileVideo[0].originalname.substr(-3)
        },
        {
           path:req.files.filePhoto[0].path,
          name:req.body.videoId + '.'+  req.files.filePhoto[0].originalname.substr(-3)
          }],
        '/images/'
      );
        }
        else{
          return res.status(201).json({ message: 'Форматы файлов неверны' })
        }
      console.log(upload)
     
      
        console.log(req.body)
        const {title,description,tags,city,country,videoCreateDate,category,date,videoLink,videoId,lastModif,brandSafe}=req.body
        
        const hasId = await Video.findOne({videoId})
        
        console.log(hasId)
            if (hasId) {
              return res.status(409).json({ message: 'Видео с таким id уже существует в базе данных' })
            }
            
        if (brandSafe==1){
          
          
          const video = new Video({
            videoId:videoId,
             mRSS2:`        <item>          <media:title>${title.replace(/&/g,"&amp;").trim()}</media:title>          <media:description>${description.replace(/&/g,"&amp;").trim()}</media:description>          <media:keywords>${tags.trim()}</media:keywords>          <media:city>${city.trim()}</media:city>          <media:country>${country.trim()}</media:country>          <media:category>${category.trim()}</media:category>          <media:filmingDate>${date}</media:filmingDate>          <guid>${videoId.trim()}</guid>          <media:youtubeLink>${videoLink}</media:youtubeLink>          <pubDate>${videoCreateDate}</pubDate>          <media:thumbnail url="${upload[1].Location}" />          <media:content url="${upload[0].Location}" />          <dfpvideo:lastModifiedDate>${lastModif}</dfpvideo:lastModifiedDate>                </item>`,
             mRSS:`        <item>          <media:title>${title.replace(/&/g,"&amp;").trim()}</media:title>          <media:description>${description.replace(/&/g,"&amp;").trim()}</media:description>          <media:keywords>${tags.trim()}</media:keywords>          <media:city>${city.trim()}</media:city>          <media:country>${country.trim()}</media:country>          <media:category>${category.trim()}</media:category>          <media:filmingDate>${date}</media:filmingDate>          <guid>${videoId.trim()}</guid>          <media:youtubeLink>${videoLink}</media:youtubeLink>          <pubDate>${videoCreateDate}</pubDate>          <media:thumbnail url="${upload[1].Location}" />          <media:content url="${upload[0].Location}" />          <dfpvideo:lastModifiedDate>${lastModif}</dfpvideo:lastModifiedDate>                  </item>`,
            data:{
                title,description,tags,brandSafe,city,videoCreateDate,country,category,date,videoId,videoLink,downloadVideo:upload[0].Location,downloadPhoto:upload[1].Location,lastModif,
               
            }
        })
        await video.save()
        
        }
        if(brandSafe==0){
          const video = new Video({
            videoId:videoId,
            mRSS:`        <item>          <media:title>${title.replace(/&/g,"&amp;").trim()}</media:title>          <media:description>${description.replace(/&/g,"&amp;").trim()}</media:description>          <media:keywords>${tags.trim()}</media:keywords>          <media:city>${city.trim()}</media:city>          <media:country>${country.trim()}</media:country>          <media:category>${category.trim()}</media:category>          <media:filmingDate>${date}</media:filmingDate>          <guid>${videoId.trim()}</guid>          <media:youtubeLink>${videoLink}</media:youtubeLink>          <pubDate>${videoCreateDate}</pubDate>          <media:thumbnail url="${upload[1].Location}" />          <media:content url="${upload[0].Location}" />          <dfpvideo:lastModifiedDate>${lastModif}</dfpvideo:lastModifiedDate>                  </item>`,
            data:{
                title,description,brandSafe,tags,videoCreateDate,city,country,category,date,videoId,videoLink,downloadVideo:upload[0].Location,downloadPhoto:upload[1].Location,lastModif,
                
                
            }
        })
        await video.save()
        }
        ffprobe(upload[0].Location, { path: ffprobeStatic.path }, async function (err, info) {
          if (err) return done(err);
         
          const duble = new Duble({
            videoId:videoId,
             
            data:{
              title,description,tags,brandSafe,city,videoCreateDate,country,category,date,videoId,videoLink,downloadVideo:upload[0].Location,downloadPhoto:upload[1].Location,lastModif,
               
            },
            duration:Math.floor(info.streams[0].duration)
        })
        await duble.save()
        })
        console.log("Данные записаны")
        res.json('Готово')
    }catch(e){console.log(e.message)}
 
})






// app.post('/form', function(req, res, next) {
//     // Объект req.body содержит данные из переданной формы
    
//     console.dir(req.body)
    
//     filePath=path.join(__dirname, req.body.paths,req.body.video_id+".xml" )
//     fs.writeFile(filePath, `<?xml version="1.0" encoding="UTF-8"?><item><title>${req.body.title}</title><description>${req.body.description}</description><guid>${req.body.video_id}</guid><category>${req.body.category}</category><pubDate>${new Date()}</pubDate> <media:keywords>${req.body.tags}</media:_media_keywords></item>`,(err)=>{
//         if(err){
//             throw err
//         }
//         else{
//             console.log("XML файл создан")
            
//             let objectData={
//                 Id:req.body.video_id,
//                 TITLE:req.body.title,
//                 VideoLink:req.body.video_link,
//                 STORY:req.body.description,
//                 DATE:req.body.date,
//                 CITY:req.body.city,
//                 COUNTRY:req.body.country,
//                 KEYWORDS:req.body.tags
//             }
//             allxls.push(objectData)
//             console.log(allxls)
//             fs.appendFile(filePath2,`<?xml version="1.0" encoding="UTF-8"?><item><title>${req.body.title}</title><description>${req.body.description}</description><guid>${req.body.video_id}</guid><category>${req.body.category}</category><pubDate>${new Date()}</pubDate> <media:keywords>${req.body.tags}</media:_media_keywords></item>`,(err)=>{
//     if(err){
//         throw err
//     }
//     console.log('File writed')})
//         }
// })
// })






const start=async()=>{
    try{
        await mongoose.connect('mongodb+srv://kenan:2002azer@cluster0.j86rtdi.mongodb.net/?retryWrites=true&w=majority',{})
        app.listen(PORT,()=>{
            console.log("Server has been launched on PORT", PORT)
        })
    }catch(e){console.log(e.message)}
    
}
start()

// app.get('/mrss',async(req,res)=>{
//   const array=await Video.find({})
//   const filePath=path.join(__dirname,"mrssFiles","mrss.xml")

//   let A=''
//   for (let el of array.slice(-50)){
//     A+=el.mRSS 
//   }
//   fs.writeFile(filePath,`<rss xmlns:atom="http://www.w3.org/2005/Atom"
//   xmlns:media="http://search.yahoo.com/mrss/"
//   xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/"
//   xmlns:dfpvideo="http://api.google.com/dfpvideo"
//   xmlns:tms="http://data.tmsapi.com/v1.1"
//   version="2.0">
//    <channel>
//      <title>ViralBear videos</title>
//      <dfpvideo:version>2</dfpvideo:version>${A}</channel>
//      </rss>`,(err)=>{ 
//        console.log("MRSS CREATED!")
//      })
//     //     if(err){
//     //         throw err
//     //     }
//     //     console.log("Html created!")
//     // })}
      

//     // res.render('index',{
//     //     array:await Video.find({}),
//     //     start:'<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom"  xmlns:media="http://search.yahoo.com/mrss/"  xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/"  xmlns:dfpvideo="http://api.google.com/dfpvideo"  xmlns:tms="http://data.tmsapi.com/v1.1"  version="2.0">    <channel>      <title>ViralBear videos</title>      <dfpvideo:version>2</dfpvideo:version>',
//     //     end:'      </channel></rss>'
//     // })
// })
// app.get('/mrss2',async(req,res)=>{
    
    
    

      

//   res.render('index2',{
//       array:await Video.find({}),
//       start:'<?xml version="1.0" encoding="UTF-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom"  xmlns:media="http://search.yahoo.com/mrss/"  xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/"  xmlns:dfpvideo="http://api.google.com/dfpvideo"  xmlns:tms="http://data.tmsapi.com/v1.1"  version="2.0">    <channel>      <title>ViralBear videos</title>      <dfpvideo:version>2</dfpvideo:version>',
//         end:'      </channel></rss>'
//   })
// })