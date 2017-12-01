var censusColors= function(ctx, K, c_w, c_h, isHorizontal, callBack) {
    let start = +new Date();
    let processInfo = {
        colors: 0,
        censusTime: 0,
        kmeansIteration:0,
        kmeansTime:0,
        top5Count:0
    };
    let w = c_w;
    let h = c_h;
    let imageDate;
    let pixelRatio = window.devicePixelRatio || 1;
    if(isHorizontal){
        imageDate = ctx.getImageData(0, 0, w, h-100*pixelRatio);
    }else{
        imageDate = ctx.getImageData(0, 0, w-100*pixelRatio, h);
    }
    if (!imageDate) {
        console.log("can not read image data, maybe because of cross-domain limitation.");
        return;
    }
    let rows = imageDate.height;
    let cols = imageDate.width;
    let keys = [];
    let colors_info = [];
    let h_key, s_key, l_key, r, g, b;
    let pixel_count = 0;
    let pixel_step = (rows * cols < 600 * 600) ? 1 : 2;
    console.log("pixel step",pixel_step)
    let color_step = Math.round(0.1066*K*K-2.7463*K+17.2795);
    color_step = color_step<4?4:color_step;
    console.log("color step",color_step)

    let hsl,key;
    for (let row = 1; row < rows - 1;) {
        for (let col = 1; col < cols - 1;) {
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
    console.log("pixel_count: ",pixel_count)
    processInfo.censusTime = +new Date() - start;
    processInfo.colors = colors_info.length;
    console.log("time for process all pixel: ", processInfo.censusTime)

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
    let main_color = [colors_info[0], colors_info[1], colors_info[2]];
    // k-mean clustering
    let init_seed_1 = this.chooseSeedColors(colors_info, K);
    let cluster_res = this.kMC(colors_info, init_seed_1, 100);
    let cluster_res_1 = cluster_res[0];
    cluster_res_1 = cluster_res_1.map((color)=>{
        return  rgbToHex(hslToRgb(color.h, color.s, color.l));
    });

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

    processInfo.kmeansTime = +new Date() - start;
    processInfo.kmeansIteration = cluster_res[1];
    console.log("time for K-means: ", processInfo.kmeansTime);
    let info = this.imageScore(colors_info);
    processInfo.top5Count = info.top5Count*100;
    this.setState ({
        colorsInfo: colors_info,
        clusterColors: cluster_res_1,
        mainColor: main_color,
        averageColor: average_color,
        processInfo: processInfo
    });
    this.updateLoopColors(main_color, cluster_res[0]);
    if (callBack instanceof Function) {
        callBack(main_color_a, cluster_res_1);
    }
}