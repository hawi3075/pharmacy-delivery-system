import nodemailer from 'nodemailer';

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP is not configured');
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
}

export async function sendOrderStatusEmail(order) {
  if (!order.customer?.email) return;
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: order.customer.email,
    subject: `Order ${order.code} status update`,
    text: `Hello ${order.customer.name},\n\nYour order ${order.code} is now ${order.status.replaceAll('_', ' ').toLowerCase()}.\n\nThank you,\nGugudo Pharmacy`,
  });
}
