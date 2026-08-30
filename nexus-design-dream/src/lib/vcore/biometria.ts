import { supabase } from "@/hooks/use-auth";

const b64url = {
  encode: (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  decode: (str: string) => {
    const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out.buffer;
  },
};

export function passkeySupported() {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function registrarPasskey(userId: string, etiqueta: string) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "VCORE NEXUS" },
      user: { id: new TextEncoder().encode(userId), name: etiqueta, displayName: etiqueta },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { userVerification: "required", authenticatorAttachment: "platform" },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("No se pudo registrar la passkey");
  const credentialId = b64url.encode(cred.rawId);

  const { error } = await supabase.from("admin_biometria").insert({
    owner_id: userId,
    tipo: "passkey",
    etiqueta,
    credential_id: credentialId,
  });
  if (error) throw error;
  return credentialId;
}

export async function verificarPasskey(credentialIds: string[]) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      timeout: 60000,
      userVerification: "required",
      allowCredentials: credentialIds.map((id) => ({ type: "public-key", id: b64url.decode(id) })),
    },
  });
  return !!assertion;
}

export async function capturarVcoreBio(): Promise<{ audioMs: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => setTimeout(r, 600));
    await new Promise((r) => setTimeout(r, 1500));
    return { audioMs: 1500 };
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}
