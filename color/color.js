{
    function chooseSeedColors(colors, num){
    let init_seed = [];
    let len = colors.length;
    let l;
    for (let i = 0; i < len; i++) {
        l = init_seed.length;
        let color = colors[i];
        if (!i) {
            color.category = 0;
            init_seed.push({
                h:color.h,
                s:color.s,
                l:color.l,
                category: color.category,
                fre: color.fre
            });
            continue;
        }
        let j = 0;
        for (; j < l; j++) {
            let h_diff = Math.abs(init_seed[j].h - color.h);
            let s_diff = Math.abs(init_seed[j].s - color.s);
            let l_diff = Math.abs(init_seed[j].l - color.l);
            if (h_diff + s_diff + l_diff < 45) {
                break;
            }
        }
        if (j === l) {
            color.category = init_seed.length;
            init_seed.push({
                h:color.h,
                s:color.s,
                l:color.l,
                category: color.category,
                fre: color.fre
            });
        }
        if (init_seed.length >= num) {
            break;
        }
    }
    return init_seed;
}
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h *= 60;
        }

        return [h, s * 100, l * 100];
    }
    function hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(rgb){
        var color = '#';
        var tmp;
        for(var i=0;i<rgb.length;i++){
            tmp = rgb[i].toString(16);
            color += tmp.length<2?('0'+tmp):tmp;
        }
        return color;
    }
    function kMC(colors, seeds, max_step) {
    let iteration_count = 0;

    while (iteration_count++ < max_step) {
        // filter seeds
        seeds = seeds.filter((seed) => {
            return seed;
        });

        // divide colors into different categories with duff's device
        let len = colors.length;
        let count = (len / 8) ^ 0;
        let start = len % 8;
        while (start--) {
            classifyColor(colors[start], seeds);
        }
        while (count--) {
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
            classifyColor(colors[--len], seeds);
        }

        // compute center of category
        len = colors.length;
        let hsl_count = [];
        let category;
        while (len--) {
            category = colors[len].category;
            if (!hsl_count[category]) {
                hsl_count[category] = {};
                hsl_count[category].h = 0;
                hsl_count[category].s = 0;
                hsl_count[category].l = 0;
                hsl_count[category].fre_count = colors[len].fre;
            } else {
                hsl_count[category].fre_count += colors[len].fre;
            }
        }
        len = colors.length;
        while (len--) {
            category = colors[len].category;
            hsl_count[category].h += colors[len].h*colors[len].fre/hsl_count[category].fre_count;
            hsl_count[category].s += colors[len].s*colors[len].fre/hsl_count[category].fre_count;
            hsl_count[category].l += colors[len].l*colors[len].fre/hsl_count[category].fre_count;
        }
        let flag = hsl_count.every((ele, index) => {
            return Math.abs(ele.h - seeds[index].h)<0.5 && Math.abs(ele.s - seeds[index].s)<0.5 && Math.abs(ele.l - seeds[index].l)<0.5;
        });
        seeds = hsl_count.map((ele, index) => {
            return {
                h: ele.h,
                s: ele.s,
                l: ele.l,
                category: index,
                fre: ele.fre_count
            };
        });
        if (flag) {
            break;
        }
    }
    console.log("KMC iteration " + iteration_count);
    seeds.sort(function(pre, next) {
        let pre_rgb = hslToRgb(pre.h, pre.s, pre.l);
        pre_rgb = pre_rgb[0]+pre_rgb[1]+pre_rgb[2];
        // let next_h = next.h;
        // next_h = next_h < 30 ? (next_h+330) : next_h;
        let next_rgb = hslToRgb(next.h,next.s,next.l);
        next_rgb = next_rgb[0]+next_rgb[1]+next_rgb[2];
        return next_rgb - pre_rgb;
    });
    return [seeds,iteration_count];
}

    function classifyColor(color, classes) {
    let len = classes.length;
    let min = 10000;
    let min_index;
    while (len--) {
        let distance = Math.abs(classes[len].h - color.h) + Math.abs(classes[len].s - color.s) + Math.abs(classes[len].l - color.l);
        if (distance < min) {
            min = distance;
            min_index = len;
        }
    }
    color.category = min_index;
}
    var domeCanvas = document.querySelector('#Demo')
    var ctx = domeCanvas.getContext('2d')
    domeCanvas.width = '400'
    domeCanvas.height = '400'
    var src= 'music.jpg'
    var img = new Image()
    img.src = src
    img.onload = function(){
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 400, 400);
        extColor()
    }
    var extColor = function(){
        let start = +new Date();
        let processInfo = {
            colors: 0,
            censusTime: 0,
            kmeansIteration:0,
            kmeansTime:0,
            top5Count:0
        };
        let K = 6
        let w = 400;
        let h = 400;
        var imageDate = ctx.getImageData(0, 0, 400,400);
        let rows = imageDate.height;
        let cols = imageDate.width;
        let keys = [];
        let colors_info = [];
        let h_key, s_key, l_key, r, g, b;
        let pixel_count = 0;
        let pixel_step = (rows * cols < 600 * 600) ? 1 : 2;
        let hsl,key;
        for(let row = 1;row <rows -1;){
            for(let col = 1;col<cols-1;){
                r = imageDate.data[row * cols * 4 + col * 4];
                g = imageDate.data[row * cols * 4 + col * 4 + 1];
                b = imageDate.data[row * cols * 4 + col * 4 + 2];
                hsl = rgbToHsl(r,g,b);
                if(hsl[2]> 97 || (hsl[2] > 95 && hsl[1] < 30)){
                    col += pixel_step;
                    continue;  // too bright
                }
                if(hsl[2] < 3 || (hsl[2] < 5 && hsl[1] < 30)){
                    col += pixel_step;
                    continue;  // too dark
                }
                pixel_count++;
                h_key = Math.floor(hsl[0] / 10) * 10000;
                s_key = Math.floor(hsl[1] / 5) * 100;
                l_key = Math.floor(hsl[2] / 5);
                key = h_key + s_key + l_key;
                let index = keys.indexOf(key);
                if (index < 0) {
                    keys.push(key);
                    colors_info.push({
                        key: key,
                        fre: 1,
                        r: r,
                        g: g,
                        b: b,
                        h: hsl[0],
                        s: hsl[1],
                        l: hsl[2],
                        category: -1
                    });
                } else {
                    colors_info[index].fre++;
                }
                col += pixel_step;
            }
            row += pixel_step;
        }
        start = +new Date();
        // sort and filter rgb_census
        colors_info.sort(function(pre, next) {
            return next.fre - pre.fre;
        });
        let len = colors_info.length;
        console.log("before filter: ",len)
        colors_info = colors_info.filter((color) => {
            // isolated color
            let flag = (color.fre < 5 - pixel_step) && (len > 400);
            return !flag;
        });
        console.log("after filter: ",colors_info.length)
        let main_color = [colors_info[0], colors_info[1], colors_info[2]]
        console.log(main_color)
        let init_seed_1 = chooseSeedColors(colors_info, K);
        let cluster_res = kMC(colors_info, init_seed_1, 100);
        let cluster_res_1 = cluster_res[0];
        cluster_res_1 = cluster_res_1.map((color)=>{
            return  rgbToHex(hslToRgb(color.h, color.s, color.l));
        });
        cluster_res_1.map((item)=>{
            var domDiv = document.createElement('div');
            domDiv.style.width = '100px'
            domDiv.style.height = '100px'
            domDiv.style.display= 'inline-block'
            domDiv.style.backgroundColor = item
            document.body.appendChild(domDiv)
        })
        let r_count = 0, g_count = 0, b_count = 0, f_count = 0;
        len = colors_info.length;
        while (len--) {
            r_count += colors_info[len].r * colors_info[len].fre;
            g_count += colors_info[len].g * colors_info[len].fre;
            b_count += colors_info[len].b * colors_info[len].fre;
            f_count += colors_info[len].fre;
        }
        let average_color = rgbToHsl(Math.floor(r_count / f_count), Math.floor(g_count / f_count), Math.floor(b_count / f_count));
        average_color = {
            h: average_color[0],
            s: average_color[1],
            l: average_color[2],
        };
        let main_color_a = "rgba(" +colors_info[0].r +"," +colors_info[0].g +"," +colors_info[0].b + ",0.62)";
        console.log(main_color_a)
    }
}