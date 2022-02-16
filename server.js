const express = require('express');
const blogData = require("./blog-service");
const path = require("path");
const app = express();

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dsuni3sqy',
    api_key: '664835297962637',
    api_secret: 'ybdcxD1LSXIR3q3wDb2Vg23QNEk',
    secure: true
});
  
const upload = multer();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect("/about");
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
});

app.get('/blog', (req,res)=>{
    blogData.getPublishedPosts().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single('featureImage'), function (req, res, next) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
  
      });
    };
    
    async function upload(req) {
      let result = await streamUpload(req);
        console.log(result);
        return result;
    }
  
    upload(req).then((uploaded)=>{
      req.body.featureImage = uploaded.url;
      
      blogData.addPost(req).then((data=>{
        res.json(data);
      })).catch(err=>{
        res.json({message: err});
      });
    });
});

app.get("/posts/:value", (req, res) => {
    let id = req.params.value;

    blogData.getPostById(id).then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.get('/posts', (req,res)=>{
    let category = req.query.category;
    let minDate = req.query.minDate;

    if(category != undefined){
        blogData.getPostsByCategory(category).then((data=>{
            res.json(data);
        })).catch(err=>{
            res.json({message: err});
        });
    }
    else if(minDate != undefined){
        blogData.getPostsByMinDate(minDate).then((data=>{
            res.json(data);
        })).catch(err=>{
            res.json({message: err});
        });
    }
    else {
        blogData.getAllPosts().then((data=>{
            res.json(data);
        })).catch(err=>{
            res.json({message: err});
        });
    }
});

app.get('/categories', (req,res)=>{
    blogData.getCategories().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})

blogData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { 
        console.log('server listening on: ' + HTTP_PORT); 
    });
}).catch((err)=>{
    console.log(err);
})
