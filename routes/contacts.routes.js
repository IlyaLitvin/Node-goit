const Router = require("express");
const router = Router();
const morgan = require("morgan");
const contactController = require("../controllers/contacts.controller.js");

router.use(morgan("dev"));

router.get("/", contactController.getAllContacts);
router.get("/:contactId", contactController.getContactById);
router.post(
  "/",
  contactController.validationContacts,
  contactController.addNewContact
);
router.delete("/:contactId", contactController.deleteContact);
router.patch(
  "/:contactId",
  contactController.updateValidationRules,
  contactController.updateContact
);

module.exports = router;
