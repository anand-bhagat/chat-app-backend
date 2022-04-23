const { GraphQLServer, PubSub } = require('graphql-yoga');

const connectDb = require("./config/db");

connectDb();
const models = require("./models");

const typeDefs = `
    type Message {
        _id: String!
        user: String!
        content: String!
    }

    type Query {
        messages: [Message!]
    }

    type Mutation {
        postMessage(user: String!, content: String!): String!
    }

    type Subscription {
        messages: [Message!]
    }
`;

const subscribers = [];
let messages = [];
const onMessagesUpdates = (fn) => subscribers.push(fn);

const fetchMessages = async () => {
    return await models.Message.find();
}

const resolvers = {
    Query: {
        messages: async () =>  {
            return await models.Message.find();
        },
    },
    Mutation: {
        postMessage: async (parent, {user, content}) => {
            const message = await models.Message.create({
                user,
                content
            });

            messages = await fetchMessages();
            subscribers.forEach((fn) => fn());
            return message._id;
        }
    },
    Subscription: {
        messages: {
            subscribe: async (parent, args, {pubsub}) => {
                if(messages.length === 0){
                    messages = await fetchMessages();
                }
                const channel = Math.random().toString(36).slice(2,15);
                onMessagesUpdates(() => pubsub.publish(channel, {messages}));
                setTimeout(() => pubsub.publish(channel, {messages}), 0);
                return pubsub.asyncIterator(channel);
            }
        }
    }
};

const pubsub = new PubSub();

const server = new GraphQLServer({ typeDefs, resolvers, context: {pubsub} });

server.start(({port}) => {
    console.log(`Server started on http://localhost:${port}`);
})
