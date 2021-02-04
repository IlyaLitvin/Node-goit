const {
  Types: { ObjectId },
} = require("mongoose");
const Contact = require("../contacts.js");

async function getAllContacts(req, res) {
  const contacts = await Contact.find();
  res.json(contacts);
}

async function getContactById(req, res) {
  const {
    params: { contactId },
  } = req;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(400).send("Contact isn't found");
  }
  res.json(contact);
}

async function addNewContact(req, res) {
  try {
    const { body } = req;
    const contact = await Contact.create(body);
    res.json(contact);
    res.status(201).send(contact);
  } catch (error) {
    res.status(400).send(error);
  }
}

async function updateContact(req, res) {
  const {
    params: { contactId },
  } = req;
  const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!updatedContact) {
    return res.status(400).send("Contact isn't found");
  }
  res.json(updatedContact);
}

async function deleteContact(req, res) {
  const {
    params: { contactId },
  } = req;
  const deleteContact = await Contact.findByIdAndDelete(contactId);
  if (!deleteContact) {
    return res.status(400).send("Contact isn't found");
  }
  res.json(deleteContact);
}

function validationContacts(req, res, next) {
  const {
    params: { contactId },
  } = req;
  if (!ObjectId.isValid(contactId)) {
    return res.status(400).send({ message: "Your id isn't valid" });
  }
  next();
}

module.exports = {
  getAllContacts,
  getContactById,
  validationContacts,
  addNewContact,
  deleteContact,
  updateContact,
};
