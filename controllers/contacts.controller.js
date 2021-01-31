const contacts = require("../db/contacts.json");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join("../db/contacts.json");

function getAllContacts(req, res) {
  res.json(contacts);
}

function contactNotFound(res, contactId) {
  const contact = contacts.find((contact) => contact.id === contactId);
  if (!contact) {
    return res.status(404).send({ message: "Not found" });
  }
}

function getContactById(req, res) {
  const {
    params: { contactId },
  } = req;
  contactNotFound(res, contactId);
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );
  res.json(contacts[contactIndex]);
}

function validationContacts(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });
  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send({ message: "missing required name field" });
  }
  next();
}

function addNewContact(req, res) {
  const newContact = {
    id: uuidv4(),
    ...req.body,
  };
  contacts.push(newContact);
  fs.writeFile(contactsPath, JSON.stringify(contacts));
  res.status(201).send(newContact);
}

function deleteContact(req, res) {
  const {
    params: { contactId },
  } = req;
  contactNotFound(res, contactId);
  const index = contacts.findIndex((contact) => contact.id === contactId);
  contacts.splice(index, 1);
  fs.writeFile(contactsPath, JSON.stringify(contacts));
  res.status(200).send({ message: "contact deleted" });
}

function updateValidationRules(req, res, next) {
  const validationRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  });
  const validationResult = validationRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send({ message: "missing required name field" });
  }
  next();
}

function updateContact(req, res) {
  const {
    params: { contactId },
  } = req;
  contactNotFound(res, contactId);
  const contactIndex = contacts.findIndex(
    (contact) => contact.id === contactId
  );
  const updatedContact = {
    ...contacts[contactIndex],
    ...req.body,
  };
  contacts[contactIndex] = updatedContact;
  fs.writeFile(contactsPath, JSON.stringify(contacts));
  res.json(updatedContact);
}

module.exports = {
  getAllContacts,
  getContactById,
  validationContacts,
  addNewContact,
  deleteContact,
  updateValidationRules,
  updateContact,
};
