const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const ContactSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => value.includes("@"),
  },
  password: {
    type: String,
    required: true,
  },
});

ContactSchema.plugin(mongoosePaginate);

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
