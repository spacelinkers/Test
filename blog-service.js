const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve,reject)=>{
        (posts.length > 0 ) ? resolve(posts) : reject("no results returned"); 
    });
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.published)) : reject("no results returned");
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

module.exports.addPost = function(req){
    return new Promise((resolve,reject)=>{
        req.body.postDate = formatDate(new Date(), 'yyyy-mm-dd');
        //req.body.postDate = today;
        if(req.body.published == undefined) req.body.published = false;
        req.body.id = posts.length + 1;

        posts.push(req.body);
        
        (posts.length > 0) ? resolve(posts) : reject("failed to add new post."); 
    });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.category == category)) : reject("no results returned");
    });
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.postDate >= minDateStr)) : reject("no results returned");
    });
}

module.exports.getPostById = function(id){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.id == id)) : reject("no results returned");
    });
}

function formatDate(date, format) {
    const map = {
        mm: date.getMonth() + 1,
        dd: date.getDate(),
        yy: date.getFullYear().toString().slice(-2),
        yyyy: date.getFullYear()
    }

    return format.replace(/yyyy|mm|dd/gi, matched => map[matched])
}