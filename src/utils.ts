export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const httpStatus = async (url: string): Promise<number | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.status;
  } catch {
    return null;
  }
};
