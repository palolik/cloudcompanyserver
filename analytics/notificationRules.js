// CC Events notification rules for Cloud Company, imported into the portal by
// scripts/importCcEventsRules.js. Rules are matched by name, so renaming one
// here creates a new rule instead of updating the old one.
//
// Only events Cloud Company doesn't already notify about in code: order and
// task status changes, chat, new tasks and password reset OTPs are sent by
// the server itself, and a rule for them would send the user a second message.
//
// Messages are plain text; /events/deliver wraps them in the standard email
// layout (blank line = new paragraph, "- " lines = list). {{user.*}} comes
// from the identify traits in eventRules.js, other placeholders from the
// event's properties. No url means a button to the user's profile page.

const email = (name, trigger, template, extra = {}) => ({ name, trigger, channel: 'email', template, ...extra });

module.exports = [
  email('Welcome: new client', { type: 'event', event: 'client_registered' }, {
    subject: 'Welcome to Cloud Company',
    title: 'Welcome to Cloud Company, {{user.name | there}}!',
    body: `Thanks for creating your account. You can now order any of our packages or ask for a custom one built around your project.

- Browse packages and place an order
- Pay once to start the work; our team picks it up right away
- Chat with the team and follow progress from your profile

If you need anything, just reply to this email.`,
  }),

  email('Welcome: new employee', { type: 'event', event: 'employee_registered' }, {
    subject: 'Welcome to the Cloud Company team',
    title: 'Welcome aboard, {{user.name | there}}!',
    body: `Your employee account is ready.

To start getting tasks, complete your profile: add your photo, department, skills and payment details. Once it's complete you'll see open tasks for your department and get notified when new ones are posted.`,
  }),

  email('Order received', { type: 'event', event: 'order_placed' }, {
    subject: 'We received your order: {{packageName | your package}}',
    title: 'Order received',
    body: `Hi {{user.name | there}}, thanks for your order.

- Package: {{packageName | —}}
- Project: {{projectTitle | —}}
- Price: BDT {{price | to be confirmed}}

The next step is payment. Once it's confirmed, our team starts working and you can follow every step from your profile.`,
  }),

  email('Payment submitted', { type: 'event', event: 'payment_submitted' }, {
    subject: 'We got your payment details',
    title: 'Payment details received',
    body: `Hi {{user.name | there}}, thanks for submitting your payment ({{paymentMethod | payment}}).

Our team is verifying it now. You'll get another email as soon as it's confirmed and work on your project begins.`,
  }),

  email('Custom request received', { type: 'event', event: 'custom_package_requested' }, {
    subject: 'Your custom package request is in',
    title: 'Custom request received',
    body: `Hi {{user.name | there}}, we received your custom package request for "{{projectTitle | your project}}".

Our team will review the details and get back to you with a plan and price. You can follow the request from your profile.`,
  }),

  email('Thanks for the feedback', { type: 'event', event: 'feedback_submitted' }, {
    subject: 'Thank you for your feedback',
    title: 'Thank you, {{user.name | there}}!',
    body: `We read every piece of feedback and use it to improve how we work.

Thanks for working with Cloud Company. We hope to build your next project too.`,
  }),

  email('Security: password changed', { type: 'event', event: 'password_changed' }, {
    subject: 'Your Cloud Company password was changed',
    title: 'Your password was changed',
    body: `Hi {{user.name | there}}, the password for your Cloud Company account was just changed.

If this was you, there's nothing else to do. If it wasn't, reset your password right away and contact us at support@cloudcompany.cc.`,
  }),

  email('Task deadline missed', { type: 'event', event: 'task_time_ran_out' }, {
    subject: 'Time ran out on "{{taskName | your task}}"',
    title: 'Task deadline missed',
    body: `Hi {{user.name | there}}, the time for "{{taskName | your task}}" has run out.

Please contact your team lead about what to do next. Missed deadlines can affect the tasks you're offered later.`,
  }),

  email('Reminder: unpaid order', { type: 'schedule', cron: '0 10 * * *' }, {
    subject: 'Your order is waiting for payment',
    title: 'Ready to start your project?',
    body: `Hi {{user.name | there}}, you placed an order with us but we haven't received the payment yet.

As soon as it's paid, our team starts working on it. If you have questions about the package or payment methods, just reply to this email.`,
  }, {
    audience: {
      userTypes: ['client'],
      didEvent: { event: 'order_placed', withinDays: 3 },
      didNotEvent: { event: 'order_paid', withinDays: 3 },
    },
    cooldownHours: 72,
  }),

  email('Come back: inactive client', { type: 'inactivity', inactivityDays: 30 }, {
    subject: 'We miss you at Cloud Company',
    title: "It's been a while, {{user.name | there}}",
    body: `We've added new packages since your last visit.

Have a new project in mind? Order a package or ask for a custom one, and our team will take it from there.`,
  }, {
    audience: { userTypes: ['client'] },
  }),
];
