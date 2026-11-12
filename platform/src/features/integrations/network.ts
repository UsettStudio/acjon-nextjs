import { isIP } from "node:net";

/**
 * Vern mot SSRF: webhooks sendes bare til offentlige adresser. Adresser i
 * private nett, lokale adresser, metadata-tjenester i skyen og andre
 * spesialområder avvises, også når et vertsnavn peker dit via DNS.
 */

function ipv4ToNumber(address: string): number {
  return address.split(".").reduce((value, part) => value * 256 + Number(part), 0);
}

const IPV4_BLOCKED: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function isBlockedIpv4(address: string): boolean {
  const value = ipv4ToNumber(address);
  return IPV4_BLOCKED.some(([network, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return ((value & mask) >>> 0) === ((ipv4ToNumber(network) & mask) >>> 0);
  });
}

/** IPv6-adressen som 8 tall à 16 bit. */
function expandIpv6(address: string): number[] | null {
  let text = address.toLowerCase().split("%")[0] ?? "";
  // IPv4 til slutt (::ffff:10.0.0.1) gjøres om til to grupper.
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (v4?.[1]) {
    const value = ipv4ToNumber(v4[1]);
    text = `${text.slice(0, -v4[1].length)}${((value >>> 16) & 0xffff).toString(16)}:${(value & 0xffff).toString(16)}`;
  }
  const [head = "", tail] = text.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail !== undefined && tail !== "" ? tail.split(":") : [];
  const missing = 8 - headParts.length - tailParts.length;
  if (tail === undefined ? headParts.length !== 8 : missing < 0) {
    return null;
  }
  const groups = [...headParts, ...Array<string>(tail === undefined ? 0 : missing).fill("0"), ...tailParts].map((part) => parseInt(part, 16));
  return groups.length === 8 && groups.every((group) => Number.isInteger(group) && group >= 0 && group <= 0xffff) ? groups : null;
}

function isBlockedIpv6(address: string): boolean {
  const groups = expandIpv6(address);
  if (!groups) {
    return true;
  }
  const [a = 0, b = 0, , , , f = 0, g = 0, h = 0] = groups;
  const allZeroUntil = (index: number) => groups.slice(0, index).every((group) => group === 0);
  // :: og ::1
  if (allZeroUntil(7) && (h === 0 || h === 1)) {
    return true;
  }
  // IPv4 i IPv6 (::ffff:a.b.c.d og ::a.b.c.d) og NAT64 (64:ff9b::a.b.c.d): sjekk IPv4-delen.
  const embedded = `${g >>> 8}.${g & 0xff}.${h >>> 8}.${h & 0xff}`;
  if ((allZeroUntil(5) && (f === 0xffff || f === 0)) || (a === 0x64 && b === 0xff9b && groups.slice(2, 6).every((group) => group === 0))) {
    return isBlockedIpv4(embedded);
  }
  return (
    (a & 0xfe00) === 0xfc00 || // fc00::/7 unik lokal
    (a & 0xffc0) === 0xfe80 || // fe80::/10 lenkelokal
    (a & 0xff00) === 0xff00 || // ff00::/8 multicast
    (a === 0x2001 && b === 0x0db8) // 2001:db8::/32 dokumentasjon
  );
}

/** Om en IP-adresse er utenfor det offentlige internettet. Ukjent format regnes som blokkert. */
export function isPrivateAddress(address: string): boolean {
  switch (isIP(address)) {
    case 4:
      return isBlockedIpv4(address);
    case 6:
      return isBlockedIpv6(address);
    default:
      return true;
  }
}

export class BlockedAddressError extends Error {
  constructor(readonly address: string) {
    super(`Adressen ${address} er ikke offentlig`);
    this.name = "BlockedAddressError";
  }
}
