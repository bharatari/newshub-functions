const SENDGRID_KEY = process.env.SENDGRID_KEY;
const client = require('sendgrid')(SENDGRID_KEY);
const helper = require('sendgrid').mail;
const async = require('async');

function sendEmail(to, subject, body, template) {
    return new Promise((resolve, reject) => {
      const fromEmail = new helper.Email('web@utdmercury.com');
      const toEmail = new helper.Email(to);
      const content = new helper.Content('text/html', body);
      const mail = new helper.Mail();

      mail.setSubject(subject);
      mail.addContent(content);
      mail.setFrom(fromEmail);
      mail.setTemplateId(template);

      const personalization = new helper.Personalization();
      personalization.addTo(toEmail);
      mail.addPersonalization(personalization);

      const request = client.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON()
      });

      client.API(request, (error, response) => {
        if (error) {
            reject(error)
        } else {
            resolve(response);
        }
      });
    });
}

module.exports = function (context, message) {
    if (message) {
        if (message.environment === "production") {
            async.each(message.users, (user, callback) => {
                sendEmail(user.email, message.subject, message.body, message.template)
                    .then(() => {
                        callback();
                    })
                    .catch((e) => {
                        callback();
                    });
            }, (err) => {
                context.log('JavaScript queue trigger function processed work item');
                
                context.done();
            });
        } else {
            context.log('Job received');
        }
        
    } else {
        context.done();
    }
};
