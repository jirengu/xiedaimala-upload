# 写代码啦视频上传工具

## 功能
- 登录验证，xiedaimal.com 具有老师角色的用户可登录上传
- 上传视频到服务器，展示上传后的线上资源链接
- 支持增量上传
- 支持断点续传
- 可查看自己的上传历史记录
- 管理员可查看所有用户上传历史记录


## 安装

```bash
npm install -g xiedaimala
```

## 使用范例

- `xdml upload`   增量上传当前目录下所有的视频和图片到服务器，如果之前上传过不会再次上传
- `xdml history`  查看当前用户上传后的线上预览链接历史记录，默认展示24小时内的上传历史
- `xdml history -d 3`  默认展示3天内的上传历史
- `xdml history -d 3 -a`  如果是管理员，则展示所有用户上传的近3天的历史记录
- `xdml history -u hunger@qq.com`  如果是管理员，则展示该用户的历史记录
- `xdml login`  使用xiedaimala.com 账号登录，登录信息默认保存7天
- `xdml set -d /Users/hugner/videos`  设置默认上传路径，如果不设置则为当前命令行路径
- `xdml clear`  清空本地历史记录，清空后用户再次执行上传会上传指定目录的全部文件
- `xdml help`  查看具体使用信息


by 饥人谷




