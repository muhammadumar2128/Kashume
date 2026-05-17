import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order, type } = req.body;

    if (type === 'order_confirmation') {
      const { customer_email, customer_name, id, total, shipping_address, items, phone, payment_method, promo_applied, subtotal, shipping, discountAmount } = order;
      const orderIdShort = id.slice(0, 8);

      // --- CUSTOMER EMAIL TEMPLATE (LUXURY) ---
      const customerEmailHtml = `
        <div style="background-color: #faf9f6; padding: 40px 20px; font-family: 'Times New Roman', Times, serif; color: #1a1a1a;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f5f2ed; padding: 50px; shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; font-style: italic; font-weight: normal; letter-spacing: 0.1em; color: #c5a059; margin: 0;">Kashume</h1>
              <p style="text-transform: uppercase; letter-spacing: 0.4em; font-size: 10px; color: #999; margin-top: 10px;">House of Luxury Perfumes</p>
            </div>

            <!-- Intro -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-size: 24px; font-weight: normal; font-style: italic; color: #1a1a1a; margin-bottom: 15px;">Gratitude.</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #444; margin: 0;">
                Dear ${customer_name}, your essence has been reserved. Our master distillers are now preparing your selection for its journey.
              </p>
            </div>

            <!-- Order Details -->
            <div style="border-top: 1px solid #f5f2ed; border-bottom: 1px solid #f5f2ed; padding: 30px 0; margin-bottom: 40px;">
              <h3 style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: #c5a059; margin-bottom: 20px; text-align: center;">Your Selection — #${orderIdShort}</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.values(items).map(item => `
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid #fcfcfc;">
                      <p style="margin: 0; font-size: 15px; font-style: italic; font-weight: bold;">${item.name}</p>
                      <p style="margin: 0; font-size: 12px; color: #888;">Quantity: ${item.quantity}</p>
                    </td>
                    <td style="padding: 15px 0; border-bottom: 1px solid #fcfcfc; text-align: right; vertical-align: top;">
                      <p style="margin: 0; font-size: 15px; font-weight: bold;">Rs. ${item.price * item.quantity}</p>
                    </td>
                  </tr>
                `).join('')}
              </table>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #f5f2ed;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666;">
                  <span style="display: inline-block; width: 50%;">Subtotal</span>
                  <span style="display: inline-block; width: 50%; text-align: right;">Rs. ${subtotal || total}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666;">
                  <span style="display: inline-block; width: 50%;">Shipping Protocol</span>
                  <span style="display: inline-block; width: 50%; text-align: right; color: ${shipping === 0 ? '#c5a059' : '#666'};">
                    ${shipping === 0 ? 'Complimentary' : `Rs. ${shipping}`}
                  </span>
                </div>
                ${discountAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #c5a059; font-style: italic;">
                    <span style="display: inline-block; width: 50%;">Token Applied (${promo_applied})</span>
                    <span style="display: inline-block; width: 50%; text-align: right;">- Rs. ${discountAmount}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 22px; font-style: italic; font-weight: bold; color: #1a1a1a; border-top: 1px solid #f5f2ed; padding-top: 20px;">
                  <span style="display: inline-block; width: 50%;">Final Value</span>
                  <span style="display: inline-block; width: 50%; text-align: right;">Rs. ${total}</span>
                </div>
              </div>
            </div>

            <!-- Logistics -->
            <table style="width: 100%; margin-bottom: 40px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                  <h4 style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; color: #c5a059; margin-bottom: 10px;">Sanctum Address</h4>
                  <p style="font-size: 13px; line-height: 1.5; color: #666; margin: 0;">${shipping_address}</p>
                </td>
                <td style="width: 50%; vertical-align: top;">
                  <h4 style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; color: #c5a059; margin-bottom: 10px;">Contact Frequency</h4>
                  <p style="font-size: 13px; line-height: 1.5; color: #666; margin: 0;">${phone}</p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #f5f2ed; padding-top: 40px;">
              <p style="font-size: 12px; font-style: italic; color: #888; line-height: 1.6; margin-bottom: 25px;">
                "Perfume is the art that makes memory speak." — Our distillations are encased in signature Kashume archives to ensure absolute integrity.
              </p>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #999;">
                &copy; 2024 Kashume &bull; Karachi, Pakistan
              </div>
            </div>
          </div>
        </div>
      `;

      // --- ADMIN EMAIL TEMPLATE (DETAILED) ---
      const adminEmailHtml = `
        <div style="background-color: #f4f4f4; padding: 20px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-left: 5px solid #c5a059;">
            <h2 style="color: #1a1a1a; margin-top: 0;">New Scent Reservation Received</h2>
            <p style="color: #666; font-size: 14px;">Order Reference: <strong>#${id}</strong></p>
            
            <div style="margin: 25px 0; background-color: #fafafa; padding: 20px; border-radius: 5px;">
              <h3 style="font-size: 16px; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Client Profile</h3>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Name:</strong> ${customer_name}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Email:</strong> ${customer_email}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Method:</strong> ${payment_method}</p>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="font-size: 16px; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Destination</h3>
              <p style="font-size: 14px; line-height: 1.5; color: #444;">${shipping_address}</p>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="font-size: 16px; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Inventory</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${Object.values(items).map(item => `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px;">
                      <strong>${item.name}</strong><br>
                      <span style="color: #888;">Qty: ${item.quantity}</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f9f9f9; text-align: right; font-size: 14px;">
                      Rs. ${item.price * item.quantity}
                    </td>
                  </tr>
                `).join('')}
                <tr>
                  <td style="padding-top: 20px; font-size: 16px; font-weight: bold;">Final Value</td>
                  <td style="padding-top: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #c5a059;">Rs. ${total}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="https://kashume.com/admin" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 25px; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 3px;">Open Admin Dashboard</a>
            </div>
          </div>
        </div>
      `;

      // Email to Customer
      const customerEmail = await resend.emails.send({
        from: 'Kashume <orders@kashume.com>',
        to: [customer_email],
        subject: `Your Olfactory Selection: Order #${orderIdShort}`,
        html: customerEmailHtml
      });

      // Email to Owner
      const ownerEmail = await resend.emails.send({
        from: 'Kashume System <system@kashume.com>',
        to: ['hellokashume@gmail.com'],
        subject: `New Scent Reservation: Order #${orderIdShort}`,
        html: adminEmailHtml
      });

      return res.status(200).json({ customerEmail, ownerEmail });
    }

    if (type === 'order_status_update') {
      const { customer_email, customer_name, id, status } = order;
      const orderIdShort = id.slice(0, 8);

      const statusMessages = {
        shipped: "Your essence is in transit. It has been dispatched and is making its way to your sanctum.",
        delivered: "Your olfactory journey has reached its destination. We hope the essence enchants you.",
        cancelled: "We regret to inform you that your order has been cancelled."
      };

      const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

      const emailResponse = await resend.emails.send({
        from: 'Kashume <concierge@kashume.com>',
        to: [customer_email],
        subject: `Update on Your Selection: Order #${orderIdShort}`,
        html: `
          <div style="font-family: 'Times New Roman', Times, serif; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #f5f2ed; padding: 40px; background-color: #faf9f6;">
            <h1 style="font-style: italic; font-weight: normal; text-align: center; color: #c5a059;">Status Update.</h1>
            <p style="text-align: center; text-transform: uppercase; letter-spacing: 0.3em; font-size: 10px; color: #666; margin-bottom: 40px;">Order #${orderIdShort}</p>
            
            <p>Dear ${customer_name},</p>
            <p>${message}</p>
            
            <p style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">
              &copy; 2024 Kashume Luxury Perfumes
            </p>
          </div>
        `
      });

      return res.status(200).json({ emailResponse });
    }

    return res.status(400).json({ error: 'Unsupported email type' });

  } catch (error) {
    console.error('Email Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
