const Post = require('../../models/Post');
const { AuthenticationError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');

module.exports = {
    Query: {
      async getPosts(){
        try{
          const posts = await Post.find().sort({createdAt: -1});
          return posts;
        }
        catch(error){
          throw new Error(error);
        }
      },
      async getPost(_,{postId})
      {
        try{
          const post = await Post.findById(postId);
          if(post)
          {
            return post;
          }
          else
          {
            throw new Error('Post not found');
          }
        }
        catch(error){
          throw new Error(error);
        }
      }
    },
    Mutation: {
      async createPost(_,{ body },context)
      {
        const user = checkAuth(context);
        console.log(user);

        const newPost = new Post({
          body,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
        })
        const post = await newPost.save();

        context.pubsub.publish('NEW_POST', {
          newPost: post
        });

        return post;
      
      },
      async deletePost(_,{ postId },context)
      {
        const user = checkAuth(context);
        console.log(user);

        try
        {
          const post = await Post.findById(postId);
          if(user.username === post.username)
          {
            await post.delete();
            return 'Post Deleted';
          }
          else
          {
            throw new AuthenticationError('Action not allowed');

          }
        }
        catch(error){
          throw new Error(error);
        }
      },
      async likePost(_,{ postId },context)
      {
        const user = checkAuth(context);
        console.log(user);

        try
        {
          const post = await Post.findById(postId);
          if(post.likes.find(like => like.username === user.id))
          {
            post.likes = post.likes.filter(like => like.username !== user.id);
          }
          else
          {
            post.likes.push({
              username: user.username,
              createdAt: new Date().toISOString()
            });
          }
          await post.save();
          return post;
        }
        catch(error){
          throw new Error(error);
        }
      }
    },
    Subscription: {
      newPost: {
        subscribe : (_,__,{ pubsub }) => pubsub.asyncIterator('NEW_POST')
      }
    }
}