"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var ws_1 = require("ws");
var path = require("path");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var products = [
    new Product(1, "第一个商品", 1.99, 3.5, "这是第一个商品，是我学习慕课网Angular入门实战时创建的", ["电子产品", "硬件设备"]),
    new Product(2, "第二个商品", 2.99, 2.5, "这是第二个商品，是我学习慕课网Angular入门实战时创建的", ["图书产品", "硬件"]),
    new Product(3, "第三个商品", 3.99, 3.5, "这是第三个商品，是我学习慕课网Angular入门实战时创建的", ["电子产品", "图书产品"]),
    new Product(4, "第四个商品", 4.99, 1.5, "这是第四个商品，是我学习慕课网Angular入门实战时创建的", ["电子产品", "硬件"]),
    new Product(5, "第五个商品", 5.99, 2.5, "这是第五个商品，是我学习慕课网Angular入门实战时创建的", ["电子产品", "文件用品"]),
    new Product(6, "第六个商品", 6.99, 4.5, "这是第六个商品，是我学习慕课网Angular入门实战时创建的", ["虚拟物品", "硬件"])
];
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var comments = [
    new Comment(1, 1, '2019/11/11 22:22:22', '张三', 3, '东西不错'),
    new Comment(2, 1, '2019/10/10 22:20:20', '王五', 4, '双十一'),
    new Comment(3, 1, '2019/11/01 22:20:22', '周六', 1, '双十二'),
    new Comment(4, 2, '2019/01/11 20:22:22', '李四', 2, '京东好货')
];
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    console.log(params);
    console.log(params.length);
    if (JSON.stringify(params) != '{}') {
        console.log("000");
        if (params.title) {
            console.log("111");
            //console.log(params.title); 
            result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
            //console.log(result)
        }
        if (params.price != 'null' && result.length > 0) {
            console.log("222");
            //console.log(params.price); 
            result = result.filter(function (p) { return p.price <= parseInt(params.price); });
            //console.log(result)
        }
        if (params.category != -1 && result.length > 0) {
            console.log("333");
            //console.log(params.category); 
            result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
            //console.log(result)
        }
    }
    console.log(result);
    res.json(result);
});
app.get('/api/products/:id', function (req, res) {
    // res.json(products.find((product) => product.id == parseInt(req.params.id)));
    res.json(products.find(function (product) { return product.id == parseInt(req.params.id); }));
});
app.get('/api/products/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == parseInt(req.params.id); }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已启动，地址是：http://localhost:8000");
});
var subsriptopn = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (WebSocket) {
    WebSocket.on('message', function (message) {
        console.log(message);
        console.log(message.toString());
        var messageObj = JSON.parse(message.toString());
        var productIds = subsriptopn.get(WebSocket) || [];
        subsriptopn.set(WebSocket, __spreadArrays(productIds, [messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subsriptopn.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subsriptopn.delete(ws);
        }
    });
}, 2000);
