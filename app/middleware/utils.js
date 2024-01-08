/**
 * Author:          Andy Jones - Department for Education
 * Description:     Utility functions for the service
 * GitHub Issue:
 */

const NotifyClient = require('notifications-node-client').NotifyClient
const notify = new NotifyClient(process.env.notifyKey)

/**
 * Validate email address using regex
 * @param {string} email - email address to validate
 * @returns {boolean} - true if email is valid
 */
function validateEmail(email) {
  var regex = /\S+@\S+\.\S+/;
  return regex.test(email) === true ? true : false;
}


/**
 * Send email using Notify
 * @param {string} template - template ID from Notify
 * @param {string} recipient - email address of recipient
 * @param {object} templateParams - template parameters
 * @returns {boolean} - true if email is sent, false if errors
 * Guidance: https://docs.notifications.service.gov.uk/node.html#send-an-email
 */
function sendNotifyEmail(template, recipient, templateParams) {
  return notify
    .sendEmail(template, recipient, {
      personalisation: templateParams
    })
    .then((response) => true)
    .catch((err) => {
      console.error("Error sending email:", err.message);
      if (err.response) {
        console.log("Response status:", err.response.status);
        console.log("Response headers:", err.response.headers);
        console.log("Response data:", err.response.data);
      }
      return false;
    });
}


function isValidGuid(uuid) {
  const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexExp.test(uuid);
}


module.exports = {
  validateEmail, sendNotifyEmail, wait, isValidGuid
};