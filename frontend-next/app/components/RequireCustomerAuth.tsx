"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  readCustomerSession,
  clearCustomerAuth,
  ALLOWED_CUSTOMER_ROLES,
} from "../lib/customerAuth";

export default function RequireCustomerAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [auth, setAuth] = useState(() => readCustomerSession());

  // Keep auth in sync across tabs
  useEffect(() => {
    const onStorage = () => setAuth(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Guard redirect on mount and route changes
  useEffect(() => {
    const current = readCustomerSession();
    setAuth(current);

    if (!current.token || !current.user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  const isAllowed = useMemo(
    () =>
      Boolean(auth?.token && auth?.user) &&
      ALLOWED_CUSTOMER_ROLES.has(String(auth?.user?.role || "").toLowerCase()),
    [auth]
  );

  if (!isAllowed) return null;
  return <>{children}</>;
}
