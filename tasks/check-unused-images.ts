import { $ } from "bun";

function toChunks<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, (i + 1) * size)
  );
}

const allImages: string[] = (await $`ls images/**/*.*`.text())
  .split("\n")
  .filter((image) => image.trim() !== "");
const unusedImages: string[] = [];

for (const chunk of toChunks(allImages, 10)) {
  await Promise.all(
    chunk.map(async (image) => {
      const files = (
        await $`grep -l ${image} articles/**/*.md`.nothrow().text()
      )
        .split("\n")
        .filter((file) => file.trim() !== "");

      if (files.length === 0) {
        console.log(image);
        unusedImages.push(image);
      }
    })
  );
}

if (unusedImages.length > 0) {
  console.error(`Found ${unusedImages.length} unused images`);
  process.exit(1);
}
