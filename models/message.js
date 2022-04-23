const mongoose = require("mongoose");
const { Schema } = mongoose;


const messageSchema = new Schema({
  user: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };