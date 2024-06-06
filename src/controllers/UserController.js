/*
=================================================================================
      DESCRIPTION--->                                                                            
⚡🔌 USER CONTROLLER:CONTENT LIST🌟🔌                                              
      1.CreateUser- Register the user
      2.                                                  
=================================================================================
*/

const bycrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");
const axios = require("axios");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { UserSchema } = require("../models/User");
const { createToken } = require("../services/TokenServices");
const RESTRESPONSE = require("../utils/RESTRESPONSE");
const { getDifferenceBetweenTwoDates } = require("../services/CommonFunction");
const config = require("../config/config");
const { EmailSent } = require("../services/EmailService");
const { templateMaster } = require("../views/emailTemplates/templateMaster");

// const { transporter } = require("../utils/Transporter");
// const {
//   verifyPasswordService,
//   getVerficationCode,
//   verifyCode,
//   generateSixDigitCode,
//   SaveCodeInDB,
//   checkExpiryOfCode,
// } = require("../services/ChangeEmailService");



const CreateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password, repeatPassword, termsAndCondition } = req.body;
    const phone = req.body.phone ? req.body.phone : "";
    if (!userName) {
      return res.send(
        RESTRESPONSE(false, "Username is required.", { error: 'Username is required.' })
      );
    }
    const hashedPassword = await bycrypt.hash(password, 10);
    const repeatHashedPassword = await bycrypt.hash(repeatPassword, 10);

    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buf) => {
        if (err) reject(err);
        else resolve(buf);
      });
    });
    const token = buffer.toString('hex');
    let emailVerificationToken = await createToken(email, config.emailVerificationSecretKey);
    const SchemaCheck = new UserSchema({
      firstName,
      lastName,
      userName,
      email,
      phone,
      emailVerificationToken,
      password: hashedPassword,
      repeatPassword: repeatHashedPassword,
      resetToken: token,
      expireToken: Date.now() + 3600000,
      termsAndCondition,
    });

    const existingUser = await UserSchema.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      let errorMessage = "User already exists with this ";
      if (existingUser.email === email) errorMessage += "email.";
      else if (existingUser.userName === userName) errorMessage += "username.";

      return res.send(
        RESTRESPONSE(false, errorMessage)
      );
    }

    const result = await SchemaCheck.save();
    if (result) {
      // MAIL SENDING FUNCTIONALITY
      
      let dynamicEmailTemplateVariables = {
        logo:"demologo",
        app_link:config.clientAppUrl,
        username: userName,
        message: "Please confirm your email address by clicking the button below. This is so you can unlock access to your new Market Alert Pro account. If you don't verify your email address within 7 days, we'll have to automatically delete your account.",
        btnName: "VERIFY YOUR EMAIL",
        btnLink: `${config.clientAppUrl}/verify?Token=${emailVerificationToken}`,
      };
      let emailTemplateDetails=await templateMaster("account_email_verification",dynamicEmailTemplateVariables);
      let sent=await EmailSent(emailTemplateDetails.emailSubject,email,emailTemplateDetails.emailBody);
      if(sent)
      return res.send(
        RESTRESPONSE(true, "User has been successfully created!", {
          user: result,
        })
      );
    } else {
      return res.send(
        RESTRESPONSE(false, "An unknown error occurred while saving information")
      );
    }
    
  } catch (error) {
    return res.send(
      RESTRESPONSE(false, "Server Side Error", { error: error.message })
    );
  }
};

async function getKey(byteSize) {
  let key = await crypto.randomBytes(byteSize);
  return key;
}


const LoginUser = async (req, res, next) => {
  const header = req.header;
  const { email, password } = req.body;
  let tokenUser = await tokenScehmaUser.findOne({ email: email });

  UserSchema.findOne(
    { $or: [{ username: email }, { email }] },
    async function (err, result) {
      // console.log("result", result);
      if (result && result?.subscrbtionId) {
        // console.log(result)
        try {
          const hashedPassword = await bycrypt.hash(password, 10);
          console.log("hashedPassword", hashedPassword)
          if (await bycrypt.compare(password, result.password)) {
            
            if (subsrcibtion) {
              if (subsrcibtion.status === "canceled") {
                // console.log("subsribtion cancel ha");
                return res.send(
                  RESTRESPONSE(
                    false,
                    "There is no account with that username/password combination. Please try again or register for an account.",
                    { subscribtionStatus: false }
                  )
                );
              } else {
                if (
                  result?.two_FA[0]?.isEnabled &&
                  result?.two_FA[0]?.two_FA_by === "email"
                ) {
                  let user = {
                    email: result?.email,
                    id: result?._id,
                    twoFa: result?.two_FA[0],
                  };
                  const token = jwt.sign(
                    { user },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "5min",
                    }
                  );
                  let sent = SendCodeByEmail(result, token);
                  if (sent) {
                    return res.send(
                      RESTRESPONSE(
                        true,
                        "We just sent you a code kindly verify",
                        { twoFA: true, token: token }
                      )
                    );
                  }
                } else if (
                  result?.two_FA[0]?.isEnabled &&
                  result?.two_FA[0]?.two_FA_by === "phone"
                ) {
                  let user = {
                    email: result?.email,
                    id: result?._id,
                    twoFa: result?.two_FA[0],
                  };
                  const token = jwt.sign(
                    { user },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "5min",
                    }
                  );

                  let sent = sendOtpThroughphone(
                    result?.countryCode,
                    result?.phone
                  );
                  if (sent) {
                    return res.send(
                      RESTRESPONSE(
                        true,
                        "We just sent you a code kindly verify",
                        { twoFA: true, token: token }
                      )
                    );
                  }
                } else {
                  // console.log("result", result);
                  const user = {
                    email,
                    customerId: result.customerId,
                    userId: result._id,
                    product: result.productId,
                    planId: result.planId,
                  };
                  // console.log("user from login", user);
                  const token = jwt.sign(
                    { user },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "1d",
                    }
                  );

                  return res.send(
                    RESTRESPONSE(true, "User has logged in successfully!", {
                      token: token,
                      email: result.email,
                      username: result.username,
                      emailVerification: result?.emailVerification,
                      phoneVerification: result?.phoneVerification,
                      personalInfo: result?.personalInfo,
                      expireToken: result.expireToken,
                      phone: result.phone,
                      planId: result.planId,
                      subscrbtionId: result.subscrbtionId,
                      termsAndCondition: result.termsAndCondition,
                      subscribtionStatus: subsrcibtion.status,
                      cardInfo: result.cardInfo,
                      userId: user.userId,
                      productId: result.productId,
                      varientForMarketWatch: result.varientForMarketWatch,
                      dataStreamCountry: result.dataStreamCountry,
                      watchListColumns: result.watchlistColumns,
                      watchListDropDown: result.watchListDropDown,
                      indexData: result.IndexData,
                      country: result.userCountry,
                      status: result.status,
                      ...GetRoleData(result.productId),
                    })
                  );
                }
              }
            } else {
              return res.send(false, "Server side error!", {});
            }

          } else {
            return res.send(
              RESTRESPONSE(false, "Email or password is incorrect.", {
                email_password: false,
              })
            );
          }
        } catch (err) {
          console.log(err);
          return res.send(
            RESTRESPONSE(
              false,
              "An unknown error occurred please try again.",
              {}
            )
          );
        }
      } else if (result && result?.emailVerification) {
        if (await bycrypt.compare(password, result?.password)) {
          let EmailVerificationToken = await createToken(email, process.env.EMAIL_VERIFICATION_CODE);
          let update = await tokenScehmaUser.findOneAndUpdate(
            { email: result.email },
            { EmailVerificationToken: EmailVerificationToken }
          );
          return res.send(
            RESTRESPONSE(true, "Incomplete details.", {
              emailVerificationToken: EmailVerificationToken,
              emailVerification: tokenUser?.emailVerification,
              phoneVerification: tokenUser?.phoneVerification,
              personalInfo: tokenUser?.personalInfo,
            })
          );
        } else {
          return res.send(
            RESTRESPONSE(false, "Email or password is incorrect.", {})
          );
        }
      } else if (!result && tokenUser) {
        console.log("tokenUser", tokenUser.metaData[0].password);
        console.log(
          "tokenUser",
          await bycrypt.compare(password, tokenUser.metaData[0].password)
        );

        if (await bycrypt.compare(password, tokenUser.metaData[0].password)) {
          console.log("in else if");

          return res.send(
            RESTRESPONSE(true, "Incomplete details.", {
              emailVerificationToken: tokenUser?.EmailVerificationToken,
              emailVerification: tokenUser?.emailVerification,
              phoneVerification: tokenUser?.phoneVerification,
              personalInfo: tokenUser?.personalInfo,
            })
          );
        } else {
          return res.send(
            RESTRESPONSE(false, "Email or password is incorrect.", {})
          );
        }
      } else {
        return res.send(
          RESTRESPONSE(false, "Email or password is incorrect.", {})
        );
      }
    }
  );
};


const UpdateUser = async (req, res) => {
  //using token for subsribtion Id and customer Id
  let result = req.user;

  let {
    // username,
    email,

    id,
    currentpassword,
    password,
    repeatpassword,
    productId,
    planId,
  } = req.body;
  // console.log("req body from update user", req.body);

  // console.log(newSubscribtion);

  let phone = req.body.phone ? req.body.phone : "";

  // id = mongoose.Types.ObjectId(id);
  let hashedpassword = "";

  let updateObj = {
    // Username: username,
    email: email,
    phone: phone,
  };
  // console.log(newSubscribtion);

  // let result = await UserSchema.findOne({ _id: id });
  console.log("password reset", password && repeatpassword && currentpassword);
  if (result) {
    if (password && repeatpassword && currentpassword) {
      //  hashedpassword = result.password;

      console.log("result is", result);
      console.log("result.password===>", result.password);

      console.log("db result.password is:", result.password);

      try {
        let comparisionResult = await bycrypt.compare(
          currentpassword,
          result.password
        );
        if (comparisionResult) {
          console.log("User existes...", password);
          hashedpassword = await bycrypt.hash(password, 10);
          updateObj.password = hashedpassword;
        } else {
          return res.send(
            RESTRESPONSE(false, "Invalid Current Password", { user: result })
          );
        }
        let previousAndLatestPasswordChecker = await bycrypt.compare(
          password,
          result.password
        );
        console.log("comparisionResult=====>", comparisionResult);
        console.log(comparisionResult);
        if (previousAndLatestPasswordChecker) {
          return res.send(
            RESTRESPONSE(false, "Password not be same as previous password", {
              user: result,
            })
          );
        }
      } catch (err) {
        return res.send(
          RESTRESPONSE(false, "Invalid Passwords", { user: result })
        );
      }
    }
    if (productId && planId) {
      console.log("new subscribtion ha");
      var preSubscribtionForDlete = result.subscrbtionId;
      // console.log("preSubscribtionForDlete======>", preSubscribtionForDlete);
      try {
        const previousSubscriptionDetails =
          await getStripe().subscriptions.retrieve(preSubscribtionForDlete);
        console.log(
          "previousSubscriptionDetails====>",
          previousSubscriptionDetails
        );
        console.log(
          "previousSubscriptionDetails====>",
          previousSubscriptionDetails.status
        );
        if (
          planId == result.planId &&
          previousSubscriptionDetails.status === "active"
        ) {
          return res.send(
            RESTRESPONSE(false, "You are already in this subscribtion", {})
          );
        }
        // console.log("deleing subscribtion");
        // if (previousSubscriptionDetails.status != "canceled") {
        //   const deleted = await getStripe().subscriptions.del(
        //     preSubscribtionForDlete
        //   );
        // }
        const subscription = await getStripe().subscriptions.create({
          customer: result.customerId,
          items: [{ price: planId }],

          // trial_period_days: 7,
        });
        if (subscription) {
          const invoice = await getStripe().invoices.retrieve(
            subscription.latest_invoice
          );
          console.log("invoice", invoice);
          if (invoice.paid == false) {
            console.log("hello from invoice failed");
            return res.send(
              RESTRESPONSE(false, "Transaction failed with respective card", {})
            );
          } else {
            const deleted = await getStripe().subscriptions.del(
              preSubscribtionForDlete
            );
          }

          updateObj.planId = planId;
          updateObj.subscrbtionId = subscription.id;
          updateObj.productId = productId;
        } else {
          return res.send(
            RESTRESPONSE(false, "Error While doing subscribtion", {})
          );
        }
      } catch (err) {
        return res.send(
          RESTRESPONSE(false, "Server error from update user", {})
        );
      }
    }
  } else {
    return res.send(RESTRESPONSE(false, "User not found", { user: result }));
  }

  console.log("updateObj", updateObj);
  let updateUserRes = await UserSchema.findByIdAndUpdate(id, {
    $set: updateObj,
    new: true,
  });
  console.log(updateUserRes);

  try {
    if (updateUserRes) {
      // console.log("Updated user details are", updateUserRes);

      return res.send(
        RESTRESPONSE(true, "Your account has been updated successfully!", {
          data: updateUserRes,
        })
      );
    } else {
      throw Error("Invalid Credentials!");
    }
  } catch (err) {
    return res.send(
      RESTRESPONSE(false, "An unknown error occurred please try again.", {})
    );
  }
};

const GetUser = async (req, res) => {
  // console.log("Token recieved is:", req.body);
  let result = req.user;
  let subscriptioninfo = [];
  var subscription = await checkSubscriptionStatus(result.email)
  subscriptioninfo = subscription;
  // console.log("User is:==>", user.userId);
  // let result = await UserSchema.findOne({ _id: user.userId });
  // console.log("result=======>", result);
  const roleData = GetRoleData(result.productId);
  const role = ProductConfig[result.productId].role;
  // const bannerSettings = result?.bannerSettings ? result.bannerSettings :  getIndexDataList(result)
  let bannerSettings = [];

  if (result?.bannerSettings === undefined)
    bannerSettings = getIndexDataList(result);
  if (result && result?.bannerSettings && result?.bannerSettings.length) {
    bannerSettings = result?.bannerSettings;
  }
  try {
    if (result) {
      if (!subscription.success) {
        return res.send(
          RESTRESPONSE(false, "user subscription end", {
            user: { ...result, ...roleData, bannerSettings, subscriptioninfo },
          })
        );
      }
      else {
        return res.send(
          RESTRESPONSE(true, "got user", {
            user: { ...result, ...roleData, bannerSettings, subscriptioninfo },
          })
        );
      }

    } else {
      throw Error("Invalid");
    }
  } catch (err) {
    console.log(err);
    return res.send(
      RESTRESPONSE(false, "An unknown error occurred please try again.", {
        error: err,
      })
    );
  }
};


//this function is made seperately because in reset password we need a user detail the above (GETUser) is not work because before login we dont have token so we dont access the header of app
const linkExpireChecker = async (req, res) => {
  let token = req.body.token;
  let result = await UserSchema.find({ resetToken: token });
  if (result.length > 0) {
    return res.send(RESTRESPONSE(true, "link is valid", {}));
  } else {
    return res.send(RESTRESPONSE(false, "link is not valid", {}));
  }
};
const DeleteUser = async (req, res) => {
  // console.log("Token recieved is:", req.body);

  try {
    let user = req.user;
    // console.log("User is:==>", user.userId);
    const result = await UserSchema.deleteOne({ _id: user._id });
    if (result) {
      console.log("filtered data is:", result);

      return res.send(
        RESTRESPONSE(true, "got user", {
          user: result,
        })
      );
    } else {
      throw Error("User Not Found");
    }
  } catch (err) {
    return res.send(
      RESTRESPONSE(false, "An unknown error occurred please try again.", {
        error: err,
      })
    );
  }
};

const ForgetPAssword = async (req, res, next) => {
  let filePath = path.resolve(process.env.BASEPATH, 'logo.png')

  // console.log("filePath==>",html)
  // const response_key=req.body['#g-recaptcha-response']

  // recapctha verification work

  console.log("response_key=====>", req.body);
  const response_key = req.body.response_key;
  const secret_key = process.env.RECAPTACH_SECRET;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
  let response_of_recaptcha = await axios.post(url);
  console.log(response_of_recaptcha.data.success);
  // if (!response_of_recaptcha.data.success) {
  //   return res.send(RESTRESPONSE(false, "Recaptcha failed", {}));
  // }
  crypto.randomBytes(32, (err, buffer) => {
    try {
      if (err)
        return res.send(
          RESTRESPONSE(false, "Server Error", {
            error: err,
          })
        );
      const token = buffer.toString("hex");
      UserSchema.findOne({ email: req.body.email }, function (err, result) {
        console.log(result);
        if (!result) {
          return res.send(
            RESTRESPONSE(
              false,
              "It looks like you've entered an incorrect email address, please try again.",
              {
                error: err,
              }
            )
          );
        }
        result.resetToken = token;
        result.expireToken = Date.now() + 3600000;
        const obj = {
          username: result?.firstName,
          paragraph: "This email is to confirm that you requested a password reset, to complete the password reset process, click the button below:",
          btnName: "RESET YOUR PASSWORD",
          btnLink: `${process.env.LINK_EMAIL}/resetpassword?Token=${token}`,
        }
        let htmlCon = userStoryEmailContent(obj)

        result.save().then((result) => {
          transporter.sendMail({
            to: result.email,
            cc: appConfig.adminEmail,
            from: {
              name: "Market Alert Pro",
              address: "accounts@marketalertpro.com",
            },
            subject: "Password reset",
            html: `${htmlCon}`

          });


          return res.send(
            RESTRESPONSE(
              true,
              "The link for reset password is successfully sent to your email",
              {
                error: err,
              }
            )
          );

        });
      });
    } catch (e) {
      return res.send(
        RESTRESPONSE(false, "An unknown error occurred please try again.", {
          error: err,
        })
      );
    }
  });
};

const NewPass = async (req, res, next) => {
  const sentToken = req.body.token;
  console.log("req.body.pass", req.body);
  const hashedPassword = await bycrypt.hash(req.body.password, 10);
  UserSchema.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  })
    .then((user) => {
      crypto.randomBytes(32, (err, buffer) => {
        const token = buffer.toString("hex");
        if (!user)
          return res.send(
            RESTRESPONSE(
              false,
              "Following link is expired kindly send request for reset password again",
              {
                error: err,
              }
            )
          );
        else {
          (user.password = hashedPassword), (user.resetToken = token);
          user.expireToken = Date.now() + 3600000;
          let updatePassword = tokenScehmaUser.findOneAndUpdate;
          user.save().then(() => {
            console.log("password has been reset");

            return res.send(
              RESTRESPONSE(true, "Password has been reset successfully", {
                error: err,
              })
            );
          });
        }
      });
    })
    .catch((err) => {
      return res.send(
        RESTRESPONSE(false, "Server Error", {
          error: err,
        })
      );
    });
};
const Recaptch = async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: "Please select captcha" });

  // Secret key
  const secretKey = "6LdBUqkhAAAAACVPwEENTyT-WVVp8YbF3PhZBBUI";

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress,
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then((res) => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: "Failed captcha verification" });

  // If successful
  return res.json({ success: true, msg: "Captcha passed" });
};


const verifyUserToken = async (req, res) => {
  let token = req.body.token;
  console.log("token", token);
  let user = jwt.decode(token.Token);
  let product;
  console.log(user, "user");
  // console.log(emq);
  if (token && user) {
    let result = await tokenScehmaUser.findOne({ email: user?.email });
    if (result?.EmailVerificationToken === token.Token) {
      jwt.verify(
        token.Token,
        process.env.EMAIL_VERIFICATION_CODE,
        async function (err, decoded) {
          if (err) {
            console.log(err);
            return res.send(
              RESTRESPONSE(false, "token expired", { token: false })
            );
          } else {
            let resultOfUser = await UserSchema.findOne({ email: user.email });
            console.log("resultOfUser", resultOfUser);
            if (!resultOfUser) {
              console.log("user nh ha");
              tokenScehmaUser
                .findOneAndUpdate(
                  { email: user.email },
                  { $set: { emailVerification: true } }
                )
                .then((result) => {
                  console.log("result", result);
                  let data = UserSchema({
                    email: result.metaData[0].email,
                    password: result.metaData[0].password,
                    username: result.username,
                    isEmailVerified: true,
                    emailVerification: true,
                  });
                  product = ProductConfig[result.productId];
                  console.log("product", product);

                  data.save().then((result) => {
                    return res.send(
                      RESTRESPONSE(true, "token true", { token: true, product })
                    );
                  });
                });
            } else {
              return res.send(
                RESTRESPONSE(true, "user created", { token: true, product })
              );
            }
          }
        }
      );
    } else {
      return res.send(
        RESTRESPONSE(false, "token expired / used", { token: false })
      );
    }
  } else {
    return res.send(RESTRESPONSE(false, "Invalid Link", { token: false }));
  }
};

const InitialSignUp = async (req, res) => {
  const { email, password, planId, productId, username } = req.body;
  console.log(req.body);
  console.log(username);
  let buffer = await getKey(32);
  console.log("buffer===>", buffer);
  const token = buffer.toString("hex")
  console.log(token);

  try {
    let checkUser = await tokenScehmaUser.findOne({ email: email });
    let checkUserName;
    if (username) {
      checkUserName = await tokenScehmaUser.findOne({ username: username });
      console.log("checkUserName", checkUserName);
    }

    if (checkUser) {
      if (checkUser.EmailVerificationToken) {
        return res.send(RESTRESPONSE(false, "Email already taken", {}));
      }
    } else if (checkUserName) {
      return res.send(RESTRESPONSE(false, "Username already taken", {}));
    } else {
      // const customer = await getStripe().customers.create({
      //   email: email,
      // });
      // if (customer) {
      //   const subsribtion = await getStripe().subscriptions.create({
      //     customer: customer.id,
      //     items: [{ price: planId }],
      //     trial_period_days: 7,
      //   });

      const hashedPassword = await bycrypt.hash(password, 10);
      let token = createToken(email, process.env.EMAIL_VERIFICATION_CODE);
      let emailCheck = validator.isEmail(email);
      const obj = {
        username: username,
        paragraph: "Please confirm your email address by clicking the button below. This is so you can unlock access to your new Market Alert Pro account. If you don't verify your email address within 7 days, we'll have to automatically delete your account.",
        btnName: "VERIFY YOUR EMAIL",
        btnLink: `${process.env.LINK_EMAIL}/verify?Token=${token}`,
      }
      let htmlCon = userStoryEmailContent(obj)

      let emailcontent = htmlCon;

      let tokenSave = tokenScehmaUser({
        username,
        email,
        EmailVerificationToken: token,
        productId: productId,
        planId: planId,
        metaData: { email: email, password: hashedPassword },
      });
      tokenSave.save().then(async (response) => {
        if (emailCheck) {
          let result = await EmailSent(
            "Verify your email address",
            email,
            emailcontent
          );

          console.log("result", result);
          if (result) {
            return res.send(
              RESTRESPONSE(
                true,
                "Verification email has been successfully sent.",
                {}
              )
            );
          } else {
            return res.send(
              RESTRESPONSE(
                false,
                "Something went wrong, please try again later.",
                {}
              )
            );
          }
        } else {
          return res.send(RESTRESPONSE(false, "Wrong email address", {}));
        }
      });
    }
    // }
  } catch (e) {
    console.log(e);
    return res.send(RESTRESPONSE(false, "server side error", {}));
  }
};

const userFurtherDetails = async (req, res) => {
  let payload = req.body.payload;
  let {
    firstName,
    lastName,
    phone,
    countryCode,
    //cardToken,
    userToken,
    country,
  } = payload;
  console.log(payload);
  const obj = {
    username: firstName,
    paragraph: "Thank you for signing up with our Market Alert Pro. To get you started, please click on the button below to log in to your account for the first time.",
    btnName: "LOGIN TO YOUR ACCOUNT",
    btnLink: `${process.env.LINK_EMAIL}/`,
  }
  let htmlCon = userStoryEmailContent(obj)
  let emailcontent = htmlCon;

  let user = jwt.decode(userToken.Token);

  let databaseObject = {};
  let CardInfo = [];
  let dataStreamCountry = [
    { country: "oz", date: moment().utc().startOf("day").toDate() },
  ];

  let resultFromUser = await UserSchema.find({ email: user.email });

  if (resultFromUser.length > 0) {
    crypto.randomBytes(32, async (err, buffer) => {
      const token = buffer.toString("hex");

      try {
        let resultFromToken = await tokenScehmaUser.findOne({
          email: user.email,
        });

        if (resultFromToken) {
          const customer = await getStripe().customers.create({
            email: user.email,
            name: `${payload.firstName} ${payload.lastName}`,
            phone: payload.phone ? payload.phone : "",
          });
          console.log("customer=====>", customer);

          if (customer) {
            const subsribtion = await getStripe().subscriptions.create({
              customer: customer.id,
              items: [{ price: resultFromToken.planId }],
              trial_period_days: 14,
            });

            console.log("subsribtion====>", subsribtion);
            if (subsribtion) {
              let updatedTokenSchema = await tokenScehmaUser.findOneAndUpdate(
                { email: user.email },
                { $set: { personalInfo: true } }
              );
              databaseObject["firstName"] = firstName;
              databaseObject["lastName"] = lastName;
              databaseObject["phone"] = phone;
              databaseObject["customerId"] = customer.id;
              databaseObject["productId"] = resultFromToken.productId;
              databaseObject["planId"] = resultFromToken.planId;
              databaseObject["subscrbtionId"] = subsribtion.id;
              databaseObject["resetToken"] = token;
              databaseObject["personalInfo"] = true;
              databaseObject["userCountry"] = country;
              databaseObject["expireToken"] = Date.now() + 3600000;
              (databaseObject["dataStreamCountry"] = dataStreamCountry),
                (databaseObject["countryCode"] = countryCode);
              (databaseObject["status"] = "trialing");
              console.log("databaseObject=====>", databaseObject);
            }
            else {
              const deleted = await getStripe().customers.del(customer.id);
              RESTRESPONSE(
                false,
                "something went wrong kindly try again later",
                {}
              );
            }
            try {
              // const source = await getStripe().customers.createSource(
              //   customer.id,
              //   {
              //     source: cardToken,
              //   }
              // );
              //if (source) {
              // CardInfo.push({
              //   last4digit: source.last4,
              //   brand: source.brand,
              //   cardId: source.id,
              //   expireYear: source.exp_year,
              //   expireMonth: source.exp_month,
              //   cardFingerPrint: source.fingerprint,
              //   default: true,
              // });
              databaseObject["cardInfo"] = [];

              console.log(databaseObject);
              let updateUserRes = await UserSchema.findOneAndUpdate(
                { email: user.email },
                {
                  $set: databaseObject,
                  new: true,
                }
              );

              let tokenUpdate = await createToken(
                user.email,
                process.env.EMAIL_VERIFICATION_CODE
              );
              let result = await tokenScehmaUser.findOneAndUpdate(
                { email: user.email },
                { $set: { EmailVerificationToken: tokenUpdate } }
              );
              console.log(result);
              if (result) {
                EmailSent("Account created", user.email, emailcontent);
                return res.send(
                  RESTRESPONSE(true, "User created sucessfully", {})
                );
              }
            }
            // else {
            //   const deleted = await getStripe().customers.del(customer.id);
            //   return res.send(
            //     RESTRESPONSE(
            //       false,
            //       "Something went wrong kindly try again later",
            //       {}
            //     )
            //   );
            // }
            catch (e) {
              console.log(e);
              const deleted = await getStripe().customers.del(customer.id);
              return res.send(
                RESTRESPONSE(false, "Invalid credit card information", {})
              );
            }
          } else {
            return res.send(
              RESTRESPONSE(
                false,
                "something went wrong kindly try again later",
                {}
              )
            );
          }
        } else {
          return res.send(
            RESTRESPONSE(
              false,
              "Something went wrong kindly try again later",
              {}
            )
          );
        }
      } catch (e) {
        console.log(e);
        return res.send(RESTRESPONSE(false, "server side error", {}));
      }
    });
  } else {
    RESTRESPONSE(false, "User Already exists", {});
  }

  // let result =  await UserSchema.find({email:user.email})
  // console.log(result);
};


const sentverificationEmailAgain = async (req, res) => {
  const { email } = req.body;
  console.log("req body from sign up", req.body);
  let token = await createToken(email, process.env.EMAIL_VERIFICATION_CODE);
  let emailcontent = `<div  style="height:100%; width:100%; padding-top:20px; padding-bottom:20px; background-color:#000000; justify-content:center; align-items:center; margin-right:20px; margin-right:10px">
      
  <img style="margin-left:10px; align-self:center; display:flex; width:350px; height:180px; margin-top:5px; border:0;" src="https://api.marketalertpro.com/images/logo1.png">
  
<p style="color:white; font-size:16px; margin-top:10px; margin-left:10px;">Hi!<br/><br/>Please confirm your email address by clicking the button below. This is so you can unlock access to your new Market Alert Pro account. If you don't verify your email address within 7 days we'll have to automatically delete your account.</p><br></br>     
      <button 
      style=" border: 1px;
      margin-left:10px;
      padding: 25;
      background: #02C92D;
      height:35px;
      width:170px;
      border-radius:5px;
      cursor:pointer;"><a style="color:white;" href="${process.env.LINK_EMAIL}/verify?Token=${token}" 
      style="text-decoration:none;color:#02BD2D;">VERIFY YOUR EMAIL</a> 
      </button> 
      <br/><br/><br/>
      <h3 style="color:gray; margin-left:10px">Important Notice</h3>
        <p style="margin-left:10px; color:gray; text-align:justify; font-size:10px">
            Market Alert Pro is an Authorised Representative (No. 001297846) of Equity Analyst Pty Ltd - ACN 60643403285 and AFSL 534455. 
        The Market Alert Pro website is for general information only and is not intended to address<br/> any person’s personal financial requirements,
        goals, objectives, or life situation. The information does not form and should not be considered as personal, tailored, 
        or one-to-one advice. Nor is it a recommendation about<br/> your investment decisions. Market Alert Pro are not financial advisors, 
        and we do not hold ourselves out to be financial advisors or planners. This website is not a substitute for professional financial advice. 
        The information does not<br/> consider your personal circumstances. The contents of this site change daily, and the past performance results on 
        this website do not guarantee future results. This website contains general information only. The information on this<br/> website is 
        delivered to the general public and is not aimed at any individual. We encourage you to seek advice from a trusted and qualified 
        financial adviser. Nothing on this website should be taken as a solicitation to buy or sell a<br/> financial product. Any reliance you 
        place on information on this website is strictly at your own risk. You alone accept the responsibility for your investment decisions. 
        Investing in stocks carries a risk of financial loss when stock prices fall. <br/>Only trade with funds you can afford to lose.
        </p>         
      </div>`;
  console.log(token);

  try {
    let updtaedObject = {};
    let checkUser = await tokenScehmaUser.findOne({ email: email });
    console.log(checkUser);
    if (checkUser) {
      console.log("in if");
      updtaedObject["metaData"] = {
        password: checkUser.metaData[0].password,
        email: email,
      };
      updtaedObject["productId"] = checkUser.productId;
      updtaedObject["planId"] = checkUser.planId;
      updtaedObject["istokenExpired"] = false;
      updtaedObject["EmailVerificationToken"] = token;

      console.log("updtaedObject", updtaedObject);
      let updateUserRes = await tokenScehmaUser.findOneAndUpdate(
        { email: email },
        {
          $set: updtaedObject,
          new: true,
        }
      );
      console.log("updateUserRes", updateUserRes);
      console.log("updateUserRes", updateUserRes.length);
      if (updateUserRes) {
        console.log("result from email sent before");
        let result = EmailSent(
          "Verify your email address",
          email,
          emailcontent
        );
        console.log("email sent");
        if (result) {
          console.log("Email Sent Successfully");
          return res.send(RESTRESPONSE(true, "Email Sent Successfully", {}));
        } else {
          console.log("Something went wrong kindly try again");
          return res.send(
            RESTRESPONSE(false, "Something went wrong kindly try again", {})
          );
        }
      } else {
        console.log("Something went wrong kindly try again");

        return res.send(
          RESTRESPONSE(false, "Something went wrong kindly try again", {})
        );
      }
    }
  } catch (e) {
    return res.send(RESTRESPONSE(false, "server side error", {}));
  }
};
const MisssentverificationEmailAgain = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  let user = jwt.decode(email.Token);
  console.log("req body from sign up", req.body);
  let token = await createToken(
    user.email,
    process.env.EMAIL_VERIFICATION_CODE
  );
  let emailcontent = ` <div  style="height:100%; width:100%; padding-top:20px; padding-bottom:20px; background-color:#000000; justify-content:center; align-items:center; margin-right:20px; margin-right:10px">
      
  <img style="margin-left:10px; align-self:center; display:flex; width:350px; height:180px; margin-top:5px; border:0;" src="https://api.marketalertpro.com/images/logo1.png">
  
      <p style="color:white; font-size:16px; margin-top:10px; margin-left:10px; ; text-align:justify;">Hi!<br/><br/>Please confirm your email address by clicking the button below. This is so you can unlock access to your new Market Alert Pro account. If you don't verify your email address within 7 days we'll have to automatically delete your account.</p><br>  
      <button 
      style=" border: 1px;
      margin-left:10px;
      padding: 25;
      background: #02C92D;
      height:35px;
      width:170px;
      border-radius:5px;
      cursor:pointer;"><a style="color:white;" href="${process.env.LINK_EMAIL}/verify?Token=${token}" 
      style="text-decoration:none;color:#02BD2D;">VERIFY YOUR EMAIL</a> 
      </button> 
      <br/><br/><br/>
      <h3 style="color:gray; margin-left:10px">Important Notice</h3>
        <p style="margin-left:10px; color:gray; text-align:justify; font-size:10px">
            Market Alert Pro is an Authorised Representative (No. 001297846) of Equity Analyst Pty Ltd - ACN 60643403285 and AFSL 534455. 
        The Market Alert Pro website is for general information only and is not intended to address<br/> any person’s personal financial requirements,
        goals, objectives, or life situation. The information does not form and should not be considered as personal, tailored, 
        or one-to-one advice. Nor is it a recommendation about<br/> your investment decisions. Market Alert Pro are not financial advisors, 
        and we do not hold ourselves out to be financial advisors or planners. This website is not a substitute for professional financial advice. 
        The information does not<br/> consider your personal circumstances. The contents of this site change daily, and the past performance results on 
        this website do not guarantee future results. This website contains general information only. The information on this<br/> website is 
        delivered to the general public and is not aimed at any individual. We encourage you to seek advice from a trusted and qualified 
        financial adviser. Nothing on this website should be taken as a solicitation to buy or sell a<br/> financial product. Any reliance you 
        place on information on this website is strictly at your own risk. You alone accept the responsibility for your investment decisions. 
        Investing in stocks carries a risk of financial loss when stock prices fall. <br/>Only trade with funds you can afford to lose.
        </p>         
      </div>`;
  console.log(token);

  try {
    let updtaedObject = {};
    let checkUser = await tokenScehmaUser.findOne({ email: user.email });
    console.log(checkUser);
    if (checkUser) {
      console.log("in if");
      updtaedObject["metaData"] = {
        password: checkUser.metaData[0].password,
        email: user.email,
      };
      updtaedObject["productId"] = checkUser.productId;
      updtaedObject["planId"] = checkUser.planId;
      updtaedObject["istokenExpired"] = false;
      updtaedObject["EmailVerificationToken"] = token;

      console.log("updtaedObject", updtaedObject);
      let updateUserRes = await tokenScehmaUser.findOneAndUpdate(
        { email: user.email },
        {
          $set: updtaedObject,
          new: true,
        }
      );
      console.log("updateUserRes", updateUserRes);
      console.log("updateUserRes", updateUserRes.length);
      if (updateUserRes) {
        console.log("result from email sent before");
        let result = EmailSent(
          "Verify your email address",
          user.email,
          emailcontent
        );
        console.log("email sent");
        if (result) {
          console.log("Email Sent Successfully");
          return res.send(RESTRESPONSE(true, "Email Sent Successfully", {}));
        } else {
          console.log("Something went wrong kindly try again");
          return res.send(
            RESTRESPONSE(false, "Something went wrong kindly try again", {})
          );
        }
      } else {
        console.log("Something went wrong kindly try again");

        return res.send(
          RESTRESPONSE(false, "Something went wrong kindly try again", {})
        );
      }
    }
  } catch (e) {
    console.log(e);
    return res.send(RESTRESPONSE(false, "server side error", {}));
  }
};

const notifyEmail = async (req, res) => {
  let { isNotifyEmail } = req.body;
  console.log(isNotifyEmail);

  let user = req.user;
  let id = user.id;
  let result = await UserSchema.findByIdAndUpdate(id, {
    $set: { isNotifyEmail: isNotifyEmail },
  });
  return res.send(
    RESTRESPONSE(
      true,
      isNotifyEmail ? "Notification On" : "Notification Off",
      {}
    )
  );
};
const changePassword = async (req, res) => {
  console.log(req.body);
  let user = req.user;
  // console.log(userfromToken);
  let email = user.email;
  // let user = await UserSchema.findOne({email:email})
  // console.log("userData====>", user);
  let { password, currentpassword } = req.body;
  if (user) {
    let currentpasswordSame = await bycrypt.compare(
      currentpassword,
      user.password
    );
    if (!currentpasswordSame) {
      return res.send(RESTRESPONSE(false, "Invalid Current Password", {}));
    } else {
      let passwordSame = await bycrypt.compare(password, user.password);
      if (passwordSame) {
        return res.send(
          RESTRESPONSE(false, "Password not be same as previous one", {})
        );
      } else {
        password = await bycrypt.hash(password, 10);
        let updated = await UserSchema.findOneAndUpdate(
          { email: email },
          { $set: { password: password } }
        );
        return res.send(
          RESTRESPONSE(true, "Password updated successfully", {})
        );
      }
    }
  } else {
    return res.send(RESTRESPONSE(false, "User not found", {}));
  }
};
const updateUserInfo = async (req, res) => {
  let userfromToken = req.user;
  console.log(req.body);

  let { password, currentpassword, firstName, lastName, phone } = req.body;

  let user = await UserSchema.findOne({ _id: userfromToken.id });
  let updatedObject = {};
  updatedObject["firstName"] = firstName;
  updatedObject["lastName"] = lastName;
  updatedObject["phone"] = phone;

  console.log(user);
  if (password && currentpassword) {
    let currentpasswordSame = await bycrypt.compare(
      currentpassword,
      user.password
    );
    if (!currentpasswordSame) {
      return res.send(RESTRESPONSE(false, "Invalid Current Password", {}));
    } else {
      let passwordSame = await bycrypt.compare(password, user.password);
      if (passwordSame) {
        return res.send(
          RESTRESPONSE(false, "Password not be same as previous one", {})
        );
      } else {
        password = await bycrypt.hash(password, 10);
        updatedObject["password"] = password;
        let updated = await UserSchema.findOneAndUpdate(
          { _id: userfromToken.id },
          {
            $set: updatedObject,
            new: true,
          }
        );
        return res.send(RESTRESPONSE(true, "Updated Successfully", {}));
      }
    }
  } else {
    console.log("in else");
    let updated = await UserSchema.findOneAndUpdate(
      { _id: userfromToken.id },
      {
        $set: updatedObject,
        new: true,
      }
    );
    return res.send(RESTRESPONSE(true, "Updated Successfully", {}));
  }

  // let updated = await UserSchema.findOneAndUpdate(
  //   { _id: userfromToken.id },
  //   {
  //     $set: {firstName:},

  //   }
  // );
  // if (updated) {
  //   return res.send(RESTRESPONSE(true, "updated successfully", {}));
  // } else {
  //   return res.send(RESTRESPONSE(false, "User not found", {}));
  // }
  // let user = await UserSchema.findOne({email:userfromToken.email})
};

const updatePhone = async (req, res) => {
  const user = req.user;
  const id = user.id;
  const { countryCode, phoneNumber, otp, phoneCountry } = req.body;
  try {
    const response = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `${countryCode}${phoneNumber}`,
        code: otp,
      });
    console.log("response", response);
    if (response?.status == "approved") {
      if (user) {
        let updated = await UserSchema.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              phone: phoneNumber,
              countryCode: countryCode,
              phoneCountry: phoneCountry,
            },
          }
        );
        if (updated) {
          return res
            .status(200)
            .send({ success: true, message: "Verified code" });
        }
      }
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Verification failed" });
    }
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};
const verifyPassword = async (req, res) => {
  const user = req.user;
  const password = req.body.password;
  let result = await verifyPasswordService(password, user.id);
  if (result.find) {
    return res.send(RESTRESPONSE(true, "Password Verfied", {}));
  } else {
    return res.send(RESTRESPONSE(false, "Incorrect Password", {}));
  }
};
const sendEmailToChangeEmail = async (req, res) => {
  const user = req.user;
  const email = req.body.email;
  let result = await getVerficationCode(email, user.id);
  if (result.find) {
    return res.send(RESTRESPONSE(true, result?.message, {}));
  } else {
    return res.send(RESTRESPONSE(false, result?.message, {}));
  }
};
const verifyChangeEmailCode = async (req, res) => {
  const user = req.user;
  const code = req.body.code;
  const email = req.body.email;
  let result = await verifyCode(user.id, code, email, user.customerId);
  if (result?.find) {
    return res.send(RESTRESPONSE(true, result?.message, {}));
  } else {
    return res.send(RESTRESPONSE(false, result?.message, {}));
  }
};
const Enable2FA = async (req, res) => {
  const Enable2FABy = req.body;
  console.log(Enable2FABy);
  const user = req.user;
  let obj = [{
    isEnabled: true,
    two_FA_by: Enable2FABy.Enable2FABy
  }]

  try {
    const update = await UserSchema.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          two_FA: obj
        },
      },

    );
    console.log("update===>", update);

    if (update) {
      return res.send(RESTRESPONSE(true, "2FA enabled successfully", {}));
    } else {
      return res.send(
        RESTRESPONSE(false, "Something went wrong please try again later", {})
      );
    }
  } catch (e) {
    console.log(e);
    return res.send(RESTRESPONSE(false, "Server Error", {}));
  }
};
const Disabled2FA = async (req, res) => {
  // const Enable2FABy = req.body;
  const user = req.user;
  try {
    let update = await UserSchema.findByIdAndUpdate(
      { _id: user.id },
      {
        $set: {
          "two_FA.$[elem].isEnabled": false,

        },

      },
      { arrayFilters: [{ "elem.isEnabled": true }], new: false }
    );
    if (update) {
      return res.send(RESTRESPONSE(true, "2FA enabled successfully", {}));
    } else {
      return res.send(
        RESTRESPONSE(false, "Something went wrong please try again later", {})
      );
    }
  } catch (e) {
    console.log(e)
    return res.send(RESTRESPONSE(false, "Server Error", {}));
  }
};
const SendCodeByEmail = async (user, token) => {
  let code = generateSixDigitCode();
  // let saved = SaveCodeInDB(user.id="64674df0ee61e5a5d4b7e8c4",code,user.email="adil.rajput@dimensionalsys.com",'2FA_Code');
  let saved = SaveCodeInDB(user.id, code, user.email, "2FA_Code", token);
  const obj = {
    username: user?.firstName,
    paragraph: `Thank you for using Two-Factor Authentication (2FA) to secure your account. Here is your verification code: (${code}). Please enter this code in the appropriate field to complete the login process. Note that the code is time-sensitive and will expire in 5 minutes. If you did not attempt to log in or initiate this 2FA code, please disregard this email and ensure the security of your account. If you have any questions or need further assistance, please contact our support team.`,
    btnName: "RESET YOUR PASSWORD",
    btnLink: `${process.env.LINK_EMAIL}/resetpassword?Token=${token}`,
    isHideBtn: true
  }
  // let emailContentType = "2FA_content";
  // let dynamicContent = {
  //   code: code,
  //   username: user.firstName,
  // };
  // let EmailContent = await makeEmailContent(emailContentType, dynamicContent);
  let htmlCon = userStoryEmailContent(obj)

  let sent = EmailSent(
    "Your Two-Factor Authentication Code",
    user.email,
    htmlCon
  );
  if (sent) {
    return true;
  }
};
const verifyCodeOf2FA = async (req, res) => {
  try {
    let { token, code } = req.body;
    let decoded = jwt.decode(token);
    console.log(decoded);
    let result = await UserSchema.findOne({ email: decoded.user.email });
    const user = {
      email: decoded.user.email,
      customerId: result.customerId,
      userId: result._id,
      product: result.productId,
      planId: result.planId,
    };

    const Logintoken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    if (decoded.user?.twoFa?.two_FA_by === "email") {
      let checkExpiry = await checkExpiryOfCode(
        decoded.user.id,
        code,
        decoded.user.email,
        (codeType = "2FA_Code")
      );
      if (checkExpiry) {
        console.log(result);
        if (result) {
          return res.send(
            RESTRESPONSE(true, "User has logged in successfully!", {
              token: Logintoken,
              email: result.email,
              username: result.username,
              emailVerification: result?.emailVerification,
              phoneVerification: result?.phoneVerification,
              personalInfo: result?.personalInfo,
              expireToken: result.expireToken,
              phone: result.phone,
              planId: result.planId,
              subscrbtionId: result.subscrbtionId,
              termsAndCondition: result.termsAndCondition,
              // subscribtionStatus: subsrcibtion.status,
              cardInfo: result.cardInfo,
              userId: user.userId,
              productId: result.productId,
              varientForMarketWatch: result.varientForMarketWatch,
              dataStreamCountry: result.dataStreamCountry,
              watchListColumns: result.watchlistColumns,
              watchListDropDown: result.watchListDropDown,
              indexData: result.IndexData,
              country: result.userCountry,
              ...GetRoleData(result.productId),
            })
          );
        } else {
          return res.send(RESTRESPONSE(false, "Code verification failed", {}));
        }
      } else {
        return res.send(RESTRESPONSE(false, "Code verification failed", {}));
      }
    } else {
      let checkExpiry = await verifyOtp(result.countryCode, result.phone, code);
      console.log("checkExpiry", checkExpiry)


      if (checkExpiry) {
        return res.send(
          RESTRESPONSE(true, "User has logged in successfully!", {
            token: Logintoken,
            email: result.email,
            username: result.username,
            emailVerification: result?.emailVerification,
            phoneVerification: result?.phoneVerification,
            personalInfo: result?.personalInfo,
            expireToken: result.expireToken,
            phone: result.phone,
            planId: result.planId,
            subscrbtionId: result.subscrbtionId,
            termsAndCondition: result.termsAndCondition,
            // subscribtionStatus: subsrcibtion.status,
            cardInfo: result.cardInfo,
            userId: user.userId,
            productId: result.productId,
            varientForMarketWatch: result.varientForMarketWatch,
            dataStreamCountry: result.dataStreamCountry,
            watchListColumns: result.watchlistColumns,
            watchListDropDown: result.watchListDropDown,
            indexData: result.IndexData,
            country: result.userCountry,
            ...GetRoleData(result.productId),
          })
        );

      }
      else {
        return res.send(RESTRESPONSE(false, "Code verification failed", {}));

      }
      //phone verification service
    }
  } catch (e) {
    console.log(e)
    return res.send(RESTRESPONSE(false, "Code verification failed", {}));
  }
};

module.exports = {
  verifyChangeEmailCode,
  updatePhone,
  CreateUser,
  DeleteUser,
  LoginUser,
  ForgetPAssword,
  NewPass,
  GetUser,
  UpdateUser,
  Recaptch,
  linkExpireChecker,
  InitialSignUp,
  sentverificationEmailAgain,
  verifyUserToken,
  userFurtherDetails,
  notifyEmail,
  changePassword,
  updateUserInfo,
  MisssentverificationEmailAgain,
  verifyPassword,
  sendEmailToChangeEmail,
  Enable2FA,
  Disabled2FA,
  verifyCodeOf2FA

};
