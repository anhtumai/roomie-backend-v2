const axios = require("axios");

exports.onExecutePostLogin = async (event, api) => {
  const url = event.secrets.USER_CREATION_HANDLER_URL || "";
  try {
    const result = await axios.post(url, {
      user: event.user,
    });
  } catch (error) {}
};
