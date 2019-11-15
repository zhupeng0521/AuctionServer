import * as express from 'express'
import {Server} from 'ws'
import * as path from 'path'
import WebSocket = require('ws');
const  app = express();
export class Product {
    constructor(
        public id: number,
        public title: string,
        public price: number,
        public rating: number,
        public desc: string,
        public categories: Array<string>
    ) {}
}
const products : Product[] = [
    new Product(1,"第一个商品",1.99,3.5,"这是第一个商品，是我学习慕课网Angular入门实战时创建的",["电子产品","硬件设备"]),
    new Product(2,"第二个商品",2.99,2.5,"这是第二个商品，是我学习慕课网Angular入门实战时创建的",["图书产品","硬件"]),
    new Product(3,"第三个商品",3.99,3.5,"这是第三个商品，是我学习慕课网Angular入门实战时创建的",["电子产品","图书产品"]),
    new Product(4,"第四个商品",4.99,1.5,"这是第四个商品，是我学习慕课网Angular入门实战时创建的",["电子产品","硬件"]),
    new Product(5,"第五个商品",5.99,2.5,"这是第五个商品，是我学习慕课网Angular入门实战时创建的",["电子产品","文件用品"]),
    new Product(6,"第六个商品",6.99,4.5,"这是第六个商品，是我学习慕课网Angular入门实战时创建的",["虚拟物品","硬件"])

  ]
  export class Comment {
    constructor(
      public id: number,
      public productId: number,
      public timestamp: string,
      public user: string,
      public rating: number,
      public content: string
    ){}
  }

  const comments:Comment[] = [
    new Comment(1,1,'2019/11/11 22:22:22','张三',3,'东西不错'),
    new Comment(2,1,'2019/10/10 22:20:20','王五',4,'双十一'),
    new Comment(3,1,'2019/11/01 22:20:22','周六',1,'双十二'),
    new Comment(4,2,'2019/01/11 20:22:22','李四',2,'京东好货')

  ]
app.use('/', express.static(path.join(__dirname,'..','client')));

app.get('/api/products',(req,res)=>{
    let result = products;
    let params = req.query;
    console.log(params);
    console.log(params.length);
    if(JSON.stringify(params) != '{}' ){
        console.log("000")
        if(params.title){
            console.log("111")
            //console.log(params.title); 
            result = result.filter((p)=>p.title.indexOf(params.title) !== -1)
            //console.log(result)
        }
        if(params.price !='null' &&result.length > 0){
            console.log("222")
            //console.log(params.price); 
            result = result.filter((p)=>p.price <= parseInt(params.price));
            //console.log(result)
        }
        if(params.category != -1 &&result.length > 0){
            console.log("333")
            //console.log(params.category); 
            
            result = result.filter((p)=>p.categories.indexOf(params.category) !== -1)
            //console.log(result)
        }
    }
    
    console.log(result);
    res.json(result);
})
app.get('/api/products/:id',(req,res)=>{
    // res.json(products.find((product) => product.id == parseInt(req.params.id)));
    res.json(products.find((product) => product.id == parseInt(req.params.id)));
})
app.get('/api/products/:id/comments',(req,res)=>{
    res.json(comments.filter((comment:Comment) => comment.productId == parseInt(req.params.id)));
})
const  server = app.listen(8000,"localhost",()=>{
    console.log("服务器已启动，地址是：http://localhost:8000");
    })


const subsriptopn = new Map<any, number[]>();
const wsServer = new Server({port:8085});
wsServer.on("connection",WebSocket=>{
    
    WebSocket.on('message', message =>{
        console.log(message);
        console.log(message.toString());
        let messageObj = JSON.parse(message.toString());
        let productIds = subsriptopn.get(WebSocket) || [];
        subsriptopn.set(WebSocket,[...productIds,messageObj.productId])
    });
});

const currentBids = new Map<number,number>();


setInterval(()=>{
    products.forEach(p=>{
      let  currentBid = currentBids.get(p.id) || p.price;
      let newBid = currentBid +Math.random()*5;
      currentBids.set(p.id,newBid);
    });
    subsriptopn.forEach((productIds:number[],ws) =>{
      if(ws.readyState ===1){
        let newBids = productIds.map(pid =>({
            productId :pid,
            bid:currentBids.get(pid)
        }));
        ws.send(JSON.stringify(newBids))  
      }else{
          subsriptopn.delete(ws)
      }
       
    })
},2000
)

