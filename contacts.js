const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join("./db/contacts.json");

async function listContacts() {
  try {
    const contactsList = await fs.readFile(contactsPath, "utf-8");
    return JSON.parse(contactsList);
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  const contactsListFun = await listContacts();
  const getContact = contactsListFun.find(
    (contact) => contact.id === contactId
  );
  return getContact;
}

async function removeContact(contactId) {
  const contactsListFun = await listContacts();
  const filteredListContacts = contactsListFun.filter(
    (contact) => contact.id !== contactId
  );
  fs.writeFile(contactsPath, JSON.stringify(filteredListContacts));
  return filteredListContacts;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

async function addContact(name, email, phone) {
  const newContact = {
    id: getRandomIntInclusive(1, 100),
    name: name,
    email: email,
    phone: phone,
  };
  const contactsListFun = await listContacts();
  contactsListFun.filter((contact) => contact.id === newContact.id);
  contactsListFun.push(newContact);
  fs.writeFile(contactsPath, JSON.stringify(contactsListFun));
  return contactsListFun;
}

module.exports = { listContacts, getContactById, removeContact, addContact };
