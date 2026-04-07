/**
 * Client-side utility to generate a branded social preview card (OG Image)
 * using the HTML5 Canvas API. This avoids the need for server-side
 * rendering and overcomes WebP compatibility issues in headless environments.
 */
export async function generateOgImageBlob(
  username: string,
  displayName: string,
  avatarUrl?: string
): Promise<Blob> {
  const width = 1200;
  const height = 630;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize 2D context for OG image generation.");
  }

  // 1. Fill Background (Crisp White)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Design Accents (Gradients)
  const gradientTop = ctx.createRadialGradient(
    width * 0.1,
    height * 0.2,
    0,
    width * 0.1,
    height * 0.2,
    width * 0.4
  );
  gradientTop.addColorStop(0, "rgba(0,0,0,0.03)");
  gradientTop.addColorStop(1, "transparent");
  ctx.fillStyle = gradientTop;
  ctx.fillRect(0, 0, width, height);

  const gradientBottom = ctx.createRadialGradient(
    width * 0.9,
    height * 0.8,
    0,
    width * 0.9,
    height * 0.8,
    width * 0.4
  );
  gradientBottom.addColorStop(0, "rgba(0,0,0,0.03)");
  gradientBottom.addColorStop(1, "transparent");
  ctx.fillStyle = gradientBottom;
  ctx.fillRect(0, 0, width, height);

  // 3. Branded Watermark (Top Right)
  ctx.fillStyle = "#111111";
  ctx.font = "900 28px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("PageCraft", width - 60, 60);

  // 4. Centered Content: Avatar
  const centerY = height * 0.45;
  if (avatarUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      // We wrap the image loading in a promise
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load avatar for OG card."));
        img.src = avatarUrl;
      });

      const avatarSize = 260;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, centerY, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw background inside circle first (to avoid transparency issues)
      ctx.fillStyle = "#f3f4f6";
      ctx.fill();

      ctx.drawImage(
        img,
        width / 2 - avatarSize / 2,
        centerY - avatarSize / 2,
        avatarSize,
        avatarSize
      );
      ctx.restore();

      // Circle Border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.stroke();
    } catch (e) {
      console.warn("Avatar load failed for OG image, falling back to initial.", e);
      drawFallbackAvatar(ctx, width / 2, centerY, displayName);
    }
  } else {
    drawFallbackAvatar(ctx, width / 2, centerY, displayName);
  }

  // 5. Centered Content: Display Name
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.font = "800 64px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(displayName || username, width / 2, centerY + 240);

  // 6. Centered Content: Handle URL
  ctx.fillStyle = "#6b7280";
  ctx.font = "500 32px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`pagecraft.me/${username}`, width / 2, centerY + 300);

  // 7. Decorative Bottom Bar
  const barHeight = 12;
  const barGradient = ctx.createLinearGradient(0, height - barHeight, width, height - barHeight);
  barGradient.addColorStop(0, "#000000");
  barGradient.addColorStop(1, "#333333");
  ctx.fillStyle = barGradient;
  ctx.fillRect(0, height - barHeight, width, barHeight);

  // 8. Export as Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed."));
      },
      "image/jpeg",
      0.85
    );
  });
}

/**
 * Fallback to an "Initial" avatar if the actual image fails to load.
 */
function drawFallbackAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, name: string) {
  const size = 260;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#f3f4f6";
  ctx.fill();
  
  ctx.fillStyle = "#9ca3af";
  ctx.font = "bold 120px Inter, -apple-system, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((name[0] || "?").toUpperCase(), x, y);
}
