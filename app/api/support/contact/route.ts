import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils/apiHelpers";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { email, subject, message } = await req.json();

        // Validation
        if (!email || !subject || !message) {
            return createErrorResponse("Wszystkie pola są wymagane", 400);
        }

        if (!email.includes("@")) {
            return createErrorResponse("Nieprawidłowy adres email", 400);
        }

        if (subject.length < 3) {
            return createErrorResponse("Temat musi mieć minimum 3 znaki", 400);
        }

        if (message.length < 10) {
            return createErrorResponse(
                "Wiadomość musi mieć minimum 10 znaków",
                400
            );
        }

        // Get metadata for email
        const userAgent = req.headers.get("user-agent") || "Unknown";
        const referer = req.headers.get("referer") || "Direct";

        // Send email to support using nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        try {
            await transporter.sendMail({
                from: `"Seovileo Support" <${process.env.SMTP_USER}>`,
                to: "seovileo@gmail.com",
                replyTo: email,
                subject: `[Kontakt] ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f7fa; padding: 40px 0;">
                        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                            <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
                                <h1 style="margin: 0; font-size: 20px;">📧 Nowa wiadomość z formularza kontaktowego</h1>
                            </div>
                            
                            <div style="padding: 30px; color: #333;">
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 10px 0;"><strong>Od:</strong> ${email}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>Temat:</strong> ${subject}</p>
                                    <p style="margin: 0;"><strong>Data:</strong> ${new Date().toLocaleString(
                                        "pl-PL"
                                    )}</p>
                                </div>

                                <div style="background: white; padding: 20px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
                                    <h3 style="margin-top: 0; color: #555;">Wiadomość:</h3>
                                    <p style="white-space: pre-wrap; color: #333; line-height: 1.6; margin: 0;">${message}</p>
                                </div>

                                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
                                    <p style="margin: 5px 0;"><strong>User Agent:</strong> ${userAgent}</p>
                                    <p style="margin: 5px 0;"><strong>Referer:</strong> ${referer}</p>
                                </div>

                                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                                <p style="color: #666; font-size: 12px; margin: 0;">
                                    💡 Odpowiedz bezpośrednio na ten email aby skontaktować się z użytkownikiem.
                                </p>
                            </div>
                        </div>
                        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
                            © ${new Date().getFullYear()} Seovileo
                        </p>
                    </div>
                `,
            });

            console.log("✅ Email sent successfully to seovileo@gmail.com");
            console.log("From:", email, "| Subject:", subject);
        } catch (emailError: any) {
            console.error("❌ Failed to send email:", emailError);
            throw new Error("Nie udało się wysłać wiadomości email");
        }

        return NextResponse.json({
            ok: true,
            message: "Wiadomość została wysłana",
        });
    } catch (error: any) {
        console.error("Contact form error:", error);
        return createErrorResponse(
            error.message || "Błąd wysyłania wiadomości",
            500
        );
    }
}
