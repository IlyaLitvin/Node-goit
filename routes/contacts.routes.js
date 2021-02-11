const Router = require("express");
const router = Router();
const morgan = require("morgan");
const contactController = require("../controllers/contacts.controller.js");
const authToken = require("../controllers/auth.controller.js");

router.use(morgan("dev"));

router.get("/", authToken.Authorization, contactController.getAllContacts);
router.get(
  "/:contactId",
  authToken.Authorization,
  contactController.validationContacts,
  contactController.getContactById
);
router.post(
  "/",
  authToken.Authorization,
  contactController.updateValidationRules,
  contactController.addNewContact
);
router.delete(
  "/:contactId",
  authToken.Authorization,
  contactController.validationContacts,
  contactController.deleteContact
);
router.patch(
  "/:contactId",
  authToken.Authorization,
  contactController.updateValidationRules,
  contactController.validationContacts,
  contactController.updateContact
);

module.exports = router;
