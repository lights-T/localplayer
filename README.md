### localplayer
基于nodejs和nginx，实现播放本地指定文件夹视频文件。

### 声明
因为是在本地局域网下播放视频，完全使用html的video标签作为视频播放器，所以不存在卡顿、加载现象。
需要播放网络视频的，请绕道，谢谢。

### 解决
解决视频投屏的关键时刻转圈问题，哈哈。
将本地电脑作为主机，供wifi下其他终端随时访问。

### node与nginx分工
1. nodejs根据指定的文件夹，递归生成html文件（总导航文件、详情文件）。
2. nginx配置重定向网络，访问nodejs生成的html文件，来实现视频播放。

### 使用
   ```
   $ node app.js
   浏览器访问http://127.0.0.1:9001/init_jyls在对应文件夹下生成html的总导航文件、视频详情文件。
   浏览器通过nginx访问生成的总导航html：http://192.168.0.1:10983/jyls.html
   ```

### nginx配置
http://www.jinzhaohui.cn/?p=914

http://www.jinzhaohui.cn/wp-content/uploads/2021/08/截屏2021-08-01-下午10.07.48-1024x914.png

http://www.jinzhaohui.cn/wp-content/uploads/2021/08/截屏2021-08-01-下午10.12.19-1024x729.png
