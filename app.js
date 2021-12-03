/**
 1.使用 HTTP 服务器与客户端交互，需要 require('http')。
 声明http协议
 */
var http = require('http');

// 声明文件操作系统对象
var fs = require('fs');
var path = require('path');
const readFile = require("util").promisify(fs.readFile);
var htmlBody = '';
const htmlDetailAccessIpPort = 'http://192.168.1.5:10982';//外部访问视频文件ip

/**
 2.获取服务器对象
 1.通过 http.createServer([requestListener]) 创建一个服务
 requestListener <Function>
 返回: <http.Server>
 返回一个新建的 http.Server 实例。
 对于服务端来说，主要做三件事：
 1.接受客户端发出的请求。
 2.处理客户端发来的请求。
 3.向客户端发送响应。
 */
var server = http.createServer();

/**
 3.声明端口号，开启服务。
 server.listen([port][, host][, backlog][, callback])
 port <number> ：端口号
 host <string> ：主机ip
 backlog <number> server.listen() 函数的通用参数
 callback <Function> server.listen() 函数的通用参数
 Returns: <net.Server>
 启动一个TCP服务监听输入的port和host。
 如果port省略或是0，系统会随意分配一个在'listening'事件触发后能被server.address().port检索的无用端口。
 如果host省略，如果IPv6可用，服务器将会接收基于unspecified IPv6 address (::)的连接，否则接收基于unspecified IPv4 address (0.0.0.0)的连接
 */
server.listen(9001, function () {
    console.log('服务器正在端口号：9001上运行......');
})

/**
 4.给server 实例对象添加request请求事件，该请求事件是所有请求的入口。
 任何请求都会触发改事件，然后执行事件对应的处理函数。
 server.on('request',function(){
         console.log('收到客户端发出的请求.......');
    });
 5.设置请求处理函数。
 请求回调处理函数需要接收两个参数。
 request ：request是一个请求对象，可以拿到当前浏览器请求的一些信息。
 eg：请求路径，请求方法等
 response： response是一个响应对象，可以用来给请求发送响应。
 **/
server.on('request', function (request, response) {

    var url = request.url;
    if (url === '/') {
        readFle(response, './index.html');
    } else if (url === '/index') {
        readFle(response, './index.html');
    } else if (url === '/init_asd') {
        var htmlPath = 'asd.html';//总导航html
        var htmlDetailPath = 'asd_detail';//相对路径
        var filesPath = "asd";//指定文件夹名称
        var filesParentPath = "/media/sf_vbox-w/files";//指定文件夹前的绝对路径
        htmlBody = '';
        explorer(response, filesPath, filesParentPath, htmlPath, htmlDetailPath);
    } else if (url === '/init_film') {
        var htmlPath = 'film.html';//总导航html
        var htmlDetailPath = 'film_detail';//相对路径
        var filesPath = "film";//指定文件夹名称
        var filesParentPath = "/media/sf_vbox-w/files";//指定文件夹前的绝对路径
        htmlBody = '';
        explorer(response, filesPath, filesParentPath, htmlPath, htmlDetailPath);
    } else {
        readFle(response, './notFount.html');
    }
    return;

});


function writerHtml(response, body, htmlPath) {
    var html = '<!DOCTYPE html>\n' + '<html>\n<head><meta charset="utf-8"></head>\n<body>\n' + body + '</body>\n</html>';

    fs.writeFile(htmlPath, html, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('写入成功');
            // 如果url=‘/’ ,读取指定文件下的html文件，渲染到页面。
            fs.readFile(htmlPath, 'utf-8', function (err, data) {
                if (err) {
                    throw err;
                }
                response.end(data);
            });
        }
    });
};

async function readFle(response, path) {
    response.writeHead(200, {'Content-Type': 'text/html'})
    // 如果url=‘/’ ,读取指定文件下的html文件，渲染到页面。
    fs.readFile(path, function (err, data) {
        if (err) {
            throw err;
        }
        response.end(data);
    });
}

/**
 * @author: Benny
 * @description: 创建文件
 * @param {filename}  文件路径+名字
 */
function makeFiles(filename, content) {
    fs.writeFile(filename, content, function (err) {
        if (err) {
            console.log("error");
            return;
        }
        console.log(`创建${filename}成功`);

    })
}

/**
 * @author: Benny
 * @description:递归创建目录 异步方法
 * @param {dirname} 文件夹名称
 */
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            // 是个目录则执行callback方法
            callback();
        } else {
            // 递归调用mkdirs
            /*console.log(dirname);
            console.log(path.dirname(dirname)); */
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
                console.log('在' + path.dirname(dirname) + '目录创建好' + dirname + '目录');
            });
        }
    });
}

/**
 htmlPath为将生成的静态页面所在位置的绝对路径（包含静态文件）；
 filesPath文件所在位置的根文件夹路径。filesPath=../../...../yyds
 filesParentPath父级文件夹绝对路径
 生成的html文件将由nginx打开，nginx配置为文件所在的目录的父级目录，即filesPath最后一个文件夹。
 location /yyds {    #指定图片存放路径
           root  filesPath;
           autoindex on;
           }
 **/
function explorer(response, filesPath, filesParentPath, htmlPath, htmlDetailPath) {
    fs.readdir(filesParentPath + '/' + filesPath, function (err, files) {
        //err 为错误 , files 文件名列表包含文件夹与文件
        if (err) {
            console.log('error:\n' + err);
            return;
        }

        var doneFilesNum = 0
        files.forEach(function (file, index) {
            fs.stat(filesParentPath + '/' + filesPath + '/' + file, function (err, stat) {
                doneFilesNum++
                if (err) {
                    console.log(err);
                    return;
                }
                if (stat.isDirectory()) {
                    mkdirs(filesParentPath + '/' + htmlDetailPath + '/' + filesPath, (data) => {
                        //如果文件已存在
                        if (fs.existsSync(filesParentPath + '/' + htmlDetailPath + '/' + filesPath)) {
                            // console.log(filesParentPath+'/'+htmlDetailPath+'已存在')
                        } else {
                            //生成文件
                            makeFiles(filesParentPath + '/' + htmlDetailPath + '/' + filesPath, '')
                        }
                    })
                    // 如果是文件夹遍历
                    explorer(response, filesPath + '/' + file, filesParentPath, htmlPath, htmlDetailPath);
                } else {
                    if (file.indexOf(".mp4") != -1) {
                    	console.log('mp4文件名:' + filesParentPath + '/' + filesPath + '/' + file);
                        //路径原则是：此处为相对路径。生成的html文件将由nginx打开，nginx包含视频文件所在的目录
                        mkdirs(filesParentPath + '/' + htmlDetailPath, (data) => {
                            //如果文件已存在
                            if (fs.existsSync(filesParentPath + '/' + htmlDetailPath)) {
                                // console.log(filesParentPath+'/'+htmlDetailPath+'已存在')
                            } else {
                                //生成文件
                                makeFiles(filesParentPath + '/' + htmlDetailPath, '')
                            }
                        })

                        //存放视频文件详情html路径  detial路径/路径_fileName.html
                        var detailPath = htmlDetailPath + '/' + filesPath + '_' + file.replace(/.mp4/, "") + '.html'
                        //html存放视频文件所在路径
                        explorerDetail(response, filesPath, filesParentPath, detailPath, file);
                        htmlBody = htmlBody + '<div>' + '<p>' + filesPath + '/' + file + '</p>' + '    <a href="' + detailPath + '" target="blank" >详情看一看吧~</a>' + '</div>\n';
                    } else {
                        console.log('文件名:' + filesParentPath + '/' + filesPath + '/' + file);
                    }
                    if (htmlBody.length > 0 && doneFilesNum == files.length - 1) {
                        writerHtml(response, htmlBody, filesParentPath + '/' + htmlPath);
                    }
                }
            });
        });
    });
}


function explorerDetail(response, filesPath, filesParentPath, detailPath, file) {
    if (file.indexOf(".mp4") != -1) {
        //路径原则是：此处为相对路径。生成的html文件将由nginx打开，nginx包含视频文件所在的目录
        //html存放视频文件所在路径
        var filePath = htmlDetailAccessIpPort + '/' + filesPath + '/' + file
        var htmlDetailBody = '<div>' + '<p>' + file + '</p>' + '<div/><video src="' + filePath + '" controls="controls" height="500" width="700" >videos</video></div>' + '</div>\n';
        writerHtml(response, htmlDetailBody, filesParentPath + '/' + detailPath);
    }
}

