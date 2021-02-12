const Router = require("express");
const router = Router();
const morgan = require("morgan");
const contactController = require("../controllers/contacts.controller.js");
const authToken = require("../controllers/auth.controller.js");

router.use(morgan("dev"));

router.get(
  "/page=:page&limit=:limit",
  authToken.Auth,
  contactController.contactsPageAndLimit
);
router.get("/sub=:sub", authToken.Auth, contactController.contactsSub);

router.get("/", authToken.Auth, contactController.getAllContacts);
router.get(
  "/:contactId",
  authToken.Auth,
  contactController.validationContacts,
  contactController.getContactById
);
router.post(
  "/",
  authToken.Auth,
  contactController.updateValidationRules,
  contactController.addNewContact
);
router.delete(
  "/:contactId",
  authToken.Auth,
  contactController.validationContacts,
  contactController.deleteContact
);
router.patch(
  "/:contactId",
  authToken.Auth,
  contactController.updateValidationRules,
  contactController.validationContacts,
  contactController.updateContact
);

module.exports = router;
