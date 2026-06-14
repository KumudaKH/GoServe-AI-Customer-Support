export function buildInviteLink(inviteCode) {
  return `${window.location.origin}/group/${inviteCode}`;
}

export function buildShareText(productName, price, inviteCode) {
  const link = buildInviteLink(inviteCode);
  return `Join my GoServe group for "${productName}" at ₹${price.toLocaleString("en-IN")}.\n\nTap to join: ${link}`;
}

export function shareViaWhatsApp(productName, price, inviteCode) {
  const text = buildShareText(productName, price, inviteCode);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export async function shareViaNative(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}

export async function copyInviteLink(inviteCode) {
  const link = buildInviteLink(inviteCode);
  await navigator.clipboard.writeText(link);
  return link;
}
