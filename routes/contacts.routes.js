const Router = require("express");
const router = Router();
const morgan = require("morgan");
const contactController = require("../controllers/contacts.controller.js");

router.use(morgan("dev"));

router.get("/", contactController.getAllContacts);
router.get(
  "/:contactId",
  contactController.validationContacts,
  contactController.getContactById
);
router.post("/", contactController.addNewContact);
router.delete(
  "/:contactId",
  contactController.validationContacts,
  contactController.deleteContact
);
router.patch(
  "/:contactId",
  contactController.validationContacts,
  contactController.updateContact
);

module.exports = router;
