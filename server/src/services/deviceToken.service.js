import DeviceToken from "../models/DeviceToken.model.js";

export const saveDeviceTokenService = async ({
  currentUser,
  token,
  platform = "web",
  browser = "",
}) => {
  const deviceToken = await DeviceToken.findOneAndUpdate(
    { token },
    {
      $set: {
        user: currentUser._id,
        platform,
        browser,
        isActive: true,
        lastUsedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return deviceToken;
};

export const deleteDeviceTokenService = async ({ currentUser, token }) => {
  await DeviceToken.updateOne(
    {
      user: currentUser._id,
      token,
    },
    {
      $set: {
        isActive: false,
      },
    }
  );

  return true;
};