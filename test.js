// require("dotenv").config();
// const url = process.env.MAPBOX_URL;
// const api = process.env.MAPBOX_API;

// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var xmlhttp = new XMLHttpRequest();
// xmlhttp.open('GET',url+'chennai%20india.json?access_token='+api+'&limit=1',false);
// xmlhttp.send(null);
// console.log(xmlhttp.responseText);

const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./twitter.db");

const allData = () => {
    let sql = "SELECT * FROM sentiment";
    let list = 
    [{
        id: 'positive',
        color: 'hsl(198, 70%, 50%)',
        data: []
     },
     {
         id:'negative',
         color: 'hsl(20, 70%, 50%)',
         data: []
     },
     {
         id:'neutral',
         color:'hsl(90, 70%, 50%)',
         data: []
     }
    ];
    var pie = [
        { id: "positive", label: "positive", value: 0 },
        { id: "negative", label: "negative", value: 0 },
        { id: "neutral", label: "neutral", value: 0 },
      ];
    db.all(sql, [], (err,rows) =>{
        var flag = null;
        var val = {pos:0,neg:0,neu:0};
        if (err){
            throw err;
        };
        rows.forEach((row) =>{
            var sentiment = row.sentiment;
            var date = row.created_at.slice(26,)+row.created_at.slice(3,16);
            if (date === flag ){
                // console.log(date,flag)
                if (sentiment >= 0.2){
                    pie[0].value++;
                    val.pos++;
                } else if (sentiment <= -0.2){
                    pie[1].value++;
                    val.neg++;
                } else {
                    pie[2].value++;
                    val.neu++;
                }
            }
            else{
                // console.log(date,flag)
                if (flag !== null){
                    // console.log('not null')
                    list[0].data.push({ x:flag, y:val.pos });
                    list[1].data.push({ x:flag, y:val.neg });
                    list[2].data.push({ x:flag, y:val.neu });
                }
                flag = date;
                if (sentiment >= 0.2) {
                    pie[0].value++;
                    val.pos = 1;
                    val.neg = 0;
                    val.neu = 0;
                } else if (sentiment <= -0.2) {
                    pie[1].value++;
                    val.pos = 0;
                    val.neg = 1;
                    val.neu = 0;
                } else {
                    pie[2].value++;
                    val.pos = 0;
                    val.neg = 0;
                    val.neu = 1;
                }
            }
        })
        list[0].data.push({ x:flag, y:val.pos });
        list[1].data.push({ x:flag, y:val.neg });
        list[2].data.push({ x:flag, y:val.neu });
        console.log(JSON.stringify(list,null,4))
        console.log(pie)
        io.emit("pie", pie);
        io.emit("line", list);
    });
}

allData();