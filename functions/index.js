const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://adobe-firepad.firebaseio.com"
});

const { ApolloServer, gql } = require("apollo-server-express");

const typeDefs = gql`
type Markdown {
    title: String
    content: String
    author: String
}
type Query {
    markdowns: [Markdown]
}
`;

const resolvers = {
    Query: {
      markdowns: () =>
        admin
          .database()
          .ref("markdowns")
          .once("value")
          .then(snap => snap.val())
          .then(val => Object.keys(val).map(key => val[key]))
    }
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: "/", cors: true });
exports.graphql = functions.https.onRequest(app);