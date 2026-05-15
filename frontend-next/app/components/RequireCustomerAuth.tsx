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

  // Read auth once on mount
  useEffect(() => {
    const current = readCustomerSession();
    setAuth(current);
    setChecked(true);
    if (!current.token || !current.user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount — not on pathname change

  // Keep auth in sync across tabs
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

  if (!checked) return <div className="bg-[#1A2930] min-h-screen" />;
  if (!isAllowed) return null;
  return <>{children}</>;
}
