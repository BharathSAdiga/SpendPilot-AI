import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface AuditEmailProps {
  email: string;
  companyName: string;
  totalSavingsUsd: number;
  reportUrl: string;
  score: number;
}

export async function sendAuditReportEmail(props: AuditEmailProps) {
  if (!resend) {
    console.warn("[resend] RESEND_API_KEY is not configured. Email not sent.");
    return { success: false, error: "Resend not configured" };
  }

  const { email, companyName, totalSavingsUsd, reportUrl, score } = props;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your SpendPilot Audit Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-w-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h1 { color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        p { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .stats { background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center; }
        .savings { color: #10b981; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .score { color: #3b82f6; font-size: 20px; font-weight: 600; }
        .btn { display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 32px; }
        .cta { border-top: 1px solid #e5e7eb; padding-top: 32px; margin-top: 32px; }
        .cta h2 { color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
        .cta-btn { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; }
        .footer { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your SpendPilot Audit is Ready</h1>
        <p>Hi there,</p>
        <p>We've completed the AI spend audit for <strong>${companyName}</strong>. Our engine analysed your tool stack and found significant opportunities to optimise your subscriptions.</p>
        
        <div class="stats">
          <div class="savings">$${totalSavingsUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</div>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Potential Monthly Savings</p>
          <div class="score">Efficiency Score: ${score}/100</div>
        </div>

        <div style="text-align: center;">
          <a href="${reportUrl}" class="btn">View Full Report</a>
        </div>

        <div class="cta">
          <h2>Need help executing these changes?</h2>
          <p>Our experts can help you renegotiate enterprise contracts, consolidate overlapping tools, and implement the recommended savings immediately.</p>
          <a href="https://spendpilot.ai/book" class="cta-btn">Book a Free Consultation</a>
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} SpendPilot AI. All rights reserved.
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "SpendPilot <audit@spendpilot.ai>",
      to: email,
      subject: `Your SaaS Audit Results: $${totalSavingsUsd.toLocaleString('en-US')} in Potential Savings`,
      html: html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[resend] Failed to send email:", error);
    return { success: false, error };
  }
}
