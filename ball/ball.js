{
   let config = {
       radius:5,
       speed:10,

   }
   class Point {
       createPoint({w,h}){
        const x = parseInt(Math.random() * w)
        const y = parseInt(Math.random() * h)
        return {x,y}
       }
   }
   class Ball extends Point{
       createBall({w,h},_r,_s){
          let _point = this.createPoint({w,h})
          this.x = _point.x
          this.y = _point.y
          this.speed = parseInt(Math.random()*_s) | 1
          this.linkList = []
          // this.speed = 3
          this.linkSpeed = 1
          this.norSpeed = 3
           this.PI = Math.PI * 2 * parseInt(Math.random()*360)/360
          // this.PI = Math.PI  / 2 * 3   + Math.PI / 3 * 0
          this.r = parseInt(Math.random()*_r)
          // this.r = 5
       }
   }

   const ballCv = {
       init(){
           canvas.width = body.clientWidth
           canvas.height = body.clientHeight
           this.ctx = canvas.getContext('2d')
           this.size = {w: body.clientWidth, h: canvas.height}
           this.radius = 5
           this.speed = 2
           this.ballSize = 100
           this.ballList = []
           this.linkList = []
           this.initCanvas()
           this.initBall()
       },
       initCanvas(){
           this.ctx.fillStyle = 'rgba(0,0,0,1)';
           this.ctx.fillRect(0,0,this.size.w,this.size.h);
       },
       redraw(){
           this.ctx.clearRect(0,0,this.size.w,this.size.h);
           this.ctx.fillStyle = 'rgba(0,0,0,1)';
           this.ctx.fillRect(0,0,this.size.w,this.size.h);
       },
       initBall(){
           while(this.ballList.length < this.ballSize){
               let ball = new Ball()
               ball.createBall(this.size,this.radius,this.speed)
               this.ballList.push(ball)
           }

           this.drawBall()
       },
       drawBall(){
           this.redraw()
           this.linkList = []
           this.ballList.map((ball,idx)=>{
               this.ctx.beginPath();
               this.ctx.fillStyle = 'rgba(255,255,255,1)';
               if(Math.abs(ball.x) - ball.r <= 0  || Math.abs(ball.x) + ball.r >= this.size.w){
                   ball.x = -ball.x
               }
               if(Math.abs(ball.y) - ball.r <= 0 || Math.abs(ball.y) + ball.r >= this.size.h){
                   ball.y = -ball.y
               }
               if(ball.PI <= Math.PI){
                   Math.sin(ball.PI) >= 0 ? ball.x += ball.speed * Math.cos(ball.PI) : ball.x -= ball.speed * Math.cos(ball.PI)
                   Math.sin(ball.PI) >= 0 ? ball.y -= ball.speed * Math.sin(ball.PI) : ball.y += ball.speed * Math.sin(ball.PI)
               } else {
                   Math.sin(ball.PI) >= 0 ? ball.x -= ball.speed * Math.cos(ball.PI) : ball.x += ball.speed * Math.cos(ball.PI)
                   Math.sin(ball.PI) >= 0 ? ball.y += ball.speed * Math.sin(ball.PI) : ball.y -= ball.speed * Math.sin(ball.PI)
               }
               this.ctx.arc(Math.abs(ball.x), Math.abs(ball.y), ball.r, 0, Math.PI * 2, true)
               this.ctx.closePath()
               this.ctx.fill()
               if(ball.r < 3){
                   return false
               }
               this.ballList.map((nb,nIdx)=>{
                   let nx = Math.abs(nb.x),
                       ny = Math.abs(nb.y),
                       x = Math.abs(ball.x),
                       y = Math.abs(ball.y),
                       zx = Math.abs(nx - x),
                       zy = Math.abs(ny - y)
                   let s = [idx,nIdx].sort().join('--')
                   if( zx != 0 && zy != 0 && (Math.sqrt(zx * zx + zy * zy) < 50) && !this.linkList.includes(s)){
                       this.ctx.beginPath()
                       this.ctx.moveTo(x,y)
                       this.ctx.lineTo(nx,ny)
                       this.ctx.strokeStyle='rgba(255,255,255,1)'
                       this.ctx.stroke();
                       this.ctx.closePath();
                       this.linkList.push(s)
                       // nb.speed = nb.linkSpeed
                       // ball.speed = ball.linkSpeed
                   } else {
                       // nb.speed = nb.norSpeed
                       // ball.speed = ball.norSpeed
                   }

               })

           })
           window.requestAnimationFrame(()=>{
               this.drawBall()
           })

       },
   }
    const canvas = document.querySelector('#ballCanvas')
    const body = document.querySelector('body')

    ballCv.init()
    canvas.addEventListener('touchmove',function(e){
       let CP = {
           // x:e.offsetX,
           x:e.targetTouches[0].clientX,
           // y:e.offsetY,
           y:e.targetTouches[0].clientY,
           PI:''
       }
       ballCv.ballList.map((ball)=>{
           ball.y = Math.abs(ball.y)
           ball.x = Math.abs(ball.x)
           let _z = Math.sqrt((ball.y - CP.y)*(ball.y - CP.y)+(ball.x - CP.x)*(ball.x - CP.x))
           let _sX = Math.abs(CP.x-ball.x)
           CP.PI = Math.asin(_sX / _z)
           let PI = ''
           if(CP.y < ball.y){
               PI = CP.x >= ball.x ? Math.PI / 2 - CP.PI : Math.PI / 2 + CP.PI
           }
           else {
               PI = CP.x >= ball.x ? Math.PI / 2 * 3 + CP.PI : Math.PI / 2 * 3 - CP.PI
           }
           ball.PI = PI
           ball.speed = parseInt(Math.random()*ballCv.speed) | 3
           ball.speed = 10
       })
    },false)

}