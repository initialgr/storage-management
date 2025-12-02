import { cn, getFileIcon } from "@/lib/utils";
import Image from "next/image";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

const Thumbnail = ({
  type,
  extension,
  url,
  imageClassName,
  className,
}: Props) => {
  const isImage =
    type?.startsWith("image") && extension !== "" && extension !== "svg";

  const src = isImage && url ? url : getFileIcon(extension, type);

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={src}
        alt="thumbnail"
        width={100}
        height={100}
        unoptimized
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};

export default Thumbnail;
