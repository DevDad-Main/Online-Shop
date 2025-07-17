import fs from "fs";

export default function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
}
