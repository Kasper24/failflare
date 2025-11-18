export const getZoneId = async (
  token: string,
  domain: string
): Promise<string | null> => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${domain}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  return data.result?.[0]?.id ?? null;
};

export const getRecord = async (
  token: string,
  zoneId: string,
  name: string,
  type: string
): Promise<any> => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${name}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.result?.[0] ?? null;
};

export const patchZoneSettings = async (
  token: string,
  zoneId: string,
  settings: Record<string, any>
) => {
  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/${key}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        }
      )
    )
  );
};

export const patchRecord = async (
  token: string,
  zoneId: string,
  recordId: string,
  updates: Record<string, any>
) =>
  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );
