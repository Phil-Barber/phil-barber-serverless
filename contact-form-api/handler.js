const aws = require("aws-sdk");
const ses = new aws.SES();
const myEmail = process.env.EMAIL;
const myDomain = process.env.DOMAIN;

const RESPONSE_HEADERS = {
  "Access-Control-Allow-Origin": myDomain,
  "Access-Control-Allow-Headers": "x-requested-with",
  "Access-Control-Allow-Credentials": true,
};

function generateResponse(code, payload) {
  return {
    statusCode: code,
    headers: RESPONSE_HEADERS,
    body: JSON.stringify(payload),
  };
}

function generateError(code, err) {
  console.log(err);
  return {
    statusCode: code,
    headers: RESPONSE_HEADERS,
    body: JSON.stringify(err.message),
  };
}

function generateEmailParams(requestBody) {
  const { email, name, body, company } = JSON.parse(requestBody);
  console.log(email, name, body, company);
  if (!(email && name && body)) {
    throw new Error(
      "Missing parameters! Make sure to add parameters 'email', 'name', 'body'."
    );
  }

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Message sent from email ${email} by ${name}, company ${company} \nContent: ${body}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `You received a message from ${myDomain}!`,
      },
    },
  };
}

module.exports.send = async (event) => {
  try {
    const emailParams = generateEmailParams(event.body);
    const data = await ses.sendEmail(emailParams).promise();
    return generateResponse(200, data);
  } catch (err) {
    return generateError(500, err);
  }
};
