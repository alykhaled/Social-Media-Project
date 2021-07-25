const {ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const Post = require('./models/Post');
const { MONGODB } = require('./config');

const typeDefs = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
  }
  type Query {
    getPosts: [Post]
  }
`;

const resolvers = {
  Query: {
    async getPosts(){
      try{
        const posts = await Post.find();
        return posts;
      }
      catch(error){
        throw new Error(error);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

mongoose
    .connect(MONGODB,{ useNewUrlParser:true })
    .then(() => {
        console.log("MongoDB connected");
        return server.listen();
    })
    .then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
      
