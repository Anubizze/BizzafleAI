export async function* simulateTokenStream(text: string, ms = 16) {
  const chunks = text.split(/(\s+)/);
  let acc = "";
  for (const chunk of chunks) {
    acc += chunk;
    await new Promise((resolve) => setTimeout(resolve, ms));
    yield acc;
  }
}
