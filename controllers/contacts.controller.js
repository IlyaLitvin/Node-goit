const {
  Types: { ObjectId },
} = require("mongoose");
const Contact = require("../model/contacts.model.js");
const Joi = require("joi");

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

function updateValidationRules(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    password: Joi.string(),
    phone: Joi.string(),
  }).min(1);
  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send({ message: "missing required name field" });
  }
  next();
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

async function contactsPageAndLimit(req, res) {
  const {
    params: { page, limit },
  } = req;
  const contacts = await Contact.paginate({}, { limit: limit, page: page });
  res.json(contacts);
}

async function contactsSub(req, res) {
  const {
    params: { sub },
  } = req;
  const contacts = await Contact.paginate(
    { subscription: sub },
    { limit: 5, page: 1 }
  );
  res.json(contacts);
}

module.exports = {
  getAllContacts,
  getContactById,
  validationContacts,
  addNewContact,
  deleteContact,
  updateContact,
  updateValidationRules,
  contactsPageAndLimit,
  contactsSub,
};
