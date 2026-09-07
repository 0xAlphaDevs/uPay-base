// Shared by client (signing) and server (verifying) — no server-only imports here.
export function walletLoginMessage(address: string) {
  return `Sign in to the UPay dashboard\n\nWallet: ${address.toLowerCase()}`;
}
