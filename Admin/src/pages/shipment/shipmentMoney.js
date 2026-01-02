// Admin/src/pages/shipment/shipmentMoney.js

export const toMoney = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};

export const formatMoney = (amount, currency = "GBP") => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${toMoney(n).toFixed(2)}`;
  }
};

export const computeUiTotals = (lineItems = []) => {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const clean = items.map((li) => {
    const qty = Number(li.qty ?? 1);
    const unitPrice = Number(li.unitPrice ?? 0);
    const amount =
      li.amount !== undefined && li.amount !== null && li.amount !== ""
        ? Number(li.amount)
        : qty * unitPrice;
    const taxRate = Number(li.taxRate ?? 0);

    const safeQty = Number.isFinite(qty) ? qty : 1;
    const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0;
    const safeAmount = Number.isFinite(amount) ? amount : safeQty * safeUnit;
    const safeTaxRate = Number.isFinite(taxRate) ? taxRate : 0;

    const tax = (safeAmount * safeTaxRate) / 100;

    return {
      ...li,
      qty: safeQty,
      unitPrice: toMoney(safeUnit),
      amount: toMoney(safeAmount),
      taxRate: safeTaxRate,
      _tax: toMoney(tax),
    };
  });

  const subtotal = toMoney(clean.reduce((s, x) => s + (x.amount || 0), 0));
  const taxTotal = toMoney(clean.reduce((s, x) => s + (x._tax || 0), 0));
  const total = toMoney(subtotal + taxTotal);

  return { subtotal, taxTotal, total };
};
