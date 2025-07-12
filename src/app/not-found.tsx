"use client";
import Column from "@/components/not-found/Column";
import Heading from "@/components/not-found/Heading";
import Text from "@/components/not-found/Text";

import Button from "@/components/Button";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Column as="section" fill center paddingBottom="24">
      <Image
        src="/images/404_error.svg"
        alt="Illustration 404"
        width={400}
        height={400}
        className="mb-6"
      />
      <Text variant="label" className="text-[#45d8ac] mb-2">
        404
      </Text>
      <Heading size="xl" className="mb-4">
        Page Not Found
      </Heading>
      <Text variant="body" className="text-gray-500 max-w-md">
        The page you are looking for does not exist or has been moved.
      </Text>
      <Button
        className="mt-7"
        variant="secondary"
        onClick={() => router.push("/")}
      >
        Home
      </Button>
    </Column>
  );
}
