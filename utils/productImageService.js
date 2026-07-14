import { supabase } from "./supabase.js";

export const deleteProductImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    return;
  }

  const fileNames = imageUrls.map((url) => url.split("/").pop());

  const { error } = await supabase.storage
    .from("images")
    .remove(fileNames);

  if (error) {
    throw error;
  }
};