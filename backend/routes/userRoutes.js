const express = require("express");
const { createUser, getUsers, loginUser, deleteUser, logout, loggedInUserProfile,  sendUserInfoEmail, accessUserInfo } = require("../controller/user");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/authMiddleware");


const router = express.Router();
router.route("/admin/getAllUsers").get(isAuthenticatedUser , authorizeRoles("Admin"), getUsers)
router.route("/admin/createNewUser").post(isAuthenticatedUser ,authorizeRoles("Admin"), createUser)
router.route("/admin/userDelete/:id").delete(isAuthenticatedUser,authorizeRoles("Admin"), deleteUser)


router.route("/login").post(loginUser)
router.route("/logout").get(logout)
router.route("/me").get(isAuthenticatedUser,loggedInUserProfile)


router.route("/admin/sendUserInfoEmail").get(isAuthenticatedUser, authorizeRoles("Admin"),sendUserInfoEmail)
router.route("/admin/accessUserInfo").get(isAuthenticatedUser, authorizeRoles("Admin"),accessUserInfo)




module.exports = router

