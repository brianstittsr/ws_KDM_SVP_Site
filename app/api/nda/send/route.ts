import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, recipientEmail, recipientName, signingUrl } = body;

    if (!documentId || !recipientEmail || !signingUrl) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, recipientEmail, signingUrl" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // In production:
    // 1. Update the NDA document status to pending_signature
    // 2. Send email with signing link using email service (SendGrid, etc.)
    
    // const docRef = doc(db, COLLECTIONS.NDA_DOCUMENTS, documentId);
    // await updateDoc(docRef, {
    //   status: "pending_signature",
    //   sentAt: Timestamp.now(),
    //   updatedAt: Timestamp.now(),
    // });
    
    // Email template
    const emailContent = {
      to: recipientEmail,
      subject: "Non-Disclosure Agreement - Signature Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Non-Disclosure Agreement</h2>
          <p>Dear ${recipientName || "Recipient"},</p>
          <p>You have been sent a Non-Disclosure Agreement from <strong>Strategic Value Plus</strong> that requires your signature.</p>
          <p>Please click the button below to review and sign the document:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signingUrl}" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Review & Sign Document
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 30 days. If you have any questions, please contact us.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            Strategic Value Plus<br/>
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      `,
    };

    // In production, send via email service:
    // await sendEmail(emailContent);

    console.log("NDA email would be sent:", emailContent);

    return NextResponse.json({
      success: true,
      message: "NDA sent successfully",
      data: {
        sentTo: recipientEmail,
        sentAt: new Date().toISOString(),
        signingUrl: signingUrl,
      },
    });
  } catch (error) {
    console.error("Error sending NDA:", error);
    return NextResponse.json(
      { error: "Failed to send NDA" },
      { status: 500 }
    );
  }
}
