const Post = require('../../models/Post');
const { AuthenticationError,UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');

module.exports = {
    Query: {

    },
    Mutation: {
      async createComment(_,{ postId, body },context)
      {
        const user = checkAuth(context);
        console.log(user);

        if(body.trim() === '')
        {
            throw new UserInputError('Comment body is empty',{
                errors: {
                    body: 'Comment body is empty'
                }
            });
        }

        const post = await Post.findById(postId);
        if(post)
        {
            post.comments.unshift({
                body,
                username: user.username,
                createdAt: new Date().toISOString()
            })
            await post.save();
            return post;
        }
        else
        {
            throw new UserInputError('Post not found',{
                errors: {
                    postId: 'Post not found'
                }
            });
            
        }
      },
      async deleteComment(_,{postId, commentId },context)
      {
          const user = checkAuth(context);
          const post = await Post.findById(postId);
          if(post)
          {
              const comment = post.comments.find(c => c.id === commentId);
              if(comment && comment.username === user.username)
              {
                  post.comments.splice(post.comments.indexOf(comment),1);
                  await post.save();
                  return post;
              }
              else
              {
                  throw new UserInputError('Comment not found',{
                      errors: {
                          commentId: 'Comment not found'
                      }
                  });
              }
          }

      }
    }
}