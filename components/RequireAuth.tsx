"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !session) {
      router.replace("/account");
    }
  }, [mounted, session, router]);

  if (!mounted) {
    return <p className="mt-10 text-sm text-espresso/50">Loading...</p>;
  }

  if (!session) {
    return (
      <p className="mt-10 text-sm text-espresso/50">
        Please sign up or log in to continue.
      </p>
    );
  }

  return <>{children}</>;
}
