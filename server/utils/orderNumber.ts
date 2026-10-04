// New order number for POST /api/orders: LH-<year>-<8 random digits>.
// Random (not the row id) so nobody can walk through other people's orders on /prati-porudzbinu.
// On the rare UNIQUE collision, generate another one and retry the insert.
export function newOrderNumber() {
  const [random] = crypto.getRandomValues(new Uint32Array(1))
  const digits = String(random! % 100_000_000).padStart(8, '0')
  return `LH-${new Date().getUTCFullYear()}-${digits}`
}
