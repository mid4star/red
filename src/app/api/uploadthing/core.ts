import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define the file router
export const ourFileRouter = {
  // 1. Image Uploader
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 4 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete:", file.url);
      return { url: file.url };
    }),

  // 2. Document Uploader
  documentUploader: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 4 },
    text: { maxFileSize: "16MB", maxFileCount: 4 },
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete:", file.url);
      return { url: file.url };
    }),

  // 3. General Media Uploader
  mediaUploader: f({ 
    image: { maxFileSize: "8MB", maxFileCount: 4 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 2 }
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Media upload complete:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
