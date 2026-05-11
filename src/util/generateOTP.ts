import { randomInt } from 'crypto';

const generateOTP = () => {
  const otp = randomInt(1000, 10000).toString();
  return otp.padStart(4, '0');
};

export default generateOTP;
