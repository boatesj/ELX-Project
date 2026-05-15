"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  readCustomerSession,
  ALLOWED_CUSTOMER_ROLES,
} from "../lib/customerAuth";

export default function RequireCustomerAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState<ReturnType<typeof readCustomerSession> | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const current = readCustomerSession();
    setAuth(current);
    setChecked(true);
    if (!current.token || !current.user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  useEffect(() => {
    const onStorage = () => setAuth(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAllowed = useMemo(
    () =>
      Boolean(auth?.token && auth?.user) &&
      ALLOWED_CUSTOMER_ROLES.has(String(auth?.user?.role || "").toLowerCase()),
    [auth]
  );

  if (!checked) return null;
  if (!isAllowed) return null;
  return <>{children}</>;
}
