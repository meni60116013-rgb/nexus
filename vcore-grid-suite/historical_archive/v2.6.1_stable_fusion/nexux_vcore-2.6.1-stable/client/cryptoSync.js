export async function calculateSHA256(data) {
  const encoder = new TextEncoder();
  const msgBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function syncPayload(endpoint, payload, lastHash) {
  const currentHash = await calculateSHA256(payload);
  if (currentHash === lastHash) {
    return { status: 'UNCHANGED', hash: currentHash };
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-VCore-Hash': currentHash },
    body: JSON.stringify({ hash: currentHash, data: payload })
  });
  
  return { status: 'SYNCED', result: await response.json(), hash: currentHash };
}
