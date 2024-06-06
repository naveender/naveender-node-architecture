const express =require( "express");
const {
  changePassword,
  CreateUser,
  DeleteUser,
  ForgetPAssword,
  GetUser,
  InitialSignUp,
  linkExpireChecker,
  LoginUser,
  NewPass,
  notifyEmail,
  Recaptch,
  sentverificationEmailAgain,
  UpdateUser,
  UpdateChartConfig,
  updateUserInfo,
  userFurtherDetails,
  verifyUserToken,
  MisssentverificationEmailAgain,
  updatePhone,
  verifyPassword,
  sendEmailToChangeEmail,
  verifyChangeEmailCode,
  Enable2FA,
  verifyCodeOf2FA,
  Disabled2FA,
  updateLastSelectionWatchlist,
  GetUserLastSelectionOfWatchlist,
  subscribeToPackage,
  successrequest,
} =require( "../controllers/UserController");

//const { GetUserFromToken } = require("../utils/GetUserFromToken.js");
//const { verifyToken } = require("../auth");
const router = express.Router();

router.post("/register", CreateUser);
// router.post("/signup",InitialSignUp);
// router.post("/verificationEmail",sentverificationEmailAgain );
// router.post("/missVerificationEmail",MisssentverificationEmailAgain );
// router.post("/verifytoken",verifyUserToken);
// router.post("/userdetails", userFurtherDetails);
// router.post("/subscription", checkSubscriptionStatus);
// router.post("/subscribeToPackage", subscribeToPackage);
// router.get("/successrequest", successrequest);
// router.get("/usermigration", userMigration);
// router.post("/notify-email",GetUserFromToken, notifyEmail);
// router.post("/update-phone",GetUserFromToken,updatePhone);
// router.post("/change-password",GetUserFromToken,changePassword);
// router.post("/update-user",GetUserFromToken,updateUserInfo);
// router.post("/change-data-stream",GetUserFromToken,changeDataStream)
// router.post("/complain-form",ComplainFormController)
// router.post("/updateVarient",GetUserFromToken,updateMarketWatchVarient)
// router.post("/save-last-selection-watchlist",GetUserFromToken,updateLastSelectionWatchlist)
// router.get("/get-last-selection-watchlist",GetUserFromToken,GetUserLastSelectionOfWatchlist)
// router.post("/addAlertColumns",GetUserFromToken,addAlertColumns);
// router.post("/updateWatchListColumns",GetUserFromToken,updateWatchListTableColumn);
// router.post("/saveIndex",GetUserFromToken,saveIndexData)
// router.post("/verify-password",GetUserFromToken,verifyPassword)
// router.post("/send-email-to-change-email",GetUserFromToken,sendEmailToChangeEmail)
// router.post("/verify-change-email-code",GetUserFromToken,verifyChangeEmailCode)
// router.post("/enable-2FA",GetUserFromToken,Enable2FA)
// router.post("/disable-2FA",GetUserFromToken,Disabled2FA)
// router.post("/verify-code",verifyCodeOf2FA)
// router.post("/login", LoginUser);
// router.get("/GetUser",GetUserFromToken, GetUser);
// router.delete("/DeleteUser",GetUserFromToken, DeleteUser);
// router.post("/UpdateUser",GetUserFromToken, UpdateUser);
// router.post("/UpdateChartConfig",GetUserFromToken, UpdateChartConfig);
// router.post("/forget_password", ForgetPAssword);
// router.post("/new_password", NewPass);
// router.post("/logout", (req,res) => {
//   // req.logOut()
//   res.send('Logout successful')
//   // res.status(200).json({logout:true})
// });
// router.post("/get_marketwatch_data",MarketWatchController);
// router.post("/get_stock_alert_data", StockAlertController);
// router.post('/recaptcha',Recaptch)
// router.post('/linkExpireChecker',linkExpireChecker)

module.exports =router;
