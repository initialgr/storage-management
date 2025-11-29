"use server";

import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../appwrite/config";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

// ======================
// GET USER BY EMAIL
// ======================
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersTableId,
    [Query.equal("email", email)]
  );

  return result.total > 0 ? result.documents[0] : null;
};

// ======================
// ERROR HANDLER
// ======================
const handleError = (error: any, message: string) => {
  console.error(message, error);
  throw new Error(message);
};

// ======================
// SEND EMAIL OTP TOKEN
// ======================
const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

// ======================
// CREATE ACCOUNT
// ======================
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send OTP");

  // jika user belum ada → buat document user baru
  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersTableId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};
