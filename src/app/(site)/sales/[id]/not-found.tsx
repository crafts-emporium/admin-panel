import emptyCart from "@/../public/empty-cart.webp";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Image
        alt="empty cart"
        src={emptyCart}
        width={300}
        height={300}
        className="w-1/4 min-w-[250px] max-w-[400px]"
      />
      <div className="text-center space-y-2">
        <h1 className="text-xl">Sale not found</h1>
        <p className="text-muted-foreground">
          The sale you are looking for does not exist
        </p>
      </div>
    </div>
  );
}
