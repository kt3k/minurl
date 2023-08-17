const kv = await Deno.openKv();
const msg = "Welcome! Shorten the url with the command:\n\n  ";
Deno.serve(async (req) => {
  const { origin, pathname } = new URL(req.url);
  if (req.method === "POST") {
    const url = new URL(await req.text()).href;
    const key = [crypto.getRandomValues(new BigUint64Array(1))[0].toString(36)];
    await kv.atomic().check({ key, versionstamp: null }).set(key, url).commit();
    return new Response(`Created ${origin}/${key[0]}\n`);
  } else if (pathname === "/") {
    return new Response(msg + `curl -d https://example.com ${origin}`);
  }
  const v = (await kv.get<string>([pathname.slice(1)])).value;
  return v ? Response.redirect(v) : new Response("Not Found", { status: 404 });
});
