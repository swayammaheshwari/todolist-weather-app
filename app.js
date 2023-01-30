const express = require("express");
const bodyParser = require("body-parser");
const https = require("https")
const mongoose = require("mongoose");
const _ = require("lodash")
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name : "hey swayam here",
})

const defultItem = [item1];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  const url = "https://api.openweathermap.org/data/2.5/weather?appid=9f6cf50f86b2729f52e8b0e8c4e0513d&q=khandwa&units=metric";
  let weatherDetail={};
  https.get(url,function(response){
        response.on("data",(data)=>{
          const weatherData = JSON.parse(data);
          let city = weatherData.name
          let temp = weatherData.main.temp
          let weatherDescription = weatherData.weather[0].description
          let icon = weatherData.weather[0].icon
          weatherDetail = {
            city:city,
            temp:temp,
            weatherDescription:weatherDescription,
            icon:icon
          }
        })
     
    Item.find({},(err,foundItems)=>{
      if(foundItems.length === 0){
        Item.insertMany(defultItem,function(err){
        if(err){
        console.log(err)
        }else{
        console.log("succesFully saved defult item")
        }
        })
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems,weatherDetail:weatherDetail});
      }
    })
  })
});

app.get('/', function (req, res) {
  
  })

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName)
    })
  }
});

app.post("/delete",function(req,res){
  const checked = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checked,(err)=>{
      if(!err){
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  } 
})


app.get("/:customListName",function(req,res){
  const custom = _.capitalize(req.params.customListName);
  List.findOne({name:custom},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const listName = new List({
          name:custom,
          items: defultItem
        });
        listName.save();
        res.redirect("/"+custom)
      }
      else{
        //show a existing list
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});

// Item.deleteOne({_id:checked},()=>{}) //DONE BY ME
