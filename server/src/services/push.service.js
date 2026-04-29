import DeviceToken from "../models/DeviceToken.model.js";
import { getFirebaseMessaging } from "../config/firebase.js";

export const sendPushToTokenService = async ({ token, title, body, data = {} }) => {
  const messaging = getFirebaseMessaging();

  if (!messaging) {
    return {
      success: false,
      reason: "Firebase messaging is not configured",
    };
  }

  try {
    await messaging.send({
      token,
      notification: {
        title,
        body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value ?? "")])
      ),
      webpush: {
        notification: {
          title,
          body,
          icon: "/vite.svg",
        },
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    const shouldDeactivate =
      error.code === "messaging/registration-token-not-registered" ||
      error.code === "messaging/invalid-registration-token";

    if (shouldDeactivate) {
      await DeviceToken.updateOne(
        { token },
        {
          $set: {
            isActive: false,
          },
        }
      );
    }

    return {
      success: false,
      reason: error.message,
    };
  }
};

export const sendPushToUserService = async ({
  userId,
  title,
  body,
  data = {},
}) => {
  const tokens = await DeviceToken.find({
    user: userId,
    isActive: true,
  });

  if (tokens.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    tokens.map((device) =>
      sendPushToTokenService({
        token: device.token,
        title,
        body,
        data,
      })
    )
  );

  return results;
};