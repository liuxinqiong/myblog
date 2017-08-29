/**
 * Created by sky on 2017/5/13.
 */
var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
    afterFind: function (posts) {
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                post.commentsCount = commentsCount;
                return post;
            });
        }));
    },
    afterFindOne: function (post) {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count;
                return post;
            });
        }
        return post;
    }
});

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
    afterFind: function (posts) {
        return posts.map(function (post) {
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function (post) {
        if (post) {
            post.content = marked(post.content);
        }
        return post;
    }
});

// 按标记截取
Post.plugin('contentToMark', {
    afterFind: function (posts) {
        return posts.map(function (post) {
            var index = post.content.indexOf("<!-- more -->");
            if (index !== -1) {
                post.content = post.content.slice(0, index)
            }
            return post;
        });
    },
    afterFindOne: function (post) {
        if (post) {
            var index = post.content.indexOf("<!-- more -->");
            if (index !== -1) {
                post.content = post.content.slice(0, index)
            }
        }
        return post;
    }
});

module.exports = {
    // 创建一篇文章
    create: function create(post) {
        return Post.create(post).exec();
    },

    // 通过文章 id 获取一篇文章
    getPostById: function getPostById(postId) {
        return Post
            .findOne({_id: postId})
            .populate({path: 'author', model: 'User'})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },

    // 得到上一篇文章
    getPrePostByCurId:function getPrePostByCurId(curId,isLogin) {
        var query={'_id':{'$gt':curId}};
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .find(query)
            .select({'_id':1,'title':1,'tags':1})
            .sort({_id: 1})// 升序
            .limit(1)
            .exec();
    },

    // 得到下一篇文章
    getNextPostByCurId:function getNextPostByCurId(curId,isLogin) {
        var query={'_id':{'$lt':curId}};
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .find(query)
            .select({'_id':1,'title':1,'tags':1})
            .sort({_id: -1})// 降序
            .limit(1)
            .exec();
    },

    // 得到数据总条数，用于分页
    getCount: function getCount(author, keyword, tags, isLogin) {
        var query = {};
        if (author) {
            query.author = author;
        }
        if (keyword) {
            var pattern = new RegExp(keyword, "i");
            query.title = pattern;
        }
        if (tags) {
            query.tags = tags;
        }
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .count(query)
            .exec();
    },

    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: function getPosts(author, keyword, tags, page, isLogin) {
        var query = {};
        if (author) {
            query.author = author;
        }
        if (!page) {
            page = 1;
        }
        if (keyword) {
            var pattern = new RegExp(keyword, "i");
            query.title = pattern;
        }
        if (tags) {
            query.tags = tags;
        }
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .find(query, {
                skip: (page - 1) * 5,
                limit: 5
            })
            .populate({path: 'author', model: 'User'})
            .sort({_id: -1})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .contentToMark()
            .exec();
    },

    // 文章归档
    getArchivePosts: function (isLogin) {
        var query = {};
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .find(query)
            .select({'_id':1,'title':1,'tags':1})
            .sort({_id: -1})
            .addCreatedAt()
            .exec();
    },

    // ajax查询提示
    getPostBySearch: function (keyword, isLogin) {
        var query = {};
        if (keyword) {
            var pattern = new RegExp(keyword, "i");
            query.title = pattern;
        }
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .find(query)
            .select({'_id':1,'title':1,'tags':1})
            .sort({_id: -1})
            .exec();
    },

    // 得到所有标签
    getTags: function (isLogin) {
        var query = {tags: {"$ne": ""}};
        if (!isLogin) {
            // 非登录只能看非私有
            query.isPrivate = {"$ne":true};
        }
        return Post
            .distinct('tags', query)
            .exec();
    },

    // 通过文章 id 给 pv 加 1
    incPv: function incPv(postId) {
        return Post
            .update({_id: postId}, {$inc: {pv: 1}})
            .exec();
    },

    // 通过文章 id 获取一篇原生文章（编辑文章）
    getRawPostById: function getRawPostById(postId) {
        return Post
            .findOne({_id: postId})
            .populate({path: 'author', model: 'User'})
            .exec();
    },

    // 通过用户 id 和文章 id 更新一篇文章
    updatePostById: function updatePostById(postId, author, data) {
        return Post.update({author: author, _id: postId}, {$set: data}).exec();
    },

    // 通过用户 id 和文章 id 删除一篇文章
    delPostById: function delPostById(postId, author) {
        return Post.remove({author: author, _id: postId})
            .exec()
            .then(function (res) {
                // 文章删除后，再删除该文章下的所有留言
                if (res.result.ok && res.result.n > 0) {
                    return CommentModel.delCommentsByPostId(postId);
                }
            });
    }

};