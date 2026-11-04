import { onRequest } from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Shared Badges Milestones Configuration
export const BADGE_MILESTONES = {
  TOP_GIFTER: {
    id: "top_gifter",
    name: "أكثر الهدايا",
    minGiftsSent: 5,
    minCoinsSpent: 1000,
  },
  ACTIVE_MEMBER: {
    id: "active_member",
    name: "عضو نشط",
    minTimeMinutes: 30,
    minMessagesSent: 10,
  },
  DIAMOND_VOICE: {
    id: "diamond_voice",
    name: "صوت ماسي",
    minVoiceMinutes: 20,
  },
  SUPER_VIP: {
    id: "super_vip",
    name: "مضيف متميز",
    minRoomsCreated: 1,
  },
};

/**
 * Cloud Function: Automatically evaluates user activity and updates the 'badges'
 * array in the 'users/{userId}' document in Firestore.
 */
export const evaluateUserBadges = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const afterData = event.data?.after.data();
    if (!afterData) return;

    const userId = event.params.userId;
    const currentBadges: string[] = afterData.badges || [];
    const earnedBadges = new Set<string>(currentBadges);

    const giftsSent = afterData.totalGiftsSent || 0;
    const coinsSpent = afterData.totalCoinsSpent || 0;
    const timeSpent = afterData.totalTimeMinutes || 0;
    const messagesCount = afterData.totalMessagesSent || 0;
    const voiceMinutes = afterData.totalVoiceMinutes || 0;

    // Evaluate 'أكثر الهدايا' (Top Gifter)
    if (
      giftsSent >= BADGE_MILESTONES.TOP_GIFTER.minGiftsSent ||
      coinsSpent >= BADGE_MILESTONES.TOP_GIFTER.minCoinsSpent
    ) {
      earnedBadges.add(BADGE_MILESTONES.TOP_GIFTER.name);
    }

    // Evaluate 'عضو نشط' (Active Member)
    if (
      timeSpent >= BADGE_MILESTONES.ACTIVE_MEMBER.minTimeMinutes ||
      messagesCount >= BADGE_MILESTONES.ACTIVE_MEMBER.minMessagesSent
    ) {
      earnedBadges.add(BADGE_MILESTONES.ACTIVE_MEMBER.name);
    }

    // Evaluate 'صوت ماسي' (Diamond Voice)
    if (voiceMinutes >= BADGE_MILESTONES.DIAMOND_VOICE.minVoiceMinutes) {
      earnedBadges.add(BADGE_MILESTONES.DIAMOND_VOICE.name);
    }

    const updatedBadgesList = Array.from(earnedBadges);

    // Only update if badges changed to avoid recursive triggers
    if (
      updatedBadgesList.length !== currentBadges.length ||
      !updatedBadgesList.every((b) => currentBadges.includes(b))
    ) {
      await db.collection("users").doc(userId).update({
        badges: updatedBadgesList,
        lastBadgeEvaluation: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/**
 * Cloud Function: Paymob Egypt Webhook
 * Validates HMAC SHA512 signature from Paymob and credits coins or VIP tier.
 */
export const paymobWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET || "PAYMOB_HMAC_SECRET_SAMPLE";
  const body = req.body;
  const obj = body.obj || body;

  try {
    // Paymob HMAC verification parameters concatenation order
    const hmacKeys = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order.id",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    let concatenatedString = "";
    for (const key of hmacKeys) {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        concatenatedString += obj[parent]?.[child] ?? "";
      } else {
        concatenatedString += obj[key] ?? "";
      }
    }

    const calculatedHmac = crypto
      .createHmac("sha512", hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    const providedHmac = req.query.hmac as string;

    // Verify HMAC if provided in query params
    if (providedHmac && calculatedHmac !== providedHmac) {
      console.warn("HMAC verification failed for Paymob transaction");
      res.status(400).send("Invalid HMAC Signature");
      return;
    }

    const isSuccess = obj.success === true || obj.success === "true";
    const orderData = obj.order || {};
    const userId = orderData.shipping_data?.extra_description || obj.merchant_order_id;
    const amountEgp = (obj.amount_cents || 0) / 100;

    if (isSuccess && userId) {
      const userRef = db.collection("users").doc(userId);

      // Determine package based on amount paid
      // 1,000 coins for 50 EGP; 5,000 coins for 200 EGP; 10,000 coins for 350 EGP
      if (amountEgp >= 350) {
        await userRef.update({
          coins: admin.firestore.FieldValue.increment(10000),
          earningsEgp: admin.firestore.FieldValue.increment(0),
        });
      } else if (amountEgp >= 200) {
        await userRef.update({
          coins: admin.firestore.FieldValue.increment(5000),
        });
      } else if (amountEgp >= 50) {
        await userRef.update({
          coins: admin.firestore.FieldValue.increment(1000),
        });
      }

      // Check if VIP tier purchase
      if (amountEgp === 300) {
        await userRef.update({
          role: "vip_diamond",
          vipBadge: "Super VIP سوبر ملكي",
          vipActiveUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      } else if (amountEgp === 150) {
        await userRef.update({
          role: "vip_silver",
          vipBadge: "VIP فضي",
          vipActiveUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      }

      // Log transaction in Firestore
      await db.collection("transactions").add({
        userId,
        amountEgp,
        transactionId: obj.id,
        status: "success",
        paymentMethod: obj.source_data?.type || "paymob",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error("Error processing Paymob webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});
