/**
 * Cloudflare Worker: معراب Discord OAuth2 Cloud Authentication Gateway
 * يتم نشره مجاناً على Cloudflare Workers دون الحاجة لتشغيل أي سيرفر محلي على جهازك.
 */

const CLIENT_ID = "YOUR_DISCORD_CLIENT_ID";
const CLIENT_SECRET = "YOUR_DISCORD_CLIENT_SECRET";
const REDIRECT_URI = "https://your-worker-subdomain.workers.dev/callback";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. إعادة التوجيه لصفحة تسجيل دخول ديسكورد الرسمية
    if (url.pathname === "/login") {
      const discordAuthUrl = https://discord.com/api/oauth2/authorize?client_id=&redirect_uri=&response_type=code&scope=identify%20guilds%20guilds.members.read;
      return Response.redirect(discordAuthUrl, 302);
    }

    // 2. استقبال كود الدخول وتبديله بالتوكن والتحقق من العضوية
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return new Response("OAuth Failed: " + JSON.stringify(tokenData), { status: 400 });
      }

      // جلب بيانات المستخدم
      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: Bearer  },
      });
      const userData = await userRes.json();

      // إعادة التوجيه للتطبيق عبر Deep Link (maarab://auth)
      const appRedirect = maarab://auth?token=&user_id=&username=;
      return Response.redirect(appRedirect, 302);
    }

    return new Response("معراب Discord Auth Worker جاهز للعمل.", { status: 200 });
  }
};
