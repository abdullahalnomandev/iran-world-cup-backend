import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'Verify your account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Verify Account</title>
</head>

<body style="margin:0; padding:0; background:#0b0b0f; font-family: Arial, sans-serif;">

  <div style="max-width:420px; margin:40px auto; padding:20px;">
    
    <!-- Logo -->
    <div style="text-align:center; margin-bottom:20px;">
      <h1 style="color:#fff; letter-spacing:6px; font-weight:800;">
        <span style="color:#ff2c2c;">F</span>N<span style="color:#ff2c2c;">Z</span>N
      </h1>
    </div>

    <!-- Card -->
    <div style="
      background: rgba(255,255,255,0.05);
      border-radius:16px;
      padding:28px 22px;
      text-align:center;
      border:1px solid rgba(255,255,255,0.08);
    ">

      <h2 style="color:#fff; margin-bottom:10px;">Verify OTP</h2>

      <p style="color:#aaa; font-size:14px; margin-bottom:25px;">
        Enter the code sent to your email
      </p>

      <!-- OTP -->
      <div style="
        background:#111;
        border-radius:10px;
        padding:16px;
        font-size:26px;
        letter-spacing:10px;
        color:#fff;
        font-weight:bold;
        margin-bottom:20px;
      ">
        ${values.otp}
      </div>

      <!-- Expire -->
      <p style="color:#ff4d4d; font-size:13px; margin-bottom:20px;">
        Expires in 3 minutes
      </p>

      <p style="color:#777; font-size:12px;">
        Didn’t request this? Ignore this email.
      </p>

    </div>
  </div>

</body>
</html>
`,
  };
};
const resetPassWord = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'Reset Password OTP',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Reset Password</title>
</head>

<body style="margin:0; padding:0; background:#0b0b0f; font-family: Arial, sans-serif;">

  <div style="max-width:420px; margin:40px auto; padding:20px;">
    
    <!-- Logo -->
    <div style="text-align:center; margin-bottom:20px;">
      <h1 style="color:#fff; letter-spacing:6px; font-weight:800;">
        <span style="color:#ff2c2c;">F</span>N<span style="color:#ff2c2c;">Z</span>N
      </h1>
    </div>

    <!-- Card -->
    <div style="
      background: rgba(255,255,255,0.05);
      border-radius:16px;
      padding:28px 22px;
      text-align:center;
      border:1px solid rgba(255,255,255,0.08);
    ">

      <h2 style="color:#fff;">Reset Password</h2>

      <p style="color:#aaa; font-size:14px; margin:15px 0;">
        Hi ${values?.name?.split(' ')[0] || ''},
      </p>

      <p style="color:#aaa; font-size:14px; margin-bottom:25px;">
        Use the code below to reset your password
      </p>

      <!-- OTP -->
      <div style="
        background:#111;
        border-radius:10px;
        padding:16px;
        font-size:26px;
        letter-spacing:10px;
        color:#fff;
        font-weight:bold;
        margin-bottom:20px;
      ">
        ${values.otp}
      </div>

      <p style="color:#ff4d4d; font-size:13px;">
        Expires in 3 minutes
      </p>

    </div>
  </div>

</body>
</html>
`,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassWord,
};
