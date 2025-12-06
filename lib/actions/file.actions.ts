"use server";

import { createAdminClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  throw new Error(message);
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesTableId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: any) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to Upload File");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("owner", currentUser.$id),
      Query.contains("users", currentUser.email),
    ]),
  ];

  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }
  if (searchText.length > 0) {
    queries.push(Query.contains("name", searchText));
  }
  if (limit) {
    queries.push(Query.limit(limit));
  }

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }
  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const queries = [
      ...createQueries(currentUser, types, searchText, sort, limit),

      Query.select([
        "$id",
        "$createdAt",
        "name",
        "size",
        "owner.fullName",
        "url",
        "bucketFileId",
        "type",
        "extension",
        "users",
      ]),
    ];

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesTableId,
      queries
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  // 1. FIX: Call createAdminClient() as an async function and await it
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;

    // 2. FIX: Correctly pass the fileId as the third argument
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId, // Argument 1: Database ID
      appwriteConfig.filesTableId, // Argument 2: Collection ID
      fileId, // Argument 3: Document ID (was missing a comma or positionally wrong)
      {
        // Argument 4: Data object
        name: newName,
      }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  // 1. FIX: Call createAdminClient() as an async function and await it
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId, // Argument 1: Database ID
      appwriteConfig.filesTableId, // Argument 2: Collection ID
      fileId, // Argument 3: Document ID (was missing a comma or positionally wrong)
      {
        // Argument 4: Data object
        users: emails,
      }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to share");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    // 1. Hapus dokumen file dari database
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesTableId,
      fileId
    );

    // 2. Hapus file dari storage
    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

    // 3. Refresh halaman
    revalidatePath(path);

    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete");
  }
};
