var superagent = require('superagent')

superagent.get('http://p1.music.126.net/K_q4k-f7b0dXkytaDN0MTQ==/528865150111579.jpg')
    .end(function(err,res){
        console.log(res.body)
    })
