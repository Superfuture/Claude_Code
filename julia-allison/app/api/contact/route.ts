import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  opportunityType: z.enum([
    "Speaking Engagement",
    "Media Interview",
    "Consulting",
    "Brand Partnership",
    "Other",
  ]),
  message: z.string().min(10, "Please provide a bit more detail").max(2000),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, opportunityType, message } = result.data;

    await resend.emails.send({
      from: "juliaallison.com <hello@juliaallison.com>",
      to: process.env.CONTACT_EMAIL ?? "julia@juliaallison.com",
      replyTo: email,
      subject: `New inquiry: ${opportunityType} — ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111;">
          <div style="border-top: 3px solid transparent; border-image: linear-gradient(135deg, #1FB6BF, #6B8CFF, #C47BF4, #FF7BAC) 1; margin-bottom: 32px;"></div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">New Inquiry</h1>
          <p style="font-size: 14px; color: #8A8A8A; margin: 0 0 32px;">via juliaallison.com</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #8A8A8A; width: 140px; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #8A8A8A; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px;"><a href="mailto:${email}" style="color: #1FB6BF;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #8A8A8A; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Opportunity</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px;">${opportunityType}</td>
            </tr>
          </table>

          <div style="margin-top: 24px;">
            <p style="font-size: 13px; color: #8A8A8A; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Message</p>
            <p style="font-size: 16px; line-height: 1.7; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
