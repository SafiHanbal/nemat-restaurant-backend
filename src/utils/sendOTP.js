import twilio from 'twilio';

const sendOTP = async (phone, OTP) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  const message = await client.messages.create({
    body: `OTP to reset password is ${OTP}`,
    from: '+13613092598',
    to: `+91${phone}`,
  });

  return message;
};

export default sendOTP;
